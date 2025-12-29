
const DishesService = require('../services/DishesService');
const { createError } = require('../../../core/middleware/errorHandler');


class DishesController {
  constructor() {
    this.service = new DishesService();
  }

  // GET /api/food
  async getAll(req, res, next) {
    try {
      const dishes = await this.service.findAll();
      res.json({
        success: true,
        data: dishes,
        total: dishes.length
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить список блюд', error));
    }
  }

  // GET /api/food/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const dish = await this.service.findById(id);

      if (!dish) {
        return next(createError(404, 'Блюдо не найдено'));
      }

      res.json({
        success: true,
        data: dish
      });
    } catch (error) {
      return next(createError(500, 'Ошибка при получении блюда', error));
    }
  }

  // POST /api/food
  async create(req, res, next) {
    try {
      const dishData = req.body;

      // Базовая валидация
      if (!dishData.name || typeof dishData.price !== 'number') {
        return next(createError(400, 'Название и цена (число) обязательны'));
      }

      const newDish = await this.service.create(dishData);

      res.status(201).json({
        success: true,
        data: newDish,
        message: 'Блюдо успешно добавлено'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось создать блюдо', error));
    }
  }

  // PUT /api/food/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedDish = await this.service.update(id, updateData);

      if (!updatedDish) {
        return next(createError(404, 'Блюдо не найдено'));
      }

      res.json({
        success: true,
        data: updatedDish,
        message: 'Блюдо успешно обновлено'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось обновить блюдо', error));
    }
  }

  // DELETE /api/food/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);

      if (!deleted) {
        return next(createError(404, 'Блюдо не найдено'));
      }

      res.json({
        success: true,
        message: 'Блюдо удалено'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось удалить блюдо', error));
    }
  }

  // GET /api/food/search/price?min=100&max=500
  async getByPriceRange(req, res, next) {
    try {
      const { min, max } = req.query;

      if (!min || !max) {
        return next(createError(400, 'Параметры min и max обязательны'));
      }

      const dishes = await this.service.findByPriceRange(Number(min), Number(max));

      res.json({
        success: true,
        data: dishes,
        total: dishes.length,
        range: { min: Number(min), max: Number(max) }
      });
    } catch (error) {
      return next(createError(500, 'Ошибка поиска по цене', error));
    }
  }
}

module.exports = DishesController;
