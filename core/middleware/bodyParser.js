
const { URLSearchParams } = require('url');

/*
 * Middleware для парсинга тела запроса
 * @param {Object} options - опции парсера
 * @param {number} options.limit - максимальный размер тела в байтах (по умолчанию 1 MB)
 * @param {boolean} options.extended - для urlencoded: false -> simple, true -> URLSearchParams
 * @param {boolean} options.strict - если true, некорректный JSON -> ошибка, иначе body = null
 * @param {boolean} options.raw - если true, для неподдерживаемых типов возвращаем Buffer
 * @returns {Function} - middleware функция
 */
function bodyParser(options = {}) {
  const {
    limit = 1 * 1024 * 1024, // 1 MB
    extended = false,        // для urlencoded: false -> simple, true -> URLSearchParams
    strict = true,           // если true, некорректный JSON -> ошибка, иначе body = null
    raw = false              // если true, для неподдерживаемых типов возвращаем Buffer
  } = options;

  return async function bodyParserMiddleware(req, res, next) {
    // Методы без тела
    const method = (req.method || 'GET').toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'DELETE' || method === 'OPTIONS') {
      return next();
    }

    // Если тело уже распарсено — пропускаем
    if (req._bodyParsed) return next();

    const contentType = (req.headers['content-type'] || '').toLowerCase();

    try {
      if (contentType.includes('application/json')) {
        await _parseJsonBody(req, { limit, strict });
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        await _parseUrlencodedBody(req, { limit, extended });
      } else if (contentType.includes('text/') || contentType === '') {
        // Текстовые типы или отсутствующий Content-Type
        await _parseTextBody(req, { limit });
      } else {
        // Неподдерживаемый тип
        if (raw) {
          await _parseRawBody(req, { limit });
        } else {
          // Оставляем req.body null и помечаем как прочитанное, чтобы другие middleware не пытались читать
          req._bodyParsed = true;
          req.body = null;
        }
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/*
 * Общая функция чтения тела с лимитом и обработкой abort/close
 * @param {IncomingMessage|Request} req - объект запроса (обертка или нативный)
 * @param {Object} options - опции чтения
 * @param {number} options.limit - максимальный размер тела в байтах
 * @returns {Promise<Buffer>} - промис с телом запроса в виде Buffer
 */
function _readBody(req, { limit }) {
  // Извлекаем нативный запрос из обертки
  const nativeReq = req.raw ? req.raw : req;

  return new Promise((resolve, reject) => {
    if (req._bodyParsed) return resolve(null);

    const chunks = [];
    let length = 0;
    let finished = false;
    let aborted = false;

    function cleanup() {
      nativeReq.removeListener('data', onData);
      nativeReq.removeListener('end', onEnd);
      nativeReq.removeListener('error', onError);
      nativeReq.removeListener('close', onClose);
      nativeReq.removeListener('aborted', onAbort);
    }

    function onData(chunk) {
      if (aborted) return;
      length += chunk.length;
      if (length > limit) {
        aborted = true;
        cleanup();
        // уничтожаем соединение и возвращаем ошибку
        try { nativeReq.destroy(); } catch (e) {}
        return reject(Object.assign(new Error('Размер тела запроса превышает лимит'), { status: 413 }));
      }
      chunks.push(chunk);
    }

    function onEnd() {
      if (aborted) return;
      finished = true;
      cleanup();
      const buffer = Buffer.concat(chunks, length);
      resolve(buffer);
    }

    function onError(err) {
      if (aborted) return;
      aborted = true;
      cleanup();
      reject(err);
    }

    function onClose() {
      if (finished || aborted) return;
      aborted = true;
      cleanup();
      reject(new Error('Соединение закрыто до полного получения тела запроса'));
    }

    function onAbort() {
      if (finished || aborted) return;
      aborted = true;
      cleanup();
      reject(new Error('Запрос прерван клиентом'));
    }

    // Вешаем листенеры ТОЛЬКО на нативный запрос
    nativeReq.on('data', onData);
    nativeReq.on('end', onEnd);
    nativeReq.on('error', onError);
    nativeReq.on('close', onClose);
    nativeReq.on('aborted', onAbort);
  });
}

/*
 * Парсинг JSON тела запроса
 * @param {IncomingMessage|Request} req - объект запроса
 * @param {Object} options - опции парсинга
 * @param {number} options.limit - максимальный размер тела в байтах
 * @param {boolean} options.strict - строгий режим парсинга JSON
 */
async function _parseJsonBody(req, { limit, strict }) {
  const raw = await _readBody(req, { limit });
  req._bodyParsed = true;
  if (!raw || raw.length === 0) {
    req.body = null;
    return;
  }
  const text = raw.toString('utf8');
  try {
    req.body = JSON.parse(text);
  } catch (err) {
    if (strict) throw Object.assign(new Error('Некорректное тело JSON'), { status: 400, cause: err });
    req.body = null;
  }
}

/*
 * Парсинг URL-encoded тела запроса
 * @param {IncomingMessage|Request} req - объект запроса
 * @param {Object} options - опции парсинга
 * @param {number} options.limit - максимальный размер тела в байтах
 * @param {boolean} options.extended - расширенный режим парсинга
 */
async function _parseUrlencodedBody(req, { limit, extended }) {
  const raw = await _readBody(req, { limit });
  req._bodyParsed = true;
  if (!raw || raw.length === 0) {
    req.body = null;
    return;
  }
  const text = raw.toString('utf8');
  if (extended) {
    // Используем URLSearchParams для корректной обработки повторяющихся ключей
    const params = new URLSearchParams(text);
    const obj = {};
    for (const key of new Set(params.keys())) {
      const vals = params.getAll(key);
      obj[key] = vals.length > 1 ? vals : vals[0];
    }
    req.body = obj;
  } else {
    // Простая реализация, защищаем decodeURIComponent
    const obj = {};
    const pairs = text.split('&').filter(Boolean);
    for (const pair of pairs) {
      const [rawKey, rawValue] = pair.split('=');
      if (!rawKey) continue;
      let key, value;
      try { key = decodeURIComponent(rawKey.replace(/\+/g, ' ')); } catch (e) { key = rawKey; }
      try { value = decodeURIComponent((rawValue || '').replace(/\+/g, ' ')); } catch (e) { value = rawValue || ''; }
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (Array.isArray(obj[key])) obj[key].push(value);
        else obj[key] = [obj[key], value];
      } else {
        obj[key] = value;
      }
    }
    req.body = obj;
  }
}

/*
 * Парсинг текстового тела запроса
 * @param {IncomingMessage|Request} req - объект запроса
 * @param {Object} options - опции парсинга
 * @param {number} options.limit - максимальный размер тела в байтах
 */
async function _parseTextBody(req, { limit }) {
  const raw = await _readBody(req, { limit });
  req._bodyParsed = true;
  req.body = raw && raw.length ? raw.toString('utf8') : null;
}

/*
 * Парсинг сырого тела запроса в виде Buffer
 * @param {IncomingMessage|Request} req - объект запроса
 * @param {Object} options - опции парсинга
 * @param {number} options.limit - максимальный размер тела в байтах
 */
async function _parseRawBody(req, { limit }) {
  const raw = await _readBody(req, { limit });
  req._bodyParsed = true;
  req.body = raw && raw.length ? raw : null;
}

module.exports = bodyParser;
