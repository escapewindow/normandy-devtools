/* eslint-env node */
module.exports = {
  globals: {
    browser: {
      experiments: {},
      identity: {},
      networkStatus: {},
    },
  },
  setupFiles: ["<rootDir>/tests/jest.setup.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest-env.setup.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^devtools/(.*)$": "<rootDir>/extension/content/$1",
    "\\.(less|css)$": "identity-obj-proxy",
  },
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/extension/content/**/*.{js,ts,tsx}"],
};
