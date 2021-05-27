import MarkdownIt from 'markdown-it';
import { makeAST } from 'markdown-it-ast';

export const buildTestPlanFromSpec = (markdown:string) => {
  const md = new MarkdownIt({});
  const ast = makeAST(md.parse(markdown, {}));
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

  const teardownIndex = ast.findIndex((node:AstNode) => node.type == 'hr');
  const teardownAst = ast.slice(teardownIndex);
  ast.slice(0, teardownIndex).forEach((node:AstNode, i:number) => {
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
    }
  });
  currentSpec.scenarios?.push(currentScenario);
  specs.push(currentSpec);

  teardownAst.forEach((node:AstNode) => {
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

