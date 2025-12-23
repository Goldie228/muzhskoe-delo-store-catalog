
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
});
