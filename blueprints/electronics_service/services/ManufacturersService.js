
const path = require('path');
const fileManager = require('../../../lib/fileManager');

class ManufacturersService {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/manufacturers.json');
        this.initializeData();
    }

    async initializeData() {
        try {
            const exists = await fileManager.fileExists(this.dataFile);
            if (!exists) {
                await fileManager.writeFile(this.dataFile, JSON.stringify([]));
                console.log('Файл данных для производителей создан');
            }
        } catch (error) {
            console.error('Ошибка при инициализации данных производителей:', error);
        }
    }

    async getAllManufacturers() {
        try {
            const data = await fileManager.readFile(this.dataFile);
            return JSON.parse(data);
        } catch (error) {
            console.error('Ошибка при получении производителей:', error);
            throw new Error('Не удалось получить список производителей');
        }
    }

    async getManufacturerById(id) {
        try {
            const manufacturers = await this.getAllManufacturers();
            const manufacturer = manufacturers.find(item => item.id === id);
            
            if (!manufacturer) {
                throw new Error(`Производитель с ID ${id} не найден`);
            }
            
            return manufacturer;
        } catch (error) {
            console.error(`Ошибка при получении производителя с ID ${id}:`, error);
            throw error;
        }
    }

    async createManufacturer(manufacturerData) {
        try {
            const manufacturers = await this.getAllManufacturers();
            const newManufacturer = {
                id: Date.now().toString(),
                ...manufacturerData,
                createdAt: new Date().toISOString()
            };
            
            manufacturers.push(newManufacturer);
            await fileManager.writeFile(this.dataFile, JSON.stringify(manufacturers, null, 2));
            
            return newManufacturer;
        } catch (error) {
            console.error('Ошибка при создании производителя:', error);
            throw new Error('Не удалось создать производителя');
        }
    }

    async updateManufacturer(id, updateData) {
        try {
            const manufacturers = await this.getAllManufacturers();
            const index = manufacturers.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Производитель с ID ${id} не найден`);
            }
            
            const createdAt = manufacturers[index].createdAt;
            manufacturers[index] = {
                ...manufacturers[index],
                ...updateData,
                id,
                createdAt
            };
            
            await fileManager.writeFile(this.dataFile, JSON.stringify(manufacturers, null, 2));
            
            return manufacturers[index];
        } catch (error) {
            console.error(`Ошибка при обновлении производителя с ID ${id}:`, error);
            throw error;
        }
    }

    async deleteManufacturer(id) {
        try {
            const manufacturers = await this.getAllManufacturers();
            const index = manufacturers.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Производитель с ID ${id} не найден`);
            }
            
            const deletedManufacturer = manufacturers.splice(index, 1)[0];
            await fileManager.writeFile(this.dataFile, JSON.stringify(manufacturers, null, 2));
            
            return deletedManufacturer;
        } catch (error) {
            console.error(`Ошибка при удалении производителя с ID ${id}:`, error);
            throw error;
        }
    }

    async getManufacturersByCountry(country) {
        try {
            const manufacturers = await this.getAllManufacturers();
            return manufacturers.filter(item => 
                item.country.toLowerCase() === country.toLowerCase()
            );
        } catch (error) {
            console.error(`Ошибка при поиске производителей по стране ${country}:`, error);
            throw error;
        }
    }

    async getCertifiedManufacturers() {
        try {
            const manufacturers = await this.getAllManufacturers();
            return manufacturers.filter(item => item.isCertified === true);
        } catch (error) {
            console.error('Ошибка при получении сертифицированных производителей:', error);
            throw error;
        }
    }
}

module.exports = ManufacturersService;