
const http = require('http');
const App = require('../core/App');

describe('Класс App', () => {
  let app;

  beforeEach(() => {
    app = new App();
  });

  afterEach(() => {
    // Если App хранит состояние между тестами — очищаем
    if (Array.isArray(app.routes)) app.routes.length = 0;
    if (Array.isArray(app.middlewares)) app.middlewares.length = 0;
  });

  test('должен создавать экземпляр приложения', () => {
    expect(app).toBeInstanceOf(App);
    expect(Array.isArray(app.routes)).toBe(true);
    expect(Array.isArray(app.middlewares)).toBe(true);
  });

  test('должен регистрировать GET маршрут', () => {
    const handler = jest.fn();
    app.get('/test', handler);

    // Если routes публичен — проверяем содержимое
    if (Array.isArray(app.routes)) {
      expect(app.routes).toHaveLength(1);
      expect(app.routes[0]).toMatchObject({
        method: 'GET',
        path: '/test'
      });
      expect(typeof app.routes[0].handler).toBe('function');
    } else {
      // Иначе проверяем, что метод вернул this (чтобы убедиться, что регистрация не упала)
      expect(app.get('/test', handler)).toBe(app);
    }
  });

  test('должен поддерживать цепочку вызовов методов', () => {
    const result = app.get('/test', jest.fn()).post('/test', jest.fn());
    expect(result).toBe(app);
    if (Array.isArray(app.routes)) expect(app.routes).toHaveLength(2);
  });

  describe('Интеграция кастомного Error Handler', () => {
    test('должен вызывать кастомный обработчик при ошибке в роуте', async () => {
      const customHandler = jest.fn((err, req, res, next) => {
        // Наш кастомный хендлер использует response wrapper
        res.status(500).json({ custom: true, error: err.message });
      });

      app.setErrorHandler(customHandler);

      app.get('/fail', (req, res, next) => {
        next(new Error('Boom!'));
      });

      // Создаем моки, которые проходят проверку instanceof IncomingMessage/ServerResponse
      const mockReq = Object.create(http.IncomingMessage.prototype);
      mockReq.method = 'GET';
      mockReq.url = '/fail';
      mockReq.headers = {};
      
      const mockRes = Object.create(http.ServerResponse.prototype);
      
      // Мокаем методы ответа
      const endMock = jest.fn();
      const writeMock = jest.fn();
      const writeHeadMock = jest.fn();
      const setHeaderMock = jest.fn();
      const getHeaderMock = jest.fn();
      
      mockRes.end = endMock;
      mockRes.write = writeMock;
      mockRes.writeHead = writeHeadMock;
      mockRes.setHeader = setHeaderMock;
      mockRes.getHeader = getHeaderMock;
      
      // Эмуляция состояния сокета/потока
      Object.defineProperty(mockRes, 'writableEnded', { get: () => false });
      Object.defineProperty(mockRes, 'finished', { get: () => false });
      Object.defineProperty(mockRes, 'writable', { get: () => true });
      mockRes.statusCode = 200;

      await app._handleRequest(mockReq, mockRes);

      // Проверяем, что наш кастомный хендлер был вызван
      expect(customHandler).toHaveBeenCalled();
      // Проверяем, что статус код 500 был установлен
      expect(mockRes.statusCode).toBe(500);
      // Проверяем, что были попытки записи в ответ
      expect(setHeaderMock).toHaveBeenCalled();
    });
  });
});
