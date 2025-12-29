const BeveragesService = require('../services/BeveragesService');
const { createError } = require('../../../core/middleware/errorHandler');

class BeveragesController {
    constructor() {
        this.service = new BeveragesService();
    }

    // GET /api/alcohol/beverages - Получить все напитки
    async getAll(req, res, next) {
        try {
            const beverages = await this.service.findAll();
            res.json({
                success: true,
                data: beverages,
                total: beverages.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить напитки', error));
        }
    }

    // GET /api/alcohol/beverages/:id - Получить напиток по ID
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const beverage = await this.service.findById(id);

            if (!beverage) {
                return next(createError(404, 'Напиток не найден'));
            }

            res.json({
                success: true,
                data: beverage
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить напиток', error));
        }
    }

    // POST /api/alcohol/beverages - Создать новый напиток
    async create(req, res, next) {
        try {
            if (!req.body.name || !req.body.price || !req.body.type) {
                return next(createError(400, 'Название, цена и тип напитка обязательны'));
            }

            if (typeof req.body.price !== 'number' || req.body.price <= 0) {
                return next(createError(400, 'Цена должна быть положительным числом'));
            }

            const newBeverage = await this.service.create(req.body);
            res.status(201).json({
                success: true,
                data: newBeverage,
                message: 'Напиток создан'
            });
        } catch (error) {
            next(createError(500, 'Ошибка создания напитка', error));
        }
    }

    // PUT /api/alcohol/beverages/:id - Обновить напиток
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedBeverage = await this.service.update(id, req.body);

            if (!updatedBeverage) {
                return next(createError(404, 'Напиток не найден'));
            }

            res.json({
                success: true,
                data: updatedBeverage,
                message: 'Напиток обновлен'
            });
        } catch (error) {
            next(createError(500, 'Ошибка обновления напитка', error));
        }
    }

    // DELETE /api/alcohol/beverages/:id - Удалить напиток
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const isDeleted = await this.service.delete(id);

            if (!isDeleted) {
                return next(createError(404, 'Напиток не найден'));
            }

            res.json({
                success: true,
                message: 'Напиток удален'
            });
        } catch (error) {
            next(createError(500, 'Ошибка удаления напитка', error));
        }
    }

    // GET /api/alcohol/beverages/type/:type - Получить напитки по типу
    async getByType(req, res, next) {
        try {
            const { type } = req.params;
            const beverages = await this.service.findByType(type);

            res.json({
                success: true,
                data: beverages,
                total: beverages.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить напитки по типу', error));
        }
    }

    // GET /api/alcohol/beverages/strength - Получить напитки по диапазону крепости
    async getByStrengthRange(req, res, next) {
        try {
            const { min, max } = req.query;

            if (!min || !max) {
                return next(createError(400, 'Параметры min и max обязательны'));
            }

            const beverages = await this.service.findByStrengthRange(parseFloat(min), parseFloat(max));

            res.json({
                success: true,
                data: beverages,
                total: beverages.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить напитки по диапазону крепости', error));
        }
    }

    // GET /api/alcohol/beverages/instock - Получить напитки в наличии
    async getInStock(req, res, next) {
        try {
            const beverages = await this.service.findInStock();

            res.json({
                success: true,
                data: beverages,
                total: beverages.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить напитки в наличии', error));
        }
    }

    // GET /api/alcohol/beverages/tag/:tag - Получить напитки по тегу
    async getByTag(req, res, next) {
        try {
            const { tag } = req.params;
            const beverages = await this.service.findByTag(tag);

            res.json({
                success: true,
                data: beverages,
                total: beverages.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить напитки по тегу', error));
        }
    }
}

module.exports = BeveragesController;