import lodash from 'lodash';
const { get, isNil } = lodash;
import {
    zeta, eta, gamma, beta, binom, erf, lambertw,
    nome,
    theta00, theta01, theta10, theta11,
    sn, cn, dn,
    wp, wpp,
    sm, cm,
    j, e2, e4, e6, e8, e10, e12, e14, e16
} from './custom-functions';
import * as math from 'mathjs';
import { ASTNode } from '../types';

const constants: Record<string, number> = {
    'e': Math.E,
    'pi': Math.PI,
    'tau': 2 * Math.PI,
    'phi': (1 + Math.sqrt(5))/2,
};

function fract(z: any): math.Complex {return math.complex(z.re - Math.floor(z.re), z.im - Math.floor(z.im));}
const mod = (z: any, w: any) => math.multiply(w, fract(math.divide(z, w))) as unknown as math.Complex;
const add4 = (a: any, b: any, c: any, d: any) => math.add(math.add(a, b), math.add(c, d)) as unknown as math.Complex;

const I = math.complex(0, 1);
const fns: Record<string, (...args: any[]) => any> = {
    add8: (a, b, c, d, e, f, g, h) => math.add(add4(a, b, c, d), add4(e, f, g, h)),
    add4,
    mul4: (a, b, c, d) => math.multiply(math.multiply(a, b), math.multiply(c, d)),

    rawpow: math.pow,
    log: (z: any) => (z === 0 || (typeof z === 'object' && z.re === 0 && z.im === 0)) ? -1e100 : math.log((z.re < 0) ? math.add(z, math.complex(0, 1e-20)) : z), // Consistent branch cut

    sub: math.subtract,
    neg: math.unaryMinus,
    mul: math.multiply,
    div: math.divide,
    mod,
    reciprocal: (z: any) => math.divide(1, z),
    component_mul: (z: any, alpha: number) => math.complex(alpha*z.re, alpha*z.im),
    component_mul_prelog: (z: any, alpha: number) => math.complex(math.exp(alpha)*z.re, math.exp(alpha)*z.im),
    real: math.re,
    imag: math.im,
    step: (z: any) => (z.re >= 0) ? 1 : 0,

    max: (z: any, w: any) => math.complex(Math.max(z.re, w.re), Math.max(z.im, w.im)),
    min: (z: any, w: any) => math.complex(Math.min(z.re, w.re), Math.min(z.im, w.im)),

    arcsin: math.asin,
    arccos: math.acos,
    arctan: math.atan,
    arcsec: math.asec,
    arccsc: math.acsc,
    arccot: math.acot,

    arsinh: math.asinh,
    arcosh: math.acosh,
    artanh: math.atanh,
    arsech: math.asech,
    arcsch: math.acsch,
    arcoth: math.acoth,

    cis: (z: any) => math.exp(math.multiply(z, I) as any),

    gamma, beta, binom,
    eta,
    zeta,
    erf,
    lambertw,

    nome,
    theta00, theta01, theta10, theta11,
    sn, cn, dn,
    wp, wpp,
    sm, cm,
    j, e2, e4, e6, e8, e10, e12, e14, e16,
};

/**
 * Returns a JS function that evaluates the given AST.
 */
function toJS(ast: ASTNode | null, variables: Record<string, any>): (z: [number, number]) => [number, number] {
    const errorValue: [number, number] = [NaN, NaN];
    if (ast === null) {return () => errorValue;}
    if (typeof ast === 'number') {return () => [ast, 0];}
    if (!isNaN(ast as any)) {return () => [Number(ast), 0];}

    // Destructure this level of the AST
    const [operator, ...args] = ast as [string, ...any[]];

    // Complex number literal
    if (operator === 'number') {return () => args as [number, number];}

    // User-defined variable
    if (operator === 'variable') {
        const [name] = args;
        if (name === 'z') {return z => z;}
        return () => {
            const val = get(variables, name, NaN);
            if (Array.isArray(val)) {
                return [val[0], val[1]];
            }
            return [Number(val), 0];
        };
    }

    // Summation and Product loops
    if (operator === 'sum' || operator === 'prod') {
        const [expr, idxVar, low, high] = args;
        const subfn = toJS(expr as ASTNode, variables);
        return z => {
            let acc = operator === 'sum' ? math.complex(0, 0) : math.complex(1, 0);
            const mathOp = operator === 'sum' ? math.add : math.multiply;
            for (let i = low; i <= high; i++) {
                variables[idxVar] = [i, 0];
                const val = subfn(z);
                acc = mathOp(acc, math.complex(val[0], val[1])) as unknown as math.Complex;
            }
            return [acc.re, acc.im];
        };
    }

    // Built-in constant
    if (operator === 'constant') {
        const [name] = args;
        return () => [constants[name], 0];
    }

    // Built-in function
    const func = fns[operator] || (math as any)[operator];
    if (!isNil(func)) {
        const destructure = (z: any): [number, number] => isNil(z.re) ? [z, 0] : [z.re, z.im];
        return z => destructure(func(...args.map(
                subtree => math.complex(...toJS(subtree as ASTNode, variables)(z))
        )));
    }

    // Fallback if no match
    return () => errorValue;
}

export {constants, fns};
export default toJS;
