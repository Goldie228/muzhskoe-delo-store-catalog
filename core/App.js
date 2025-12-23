
const http = require('http');
const { URL } = require('url');
const Router = require('./Router');
const Request = require('./Request');
const Response = require('./Response');

/*
 * Класс App - основной класс приложения
 * Предоставляет интерфейс для регистрации middleware и маршрутов,
 * а также для запуска HTTP-сервера
 */
class App {
  constructor() {
    this.routes = [];           // Все зарегистрированные маршруты (метаданные)
    this.middlewares = [];      // Глобальные middleware
    this.router = new Router(); // Экземпляр роутера
    this.server = null;         // Экземпляр HTTP сервера
    this.defaultTimeout = 2 * 60 * 1000; // 2 минуты по умолчанию
  }

  /*
   * Регистрация middleware
   * @param {Function} middleware - функция middleware
   * @returns {App} - возвращает экземпляр приложения для цепочки вызовов
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError('middleware должен быть функцией');
    }
    this.middlewares.push(middleware);
    return this; // Для чейнинга
  }

  // Методы HTTP
  get(path, handler) { return this._registerRoute('GET', path, handler); }
  post(path, handler) { return this._registerRoute('POST', path, handler); }
  put(path, handler) { return this._registerRoute('PUT', path, handler); }
  patch(path, handler) { return this._registerRoute('PATCH', path, handler); }
  delete(path, handler) { return this._registerRoute('DELETE', path, handler); }
  del(path, handler) { return this.delete(path, handler); } // alias

  /*
   * Приватный метод регистрации маршрута
   * @param {string} method - HTTP метод
   * @param {string} path - путь маршрута
   * @param {Function} handler - обработчик маршрута
   * @returns {App} - возвращает экземпляр приложения для цепочки вызовов
   */
  _registerRoute(method, path, handler) {
    if (typeof method !== 'string' || typeof path !== 'string' || typeof handler !== 'function') {
      throw new TypeError('Ожидается register(method: string, path: string, handler: function)');
    }
    this.router.register(method, path, handler);
    this.routes.push({ method: method.toUpperCase(), path, handler });
    return this;
  }

  /*
   * Запуск HTTP-сервера
   * @param {number} port - порт для прослушивания
   * @param {Function} callback - функция обратного вызова
   * @returns {http.Server} - возвращает инстанс сервера
   */
  listen(port, callback) {
    this.server = http.createServer(this._handleRequest.bind(this));
    this.server.setTimeout(this.defaultTimeout);

    return this.server.listen(port, callback);
  }

  /*
   * Установить таймаут сервера
   * @param {number} ms - таймаут в миллисекундах
   * @returns {App} - возвращает экземпляр приложения для цепочки вызовов
   */
  setTimeout(ms) {
    this.defaultTimeout = ms;
    if (this.server) this.server.setTimeout(ms);
    return this;
  }

  /*
   * Корректное завершение работы сервера
   * @param {Function} callback - функция обратного вызова
   * @returns {App} - возвращает экземпляр приложения для цепочки вызовов
   */
  close(callback) {
    if (!this.server) {
      if (callback) callback(new Error('Сервер не запущен'));
      return this;
    }
    this.server.close(callback);
    return this;
  }

  /*
   * Централизованная обработка ошибок
   * @param {Error} err - объект ошибки
   * @param {Request} request - объект запроса
   * @param {Response} response - объект ответа
   */
  _handleError(err, request, response) {
    try {
      const method = request && request.method ? request.method : 'unknown';
      const path = request && request.path ? request.path : (request && request.url) || 'unknown';
      console.error(`\x1b[31m[ERROR]\x1b[0m Ошибка запроса: ${method} ${path}`, err);
      if (!response || response.writableEnded || response.finished) return;
      response.status(500).send('Внутренняя ошибка сервера');
    } catch (e) {
      console.error('\x1b[31m[ERROR]\x1b[0m Ошибка при обработке ошибки:', e);
    }
  }

  /*
   * Основной обработчик входящих HTTP-запросов
   * @param {IncomingMessage} req - нативный объект запроса
   * @param {ServerResponse} res - нативный объект ответа
   */
  async _handleRequest(req, res) {
    const request = new Request(req);
    const response = new Response(res);

    // Надёжный парсинг URL: pathname и query
    try {
      const host = req.headers.host || 'localhost';
      const parsed = new URL(req.url, `http://${host}`);
      request.path = parsed.pathname;
      // Преобразуем searchParams в объект (плоский или массивы при повторениях)
      const q = {};
      for (const key of parsed.searchParams.keys()) {
        const vals = parsed.searchParams.getAll(key);
        q[key] = vals.length > 1 ? vals : vals[0];
      }
      request.query = q;
      request.url = parsed.pathname + (parsed.search ? parsed.search : '');
    } catch (e) {
      request.path = req.url || '/';
      request.query = request.query || {};
    }

    try {
      // 1. Выполняем глобальные middleware
      await this._runMiddlewares(request, response);

      // Если ответ уже отправлен в middleware — прекращаем обработку
      if (res.writableEnded || response.finished) return;

      // 2. Ищем маршрут по path (без query)
      const routeMatch = this.router.find(request.method, request.path || request.url);

      if (!routeMatch) {
        if (!res.writableEnded && !response.finished) {
          response.status(404).send('Маршрут не найден');
        }
        return;
      }

      // 3. Заполняем параметры из маршрута
      request.params = routeMatch.params || {};
      request.query = { ...request.query, ...routeMatch.query };

      // 4. Выполняем обработчик маршрута
      // Поддерживаем next-style handlers и async handlers
      if (routeMatch.handler.length >= 3) {
        await new Promise((resolve, reject) => {
          const next = (err) => {
            if (err) reject(err);
            else resolve();
          };
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

  /*
   * Последовательное выполнение цепочки middleware
   * @param {Request} req - объект запроса
   * @param {Response} res - объект ответа
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

          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise
              .then(() => {
                if (!nextCalled) resolve();
              })
              .catch(reject);
          } else {
            // Ожидаем вызова next; если middleware синхронно завершил ответ без next,
            // следующий шаг прервёт цикл по проверке res.writableEnded.
          }
        } catch (err) {
          reject(err);
        }
      });

      if (res.writableEnded || res.finished) break;
    }
  }
}

module.exports = App;
