
const ElectricalGoodsService = require('../services/ElectricalGoodsService');
const fileManager = require('../../../lib/fileManager');
const path = require('path');

describe('ElectricalGoodsService', () => {
    let service;
    const testDataFile = path.join(__dirname, '../data/electrical_goods.test.json');

    beforeEach(async () => {
        const actualService = new ElectricalGoodsService();
        service = actualService;
        service.dataFile = testDataFile;
        
        await fileManager.writeFile(testDataFile, JSON.stringify([
            {
                id: 'test1',
                name: 'Тестовая розетка',
                category: 'розетки',
                price: 100,
                voltage: 220,
                current: 16,
                isInStock: true,
                specifications: ['тест1', 'тест2'],
                createdAt: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 'test2',
                name: 'Тестовый выключатель',
                category: 'выключатели',
                price: 50,
                voltage: 220,
                current: 10,
                isInStock: false,
                specifications: ['тест3'],
                createdAt: '2024-01-02T00:00:00.000Z'
            }
        ]));
    });

    afterEach(async () => {
        if (await fileManager.fileExists(testDataFile)) {
            await fileManager.deleteFile(testDataFile);
        }
    });

    test('getAllGoods должен возвращать все товары', async () => {
        const goods = await service.getAllGoods();
        expect(goods).toHaveLength(2);
        expect(goods[0].name).toBe('Тестовая розетка');
        expect(goods[1].name).toBe('Тестовый выключатель');
    });

    test('getGoodById должен возвращать товар по ID', async () => {
        const good = await service.getGoodById('test1');
        expect(good.id).toBe('test1');
        expect(good.name).toBe('Тестовая розетка');
    });

    test('getGoodById должен выбрасывать ошибку если товар не найден', async () => {
        await expect(service.getGoodById('nonexistent')).rejects.toThrow('не найден');
    });

    test('createGood должен создавать новый товар', async () => {
        const newGoodData = {
            name: 'Новый товар',
            category: 'провода',
            price: 75.5,
            voltage: 380,
            current: 25,
            isInStock: true,
            specifications: ['новый', 'качественный']
        };

        const createdGood = await service.createGood(newGoodData);
        expect(createdGood.name).toBe('Новый товар');
        expect(createdGood.id).toBeDefined();
        expect(createdGood.createdAt).toBeDefined();

        const allGoods = await service.getAllGoods();
        expect(allGoods).toHaveLength(3);
        expect(allGoods.find(g => g.name === 'Новый товар')).toBeDefined();
    });

    test('updateGood должен обновлять существующий товар', async () => {
        const updateData = {
            name: 'Обновленная розетка',
            price: 150
        };

        const updatedGood = await service.updateGood('test1', updateData);
        expect(updatedGood.name).toBe('Обновленная розетка');
        expect(updatedGood.price).toBe(150);
        expect(updatedGood.category).toBe('розетки');
        expect(updatedGood.id).toBe('test1');
        expect(updatedGood.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    test('updateGood должен выбрасывать ошибку если товар не найден', async () => {
        await expect(service.updateGood('nonexistent', { name: 'test' }))
            .rejects.toThrow('не найден');
    });

    test('deleteGood должен удалять товар', async () => {
        const deletedGood = await service.deleteGood('test1');
        expect(deletedGood.id).toBe('test1');

        const allGoods = await service.getAllGoods();
        expect(allGoods).toHaveLength(1);
        expect(allGoods.find(g => g.id === 'test1')).toBeUndefined();
    });

    test('deleteGood должен выбрасывать ошибку если товар не найден', async () => {
        await expect(service.deleteGood('nonexistent')).rejects.toThrow('не найден');
    });

    test('getGoodsByCategory должен возвращать товары указанной категории', async () => {
        const розетки = await service.getGoodsByCategory('розетки');
        expect(розетки).toHaveLength(1);
        expect(розетки[0].category).toBe('розетки');

        const выключатели = await service.getGoodsByCategory('выключатели');
        expect(выключатели).toHaveLength(1);
        expect(выключатели[0].category).toBe('выключатели');
    });

    test('getInStockGoods должен возвращать только товары в наличии', async () => {
        const inStockGoods = await service.getInStockGoods();
        expect(inStockGoods).toHaveLength(1);
        expect(inStockGoods[0].isInStock).toBe(true);
    });
});