
const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API Категорий (Food Service)', () => {
  let app;

  beforeAll(() => {
    app = new App();
    app.use(bodyParser());
    app.use(errorHandler());
    require('../routes/categories.routes.js')(app);
  });

  describe('GET /api/categories', () => {
    test('должен возвращать список категорий', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/categories', () => {
    test('должен создавать новую категорию', async () => {
      const newCategory = {
        title: 'Напитки',
        sortOrder: 10,
        isVisible: true,
        synonyms: ['вода', 'сок']
      };

      const response = await request(app)
        .post('/api/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newCategory.title);
    });
  });
});
