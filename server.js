
const App = require('./core/App');
const bodyParser = require('./core/middleware/bodyParser');
const { errorHandler } = require('./core/middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();


class Server {
  constructor() {
    this.app = new App();
    this.port = process.env.PORT || 3000;
    // Жёстко привязываем папку blueprints рядом с server.js
    this.blueprintsDir = path.join(__dirname, 'blueprints');
    this._errorHandler = errorHandler(); // экземпляр глобального обработчика
  }

  // Настройка приложения
  async setup() {
    // Глобальные middleware
    this.app.use(bodyParser());

    // Передаём error handler в App, чтобы он вызывался при ошибках в обработчике
    if (typeof this.app.setErrorHandler === 'function') {
      this.app.setErrorHandler(this._errorHandler);
    }

    // Загрузка всех blueprints
    await this._loadBlueprints();

    // 404 (после всех маршрутов)
    this.app.use((req, res) => {
      // res — наш Response wrapper; ожидаем .status/.json
      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(404).json({
          error: true,
          message: `Route ${req.method} ${req.url} not found`,
          status: 404
        });
      }
      // fallback для нативного res
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        error: true,
        message: `Route ${req.method} ${req.url} not found`,
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

  // Динамическая загрузка всех blueprints
  async _loadBlueprints() {
    try {
      const items = await fs.readdir(this.blueprintsDir, { withFileTypes: true });
      const dirs = items.filter(d => d.isDirectory()).map(d => d.name);

      const filtered = dirs.filter(name => !/template/i.test(name)); // пропускаем шаблоны
      console.log(`Found ${filtered.length} blueprints: ${filtered.join(', ')}`);

      // Загружаем последовательно (порядок может иметь значение)
      for (const dir of filtered) {
        await this._loadBlueprint(dir);
      }
    } catch (error) {
      console.warn('Could not load blueprints:', error && error.stack ? error.stack : error.message);
    }
  }

  // Загрузка одного blueprint
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
            console.log(`Loaded route: ${dirName}/${file}`);
          } else {
            console.warn(`Route file does not export a function: ${dirName}/${file}`);
          }
        } catch (e) {
          console.warn(`Failed to load route ${dirName}/${file}:`, e && e.stack ? e.stack : e.message);
        }
      }
    } catch (e) {
      // Если нет папки routes или файлов — просто логируем и продолжаем
      console.warn(`No routes found for blueprint ${dirName}:`, e && e.message ? e.message : e);
    }
  }

  // Запуск сервера
  start() {
    this.app.listen(this.port, () => {
      console.log(`
🚀 Server started successfully!
📍 Port: ${this.port}
📁 Blueprints: dynamically loaded from ${this.blueprintsDir}
📚 API Documentation: see README.md
🌐 Try: curl http://localhost:${this.port}/api/example
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  // Корректное завершение
  async shutdown() {
    console.log('\n🛑 Shutting down server...');
    try {
      // Если App предоставляет close, ждём его
      if (typeof this.app.close === 'function') {
        await new Promise((resolve) => this.app.close(resolve));
      }
      console.log('Server closed gracefully.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err && err.stack ? err.stack : err);
      process.exit(1);
    }
  }
}

// Запуск сервера
async function main() {
  const server = new Server();

  try {
    await server.setup();
    server.start();
  } catch (error) {
    console.error('Failed to start server:', error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = Server;
