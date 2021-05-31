# jest-gauge

TODO

# Usage

TODO

```json:jest.config.js
module.exports = {
  roots: ['.'],
  moduleFileExtensions: ['js', 'spec'],
  testMatch: ['**/specs/*.spec'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '^.+\\.spec$': '@tnzk/jest-gauge',
  },
};
```

# TODO

- [ ] Spec
  - [ ] Support `.md` extension
  - [ ] Support [manifest files](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#manifest-file)
  - [ ] Support [Env directory](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#env-directory)
  - [ ] Suppor [data tables](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#table-driven-scenario)
  - [ ] Step alias
- [ ] Step parameters
  - [ ] Simple parameters
  - [ ] Dynamic parameters
  - [ ] Table parameters
  - [ ] Special parameters
    - [ ] File
    - [ ] Table
- [ ] Concepts
- [ ] Contexts
- [ ] Continue on Failure
- [ ] [Execution hooks](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#execution-hooks)
- [ ] Data Store
  - [x] ScenarioStore
  - [x] SpecStore
  - [ ] SuiteStore
- [ ] Taking Custom Screenshots (?)
- [x] Integration with Puppeteer or Taiko
- [x] Add unit tests
- [x] Use TypeScript
- [ ] Jest
  - [ ] Implement `getCacheKey`

cf. https://docs.gauge.org/writing-specifications.html
