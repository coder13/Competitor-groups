import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!@uidotdev/usehooks/)'],
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
};

export default config;
