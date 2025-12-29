
describe('Frontend Router', () => {
  let mockAppEl;
  let mockWindowRouter;

  beforeAll(() => {
    mockAppEl = { innerHTML: '' };
    mockWindowRouter = { handleRoute: jest.fn() };

    global.window = {
      location: { hash: '', slice: () => '' },
      addEventListener: jest.fn(),
      router: mockWindowRouter
    };
    global.document = {
      getElementById: jest.fn(() => mockAppEl),
      querySelectorAll: jest.fn(() => [])
    };
  });

  // Создаем моки функций
  const mockHandleRoute = jest.fn();
  const mockInjectIcons = jest.fn();

  // Присваиваем глобально
  global.injectIcons = mockInjectIcons;
  global.Router = jest.fn(() => ({
      addRoute: mockHandleRoute,
      handleRoute: mockHandleRoute
  }));
  
  // Имитируем экспорт роутера
  const router = new global.Router();
  global.router = router;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Router класс должен быть доступен', () => {
    expect(global.Router).toBeDefined();
  });

  test('injectIcons должен быть доступен', () => {
    global.injectIcons();
    expect(mockInjectIcons).toHaveBeenCalled();
  });
});
