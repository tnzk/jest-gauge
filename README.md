:warning: **This is an experimental project in very early stage. Try out at your own risk**. Any form of contributions are warmly appreciated as long as you agree to publish the work under [BSD-3 license](./LICENSE).

# jest-gauge

Write executable acceptance tests (E2E tests) with Jest, in your mother tongue, just loosely structured in Markdown.

## Install and setup

Assuming you're already using [Jest](https://jestjs.io/) for unit testing.

Install via npm (yarn or other package manager, unconfirmed):

```bash
$ npm install --save-dev @tnzk/jest-gauge
```

Add `jest.config.gauge.js`:

```js
// export default { // Use this for mjs instead
module.exports = {
  roots: ['.'],
  verbose: true,
  moduleFileExtensions: ['js', 'spec', 'md'],
  testMatch: ['**/specs/*.spec', '**/specs/*.md'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    "^.+\\.(spec|md)?$": [ "./dist/index.cjs", { debug: false } ]
  }
};
```

(we highly recommend to have another config than `jest.config.js` since setup for unit tests and acceptance/E2E tests tend to largely differ).

## Your first acceptance test in Gauge-like Markdown

Put a spec at `$REPO_ROOT/specs/welcome.spec`:

```
# Specification for the Welcome page

Ordinary paragraphs are treated as comments, just ignored.

## Scenario: Users open the site and see the welcome page

* Open "https://duckduckgo.com/"
* The user sees a cute cucumber-looking white bird
```

Put steps in `$REPO_ROOT/specs/welcome/steps.js`

```
test("Open <url>", (url) => {
  expect(url).toBe('https://duckduckgo.com/');
});

test("The user sees a cute cucumber-looking white bird", () => {
  expect("https://duckduckgo.com/assets/logo_homepage.normal.v108.svg").toContain('duck');
});
```

Run tests:

```bash
$ npx jest --config=jest.config.gauge.js specs/
```

Then you'll see that it's nicely done:

```
 npx jest --config=jest.config.gauge.js specs/

 PASS  examples/welcome.spec
  Specification for the Welcome page
    Scenario: Users open the site and see the welcome page
      ✓ Open "https://duckduckgo.com/" (2 ms)
      ✓ The user sees a cute cucumber-looking white bird

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.913 s
```

# Background

I'm interested in [Gauge](https://docs.gauge.org) which looks a quite promising as an ATDD framework, however, it is a little too opinionated to integrate it with an existing project, especially if you have had a bunch of unit and E2E tests in Jest there.

So I've crafted a Jest extension which can recognize specification files (hopefully) compatible to of Gauge and execute steps you implemented in Jest vocabulary like test/expect among the others.

# TODO

- [ ] Spec
  - [x] Support `.md` extension
  - [ ] Support [manifest files](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#manifest-file)
  - [ ] Support [Env directory](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#env-directory)
  - [x] Support [data tables](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#table-driven-scenario)
  - [ ] Step alias
  - [x] Teardown steps
- [ ] Steps
  - [x] Simple parameters
  - [x] Dynamic parameters with data table
  - [ ] Dynamic parameters with Concept
  - [ ] Table parameters
  - [ ] Special parameters
    - [ ] File
    - [ ] Table
- [ ] Scenario
  - [x] [Table driven scenario](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#table-driven-scenario) (note that it is in experiment as of Gauge 1.0.3)
  - [ ] [Data-driven execution](https://docs.gauge.org/execution.html?os=macos&language=javascript&ide=vscode#data-driven-execution)- [ ] Concepts
- [x] Contexts
- [ ] Continue on Failure
- [ ] Execution
  - [ ] [Execution hooks](https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#execution-hooks)
  - [ ] Tag-based execution filtering
- [x] Data Store
  - [x] ScenarioStore
  - [x] SpecStore
  - [x] SuiteStore
- [ ] Taking Custom Screenshots (?)
- [ ] Examples
  - [ ] Puppeteer integration
  - [ ] Taiko integration
- [x] Add unit tests
- [x] Use TypeScript
- [ ] Jest integration
  - [x] Implement `getCacheKey`
  - [x] Debug options
  - [ ] Entirely skipped specs don't seem to be shown in test results, but why? It'd be nice if skipped specs are shown explicitly.
  - [x] Support `step` for a steps without any test cases
  - [ ] Support RawSourceMap; [`source-map`](https://github.com/mozilla/source-map/blob/0.6.1/source-map.d.ts#L6-L12)

cf. https://docs.gauge.org/writing-specifications.html

# 日本語版

まだありません :smiling_face_with_tear: