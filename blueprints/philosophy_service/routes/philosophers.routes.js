module.exports = function(app) {
  const PhilosophersController = require('../controllers/PhilosophersController');
  const controller = new PhilosophersController();
  
  // Базовые CRUD операции
  app.get('/api/philosophy/philosophers', controller.getAll.bind(controller));
  app.get('/api/philosophy/philosophers/:id', controller.getById.bind(controller));
  app.post('/api/philosophy/philosophers', controller.create.bind(controller));
  app.put('/api/philosophy/philosophers/:id', controller.update.bind(controller));
  app.delete('/api/philosophy/philosophers/:id', controller.delete.bind(controller));
  
  // Дополнительные маршруты для поиска
  app.get('/api/philosophy/philosophers/search/school/:school', controller.findBySchool.bind(controller));
};