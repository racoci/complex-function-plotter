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
    if (operator === 'call') {
        const [funcName, funcArgs] = args;
        const compiledArgs = (funcArgs as ASTNode[]).map(x => toGLSL(x, LOG_MODE, env)[0]);
        return [`${funcName}(${compiledArgs.join(', ')})`, false];
    }
    
    if (operator === 'indexed_loop') {
        const [baseName, k, indexParam, paramName, baseCaseAst, bodyAst, initArgAst] = args;
        const helperName = `indexed_loop_helper_${helperCount++}`;
        const vecType = LOG_MODE ? 'vec3' : 'vec2';
        
        const filteredEnv = env.filter(v => v !== paramName);
        const envParams = filteredEnv.map(v => `${vecType} ${v}`).join(', ');
        const envArgs = filteredEnv.join(', ');
        
        // Compile base case replacing param with z
        const baseCaseGlsl = toGLSL(baseCaseAst, LOG_MODE, [...env, paramName])[0];
        
        // Compile iterative body replacing param and indexParam
        const bodyGlsl = toGLSL(bodyAst, LOG_MODE, [...env, paramName, indexParam])[0];

        const helperCode = `
${vecType} ${helperName}(${envParams}, ${vecType} ${paramName}) {
    ${vecType} acc = ${baseCaseGlsl};
    for (int _i = 1; _i <= ${k}; _i++) {
        float ${indexParam}_fl = float(_i);
        ${vecType} ${indexParam} = ${LOG_MODE ? `vec3(${indexParam}_fl, 0.0, 0.0)` : `vec2(${indexParam}_fl, 0.0)`};
        
        // Setup internal recursive step where previous output becomes new input: f(f(z))
        // So we substitute ${baseName}_{i-1}(z) -> acc
        // Due to lack of full macro replacement in strings, we assume standard calls to f_{i-1} in the loop body 
        // are compiled as calls if not cleanly handled by the string replacement.
        // But since this is inside a generated loop, we handle it by defining a local macro or doing a string replace.
        // A simpler way: we pass the body, and string replace references to the recursive call with 'acc'.
    }
    return acc;
}
`;      
        // Actually, to correctly substitute the recursive call like f_{k-1}(z) with `acc` in the GLSL body:
        // We compile the body first, but we need to tell it that a call to f_{k-1} is just 'acc'.
        // We can do this cleanly by replacing the call in the AST before compiling GLSL.
        
        // A better approach is to modify the AST recursively before calling toGLSL on the body:
        function replaceRecursiveCall(astNode: ASTNode): ASTNode {
             if (!Array.isArray(astNode)) return astNode;
             const [op, ...nodeArgs] = astNode as [string, ...any[]];
             if (op === 'call') {
                 const callName = nodeArgs[0] as string;
                 // If the call matches the baseName (e.g. f_k-1 or f)
                 if (callName.startsWith(baseName)) {
                     return ['variable', 'acc'];
                 }
             }
             return [op, ...nodeArgs.map(replaceRecursiveCall)];
        }
        
        const modifiedBodyAst = replaceRecursiveCall(bodyAst);
        const finalBodyGlsl = toGLSL(modifiedBodyAst, LOG_MODE, [...env, paramName, indexParam, 'acc'])[0];

        const finalHelperCode = `
${vecType} ${helperName}(${envParams !== '' ? envParams + ', ' : ''}${vecType} ${paramName}) {
    ${vecType} acc = ${baseCaseGlsl};
    for (int ${indexParam}_idx = 1; ${indexParam}_idx <= ${k}; ${indexParam}_idx++) {
        ${vecType} ${indexParam} = ${LOG_MODE ? `vec3(float(${indexParam}_idx), 0.0, 0.0)` : `vec2(float(${indexParam}_idx), 0.0)`};
        acc = ${finalBodyGlsl};
    }
    return acc;
}
`;
        helpers.push(finalHelperCode);
        const initArgGlsl = toGLSL(initArgAst, LOG_MODE, env)[0];
        
        return [`${helperName}(${envArgs !== '' ? envArgs + ', ' : ''}${initArgGlsl})`, false];
    }

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
