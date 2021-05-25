import fs from 'fs';
import { loadSteps, buildTransformedSource, collectSteps } from '../src/steps'

jest.mock('fs');


beforeEach(() => {
  jest.resetModules();
});

test('loads steps in a directory adjacent to the spec file', () => {
  // TODO: apparently a test with internal implementation knowledge.
  // @ts-ignore
  //   Looks like encountering a landmine of TypeScript here:
  //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34889
  jest.spyOn(fs, "readdirSync").mockImplementation(() => ['step-1.js', 'step-2.js']);
  jest.spyOn(fs, "readFileSync")
    .mockImplementationOnce(() => "test('a test', () => expect(0x1).toBe(1) )")
    .mockImplementationOnce(
      () => "test('another test', () => expect(0b10).toBe(2), 10000)",
    );
  expect(collectSteps('../foo/bar/example.spec')).toBe(
    "test('a test', () => expect(0x1).toBe(1) )\ntest('another test', () => expect(0b10).toBe(2), 10000)",
  );
});

test('loads steps into an entry with a SHA1 key of its description', () => {
  // @ts-ignore
  jest.spyOn(fs, "readdirSync").mockImplementation(() => ['step-1.js', 'step-2.js']);
  jest.spyOn(fs, "readFileSync")
    .mockImplementationOnce(() => "test('a test', () => expect(0x1).toBe(1) )")
    .mockImplementationOnce(
      () => "test('another test', () => expect(0b10).toBe(2))",
    );
  const steps = loadSteps('../foo/bar/example.spec');
  expect(Object.keys(steps)).toContain('9939b05dd1a3763f5f856e065d277190d648994f'); // SHA1('a test')
  expect(Object.keys(steps)).toContain('afc8edc74ae9e7b8d290f945a6d613f1d264a2b2'); // SHA1('another test')
});

test('transformes into syntactically correct JavaScript code', () => {
  // @ts-ignore
  jest.spyOn(fs, "readdirSync").mockImplementation(() => ['step-1.js', 'step-2.js']);
  jest.spyOn(fs, "readFileSync")
    .mockImplementationOnce(() => "test('a test', () => expect(0x1).toBe(1) )")
    .mockImplementationOnce(
      () => "test('another test', () => expect(0b10).toBe(2))",
    );
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  const sandboxedSource = `(() => { consol${transformedSource} })`;
  const vm = require('vm');
  const context = vm.createContext();
  expect(vm.runInContext(sandboxedSource, context)).not.toThrow(SyntaxError);
});

const specs = [
  {
    title: 'Title of An Acceptance Test',
    scenarios: [
      {
        title: 'Title of A Scenario',
        steps: ['a test', 'another test'],
      },
    ],
    steps: ['a test', 'another test'],
  },
];
