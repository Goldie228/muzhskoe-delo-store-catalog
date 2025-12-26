const { fileManager } = require('../../../lib/fileManager');

class ProducersService {
    constructor() {
        this.dataFile = 'blueprints/alcohol_service/data/producers.json';
    }

    async findAll() {
        return await fileManager.readJSON(this.dataFile);
    }

    async findById(id) {
        return await fileManager.findById(this.dataFile, id);
    }

    async create(producerData) {
        if (!producerData.name || !producerData.country || !producerData.foundedYear) {
            throw new Error('Название, страна и год основания обязательны');
        }
        return await fileManager.create(this.dataFile, producerData);
    }

    async update(id, updateData) {
        const existing = await this.findById(id);
        if (!existing) return null;
        return await fileManager.update(this.dataFile, id, updateData);
    }

    async delete(id) {
        return await fileManager.delete(this.dataFile, id);
    }

    async findByCountry(country) {
        const producers = await this.findAll();
        return producers.filter(p => p.country.toLowerCase() === country.toLowerCase());
    }

    async findActive() {
        const producers = await this.findAll();
        return producers.filter(p => p.isActive);
    }

    async findByRating(minRating) {
        const producers = await this.findAll();
        return producers.filter(p => p.rating >= minRating);
    }

    async findByBrand(brand) {
        const producers = await this.findAll();
        return producers.filter(p => p.brands.includes(brand));
    }
}

module.exports = ProducersService;