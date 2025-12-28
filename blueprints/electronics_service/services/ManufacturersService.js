
const path = require('path');
const { fileManager } = require('../../../lib/fileManager');

class ManufacturersService {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/manufacturers.json');
        this.initializeData();
    }

    async initializeData() {
        try {
            const exists = await fileManager.fileExists(this.dataFile);
            if (!exists) {
                // Используем writeJSON (передаем массив, а не строку)
                await fileManager.writeJSON(this.dataFile, []);
                console.log('Файл данных для производителей создан');
            }
        } catch (error) {
            console.error('Ошибка при инициализации данных производителей:', error);
        }
    }

    async getAllManufacturers() {
        try {
            const data = await fileManager.readJSON(this.dataFile);
            return data; // readJSON уже возвращает массив
        } catch (error) {
            console.error('Ошибка при получении производителей:', error);
            throw new Error('Не удалось получить список производителей');
        }
    }

    async getManufacturerById(id) {
        try {
            const manufacturers = await fileManager.readJSON(this.dataFile);
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
            const manufacturers = await fileManager.readJSON(this.dataFile);
            const newManufacturer = {
                id: Date.now().toString(),
                ...manufacturerData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            manufacturers.push(newManufacturer);
            
            // Используем writeJSON
            await fileManager.writeJSON(this.dataFile, manufacturers);
            
            return newManufacturer;
        } catch (error) {
            console.error('Ошибка при создании производителя:', error);
            throw new Error('Не удалось создать производителя');
        }
    }

    async updateManufacturer(id, updateData) {
        try {
            const manufacturers = await fileManager.readJSON(this.dataFile);
            const index = manufacturers.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Производитель с ID ${id} не найден`);
            }
            
            const createdAt = manufacturers[index].createdAt;
            manufacturers[index] = {
                ...manufacturers[index],
                ...updateData,
                id,
                createdAt,
                updatedAt: new Date().toISOString()
            };
            
            // Используем writeJSON
            await fileManager.writeJSON(this.dataFile, manufacturers);
            
            return manufacturers[index];
        } catch (error) {
            console.error(`Ошибка при обновлении производителя с ID ${id}:`, error);
            throw error;
        }
    }

    async deleteManufacturer(id) {
        try {
            const data = await fileManager.readJSON(this.dataFile);
            const index = data.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error(`Производитель с ID ${id} не найден`);
            }
            
            const deletedManufacturer = data.splice(index, 1)[0];
            
            // Используем writeJSON
            await fileManager.writeJSON(this.dataFile, data);
            
            return deletedManufacturer;
        } catch (error) {
            console.error(`Ошибка при удалении производителя с ID ${id}:`, error);
            throw error;
        }
    }

    async getManufacturersByCountry(country) {
        try {
            const manufacturers = await fileManager.readJSON(this.dataFile);
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
            const manufacturers = await fileManager.readJSON(this.dataFile);
            return manufacturers.filter(item => item.isCertified === true);
        } catch (error) {
            console.error('Ошибка при получении сертифицированных производителей:', error);
            throw error;
        }
    }
}

module.exports = ManufacturersService;
