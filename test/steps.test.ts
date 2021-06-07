import { jest, test, expect, describe, beforeEach } from '@jest/globals'
import fs from 'fs';
import { loadSteps, buildTransformedSource, collectSteps } from '../src/steps'

jest.mock('fs');

beforeEach(() => {
  jest.resetModules();
});

const step1js = "test('a test', () => expect(0x1).toBe(1) )";
const step2js = `
test('another test with parameter called <name>', (name) => expect(0b10).toBe(2), 10000);
test('a prerequisite', () => expect(0b11).toBe(3), 10000);
test('a prerequisite with <param>', (param) => expect(param).toBe('Param'), 10000)
step('Teardown step 1', () => console.log("Teardown 1"))
step('Teardown step 2', () => console.log("Teardown 2"))`;
const setupMocksForTypicalStepsImpls = () => {
  // TODO: apparently a test with internal implementation knowledge.
  // @ts-ignore
  //   Looks like encountering a landmine of TypeScript here:
  //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34889
  jest.spyOn(fs, "readdirSync").mockImplementation(() => ['step-1.js', 'step-2.js']);
  jest.spyOn(fs, "readFileSync")
    .mockImplementationOnce(() => step1js)
    .mockImplementationOnce(() => step2js);
};

test('loads steps in a directory with the same basename adjacent to the spec file', () => {
  setupMocksForTypicalStepsImpls();
  expect(collectSteps('../foo/bar/example.spec')).toBe(step1js + "\n" + step2js);
});

test('is okay if no directory with the same basename adjacent to the spec file', () => {
  // @ts-ignore
  jest.spyOn(fs, "readdirSync").mockImplementation(() => { throw new Error('ENOENT') });
  expect(collectSteps('../foo/bar/example.spec')).toBe('');
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
  setupMocksForTypicalStepsImpls();
  const steps = loadSteps('../foo/bar/example.spec');
  expect(Object.keys(steps)).toContain('62ea94ebb9bc42474eea27c575e23c72df375dc4'); // $ echo -n "a test %1" | shasum
});

test('replaces placeholders with an actual simple parameter passed', () => {
  setupMocksForTypicalStepsImpls();
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  expect(transformedSource).toContain('another test with parameter called "Normad"')
});

test('keeps a step without corresponding implementation', () => {
  setupMocksForTypicalStepsImpls();
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  expect(transformedSource).toContain('a test without corresponding implementation')
});

test('replaces placeholders with dynamic parameters fed through a data table', () => {
  setupMocksForTypicalStepsImpls();
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  expect(transformedSource).toContain('another test with parameter called "Alpha"')
  expect(transformedSource).toContain('another test with parameter called "Bravo"')
  expect(transformedSource).toContain('another test with parameter called "Charlie"')
});

test('transformes into syntactically correct JavaScript code', () => {
  setupMocksForTypicalStepsImpls();
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  const sandboxedSource = `(() => { ${transformedSource} })`;
  const vm = require('vm');
  const context = vm.createContext();
  expect(vm.runInContext(sandboxedSource, context)).not.toThrow(new SyntaxError());
});

test('transformes even a troublesome spec into syntactically correct JavaScript code', () => {
  setupMocksForTypicalStepsImpls();
  const troblesomeSpec:Spec = {
    title: 'a spec',
    steps: [],
    scenarios: [{
      title: 'a scenario',
      steps: ['a test without implementation with "a simple parameter"']
    }],
  };
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource([troblesomeSpec], steps);
  const sandboxedSource = `(() => { ${transformedSource} })`;
  const vm = require('vm');
  const context = vm.createContext();
  expect(vm.runInContext(sandboxedSource, context)).not.toThrow(new SyntaxError());
});

test('transformes multiple specs at once into syntactically correct JavaScript code', () => {
  setupMocksForTypicalStepsImpls();
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource([specs, specs].flat(), steps);
  const sandboxedSource = `(() => { ${transformedSource} })`;
  const vm = require('vm');
  const context = vm.createContext();
  expect(vm.runInContext(sandboxedSource, context)).not.toThrow(new SyntaxError());
});

test('has tear down steps', () => {
  setupMocksForTypicalStepsImpls();
  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  expect(transformedSource).toContain('Teardown step 1')
  expect(transformedSource).toContain('Teardown step 2')
})

test('has placeholder steps if one or more steps has no steps', () => {
  // @ts-ignore
  setupMocksForTypicalStepsImpls();
  const specs:Spec[] = [{
    title: 'a spec',
    steps: [],
    scenarios: [{
      title: 'a scenario',
      steps: ['a test']
    }],
  }];

  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  expect(transformedSource).not.toContain('currently no steps found for this spec');
});

test('is okay if a spec has no context steps, no placeholder steps', () => {
  // @ts-ignore
  jest.spyOn(fs, "readdirSync").mockImplementation(() => { throw new Error('ENOENT') });

  const specs:Spec[] = [{
    title: 'a spec',
    steps: [],
    scenarios: [],
  }];

  const steps = loadSteps('../foo/bar/example.spec');
  const transformedSource = buildTransformedSource(specs, steps);
  expect(transformedSource).toContain('currently no steps found for this spec');
});

const specs:Spec[] = [
  {
    title: 'Title of An Acceptance Test',
    steps: ['a prerequisite', 'a prerequisite with "Param"'],
    scenarios: [
      {
        title: 'Title of A Scenario',
        steps: [
          'a test',
          'another test with parameter called "Normad"',
          'another test with parameter called <Their Name>',
          'another test with parameter called <Team Name>',
          'a test coming from a concept',
          'a test without corresponding implementation',
        ],
      },
    ],
    teardownSteps: [
      'Teardown step 1',
      'Teardown step 2',
    ],
    dataTable: {
      header: ['id', 'Their Name'],
      body: ['1', 'Alpha', '2', 'Bravo', '3', 'Charlie']
    },
  },
];
