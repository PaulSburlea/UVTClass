// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  rootDir: ".",
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  testMatch: [
    '<rootDir>/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/**/*.(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json"
    }
  },

  moduleNameMapper: {
    "^@/app/\\(dashboard\\)/\\(routes\\)/teacher/courses/\\[courseId\\]/_components/comment-box$":
      "<rootDir>/__mocks__/comment-box.tsx",
    '^@/(.*)$': '<rootDir>/$1',
    '^.+\\.(css|scss)$': '<rootDir>/__mocks__/fileMock.js',
    '^.+\\.(png|jpg|jpeg|gif)$': '<rootDir>/__mocks__/fileMock.js'
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  watchPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/']
};

export default config;
