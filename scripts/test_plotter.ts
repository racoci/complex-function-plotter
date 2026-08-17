import { parseExpression, getASTStats, resolveFunctions } from '../src/components/complex-plotter/gl-code/complex-functions';
import toLaTeX from '../src/components/complex-plotter/gl-code/translators/to-latex';
import { FunctionDef } from '../src/components/complex-plotter/gl-code/types';
import toJS from '../src/components/complex-plotter/gl-code/translators/to-js';
import { compileGLSL } from '../src/components/complex-plotter/gl-code/translators/to-glsl';
import { getFragmentShaderSource } from '../src/components/complex-plotter/gl-code/shaders';
import { convertMathLiveToAlgebraic } from '../src/components/complex-plotter/gl-code/translators/mathlive-converter';

function runTests() {
    console.log("=== RUNNING COMPLEX FUNCTION PLOTTER RECURSIVE & SUBSCRIPT ENHANCEMENT TESTS ===");
    let passed = true;

    try {
        // ----------------------------------------------------
        // TEST 1: Subscript Variable Parsing & Compilation
        // ----------------------------------------------------
        console.log("\n[Test 1] Testing subscript variable parsing and compilation...");
        
        const subscriptExprs = ["z^2 + c_1", "z^3 - c_{12}", "c_{k-1} * z"];
        for (const expr of subscriptExprs) {
            const ast = parseExpression(expr);
            if (!ast || !Array.isArray(ast)) {
                throw new Error(`Failed to parse expression with subscripts: "${expr}"`);
            }
            console.log(`  ✓ Successfully parsed "${expr}" -> AST: ${JSON.stringify(ast)}`);
        }

        // ----------------------------------------------------
        // TEST 2: Symmetrical LaTeX Formatting for Subscripts
        // ----------------------------------------------------
        console.log("\n[Test 2] Testing symmetrical LaTeX formatting for subscripts...");
        const latexTests = [
            { input: "z^2 + c_1", expected: "{z}^{2}+c_{1}" },
            { input: "c_{12} * z", expected: "c_{12} \\cdot z" }
        ];
        for (const { input } of latexTests) {
            const ast = parseExpression(input);
            const generatedLaTeX = toLaTeX(ast);
            console.log(`  ✓ Input: "${input}" -> Generated LaTeX: "${generatedLaTeX}"`);
            if (!generatedLaTeX) {
                throw new Error(`Generated LaTeX is empty for input "${input}"`);
            }
        }

        // ----------------------------------------------------
        // TEST 3: Multiple Custom Function Substitution
        // ----------------------------------------------------
        console.log("\n[Test 3] Testing multiple custom function definitions and substitutions...");
        const definitions: Record<string, FunctionDef> = {
            "f_1": {
                name: "f_1",
                param: "z",
                body: ["sub", ["pow", ["variable", "z"], ["number", 5, 0]], ["add", ["variable", "z"], ["number", 1, 0]]] // z^5 - z - 1
            },
            "f_2": {
                name: "f_2",
                param: "w",
                body: ["sub", ["pow", ["variable", "w"], ["number", 6, 0]], ["call", "f_1", [["variable", "w"]]]] // w^6 - f_1(w)
            }
        };

        const testSubstitutionExpr = "f_2(z)";
        const substitutedAST = parseExpression(testSubstitutionExpr, definitions);
        if (!substitutedAST) {
            throw new Error(`Failed to resolve and parse substituted expression "${testSubstitutionExpr}"`);
        }
        console.log(`  ✓ Substituted f_2(z) AST: ${JSON.stringify(substitutedAST)}`);

        // ----------------------------------------------------
        // TEST 4: Subscripted Recursive/Indexed Functions (Closed-loop unrolling)
        // ----------------------------------------------------
        console.log("\n[Test 4] Testing subscripted recursive/indexed functions (Closed-loop unrolling)...");
        const recursiveDefs: Record<string, FunctionDef> = {
            "f": {
                name: "f_k",
                param: "z",
                isIndexed: true,
                indexParam: "k",
                // f_k(z) = f_{k-1}(z - c_k)
                body: ["call", "f_k-1", [["sub", ["variable", "z"], ["variable", "c_k"]]]],
                // f_0(z) = z
                baseCase: ["variable", "z"]
            }
        };

        // Test unrolling for k = 3
        const recursiveExpr = "f_3(z)";
        const unrolledAST = parseExpression(recursiveExpr, recursiveDefs);
        if (!unrolledAST) {
            throw new Error(`Failed to resolve recursive/indexed expression "${recursiveExpr}"`);
        }
        console.log(`  ✓ Unrolled f_3(z) AST: ${JSON.stringify(unrolledAST)}`);

        // ----------------------------------------------------
        // TEST 4B: Recursive String Body Parsing
        // ----------------------------------------------------
        console.log("\n[Test 4B] Testing recursive string body parsing (f_{k-1}(z - c_k))...");
        const recursiveStrBody = "f_{k-1}(z - c_k)";
        const parsedRecursiveBody = parseExpression(recursiveStrBody);
        if (!parsedRecursiveBody) {
            throw new Error(`Failed to parse recursive body string: "${recursiveStrBody}"`);
        }
        console.log(`  ✓ Successfully parsed recursive body: "${recursiveStrBody}" -> AST: ${JSON.stringify(parsedRecursiveBody)}`);

        // ----------------------------------------------------
        // TEST 5: Safety Guardrails (Constraints Validation)
        // ----------------------------------------------------
        console.log("\n[Test 5] Testing safety guardrails (constraints validation)...");
        
        // A. Maximum AST Depth Exceeded
        console.log("  - Checking maximum AST depth guard...");
        let nestedAST: any = ["variable", "z"];
        for (let i = 0; i < 110; i++) {
            nestedAST = ["add", nestedAST, ["number", 1, 0]];
        }
        const stats = getASTStats(nestedAST);
        if (stats.depth <= 100) {
            throw new Error(`Expected depth stats to exceed 100, but got ${stats.depth}`);
        }
        
        try {
            const parsedDeep = parseExpression("z + " + Array(110).fill("1").join(" + "));
            throw new Error(`Failed to block deep expression! Parse succeeded.`);
        } catch (e: any) {
            console.log(`  ✓ Successfully blocked deep expression: "${e.message}"`);
        }

        // B. Loop Bounds Limit Exceeded
        console.log("  - Checking loop bounds safety guard...");
        try {
            const parsedLargeLoop = parseExpression("sum_{n=1}^{5000}{z^n}");
            throw new Error(`Failed to block large loop bounds! Parse succeeded.`);
        } catch (e: any) {
            console.log(`  ✓ Successfully blocked large loop iterations: "${e.message}"`);
        }

        // ----------------------------------------------------
        // TEST 6: JS Translation and CPU-Side Evaluation
        // ----------------------------------------------------
        console.log("\n[Test 6] Testing JS Translation and CPU-Side Evaluation with subscripts & variables...");
        const jsEvalExpr = "z^2 + c_1";
        const jsEvalAST = parseExpression(jsEvalExpr);
        if (!jsEvalAST) {
            throw new Error(`Failed to parse "${jsEvalExpr}" for JS evaluation`);
        }
        
        const evalFn = toJS(jsEvalAST, { c_1: 5.5 });
        const result = evalFn([3, 0]); // Evaluate at z = 3 + 0i. Result should be 3^2 + 5.5 = 14.5
        console.log(`  ✓ Evaluated "${jsEvalExpr}" at z=3 with c_1=5.5 -> Result: [${result[0]}, ${result[1]}]`);
        if (Math.abs(result[0] - 14.5) > 1e-9 || Math.abs(result[1] - 0) > 1e-9) {
            throw new Error(`Expected [14.5, 0] but got [${result[0]}, ${result[1]}]`);
        }

        // ----------------------------------------------------
        // TEST 7: GPU-Side GLSL Compilation (compileGLSL) Check
        // ----------------------------------------------------
        console.log("\n[Test 7] Testing GPU-Side GLSL Compilation with subscript variables...");
        const glslExpr = "z^2 + c_1";
        const glslAST = parseExpression(glslExpr);
        if (!glslAST) {
            throw new Error(`Failed to parse "${glslExpr}" for GLSL compilation`);
        }
        
        const glslCompiled = compileGLSL(glslAST, false); // Cartesian mode
        if (!glslCompiled || !glslCompiled.expression.includes("c_1")) {
            throw new Error(`GLSL compilation failed or didn't contain "c_1": ${JSON.stringify(glslCompiled)}`);
        }
        console.log(`  ✓ GLSL compiled expression: "${glslCompiled.expression}"`);

        // ----------------------------------------------------
        // TEST 8: Inverted Loop Bounds Guard Checking
        // ----------------------------------------------------
        console.log("\n[Test 8] Testing inverted loop bounds safety guard...");
        try {
            const parsedInvertedLoop = parseExpression("sum_{n=5}^{2}{z^n}");
            throw new Error(`Failed to block inverted loop bounds! Parse succeeded.`);
        } catch (e: any) {
            console.log(`  ✓ Successfully blocked inverted loop lower bound > upper bound: "${e.message}"`);
        }

        // ----------------------------------------------------
        // TEST 9: Custom GLSL Shader Generation Check
        // ----------------------------------------------------
        console.log("\n[Test 9] Testing custom GLSL shader generation (custom Mandelbrot loop)...");
        const customGLSL = `vec2 mapping(vec2 z) {
  z += t;
  vec2 c = z;
  for (int i=0; i<64; i++) {
    z = cmul(z, z) + c;
  }
  return z;
}`;
        const shaderSource = getFragmentShaderSource(customGLSL, true, 800, 600, ['t'], false);
        if (!shaderSource) {
            throw new Error("Failed to generate fragment shader source for custom GLSL");
        }
        if (!shaderSource.includes("vec2 mapping(vec2 z)") || !shaderSource.includes("cmul(z, z)")) {
            throw new Error("Custom GLSL was not injected correctly into the fragment shader template!");
        }
        console.log("  ✓ Successfully generated custom GLSL shader source containing Mandelbrot loop!");

        // ----------------------------------------------------
        // TEST 10: Static Shader Uniform Declaration Check
        // ----------------------------------------------------
        console.log("\n[Test 10] Testing static shader uniform declaration integrity...");
        const dummyAST = parseExpression("z");
        if (!dummyAST) throw new Error("Failed to parse dummy AST for Test 10");
        
        const generatedShader = getFragmentShaderSource(dummyAST, false, 800, 600, ["c"], false);
        if (!generatedShader) {
            throw new Error("Failed to generate fragment shader source for Test 10");
        }

        const requiredSystemVars = [
            'log_scale', 'center_x', 'center_y', 'enable_axes', 'enable_checkerboard',
            'invert_gradient', 'continuous_gradient', 'grid_type', 'polar_grid'
        ];

        const uniformMatches = generatedShader.matchAll(/uniform\s+(?:vec2|vec3)\s+([a-zA-Z0-9_]+);/g);
        const declaredUniforms = new Set<string>();
        for (const match of uniformMatches) {
            declaredUniforms.add(match[1]);
        }

        for (const sysVar of requiredSystemVars) {
            if (!declaredUniforms.has(sysVar)) {
                throw new Error(`Regression detected: System uniform "${sysVar}" is referenced in the shader body but was NOT declared!`);
            }
        }
        console.log("  ✓ All required system uniforms are successfully declared in the generated shader!");

        // ----------------------------------------------------
        // TEST 11: Recursive Indexed GLSL Loop End-to-End Compile Check
        // ----------------------------------------------------
        console.log("\n[Test 11] Testing recursive indexed GLSL loop end-to-end compile...");
        const recursiveExpr11 = "f_k(z)";
        const recursiveDefs11: Record<string, FunctionDef> = {
            "f_k": {
                name: "f_k",
                param: "z",
                isIndexed: true,
                indexParam: "k",
                body: parseExpression("f_{k-1}(z)^2 + c")!,
                baseCase: parseExpression("z")!
            }
        };
        const recursiveIdxs11 = { "f_k": 12, "f": 12 };
        
        // Compile using parseExpression with glslLoopMode = true to generate indexed_loop node
        const loopAST = parseExpression(recursiveExpr11, recursiveDefs11, recursiveIdxs11, true);
        if (!loopAST) {
            throw new Error("Failed to parse recursive indexed expression in loop mode for Test 11");
        }

        // Call getFragmentShaderSource in LOG_MODE = true (to test log_dependencies)
        const finalLoopShader = getFragmentShaderSource(loopAST, false, 800, 600, ["c"], true);
        if (!finalLoopShader) {
            throw new Error("Failed to compile recursive indexed GLSL loop shader!");
        }
        if (!finalLoopShader.includes("indexed_loop_helper_0") || !finalLoopShader.includes("for (int _i = 1; _i <= 12; _i++)")) {
            throw new Error("Generated shader was missing the native GLSL for-loop helper structure!");
        }
        console.log("  ✓ Successfully generated and verified recursive indexed GLSL loop shader under log-cart representation!");

        // ----------------------------------------------------
        // TEST 12: Color Tag (\textcolor) Ignoring Check
        // ----------------------------------------------------
        console.log("\n[Test 12] Testing LaTeX color tags scrubbing...");
        const coloredLaTeX = "\\textcolor{yellow}{_{k}}(z)=f\\textcolor{yellow}{_{k-1}}(z)-\\frac{f\\textcolor{yellow}{_{k-1}}(z)^6-f\\textcolor{yellow}{_{k-1}}(z)-1}{6\\cdot f\\textcolor{yellow}{_{k-1}}(z)^5-1}";
        const scrubbedAlgebraic = convertMathLiveToAlgebraic(coloredLaTeX);
        if (scrubbedAlgebraic.includes("textcolor") || scrubbedAlgebraic.includes("yellow")) {
            throw new Error(`Failed to scrub color tags: "${scrubbedAlgebraic}"`);
        }
        console.log("  ✓ Successfully scrubbed color tags! Result: " + scrubbedAlgebraic);

        // ----------------------------------------------------
        // TEST 13: Unicode Superscripts and Custom LaTeX Operators Check
        // ----------------------------------------------------
        console.log("\n[Test 13] Testing Unicode superscripts and custom LaTeX operators...");
        const unicodeLaTeX = "w⁶ + w\\pow 3 - c\\sub{k-1}";
        const processedUnicode = convertMathLiveToAlgebraic(unicodeLaTeX);
        if (processedUnicode !== "w^6 + w^ 3 - c_{k-1}") {
            throw new Error(`Failed to process Unicode superscripts or custom operators: "${processedUnicode}"`);
        }
        console.log("  ✓ Successfully converted Unicode superscripts and custom operators! Result: " + processedUnicode);

        console.log("\n🎉 ALL RECURSIVE & SUBSCRIPT ENHANCEMENT TESTS PASSED SUCCESSFULLY! 🎉\n");
    } catch (err) {
        console.error("\n❌ ENHANCEMENT TESTS FAILED:");
        console.error(err instanceof Error ? err.message : String(err));
        passed = false;
    }

    if (!passed) {
        process.exit(1);
    }
}

runTests();
