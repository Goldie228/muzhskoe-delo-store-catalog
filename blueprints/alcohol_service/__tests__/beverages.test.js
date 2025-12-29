
const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API напитков', () => {
    let app;

    beforeAll(() => {
        app = new App();
        app.use(bodyParser());
        app.setErrorHandler(errorHandler());
        require('../routes/beverages.routes.js')(app);
    });

    describe('GET /api/alcohol/beverages', () => {
        test('должен возвращать массив напитков', async () => {
            const res = await request(app).get('/api/alcohol/beverages').expect(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/alcohol/beverages/:id', () => {
        test('должен возвращать напиток по ID', async () => {
            // 1. Сначала создаем напиток с ID bev_001
            const newBeverage = {
                id: 'bev_001', // Хардкодим ID для теста
                name: 'Тестовый напиток ID',
                type: 'тест',
                price: 100,
                volume: 0.7,
                strength: 40,
                inStock: true,
                ingredients: ['вода', 'спирт'],
                tags: ['тест']
            };
            
            await request(app)
                .post('/api/alcohol/beverages')
                .send(newBeverage)
                .expect(201);

            // 2. Теперь проверяем GET по этому ID
            const res = await request(app)
                .get('/api/alcohol/beverages/bev_001')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe('bev_001');
            expect(res.body.data.name).toBe('Тестовый напиток ID');
        });
    });

    describe('POST /api/alcohol/beverages', () => {
        test('должен создавать новый напиток', async () => {
            const newBeverage = {
                name: 'Тестовый напиток',
                type: 'водка',
                price: 999,
                strength: 40,
                volume: 500,
                inStock: true,
                ingredients: ['вода', 'спирт'],
                tags: ['тест']
            };

            const res = await request(app)
                .post('/api/alcohol/beverages')
                .send(newBeverage)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Тестовый напиток');
            expect(res.body.data.id).toBeDefined();
        });

        test('должен возвращать 400 при отсутствии обязательных полей', async () => {
            const incompleteBeverage = {
                name: 'Неполный напиток'
            };

            const res = await request(app)
                .post('/api/alcohol/beverages')
                .send(incompleteBeverage)
                .expect(400);

            expect(res.body.error).toBe(true);
        });
    });
});
