const { fileManager } = require('../../../lib/fileManager');

class BooksService {
  constructor() {
    this.dataFile = 'blueprints/philosophy_service/data/books.json';
  }

  // Получить все книги
  async findAll() {
    return await fileManager.readJSON(this.dataFile);
  }

  // Найти книгу по ID
  async findById(id) {
    return await fileManager.findById(this.dataFile, id);
  }

  // Создать новую книгу
  async create(bookData) {
    // Валидация данных
    if (!bookData.title || !bookData.price) {
      throw new Error('Название и цена обязательны');
    }

    return await fileManager.create(this.dataFile, bookData);
  }

  // Обновить книгу
  async update(id, updateData) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    return await fileManager.update(this.dataFile, id, updateData);
  }

  // Удалить книгу
  async delete(id) {
    return await fileManager.delete(this.dataFile, id);
  }

  // Дополнительный метод: поиск по тегу (направлению)
  async findByTag(tag) {
    const books = await this.findAll();
    return books.filter(book => 
      book.tags && book.tags.includes(tag)
    );
  }
}

module.exports = BooksService;