// @ts-nocheck
// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "unsigned_int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_int$ebnf$1", "symbols": ["unsigned_int$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_int", "symbols": ["unsigned_int$ebnf$1"], "postprocess": 
        function(d) {
            return parseInt(d[0].join(""));
        }
        },
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "int$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$2", "symbols": ["int$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "int", "symbols": ["int$ebnf$1", "int$ebnf$2"], "postprocess": 
        function(d) {
            if (d[0]) {
                return parseInt(d[0][0]+d[1].join(""));
            } else {
                return parseInt(d[1].join(""));
            }
        }
        },
    {"name": "unsigned_decimal$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$1", "symbols": ["unsigned_decimal$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "unsigned_decimal$ebnf$2", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "unsigned_decimal$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "unsigned_decimal", "symbols": ["unsigned_decimal$ebnf$1", "unsigned_decimal$ebnf$2"], "postprocess": 
        function(d) {
            return parseFloat(
                d[0].join("") +
                (d[1] ? "."+d[1][1].join("") : "")
            );
        }
        },
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "")
            );
        }
        },
    {"name": "percentage", "symbols": ["decimal", {"literal":"%"}], "postprocess": 
        function(d) {
            return d[0]/100;
        }
        },
    {"name": "jsonfloat$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "jsonfloat$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$2", "symbols": ["jsonfloat$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": ["jsonfloat$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "jsonfloat$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "jsonfloat$ebnf$3", "symbols": ["jsonfloat$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": ["jsonfloat$ebnf$4$subexpression$1$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$4$subexpression$1", "symbols": [/[eE]/, "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "jsonfloat$ebnf$4$subexpression$1$ebnf$2"]},
    {"name": "jsonfloat$ebnf$4", "symbols": ["jsonfloat$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat", "symbols": ["jsonfloat$ebnf$1", "jsonfloat$ebnf$2", "jsonfloat$ebnf$3", "jsonfloat$ebnf$4"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "") +
                (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : "")
            );
        }
        },
    {"name": "sum", "symbols": ["sum", "_", "sumOperator", "_", "product"], "postprocess": 
        (data) => [data[2], data[0], data[4]]
            },
    {"name": "sum", "symbols": ["product"], "postprocess": id},
    {"name": "product", "symbols": ["product", "_", "productOperator", "_", "power"], "postprocess": 
        (data) => [data[2], data[0], data[4]]
            },
    {"name": "product", "symbols": [{"literal":"-"}, "_", "power"], "postprocess": data => ['neg', data[2]]},
    {"name": "product", "symbols": ["power"], "postprocess": id},
    {"name": "power", "symbols": ["function", "_", "powerOperator", "_", "power"], "postprocess": 
        (data) => ['pow', data[0], data[4]]
            },
    {"name": "power", "symbols": ["function"], "postprocess": id},
    {"name": "function", "symbols": ["optBackslash", "unaryFunction", {"literal":"("}, "_", "sum", "_", {"literal":")"}], "postprocess": data => [data[1][0], data[4]]},
    {"name": "function", "symbols": ["optBackslash", "unaryFunction", {"literal":"["}, "_", "sum", "_", {"literal":"]"}], "postprocess": data => [data[1][0], data[4]]},
    {"name": "function", "symbols": ["optBackslash", "unaryFunction", {"literal":"{"}, "_", "sum", "_", {"literal":"}"}], "postprocess": data => [data[1][0], data[4]]},
    {"name": "function", "symbols": ["optBackslash", "binaryFunction", {"literal":"("}, "_", "sum", {"literal":","}, "_", "sum", "_", {"literal":")"}], "postprocess": data => [data[1][0], data[4], data[7]]},
    {"name": "function", "symbols": ["optBackslash", "binaryFunction", {"literal":"["}, "_", "sum", {"literal":","}, "_", "sum", "_", {"literal":"]"}], "postprocess": data => [data[1][0], data[4], data[7]]},
    {"name": "function", "symbols": ["optBackslash", "binaryFunction", {"literal":"{"}, "_", "sum", {"literal":","}, "_", "sum", "_", {"literal":"}"}], "postprocess": data => [data[1][0], data[4], data[7]]},
    {"name": "function", "symbols": ["optBackslash", "fourFunction", {"literal":"("}, "_", "sum", {"literal":","}, "_", "sum", {"literal":","}, "_", "sum", {"literal":","}, "_", "sum", "_", {"literal":")"}], "postprocess": data => [data[1][0], data[4], data[7], data[10], data[13]]},
    {"name": "function", "symbols": ["optBackslash", "fourFunction", {"literal":"["}, "_", "sum", {"literal":","}, "_", "sum", {"literal":","}, "_", "sum", {"literal":","}, "_", "sum", "_", {"literal":"]"}], "postprocess": data => [data[1][0], data[4], data[7], data[10], data[13]]},
    {"name": "function", "symbols": ["optBackslash", "fourFunction", {"literal":"{"}, "_", "sum", {"literal":","}, "_", "sum", {"literal":","}, "_", "sum", {"literal":","}, "_", "sum", "_", {"literal":"}"}], "postprocess": data => [data[1][0], data[4], data[7], data[10], data[13]]},
    {"name": "function", "symbols": ["optBackslash", "diffFunction", {"literal":"("}, "_", "sum", "_", {"literal":")"}], "postprocess": data => [data[1][0], data[4], ['variable', 'z']]},
    {"name": "function", "symbols": ["optBackslash", "diffFunction", {"literal":"["}, "_", "sum", "_", {"literal":"]"}], "postprocess": data => [data[1][0], data[4], ['variable', 'z']]},
    {"name": "function", "symbols": ["optBackslash", "diffFunction", {"literal":"{"}, "_", "sum", "_", {"literal":"}"}], "postprocess": data => [data[1][0], data[4], ['variable', 'z']]},
    {"name": "function", "symbols": ["optBackslash", "fourFunction", {"literal":"_"}, "_", "loopInitializer", "_", {"literal":"^"}, "_", "loopLimit", "_", "sum"], "postprocess": 
        (data) => {
            const op = data[1][0];
            const [idxVar, low] = data[4];
            const high = data[8];
            const expr = data[10];
            return [op, expr, idxVar[1], low, high];
        }
            },
    {"name": "function", "symbols": ["fraction"], "postprocess": id},
    {"name": "function", "symbols": ["parenthesis2"], "postprocess": id},
    {"name": "loopInitializer", "symbols": [{"literal":"{"}, "_", "variable", "_", {"literal":"="}, "_", "sum", "_", {"literal":"}"}], "postprocess": data => [data[2], data[6]]},
    {"name": "loopInitializer", "symbols": [{"literal":"("}, "_", "variable", "_", {"literal":"="}, "_", "sum", "_", {"literal":")"}], "postprocess": data => [data[2], data[6]]},
    {"name": "loopInitializer", "symbols": ["variable", "_", {"literal":"="}, "_", "sum"], "postprocess": data => [data[0], data[4]]},
    {"name": "loopLimit", "symbols": [{"literal":"{"}, "_", "sum", "_", {"literal":"}"}], "postprocess": data => data[2]},
    {"name": "loopLimit", "symbols": [{"literal":"("}, "_", "sum", "_", {"literal":")"}], "postprocess": data => data[2]},
    {"name": "loopLimit", "symbols": ["literal"], "postprocess": id},
    {"name": "fraction$string$1", "symbols": [{"literal":"f"}, {"literal":"r"}, {"literal":"a"}, {"literal":"c"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fraction", "symbols": ["optBackslash", "fraction$string$1", "parenthesis", "parenthesis"], "postprocess": 
        (data) => ['div', data[2], data[3]]
            },
    {"name": "parenthesis", "symbols": [{"literal":"("}, "sum", {"literal":")"}], "postprocess": (data) => data[1]},
    {"name": "parenthesis", "symbols": [{"literal":"["}, "sum", {"literal":"]"}], "postprocess": (data) => data[1]},
    {"name": "parenthesis", "symbols": [{"literal":"{"}, "sum", {"literal":"}"}], "postprocess": (data) => data[1]},
    {"name": "parenthesis", "symbols": ["literal"], "postprocess": id},
    {"name": "parenthesis2", "symbols": ["parenthesis"], "postprocess": id},
    {"name": "parenthesis2", "symbols": ["parenthesis", {"literal":"!"}], "postprocess": (data) => ['factorial', data[0]]},
    {"name": "sumOperator", "symbols": [{"literal":"+"}], "postprocess": () => 'add'},
    {"name": "sumOperator", "symbols": [{"literal":"-"}], "postprocess": () => 'sub'},
    {"name": "sumOperator", "symbols": [{"literal":"−"}], "postprocess": () => 'sub'},
    {"name": "productOperator", "symbols": [{"literal":"*"}], "postprocess": () => 'mul'},
    {"name": "productOperator", "symbols": [{"literal":"×"}], "postprocess": () => 'mul'},
    {"name": "productOperator", "symbols": [{"literal":"/"}], "postprocess": () => 'div'},
    {"name": "productOperator", "symbols": [{"literal":"%"}], "postprocess": () => 'mod'},
    {"name": "powerOperator$string$1", "symbols": [{"literal":"*"}, {"literal":"*"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "powerOperator", "symbols": ["powerOperator$string$1"]},
    {"name": "powerOperator", "symbols": [{"literal":"^"}]},
    {"name": "optBackslash", "symbols": [{"literal":"\\"}], "postprocess": () => null},
    {"name": "optBackslash", "symbols": []},
    {"name": "fourFunction$string$1", "symbols": [{"literal":"s"}, {"literal":"u"}, {"literal":"m"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fourFunction", "symbols": ["fourFunction$string$1"], "postprocess": () => ['sum']},
    {"name": "fourFunction$string$2", "symbols": [{"literal":"p"}, {"literal":"r"}, {"literal":"o"}, {"literal":"d"}, {"literal":"u"}, {"literal":"c"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fourFunction", "symbols": ["fourFunction$string$2"], "postprocess": () => ['prod']},
    {"name": "fourFunction$string$3", "symbols": [{"literal":"p"}, {"literal":"r"}, {"literal":"o"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fourFunction", "symbols": ["fourFunction$string$3"], "postprocess": () => ['prod']},
    {"name": "binaryFunction$string$1", "symbols": [{"literal":"b"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$1"], "postprocess": () => ['beta']},
    {"name": "binaryFunction$string$2", "symbols": [{"literal":"b"}, {"literal":"i"}, {"literal":"n"}, {"literal":"o"}, {"literal":"m"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$2"], "postprocess": () => ['binom']},
    {"name": "binaryFunction$string$3", "symbols": [{"literal":"b"}, {"literal":"i"}, {"literal":"n"}, {"literal":"o"}, {"literal":"m"}, {"literal":"i"}, {"literal":"a"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$3"], "postprocess": () => ['binom']},
    {"name": "binaryFunction$string$4", "symbols": [{"literal":"c"}, {"literal":"h"}, {"literal":"o"}, {"literal":"o"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$4"], "postprocess": () => ['binom']},
    {"name": "binaryFunction$string$5", "symbols": [{"literal":"s"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$5"], "postprocess": () => ['sn']},
    {"name": "binaryFunction$string$6", "symbols": [{"literal":"c"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$6"], "postprocess": () => ['cn']},
    {"name": "binaryFunction$string$7", "symbols": [{"literal":"d"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$7"], "postprocess": () => ['dn']},
    {"name": "binaryFunction$string$8", "symbols": [{"literal":"m"}, {"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$8"], "postprocess": () => ['min']},
    {"name": "binaryFunction$string$9", "symbols": [{"literal":"m"}, {"literal":"a"}, {"literal":"x"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$9"], "postprocess": () => ['max']},
    {"name": "binaryFunction$string$10", "symbols": [{"literal":"w"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$10"], "postprocess": () => ['wp']},
    {"name": "binaryFunction$string$11", "symbols": [{"literal":"w"}, {"literal":"p"}, {"literal":"'"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$11"], "postprocess": () => ['wpp']},
    {"name": "binaryFunction$string$12", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$12"], "postprocess": () => ['theta00']},
    {"name": "binaryFunction$string$13", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}, {"literal":"0"}, {"literal":"1"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$13"], "postprocess": () => ['theta01']},
    {"name": "binaryFunction$string$14", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}, {"literal":"1"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$14"], "postprocess": () => ['theta10']},
    {"name": "binaryFunction$string$15", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}, {"literal":"1"}, {"literal":"1"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "binaryFunction", "symbols": ["binaryFunction$string$15"], "postprocess": () => ['theta11']},
    {"name": "binaryFunction", "symbols": ["diffFunction"], "postprocess": x => x[0]},
    {"name": "diffFunction$string$1", "symbols": [{"literal":"d"}, {"literal":"e"}, {"literal":"r"}, {"literal":"i"}, {"literal":"v"}, {"literal":"a"}, {"literal":"t"}, {"literal":"i"}, {"literal":"v"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "diffFunction", "symbols": ["diffFunction$string$1"], "postprocess": () => ['diff']},
    {"name": "diffFunction$string$2", "symbols": [{"literal":"d"}, {"literal":"i"}, {"literal":"f"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "diffFunction", "symbols": ["diffFunction$string$2"], "postprocess": () => ['diff']},
    {"name": "unaryFunction", "symbols": ["trigFunction"], "postprocess": (data) => [data[0]]},
    {"name": "unaryFunction$string$1", "symbols": [{"literal":"a"}, {"literal":"t"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$1"], "postprocess": () => ['arctan']},
    {"name": "unaryFunction$string$2", "symbols": [{"literal":"a"}, {"literal":"r"}, {"literal":"c"}, {"literal":"t"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$2"], "postprocess": () => ['arctan']},
    {"name": "unaryFunction$string$3", "symbols": [{"literal":"c"}, {"literal":"i"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$3"], "postprocess": () => ['cis']},
    {"name": "unaryFunction$string$4", "symbols": [{"literal":"e"}, {"literal":"x"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$4"], "postprocess": () => ['exp']},
    {"name": "unaryFunction$string$5", "symbols": [{"literal":"l"}, {"literal":"o"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$5"], "postprocess": () => ['log']},
    {"name": "unaryFunction$string$6", "symbols": [{"literal":"l"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$6"], "postprocess": () => ['log']},
    {"name": "unaryFunction$string$7", "symbols": [{"literal":"s"}, {"literal":"q"}, {"literal":"r"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$7"], "postprocess": () => ['sqrt']},
    {"name": "unaryFunction", "symbols": [{"literal":"√"}], "postprocess": () => ['sqrt']},
    {"name": "unaryFunction$string$8", "symbols": [{"literal":"g"}, {"literal":"a"}, {"literal":"m"}, {"literal":"m"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$8"], "postprocess": () => ['gamma']},
    {"name": "unaryFunction$string$9", "symbols": [{"literal":"e"}, {"literal":"t"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$9"], "postprocess": () => ['eta']},
    {"name": "unaryFunction$string$10", "symbols": [{"literal":"z"}, {"literal":"e"}, {"literal":"t"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$10"], "postprocess": () => ['zeta']},
    {"name": "unaryFunction$string$11", "symbols": [{"literal":"e"}, {"literal":"r"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$11"], "postprocess": () => ['erf']},
    {"name": "unaryFunction$string$12", "symbols": [{"literal":"a"}, {"literal":"b"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$12"], "postprocess": () => ['abs']},
    {"name": "unaryFunction$string$13", "symbols": [{"literal":"a"}, {"literal":"r"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$13"], "postprocess": () => ['arg']},
    {"name": "unaryFunction$string$14", "symbols": [{"literal":"s"}, {"literal":"g"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$14"], "postprocess": () => ['sgn']},
    {"name": "unaryFunction$string$15", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"n"}, {"literal":"j"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$15"], "postprocess": () => ['conj']},
    {"name": "unaryFunction$string$16", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"a"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$16"], "postprocess": () => ['real']},
    {"name": "unaryFunction$string$17", "symbols": [{"literal":"i"}, {"literal":"m"}, {"literal":"a"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$17"], "postprocess": () => ['imag']},
    {"name": "unaryFunction$string$18", "symbols": [{"literal":"f"}, {"literal":"l"}, {"literal":"o"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$18"], "postprocess": () => ['floor']},
    {"name": "unaryFunction$string$19", "symbols": [{"literal":"c"}, {"literal":"e"}, {"literal":"i"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$19"], "postprocess": () => ['ceil']},
    {"name": "unaryFunction$string$20", "symbols": [{"literal":"r"}, {"literal":"o"}, {"literal":"u"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$20"], "postprocess": () => ['round']},
    {"name": "unaryFunction$string$21", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"e"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$21"], "postprocess": () => ['step']},
    {"name": "unaryFunction$string$22", "symbols": [{"literal":"r"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$22"], "postprocess": () => ['real']},
    {"name": "unaryFunction$string$23", "symbols": [{"literal":"i"}, {"literal":"m"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$23"], "postprocess": () => ['imag']},
    {"name": "unaryFunction$string$24", "symbols": [{"literal":"n"}, {"literal":"o"}, {"literal":"m"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$24"], "postprocess": () => ['nome']},
    {"name": "unaryFunction$string$25", "symbols": [{"literal":"s"}, {"literal":"m"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$25"], "postprocess": () => ['sm']},
    {"name": "unaryFunction$string$26", "symbols": [{"literal":"c"}, {"literal":"m"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$26"], "postprocess": () => ['cm']},
    {"name": "unaryFunction", "symbols": [{"literal":"j"}], "postprocess": () => ['j']},
    {"name": "unaryFunction$string$27", "symbols": [{"literal":"e"}, {"literal":"4"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$27"], "postprocess": () => ['e4']},
    {"name": "unaryFunction$string$28", "symbols": [{"literal":"e"}, {"literal":"6"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$28"], "postprocess": () => ['e6']},
    {"name": "unaryFunction$string$29", "symbols": [{"literal":"e"}, {"literal":"8"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$29"], "postprocess": () => ['e8']},
    {"name": "unaryFunction$string$30", "symbols": [{"literal":"e"}, {"literal":"1"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$30"], "postprocess": () => ['e10']},
    {"name": "unaryFunction$string$31", "symbols": [{"literal":"e"}, {"literal":"1"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$31"], "postprocess": () => ['e12']},
    {"name": "unaryFunction$string$32", "symbols": [{"literal":"e"}, {"literal":"1"}, {"literal":"4"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$32"], "postprocess": () => ['e14']},
    {"name": "unaryFunction$string$33", "symbols": [{"literal":"e"}, {"literal":"1"}, {"literal":"6"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$33"], "postprocess": () => ['e16']},
    {"name": "unaryFunction$string$34", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"m"}, {"literal":"b"}, {"literal":"e"}, {"literal":"r"}, {"literal":"t"}, {"literal":"w"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "unaryFunction", "symbols": ["unaryFunction$string$34"], "postprocess": () => ['lambertw']},
    {"name": "baseTrigFunction$string$1", "symbols": [{"literal":"s"}, {"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$1"]},
    {"name": "baseTrigFunction$string$2", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$2"]},
    {"name": "baseTrigFunction$string$3", "symbols": [{"literal":"t"}, {"literal":"a"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$3"]},
    {"name": "baseTrigFunction$string$4", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"c"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$4"]},
    {"name": "baseTrigFunction$string$5", "symbols": [{"literal":"c"}, {"literal":"s"}, {"literal":"c"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$5"]},
    {"name": "baseTrigFunction$string$6", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$6"]},
    {"name": "baseTrigFunction$string$7", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$7"], "postprocess": () => 'sin'},
    {"name": "baseTrigFunction$string$8", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"n"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$8"], "postprocess": () => 'sin'},
    {"name": "baseTrigFunction$string$9", "symbols": [{"literal":"t"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "baseTrigFunction", "symbols": ["baseTrigFunction$string$9"], "postprocess": () => 'tan'},
    {"name": "hyperbolicTrigFunction", "symbols": ["baseTrigFunction", {"literal":"h"}], "postprocess": (data) => data.join('')},
    {"name": "trigFunction$ebnf$1$string$1", "symbols": [{"literal":"a"}, {"literal":"r"}, {"literal":"c"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "trigFunction$ebnf$1", "symbols": ["trigFunction$ebnf$1$string$1"], "postprocess": id},
    {"name": "trigFunction$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "trigFunction", "symbols": ["trigFunction$ebnf$1", "baseTrigFunction"], "postprocess": (data) => data.join('')},
    {"name": "trigFunction", "symbols": [{"literal":"a"}, "baseTrigFunction"], "postprocess": (data) => 'arc' + data[1]},
    {"name": "trigFunction$ebnf$2$string$1", "symbols": [{"literal":"a"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "trigFunction$ebnf$2", "symbols": ["trigFunction$ebnf$2$string$1"], "postprocess": id},
    {"name": "trigFunction$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "trigFunction", "symbols": ["trigFunction$ebnf$2", "hyperbolicTrigFunction"], "postprocess": (data) => data.join('')},
    {"name": "literal", "symbols": ["complexNumber"], "postprocess": id},
    {"name": "literal$string$1", "symbols": [{"literal":"p"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "literal", "symbols": ["optBackslash", "literal$string$1"], "postprocess": () => ['constant', 'pi']},
    {"name": "literal$string$2", "symbols": [{"literal":"t"}, {"literal":"a"}, {"literal":"u"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "literal", "symbols": ["optBackslash", "literal$string$2"], "postprocess": () => ['constant', 'tau']},
    {"name": "literal$string$3", "symbols": [{"literal":"p"}, {"literal":"h"}, {"literal":"i"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "literal", "symbols": ["optBackslash", "literal$string$3"], "postprocess": () => ['constant', 'phi']},
    {"name": "literal", "symbols": [{"literal":"π"}], "postprocess": () => ['constant', 'pi']},
    {"name": "literal", "symbols": [{"literal":"τ"}], "postprocess": () => ['constant', 'tau']},
    {"name": "literal", "symbols": [{"literal":"φ"}], "postprocess": () => ['constant', 'phi']},
    {"name": "literal", "symbols": [{"literal":"ϕ"}], "postprocess": () => ['constant', 'phi']},
    {"name": "literal", "symbols": ["variable"], "postprocess": id},
    {"name": "variable$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "variable$ebnf$1", "symbols": ["variable$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "variable", "symbols": ["variable$ebnf$1"], "postprocess": 
        function(data, l, reject) {
            const constants = ['e', 'pi', 'tau', 'phi'];
            const token = data[0].join('')
            if (token === 'i') {return reject;}
            return constants.includes(token) ? ['constant', token] : ['variable', token];
        }
        },
    {"name": "complexNumber", "symbols": ["decimal"], "postprocess": (data) => ['number', data[0], 0]},
    {"name": "complexNumber", "symbols": ["decimal", {"literal":"i"}], "postprocess": (data) => ['number', 0, data[0]]},
    {"name": "complexNumber", "symbols": [{"literal":"i"}], "postprocess": () => ['number', 0, 1]}
]
  , ParserStart: "sum"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   // window.grammar = grammar;
}
export default grammar;
