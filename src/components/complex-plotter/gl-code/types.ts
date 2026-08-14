/**
 * Standard type definitions for the Complex Function Plotter math core.
 */

export type ASTNode = string | number | [string, ...any[]];

export interface WebGLRenderingContextExtended extends WebGLRenderingContext {
  LOG_MODE?: boolean;
}
