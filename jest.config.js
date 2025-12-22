module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'core/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/blueprints/template/'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globalTeardown: '<rootDir>/tests/teardown.js'
};
