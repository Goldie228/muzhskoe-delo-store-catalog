
const App = require('./core/App');
const bodyParser = require('./core/middleware/bodyParser');
const staticMiddleware = require('./core/middleware/static');
const { errorHandler } = require('./core/middleware/errorHandler');
const { authMiddleware } = require('./core/middleware/auth');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();

/*
 * Класс Server - основной класс для запуска и управления сервером приложения
 */
class Server {
  constructor() {
    this.app = new App();
    this.port = process.env.PORT || 3000;
    this.blueprintsDir = path.join(__dirname, 'blueprints');
    this._errorHandler = errorHandler();
  }

  /*
   * Единый метод настройки.
   * Содержит: статику, парсер, админ-логику, загрузку роутов.
   */
  async setup() {
    // 1. Статические файлы
    this.app.use(staticMiddleware('public'));

    // 2. Парсер тела запроса
    this.app.use(bodyParser());

    // 3. Публичный роут для авторизации
    this.app.post('/api/auth/login', (req, res) => {
        const { login, password } = req.body;
        
        if (login === process.env.ADMIN_LOGIN && password === process.env.ADMIN_PASSWORD) {
            res.json({
                success: true,
                token: process.env.ADMIN_TOKEN
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Неверный логин или пароль'
            });
        }
    });

    // 4. Защищаем остальные API методы токеном
    const adminGuard = authMiddleware(process.env.ADMIN_TOKEN);
    this.app.use((req, res, next) => adminGuard(req, res, next));

    // 5. Установка глобального обработчика ошибок
    if (typeof this.app.setErrorHandler === 'function') {
      this.app.setErrorHandler(this._errorHandler);
    }

    // 6. Загрузка всех blueprints
    await this._loadBlueprints();
  }

  /*
   * Динамическая загрузка всех blueprints
   */
  async _loadBlueprints() {
    try {
      const items = await fs.readdir(this.blueprintsDir, { withFileTypes: true });
      const dirs = items.filter(d => d.isDirectory()).map(d => d.name);

      const filtered = dirs.filter(name => !/template/i.test(name));
      console.log(`\x1b[36m[INFO]\x1b[0m Найдено ${filtered.length} модулей: ${filtered.join(', ')}`);

      for (const dir of filtered) {
        await this._loadBlueprint(dir);
      }
    } catch (error) {
      console.warn('\x1b[33m[WARN]\x1b[0m Не удалось загрузить модули:', error && error.stack ? error.stack : error.message);
    }
  }

  /*
   * Загрузка одного blueprint
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
          if (process.env.NODE_ENV !== 'production') {
            try {
              const resolved = require.resolve(routePath);
              delete require.cache[resolved];
            } catch (e) {}
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
\x1b[36m[INFO]\x1b[0m Фронтенд: включен (public/)
\x1b[36m[INFO]\x1b[0m Админка: #admin
      `);
    });

    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /*
   * Корректное завершение работы сервера
   */
  async shutdown() {
    console.log('\n\x1b[33m[INFO]\x1b[0m Завершение работы сервера...');
    try {
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
