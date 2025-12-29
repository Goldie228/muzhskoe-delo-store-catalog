
const { fileManager } = require('../../../lib/fileManager');

/**
 * Сервис для управления блюдами
 */
class DishesService {
  constructor() {
    // Путь к файлу с данными
    this.dataFile = 'blueprints/food_service/data/dishes.json';
  }

  /**
   * Получить все блюда
   * @returns {Promise<Array>} Массив блюд
   */
  async findAll() {
    return await fileManager.readJSON(this.dataFile);
  }

  /**
   * Найти блюдо по ID
   * @param {string} id ID блюда
   * @returns {Promise<Object|null>} Объект блюда или null
   */
  async findById(id) {
    return await fileManager.findById(this.dataFile, id);
  }

  /**
   * Создать новое блюдо
   * @param {Object} dishData Данные блюда
   * @returns {Promise<Object>} Созданное блюдо
   */
  async create(dishData) {
    // Валидация обязательных полей
    if (!dishData.name || typeof dishData.price !== 'number') {
      throw new Error('Название (string) и Цена (number) обязательны');
    }

    // Заполняем дату добавления, если не указана
    if (!dishData.addedAt) {
      dishData.addedAt = new Date().toISOString();
    }

    return await fileManager.create(this.dataFile, dishData);
  }

  /**
   * Обновить блюдо
   * @param {string} id ID блюда
   * @param {Object} updateData Данные для обновления
   * @returns {Promise<Object|null>} Обновленное блюдо или null
   */
  async update(id, updateData) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    return await fileManager.update(this.dataFile, id, updateData);
  }

  /**
   * Удалить блюдо
   * @param {string} id ID блюда
   * @returns {Promise<boolean>} Результат удаления
   */
  async delete(id) {
    return await fileManager.delete(this.dataFile, id);
  }

  /**
   * Найти блюда в ценовом диапазоне
   * @param {number} min Минимальная цена
   * @param {number} max Максимальная цена
   * @returns {Promise<Array>} Массив блюд
   */
  async findByPriceRange(min, max) {
    const dishes = await this.findAll();
    return dishes.filter(dish => dish.price >= min && dish.price <= max);
  }
}

module.exports = DishesService;
