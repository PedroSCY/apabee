import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  collectCoverageFrom: ["**/*.ts", "!**/*.port.ts", "!**/index.ts"],
  coverageDirectory: "../coverage",
};

export default config;