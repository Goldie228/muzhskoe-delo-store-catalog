
const fs = require('fs');
const path = require('path');

/**
 * Middleware для обслуживания статических файлов.
 * Пропускает все запросы, начинающиеся с /api.
 * @param {string} rootDir - Корневая директория для статических файлов (например, 'public')
 */
function staticMiddleware(rootDir) {
  // Преобразуем относительный путь в абсолютный от запуска сервера
  const absoluteRoot = path.resolve(process.cwd(), rootDir);

  return function (req, res, next) {
    // Если запрос идет к API, пропускаем его дальше к роутеру
    if (req.path.startsWith('/api')) {
      return next();
    }

    // Убираем query строку и декодируем URI компоненты пути
    // Для безопасности запрещаем выход за пределы директории (..)
    let requestedPath = req.path;
    try {
      requestedPath = decodeURIComponent(requestedPath);
    } catch (e) {
      return res.status(400).send('Некорректный URI');
    }

    // Защита от выхода за корень (Directory Traversal)
    if (requestedPath.includes('..')) {
      return res.status(403).send('Доступ запрещен');
    }

    // Если запрошен корень сайта или папка, отдаем index.html (для SPA)
    let filePath = path.join(absoluteRoot, requestedPath);
    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch (e) {
      // Если файл не найден через stat, попробуем просто отдать как есть (ошибка будет в sendFile)
      // или сразу отдать 404. Лучше передать управление в sendFile для единообразия.
    }

    // Используем метод sendFile из обертки Response
    // Если res.sendFile отсутствует (стандартный res), используем базовую логику
    if (typeof res.sendFile === 'function') {
      res.sendFile(filePath);
    } else {
      // Fallback для нативного res (если middleware используется без обертки)
      fs.readFile(filePath, (err, data) => {
        if (err) {
          // Если запрошен путь, но это не API и не файл - для SPA отдаем index.html
          // Это нужно для работы роутинга на клиенте (например, /food)
          if (err.code === 'ENOENT' && requestedPath !== '/' && !path.extname(requestedPath)) {
            const indexPath = path.join(absoluteRoot, 'index.html');
            return fs.readFile(indexPath, (indexErr, indexData) => {
              if (indexErr) {
                res.statusCode = 404;
                res.end('Not Found');
              } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(indexData);
              }
            });
          }
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        res.statusCode = 200;
        res.end(data);
      });
    }
  };
}

module.exports = staticMiddleware;
