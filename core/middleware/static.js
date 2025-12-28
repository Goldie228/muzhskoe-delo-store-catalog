
const fs = require('fs');
const path = require('path');

// Простая карта MIME-типов
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

/**
 * Middleware для обслуживания статических файлов.
 * Возвращает Promise, чтобы App.js ждал завершения отправки файла.
 */
function staticMiddleware(rootDir) {
  const absoluteRoot = path.resolve(process.cwd(), rootDir);

  return function (req, res, next) {
    // Если запрос к API, пропускаем
    if (req.path.startsWith('/api')) {
      return next();
    }

    let requestedPath = req.path;
    try {
      requestedPath = decodeURIComponent(requestedPath);
    } catch (e) {
      return res.status(400).send('Некорректный URI');
    }

    // Защита от выхода за корень
    if (requestedPath.includes('..')) {
      return res.status(403).send('Доступ запрещен');
    }

    let filePath = path.join(absoluteRoot, requestedPath);
    
    // Проверка существования и определение типа (файл или папка)
    let stats;
    try {
      stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        // Проверяем, существует ли index.html в папке
        try {
          fs.statSync(filePath);
        } catch (e) {
          // index.html нет в папке
          return res.status(404).send('Файл не найден');
        }
      }
    } catch (e) {
      // Если запрошен путь без расширения (например, /food), и это не папка
      // и файл не найден, для SPA отдаем index.html
      if (!path.extname(requestedPath) && requestedPath !== '/') {
        const indexPath = path.join(absoluteRoot, 'index.html');
        try {
          fs.statSync(indexPath);
          filePath = indexPath;
        } catch (indexErr) {
          return res.status(404).send('Файл не найден');
        }
      } else {
        return res.status(404).send('Файл не найден');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Возвращаем Promise, чтобы App.js подождал, пока файл отправится
    return new Promise((resolve) => {
      const stream = fs.createReadStream(filePath);

      stream.on('open', () => {
        // Устанавливаем заголовки напрямую в нативный res, 
        // чтобы избежать проблем с оберткой в стримах
        if (!res._res.headersSent) {
          res._res.setHeader('Content-Type', contentType);
        }
        stream.pipe(res._res);
      });

      stream.on('error', (err) => {
        console.error(`\x1b[31m[ERROR]\x1b[0m Ошибка чтения файла:`, err);
        if (!res.headersSent && !res._res.headersSent) {
          res.status(500).send('Ошибка сервера');
        }
        resolve(); // Завершаем промис, чтобы middleware завершился
      });

      stream.on('end', () => {
        // Закрываем ответ
        if (!res.finished && !res._res.writableEnded) {
          try {
            res._res.end();
          } catch (e) {}
        }
        resolve(); // Сообщаем App.js, что middleware закончил работу
      });
    });
  };
}

module.exports = staticMiddleware;
