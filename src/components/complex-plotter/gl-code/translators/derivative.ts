import { ASTNode } from '../types';

// Substitute bound variable with value in AST
function substitute(ast: ASTNode, name: string, value: ASTNode): ASTNode {
    if (!Array.isArray(ast)) {return ast;}
    if (ast[0] === 'variable' && ast[1] === name) {return value;}
    return ast.map(x => substitute(x as ASTNode, name, value)) as ASTNode;
}

function contains(ast: ASTNode, name: string): boolean {
    if (!Array.isArray(ast)) {return false;}
    if (ast[0] === 'variable' && ast[1] === name) {return true;}
    return ast.some(x => contains(x as ASTNode, name));
}

const ZERO: ASTNode = ['number', 0, 0];
const ONE: ASTNode = ['number', 1, 0];

const diffTable: Record<string, (x: ASTNode) => ASTNode> = {
    'sin': x => ['cos', x],
    'cos': x => ['neg', ['sin', x]],
    'tan': x => ['square', ['sec', x]],
    'sec': x => ['mul', ['sec', x], ['tan', x]],
    'csc': x => ['neg', ['mul', ['csc', x], ['cot', x]]],
    'cot': x => ['neg', ['square', ['csc', x]]],
    'arcsin': x => ['reciprocal', ['sqrt', ['sub', ONE, ['square', x]]]],
    'arccos': x => ['neg', ['reciprocal', ['sqrt', ['sub', ONE, ['square', x]]]]],
    'arctan': x => ['reciprocal', ['add', ONE, ['square', x]]],
    'arcsec': x => ['reciprocal', ['mul', ['square', x], ['sqrt', ['sub', ONE, ['reciprocal', ['square', x]]]]]],
    'arccsc': x => ['neg', ['reciprocal', ['mul', ['square', x], ['sqrt', ['sub', ONE, ['reciprocal', ['square', x]]]]]]],
    'arccot': x => ['neg', ['reciprocal', ['add', ONE, ['square', x]]]],

    'sinh': x => ['cosh', x],
    'cosh': x => ['sinh', x],
    'tanh': x => ['square', ['sech', x]],
    'sech': x => ['neg', ['mul', ['tanh', x], ['sech', x]]],
    'csch': x => ['neg', ['mul', ['coth', x], ['csch', x]]],
    'coth': x => ['neg', ['square', ['csch', x]]],
    'arsinh': x => ['reciprocal', ['sqrt', ['add', ['square', x], ONE]]],
    'arcosh': x => ['reciprocal', ['mul', ['sqrt', ['sub', x, ONE]], ['sqrt', ['add', x, ONE]]]],
    'artanh': x => ['reciprocal', ['sub', ONE, ['square', x]]],
    'arcsch': x => ['neg', ['reciprocal', ['mul', ['square', x], ['sqrt', ['add', ONE, ['reciprocal', ['square', x]]]]]]],
    'arcoth': x => ['reciprocal', ['sub', ['square', x], ONE]],

    'exp': x => ['exp', x],
    'cis': x => ['mul_i', ['cis', x]],
    'log': x => ['reciprocal', x],

    'square': x => ['component_mul', x, 2],
    'sqrt': x => ['reciprocal', ['component_mul', ['sqrt', x], 2]],

    'erf': x => ['component_mul', ['exp', ['neg', ['square', x]]], 2/Math.sqrt(Math.PI)],

    'lambertw': x => ['reciprocal', ['add', x, ['exp', ['lambertw', x]]]],
};

// Analytically compute the derivative of the given AST
// with respect to variable `arg`.
function diff(ast: ASTNode, arg: ASTNode, compile: (a: ASTNode) => ASTNode): ASTNode {
    if (ast === null) {return ZERO;}
    const argArr = arg as [string, ...any[]];
    if (argArr[0] !== 'variable') {return ZERO;}

    if (!Array.isArray(ast)) {return ZERO;}
    if (ast[0] === 'constant' || ast[0] === 'number') {return ZERO;}
    if (ast[0] === 'variable') {return (ast[1] === argArr[1]) ? ONE : ZERO;}

    if (!contains(ast, argArr[1])) {return ZERO;}

    const [operator, ...args] = ast as [string, ...any[]];

    // Sum rule
    if (operator === 'add' || operator === 'sub') {
        return compile([operator, ...args.map(x => diff(x as ASTNode, arg, compile))]);
    }
    
    // Product rule
    if (operator === 'mul') {
        return compile(['add',
            compile(['mul', args[0], diff(args[1] as ASTNode, arg, compile)]),
            compile(['mul', args[1], diff(args[0] as ASTNode, arg, compile)]),
        ]);
    }
    
    if (operator === 'component_mul') {
        return compile(['component_mul', diff(args[0] as ASTNode, arg, compile), args[1]]);
    }

    // Quotient rule
    if (operator === 'div') {
        return compile(['div',
            compile(['sub',
                compile(['mul', args[1], diff(args[0] as ASTNode, arg, compile)]),
                compile(['mul', args[0], diff(args[1] as ASTNode, arg, compile)])
            ]),
            ['square', compile(args[1] as ASTNode)],
        ]);
    }

    // Chain rule (analytic derivative).
    const analyticDiff = diffTable[operator];
    const internal = args[0] as ASTNode;
    if (analyticDiff !== undefined) {
        return compile(['mul', diff(internal, arg, compile), compile(analyticDiff(internal))]);
    }

    // Numerical fallback.
    console.log('numerical fallback:', ast, arg);
    return numericalDiff(ast, arg, compile);
}

function numericalDiff(ast: ASTNode, arg: ASTNode, compile: (a: ASTNode) => ASTNode): ASTNode {
    const dz = 1e-2; // Finite difference step
    const argArr = arg as [string, ...any[]];
    if (argArr[0] !== 'variable') {return ZERO;}

    const high = substitute(ast, argArr[1], ['add', arg, ['number', dz, 0]]);
    const low = substitute(ast, argArr[1], ['sub', arg, ['number', dz, 0]]);

    return compile(['component_mul', ['sub', high, low], 1/(2*dz)]);
}

export {substitute};
export default diff;
