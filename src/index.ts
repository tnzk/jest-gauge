import type { TransformOptions, TransformedSource } from '@jest/transform'
import type { Config } from '@jest/types';
import { buildTestPlanFromSpec } from './specs'
import { loadSteps, buildTransformedSource } from './steps'
import { createHash } from 'crypto';
import {relative} from 'path';

const getTransformOptions = (config:Config.ProjectConfig) =>
  config.transform.find(arr => arr[1].indexOf('jest-gauge') !== -1)?.[2];

const jestGauge = {
  getCacheKey: function (
    sourceText: string,
    sourcePath: string,
    config: Config.ProjectConfig,
    options: TransformOptions,
  ) {
    const shasum = createHash('sha1')
      .update('64b7542c1a6d80ba3055d22313b15b735e9f662c') // SHA1 of a random string
      .update('\0', 'utf8')
      .update(sourceText)
      .update('\0', 'utf8')
      .update(config.rootDir ? relative(config.rootDir, sourcePath) : '')
      .update('\0', 'utf8');
    return shasum.digest('hex');
  },
  process: function (
    sourceText: string,
    sourcePath: string,
    config: Config.ProjectConfig,
    options?: TransformOptions
  ): TransformedSource {
    const opt = getTransformOptions(config);
    const specs = buildTestPlanFromSpec(sourceText);
    const stepStore = loadSteps(sourcePath);
    const transformed = buildTransformedSource(specs, stepStore, { taiko: opt?.['taiko'] });
    if (opt?.['debug']) {
      console.debug('[jest-gauge:Options]', opt);
      console.debug('[jest-gauge:Parsed spec]', specs);
      console.debug('[jest-gauge:Step store]', stepStore);
      console.debug('[jest-gauge:Transformed Source]', transformed);
    }
    return transformed;
  },
}

export const { process, getCacheKey } = jestGauge;