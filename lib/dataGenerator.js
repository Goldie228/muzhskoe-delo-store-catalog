
const crypto = require('crypto');


class DataGenerator {
  /**
   * @param {object} options - глобальные опции генератора
   * @param {number} options.maxDepth - максимальная глубина вложенности схемы (по умолчанию 5)
   */
  constructor(options = {}) {
    this.options = options;
    // Карта "фейкеров" по типу: string, number, boolean, date, array, object
    this.fakers = {
      string: this._generateString.bind(this),
      number: this._generateNumber.bind(this),
      boolean: this._generateBoolean.bind(this),
      date: this._generateDate.bind(this),
      array: this._generateArray.bind(this),
      object: this._generateObject.bind(this)
    };
    // Максимальная глубина рекурсии при генерации вложенных схем
    this.maxDepth = options.maxDepth || 5;
  }

  /**
   * Генерация данных по схеме.
   * @param {object} schema - объект, описывающий поля и их типы/опции
   * @param {number} count - сколько элементов сгенерировать (по умолчанию 1)
   * @returns {object|object[]} - один объект или массив объектов
   */
  generate(schema, count = 1) {
    if (!schema || typeof schema !== 'object') throw new TypeError('schema must be an object');
    if (!Number.isInteger(count) || count < 1) throw new TypeError('count must be a positive integer');

    if (count === 1) return this._generateItem(schema);
    const out = [];
    for (let i = 0; i < count; i++) out.push(this._generateItem(schema));
    return out;
  }

  /**
   * Генерация одного элемента по схеме.
   * @param {object} schema - схема полей
   * @param {number} depth - текущая глубина рекурсии (для защиты от слишком глубокой вложенности)
   */
  _generateItem(schema, depth = 0) {
    // Защита от слишком глубокой рекурсии
    if (depth > this.maxDepth) throw new Error('Schema too deep');

    const item = {};

    // Проходим по каждому полю схемы
    for (const [key, cfg] of Object.entries(schema)) {
      // Поддерживаем краткую форму: 'string' -> { type: 'string' }
      const config = typeof cfg === 'string' ? { type: cfg } : { ...cfg };

      // Ищем соответствующий генератор по типу
      const faker = this.fakers[config.type];
      if (!faker) throw new TypeError(`Unknown type "${config.type}" for key "${key}"`);

      // Вызываем генератор, передаём конфиг и текущую глубину
      item[key] = faker(config, depth + 1);
    }

    // Если в схеме не задано id, добавляем уникальный id
    if (!item.id) item.id = this._generateId();

    return item;
  }

  /**
   * Генерация строки.
   * Поддерживает опции:
   *  - min, max: минимальная/максимальная длина
   *  - length: альтернативный способ задать фиксированную длину
   */
  _generateString(opts = {}) {
    const min = Number.isInteger(opts.min) ? opts.min : (opts.length ? opts.length : 5);
    const max = Number.isInteger(opts.max) ? opts.max : (opts.length ? opts.length : 15);
    // Гарантируем корректный порядок min/max
    const len = this._randomInt(Math.min(min, max), Math.max(min, max));

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let s = '';
    for (let i = 0; i < len; i++) {
      s += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return s;
  }

  /**
   * Генерация числа.
   * Поддерживает опции:
   *  - min, max: диапазон
   *  - float: если true, возвращает число с плавающей точкой
   *  - precision: количество знаков после запятой для float
   */
  _generateNumber(opts = {}) {
    const min = (typeof opts.min === 'number') ? opts.min : 1;
    const max = (typeof opts.max === 'number') ? opts.max : 1000;

    // Если min > max — меняем местами (устойчивость к ошибкам в схеме)
    if (min > max) return this._generateNumber({ min: max, max: min });

    if (opts.float) {
      const precision = Math.pow(10, opts.precision || 2);
      const v = Math.random() * (max - min) + min;
      return Math.round(v * precision) / precision;
    }

    // Для целых чисел используем _randomInt
    return this._randomInt(Math.ceil(min), Math.floor(max));
  }

  // Простая генерация boolean
  _generateBoolean() {
    return Math.random() >= 0.5;
  }

  /**
   * Генерация даты в ISO-формате.
   * Опция:
   *  - daysAgo: максимальное количество дней назад (по умолчанию 365)
   */
  _generateDate(opts = {}) {
    const daysAgo = Number.isInteger(opts.daysAgo) ? opts.daysAgo : 365;
    const days = this._randomInt(0, Math.max(0, daysAgo));
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }

  /**
   * Генерация массива.
   * Опции:
   *  - minSize, maxSize или size: размер массива
   *  - items: тип элементов (строка с именем типа или вложенная схема)
   *
   * Пример:
   *  { type: 'array', items: 'string', minSize: 1, maxSize: 3 }
   *  { type: 'array', items: { id: 'string', qty: { type: 'number', min:1 } } }
   */
  _generateArray(opts = {}, depth = 0) {
    const min = Number.isInteger(opts.minSize) ? opts.minSize : (Number.isInteger(opts.size) ? opts.size : 1);
    const max = Number.isInteger(opts.maxSize) ? opts.maxSize : (Number.isInteger(opts.size) ? opts.size : 5);
    const size = this._randomInt(Math.min(min, max), Math.max(min, max));

    const items = [];
    const itemType = opts.items || 'string';

    for (let i = 0; i < size; i++) {
      if (typeof itemType === 'string') {
        const faker = this.fakers[itemType];
        if (!faker) throw new TypeError(`Unknown array item type "${itemType}"`);
        // Передаём пустой конфиг и увеличиваем глубину
        items.push(faker({}, depth + 1));
      } else {
        // Вложенная схема для элементов массива
        items.push(this._generateItem(itemType, depth + 1));
      }
    }
    return items;
  }

  /**
   * Генерация вложенного объекта по схеме:
   * Ожидается opts.schema — схема полей вложенного объекта.
   */
  _generateObject(opts = {}, depth = 0) {
    if (!opts.schema || typeof opts.schema !== 'object') return {};
    return this._generateItem(opts.schema, depth + 1);
  }

  /**
   * Генерация уникального id.
   * Использует crypto.randomUUID если доступно, иначе fallback на timestamp + random bytes.
   */
  _generateId() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return Date.now().toString(36) + '-' + crypto.randomBytes(6).toString('hex');
  }

  /**
   * Вспомогательная функция: случайное целое в диапазоне [min, max]
   */
  _randomInt(min, max) {
    min = Math.floor(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = { DataGenerator, dataGenerator: new DataGenerator() };
