
/*
 * Конфигурация Jest для тестирования проекта
 */
module.exports = {
  // Окружение
  testEnvironment: 'node',

  // Шаблоны для поиска тестов
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Сбор покрытия
  collectCoverageFrom: [
    'core/**/*.js',
    'lib/**/*.js',
    'blueprints/**/*.js',
    'server.js',
    // Исключаем фронтенд
    '!**/public/**',
    '!**/node_modules/**'
  ],

  // Директория отчетов
  coverageDirectory: 'coverage',

  // Форматы отчетов
  coverageReporters: ['text', 'lcov', 'html'],

  // Игнорируемые пути
  testPathIgnorePatterns: [
    '/node_modules/',
    '/blueprints/template/'
  ],

  // Файлы setup/teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globalTeardown: '<rootDir>/tests/teardown.js',

  // --- НАСТРОЙКА BABEL ---
  transform: {
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest'
  },

  // Игнорируем папку с фронтендом (без Regex, просто путь)
  transformIgnorePatterns: [
    '<rootDir>/public/assets'
  ]
};
