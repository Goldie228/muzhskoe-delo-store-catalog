
module.exports = function(app) {
  const DishesController = require('../controllers/DishesController');
  const controller = new DishesController();

  // Базовые CRUD операции для блюд
  app.get('/api/food', controller.getAll.bind(controller));
  app.get('/api/food/:id', controller.getById.bind(controller));
  app.post('/api/food', controller.create.bind(controller));
  app.put('/api/food/:id', controller.update.bind(controller));
  app.delete('/api/food/:id', controller.delete.bind(controller));

  // Дополнительный маршрут для поиска
  app.get('/api/food/search/price', controller.getByPriceRange.bind(controller));
};
