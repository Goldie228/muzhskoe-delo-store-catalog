
const fs = require('fs');
const { ServerResponse } = require('http');
const path = require('path');

// Простая карта MIME-типов для статических файлов
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

/*
 * Класс Response - обёртка над нативным объектом ServerResponse
 * Предоставляет удобный интерфейс для формирования HTTP-ответа
 */
class Response {
  constructor(res) {
    if (!(res instanceof ServerResponse)) throw new TypeError('res должен быть ServerResponse');
    this._res = res;
    this.finished = false;
  }

  status(code) {
    if (!Number.isInteger(code) || code < 100 || code > 599) {
      throw new TypeError('Некорректный HTTP статус код');
    }
    this._res.statusCode = code;
    return this;
  }

  _ensureHeader(name, value) {
    if (!this._res.getHeader(name)) {
      this._res.setHeader(name, value);
    }
  }

  json(data) {
    try {
      const body = JSON.stringify(data);
      this._ensureHeader('Content-Type', 'application/json; charset=utf-8');
      this._res.setHeader('Content-Length', Buffer.byteLength(body));
      if (!this._res.headersSent) this._res.write(body);
      this._end();
    } catch (err) {
      if (!this._res.headersSent) {
        this._res.statusCode = 500;
        const fallback = JSON.stringify({ error: 'Ошибка сериализации ответа' });
        this._res.setHeader('Content-Type', 'application/json; charset=utf-8');
        this._res.setHeader('Content-Length', Buffer.byteLength(fallback));
        this._res.write(fallback);
      }
      this._end();
    }
    return this;
  }

  send(data) {
    if (data === null || data === undefined) {
      if (!this._res.headersSent) {
        this._res.setHeader('Content-Length', 0);
      }
      this._end();
      return this;
    }

    if (Buffer.isBuffer(data)) {
      this._ensureHeader('Content-Type', 'application/octet-stream');
      this._res.setHeader('Content-Length', data.length);
      if (!this._res.headersSent) this._res.write(data);
      this._end();
      return this;
    }

    if (data && typeof data.pipe === 'function') {
      this._ensureHeader('Content-Type', 'application/octet-stream');
      data.pipe(this._res);
      data.on('end', () => this._end());
      data.on('error', () => {
        if (!this._res.headersSent) {
          this._res.statusCode = 500;
          this._res.end('Ошибка потока');
        } else {
          this._res.end();
        }
      });
      return this;
    }

    if (typeof data === 'object') return this.json(data);

    const str = String(data);
    this._ensureHeader('Content-Type', 'text/plain; charset=utf-8');
    this._res.setHeader('Content-Length', Buffer.byteLength(str));
    if (!this._res.headersSent) this._res.write(str);
    this._end();
    return this;
  }

  /**
   * Отправка статического файла из файловой системы.
   */
  sendFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const stream = fs.createReadStream(filePath);

    stream.on('open', () => {
      this._ensureHeader('Content-Type', contentType);
      stream.pipe(this._res);
    });

    stream.on('error', (err) => {
      // Если заголовки уже отправлены (началась передача файла), не можем отправить JSON ошибку
      if (this._res.headersSent) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Ошибка потока файла ${filePath} после начала передачи:`, err);
        stream.destroy();
        this._res.end(); // Просто закрываем соединение
        return;
      }

      if (err.code === 'ENOENT') {
        this.status(404).send('Файл не найден');
      } else if (err.code === 'EACCES') {
        this.status(403).send('Доступ запрещен');
      } else {
        console.error(`\x1b[31m[ERROR]\x1b[0m Ошибка чтения файла ${filePath}:`, err);
        this.status(500).send('Ошибка сервера при чтении файла');
      }
    });

    stream.on('end', () => {
      this._end();
    });

    return this;
  }

  _end() {
    if (!this.finished && !this._res.writableEnded) {
      try {
        this._res.end();
      } catch (e) {}
    }
    this.finished = true;
  }

  get headersSent() {
    return this._res.headersSent;
  }
}

module.exports = Response;
