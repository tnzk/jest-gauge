declare module 'markdown-it-ast' {
    import Token from 'markdown-it/lib/token';
    export function makeAST(tokens:Token[]):AstNode[]
}

declare type AstNode = {
    type: string
    nodeType: string
    openNode: {
    tag: string
    }
    content: string
    children: AstNode[]
}
