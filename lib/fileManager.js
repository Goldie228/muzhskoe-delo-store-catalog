
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');


class FileManager {
  /**
   * @param {string} basePath - базовая директория для файлов
   * @param {object} options
   * @param {boolean} options.strict - если true, запрещает выход за пределы basePath
   */
  constructor(basePath = process.cwd(), options = {}) {
    this.basePath = path.resolve(basePath);
    this.strict = Boolean(options.strict);
  }

  _resolveFullPath(filePath) {
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      throw new TypeError('filePath must be a non-empty string');
    }
    const fullPath = path.resolve(this.basePath, filePath);
    if (this.strict && !fullPath.startsWith(this.basePath + path.sep) && fullPath !== this.basePath) {
      throw new Error('Access outside of basePath is not allowed');
    }
    return fullPath;
  }

  // Чтение JSON файла, возвращает массив по умолчанию
  async readJSON(filePath) {
    const fullPath = this._resolveFullPath(filePath);
    try {
      const data = await fs.readFile(fullPath, 'utf-8');
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        // Если ожидается коллекция, удобнее выбросить ошибку, чем вернуть некорректный тип
        throw Object.assign(new Error('JSON content is not an array'), { code: 'INVALID_JSON_TYPE' });
      }
      return parsed;
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        return [];
      }
      // Пробрасываем более информативную ошибку при проблемах парсинга
      if (error instanceof SyntaxError) {
        throw Object.assign(new Error(`Failed to parse JSON file: ${filePath}`), { cause: error });
      }
      throw error;
    }
  }

  // Атомарная запись в JSON файл (через временный файл + rename)
  async writeJSON(filePath, data) {
    const fullPath = this._resolveFullPath(filePath);
    const dirPath = path.dirname(fullPath);

    // Валидация данных: ожидаем массив
    if (!Array.isArray(data)) {
      throw new TypeError('writeJSON expects an array as data');
    }

    await fs.mkdir(dirPath, { recursive: true });

    const jsonData = JSON.stringify(data, null, 2);
    const tmpName = `${path.basename(fullPath)}.tmp-${process.pid}-${Date.now()}`;
    const tmpPath = path.join(dirPath, tmpName);

    // Записываем во временный файл, затем переименовываем
    await fs.writeFile(tmpPath, jsonData, 'utf-8');
    await fs.rename(tmpPath, fullPath);
  }

  // Поиск по ID
  async findById(filePath, id) {
    if (id === undefined || id === null) return null;
    const data = await this.readJSON(filePath);
    return data.find(item => item && item.id === id) || null;
  }

  // Добавление элемента (не мутируем входной объект)
  async create(filePath, item) {
    if (typeof item !== 'object' || item === null) {
      throw new TypeError('item must be a non-null object');
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

  // Обновление элемента (не мутируем входной объект)
  async update(filePath, id, updates) {
    if (id === undefined || id === null) {
      throw new TypeError('id is required');
    }
    if (typeof updates !== 'object' || updates === null) {
      throw new TypeError('updates must be a non-null object');
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

  // Удаление элемента
  async delete(filePath, id) {
    if (id === undefined || id === null) {
      throw new TypeError('id is required');
    }

    const data = await this.readJSON(filePath);
    const filteredData = data.filter(item => item && item.id !== id);

    if (filteredData.length === data.length) {
      return false; // Элемент не найден
    }

    await this.writeJSON(filePath, filteredData);
    return true;
  }

  // Генерация ID: используем crypto.randomUUID если доступно, иначе fallback
  _generateId() {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // fallback: timestamp + random hex
    return Date.now().toString(36) + '-' + crypto.randomBytes(6).toString('hex');
  }
}

// Экспорт
const fileManager = new FileManager();

module.exports = {
  FileManager,
  fileManager
};
