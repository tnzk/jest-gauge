import type { TransformOptions, TransformedSource } from '@jest/transform'
import type { Config } from '@jest/types';
import { buildTestPlanFromSpec } from './specs'
import { loadSteps, buildTransformedSource } from './steps'

const getTransformOptions = (config:Config.ProjectConfig) =>
  config.transform.find(arr => arr[1].indexOf('jest-gauge') !== -1)?.[2];

const jestGauge = {
  process: function (
    sourceText: string,
    sourcePath: string,
    config: Config.ProjectConfig,
    options?: TransformOptions
  ): TransformedSource {
    const opt = getTransformOptions(config);
    const specs = buildTestPlanFromSpec(sourceText);
    const stepStore = loadSteps(sourcePath);
    const transformed = buildTransformedSource(specs, stepStore);
    if (opt?.['debug']) {
      console.debug('[jest-gauge:Options]', opt);
      console.debug('[jest-gauge:Parsed spec]', specs);
      console.debug('[jest-gauge:Step store]', stepStore);
      console.debug('[jest-gauge:Transformed Source]', transformed);
    }
    return transformed;
  },
}

export const { process, } = jestGauge;