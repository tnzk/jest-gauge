import type { TransformOptions, TransformedSource } from '@jest/transform'
import type { Config } from '@jest/types';
import { process as _process } from 'babel-jest'
import { buildTestPlanFromSpec } from './specs'
import { loadSteps, buildTransformedSource } from './steps'

function createTransformer(
  sourceText: string,
  sourcePath: string,
  config: Config.ProjectConfig,
  options?: TransformOptions
): TransformedSource {
  const specs = buildTestPlanFromSpec(sourceText);
  const stepStore = loadSteps(sourcePath);
  const transformed = buildTransformedSource(specs, stepStore);
  return _process(transformed, sourcePath, config, options);
}

module.exports = { process: createTransformer }