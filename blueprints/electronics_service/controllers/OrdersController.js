
const OrdersService = require('../services/OrdersService');

class OrdersController {
    constructor() {
        this.service = new OrdersService();
    }

    async getAllOrders(req, res) {
        try {
            const orders = await this.service.getAllOrders();
            res.json({
                success: true,
                data: orders,
                count: orders.length,
                message: 'Заказы успешно получены'
            });
        } catch (error) {
            console.error('Ошибка в getAllOrders:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении заказов',
                error: error.message
            });
        }
    }

    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await this.service.getOrderById(id);
            
            res.json({
                success: true,
                data: order,
                message: 'Заказ успешно получен'
            });
        } catch (error) {
            console.error('Ошибка в getOrderById:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при получении заказа',
                    error: error.message
                });
            }
        }
    }

    async createOrder(req, res) {
        try {
            const orderData = req.body;
            
            if (!orderData.customerName || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать имя клиента и хотя бы один товар в заказе'
                });
            }
            
            if (!orderData.totalAmount) {
                orderData.totalAmount = orderData.items.reduce((sum, item) => {
                    return sum + (item.price || 0) * (item.quantity || 1);
                }, 0);
            }
            
            const newOrder = await this.service.createOrder(orderData);
            
            res.status(201).json({
                success: true,
                data: newOrder,
                message: 'Заказ успешно создан'
            });
        } catch (error) {
            console.error('Ошибка в createOrder:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании заказа',
                error: error.message
            });
        }
    }

    async updateOrder(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            if (updateData.orderNumber || updateData.orderDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Номер заказа и дата создания не могут быть изменены'
                });
            }
            
            const updatedOrder = await this.service.updateOrder(id, updateData);
            
            res.json({
                success: true,
                data: updatedOrder,
                message: 'Заказ успешно обновлен'
            });
        } catch (error) {
            console.error('Ошибка в updateOrder:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при обновлении заказа',
                    error: error.message
                });
            }
        }
    }

    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            await this.service.deleteOrder(id);
            
            res.json({
                success: true,
                message: 'Заказ успешно удален'
            });
        } catch (error) {
            console.error('Ошибка в deleteOrder:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при удалении заказа',
                    error: error.message
                });
            }
        }
    }

    async getOrdersByStatus(req, res) {
        try {
            const { status } = req.params;
            const orders = await this.service.getOrdersByStatus(status);
            
            res.json({
                success: true,
                data: orders,
                count: orders.length,
                message: `Заказы со статусом "${status}" успешно получены`
            });
        } catch (error) {
            console.error('Ошибка в getOrdersByStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении заказов по статусу',
                error: error.message
            });
        }
    }

    async getOrdersByCustomer(req, res) {
        try {
            const { customerName } = req.params;
            const orders = await this.service.getOrdersByCustomer(customerName);
            
            res.json({
                success: true,
                data: orders,
                count: orders.length,
                message: `Заказы клиента "${customerName}" успешно получены`
            });
        } catch (error) {
            console.error('Ошибка в getOrdersByCustomer:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении заказов по клиенту',
                error: error.message
            });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать новый статус'
                });
            }
            
            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Недопустимый статус. Допустимые значения: ${validStatuses.join(', ')}`
                });
            }
            
            const updatedOrder = await this.service.updateOrderStatus(id, status);
            
            res.json({
                success: true,
                data: updatedOrder,
                message: 'Статус заказа успешно обновлен'
            });
        } catch (error) {
            console.error('Ошибка в updateOrderStatus:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при обновлении статуса заказа',
                    error: error.message
                });
            }
        }
    }
}

module.exports = OrdersController;