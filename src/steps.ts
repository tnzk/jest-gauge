const fs = require('fs');
const path = require('path');
const _crypto = require('crypto');

const sha1 = (s:string) => {
  const shasum = _crypto.createHash('sha1');
  shasum.update(s);
  return shasum.digest('hex');
};


// TODO: Exports a private function just to make it easy to test
export const collectSteps = (filename:string) => {
  const dir = path.dirname(filename);
  const basename = path.basename(filename, '.spec');
  const files = fs.readdirSync(path.join(dir, basename), { encoding: 'utf-8', withFileTypes: false });
  return files
    .map((filename:string) =>
      fs.readFileSync(path.join(dir, basename, filename), { encoding: 'utf-8' }),
    )
    .join('\n');
};

interface StepMap {
  [sha1OfStep: string]: string;
}

const specs:Spec[] = [
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

export const loadSteps = function(filename:string):StepMap {
  const steps:StepMap = {};
  // `test` looks unused but is actually necessary to be called
  const test = (testTitle:string, testFunction:string) => {
    steps[sha1(testTitle)] = `test('${testTitle}', ${testFunction.toString()})`;
  };
  eval(collectSteps(filename));
  return steps;
};

export const buildTransformedSource = (specs:Spec[], steps:StepMap) => {
  const buildScenario = (scenario:Scenario) => {
    const skipAnnotation = scenario.tags?.includes('draft') ? '.skip' : '';
    return `describe${skipAnnotation}('${scenario.title}', () => {
        const senarioStore = {}
        beforeAll(() => {
        })
        ${scenario.steps?.map((s:string) => steps[sha1(s)]).join('\n')}
      })`;
  };
  const buildSpec = (spec:Spec) => {
    return `
    describe('${spec.title}', () => {
        const specStore = {}
        ${spec.steps?.map((s:string) => steps[sha1(s)]).join('\n')}
        ${spec.scenarios?.map(buildScenario).join()}
      })`;
  };

  return specs.map(buildSpec).join();
};
