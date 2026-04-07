module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/../tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    '^@saganet/db$': '<rootDir>/../../../packages/db/src/index.ts',
    '^@saganet/kafka$': '<rootDir>/../../../packages/kafka/src/index.ts',
    '^@saganet/redis$': '<rootDir>/../../../packages/redis/src/index.ts',
    '^@saganet/storage$': '<rootDir>/../../../packages/storage/src/index.ts',
    '^@saganet/common$': '<rootDir>/../../../packages/common/src/index.ts',
    '^@saganet/observability$': '<rootDir>/../../../packages/observability/src/index.ts',
  },
  passWithNoTests: true,
};
