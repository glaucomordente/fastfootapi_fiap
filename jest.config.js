module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Tests are co-located with source files
  moduleNameMapper: {
    // No path aliases like @/ are currently used, so this can be simple
    // If you add aliases to tsconfig.json, add them here too.
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8", // or "babel"
  // Optional: Add testMatch if your files don't follow the default pattern
  // testMatch: [
  //   "**/__tests__/**/*.+(ts|tsx|js)",
  //   "**/?(*.)+(spec|test).+(ts|tsx|js)"
  // ],
};
