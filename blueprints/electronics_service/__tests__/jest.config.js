
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    testMatch: [
        '**/__tests__/**/*.test.js'
    ],
    setupFilesAfterEnv: [],
    testTimeout: 10000
};