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
  const stepSource = steps[sha1(stripped)]
  return substituteSimpleParameters(stepSource, args);
}

export const buildTransformedSource = (specs:Spec[], steps:StepMap) => {

  const buildSpec = (spec:Spec) => {

    const buildScenario = (scenario:Scenario) => {
      const dataTable = spec.dataTable;
      const skipAnnotation = scenario.tags?.includes('draft') ? '.skip' : '';

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

      return `describe${skipAnnotation}('${scenario.title}', () => {
          const senarioStore = {}
          beforeAll(() => {
          })
          ${scenario.steps?.map(buildStep).join('\n')}
        })`;
    };

    return `
    describe('${spec.title}', () => {
        const specStore = {}
        ${spec.steps?.map((s:string) => steps[sha1(s)]).join('\n')}
        ${spec.scenarios?.map(buildScenario).join()}
      })`;
  };
  return specs.map(buildSpec).join();
};
