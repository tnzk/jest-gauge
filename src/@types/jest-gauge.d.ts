declare type stringifiedFunction = string

declare type Scenario = {
  title?:           string
  tags?:            string[]
  paragraphs?:      string[]
  steps?:           stringifiedFunction[]
}

declare type Spec = {
  title?:      string
  tags?:       string[]
  paragraphs?: string[]
  steps?:      stringifiedFunction[]
  scenarios?:  Senario[]
  teardownSteps?: stringifiedFunction[]
}

declare module 'spec' {
  export function buildTestPlanFromSpec(markdown:string):Spec
}

declare module 'step' {
  export function loadSteps(filename:string):StepMap
  export function buildTransformedSource(specs:Spec[], steps:StepMap):string
}

declare module 'jest-gauge' {
  export var {
    process: createTransformer,
  }
}