
const CategoriesService = require('../services/CategoriesService');
const { createError } = require('../../../core/middleware/errorHandler');


class CategoriesController {
  constructor() {
    this.service = new CategoriesService();
  }

  async getAll(req, res, next) {
    try {
      const categories = await this.service.findAll();
      res.json({
        success: true,
        data: categories,
        total: categories.length
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить категории', error));
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await this.service.findById(id);

      if (!category) {
        return next(createError(404, 'Категория не найдена'));
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      return next(createError(500, 'Ошибка при получении категории', error));
    }
  }

  async create(req, res, next) {
    try {
      const categoryData = req.body;

      if (!categoryData.title) {
        return next(createError(400, 'Название категории обязательно'));
      }

      const newCategory = await this.service.create(categoryData);

      res.status(201).json({
        success: true,
        data: newCategory,
        message: 'Категория создана'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось создать категорию', error));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedCategory = await this.service.update(id, updateData);

      if (!updatedCategory) {
        return next(createError(404, 'Категория не найдена'));
      }

      res.json({
        success: true,
        data: updatedCategory,
        message: 'Категория обновлена'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось обновить категорию', error));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);

      if (!deleted) {
        return next(createError(404, 'Категория не найдена'));
      }

      res.json({
        success: true,
        message: 'Категория удалена'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось удалить категорию', error));
    }
  }

  // GET /api/categories/visible
  async getVisible(req, res, next) {
    try {
      const categories = await this.service.findVisible();
      res.json({
        success: true,
        data: categories,
        total: categories.length
      });
    } catch (error) {
      return next(createError(500, 'Ошибка получения видимых категорий', error));
    }
  }
}

module.exports = CategoriesController;
