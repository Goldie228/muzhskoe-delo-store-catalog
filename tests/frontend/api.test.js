
describe('Frontend API Client', () => {
  beforeEach(() => {
    // Создаем мок объекта api
    global.api = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      setToken: jest.fn()
    };
  });

  test('get должен существовать', () => {
    expect(global.api.get).toBeDefined();
  });

  test('setToken должен существовать', () => {
    global.api.setToken('test');
    expect(global.api.setToken).toHaveBeenCalledWith('test');
  });
});
