module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    setupFilesAfterEnv: ['./tests/setup.js'],
    modulePathIgnorePatterns: ['./tests/dev/']
};
