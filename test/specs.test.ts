// TODO: blatant null checks
import { test, expect, describe } from '@jest/globals'
import { buildTestPlanFromSpec } from '../src/specs'

const markdown = `
# Title of An Acceptance Test
Tags: draft, admin

Some writeup of this acceptance test

- A prerequisite step
- Another prerequisite step

## Title of A Scenario
Tags: successful,
 admin

Some writeup of this scenario

- A step for this test
- Another step for this test
- Yet another step for this test

___
Teardown scripts

* Remove some data
* Shutdown test server`;

test('captures correct spec title', () => {
  const specs = buildTestPlanFromSpec(markdown);
  expect(specs[0].title).toBe('Title of An Acceptance Test');
});

test('captures correct spec paragraph', () => {
  const specs = buildTestPlanFromSpec(markdown);
  expect(specs[0].paragraphs?.length).toBe(1);
  expect(specs[0].paragraphs).toContain('Some writeup of this acceptance test');
});

test('captures correct prerequisite steps', () => {
  const specs = buildTestPlanFromSpec(markdown);
  expect(specs[0].steps?.length).toBe(2);
  expect(specs[0].steps).toContain('A prerequisite step');
  expect(specs[0].steps).toContain('Another prerequisite step');
});

test('captures correct spec tags', () => {
  const specs = buildTestPlanFromSpec(markdown);
  expect(specs[0].tags?.length).toBe(2);
  expect(specs[0].tags).toContain('draft');
  expect(specs[0].tags).toContain('admin');
});

function getFirstScenario(specs:Spec[]):Scenario | undefined  {
  let spec= specs[0]
  if (spec && spec.scenarios) {
    return spec.scenarios[0]
  }
}

test('captures correct scenario title', () => {
  const specs = buildTestPlanFromSpec(markdown);
  expect(getFirstScenario(specs)?.title).toBe('Title of A Scenario');
});

test('captures correct scenario steps', () => {
  const specs = buildTestPlanFromSpec(markdown);
  const scenario = getFirstScenario(specs)
  expect(scenario?.steps?.length).toBe(3);
  expect(scenario?.steps?.[1]).toBe('Another step for this test');
});

test('captures correct scenario paragraphs', () => {
  const specs = buildTestPlanFromSpec(markdown);
  const scenario = getFirstScenario(specs)
  expect(scenario?.paragraphs?.length).toBe(1);
  expect(scenario?.paragraphs?.[0]).toBe('Some writeup of this scenario');
});

test('captures correct scenario tags, accepting multiline ones', () => {
  const specs = buildTestPlanFromSpec(markdown);
  const scenario = getFirstScenario(specs)
  expect(scenario?.tags?.length).toBe(2);
  expect(scenario?.tags).toContain('successful');
  expect(scenario?.tags).toContain('admin');
});

test('captures correct teardown script', () => {
  const specs = buildTestPlanFromSpec(markdown);
  expect(specs?.[0].teardownSteps?.length).toBe(2);
  expect(specs?.[0].teardownSteps?.[0]).toBe('Remove some data');
  expect(specs?.[0].teardownSteps?.[1]).toBe('Shutdown test server');
});
