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
  - [x] Support [data tables](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#table-driven-scenario)
  - [ ] Step alias
  - [x] Teardown steps
- [ ] Step parameters
  - [x] Simple parameters
  - [x] Dynamic parameters with data table
  - [ ] Dynamic parameters with Concept
  - [ ] Table parameters
  - [ ] Special parameters
    - [ ] File
    - [ ] Table
- [ ] Scenario
  - [ ] [Table driven scenario](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#table-driven-scenario) (note that it is in experiment as of Gauge 1.0.3)
- [ ] Concepts
- [x] Contexts
- [ ] Continue on Failure
- [ ] Execution
  - [ ] [Execution hooks](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#execution-hooks)
  - [ ] [Data-driven execution](https://docs.gauge.org/execution.html?os=macos&language=javascript&ide=vscode#data-driven-execution)
  - [ ] Tag-based execution filtering
- [ ] Data Store
  - [x] ScenarioStore
  - [x] SpecStore
  - [x] SuiteStore
- [ ] Taking Custom Screenshots (?)
- [ ] Examples
  - [ ] Puppeteer integration
  - [ ] Taiko integration
- [x] Add unit tests
- [x] Use TypeScript
- [ ] Jest
  - [ ] Implement `getCacheKey`
  - [ ] Debug options
  - [ ] Entirely skipped specs don't seem to be shown in test results, but why? It'd be nice if skipped specs are shown explicitly.
  - [ ] Support `step` for a steps without any test cases

cf. https://docs.gauge.org/writing-specifications.html
