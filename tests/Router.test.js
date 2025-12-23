
const Router = require('../core/Router');

describe('Router', () => {
  let router;

  beforeEach(() => {
    router = new Router();
  });

  describe('Проверка соответствия путей', () => {
    test('должен соответствовать точному пути', () => {
      const handler = jest.fn();
      router.register('GET', '/users', handler);

      const result = router.find('GET', '/users');
      expect(result).not.toBeNull();
      expect(result.handler).toBe(handler);
    });

    test('должен извлекать параметры маршрута', () => {
      router.register('GET', '/users/:id', jest.fn());

      const result = router.find('GET', '/users/123');
      expect(result).not.toBeNull();
      expect(result.params).toEqual({ id: '123' });
    });

    test('должен парсить строку запроса', () => {
      router.register('GET', '/search', jest.fn());

      const result = router.find('GET', '/search?q=test&page=1');
      expect(result).not.toBeNull();
      expect(result.query).toEqual({ q: 'test', page: '1' });
    });

    test('должен вернуть null для несоответствующего метода', () => {
      router.register('GET', '/users', jest.fn());
      const result = router.find('POST', '/users');
      expect(result).toBeNull();
    });

    test('должен парсить несколько параметров и декодировать их', () => {
      router.register('GET', '/org/:orgId/user/:userId', jest.fn());
      const result = router.find('GET', '/org/acme%20inc/user/u-42');
      expect(result).not.toBeNull();
      expect(result.params).toEqual({ orgId: 'acme inc', userId: 'u-42' });
    });

    test('должен предпочитать точный маршрут параметризованному, когда оба зарегистрированы', () => {
      const exact = jest.fn();
      const param = jest.fn();
      router.register('GET', '/items/special', exact);
      router.register('GET', '/items/:id', param);

      const r1 = router.find('GET', '/items/special');
      expect(r1).not.toBeNull();
      expect(r1.handler).toBe(exact);

      const r2 = router.find('GET', '/items/123');
      expect(r2).not.toBeNull();
      expect(r2.handler).toBe(param);
    });
  });
});
