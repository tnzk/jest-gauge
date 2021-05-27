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

- [ ] Step parameters
- [ ] Table driven scenario
- [ ] Special Parameters
- [ ] Concepts
- [ ] Contexts
- [ ] Execution hooks
- [ ] Data Store
  - [x] ScenarioStore
  - [x] SpecStore
  - [ ] SuiteStore
- [ ] Taking Custom Screenshots (?)
- [x] Integration with Puppeteer or Taiko
- [x] Add unit tests
- [x] Use TypeScript

cf. https://docs.gauge.org/writing-specifications.html
