
const ManufacturersService = require('../services/ManufacturersService');

class ManufacturersController {
    constructor() {
        this.service = new ManufacturersService();
    }

    async getAllManufacturers(req, res) {
        try {
            const manufacturers = await this.service.getAllManufacturers();
            res.json({
                success: true,
                data: manufacturers,
                count: manufacturers.length,
                message: 'Производители успешно получены'
            });
        } catch (error) {
            console.error('Ошибка в getAllManufacturers:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении производителей',
                error: error.message
            });
        }
    }

    async getManufacturerById(req, res) {
        try {
            const { id } = req.params;
            const manufacturer = await this.service.getManufacturerById(id);
            
            res.json({
                success: true,
                data: manufacturer,
                message: 'Производитель успешно получен'
            });
        } catch (error) {
            console.error('Ошибка в getManufacturerById:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при получении производителя',
                    error: error.message
                });
            }
        }
    }

    async createManufacturer(req, res) {
        try {
            const manufacturerData = req.body;
            
            if (!manufacturerData.name || !manufacturerData.country) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать название и страну производителя'
                });
            }
            
            const newManufacturer = await this.service.createManufacturer(manufacturerData);
            
            res.status(201).json({
                success: true,
                data: newManufacturer,
                message: 'Производитель успешно создан'
            });
        } catch (error) {
            console.error('Ошибка в createManufacturer:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании производителя',
                error: error.message
            });
        }
    }

    async updateManufacturer(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const updatedManufacturer = await this.service.updateManufacturer(id, updateData);
            
            res.json({
                success: true,
                data: updatedManufacturer,
                message: 'Производитель успешно обновлен'
            });
        } catch (error) {
            console.error('Ошибка в updateManufacturer:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при обновлении производителя',
                    error: error.message
                });
            }
        }
    }

    async deleteManufacturer(req, res) {
        try {
            const { id } = req.params;
            await this.service.deleteManufacturer(id);
            
            res.json({
                success: true,
                message: 'Производитель успешно удален'
            });
        } catch (error) {
            console.error('Ошибка в deleteManufacturer:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при удалении производителя',
                    error: error.message
                });
            }
        }
    }

    async getManufacturersByCountry(req, res) {
        try {
            const { country } = req.params;
            const manufacturers = await this.service.getManufacturersByCountry(country);
            
            res.json({
                success: true,
                data: manufacturers,
                count: manufacturers.length,
                message: `Производители из страны "${country}" успешно получены`
            });
        } catch (error) {
            console.error('Ошибка в getManufacturersByCountry:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении производителей по стране',
                error: error.message
            });
        }
    }

    async getCertifiedManufacturers(req, res) {
        try {
            const manufacturers = await this.service.getCertifiedManufacturers();
            
            res.json({
                success: true,
                data: manufacturers,
                count: manufacturers.length,
                message: 'Сертифицированные производители успешно получены'
            });
        } catch (error) {
            console.error('Ошибка в getCertifiedManufacturers:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении сертифицированных производителей',
                error: error.message
            });
        }
    }
}

module.exports = ManufacturersController;