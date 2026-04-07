import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: {
        types: ['node', 'jest'],
        allowJs: true,
      },
    }],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!(uuid)@)',
  ],
  moduleNameMapper: {
    '^@saganet/db$': '<rootDir>/../../packages/db/src',
    '^@saganet/redis$': '<rootDir>/../../packages/redis/src',
    '^@saganet/kafka$': '<rootDir>/../../packages/kafka/src',
    '^@saganet/common$': '<rootDir>/../../packages/common/src',
    '^@saganet/observability$': '<rootDir>/../../packages/observability/src',
  },
};

export default config;
