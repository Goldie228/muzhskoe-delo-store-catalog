const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API производителей', () => {
    let app;

    beforeAll(() => {
        app = new App();
        app.use(bodyParser());
        app.setErrorHandler(errorHandler());
        require('../routes/producers.routes.js')(app);
    });

    describe('GET /api/alcohol/producers', () => {
        test('должен возвращать массив производителей', async () => {
            const res = await request(app).get('/api/alcohol/producers').expect(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/alcohol/producers/:id', () => {
        test('должен возвращать производителя по ID', async () => {
            const res = await request(app).get('/api/alcohol/producers/prod_001').expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe('prod_001');
        });

        test('должен возвращать 404 для несуществующего ID', async () => {
            const res = await request(app).get('/api/alcohol/producers/nonexistent').expect(404);
            expect(res.body.error).toBe(true);
        });
    });

    describe('POST /api/alcohol/producers', () => {
        test('должен создавать нового производителя', async () => {
            const newProducer = {
                name: 'Тестовый производитель',
                country: 'Россия',
                foundedYear: 2020,
                rating: 5,
                isActive: true,
                brands: ['Тестовый бренд'],
                awards: ['Тестовая награда']
            };

            const res = await request(app)
                .post('/api/alcohol/producers')
                .send(newProducer)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Тестовый производитель');
            expect(res.body.data.id).toBeDefined();
        });

        test('должен возвращать 400 при отсутствии обязательных полей', async () => {
            const incompleteProducer = {
                name: 'Неполный производитель'
            };

            const res = await request(app)
                .post('/api/alcohol/producers')
                .send(incompleteProducer)
                .expect(400);

            expect(res.body.error).toBe(true);
        });
    });
});