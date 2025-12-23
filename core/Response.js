
const { ServerResponse } = require('http');

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

  /*
   * Установка статуса ответа
   * @param {number} code - HTTP статус код
   * @returns {Response} - возвращает экземпляр для цепочки вызовов
   */
  status(code) {
    if (!Number.isInteger(code) || code < 100 || code > 599) {
      throw new TypeError('Некорректный HTTP статус код');
    }
    this._res.statusCode = code;
    return this;
  }

  /*
   * Установка заголовка, если он еще не установлен
   * @param {string} name - имя заголовка
   * @param {string} value - значение заголовка
   */
  _ensureHeader(name, value) {
    if (!this._res.getHeader(name)) {
      this._res.setHeader(name, value);
    }
  }

  /*
   * Отправка JSON-ответа
   * @param {*} data - данные для сериализации в JSON
   * @returns {Response} - возвращает экземпляр для цепочки вызовов
   */
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
        const fallback = JSON.stringify({ error: 'Ошибка сериализации ответа' });
        this._res.setHeader('Content-Type', 'application/json; charset=utf-8');
        this._res.setHeader('Content-Length', Buffer.byteLength(fallback));
        this._res.write(fallback);
      }
      this._end();
    }
    return this;
  }

  /*
   * Отправка ответа различных типов
   * @param {*} data - данные для отправки
   * @returns {Response} - возвращает экземпляр для цепочки вызовов
   */
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
          this._res.end('Ошибка потока');
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

  /*
   * Завершение ответа
   */
  _end() {
    if (!this.finished && !this._res.writableEnded) {
      try {
        this._res.end();
      } catch (e) {
        // игнорируем ошибки при завершении
      }
    }
    this.finished = true;
  }

  /*
   * Геттер для проверки, были ли отправлены заголовки
   * @returns {boolean} - true если заголовки отправлены
   */
  get headersSent() {
    return this._res.headersSent;
  }
}

module.exports = Response;
