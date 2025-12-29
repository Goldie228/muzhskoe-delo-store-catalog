const { fileManager } = require('../../../lib/fileManager');

class BeveragesService {
    constructor() {
        this.dataFile = 'blueprints/alcohol_service/data/beverages.json';
    }

    async findAll() {
        return await fileManager.readJSON(this.dataFile);
    }

    async findById(id) {
        return await fileManager.findById(this.dataFile, id);
    }

    async create(beverageData) {
        if (!beverageData.name || !beverageData.price || !beverageData.type) {
            throw new Error('Название, цена и тип напитка обязательны');
        }
        return await fileManager.create(this.dataFile, beverageData);
    }

    async update(id, updateData) {
        const existing = await this.findById(id);
        if (!existing) return null;
        return await fileManager.update(this.dataFile, id, updateData);
    }

    async delete(id) {
        return await fileManager.delete(this.dataFile, id);
    }

    async findByType(type) {
        const beverages = await this.findAll();
        return beverages.filter(b => b.type.toLowerCase() === type.toLowerCase());
    }

    async findByStrengthRange(min, max) {
        const beverages = await this.findAll();
        return beverages.filter(b => b.strength >= min && b.strength <= max);
    }

    async findInStock() {
        const beverages = await this.findAll();
        return beverages.filter(b => b.inStock);
    }

    async findByTag(tag) {
        const beverages = await this.findAll();
        return beverages.filter(b => b.tags.includes(tag));
    }
}

module.exports = BeveragesService;