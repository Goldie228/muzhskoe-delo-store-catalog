const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API Философов', () => {
  let app;
  
  beforeAll(() => {
    app = new App();
    app.use(bodyParser());
    app.use(errorHandler());
    
    // Загружаем маршруты нашего модуля
    require('../routes/philosophers.routes.js')(app);
  });

  describe('GET /api/philosophy/philosophers', () => {
    test('должен возвращать всех философов', async () => {
      const response = await request(app)
        .get('/api/philosophy/philosophers')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/philosophy/philosophers', () => {
    test('должен создавать нового философа', async () => {
      const newPhilosopher = {
        name: 'Фридрих Ницше',
        birthYear: 1844,
        isActive: false,
        dateOfDeath: '1900-08-25T00:00:00.000Z',
        schools: ['Нигилизм', 'Философия жизни']
      };

      const response = await request(app)
        .post('/api/philosophy/philosophers')
        .send(newPhilosopher)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newPhilosopher.name);
      expect(response.body.data.id).toBeDefined();
    });
  });
});