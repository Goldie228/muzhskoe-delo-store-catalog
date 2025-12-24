
const { Router } = require('express');
const OrdersController = require('../controllers/OrdersController');

const router = Router();
const controller = new OrdersController();

router.get('/orders', controller.getAllOrders.bind(controller));
router.get('/orders/:id', controller.getOrderById.bind(controller));
router.post('/orders', controller.createOrder.bind(controller));
router.put('/orders/:id', controller.updateOrder.bind(controller));
router.delete('/orders/:id', controller.deleteOrder.bind(controller));

router.get('/orders/status/:status', controller.getOrdersByStatus.bind(controller));
router.get('/orders/customer/:customerName', controller.getOrdersByCustomer.bind(controller));
router.patch('/orders/:id/status', controller.updateOrderStatus.bind(controller));

module.exports = router;