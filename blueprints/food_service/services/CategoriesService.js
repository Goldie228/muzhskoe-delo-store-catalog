
const { fileManager } = require('../../../lib/fileManager');

/**
 * Сервис для управления категориями
 */
class CategoriesService {
  constructor() {
    this.dataFile = 'blueprints/food_service/data/categories.json';
  }

  async findAll() {
    return await fileManager.readJSON(this.dataFile);
  }

  async findById(id) {
    return await fileManager.findById(this.dataFile, id);
  }

  async create(categoryData) {
    if (!categoryData.title) {
      throw new Error('Название категории обязательно');
    }

    if (!categoryData.lastModified) {
      categoryData.lastModified = new Date().toISOString();
    }

    return await fileManager.create(this.dataFile, categoryData);
  }

  async update(id, updateData) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // Обновляем дату изменения при апдейте
    updateData.lastModified = new Date().toISOString();

    return await fileManager.update(this.dataFile, id, updateData);
  }

  async delete(id) {
    return await fileManager.delete(this.dataFile, id);
  }

  /**
   * Получить только видимые категории
   * @returns {Promise<Array>}
   */
  async findVisible() {
    const categories = await this.findAll();
    return categories.filter(cat => cat.isVisible);
  }
}

module.exports = CategoriesService;
