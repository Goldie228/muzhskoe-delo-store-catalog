
const ManufacturersController = require('../controllers/ManufacturersController');

module.exports = function(app) {
  const controller = new ManufacturersController();

  // Базовые CRUD операции
  app.get('/api/electronics/manufacturers', controller.getAllManufacturers.bind(controller));
  app.get('/api/electronics/manufacturers/:id', controller.getManufacturerById.bind(controller));
  app.post('/api/electronics/manufacturers', controller.createManufacturer.bind(controller));
  app.put('/api/electronics/manufacturers/:id', controller.updateManufacturer.bind(controller));
  app.delete('/api/electronics/manufacturers/:id', controller.deleteManufacturer.bind(controller));

  // Дополнительные маршруты
  // В твоем роуте был путь certified, а в контроллере getCertifiedManufacturers. Соединяем их.
  app.get('/api/electronics/manufacturers/certified', controller.getCertifiedManufacturers.bind(controller));
  
  // В контроллере есть метод getManufacturersByCountry, добавим маршрут, если его нет в твоем списке
  app.get('/api/electronics/manufacturers/country/:country', controller.getManufacturersByCountry.bind(controller));
};
