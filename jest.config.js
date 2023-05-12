// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // collectCoverage: true,
  // coverageDirectory: 'coverage',
  // coverageProvider: 'v8',
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  verbose: true,
  bail: 1,
  errorOnDeprecated: true,
  clearMocks: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/testSetup.js'],
}

module.exports = createJestConfig(customJestConfig)
