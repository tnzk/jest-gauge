import MarkdownIt from 'markdown-it';
import { makeAST } from 'markdown-it-ast';

const traverseContent = (partialAst:AstNode):string[] => 
  partialAst.content ? [partialAst.content] : partialAst.children.flatMap(traverseContent);

const tableToMap = (partialAst:AstNode):(DataTable | undefined) => {
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

export const buildTestPlanFromSpec = (markdown:string) => {
  const md = new MarkdownIt({});
  const ast = makeAST(md.parse(markdown, {}));
  const specs:Spec[] = [];
  let currentSpec:Spec = {
    title: '',
    scenarios: [],
    paragraphs: [],
    steps: [],
    tags: [],
    teardownSteps: [],
  };

  let currentScenario:Scenario = {
    title: '',
    paragraphs: [],
    steps: [],
    tags: [],
  };
  let inScenario = false;

  const teardownIndex = ast.findIndex((node:AstNode) => node.type == 'hr');
  const teardownAst = teardownIndex > -1 ? ast.slice(teardownIndex) : undefined;
  ast.slice(0, (teardownAst ? teardownIndex : undefined)).forEach((node:AstNode, i:number) => {
    switch (node.nodeType) {
      case 'heading':
        if (node.openNode.tag == 'h1') {
          if (currentSpec.title != '') specs.push(currentSpec);
          currentSpec = specFactory(node.children[0].content);
          inScenario = false;
        }
        if (node.openNode.tag == 'h2') {
          if (currentScenario.title != '') currentSpec.scenarios?.push(currentScenario);
          currentScenario = scenarioFactory(node.children[0].content);
          inScenario = true;
        }
        break;
      case 'paragraph':
        {
          const content = node.children[0].content;
          const inventory = inScenario ? currentScenario : currentSpec;
          if (content.startsWith('Tags:')) {
            inventory.tags?.push(
              ...content
                .split(':')[1]
                .split(',')
                .map((s:string) => s.replace(/[\W\r\n]+/gm, '')),
            );
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
        currentSpec.dataTable = tableToMap(node)
        break;
    }
  });
  currentSpec.scenarios?.push(currentScenario);
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

