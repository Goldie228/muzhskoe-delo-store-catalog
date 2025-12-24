const BooksService = require('../services/BooksService');
const { createError } = require('../../../core/middleware/errorHandler');

class BooksController {
  constructor() {
    this.service = new BooksService();
  }

  async getAll(req, res, next) {
    try {
      const books = await this.service.findAll();
      res.json({
        success: true,
        data: books,
        total: books.length
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить книги', error));
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const book = await this.service.findById(id);
      
      if (!book) {
        return next(createError(404, 'Книга не найдена'));
      }
      
      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить книгу', error));
    }
  }

  async create(req, res, next) {
    try {
      const bookData = req.body;
      
      if (!bookData.title || !bookData.price) {
        return next(createError(400, 'Название и цена обязательны'));
      }
      
      const newBook = await this.service.create(bookData);
      
      res.status(201).json({
        success: true,
        data: newBook,
        message: 'Книга успешно добавлена'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось создать книгу', error));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedBook = await this.service.update(id, updateData);
      
      if (!updatedBook) {
        return next(createError(404, 'Книга не найдена'));
      }
      
      res.json({
        success: true,
        data: updatedBook,
        message: 'Книга успешно обновлена'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось обновить книгу', error));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await this.service.delete(id);
      
      if (!deleted) {
        return next(createError(404, 'Книга не найдена'));
      }
      
      res.json({
        success: true,
        message: 'Книга успешно удалена'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось удалить книгу', error));
    }
  }

  async findByTag(req, res, next) {
    try {
      const { tag } = req.params;
      const books = await this.service.findByTag(tag);
      
      res.json({
        success: true,
        data: books,
        total: books.length,
        tag: tag
      });
    } catch (error) {
      return next(createError(500, 'Не удалось найти книги', error));
    }
  }
}

module.exports = BooksController;