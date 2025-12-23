
const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API Блюд (Food Service)', () => {
  let app;

  beforeAll(() => {
    // Инициализация приложения
    app = new App();
    app.use(bodyParser());
    app.use(errorHandler());

    // Загрузка маршрутов модуля
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
      expect(response.body.total).toBeDefined();
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
      expect(response.body.data.id).toBeDefined();
    });

    test('должен возвращать 400 при отсутствии названия', async () => {
      const invalidDish = { price: 100 };

      const response = await request(app)
        .post('/api/food')
        .send(invalidDish)
        .expect(400);

      expect(response.body.error).toBe(true);
    });
  });

  describe('GET /api/food/search/price', () => {
    test('должен фильтровать по цене', async () => {
      const response = await request(app)
        .get('/api/food/search/price?min=100&max=1000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Проверка, что все результаты в диапазоне (если есть данные)
      if (response.body.data.length > 0) {
        response.body.data.forEach(dish => {
          expect(dish.price).toBeGreaterThanOrEqual(100);
          expect(dish.price).toBeLessThanOrEqual(1000);
        });
      }
    });
  });
});
