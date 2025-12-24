// server.js
const App = require('./core/App');
const bodyParser = require('./core/middleware/bodyParser');
const { errorHandler } = require('./core/middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();

/*
 * Класс Server - основной класс для запуска и управления сервером приложения
 * Отвечает за настройку middleware, загрузку маршрутов и запуск HTTP-сервера
 */
class Server {
  constructor(options = {}) {
    this.app = new App();
    this.port = process.env.PORT || options.port || 3000;
    // Жёстко привязываем папку blueprints рядом с server.js
    this.blueprintsDir = options.blueprintsDir || path.join(__dirname, 'blueprints');
    this._errorHandler = errorHandler(); // экземпляр глобального обработчика
    this._isSetup = false;
  }

  /*
   * Настройка приложения перед запуском
   * Регистрирует middleware, загружает маршруты и настраивает обработку ошибок
   */
  async setup() {
    if (this._isSetup) return this.app;

    // Глобальные middleware (bodyParser должен быть зарегистрирован до маршрутов)
    this.app.use(bodyParser());

    // Передаём error handler в App, чтобы он вызывался при ошибках в обработчике
    if (typeof this.app.setErrorHandler === 'function') {
      this.app.setErrorHandler(this._errorHandler);
    }

    // Загрузка всех blueprints (маршрутов)
    await this._loadBlueprints();

    // Обработка 404 (после всех маршрутов)
    this.app.use((req, res) => {
      // res — наш Response wrapper; ожидаем .status/.json
      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(404).json({
          error: true,
          message: `Маршрут ${req.method} ${req.url} не найден`,
          status: 404
        });
      }
      // fallback для нативного res
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        error: true,
        message: `Маршрут ${req.method} ${req.url} не найден`,
        status: 404
      }));
    });

    // Если App не использует setErrorHandler, регистрируем глобальный middleware-обработчик ошибок
    // (выполнится после маршрутов)
    if (typeof this.app.use === 'function' && typeof this.app.setErrorHandler !== 'function') {
      this.app.use(this._errorHandler);
    }

    this._isSetup = true;
    return this.app;
  }

  /*
   * Динамическая загрузка всех blueprints из директории blueprints
   * Ищет подпапки и загружает маршруты из каждой
   */
  async _loadBlueprints() {
    try {
      const items = await fs.readdir(this.blueprintsDir, { withFileTypes: true });
      const dirs = items.filter(d => d.isDirectory()).map(d => d.name);

      const filtered = dirs.filter(name => !/template/i.test(name)); // пропускаем шаблоны
      console.log(`\x1b[36m[INFO]\x1b[0m Найдено ${filtered.length} модулей: ${filtered.join(', ')}`);

      // Загружаем последовательно (порядок может иметь значение)
      for (const dir of filtered) {
        await this._loadBlueprint(dir);
      }
    } catch (error) {
      console.warn('\x1b[33m[WARN]\x1b[0m Не удалось загрузить модули:', error && error.stack ? error.stack : error.message);
    }
  }

  /*
   * Загрузка одного blueprint
   * @param {string} dirName - имя директории blueprint
   */
  async _loadBlueprint(dirName) {
    const blueprintPath = path.join(this.blueprintsDir, dirName);
    const routesPath = path.join(blueprintPath, 'routes');

    try {
      const routeFiles = await fs.readdir(routesPath);
      const jsFiles = routeFiles.filter(f => f.endsWith('.routes.js'));

      for (const file of jsFiles) {
        const routePath = path.join(routesPath, file);
        try {
          // В dev очищаем кеш, чтобы перезагрузка работала корректно
          if (process.env.NODE_ENV !== 'production') {
            try {
              const resolved = require.resolve(routePath);
              delete require.cache[resolved];
            } catch (e) {
              // ignore resolve errors
            }
          }

          const routeModule = require(routePath);
          if (typeof routeModule === 'function') {
            routeModule(this.app);
            console.log(`\x1b[32m[SUCCESS]\x1b[0m Загружен маршрут: ${dirName}/${file}`);
          } else {
            console.warn(`\x1b[33m[WARN]\x1b[0m Файл маршрута не экспортирует функцию: ${dirName}/${file}`);
          }
        } catch (e) {
          console.warn(`\x1b[31m[ERROR]\x1b[0m Не удалось загрузить маршрут ${dirName}/${file}:`, e && e.stack ? e.stack : e.message);
        }
      }
    } catch (e) {
      // Если нет папки routes или файлов — просто логируем и продолжаем
      console.warn(`\x1b[33m[WARN]\x1b[0m Маршруты не найдены для модуля ${dirName}:`, e && e.message ? e.message : e);
    }
  }

  /*
   * Запуск HTTP-сервера
   */
  start() {
    // Убедимся, что setup выполнен
    if (!this._isSetup) {
      throw new Error('Server not setup. Call await server.setup() before server.start()');
    }

    this.app.listen(this.port, () => {
      console.log(`
\x1b[32m[SUCCESS]\x1b[0m Сервер успешно запущен!
\x1b[36m[INFO]\x1b[0m Порт: ${this.port}
\x1b[36m[INFO]\x1b[0m Модули: динамически загружены из ${this.blueprintsDir}
\x1b[36m[INFO]\x1b[0m Документация API: см. README.md
\x1b[36m[INFO]\x1b[0m Пример запроса: curl http://localhost:${this.port}/api/example
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /*
   * Корректное завершение работы сервера
   */
  async shutdown() {
    console.log('\n\x1b[33m[INFO]\x1b[0m Завершение работы сервера...');
    try {
      // Если App предоставляет close, ждём его
      if (typeof this.app.close === 'function') {
        await new Promise((resolve) => this.app.close(resolve));
      }
      console.log('\x1b[32m[SUCCESS]\x1b[0m Сервер корректно остановлен.');
      process.exit(0);
    } catch (err) {
      console.error('\x1b[31m[ERROR]\x1b[0m Ошибка при остановке сервера:', err && err.stack ? err.stack : err);
      process.exit(1);
    }
  }
}

/*
 * Утилита: создаёт и настраивает App и возвращает его.
 * Полезно для тестов (Supertest) — можно получить app без запуска listen.
 */
async function createApp(options = {}) {
  const server = new Server(options);
  await server.setup();
  return server.app;
}

/*
 * Основная функция для запуска сервера
 */
async function main() {
  const server = new Server();

  try {
    await server.setup();
    server.start();
  } catch (error) {
    console.error('\x1b[31m[ERROR]\x1b[0m Не удалось запустить сервер:', error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

/*
 * Если файл запущен напрямую — стартуем сервер.
 * Если модуль импортируется (например, в тестах), экспортируем Server и createApp.
 */
if (require.main === module) {
  main();
}

module.exports = {
  Server,
  createApp
};
