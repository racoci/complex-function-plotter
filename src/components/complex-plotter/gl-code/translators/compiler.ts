/*****
 * Compile higher-order constructs in AST,
 * and perform some AST optimizations.
 */
import {constants, fns} from './to-js';
import diff, {substitute} from './derivative';

import * as math from 'mathjs';
import { ASTNode } from '../types';

// Return AST where binary operation `op` is applied
// between all given terms (AST).
function compose(terms: ASTNode[], op: string, op4?: string, op8?: string): ASTNode {
    // Empty sum/product
    if (terms.length === 0) {return (op === 'sum') ? ['number', 0, 0] : ['number', 1, 0];}

    // Trivial sum/product
    if (terms.length === 1) {return terms[0];}

    // Distribute evenly for faster computation
    const N = Math.floor(terms.length/2);
    const app = (a: number, b: number | undefined) => compose(terms.slice(a, b), op, op4, op8);

    if (N >= 4 && op8 !== undefined) {
        const NN = Math.floor(N/2);
        const NNN = Math.floor(N/4);
        return compile([op8,
            app(0, NNN), app(NNN, NN), app(NN, NN+NNN), app(NN+NNN, N),
            app(N, N+NNN), app(N+NNN, N+NN), app(N+NN, N+NN+NNN), app(N+NN+NNN, undefined)
        ]);
    } else {
        if (N >= 2 && op4 !== undefined) {
            const NN = Math.floor(N/2);
            return compile([op4, app(0, NN), app(NN, N), app(N, N+NN), app(N+NN, undefined)]);
        } else {
            return compile([op, compose(terms.slice(0, N), op), compose(terms.slice(N), op)]);
        }
    }
}

// Apply sum or product operator.
function sumProd(operator: string, args: ASTNode[]): ASTNode | null {
    // Evaluate lower/upper bounds
    args[2] = compile(args[2]);
    args[3] = compile(args[3]);
    
    const arg1 = args[1] as [string, ...any[]];
    const arg2 = args[2] as [string, ...any[]];
    const arg3 = args[3] as [string, ...any[]];

    if (arg1[0] !== 'variable') {return null;}
    if (arg2[0] !== 'number') {return null;}
    if (arg3[0] !== 'number') {return null;}

    // Preserve the loop construct for GLSL and JS translation
    return [operator, compile(args[0]), arg1[1], arg2[1], arg3[1]];
}

function getConst(val: any): math.Complex {
    let re = null;
    let im = null;

    if (!isNaN(val)) {re = val; im = 0;}
    else if (val[0] === 'number') {re = val[1]; im = val[2];}
    else if (val[0] === 'constant') {re = (constants as any)[val[1]]; im = 0;}

    return math.complex(re, im);
}

function destructure(val: any): ASTNode {
    if (val.re === undefined) {return ['number', val, 0];}
    return ['number', val.re, val.im];
}

function isConst(ast: ASTNode): boolean {
    if (typeof ast === 'number') return true;
    if (!isNaN(ast as any)) return true;
    if (Array.isArray(ast)) {
        return ast[0] === 'number' || ast[0] === 'constant';
    }
    return false;
}

function isZero(ast: ASTNode): boolean {
    if (Array.isArray(ast)) {
        return ast[0] === 'number' && ast[1] === 0 && ast[2] === 0;
    }
    return false;
}

const inverseMap: Record<string, string> = {
    'neg': 'neg',
    'reciprocal': 'reciprocal',
    'conj': 'conj',
    'exp': 'log',
    'sin': 'arcsin',
    'cos': 'arccos',
    'tan': 'arctan',
    'sec': 'arcsec',
    'csc': 'arccsc',
    'cot': 'arccot',
    'sinh': 'arsinh',
    'cosh': 'arcosh',
    'tanh': 'artanh',
    'sech': 'arsech',
    'csch': 'arcsch',
    'coth': 'arcoth',
    'square': 'sqrt',
};


// Optimize AST, and expand any higher-order constructs.
function compile(ast: ASTNode): ASTNode {
    if (!Array.isArray(ast)) {return ast;}

    const [operator, ...args] = ast as [string, ...any[]];
    if (operator === 'number' || operator === 'variable' || operator === 'constant') {
        return ast;
    }

    // Higher-order functions
    if (operator === 'sum' || operator === 'prod') {
        const res = sumProd(operator, args);
        if (res !== null) return res;
    }

    const compiledArgs = args.map(compile);
    if (operator === 'diff') {
        return diff(compiledArgs[0], compiledArgs[1], compile);
    }

    // Aliases
    if (operator === 'factorial') {return compile(['gamma', ['add', compiledArgs[0], ['number', 1, 0]]]);}


    // Evaluate if all arguments are constant
    if (compiledArgs.every(isConst)) {
        const fn = (fns as any)[operator] || (math as any)[operator];
        return destructure(fn(...compiledArgs.map(getConst)));
    }

    // Cancel out inverse functions
    if (inverseMap[operator] !== undefined) {
        const firstArg = compiledArgs[0];
        if (Array.isArray(firstArg) && firstArg[0] === inverseMap[operator]) {
            return firstArg[1];
        }
    }


    // Optimizations
    if (operator === 'add') {
        if (isZero(compiledArgs[0])) {return compiledArgs[1];}
        if (isZero(compiledArgs[1])) {return compiledArgs[0];}
    }

    if (operator === 'sub') {
        if (isZero(compiledArgs[0])) {return compile(['neg', compiledArgs[1]]);}
        if (isZero(compiledArgs[1])) {return compiledArgs[0];}
    }

    if (operator === 'div') {
        if (isConst(compiledArgs[1])) {
            return compile(['mul', compile(['reciprocal', compiledArgs[1]]), compiledArgs[0]]);
        }

        if (isConst(compiledArgs[0])) {
            return compile(['mul', compiledArgs[0], compile(['reciprocal', compiledArgs[1]])]);
        }
    }

    if (operator === 'mul') {
        let terms = compiledArgs;
        // Place constant in front
        if (isConst(compiledArgs[1])) {terms = [compiledArgs[1], compiledArgs[0]];}

        // Deal with constant case
        if (isConst(terms[0])) {
            const val = getConst(terms[0]);

            // Real scale factor
            if (val.im === 0) {
                return compile(['component_mul', terms[1], val.re]);
            }
        }
    }

    if (operator === 'component_mul') {
        if (compiledArgs[1] === 0) {return ['number', 0, 0];}
        if (compiledArgs[1] === 1) {return compiledArgs[0];}
        if (compiledArgs[1] === -1) {return ['neg', compiledArgs[0]];}
        if (typeof compiledArgs[1] === 'number' && compiledArgs[1] > 0) {
            return ['component_mul_prelog', compiledArgs[0], math.log(compiledArgs[1])];
        } else {
            return ['component_mul_prelog', compile(['neg', compiledArgs[0]]), math.log(-Number(compiledArgs[1]))];
        }
    }

    if (operator === 'pow') {
        if (isConst(compiledArgs[0])) {
            return ['exp', compile(['mul', compile(['log', compiledArgs[0]]), compiledArgs[1]])];
        }

        if (isConst(compiledArgs[1])) {
            const val = getConst(compiledArgs[1]);
            const subAST = compiledArgs[0];
            if (val.im === 0) {
                if (val.re === -1) {return compile(['reciprocal', subAST]);}
                if (val.re === 0) {return ['number', 1, 0];}
                if (val.re === 0.5) {return ['sqrt', subAST];}
                if (val.re === 1) {return subAST;}
                if (val.re === 2) {return compile(['square', subAST]);}
                return ['exp', compile(['component_mul', ['log', subAST], val.re])]; // Cartesian only
            }
        }
    }

    if (operator === 'beta') {
        let terms = compiledArgs;
        if (isConst(compiledArgs[0])) {terms = [compiledArgs[1], compiledArgs[0]];}
        if (isConst(terms[1])) {
            const val = getConst(terms[1]);
            if (val.im === 0 && Number.isInteger(val.re) && val.re > 0 && val.re < 20) {
                const prefactor = compile(['component_mul', terms[0], math.factorial(val.re)/val.re]);
                const listTerms: ASTNode[] = [prefactor];
                for (let i = 1; i < val.re; i++) {
                    listTerms.push(['add', terms[0], ['number', i, 0]]);
                }
                return ['reciprocal', compose(listTerms, 'mul', 'mul4')];
            }
        }
    }

    if (operator === 'binom') {
        if (isConst(compiledArgs[1])) {
            const val = getConst(compiledArgs[1]);
            if (val.im === 0) {
                if (val.re === 0) {return ['number', 1, 0];}
                if (Number.isInteger(val.re) && val.re > 0 && val.re < 20) {
                    const listTerms: ASTNode[] = [];
                    for (let i = 0; i < val.re; i++) {
                        listTerms.push(['sub', compiledArgs[0], ['number', i, 0]]);
                    }
                    return compile(['component_mul', compose(listTerms, 'mul', 'mul4'), 1/math.factorial(val.re)]);
                }
            }
        }
        if (isZero(compiledArgs[0])) {return ['number', 0, 0];}
    }

    return [operator, ...compiledArgs];
}

export default compile;
