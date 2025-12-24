const request = require('supertest');
const { createApp } = require('../../../core/App');
const path = require('path');

describe('Electronics API Integration Tests', () => {
    let app;
    let server;

    beforeAll(async () => {
        app = createApp();
        
        const electronicsRoutes = require('../routes/index');
        app.use(electronicsRoutes);
        
        server = app.listen(3001);
    });

    afterAll((done) => {
        server.close(done);
    });

    describe('GET /api/electronics/health', () => {
        test('должен возвращать статус работоспособности модуля', async () => {
            const response = await request(app)
                .get('/api/electronics/health')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('работает корректно');
        });
    });

    describe('GET /api/electronics/info', () => {
        test('должен возвращать информацию о модуле', async () => {
            const response = await request(app)
                .get('/api/electronics/info')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.module).toBe('electronics_service');
            expect(response.body.description).toContain('электротехнических товаров');
            expect(response.body.endpoints).toBeInstanceOf(Array);
        });
    });

    describe('CRUD операции для товаров', () => {
        let createdGoodId;

        test('POST /api/electronics/goods должен создавать новый товар', async () => {
            const newGood = {
                name: 'Интеграционная тестовая розетка',
                category: 'розетки',
                price: 299.99,
                voltage: 250,
                current: 16,
                isInStock: true,
                specifications: ['тест', 'интеграция']
            };

            const response = await request(app)
                .post('/api/electronics/goods')
                .send(newGood)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(newGood.name);
            expect(response.body.data.id).toBeDefined();
            createdGoodId = response.body.data.id;
        });

        test('GET /api/electronics/goods должен возвращать список товаров', async () => {
            const response = await request(app)
                .get('/api/electronics/goods')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.count).toBeGreaterThan(0);
        });

        test('GET /api/electronics/goods/:id должен возвращать товар по ID', async () => {
            const response = await request(app)
                .get(`/api/electronics/goods/${createdGoodId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(createdGoodId);
        });

        test('PUT /api/electronics/goods/:id должен обновлять товар', async () => {
            const updateData = {
                name: 'Обновленная интеграционная розетка',
                price: 349.99
            };

            const response = await request(app)
                .put(`/api/electronics/goods/${createdGoodId}`)
                .send(updateData)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.price).toBe(updateData.price);
        });

        test('DELETE /api/electronics/goods/:id должен удалять товар', async () => {
            const response = await request(app)
                .delete(`/api/electronics/goods/${createdGoodId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('GET /api/electronics/goods/:id должен возвращать 404 после удаления', async () => {
            await request(app)
                .get(`/api/electronics/goods/${createdGoodId}`)
                .expect('Content-Type', /json/)
                .expect(404);
        });
    });

    describe('Специальные маршруты', () => {
        test('GET /api/electronics/goods/category/розетки должен возвращать товары категории', async () => {
            const response = await request(app)
                .get('/api/electronics/goods/category/розетки')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });

        test('GET /api/electronics/goods/instock должен возвращать товары в наличии', async () => {
            const response = await request(app)
                .get('/api/electronics/goods/instock')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });
    });
});