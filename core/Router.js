
/*
 * Класс Router - маршрутизатор HTTP-запросов
 * Отвечает за регистрацию и поиск маршрутов по методу и URL
 */
class Router {
  constructor() {
    this.routes = [];
  }

  /*
   * Регистрация маршрута
   * @param {string} method - HTTP метод
   * @param {string} path - путь маршрута
   * @param {Function} handler - обработчик маршрута
   */
  register(method, path, handler) {
    if (typeof method !== 'string' || typeof path !== 'string' || typeof handler !== 'function') {
      throw new TypeError('Ожидается register(method: string, path: string, handler: function)');
    }

    const normalizedMethod = method.toUpperCase();
    const normalizedPath = this._normalizePath(path);
    const { pattern, paramNames } = this._pathToPattern(normalizedPath);

    this.routes.push({
      method: normalizedMethod,
      pattern,
      paramNames,
      handler,
      originalPath: normalizedPath
    });
  }

  /*
   * Поиск подходящего маршрута
   * @param {string} method - HTTP метод
   * @param {string} url - URL запроса
   * @returns {Object|null} - информация о маршруте или null
   */
  find(method, url) {
    if (!method || !url) return null;
    const normalizedMethod = method.toUpperCase();

    // Попробуем корректно извлечь pathname и query, даже если передали полный URL или только путь
    let pathname = url;
    let queryString = '';
    try {
      // Если url выглядит как полный URL, new URL сработает; если нет — добавим базу
      const parsed = new URL(url, 'http://localhost');
      pathname = parsed.pathname;
      queryString = parsed.search ? parsed.search.slice(1) : '';
    } catch (e) {
      // fallback: простая split (на случай некорректных входных данных)
      const parts = String(url).split('?');
      pathname = parts[0];
      queryString = parts[1] || '';
    }

    // Нормализуем pathname (убираем лишний слеш в конце, кроме корня)
    pathname = this._normalizePath(pathname);

    for (const route of this.routes) {
      if (route.method !== normalizedMethod) continue;

      const match = route.pattern.exec(pathname);
      if (match) {
        const params = this._buildParams(route.paramNames, match);
        const query = this._parseQuery(queryString);
        return {
          handler: route.handler,
          params,
          query
        };
      }
    }

    return null; // Маршрут не найден
  }

  /*
   * Преобразование пути в RegExp и извлечение имён параметров
   * @param {string} path - путь маршрута
   * @returns {Object} - объект с pattern и paramNames
   */
  _pathToPattern(path) {
    const parts = path.split('/').filter(Boolean); // убираем пустые сегменты
    const paramNames = [];
    const patternParts = parts.map(part => {
      if (part.startsWith(':')) {
        const name = part.slice(1);
        paramNames.push(name);
        return '([^/]+)'; // захватывающая группа для параметра
      }
      // Экранируем статическую часть, чтобы спецсимволы не ломали RegExp
      return this._escapeRegExp(part);
    });

    const patternString = '^/' + patternParts.join('/') + (path.endsWith('/') && path !== '/' ? '/?$' : '/?$');
    const pattern = new RegExp(patternString);
    return { pattern, paramNames };
  }

  /*
   * Построение объекта params из совпадения RegExp
   * @param {Array} paramNames - массив имён параметров
   * @param {Array} match - результат совпадения RegExp
   * @returns {Object} - объект с параметрами
   */
  _buildParams(paramNames, match) {
    const params = {};
    for (let i = 0; i < paramNames.length; i++) {
      const raw = match[i + 1];
      if (raw === undefined) continue;
      try {
        params[paramNames[i]] = decodeURIComponent(raw);
      } catch (e) {
        // Если декодирование упало — используем "сырое" значение
        params[paramNames[i]] = raw;
      }
    }
    return params;
  }

  /*
   * Парсинг query-строки с поддержкой повторяющихся ключей
   * @param {string} queryString - строка запроса
   * @returns {Object} - объект с параметрами запроса
   */
  _parseQuery(queryString) {
    if (!queryString) return {};
    try {
      const params = new URLSearchParams(queryString);
      const result = {};
      for (const key of new Set(params.keys())) {
        const values = params.getAll(key).map(v => {
          try { return decodeURIComponent(v); } catch (e) { return v; }
        });
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    } catch (e) {
      // fallback на простую реализацию, если URLSearchParams не справился
      return queryString.split('&').reduce((query, pair) => {
        if (!pair) return query;
        const [rawKey, rawValue] = pair.split('=');
        if (!rawKey) return query;
        let key, value;
        try { key = decodeURIComponent(rawKey); } catch (e) { key = rawKey; }
        try { value = decodeURIComponent(rawValue || ''); } catch (e) { value = rawValue || ''; }

        if (Object.prototype.hasOwnProperty.call(query, key)) {
          if (Array.isArray(query[key])) query[key].push(value);
          else query[key] = [query[key], value];
        } else {
          query[key] = value;
        }
        return query;
      }, {});
    }
  }

  /*
   * Нормализация пути: гарантируем ведущий слеш, убираем лишние слеши в конце (кроме корня)
   * @param {string} path - путь для нормализации
   * @returns {string} - нормализованный путь
   */
  _normalizePath(path) {
    if (!path) return '/';
    let p = String(path);
    // Если передали полный URL, извлечём pathname
    try {
      const parsed = new URL(p, 'http://localhost');
      p = parsed.pathname;
    } catch (e) {
      // ничего
    }
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  /*
   * Экранирование спецсимволов RegExp
   * @param {string} string - строка для экранирования
   * @returns {string} - экранированная строка
   */
  _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = Router;
