
const path = require('path');
const { fileManager } = require('../../../lib/fileManager');

class OrdersService {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/orders.json');
        this.initializeData();
    }

    async initializeData() {
        try {
            const exists = await fileManager.fileExists(this.dataFile);
            if (!exists) {
                // Используем writeJSON
                await fileManager.writeJSON(this.dataFile, []);
                console.log('Файл данных для заказов создан');
            }
        } catch (error) {
            console.error('Ошибка при инициализации данных заказов:', error);
        }
    }

    async getAllOrders() {
        try {
            const data = await fileManager.readJSON(this.dataFile);
            return data;
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
            throw new Error('Не удалось получить список заказов');
        }
    }

    async getOrderById(id) {
        try {
            const orders = await fileManager.readJSON(this.dataFile);
            const order = orders.find(item => item.id === id);
            
            if (!order) {
                throw new Error(`Заказ с ID ${id} не найден`);
            }
            
            return order;
        } catch (error) {
            console.error(`Ошибка при получении заказа с ID ${id}:`, error);
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
            const orderNumber = 'ORD-' + Date.now().toString().slice(-8);
            const orders = await fileManager.readJSON(this.dataFile);
            
            const newOrder = {
                id: Date.now().toString(),
                orderNumber,
                ...orderData,
                orderDate: new Date().toISOString(),
                status: orderData.status || 'pending',
                updatedAt: new Date().toISOString()
            };
            
            orders.push(newOrder);
            
            // Используем writeJSON
            await fileManager.writeJSON(this.dataFile, orders);
            
            return newOrder;
        } catch (error) {
            console.error('Ошибка при создании заказа:', error);
            throw new Error('Не удалось создать заказ');
        }
    }

    async updateOrder(id, updateData) {
        try {
            const orders = await fileManager.readJSON(this.dataFile);
            const index = orders.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Заказ с ID ${id} не найден`);
            }
            
            const { orderNumber, orderDate } = orders[index];
            orders[index] = {
                ...orders[index],
                ...updateData,
                id,
                orderNumber, 
                orderDate,
                updatedAt: new Date().toISOString()
            };
            
            // Используем writeJSON
            await fileManager.writeJSON(this.dataFile, orders);
            
            return orders[index];
        } catch (error) {
            console.error(`Ошибка при обновлении заказа с ID ${id}:`, error);
            throw error;
        }
    }

    async deleteOrder(id) {
        try {
            const data = await fileManager.readJSON(this.dataFile);
            const index = data.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Заказ с ID ${id} не найден`);
            }
            
            const deletedOrder = data.splice(index, 1)[0];
            
            // Используем writeJSON
            await fileManager.writeJSON(this.dataFile, data);
            
            return deletedOrder;
        } catch (error) {
            console.error(`Ошибка при удалении заказа с ID ${id}:`, error);
            throw error;
        }
    }

    async getOrdersByStatus(status) {
        try {
            const orders = await fileManager.readJSON(this.dataFile);
            return orders.filter(item => 
                item.status.toLowerCase() === status.toLowerCase()
            );
        } catch (error) {
            console.error(`Ошибка при поиске заказов по статусу ${status}:`, error);
            throw error;
        }
    }

    async getOrdersByCustomer(customerName) {
        try {
            const orders = await fileManager.readJSON(this.dataFile);
            return orders.filter(item => 
                item.customerName.toLowerCase().includes(customerName.toLowerCase())
            );
        } catch (error) {
            console.error(`Ошибка при поиске заказов по клиенту ${customerName}:`, error);
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            return await this.updateOrder(id, { status });
        } catch (error) {
            console.error(`Ошибка при обновлении статуса заказа ${id}:`, error);
            throw error;
        }
    }
}

module.exports = OrdersService;
