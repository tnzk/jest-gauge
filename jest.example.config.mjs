export default {
  roots: ['examples'],
  verbose: true,
  moduleFileExtensions: ['js', 'spec',],
  testMatch: ['**/examples/*.spec'],
  transform: {
    "^.+\\.spec?$": [ "./dist/index.cjs", { debug: false } ]
  }
};
