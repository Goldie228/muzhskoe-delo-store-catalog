
const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API Блюд (Food Service)', () => {
  let app;

  beforeAll(() => {
    app = new App();
    app.use(bodyParser());
    app.use(errorHandler());
    
    // Регистрируем маршруты
    require('../routes/dishes.routes.js')(app);
  });

  describe('GET /api/food', () => {
    test('должен возвращать список блюд', async () => {
      const response = await request(app)
        .get('/api/food')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/food', () => {
    test('должен создавать новое блюдо', async () => {
      const newDish = {
        name: 'Тестовое блюдо',
        price: 100,
        inStock: true,
        ingredients: ['тест']
      };

      const response = await request(app)
        .post('/api/food')
        .send(newDish)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newDish.name);
    });

    test('должен возвращать 400 при отсутствии названия', async () => {
      const invalidDish = { price: 100 };

      const response = await request(app)
        .post('/api/food')
        .send(invalidDish);
        
      expect([400, 500].includes(response.status)).toBe(true);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('GET /api/food/search/price', () => {
    test('должен фильтровать по цене', async () => {
      const response = await request(app)
        .get('/api/food/search/price?min=100&max=1000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
