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
  try {
    const files = readdirSync(join(dir, bn), { encoding: 'utf-8', withFileTypes: false });
    return files
    .map((filename:string) =>
      readFileSync(join(dir, bn, filename), { encoding: 'utf-8' }),
    )
    .join('\n');
  } catch {
    return '';
  }
};

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
  const test = (testTitle:string, testFunction:string, timeout?:number) => {
    const { stripped: title, args } = stripParameters(testTitle);
    const functionString = testFunction.toString();
    const timeoutString = timeout ? `, ${timeout}` : '';
    steps[sha1(title)] =`test('${title}', async () => { // TODO: make it aync if the original is
      await (${functionString})(${args.map((_, i) => `%${i+1}`).join(',')})
    }${timeoutString})`;
  };
  const step = (stepTitle:string, stepFunction:string) => {
    const { stripped: title, args } = stripParameters(stepTitle);
    const functionString = stepFunction.toString();
    steps[sha1(title)] =`// Step ${stepTitle}")\n(${functionString})(${args.map((_, i) => `%${i+1}`).join(',')});`;
  };

  eval(collectSteps(filename));
  return steps;
};

const substituteSimpleParameters = (func:stringifiedFunction, params:string[]):stringifiedFunction => {
  let updatedFunction = func;
  params.forEach((param, j) => {
    updatedFunction = updatedFunction.replace(new RegExp(`%${j+1}`, 'g'), param);
  });
  return updatedFunction;
}

const substituteDynamicParameters = (title:string, dataTable:DataTable):string[] => {
  const re = /<(.*?)>/g;
  let match, i = 0;
  let titles:any[] = [];
  while ((match = re.exec(title)) !== null) {
    const tag = match[0];
    const fieldName = match[1];
    const fieldLength = dataTable.header.length;
    const fieldIndex = dataTable.header.indexOf(fieldName);
    dataTable.body.forEach((s, i) => {
      if ((i % fieldLength) == fieldIndex)
        titles.push(title.replace(tag, `"${s}"`))
    })
  }
  return titles;
}

const resolveSimpleParameters = (title:string, steps:StepMap) => {
  // > The code must have the same number of parameters as mentioned in the step.
  // https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#step-implementations
  // So it should throw if a test case has insufficient number of parameters
  const { stripped, args } = stripParameters(title)
  const key = sha1(stripped);
  const stepSource = steps[key] ? steps[key] : `test.skip("[No impl] ${stripped}", () => {})`;
  return substituteSimpleParameters(stepSource, args);
}

export const buildTransformedSource = (specs:Spec[], steps:StepMap) => {
  const placeholderStep = "test('currently no steps found for this spec or scenario', () => { expect(false).toBe(true) })";

  const buildSpec = (spec:Spec) => {

    const dataTable = spec.dataTable;
    const buildStep = (title:string) => {
      if (/<.*?>/.test(title)) { // steps that contains dynamic parameter (<dyn_param>)
        if (dataTable) {
          const titlesWithOnlySimpleParameters = substituteDynamicParameters(title, dataTable)
          return titlesWithOnlySimpleParameters
            .flatMap((title) => resolveSimpleParameters(title, steps))
            .join();
        } // TODO: should this throw?
      } else {
        return resolveSimpleParameters(title, steps);
      }
    }

    const buildScenario = (scenario:Scenario) => {

      const skipAnnotation = scenario.tags?.includes('draft') ? '.skip' : '';

      const stepsString = (scenario.steps && scenario.steps.length > 0)
        ? scenario.steps.map(buildStep).join('\n')
        : placeholderStep;

      const contextStepsString = (spec.steps && spec.steps.length > 0)
        ? spec.steps.map(buildStep).join('\n')
        : placeholderStep;

      return `describe${skipAnnotation}('${scenario.title}', () => {
          const senarioStore = {}
          beforeAll(() => {
          })
          ${contextStepsString}
          ${stepsString}
        })`;
    };

    const scenariosString = (spec.scenarios && spec.scenarios.length > 0)
      ? spec.scenarios?.map(buildScenario).join('\n')
      : placeholderStep;

    const teardownStepsString = (spec.teardownSteps && spec.teardownSteps.length > 0)
      ? spec.teardownSteps.map(buildStep).join('\n')
      : placeholderStep;

    const skipAnnotation = spec.tags?.includes('draft') ? '.skip' : '';
    return `
      const suiteSore = {};
      describe${skipAnnotation}('${spec.title}', () => {
        const specStore = {}
        beforeEach(() => {
        });
        afterAll(() => {
          ${teardownStepsString}
        })
        ${scenariosString}
      })`;
  };
  return specs.map(buildSpec).join('\n');
};