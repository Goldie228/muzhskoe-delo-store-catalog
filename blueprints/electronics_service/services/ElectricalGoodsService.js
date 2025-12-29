
const path = require('path');
const { fileManager } = require('../../../lib/fileManager');

class ElectricalGoodsService {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/electrical_goods.json');
        this.initializeData();
    }

    async initializeData() {
        try {
            const exists = await fileManager.fileExists(this.dataFile);
            if (!exists) {
                // Создаем пустой массив, если файла нет
                await fileManager.writeJSON(this.dataFile, []);
                console.log('Файл данных для товаров создан');
            }
        } catch (error) {
            console.error('Ошибка при инициализации данных товаров:', error);
        }
    }

    async getAllGoods() {
        try {
            // Используем правильный метод readJSON
            const data = await fileManager.readJSON(this.dataFile);
            return data;
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            throw new Error('Не удалось получить список товаров');
        }
    }

    async getGoodById(id) {
        try {
            const data = await fileManager.readJSON(this.dataFile);
            const good = data.find(item => item.id === id);
            
            if (!good) {
                throw new Error(`Товар с ID ${id} не найден`);
            }
            
            return good;
        } catch (error) {
            console.error(`Ошибка при получении товара с ID ${id}:`, error);
            throw error;
        }
    }

    async createGood(goodData) {
        try {
            const goods = await fileManager.readJSON(this.dataFile);
            const newGood = {
                id: Date.now().toString(),
                ...goodData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            goods.push(newGood);
            await fileManager.writeJSON(this.dataFile, goods);
            
            return newGood;
        } catch (error) {
            console.error('Ошибка при создании товара:', error);
            throw new Error('Не удалось создать товар');
        }
    }

    async updateGood(id, updateData) {
        try {
            const goods = await fileManager.readJSON(this.dataFile);
            const index = goods.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Товар с ID ${id} не найден`);
            }
            
            const createdAt = goods[index].createdAt;
            goods[index] = {
                ...goods[index],
                ...updateData,
                id,
                createdAt,
                updatedAt: new Date().toISOString()
            };
            
            await fileManager.writeJSON(this.dataFile, goods);
            
            return goods[index];
        } catch (error) {
            console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
            throw error;
        }
    }

    async deleteGood(id) {
        try {
            const data = await fileManager.readJSON(this.dataFile);
            const index = data.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Товар с ID ${id} не найден`);
            }
            
            const deletedGood = data.splice(index, 1)[0];
            await fileManager.writeJSON(this.dataFile, data);
            
            return deletedGood;
        } catch (error) {
            console.error(`Ошибка при удалении товара с ID ${id}:`, error);
            throw error;
        }
    }

    async getGoodsByCategory(category) {
        try {
            const goods = await fileManager.readJSON(this.dataFile);
            return goods.filter(item => item.category === category);
        } catch (error) {
            console.error(`Ошибка при поиске товаров по категории ${category}:`, error);
            throw error;
        }
    }

    async getInStockGoods() {
        try {
            const goods = await fileManager.readJSON(this.dataFile);
            return goods.filter(item => item.isInStock === true);
        } catch (error) {
            console.error('Ошибка при получении товаров в наличии:', error);
            throw error;
        }
    }
}

module.exports = ElectricalGoodsService;
