import MarkdownIt from 'markdown-it';
import { makeAST } from 'markdown-it-ast';

const traverseContent = (partialAst:AstNode):string[] => 
  partialAst.content ? [partialAst.content] : partialAst.children.flatMap(traverseContent);

const tableToMap = (partialAst:AstNode):(DataTable | undefined) => {
  /*
    > A data table is defined in Markdown table format at the beginning of the spec prior to steps. The data table should have a header row and one or more data rows. The header names from the table can be used in the steps within angular brackets < > to refer to a particular column from the data table as a parameter.
    >
    > When a spec is run, each scenario is executed for every data row of the table. Table parameters are written in Multi-Markdown table formats.

    cf. https://docs.gauge.org/execution.html?os=macos&language=javascript&ide=vscode#data-driven-execution
  */
  if (partialAst.nodeType != 'table') return undefined;
  // TODO: what if a table node has more than one thead or tbody?
  const headerAst = partialAst.children.find((node:AstNode) => node.nodeType == 'thead')
  const bodyAst   = partialAst.children.find((node:AstNode) => node.nodeType == 'tbody')
  if (!(headerAst && bodyAst)) return undefined;

  const dataTable = {
    header: traverseContent(headerAst),
    body: traverseContent(bodyAst)
  };
  return dataTable;
}

const specFactory = (title:string):Spec => {
  return { title, scenarios: [], paragraphs: [], steps: [], tags: [], teardownSteps: [],};
};

const scenarioFactory = (title:string):Scenario => {
  return { title, paragraphs: [], steps: [], tags: [],};
};

const splitParagraphToTags = (s:string) =>
  s.split(':')[1].split(',').map((s:string) => s.replace(/[\W\r\n]+/gm, ''));

// Corresponds to "Table driven scenario"
// cf. https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode#table-driven-scenario
const populateDataTable = (scenario:Scenario):Scenario[] => {
  if (scenario.dataTable) {
    const dataTable = scenario.dataTable;
    const sizeOfElement = dataTable.header.length;
    const nElements = dataTable.body.length / sizeOfElement;
    const listOfValues = Array(nElements).fill(0).map((_, i) => {
      const start = sizeOfElement * i;
      const end = start + sizeOfElement;
      const values = dataTable.body.slice(start, end);
      return values;
    });
    const headers = dataTable.header;
    return listOfValues.map(arr => {
      // Create scenario that substituited with data table entries.
      const newScenario = Object.assign({}, scenario);
      newScenario.title += ` for "${arr[0]}"`;
      if (newScenario.steps) {
        newScenario.steps = newScenario.steps?.map(s =>
          headers.reduce((acc, v, i) =>
            acc.replace(`<${v}>`, `"${arr[i]}"`)
          , s)
        );
      }
      return newScenario;
    });
  } else {
    return [scenario];
  }
};

/**
 *
 * Parses a specification text in the format of Gauge flavored Markdown
 * and constructs a list of instances of Spec.
 *
 * @param markdown A markdown text in Gauge specification format.
 * @returns A list of specs
 */
export const buildTestPlanFromSpec = (markdown:string) => {
  const md = new MarkdownIt({});
  const ast = makeAST(md.parse(markdown, {}));
  const specs:Spec[] = [];
  // TODO: little ugly
  let currentSpec:Spec;
  let currentScenario:Scenario;
  let inScenario = false;

  const teardownIndex = ast.findIndex((node:AstNode) => node.type == 'hr');
  const teardownAst = teardownIndex > -1 ? ast.slice(teardownIndex) : undefined;
  ast.slice(0, (teardownAst ? teardownIndex : undefined)).forEach((node:AstNode, i) => {
    switch (node.nodeType) {
      case 'heading':
        if (node.openNode.tag == 'h1') {
          if (currentSpec) specs.push(currentSpec);
          currentSpec = specFactory(node.children[0].content);
          inScenario = false;
        }
        if (node.openNode.tag == 'h2') {
          if (currentScenario) {
            currentSpec.scenarios?.push(...populateDataTable(currentScenario))
          };
          currentScenario = scenarioFactory(node.children[0].content);
          inScenario = true;
        }
        break;
      case 'paragraph':
        {
          const content = node.children[0].content;
          const inventory = inScenario ? currentScenario : currentSpec;
          if (content.startsWith('Tags:')) {
            inventory.tags?.push(...splitParagraphToTags(content));
          } else {
            inventory.paragraphs?.push(content);
          }
        }
        break;
      case 'bullet_list':
        const inventory = inScenario ? currentScenario : currentSpec;
        const listItems = node.children
          .flatMap((n:AstNode) => n.children.flatMap((p:AstNode) => p.children))
          .flatMap((c:AstNode) => c.content);
        inventory.steps?.push(...listItems);
        break;
      case 'table':
        // TODO: Does Gauge accept a spec with multiple data tables?
        // NOTE: Scenario#dataTable shouldn't be accessible from outside of the module,
        //       since it exists just for populating table-driven scenarios.
        {
          const inventory = inScenario ? currentScenario : currentSpec;
          inventory.dataTable = tableToMap(node)
        }
        break;
    }
  });
  // @ts-ignore: how do I tell tsc that currentSpec and currenScenario would be assigned in the loop?
  currentSpec.scenarios?.push(...populateDataTable(currentScenario))
  // @ts-ignore: same as above
  specs.push(currentSpec);

  teardownAst?.forEach((node:AstNode) => {
    switch (node.nodeType) {
      case 'bullet_list': // TODO: Be DRY
        const latestSpec = specs[specs.length - 1];
        const listItems = node.children
          .flatMap((n:AstNode) => n.children.flatMap((p:AstNode) => p.children))
          .flatMap((c:AstNode) => c.content);
        latestSpec.teardownSteps?.push(...listItems);
        break;
    }
  });

  return specs;
};

