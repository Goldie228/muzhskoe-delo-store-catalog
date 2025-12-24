const path = require('path');
const fileManager = require('../../../lib/fileManager');

class ElectricalGoodsService {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/electrical_goods.json');
    }

    async getAllGoods() {
        try {
            const data = await fileManager.readFile(this.dataFile);
            return JSON.parse(data || '[]');
        } catch (error) {
            console.log('Ошибка чтения файла, возвращаю пустой массив');
            return [];  
        }
    }

    async getGoodById(id) {
        const goods = await this.getAllGoods();
        const good = goods.find(item => item.id === id);
        
        if (!good) {
            throw new Error(`Товар с ID ${id} не найден`);
        }
        
        return good;
    }

    async createGood(goodData) {
        const goods = await this.getAllGoods();
        const newGood = {
            id: Date.now().toString(),
            ...goodData,
            createdAt: new Date().toISOString()
        };
        
        goods.push(newGood);
        await fileManager.writeFile(this.dataFile, JSON.stringify(goods, null, 2));
        return newGood;
    }

    async updateGood(id, updateData) {
        const goods = await this.getAllGoods();
        const index = goods.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error(`Товар с ID ${id} не найден`);
        }
        
        goods[index] = { ...goods[index], ...updateData };
        await fileManager.writeFile(this.dataFile, JSON.stringify(goods, null, 2));
        return goods[index];
    }

    async deleteGood(id) {
        const goods = await this.getAllGoods();
        const index = goods.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error(`Товар с ID ${id} не найден`);
        }
        
        const deletedGood = goods.splice(index, 1)[0];
        await fileManager.writeFile(this.dataFile, JSON.stringify(goods, null, 2));
        return deletedGood;
    }

    async getGoodsByCategory(category) {
        const goods = await this.getAllGoods();
        return goods.filter(item => item.category === category);
    }

    async getInStockGoods() {
        const goods = await this.getAllGoods();
        return goods.filter(item => item.isInStock === true);
    }
}

module.exports = ElectricalGoodsService;