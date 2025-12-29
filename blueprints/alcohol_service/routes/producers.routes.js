module.exports = function(app) {
    const ProducersController = require('../controllers/ProducersController');
    const controller = new ProducersController();

    // Основные CRUD операции
    app.get('/api/alcohol/producers', controller.getAll.bind(controller));
    app.get('/api/alcohol/producers/:id', controller.getById.bind(controller));
    app.post('/api/alcohol/producers', controller.create.bind(controller));
    app.put('/api/alcohol/producers/:id', controller.update.bind(controller));
    app.delete('/api/alcohol/producers/:id', controller.delete.bind(controller));

    // Дополнительные маршруты для поиска
    app.get('/api/alcohol/producers/country/:country', controller.getByCountry.bind(controller));
    app.get('/api/alcohol/producers/active', controller.getActive.bind(controller));
    app.get('/api/alcohol/producers/rating', controller.getByRating.bind(controller));
    app.get('/api/alcohol/producers/brand/:brand', controller.getByBrand.bind(controller));
};