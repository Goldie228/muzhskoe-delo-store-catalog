const ProducersService = require('../services/ProducersService');
const { createError } = require('../../../core/middleware/errorHandler');

class ProducersController {
    constructor() {
        this.service = new ProducersService();
    }

    // GET /api/alcohol/producers - Получить всех производителей
    async getAll(req, res, next) {
        try {
            const producers = await this.service.findAll();
            res.json({
                success: true,
                data: producers,
                total: producers.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить производителей', error));
        }
    }

    // GET /api/alcohol/producers/:id - Получить производителя по ID
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const producer = await this.service.findById(id);

            if (!producer) {
                return next(createError(404, 'Производитель не найден'));
            }

            res.json({
                success: true,
                data: producer
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить производителя', error));
        }
    }

    // POST /api/alcohol/producers - Создать нового производителя
    async create(req, res, next) {
        try {
            if (!req.body.name || !req.body.country || !req.body.foundedYear) {
                return next(createError(400, 'Название, страна и год основания обязательны'));
            }

            if (typeof req.body.foundedYear !== 'number' || req.body.foundedYear < 1000) {
                return next(createError(400, 'Год основания должен быть числом не менее 1000'));
            }

            const newProducer = await this.service.create(req.body);
            res.status(201).json({
                success: true,
                data: newProducer,
                message: 'Производитель создан'
            });
        } catch (error) {
            next(createError(500, 'Ошибка создания производителя', error));
        }
    }

    // PUT /api/alcohol/producers/:id - Обновить производителя
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedProducer = await this.service.update(id, req.body);

            if (!updatedProducer) {
                return next(createError(404, 'Производитель не найден'));
            }

            res.json({
                success: true,
                data: updatedProducer,
                message: 'Производитель обновлен'
            });
        } catch (error) {
            next(createError(500, 'Ошибка обновления производителя', error));
        }
    }

    // DELETE /api/alcohol/producers/:id - Удалить производителя
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const isDeleted = await this.service.delete(id);

            if (!isDeleted) {
                return next(createError(404, 'Производитель не найден'));
            }

            res.json({
                success: true,
                message: 'Производитель удален'
            });
        } catch (error) {
            next(createError(500, 'Ошибка удаления производителя', error));
        }
    }

    // GET /api/alcohol/producers/country/:country - Получить производителей по стране
    async getByCountry(req, res, next) {
        try {
            const { country } = req.params;
            const producers = await this.service.findByCountry(country);

            res.json({
                success: true,
                data: producers,
                total: producers.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить производителей по стране', error));
        }
    }

    // GET /api/alcohol/producers/active - Получить активных производителей
    async getActive(req, res, next) {
        try {
            const producers = await this.service.findActive();

            res.json({
                success: true,
                data: producers,
                total: producers.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить активных производителей', error));
        }
    }

    // GET /api/alcohol/producers/rating - Получить производителей по рейтингу
    async getByRating(req, res, next) {
        try {
            const { minRating } = req.query;

            if (!minRating) {
                return next(createError(400, 'Параметр minRating обязателен'));
            }

            const producers = await this.service.findByRating(parseFloat(minRating));

            res.json({
                success: true,
                data: producers,
                total: producers.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить производителей по рейтингу', error));
        }
    }

    // GET /api/alcohol/producers/brand/:brand - Получить производителей по бренду
    async getByBrand(req, res, next) {
        try {
            const { brand } = req.params;
            const producers = await this.service.findByBrand(brand);

            res.json({
                success: true,
                data: producers,
                total: producers.length
            });
        } catch (error) {
            next(createError(500, 'Не удалось получить производителей по бренду', error));
        }
    }
}

module.exports = ProducersController;