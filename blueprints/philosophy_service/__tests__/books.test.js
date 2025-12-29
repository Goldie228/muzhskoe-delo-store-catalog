const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API Книг по философии', () => {
  let app;
  
  beforeAll(() => {
    app = new App();
    app.use(bodyParser());
    app.use(errorHandler());
    
    // Загружаем маршруты нашего модуля
    require('../routes/books.routes.js')(app);
  });

  describe('GET /api/philosophy/books', () => {
    test('должен возвращать все книги', async () => {
      const response = await request(app)
        .get('/api/philosophy/books')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeDefined();
    });
  });

  describe('POST /api/philosophy/books', () => {
    test('должен создавать новую книгу', async () => {
      const newBook = {
        title: 'Так говорил Заратустра',
        price: 450.00,
        isAvailable: true,
        publishDate: '1883-01-01T00:00:00.000Z',
        tags: ['экзистенциализм', 'классика']
      };

      const response = await request(app)
        .post('/api/philosophy/books')
        .send(newBook)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newBook.title);
      expect(response.body.data.id).toBeDefined();
    });
  });
});