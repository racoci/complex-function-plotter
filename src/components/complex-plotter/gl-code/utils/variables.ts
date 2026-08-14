import { ASTNode } from '../types';

/**
 * Traverses an AST and returns a Set of all free variable names.
 * 'z' is excluded as it's the primary complex variable.
 * Bound variables from 'sum' and 'prod' loops are also excluded.
 */
export function getFreeVariables(ast: ASTNode, boundVariables: Set<string> = new Set()): Set<string> {
    const freeVars = new Set<string>();

    if (typeof ast === 'number' || typeof ast === 'string') {
        return freeVars;
    }

    if (Array.isArray(ast)) {
        if (ast.length === 0) return freeVars;
        
        const op = ast[0];

        if (op === 'variable') {
            const name = ast[1] as string;
            if (name !== 'z' && !boundVariables.has(name)) {
                freeVars.add(name);
            }
            return freeVars;
        }

        if (op === 'sum' || op === 'prod') {
            // [op, expr, idxVar, low, high]
            const expr = ast[1];
            const idxVar = ast[2] as string;
            const low = ast[3];
            const high = ast[4];

            // Evaluate bounds without the new bound variable
            const lowVars = getFreeVariables(low, boundVariables);
            const highVars = getFreeVariables(high, boundVariables);

            // Evaluate expression with the bound variable
            const newBound = new Set(boundVariables);
            newBound.add(idxVar);
            const exprVars = getFreeVariables(expr, newBound);

            lowVars.forEach(v => freeVars.add(v));
            highVars.forEach(v => freeVars.add(v));
            exprVars.forEach(v => freeVars.add(v));
            
            return freeVars;
        }

        // Default recursion
        for (let i = 1; i < ast.length; i++) {
            const childVars = getFreeVariables(ast[i], boundVariables);
            childVars.forEach(v => freeVars.add(v));
        }
    }

    return freeVars;
}
