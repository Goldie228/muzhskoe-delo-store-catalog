
module.exports = function(app) {
  const CategoriesController = require('../controllers/CategoriesController');
  const controller = new CategoriesController();

  // Базовые CRUD операции для категорий
  app.get('/api/categories', controller.getAll.bind(controller));
  app.get('/api/categories/:id', controller.getById.bind(controller));
  app.post('/api/categories', controller.create.bind(controller));
  app.put('/api/categories/:id', controller.update.bind(controller));
  app.delete('/api/categories/:id', controller.delete.bind(controller));

  // Дополнительный маршрут
  app.get('/api/categories/visible', controller.getVisible.bind(controller));
};
