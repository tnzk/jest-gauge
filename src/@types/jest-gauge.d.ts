type stringifiedFunction = string

type Scenario = {
 title?:           string
 tags?:            string[]
 paragraphs?:      string[]
 steps?:           stringifiedFunction[]
}

type Concept = Scenario

type Spec = {
 title?:      string
 tags?:       string[]
 paragraphs?: string[]
 steps?:      stringifiedFunction[]
 scenarios?:  Scenario[]
 teardownSteps?: stringifiedFunction[]
 dataTable?:  DataTable
}

type DataTable = {
  header: string[],
  body: string[],
}

declare interface StepMap {
  [sha1OfStep: string]: string;
}


declare module 'spec' {
   export function buildTestPlanFromSpec(markdown:string):Spec
}

declare module 'step' {
  export function loadSteps(filename:string):StepMap
  export function buildTransformedSource(specs:Spec[], steps:StepMap):string
}