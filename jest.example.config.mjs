export default {
  roots: ['examples'],
  verbose: true,
  moduleFileExtensions: ['js', 'spec', 'md'],
  testMatch: ['**/examples/*.spec', '**/examples/*.md'],
  transform: {
    "^.+\\.(spec|md)?$": [ "./dist/index.cjs", {
      debug: false,
      taiko: true,
    }],
  }
};
