@builtin "whitespace.ne"
@builtin "number.ne"

# Defined this way for correct associativity + precedence

sum ->
    sum _ sumOperator _ product {%
        (data) => [data[2], data[0], data[4]]
    %}
    | product {% id %}

product -> 
    product _ productOperator _ power {%
        (data) => [data[2], data[0], data[4]]
    %}
    | "-" _ power {% data => ['neg', data[2]] %}
    | power {% id %}

power ->
    function _ powerOperator _ power {%
        (data) => ['pow', data[0], data[4]]
    %}
    | function {% id %}

function ->
    optBackslash unaryFunction "(" _ sum _ ")" {% data => [data[1][0], data[4]] %}
    | optBackslash unaryFunction "[" _ sum _ "]" {% data => [data[1][0], data[4]] %}
    | optBackslash unaryFunction "{" _ sum _ "}" {% data => [data[1][0], data[4]] %}
    | optBackslash binaryFunction "(" _ sum "," _ sum _ ")" {% data => [data[1][0], data[4], data[7]] %}
    | optBackslash binaryFunction "[" _ sum "," _ sum _ "]" {% data => [data[1][0], data[4], data[7]] %}
    | optBackslash binaryFunction "{" _ sum "," _ sum _ "}" {% data => [data[1][0], data[4], data[7]] %}
    | optBackslash fourFunction "(" _ sum "," _ sum "," _ sum "," _ sum _ ")" {% data => [data[1][0], data[4], data[7], data[10], data[13]] %}
    | optBackslash fourFunction "[" _ sum "," _ sum "," _ sum "," _ sum _ "]" {% data => [data[1][0], data[4], data[7], data[10], data[13]] %}
    | optBackslash fourFunction "{" _ sum "," _ sum "," _ sum "," _ sum _ "}" {% data => [data[1][0], data[4], data[7], data[10], data[13]] %}
    | optBackslash diffFunction "(" _ sum _ ")" {% data => [data[1][0], data[4], ['variable', 'z']] %}
    | optBackslash diffFunction "[" _ sum _ "]" {% data => [data[1][0], data[4], ['variable', 'z']] %}
    | optBackslash diffFunction "{" _ sum _ "}" {% data => [data[1][0], data[4], ['variable', 'z']] %}
    | optBackslash fourFunction "_" _ loopInitializer _ "^" _ loopLimit _ sum {%
        (data) => {
            const op = data[1][0];
            const [idxVar, low] = data[4];
            const high = data[8];
            const expr = data[10];
            return [op, expr, idxVar[1], low, high];
        }
    %}
    | fraction {% id %}
    | parenthesis2 {% id %}

loopInitializer ->
    "{" _ variable _ "=" _ sum _ "}" {% data => [data[2], data[6]] %}
    | "(" _ variable _ "=" _ sum _ ")" {% data => [data[2], data[6]] %}
    | variable _ "=" _ sum {% data => [data[0], data[4]] %}

loopLimit ->
    "{" _ sum _ "}" {% data => data[2] %}
    | "(" _ sum _ ")" {% data => data[2] %}
    | literal {% id %}

fraction ->
    optBackslash "frac" parenthesis parenthesis {%
        (data) => ['div', data[2], data[3]]
    %}

parenthesis ->
    "(" sum ")" {% (data) => data[1] %}
    | "[" sum "]" {% (data) => data[1] %}
    | "{" sum "}" {% (data) => data[1] %}
    | literal {% id %}

parenthesis2 ->
    parenthesis {% id %}
    | parenthesis "!" {% (data) => ['factorial', data[0]] %}


##### Operators #####
sumOperator ->
    "+" {% () => 'add' %}
    | "-" {% () => 'sub' %}
    | "−" {% () => 'sub' %}

productOperator ->
    "*" {% () => 'mul' %}
    | "×" {% () => 'mul' %}
    | "/" {% () => 'div' %}
    | "%" {% () => 'mod' %}

powerOperator -> "**" | "^"

optBackslash ->
    "\\" {% () => null %}
    | null

##### Functions #####
fourFunction ->
   "sum" {% () => ['sum'] %}
   | "product" {% () => ['prod'] %}
   | "prod" {% () => ['prod'] %}

binaryFunction ->
   "beta" {% () => ['beta'] %}
   | "binom" {% () => ['binom'] %}
   | "binomial" {% () => ['binom'] %}
   | "choose" {% () => ['binom'] %}
   | "sn" {% () => ['sn'] %}
   | "cn" {% () => ['cn'] %}
   | "dn" {% () => ['dn'] %}
   | "min" {% () => ['min'] %}
   | "max" {% () => ['max'] %}
   | "wp" {% () => ['wp'] %}
   | "wp'" {% () => ['wpp'] %}
   | "theta00" {% () => ['theta00'] %}
   | "theta01" {% () => ['theta01'] %}
   | "theta10" {% () => ['theta10'] %}
   | "theta11" {% () => ['theta11'] %}
   | diffFunction {% x => x[0] %}

diffFunction ->
   "derivative" {% () => ['diff'] %}
   | "diff" {% () => ['diff'] %}

unaryFunction ->
   trigFunction {% (data) => [data[0]] %}
   | "atg" {% () => ['arctan'] %}
   | "arctg" {% () => ['arctan'] %}
   | "cis" {% () => ['cis'] %}
   | "exp" {% () => ['exp'] %}
   | "log" {% () => ['log'] %}
   | "ln" {% () => ['log'] %}
   | "sqrt" {% () => ['sqrt'] %}
   | "√" {% () => ['sqrt'] %}
   | "gamma" {% () => ['gamma'] %}
   | "eta" {% () => ['eta'] %}
   | "zeta" {% () => ['zeta'] %}
   | "erf" {% () => ['erf'] %}
   | "abs" {% () => ['abs'] %}
   | "arg" {% () => ['arg'] %}
   | "sgn" {% () => ['sgn'] %}
   | "conj" {% () => ['conj'] %}
   | "real" {% () => ['real'] %}
   | "imag" {% () => ['imag'] %}
   | "floor" {% () => ['floor'] %}
   | "ceil" {% () => ['ceil'] %}
   | "round" {% () => ['round'] %}
   | "step" {% () => ['step'] %}
   | "re" {% () => ['real'] %}
   | "im" {% () => ['imag'] %}
   | "nome" {% () => ['nome'] %}
   | "sm" {% () => ['sm'] %}
   | "cm" {% () => ['cm'] %}
   | "j" {% () => ['j'] %}
   | "e4" {% () => ['e4'] %}
   | "e6" {% () => ['e6'] %}
   | "e8" {% () => ['e8'] %}
   | "e10" {% () => ['e10'] %}
   | "e12" {% () => ['e12'] %}
   | "e14" {% () => ['e14'] %}
   | "e16" {% () => ['e16'] %}
   | "lambertw" {% () => ['lambertw'] %}

# Trigonometric functions
baseTrigFunction ->
   "sin" | "cos" | "tan" | "sec" | "csc" | "cot"
   | "sen" {% () => 'sin' %}
   | "seno" {% () => 'sin' %}
   | "tg" {% () => 'tan' %}

hyperbolicTrigFunction ->
   baseTrigFunction "h" {% (data) => data.join('') %}

trigFunction ->
   "arc":? baseTrigFunction {% (data) => data.join('') %}
   | "a" baseTrigFunction {% (data) => 'arc' + data[1] %}
   | "ar":? hyperbolicTrigFunction {% (data) => data.join('') %}

##### Literals #####
literal ->
    complexNumber {% id %}
    | optBackslash "pi" {% () => ['constant', 'pi'] %}
    | optBackslash "tau" {% () => ['constant', 'tau'] %}
    | optBackslash "phi" {% () => ['constant', 'phi'] %}
    | "π" {% () => ['constant', 'pi'] %}
    | "τ" {% () => ['constant', 'tau'] %}
    | "φ" {% () => ['constant', 'phi'] %}
    | "ϕ" {% () => ['constant', 'phi'] %}
    | variable {% id %}


variable -> [a-z]:+ {%
    function(data, l, reject) {
        const constants = ['e', 'pi', 'tau', 'phi'];
        const token = data[0].join('')
        if (token === 'i') {return reject;}
        return constants.includes(token) ? ['constant', token] : ['variable', token];
    }
%}

complexNumber ->
    decimal {% (data) => ['number', data[0], 0] %}
    | decimal "i" {% (data) => ['number', 0, data[0]] %}
    | "i" {% () => ['number', 0, 1] %}
