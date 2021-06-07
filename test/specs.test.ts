// TODO: blatant null checks
import { test, expect, describe } from '@jest/globals'
import { buildTestPlanFromSpec } from '../src/specs'

const markdown = `
# Title of An Acceptance Test
Tags: draft, admin

|id| name      |
|--|-----------|
|1 | Alice     |
|2 | Bob       |
|3 | Eve       |

Some writeup of this acceptance test

- A prerequisite step
- Another prerequisite step

## Title of A Scenario
Tags: successful,
 admin

Some writeup of this scenario

- A step for this test
- Another step with a "simple parameter"
- Yet another step for this test

## Table-driven scenario

 |Word  |Vowel Count|
 |------|-----------|
 |Gauge |3          |
 |Mingle|2          |
 |Snap  |1          |
 |GoCD  |1          |
 |Rhythm|0          |

This is the second scenario in this specification

Here's a step that takes a table

* The word <Word> has <Vowel Count> vowels.

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
  expect(scenario?.steps?.[2]).toBe('Yet another step for this test');
});

test('captures correct scenario steps with simple parameter', () => {
  const specs = buildTestPlanFromSpec(markdown);
  const scenario = getFirstScenario(specs)
  expect(scenario?.steps?.length).toBe(3);
  expect(scenario?.steps?.[1]).toBe('Another step with a "simple parameter"');
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
  expect(specs[0].teardownSteps?.length).toBe(2);
  expect(specs[0].teardownSteps?.[0]).toBe('Remove some data');
  expect(specs[0].teardownSteps?.[1]).toBe('Shutdown test server');
});

test('can have a data table', () => {
  const specs = buildTestPlanFromSpec(markdown);
  expect(specs[0].dataTable).toBeDefined();
  expect(specs[0].dataTable?.header).toBeDefined();
  expect(specs[0].dataTable?.body).toBeDefined();
})

test('populates table-driven scenarios', () => {
  const specs = buildTestPlanFromSpec(markdown);
  const titles = specs[0].scenarios?.map((scenario) => scenario.title);
  expect(titles).toContain('Table-driven scenario for "Gauge"');
  expect(titles).toContain('Table-driven scenario for "Snap"');
  expect(titles).toContain('Table-driven scenario for "Rhythm"');
  const allStepsFlatten = specs[0].scenarios?.map(sn => sn.steps).flat();
  expect(allStepsFlatten).toContain('The word "Gauge" has "3" vowels.');
})


const lightMd = `
# Specification for the Welcome page

Ordinary paragraphs are treated as comments, just ignored.

## Scenario: Users open the site and see the welcome page

* Open "https://duckduckgo.com/"
* The user sees a cute cucumber-looking white bird`;

test("won't eat scenario steps as tear down steps", () => {
  const specs = buildTestPlanFromSpec(lightMd);
  expect(specs[0].scenarios?.[0].steps).toHaveLength(2);
  expect(specs[0].teardownSteps).toHaveLength(0);
})