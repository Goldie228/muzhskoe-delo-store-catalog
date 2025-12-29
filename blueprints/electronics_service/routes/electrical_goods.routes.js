
const ElectricalGoodsController = require('../controllers/ElectricalGoodsController');

module.exports = function(app) {
  const controller = new ElectricalGoodsController();

  // Базовые CRUD операции
  app.get('/api/electronics/goods', controller.getAllGoods.bind(controller));
  app.get('/api/electronics/goods/:id', controller.getGoodById.bind(controller));
  app.post('/api/electronics/goods', controller.createGood.bind(controller));
  app.put('/api/electronics/goods/:id', controller.updateGood.bind(controller));
  app.delete('/api/electronics/goods/:id', controller.deleteGood.bind(controller));

  // Дополнительные маршруты
  app.get('/api/electronics/goods/category/:category', controller.getGoodsByCategory.bind(controller));
  app.get('/api/electronics/goods/instock', controller.getInStockGoods.bind(controller));
};
