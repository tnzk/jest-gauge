export default {
  roots: ['test'],
  verbose: true,
  moduleFileExtensions: ['js', 'ts',],
  "transform": {
    "^.+\\.tsx?$": "esbuild-jest"
  }
};
