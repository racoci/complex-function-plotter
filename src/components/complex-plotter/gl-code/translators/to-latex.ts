import { ASTNode } from '../types';

export function toLaTeX(ast: ASTNode | null): string {
    if (ast === null) return '';
    if (typeof ast === 'number' || !isNaN(ast as any)) {
        return ast.toString();
    }
    if (!Array.isArray(ast)) return ast as string;

    const [operator, ...args] = ast as [string, ...any[]];

    if (operator === 'number') {
        const [real, imag] = args;
        if (imag === 0) return real.toString();
        if (real === 0) {
            if (imag === 1) return 'i';
            if (imag === -1) return '-i';
            return `${imag}i`;
        }
        const sign = imag >= 0 ? '+' : '';
        const imagStr = imag === 1 ? 'i' : (imag === -1 ? '-i' : `${imag}i`);
        return `${real}${sign}${imagStr}`;
    }

    if (operator === 'variable') {
        const [name] = args;
        return name;
    }

    if (operator === 'constant') {
        const [name] = args;
        if (name === 'pi') return '\\pi';
        if (name === 'tau') return '\\tau';
        if (name === 'phi') return '\\phi';
        return name;
    }

    if (operator === 'neg') {
        const child = toLaTeX(args[0]);
        return `-${child}`;
    }

    if (operator === 'add' || operator === 'sub') {
        const left = toLaTeX(args[0]);
        const right = toLaTeX(args[1]);
        const op = operator === 'add' ? '+' : '-';
        return `${left} ${op} ${right}`;
    }

    if (operator === 'mul') {
        const left = toLaTeX(args[0]);
        const right = toLaTeX(args[1]);
        return `${left} \\cdot ${right}`;
    }

    if (operator === 'div') {
        const num = toLaTeX(args[0]);
        const den = toLaTeX(args[1]);
        return `\\frac{${num}}{${den}}`;
    }

    if (operator === 'pow') {
        const base = toLaTeX(args[0]);
        const exponent = toLaTeX(args[1]);
        return `{${base}}^{${exponent}}`;
    }

    if (operator === 'sum' || operator === 'prod') {
        const [expr, idxVar, low, high] = args;
        const opSym = operator === 'sum' ? '\\sum' : '\\prod';
        const lowStr = toLaTeX(low);
        const highStr = toLaTeX(high);
        const exprStr = toLaTeX(expr as ASTNode);
        return `${opSym}_{${idxVar}=${lowStr}}^{${highStr}} ${exprStr}`;
    }

    // Unary functions
    const latexFns: Record<string, string> = {
        'sin': '\\sin',
        'cos': '\\cos',
        'tan': '\\tan',
        'sec': '\\sec',
        'csc': '\\csc',
        'cot': '\\cot',
        'sinh': '\\sinh',
        'cosh': '\\cosh',
        'tanh': '\\tanh',
        'exp': '\\exp',
        'log': '\\log',
        'sqrt': '\\sqrt',
        'arcsin': '\\arcsin',
        'arccos': '\\arccos',
        'arctan': '\\arctan',
        'zeta': '\\zeta',
        'eta': '\\eta',
        'gamma': '\\gamma',
        'erf': '\\erf',
        'abs': '\\left| ',
        'arg': '\\arg',
        'conj': '\\overline',
    };

    if (operator in latexFns) {
        const fnSym = latexFns[operator];
        const arg = toLaTeX(args[0]);
        if (operator === 'abs') {
            return `\\left|${arg}\\right|`;
        }
        if (operator === 'conj') {
            return `\\overline{${arg}}`;
        }
        return `${fnSym}\\left(${arg}\\right)`;
    }

    // Default fallback
    return `${operator}\\left(${args.map(toLaTeX).join(', ')}\\right)`;
}

export default toLaTeX;
