const MarkdownIt = require('markdown-it');
const MarkdownItAST = require('markdown-it-ast');
const md = new MarkdownIt({});

export const buildTestPlanFromSpec = (markdown:string) => {
  const ast = MarkdownItAST.makeAST(md.parse(markdown));
  const specs:Spec[] = [];
  let currentSpec:Spec = {
    scenarios: [],
    paragraphs: [],
    steps: [],
    tags: [],
    teardownSteps: [],
  };
  let currentScenario:Scenario = {
    paragraphs: [],
    steps: [],
    tags: [],
  };
  let inScenario = false;

type Node = {
  type: string
  nodeType: string
  openNode: {
    tag: string
  }
  content: string
  children: Node[]
}

  const teardownIndex = ast.findIndex((node:Node) => node.type == 'hr');
  const teardownAst = ast.slice(teardownIndex);
  ast.slice(0, teardownIndex).forEach((node:Node, i:number) => {
    switch (node.nodeType) {
      case 'heading':
        if (node.openNode.tag == 'h1') {
          if (currentSpec.title) specs.push(currentSpec);
          currentSpec = {
            title: node.children[0].content,
            scenarios: [],
            paragraphs: [],
            steps: [],
            tags: [],
            teardownSteps: [],
          };
          inScenario = false;
        }
        if (node.openNode.tag == 'h2') {
          if (currentScenario.title) currentSpec.scenarios?.push(currentScenario);
          currentScenario = {
            title: node.children[0].content,
            paragraphs: [],
            steps: [],
            tags: [],
          };
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
                .map(s => s.replace(/[\W\r\n]+/gm, '')),
            );
          } else {
            inventory.paragraphs?.push(content);
          }
        }
        break;
      case 'bullet_list':
        const inventory = inScenario ? currentScenario : currentSpec;
        const listItems = node.children
          .flatMap((n:Node) => n.children.flatMap((p:Node) => p.children))
          .flatMap((c:Node) => c.content);
        inventory.steps?.push(...listItems);
        break;
    }
  });
  currentSpec.scenarios?.push(currentScenario);
  specs.push(currentSpec);

  teardownAst.forEach((node:Node) => {
    switch (node.nodeType) {
      case 'bullet_list': // TODO: Be DRY
        const latestSpec = specs[specs.length - 1];
        const listItems = node.children
          .flatMap(n => n.children.flatMap(p => p.children))
          .flatMap(c => c.content);
        latestSpec.teardownSteps?.push(...listItems);
        break;
    }
  });

  return specs;
};

