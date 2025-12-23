
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
  constructor() {
    this.app = new App();
    this.port = process.env.PORT || 3000;
    // Жёстко привязываем папку blueprints рядом с server.js
    this.blueprintsDir = path.join(__dirname, 'blueprints');
    this._errorHandler = errorHandler(); // экземпляр глобального обработчика
  }

  /*
   * Настройка приложения перед запуском
   * Регистрирует middleware, загружает маршруты и настраивает обработку ошибок
   */
  async setup() {
    // Глобальные middleware
    this.app.use(bodyParser());

    // Передаём error handler в App, чтобы он вызывался при ошибках в обработчике
    if (typeof this.app.setErrorHandler === 'function') {
      this.app.setErrorHandler(this._errorHandler);
    }

    // Загрузка всех blueprints
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

    // Placeholder для совместимости — реальная обработка ошибок идёт через setErrorHandler
    if (typeof this.app.use === 'function') {
      this.app.use((req, res, next) => {
        if (typeof next === 'function') next();
      });
    }
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

if (require.main === module) {
  main();
}

module.exports = Server;
