/**
 * Converter from MathLive's raw LaTeX output into the algebraic string format
 * expected by our Nearley parser grammar.
 */
export function convertMathLiveToAlgebraic(latex: string): string {
    if (!latex) return "";
    
    let algebraic = latex;
    
    // 1. Clean up spacing and arbitrary MathLive formatting artifacts
    algebraic = algebraic.replace(/\\left/g, '');
    algebraic = algebraic.replace(/\\right/g, '');
    algebraic = algebraic.replace(/\\,/g, ' ');
    algebraic = algebraic.replace(/\\:/g, ' ');
    algebraic = algebraic.replace(/\\;/g, ' ');
    algebraic = algebraic.replace(/\\ /g, ' ');
    algebraic = algebraic.replace(/\\!/g, '');
    algebraic = algebraic.replace(/\\mleft/g, '');
    algebraic = algebraic.replace(/\\mright/g, '');

    // 2. Fractions: \frac{a}{b} -> (a)/(b)
    // We must handle nested fractions, so a regex with a simple replacer loop is best
    let previous = "";
    while (previous !== algebraic) {
        previous = algebraic;
        // Match \frac{A}{B} where A and B can contain non-braced characters
        // Note: For arbitrary nested braces we would need a proper parenthesis balancer, 
        // but for typical MathLive output this loop unrolls from inside out.
        algebraic = algebraic.replace(/\\frac{([^{}]*)}{([^{}]*)}/g, '($1)/($2)');
    }
    
    // 3. Mathematical Constants
    algebraic = algebraic.replace(/\\pi/g, 'pi');
    algebraic = algebraic.replace(/\\tau/g, 'tau');
    algebraic = algebraic.replace(/\\gamma/g, 'gamma');
    algebraic = algebraic.replace(/\\zeta/g, 'zeta');
    algebraic = algebraic.replace(/\\eta/g, 'eta');
    
    // 4. Mathematical Functions
    algebraic = algebraic.replace(/\\sin/g, 'sin');
    algebraic = algebraic.replace(/\\cos/g, 'cos');
    algebraic = algebraic.replace(/\\tan/g, 'tan');
    algebraic = algebraic.replace(/\\sec/g, 'sec');
    algebraic = algebraic.replace(/\\csc/g, 'csc');
    algebraic = algebraic.replace(/\\cot/g, 'cot');
    algebraic = algebraic.replace(/\\exp/g, 'exp');
    algebraic = algebraic.replace(/\\log/g, 'log');
    algebraic = algebraic.replace(/\\ln/g, 'ln');
    
    // 5. Square roots: \sqrt{a} -> sqrt(a)
    // and \sqrt[n]{a} -> a^(1/n)
    previous = "";
    while (previous !== algebraic) {
        previous = algebraic;
        algebraic = algebraic.replace(/\\sqrt\[([^{}\[\]]*)\]{([^{}]*)}/g, '($2)^(1/($1))');
        algebraic = algebraic.replace(/\\sqrt{([^{}]*)}/g, 'sqrt($1)');
    }
    
    // 6. Absolute value: |a| or \lvert a \rvert -> abs(a)
    algebraic = algebraic.replace(/\\lvert/g, '|');
    algebraic = algebraic.replace(/\\rvert/g, '|');
    previous = "";
    while (previous !== algebraic) {
        previous = algebraic;
        algebraic = algebraic.replace(/\|([^|]*)\|/g, 'abs($1)');
    }
    
    // 7. Exponentiation cleanup: x^{a} -> x^(a)
    algebraic = algebraic.replace(/\^{([^{}]*)}/g, '^($1)');
    
    // 8. Multiplication placeholders
    algebraic = algebraic.replace(/\\cdot/g, '*');
    algebraic = algebraic.replace(/\\times/g, '*');
    
    // 9. Remove lingering unmapped backslash commands to avoid parser crash 
    // (except sum/prod which our grammar might handle natively or we can map them)
    algebraic = algebraic.replace(/\\sum/g, 'sum');
    algebraic = algebraic.replace(/\\prod/g, 'prod');
    
    // Drop all other structural latex commands (e.g. \mathrm, \mathbf)
    algebraic = algebraic.replace(/\\[a-zA-Z]+/g, '');
    
    return algebraic.trim();
}
