
const { IncomingMessage } = require('http');

/*
 * Класс Request - обёртка над нативным объектом IncomingMessage
 * Предоставляет удобный интерфейс для работы с HTTP-запросом
 */
class Request {
  constructor(req) {
    if (!(req instanceof IncomingMessage)) throw new TypeError('req должен быть IncomingMessage');
    this._req = req;

    this.params = {};
    this.query = {};
    this.body = null;
    this.path = null;
    this.method = req.method || 'GET';
    this.headers = req.headers || {};

    this._parseUrl();
  }

  /*
   * Парсинг URL для извлечения пути и параметров запроса
   */
  _parseUrl() {
    try {
      const host = this._req.headers.host || 'localhost';
      const parsed = new URL(this._req.url, `http://${host}`);
      this.path = parsed.pathname;
      // Преобразуем searchParams в объект; повторяющиеся ключи -> массив
      const params = {};
      for (const key of parsed.searchParams.keys()) {
        const values = parsed.searchParams.getAll(key);
        params[key] = values.length > 1 ? values : values[0];
      }
      this.query = params;
    } catch (e) {
      // fallback: простая обработка
      this.path = this._req.url || '/';
      this.query = {};
    }
  }

  /*
   * Асинхронный парсер тела запроса с ограничением размера
   * @param {Object} options - опции парсинга
   * @param {number} options.limit - максимальный размер тела в байтах (по умолчанию 1MB)
   * @param {string} options.type - тип парсинга ('auto', 'json', 'text', 'urlencoded')
   * @returns {Promise} - промис с результатом парсинга
   */
  async parseBody({ limit = 1 * 1024 * 1024, type = 'auto' } = {}) {
    if (this.body !== null) return this.body; // уже распарсено

    const req = this._req;
    const chunks = [];
    let length = 0;

    return await new Promise((resolve, reject) => {
      req.on('data', (chunk) => {
        length += chunk.length;
        if (length > limit) {
          reject(new Error('Размер тела запроса превышает лимит'));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });

      req.on('end', () => {
        const raw = Buffer.concat(chunks, length);
        const contentType = (req.headers['content-type'] || '').split(';')[0].trim();

        try {
          if (type === 'auto') {
            if (contentType === 'application/json') {
              this.body = raw.length ? JSON.parse(raw.toString('utf8')) : null;
            } else if (contentType === 'application/x-www-form-urlencoded') {
              const params = new URLSearchParams(raw.toString('utf8'));
              const obj = {};
              for (const key of params.keys()) {
                const vals = params.getAll(key);
                obj[key] = vals.length > 1 ? vals : vals[0];
              }
              this.body = obj;
            } else {
              this.body = raw;
            }
          } else if (type === 'json') {
            this.body = raw.length ? JSON.parse(raw.toString('utf8')) : null;
          } else if (type === 'text') {
            this.body = raw.toString('utf8');
          } else {
            this.body = raw;
          }
          resolve(this.body);
        } catch (err) {
          reject(err);
        }
      });

      req.on('error', reject);
    });
  }

  /*
   * Геттер для доступа к оригинальному объекту IncomingMessage
   * @returns {IncomingMessage} - оригинальный объект запроса
   */
  get raw() {
    return this._req;
  }
}

module.exports = Request;
