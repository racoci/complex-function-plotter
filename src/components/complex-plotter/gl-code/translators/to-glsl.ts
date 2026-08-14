import lodash from 'lodash';
const { get } = lodash;

import * as math from 'mathjs';
import { ASTNode } from '../types';

function terminateFloat(x: number): string {
    const terminator = Number.isInteger(x) ? '.' : '';
    return x.toString() + terminator;
}

let helpers: string[] = [];
let helperCount = 0;

export function compileGLSL(ast: ASTNode, LOG_MODE: boolean): { expression: string, helpers: string } | null {
    helpers = [];
    helperCount = 0;
    try {
        const [expression] = toGLSL(ast, LOG_MODE, ['z']);
        return {
            expression,
            helpers: helpers.join('\n')
        };
    } catch (e) {
        console.error("Error compiling AST to GLSL. Context: ", { ast, LOG_MODE, error: e });
        return null;
    }
}

// Returns pair [ast_in_glsl, requires_parenthesis]
function toGLSL(ast: ASTNode, LOG_MODE: boolean, env: string[] = ['z']): [string, boolean] {
    if (typeof ast === 'number' || !isNaN(ast as any)) {
        // GLSL floats must end in decimal point
        return [terminateFloat(Number(ast)), false];
    }
    if (!Array.isArray(ast)) {return [ast as string, false];}

    let infixOperators: Record<string, string> = {
        'add': '+',
        'sub': '-',
        'component_mul': '*',
    };
    if (LOG_MODE) {
        infixOperators = {};
    }

    const [operator, ...args] = ast as [string, ...any[]];

    if (operator === 'number') {
        const [real, imag] = args;
        if (LOG_MODE) {
            let length = math.hypot(real, imag);
            if (length === 0) {length = 1;}
            return [`vec3(${real/length}, ${imag/length}, ${math.log(length)})`, false];
        } else {
            if (real === 1 && imag === 0) {return ['ONE', false];}
            if (real === 0 && imag === 1) {return ['I', false];}
            return [`vec2(${real}, ${imag})`, false];
        }
    }

    if (operator === 'variable') {return [args[0], false];}
    if (operator === 'constant') {return ['C_' + args[0].toUpperCase(), false];}
    
    if (operator === 'sum' || operator === 'prod') {
        const [expr, idxVar, low, high] = args;
        const helperName = `loop_helper_${helperCount++}`;
        const vecType = LOG_MODE ? 'vec3' : 'vec2';
        
        const envParams = env.map(v => `${vecType} ${v}`).join(', ');
        const envArgs = env.join(', ');
        
        const innerEnv = [...env, idxVar];
        const innerExpr = toGLSL(expr as ASTNode, LOG_MODE, innerEnv)[0];
        
        const initVal = operator === 'sum' ? 'ZERO' : 'ONE';
        const mathOp = operator === 'sum' ? 'cadd' : 'cmul';
        
        const helperCode = `
${vecType} ${helperName}(${envParams}) {
    ${vecType} acc = ${initVal};
    for (int _i = ${low}; _i <= ${high}; _i++) {
        float ${idxVar}_fl = float(_i);
        ${vecType} ${idxVar} = ${LOG_MODE ? `vec3(${idxVar}_fl, 0.0, 0.0)` : `vec2(${idxVar}_fl, 0.0)`};
        acc = ${mathOp}(acc, ${innerExpr});
    }
    return acc;
}
`;
        helpers.push(helperCode);
        return [`${helperName}(${envArgs})`, false];
    }

    if (operator in infixOperators) {
        const op = infixOperators[operator];
        let operands = args.map(x => toGLSL(x as ASTNode, LOG_MODE, env));

        // Add parentheses where possibly necessary
        if (op === '-') {
            if (operands[1][1]) {
                operands[1][0] = '(' + operands[1][0] + ')';
            }
        } else {
            if (op !== '+') {
                operands = operands.map(x => [x[1] ? '(' + x[0] + ')' : x[0], false] as [string, boolean]);
            }
        }
        return [operands[0][0] + op + operands[1][0], operator !== 'mul'];
    }

    // Unary function
    const unaryFunctions: Record<string, string> = {
        'factorial': 'cfact',
    };
    const internalName = get(unaryFunctions, operator, 'c' + operator);

    return [internalName + '(' + args.map(x => toGLSL(x as ASTNode, LOG_MODE, env)[0]).join(', ') + ')', false];
}

export default toGLSL;
