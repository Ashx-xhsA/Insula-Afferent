module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  globalSetup: './tests/setup.js',
  globalTeardown: './tests/teardown.js',
};
