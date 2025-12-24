
const http = require('http');
const { URL } = require('url');
const Router = require('./Router');
const Request = require('./Request');
const Response = require('./Response');

/**
 * App — основной класс приложения.
 * Управляет HTTP-сервером, middleware и маршрутизацией.
 */
class App {
  constructor() {
    this.routes = [];
    this.middlewares = [];
    this.router = new Router();
    this.server = null;
    this.defaultTimeout = 2 * 60 * 1000; // 2 минуты
    this.customErrorHandler = null;
  }

  /**
   * Регистрирует глобальное middleware.
   * @param {Function} middleware
   * @returns {App}
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError('middleware должен быть функцией');
    }
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Устанавливает кастомный обработчик ошибок.
   * @param {Function} handler - Функция сигнатуры (err, req, res, next)
   */
  setErrorHandler(handler) {
    this.customErrorHandler = handler;
  }

  // HTTP Methods
  get(path, handler) { return this._registerRoute('GET', path, handler); }
  post(path, handler) { return this._registerRoute('POST', path, handler); }
  put(path, handler) { return this._registerRoute('PUT', path, handler); }
  patch(path, handler) { return this._registerRoute('PATCH', path, handler); }
  delete(path, handler) { return this._registerRoute('DELETE', path, handler); }
  del(path, handler) { return this.delete(path, handler); }

  /**
   * Внутренний метод регистрации маршрута.
   * @private
   */
  _registerRoute(method, path, handler) {
    if (typeof method !== 'string' || typeof path !== 'string' || typeof handler !== 'function') {
      throw new TypeError('Неверно заданы параметры маршрута');
    }
    this.router.register(method, path, handler);
    this.routes.push({ method: method.toUpperCase(), path, handler });
    return this;
  }

  /**
   * Запускает HTTP-сервер.
   * @param {number} port
   * @param {Function} callback
   * @returns {http.Server}
   */
  listen(port, callback) {
    this.server = http.createServer(this._handleRequest.bind(this));
    this.server.setTimeout(this.defaultTimeout);
    return this.server.listen(port, callback);
  }

  /**
   * Устанавливает таймаут простоя соединения.
   * @param {number} ms
   * @returns {App}
   */
  setTimeout(ms) {
    this.defaultTimeout = ms;
    if (this.server) this.server.setTimeout(ms);
    return this;
  }

  /**
   * Корректно останавливает сервер.
   * @param {Function} callback
   * @returns {App}
   */
  close(callback) {
    if (!this.server) {
      if (callback) callback(new Error('Сервер не запущен'));
      return this;
    }
    this.server.close(callback);
    return this;
  }

  /**
   * Возвращает адрес сервера (для совместимости с supertest).
   * @returns {Address|null}
   */
  address() {
    return this.server ? this.server.address() : null;
  }

  /**
   * Обрабатывает ошибки, возникающие в процессе запроса.
   * @private
   */
  _handleError(err, request, response) {
    // Приоритет у кастомного обработчика
    if (this.customErrorHandler) {
      try {
        return this.customErrorHandler(err, request, response, () => {});
      } catch (e) {
        console.error('\x1b[31m[ERROR]\x1b[0m Ошибка внутри кастомного error handler:', e);
      }
    }

    // Fallback
    const method = request?.method || 'unknown';
    const url = request?.path || request?.url || 'unknown';
    console.error(`\x1b[31m[ERROR]\x1b[0m Ошибка запроса: ${method} ${url}`, err);

    if (!response?.writableEnded && !response?.finished) {
      response.status(500).send('Внутренняя ошибка сервера');
    }
  }

  /**
   * Основной обработчик входящих запросов.
   * @private
   */
  async _handleRequest(req, res) {
    const request = new Request(req);
    const response = new Response(res);

    try {
      // Парсинг URL
      try {
        const host = req.headers.host || 'localhost';
        const parsed = new URL(req.url, `http://${host}`);
        request.path = parsed.pathname;
        
        const q = {};
        for (const key of parsed.searchParams.keys()) {
          const vals = parsed.searchParams.getAll(key);
          q[key] = vals.length > 1 ? vals : vals[0];
        }
        request.query = q;
        request.url = parsed.pathname + (parsed.search || '');
      } catch (e) {
        request.path = req.url || '/';
        request.query = request.query || {};
      }

      // Запуск middleware
      await this._runMiddlewares(request, response);
      if (res.writableEnded || response.finished) return;

      // Поиск маршрута
      const routeMatch = this.router.find(request.method, request.path || request.url);

      if (!routeMatch) {
        if (!res.writableEnded && !response.finished) {
          response.status(404).send('Маршрут не найден');
        }
        return;
      }

      // Наполнение параметров
      request.params = routeMatch.params || {};
      request.query = { ...request.query, ...routeMatch.query };

      // Выполнение хендлера (поддержка next-style и async)
      if (routeMatch.handler.length >= 3) {
        await new Promise((resolve, reject) => {
          const next = (err) => err ? reject(err) : resolve();
          try {
            routeMatch.handler(request, response, next);
          } catch (err) {
            reject(err);
          }
        });
      } else {
        await Promise.resolve(routeMatch.handler(request, response));
      }

    } catch (error) {
      this._handleError(error, request, response);
    }
  }

  /**
   * Последовательный запуск цепочки middleware.
   * @private
   */
  async _runMiddlewares(req, res) {
    for (const middleware of this.middlewares) {
      if (res.writableEnded || res.finished) break;

      await new Promise((resolve, reject) => {
        let nextCalled = false;
        const next = (err) => {
          nextCalled = true;
          if (err) reject(err);
          else resolve();
        };

        try {
          const maybePromise = middleware(req, res, next);
          if (maybePromise?.then) {
            maybePromise.then(() => { if (!nextCalled) resolve(); }).catch(reject);
          } else {
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      });
    }
  }
}

module.exports = App;
