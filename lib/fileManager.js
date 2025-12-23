
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/*
 * Класс FileManager - утилита для работы с JSON файлами
 * Предоставляет CRUD-операции над коллекциями в JSON файлах
 */
class FileManager {
  /**
   * @param {string} basePath - базовая директория для файлов
   * @param {Object} options - опции
   * @param {boolean} options.strict - если true, запрещает выход за пределы basePath
   */
  constructor(basePath = process.cwd(), options = {}) {
    this.basePath = path.resolve(basePath);
    this.strict = Boolean(options.strict);
  }

  /*
   * Разрешение полного пути к файлу
   * @param {string} filePath - относительный путь к файлу
   * @returns {string} - полный путь к файлу
   */
  _resolveFullPath(filePath) {
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      throw new TypeError('filePath должен быть непустой строкой');
    }
    const fullPath = path.resolve(this.basePath, filePath);
    if (this.strict && !fullPath.startsWith(this.basePath + path.sep) && fullPath !== this.basePath) {
      throw new Error('Выход за пределы basePath запрещен');
    }
    return fullPath;
  }

  /*
   * Чтение JSON файла, возвращает массив по умолчанию
   * @param {string} filePath - путь к файлу
   * @returns {Promise<Array>} - промис с массивом данных
   */
  async readJSON(filePath) {
    const fullPath = this._resolveFullPath(filePath);
    try {
      const data = await fs.readFile(fullPath, 'utf-8');
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        // Если ожидается коллекция, удобнее выбросить ошибку, чем вернуть некорректный тип
        throw Object.assign(new Error('Содержимое JSON не является массивом'), { code: 'INVALID_JSON_TYPE' });
      }
      return parsed;
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        return [];
      }
      // Пробрасываем более информативную ошибку при проблемах парсинга
      if (error instanceof SyntaxError) {
        throw Object.assign(new Error(`Не удалось разобрать JSON файл: ${filePath}`), { cause: error });
      }
      throw error;
    }
  }

  /*
   * Атомарная запись в JSON файл (через временный файл + rename)
   * @param {string} filePath - путь к файлу
   * @param {Array} data - данные для записи
   * @returns {Promise} - промис завершения записи
   */
  async writeJSON(filePath, data) {
    const fullPath = this._resolveFullPath(filePath);
    const dirPath = path.dirname(fullPath);

    // Валидация данных: ожидаем массив
    if (!Array.isArray(data)) {
      throw new TypeError('writeJSON ожидает массив в качестве данных');
    }

    await fs.mkdir(dirPath, { recursive: true });

    const jsonData = JSON.stringify(data, null, 2);
    const tmpName = `${path.basename(fullPath)}.tmp-${process.pid}-${Date.now()}`;
    const tmpPath = path.join(dirPath, tmpName);

    // Записываем во временный файл, затем переименовываем
    await fs.writeFile(tmpPath, jsonData, 'utf-8');
    await fs.rename(tmpPath, fullPath);
  }

  /*
   * Поиск элемента по ID
   * @param {string} filePath - путь к файлу
   * @param {string|number} id - ID элемента
   * @returns {Promise<Object|null>} - промис с найденным элементом или null
   */
  async findById(filePath, id) {
    if (id === undefined || id === null) return null;
    const data = await this.readJSON(filePath);
    return data.find(item => item && item.id === id) || null;
  }

  /*
   * Добавление элемента (не мутируем входной объект)
   * @param {string} filePath - путь к файлу
   * @param {Object} item - данные элемента
   * @returns {Promise<Object>} - промис с созданным элементом
   */
  async create(filePath, item) {
    if (typeof item !== 'object' || item === null) {
      throw new TypeError('item должен быть непустым объектом');
    }

    const data = await this.readJSON(filePath);

    // Клонируем, чтобы не мутировать аргумент
    const newItem = { ...item };

    // Генерируем ID и метаданные, если их нет
    if (!newItem.id) {
      newItem.id = this._generateId();
    }
    const now = new Date().toISOString();
    if (!newItem.createdAt) newItem.createdAt = now;
    newItem.updatedAt = now;

    data.push(newItem);
    await this.writeJSON(filePath, data);

    return newItem;
  }

  /*
   * Обновление элемента (не мутируем входной объект)
   * @param {string} filePath - путь к файлу
   * @param {string|number} id - ID элемента
   * @param {Object} updates - данные для обновления
   * @returns {Promise<Object|null>} - промис с обновленным элементом или null
   */
  async update(filePath, id, updates) {
    if (id === undefined || id === null) {
      throw new TypeError('ID обязателен');
    }
    if (typeof updates !== 'object' || updates === null) {
      throw new TypeError('updates должен быть непустым объектом');
    }

    const data = await this.readJSON(filePath);
    const index = data.findIndex(item => item && item.id === id);

    if (index === -1) {
      return null;
    }

    const existingItem = data[index];
    const updatedItem = {
      ...existingItem,
      ...updates,
      id: existingItem.id, // ID не меняется
      createdAt: existingItem.createdAt || existingItem.createdAt, // сохраняем createdAt
      updatedAt: new Date().toISOString()
    };

    data[index] = updatedItem;
    await this.writeJSON(filePath, data);

    return updatedItem;
  }

  /*
   * Удаление элемента
   * @param {string} filePath - путь к файлу
   * @param {string|number} id - ID элемента
   * @returns {Promise<boolean>} - промис с результатом удаления
   */
  async delete(filePath, id) {
    if (id === undefined || id === null) {
      throw new TypeError('ID обязателен');
    }

    const data = await this.readJSON(filePath);
    const filteredData = data.filter(item => item && item.id !== id);

    if (filteredData.length === data.length) {
      return false; // Элемент не найден
    }

    await this.writeJSON(filePath, filteredData);
    return true;
  }

  /*
   * Генерация ID: используем crypto.randomUUID если доступно, иначе fallback
   * @returns {string} - сгенерированный ID
   */
  _generateId() {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // fallback: timestamp + random hex
    return Date.now().toString(36) + '-' + crypto.randomBytes(6).toString('hex');
  }
}

// Создаем экземпляр для удобного использования
const fileManager = new FileManager();

module.exports = {
  FileManager,
  fileManager
};
