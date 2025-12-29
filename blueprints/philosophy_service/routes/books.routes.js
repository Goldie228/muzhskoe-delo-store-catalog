module.exports = function(app) {
  const BooksController = require('../controllers/BooksController');
  const controller = new BooksController();
  
  // Базовые CRUD операции
  app.get('/api/philosophy/books', controller.getAll.bind(controller));
  app.get('/api/philosophy/books/:id', controller.getById.bind(controller));
  app.post('/api/philosophy/books', controller.create.bind(controller));
  app.put('/api/philosophy/books/:id', controller.update.bind(controller));
  app.delete('/api/philosophy/books/:id', controller.delete.bind(controller));
  
  // Дополнительные маршруты для поиска
  app.get('/api/philosophy/books/search/tag/:tag', controller.findByTag.bind(controller));
};