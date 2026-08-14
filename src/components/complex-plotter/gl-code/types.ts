/**
 * Standard type definitions for the Complex Function Plotter math core.
 */

export type ASTNode = string | number | [string, ...any[]];

export interface WebGLRenderingContextExtended extends WebGLRenderingContext {
  LOG_MODE?: boolean;
}

export interface FunctionDef {
  name: string;             // e.g. "f" or "f_k"
  param: string;            // e.g. "z" or "x" or "y"
  body: ASTNode;            // parsed AST of the body
  isIndexed?: boolean;      // true if it has a subscript "k" or index
  indexParam?: string;      // name of the index parameter, e.g. "k" (if isIndexed)
  baseCase?: ASTNode;       // AST of base case f_0(z)
}
