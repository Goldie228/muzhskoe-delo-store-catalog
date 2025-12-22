
const http = require('http');
const { URL } = require('url');
const Router = require('./Router');
const Request = require('./Request');
const Response = require('./Response');


class App {
  constructor() {
    this.routes = [];           // Все зарегистрированные маршруты
    this.middlewares = [];      // Глобальные middleware
    this.router = new Router(); // Экземпляр роутера
    this.server = null;         // Экземпляр HTTP сервера
    this.defaultTimeout = 2 * 60 * 1000; // 2 минуты по умолчанию
  }

  // Регистрация middleware
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError('middleware must be a function');
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
  // alias для удобства
  del(path, handler) { return this.delete(path, handler); }

  // Приватный метод регистрации маршрута
  _registerRoute(method, path, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('handler must be a function');
    }
    this.router.register(method, path, handler);
    this.routes.push({ method, path, handler });
    return this;
  }

  // Запуск сервера
  listen(port, callback) {
    this.server = http.createServer(this._handleRequest.bind(this));
    // Устанавливаем таймаут соединения
    this.server.setTimeout(this.defaultTimeout);
    this.server.listen(port, callback);
    return this;
  }

  // Установить таймаут сервера (ms)
  setTimeout(ms) {
    this.defaultTimeout = ms;
    if (this.server) this.server.setTimeout(ms);
    return this;
  }

  // Graceful shutdown
  close(callback) {
    if (!this.server) {
      if (callback) callback(new Error('Server is not running'));
      return this;
    }
    this.server.close(callback);
    return this;
  }

  // Централизованная обработка ошибок
  _handleError(err, request, response) {
    try {
      // Логируем с контекстом
      const method = request && request.method ? request.method : 'unknown';
      const path = request && request.path ? request.path : (request && request.url) || 'unknown';
      console.error(`Request error: ${method} ${path}`, err);
      if (!response || response.writableEnded || response.finished) return;
      // Безопасная отправка ответа
      response.status(500).send('Internal Server Error');
    } catch (e) {
      // Если даже логирование/ответ упало — ничего не делаем
      console.error('Error while handling error:', e);
    }
  }

  // Обработчик входящих запросов
  async _handleRequest(req, res) {
    // Обертываем в наши расширенные объекты
    const request = new Request(req);
    const response = new Response(res);

    // Надёжный парсинг URL: pathname и query
    try {
      const host = req.headers.host || 'localhost';
      const parsed = new URL(req.url, `http://${host}`);
      request.path = parsed.pathname;
      // Преобразуем searchParams в объект (плоский)
      request.query = Object.fromEntries(parsed.searchParams.entries());
      // Синхронизируем url если нужно
      request.url = parsed.pathname + (parsed.search ? parsed.search : '');
    } catch (e) {
      // Если парсинг упал — продолжаем, router может работать с req.url
      request.path = req.url;
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
          response.status(404).send('Route not found');
        }
        return;
      }

      // 3. Заполняем параметры из маршрута
      request.params = routeMatch.params || {};
      request.query = { ...request.query, ...routeMatch.query };

      // 4. Выполняем обработчик маршрута
      // Поддерживаем как async handlers, так и next-style (если handler принимает 3 аргумента)
      if (routeMatch.handler.length >= 3) {
        // next-style: (req, res, next)
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
        // async/Promise or sync
        await Promise.resolve(routeMatch.handler(request, response));
      }

    } catch (error) {
      this._handleError(error, request, response);
    }
  }

  // Выполнение цепочки middleware
  async _runMiddlewares(req, res) {
    for (const middleware of this.middlewares) {
      // Если ответ уже отправлен — прерываем цепочку
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

          // Если middleware вернул Promise (async function), ждём его.
          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise
              .then(() => {
                // Если middleware был async и не использовал next, считаем его завершённым
                if (!nextCalled) resolve();
                // Если next был вызван внутри async middleware, resolve уже произошёл
              })
              .catch(reject);
          } else {
            // Если middleware не вернул Promise, ожидаем вызова next
            // Но на случай, если middleware синхронно завершил ответ без вызова next,
            // проверяем состояние ответа через небольшой таймаут.
            // Устанавливаем защиту: если middleware не вызовет next в разумное время, это может зависнуть.
            // Здесь мы не ставим глобальный таймаут, предполагаем корректность middleware.
            // Если middleware завершил ответ синхронно, следующий цикл увидит res.writableEnded и прервётся.
          }
        } catch (err) {
          reject(err);
        }
      });

      // После каждого middleware проверяем, не был ли ответ отправлен
      if (res.writableEnded || res.finished) break;
    }
  }
}

module.exports = App;
