
const OrdersController = require('../controllers/OrdersController');

module.exports = function(app) {
  const controller = new OrdersController();

  // Базовые CRUD операции
  app.get('/api/electronics/orders', controller.getAllOrders.bind(controller));
  app.get('/api/electronics/orders/:id', controller.getOrderById.bind(controller));
  app.post('/api/electronics/orders', controller.createOrder.bind(controller));
  app.put('/api/electronics/orders/:id', controller.updateOrder.bind(controller));
  app.delete('/api/electronics/orders/:id', controller.deleteOrder.bind(controller));

  // Дополнительные маршруты
  app.get('/api/electronics/orders/status/:status', controller.getOrdersByStatus.bind(controller));
  app.get('/api/electronics/orders/customer/:customerName', controller.getOrdersByCustomer.bind(controller));
  
  // Обновление статуса
  app.patch('/api/electronics/orders/:id/status', controller.updateOrderStatus.bind(controller));
};
