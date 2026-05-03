const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.ts', '!**/*.port.ts', '!**/index.ts'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@apa/shared$': path.resolve(__dirname, '../shared/src/index.ts'),
  },
};
