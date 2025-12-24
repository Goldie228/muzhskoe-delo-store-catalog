const path = require('path');
const fileManager = require('../../../lib/fileManager');

class ElectricalGoodsService {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/electrical_goods.json');
        
        this.initializeData();
    }

    async initializeData() {
        try {
            const exists = await fileManager.fileExists(this.dataFile);
            if (!exists) {
                await fileManager.writeFile(this.dataFile, JSON.stringify([]));
                console.log('Файл данных для электротехнических товаров создан');
            }
        } catch (error) {
            console.error('Ошибка при инициализации данных:', error);
        }
    }

    // Получить все товары
    async getAllGoods() {
        try {
            const data = await fileManager.readFile(this.dataFile);
            return JSON.parse(data);
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            throw new Error('Не удалось получить список товаров');
        }
    }

    async getGoodById(id) {
        try {
            const goods = await this.getAllGoods();
            const good = goods.find(item => item.id === id);
            
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
            const goods = await this.getAllGoods();
            const newGood = {
                id: Date.now().toString(), 
                ...goodData,
                createdAt: new Date().toISOString()
            };
            
            goods.push(newGood);
            await fileManager.writeFile(this.dataFile, JSON.stringify(goods, null, 2));
            
            return newGood;
        } catch (error) {
            console.error('Ошибка при создании товара:', error);
            throw new Error('Не удалось создать товар');
        }
    }

    async updateGood(id, updateData) {
        try {
            const goods = await this.getAllGoods();
            const index = goods.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Товар с ID ${id} не найден`);
            }
            
            const createdAt = goods[index].createdAt;
            goods[index] = {
                ...goods[index],
                ...updateData,
                id, 
                createdAt 
            };
            
            await fileManager.writeFile(this.dataFile, JSON.stringify(goods, null, 2));
            
            return goods[index];
        } catch (error) {
            console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
            throw error;
        }
    }

    async deleteGood(id) {
        try {
            const goods = await this.getAllGoods();
            const index = goods.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Товар с ID ${id} не найден`);
            }
            
            const deletedGood = goods.splice(index, 1)[0];
            await fileManager.writeFile(this.dataFile, JSON.stringify(goods, null, 2));
            
            return deletedGood;
        } catch (error) {
            console.error(`Ошибка при удалении товара с ID ${id}:`, error);
            throw error;
        }
    }

    async getGoodsByCategory(category) {
        try {
            const goods = await this.getAllGoods();
            return goods.filter(item => 
                item.category.toLowerCase() === category.toLowerCase()
            );
        } catch (error) {
            console.error(`Ошибка при поиске товаров по категории ${category}:`, error);
            throw error;
        }
    }

    async getInStockGoods() {
        try {
            const goods = await this.getAllGoods();
            return goods.filter(item => item.isInStock === true);
        } catch (error) {
            console.error('Ошибка при получении товаров в наличии:', error);
            throw error;
        }
    }
}

module.exports = ElectricalGoodsService;
