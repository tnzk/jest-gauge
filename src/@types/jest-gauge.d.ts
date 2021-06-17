type stringifiedFunction = string

type ContainerMetaData = {
  title:       string
  tags?:       string[]
  paragraphs?: string[]
 }

type Scenario = ContainerMetaData & {
 steps?: stringifiedFunction[]
 dataTable?:     DataTable
}

type Concept = Scenario

type Spec = ContainerMetaData & {
 steps?:         stringifiedFunction[] // NOTE: Context steps, not test cases.
 scenarios?:     Scenario[]
 teardownSteps?: stringifiedFunction[]
 dataTable?:     DataTable
}

type DataTable = {
  header: string[],
  body: string[],
}

type TransformOptions = {
  taiko: boolean,
};

declare interface StepMap {
  [sha1OfStep: string]: string;
}

declare module 'spec' {
   export function buildTestPlanFromSpec(markdown:string):Spec
}

declare module 'step' {
  export function loadSteps(filename:string):StepMap
  export function buildTransformedSource(specs:Spec[], steps:StepMap, options?:TransformOptions):string
}