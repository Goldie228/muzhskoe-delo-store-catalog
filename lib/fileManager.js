
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * FileManager — утилита для работы с коллекциями в JSON-файлах.
 * Обеспечивает атомарную запись и базовые CRUD-операции.
 */
class FileManager {
  /**
   * @param {string} basePath - Базовая директория для файлов
   * @param {Object} options - Опции менеджера
   * @param {boolean} options.strict - Запрет выхода за пределы basePath
   */
  constructor(basePath = process.cwd(), options = {}) {
    this.basePath = path.resolve(basePath);
    this.strict = Boolean(options.strict);
  }

  /**
   * Вычисляет полный путь к файлу с проверкой безопасности.
   * @private
   * @param {string} filePath
   * @returns {string}
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

  /**
   * Читает JSON файл. Возвращает пустой массив, если файл не существует.
   * @param {string} filePath
   * @returns {Promise<Array>}
   */
  async readJSON(filePath) {
    const fullPath = this._resolveFullPath(filePath);
    try {
      const data = await fs.readFile(fullPath, 'utf-8');
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        throw Object.assign(new Error('Содержимое JSON не является массивом'), { code: 'INVALID_JSON_TYPE' });
      }
      return parsed;
    } catch (error) {
      if (error && error.code === 'ENOENT') return [];
      
      if (error instanceof SyntaxError) {
        throw Object.assign(new Error(`Не удалось разобрать JSON файл: ${filePath}`), { cause: error });
      }
      throw error;
    }
  }

  /**
   * Атомарная запись в JSON файл (через временный файл + rename).
   * При ошибке записи или переименования удаляет временный файл.
   * @param {string} filePath
   * @param {Array} data
   * @returns {Promise<void>}
   */
  async writeJSON(filePath, data) {
    const fullPath = this._resolveFullPath(filePath);
    const dirPath = path.dirname(fullPath);

    if (!Array.isArray(data)) {
      throw new TypeError('writeJSON ожидает массив');
    }

    await fs.mkdir(dirPath, { recursive: true });

    const jsonData = JSON.stringify(data, null, 2);
    const tmpName = `${path.basename(fullPath)}.tmp-${process.pid}-${Date.now()}`;
    const tmpPath = path.join(dirPath, tmpName);

    try {
      await fs.writeFile(tmpPath, jsonData, 'utf-8');
      await fs.rename(tmpPath, fullPath);
    } catch (err) {
      // Очистка временного файла при любой ошибке операции
      try {
        await fs.unlink(tmpPath);
      } catch (unlinkErr) {
        // Игнорируем ошибки при удалении временного файла
      }
      throw err;
    }
  }

  /**
   * Ищет элемент по ID.
   * @param {string} filePath
   * @param {string|number} id
   * @returns {Promise<Object|null>}
   */
  async findById(filePath, id) {
    if (id == null) return null;
    const data = await this.readJSON(filePath);
    return data.find(item => item && item.id === id) || null;
  }

  /**
   * Создает новый элемент. Автоматически генерирует ID и метаданные времени.
   * @param {string} filePath
   * @param {Object} item
   * @returns {Promise<Object>}
   */
  async create(filePath, item) {
    if (typeof item !== 'object' || item === null) {
      throw new TypeError('item должен быть объектом');
    }

    const data = await this.readJSON(filePath);
    const newItem = { ...item };

    if (!newItem.id) newItem.id = this._generateId();
    const now = new Date().toISOString();
    if (!newItem.createdAt) newItem.createdAt = now;
    newItem.updatedAt = now;

    data.push(newItem);
    await this.writeJSON(filePath, data);

    return newItem;
  }

  /**
   * Обновляет элемент по ID. Сохраняет оригинальный createdAt.
   * @param {string} filePath
   * @param {string|number} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  async update(filePath, id, updates) {
    if (id == null) throw new TypeError('ID обязателен');
    if (typeof updates !== 'object' || updates === null) {
      throw new TypeError('updates должен быть объектом');
    }

    const data = await this.readJSON(filePath);
    const index = data.findIndex(item => item && item.id === id);

    if (index === -1) return null;

    const existingItem = data[index];
    const updatedItem = {
      ...existingItem,
      ...updates,
      id: existingItem.id,
      createdAt: existingItem.createdAt,
      updatedAt: new Date().toISOString()
    };

    data[index] = updatedItem;
    await this.writeJSON(filePath, data);

    return updatedItem;
  }

  /**
   * Удаляет элемент по ID.
   * @param {string} filePath
   * @param {string|number} id
   * @returns {Promise<boolean>}
   */
  async delete(filePath, id) {
    if (id == null) throw new TypeError('ID обязателен');

    const data = await this.readJSON(filePath);
    const initialLength = data.length;
    const filteredData = data.filter(item => item && item.id !== id);

    if (filteredData.length === initialLength) return false;

    await this.writeJSON(filePath, filteredData);
    return true;
  }

  /**
   * Генерирует уникальный идентификатор.
   * @private
   * @returns {string}
   */
  _generateId() {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + crypto.randomBytes(6).toString('hex');
  }

  /**
   * Проверяет существование файла асинхронно.
   * @param {string} filePath - путь к файлу
   * @returns {Promise<boolean>} - true, если файл существует
   */
  async fileExists(filePath) {
    const fullPath = this._resolveFullPath(filePath);
    try {
      await fs.access(fullPath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }
}

const fileManager = new FileManager();

module.exports = { FileManager, fileManager };
