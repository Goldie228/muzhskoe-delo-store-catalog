
/*
 * Middleware для централизованной обработки ошибок
 * @param {Object} options - опции обработчика
 * @param {Function} options.logger - функция для логирования (по умолчанию: console.error)
 * @param {boolean} options.hideMessageInProd - скрывать сообщения в production (по умолчанию: true)
 * @param {boolean} options.hideStackInProd - скрывать стек вызовов в production (по умолчанию: true)
 * @returns {Function} - middleware функция
 */
function errorHandler(options = {}) {
  const {
    logger = console.error,
    hideMessageInProd = true,
    hideStackInProd = true
  } = options;

  return function (err, req, res, next) {
    // Нормализуем ошибку и статус
    const statusRaw = err && (err.status || err.statusCode);
    let status = Number.isInteger(statusRaw) ? statusRaw : parseInt(statusRaw, 10);
    if (!Number.isInteger(status) || status < 100 || status > 599) status = 500;

    // Логирование с контекстом (не раскрываем лишнего в логах по желанию)
    try {
      const logPayload = {
        message: err && err.message,
        name: err && err.name,
        status,
        url: req && (req.url || req.originalUrl),
        method: req && req.method,
        timestamp: new Date().toISOString()
      };
      if (err && err.stack) logPayload.stack = err.stack;
      logger('\x1b[31m[ERROR]\x1b[0m Обработчик ошибок:', logPayload);
    } catch (logErr) {
      // ничего не делаем, чтобы не ломать обработку ошибки
      try { console.error('\x1b[31m[ERROR]\x1b[0m Ошибка при логировании ошибки', logErr); } catch (e) {}
    }

    // Если заголовки уже отправлены, делегируем дальше (или просто завершаем)
    if (res && res.headersSent) {
      // Express-style: передаём дальше, чтобы сервер мог закрыть соединение корректно
      if (typeof next === 'function') return next(err);
      return;
    }

    // Формируем безопасный ответ для клиента
    const isDev = process.env.NODE_ENV === 'development';
    const exposeMessage = isDev || !hideMessageInProd || Boolean(err && err.expose);

    const payload = {
      error: true,
      status,
      message: exposeMessage ? (err && err.message) : 'Внутренняя ошибка сервера'
    };

    if (isDev && err && err.stack && !hideStackInProd) {
      payload.stack = err.stack;
    }

    // Отправка ответа: поддерживаем обёртку Response с .status/.json и нативный ServerResponse
    if (res && typeof res.status === 'function' && typeof res.json === 'function') {
      try {
        return res.status(status).json(payload);
      } catch (sendErr) {
        // fallback to native
      }
    }

    // Нативный ServerResponse fallback
    try {
      const body = JSON.stringify(payload);
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', Buffer.byteLength(body));
      }
      if (res && typeof res.write === 'function') res.write(body);
      if (res && typeof res.end === 'function') res.end();
    } catch (finalErr) {
      // ничего не делаем — соединение может быть уже закрыто
    }
  };
}

/*
 * Вспомогательная функция для создания HTTP-ошибок
 * @param {number} status - HTTP статус ошибки
 * @param {string} message - сообщение об ошибке
 * @param {Error} originalError - оригинальная ошибка (опционально)
 * @returns {Error} - объект ошибки с дополнительными свойствами
 */
function createError(status, message, originalError = null) {
  const error = new Error(message || String(message || 'Ошибка'));
  error.name = 'HttpError';
  error.status = Number.isInteger(status) ? status : (parseInt(status, 10) || 500);
  error.statusCode = error.status;
  error.expose = error.status < 500; // по умолчанию показываем клиенту 4xx, скрываем 5xx
  if (originalError) {
    error.originalError = originalError;
    if (!error.stack && originalError.stack) error.stack = originalError.stack;
  }
  // Удобная сериализация
  error.toJSON = function () {
    return {
      name: this.name,
      message: this.expose ? this.message : 'Внутренняя ошибка сервера',
      status: this.status
    };
  };
  return error;
}

module.exports = {
  errorHandler,
  createError
};
