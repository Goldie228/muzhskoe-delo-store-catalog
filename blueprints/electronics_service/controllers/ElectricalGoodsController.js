
const ElectricalGoodsService = require('../services/ElectricalGoodsService');

class ElectricalGoodsController {
    constructor() {
        this.service = new ElectricalGoodsService();
    }

    async getAllGoods(req, res) {
        try {
            const goods = await this.service.getAllGoods();
            res.json({
                success: true,
                data: goods,
                count: goods.length,
                message: 'Товары успешно получены'
            });
        } catch (error) {
            console.error('Ошибка в getAllGoods:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении товаров',
                error: error.message
            });
        }
    }

    async getGoodById(req, res) {
        try {
            const { id } = req.params;
            const good = await this.service.getGoodById(id);
            
            res.json({
                success: true,
                data: good,
                message: 'Товар успешно получен'
            });
        } catch (error) {
            console.error('Ошибка в getGoodById:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при получении товара',
                    error: error.message
                });
            }
        }
    }

    async createGood(req, res) {
        try {
            const goodData = req.body;
            
            if (!goodData.name || !goodData.category || !goodData.price) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать название, категорию и цену товара'
                });
            }
            
            const newGood = await this.service.createGood(goodData);
            
            res.status(201).json({
                success: true,
                data: newGood,
                message: 'Товар успешно создан'
            });
        } catch (error) {
            console.error('Ошибка в createGood:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании товара',
                error: error.message
            });
        }
    }

    async updateGood(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const updatedGood = await this.service.updateGood(id, updateData);
            
            res.json({
                success: true,
                data: updatedGood,
                message: 'Товар успешно обновлен'
            });
        } catch (error) {
            console.error('Ошибка в updateGood:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при обновлении товара',
                    error: error.message
                });
            }
        }
    }

    async deleteGood(req, res) {
        try {
            const { id } = req.params;
            await this.service.deleteGood(id);
            
            res.json({
                success: true,
                message: 'Товар успешно удален'
            });
        } catch (error) {
            console.error('Ошибка в deleteGood:', error);
            
            if (error.message.includes('не найден')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ошибка при удалении товара',
                    error: error.message
                });
            }
        }
    }

    async getGoodsByCategory(req, res) {
        try {
            const { category } = req.params;
            const goods = await this.service.getGoodsByCategory(category);
            
            res.json({
                success: true,
                data: goods,
                count: goods.length,
                message: `Товары категории "${category}" успешно получены`
            });
        } catch (error) {
            console.error('Ошибка в getGoodsByCategory:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении товаров по категории',
                error: error.message
            });
        }
    }

    async getInStockGoods(req, res) {
        try {
            const goods = await this.service.getInStockGoods();
            
            res.json({
                success: true,
                data: goods,
                count: goods.length,
                message: 'Товары в наличии успешно получены'
            });
        } catch (error) {
            console.error('Ошибка в getInStockGoods:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении товаров в наличии',
                error: error.message
            });
        }
    }
}

module.exports = ElectricalGoodsController;