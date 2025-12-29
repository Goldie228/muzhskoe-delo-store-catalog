module.exports = function(app) {
    const BeveragesController = require('../controllers/BeveragesController');
    const controller = new BeveragesController();

    // Основные CRUD операции
    app.get('/api/alcohol/beverages', controller.getAll.bind(controller));
    app.get('/api/alcohol/beverages/:id', controller.getById.bind(controller));
    app.post('/api/alcohol/beverages', controller.create.bind(controller));
    app.put('/api/alcohol/beverages/:id', controller.update.bind(controller));
    app.delete('/api/alcohol/beverages/:id', controller.delete.bind(controller));

    // Дополнительные маршруты для поиска
    app.get('/api/alcohol/beverages/type/:type', controller.getByType.bind(controller));
    app.get('/api/alcohol/beverages/strength', controller.getByStrengthRange.bind(controller));
    app.get('/api/alcohol/beverages/instock', controller.getInStock.bind(controller));
    app.get('/api/alcohol/beverages/tag/:tag', controller.getByTag.bind(controller));
};