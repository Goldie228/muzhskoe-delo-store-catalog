
const { ServerResponse } = require('http');


class Response {
  constructor(res) {
    if (!(res instanceof ServerResponse)) throw new TypeError('res must be ServerResponse');
    this._res = res;
    this.finished = false;
  }

  status(code) {
    if (!Number.isInteger(code) || code < 100 || code > 599) {
      throw new TypeError('Invalid HTTP status code');
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
      // Если сериализация упала — отправляем 500 или безопасное сообщение
      if (!this._res.headersSent) {
        this._res.statusCode = 500;
        const fallback = JSON.stringify({ error: 'Failed to serialize response' });
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
      // Пустой ответ
      if (!this._res.headersSent) {
        this._res.setHeader('Content-Length', 0);
      }
      this._end();
      return this;
    }

    // Buffer
    if (Buffer.isBuffer(data)) {
      this._ensureHeader('Content-Type', 'application/octet-stream');
      this._res.setHeader('Content-Length', data.length);
      if (!this._res.headersSent) this._res.write(data);
      this._end();
      return this;
    }

    // Stream (readable)
    if (data && typeof data.pipe === 'function') {
      this._ensureHeader('Content-Type', 'application/octet-stream');
      // Не устанавливаем Content-Length для стрима
      data.pipe(this._res);
      data.on('end', () => this._end());
      data.on('error', () => {
        if (!this._res.headersSent) {
          this._res.statusCode = 500;
          this._res.end('Stream error');
        } else {
          this._res.end();
        }
      });
      return this;
    }

    // Object -> JSON
    if (typeof data === 'object') return this.json(data);

    // Primitive -> text
    const str = String(data);
    this._ensureHeader('Content-Type', 'text/plain; charset=utf-8');
    this._res.setHeader('Content-Length', Buffer.byteLength(str));
    if (!this._res.headersSent) this._res.write(str);
    this._end();
    return this;
  }

  _end() {
    if (!this.finished && !this._res.writableEnded) {
      try {
        this._res.end();
      } catch (e) {
        // ignore
      }
    }
    this.finished = true;
  }

  // Проксируем полезные свойства/методы при необходимости
  get headersSent() {
    return this._res.headersSent;
  }
}

module.exports = Response;
