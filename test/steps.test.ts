import { jest, test, expect, describe, beforeEach } from '@jest/globals'
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
      () => "test('another test with parameter called <name>', (name) => expect(0b10).toBe(2), 10000)",
    );
  expect(collectSteps('../foo/bar/example.spec')).toBe(
    "test('a test', () => expect(0x1).toBe(1) )\ntest('another test with parameter called <name>', (name) => expect(0b10).toBe(2), 10000)",
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

test('loads a step with a parameter after replacing it with a placeholder', () => {
  // @ts-ignore
  jest.spyOn(fs, "readdirSync").mockImplementation(() => ['step-1.js', 'step-2.js']);
  jest.spyOn(fs, "readFileSync")
    .mockImplementationOnce(() => "test('a test', () => expect(0x1).toBe(1) )")
    .mockImplementationOnce(() => "test('a test <name>', () => expect(0x1).toBe(1) )");
  const steps = loadSteps('../foo/bar/example.spec');
  expect(Object.keys(steps)).toContain('c59e6f2f60fb629fa11746542e4e64f344932550'); // $ echo -n "a test %1" | shasum
});

test('replaces placeholders with an actual simple parameter passed', () => {
  // @ts-ignore
  jest.spyOn(fs, "readdirSync").mockImplementation(() => ['step-1.js', 'step-2.js']);
  jest.spyOn(fs, "readFileSync")
    .mockImplementationOnce(() => "test('a test', () => expect(0x1).toBe(1) )")
    .mockImplementationOnce(
      () => "test('a test <name>', (name) => expect(name).toBe(\"admin\"), 10000)",
    );
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  expect(transformedSource).toContain('a test "Normad"')
});

test('transformes into syntactically correct JavaScript code', () => {
  // @ts-ignore
  jest.spyOn(fs, "readdirSync").mockImplementation(() => ['step-1.js', 'step-2.js']);
  jest.spyOn(fs, "readFileSync")
    .mockImplementationOnce(() => "test('a test', () => expect(0x1).toBe(1) )")
    .mockImplementationOnce(
      () => "test('a test <name>', (name) => expect(name).toBe(\"admin\"), 10000)",
    );
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  const sandboxedSource = `(() => { ${transformedSource} })`;
  const vm = require('vm');
  const context = vm.createContext();
  expect(vm.runInContext(sandboxedSource, context)).not.toThrow(new SyntaxError());
});

const specs = [
  {
    title: 'Title of An Acceptance Test',
    scenarios: [
      {
        title: 'Title of A Scenario',
        steps: ['a test', 'a test "Normad"'],
      },
    ],
    steps: ['a test', 'another test with parameter called "Stan"'],
  },
];
