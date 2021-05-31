import { readFileSync, readdirSync } from 'fs';
import { dirname, basename, join } from 'path';
import { createHash } from 'crypto';

const sha1 = (s:string) => {
  const shasum = createHash('sha1');
  shasum.update(s);
  return shasum.digest('hex');
};

// TODO: Exports a private function just to make it easy to test
export const collectSteps = (filename:string) => {
  const dir = dirname(filename);
  const bn = basename(filename, '.spec');
  const files = readdirSync(join(dir, bn), { encoding: 'utf-8', withFileTypes: false });
  return files
    .map((filename:string) =>
      readFileSync(join(dir, bn, filename), { encoding: 'utf-8' }),
    )
    .join('\n');
};

const substituteParameters = (func:stringifiedFunction, params:string[]) => {
  let updatedFunction;
  params.forEach((param, j) => {
    updatedFunction = func.replace(new RegExp(`%${j+1}`, 'g'), param);
  });
  return updatedFunction;
}

const stripParameters = (src:string) => {
  const regex = /<(.*?)>|(\".*?\")/g;
  let stripped = src;
  let args = [];
  let match, i = 1;
  while ((match = regex.exec(src)) !== null) {
    const placeholder = `%${i}`
    stripped = stripped.replace(`${match[0]}`, placeholder)
    args.push(match[0])
    i+= 1
  }
  return { stripped, args };
}

export const loadSteps = function(filename:string):StepMap {
  const steps:StepMap = {};
  // `test` looks unused but is actually necessary to be called
  const test = (testTitle:string, testFunction:string) => {
    const { stripped: title, args } = stripParameters(testTitle);
    const functionString = stripParameters(testFunction.toString()).stripped;
    steps[sha1(title)] =`test('${title}', () => {
      (${functionString})(${args.map((_, i) => `%${i+1}`).join(',')})
    })`;
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
        ${scenario.steps?.map((title:string) => {
          const { stripped, args } = stripParameters(title)
          const stepSource = steps[sha1(stripped)]
          return substituteParameters(stepSource, args);
        }).join('\n')}
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
