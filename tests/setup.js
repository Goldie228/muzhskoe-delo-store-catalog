// Глобальная настройка для всех тестов
process.env.NODE_ENV = 'test';

// Увеличиваем таймауты для тестов
jest.setTimeout(10000);

// Мокаем только конкретные методы, не весь console
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Восстанавливаем после всех тестов (на случай, если jest не делает это автоматически)
afterAll(() => {
  console.log.mockRestore && console.log.mockRestore();
  console.warn.mockRestore && console.warn.mockRestore();
  console.error.mockRestore && console.error.mockRestore();
});
