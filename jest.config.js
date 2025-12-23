/*
 * Конфигурация Jest для тестирования проекта
 */
module.exports = {
  // Окружение выполнения тестов
  testEnvironment: 'node',
  
  // Шаблоны для поиска тестовых файлов
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Файлы для анализа покрытия кода
  collectCoverageFrom: [
    'core/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**'
  ],
  
  // Директория для сохранения отчетов о покрытии
  coverageDirectory: 'coverage',
  
  // Форматы отчетов о покрытии
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Игнорируемые пути при поиске тестов
  testPathIgnorePatterns: [
    '/node_modules/',
    '/blueprints/template/'
  ],
  
  // Файл, выполняемый перед каждым тестом
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Файл, выполняемый после всех тестов
  globalTeardown: '<rootDir>/tests/teardown.js'
};
