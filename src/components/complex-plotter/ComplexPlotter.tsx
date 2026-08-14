"use client";

import React, { useRef, useEffect, useState } from 'react';
import { initializeScene, drawScene } from './gl-code/scene';
import { parseExpression } from './gl-code/complex-functions';
import { compileGLSL } from './gl-code/translators/to-glsl';
import { getFreeVariables } from './gl-code/utils/variables';
import toLaTeX from './gl-code/translators/to-latex';
import toJS from './gl-code/translators/to-js';
import { convertMathLiveToAlgebraic } from './gl-code/translators/mathlive-converter';
import { FunctionDef } from './gl-code/types';
import 'mathlive';

export default function ComplexPlotter({ lang = 'en' }: { lang?: 'en' | 'pt' }) {
  const t = lang === 'pt' ? {
    title: 'Gráficos Complexos',
    desc: 'Coloração de domínio baseada na web.',
    expression: 'Expressão f(z)',
    settings: 'Configurações',
    cartesian: 'Grade Cartesiana',
    polar: 'Grade Polar',
    adapted: 'Adaptado de Samuel J. Li (wgxli).',
    repo: 'Repositório Original',
    enableAxes: 'Exibir Eixos',
    enableCheckerboard: 'Grade Xadrez',
    invertGradient: 'Inverter Gradiente',
    continuousGradient: 'Gradiente Contínuo',
    selectFunc: 'Selecionar Função',
    editDefs: 'Editar Definições de Funções',
    confirmVis: 'Confirmar e Visualizar',
    chooseK: 'Escolha o valor de k para visualizar:',
    baseCase: 'Caso Base f0(z)',
    formulaBody: 'Fórmula',
    addFunc: 'Adicionar Função',
    funcName: 'Nome da Função',
    paramName: 'Parâmetro',
    isIndexed: 'É indexada/recursiva?'
  } : {
    title: 'Complex Plotter',
    desc: 'Web-based domain coloring.',
    expression: 'Expression f(z)',
    settings: 'Settings',
    cartesian: 'Cartesian Grid',
    polar: 'Polar Grid',
    adapted: 'Adapted from Samuel J. Li (wgxli).',
    repo: 'Original Repository',
    enableAxes: 'Display Axes',
    enableCheckerboard: 'Checkerboard Grid',
    invertGradient: 'Invert Gradient',
    continuousGradient: 'Continuous Gradient',
    selectFunc: 'Select Function',
    editDefs: 'Edit Function Definitions',
    confirmVis: 'Confirm & Visualize',
    chooseK: 'Choose value of k to visualize:',
    baseCase: 'Base Case f0(z)',
    formulaBody: 'Formula',
    addFunc: 'Add Function',
    funcName: 'Function Name',
    paramName: 'Parameter',
    isIndexed: 'Is indexed/recursive?'
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const axesCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mathFieldRef = useRef<any>(null);

  // Default function definitions list
  const [functionDefs, setFunctionDefs] = useState<Record<string, FunctionDef>>({
    "f": {
      name: "f",
      param: "z",
      body: ["add", ["square", ["variable", "z"]], ["variable", "c"]],
      isIndexed: false
    },
    "g": {
      name: "g",
      param: "z",
      body: ["mul", ["sin", ["variable", "z"]], ["variable", "c_1"]],
      isIndexed: false
    },
    "f_k": {
      name: "f_k",
      param: "z",
      isIndexed: true,
      indexParam: "k",
      body: ["call", "f_k-1", [["sub", ["variable", "z"], ["variable", "c_k"]]]],
      baseCase: ["variable", "z"]
    }
  });

  const [selectedFunction, setSelectedFunction] = useState<string>("f");
  const [indexValues, setIndexValues] = useState<Record<string, number>>({
    "f_k": 3
  });

  // Track if the user has unlocked/confirmed their selected k for the indexed function
  const [kConfirmed, setKConfirmed] = useState<boolean>(true);
  const [showPromptModal, setShowPromptPrompt] = useState<boolean>(false);

  const [expression, setExpression] = useState("z^2 + c");
  const [dynamicVars, setDynamicVars] = useState<string[]>([]);
  const [latexStr, setLatexStr] = useState("z^2 + c");

  // Sync math field safely on selection changes
  useEffect(() => {
    const def = functionDefs[selectedFunction];
    if (def) {
      const isIndexed = def.isIndexed;
      const kVal = indexValues[selectedFunction] ?? 3;
      const currentFormula = isIndexed ? `f_{k=${kVal}}(z)` : `${selectedFunction}(z)`;
      if (mathFieldRef.current && mathFieldRef.current.value !== currentFormula) {
        mathFieldRef.current.value = currentFormula;
      }
    }
  }, [selectedFunction, indexValues]);

  const [variables, setVariables] = useState<any>({
    log_scale: [1.2, 0],
    center_x: [0, 0],
    center_y: [0, 0],
    enable_axes: [1, 0],
    enable_checkerboard: [0, 0],
    invert_gradient: [1, 0],
    continuous_gradient: [1, 0],
    custom_function: [0, 0],
    grid_type: [1, 0],
    polar_grid: [0, 0],
    c: [0.35, 0.45],
    c_1: [-0.4, 0.6],
    c_2: [0.2, -0.5],
    c_3: [-0.5, -0.3],
    c_4: [0.3, 0.3],
    c_5: [-0.1, -0.6]
  });

  const [error, setError] = useState<string | null>(null);
  const [lastValidAst, setLastValidAst] = useState<any>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [centerStart, setCenterStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showDefinitionsEditor, setShowDefinitionsEditor] = useState(false);

  // Local state for the freeform multi-line text editor
  const [editorText, setEditorText] = useState<string>(
    `f(z) = z^2 + c
g(z) = sin(z) * c_1
f_k(z) = f_{k-1}(z - c_k) with f_0(z) = z`
  );
  const [editorErrors, setEditorErrors] = useState<string[]>([]);

  // State for the custom GLSL code editor
  const [glslCode, setGlslCode] = useState<string>("");
  const [isEditingGLSL, setIsEditingGLSL] = useState<boolean>(false);

  // Dragging custom variables
  const [activeVar, setActiveVar] = useState<string | null>(null);

  // Monitor selected function changes
  useEffect(() => {
    const def = functionDefs[selectedFunction];
    if (def && def.isIndexed) {
      setKConfirmed(false);
      setShowPromptPrompt(true);
    } else {
      setKConfirmed(true);
      setShowPromptPrompt(false);
    }
  }, [selectedFunction]);

  // Parse and validate expression
  useEffect(() => {
    if (!kConfirmed) return; // Halt rendering if k is not confirmed yet for indexed function
    try {
      const def = functionDefs[selectedFunction];
      if (!def) return;

      let exprToParse = "";
      if (def.isIndexed) {
        const kVal = indexValues[selectedFunction] ?? 3;
        const baseName = selectedFunction.split('_')[0];
        exprToParse = `${baseName}_${kVal}(z)`;
      } else {
        exprToParse = `${selectedFunction}(z)`;
      }

      // Compile using parseExpression with definitions and indexValues
      const ast = parseExpression(exprToParse, functionDefs, indexValues);
      if (ast) {
        // ----------------------------------------------------
        // CPU SAFETY GATE EVALUATION
        // ----------------------------------------------------
        const startEval = performance.now();
        const jsEval = toJS(ast, { ...variables });
        jsEval([0.5, 0.5]); // test points
        jsEval([0, 0]);
        const evalTime = performance.now() - startEval;
        
        if (evalTime > 20) {
          throw new Error(`CPU evaluation too slow: took ${evalTime.toFixed(2)}ms`);
        }

        setError(null);
        setLastValidAst(ast);
        setLatexStr(toLaTeX(ast));

        // Generate and sync GLSL code if not in custom editing mode
        if (!isEditingGLSL) {
          const compiled = compileGLSL(ast, false); // Cartesian mode
          if (compiled) {
            const mappingFn = `vec2 mapping(vec2 z) {\n  return ${compiled.expression};\n}`;
            setGlslCode(mappingFn);
          }
        }
        
        // Extract free variables
        const freeVars = Array.from(getFreeVariables(ast));
        setDynamicVars(freeVars);
        
        setVariables((prev: any) => {
          let changed = false;
          const next = { ...prev };
          freeVars.forEach(v => {
            if (!next[v]) {
              next[v] = [Math.random() * 2 - 1, Math.random() * 2 - 1];
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      } else {
        setError("Parsing Error");
      }
    } catch (err: any) {
      console.error("Safety Gate Compilation Error: ", err);
      setError(err?.message || "Compilation Error");
    }
  }, [selectedFunction, functionDefs, indexValues, kConfirmed, isEditingGLSL]);

  // Monitor resize of container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // WebGL Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const axesCanvas = axesCanvasRef.current;
    const astToRender = isEditingGLSL ? glslCode : lastValidAst;
    if (!canvas || !axesCanvas || dimensions.width === 0 || dimensions.height === 0 || !astToRender || !kConfirmed) return;
    
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    const ctx = axesCanvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    axesCanvas.width = dimensions.width * dpr;
    axesCanvas.height = dimensions.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const varNames = Object.keys(variables);
    const varLocations: any = initializeScene(gl, astToRender, isEditingGLSL, varNames);
    if (!varLocations) {
       setError(lang === 'pt' ? "Erro na compilação do Shader GLSL. Verifique a sintaxe ou o console do navegador." : "GLSL Shader compilation error. Please check syntax or browser developer console.");
       return;
    } else {
       setError(null);
    }

    let animationFrameId: number;
    const render = () => {
      const variablesForScene: any = {};
      for (const k of varNames) {
         variablesForScene[k] = [varLocations[k] || null, variables[k]];
      }
      if (ctx) {
        drawScene(gl, variablesForScene, ctx);
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [lastValidAst, variables, dimensions, kConfirmed, glslCode, isEditingGLSL]);

  // Track wheel zoom
  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas) return;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      setVariables((prev: any) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        return { ...prev, log_scale: [Math.min(Math.max(prev.log_scale[0] + delta, -4), 8), 0] };
      });
    };
    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleNativeWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || activeVar !== null) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCenterStart({ x: variables.center_x[0], y: variables.center_y[0] });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeVar) {
       const rect = containerRef.current!.getBoundingClientRect();
       const x = e.clientX - rect.left;
       const y = e.clientY - rect.top;
       
       const scale = Math.exp(variables.log_scale[0]);
       const cx = variables.center_x[0];
       const cy = variables.center_y[0];
       
       const re = cx + (x - dimensions.width / 2) / scale;
       const im = cy + (dimensions.height / 2 - y) / scale;
       
       setVariables((prev: any) => ({
           ...prev,
           [activeVar]: [re, im]
       }));
       return;
    }

    if (!isDraggingCanvas) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const scale = Math.exp(variables.log_scale[0]);
    
    setVariables((prev: any) => ({
      ...prev,
      center_x: [centerStart.x - dx / scale, 0],
      center_y: [centerStart.y + dy / scale, 0]
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (activeVar) {
      setActiveVar(null);
    }
  };

  const toScreen = (re: number, im: number) => {
    const scale = Math.exp(variables.log_scale[0]);
    return {
      x: (re - variables.center_x[0]) * scale + dimensions.width / 2,
      y: -(im - variables.center_y[0]) * scale + dimensions.height / 2,
    };
  };

  const Switch = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label: string }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{label}</span>
      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  );

  // Automatically parse and compile the freeform multi-line editorText into functionDefs
  useEffect(() => {
    const lines = editorText.split('\n');
    const newDefs: Record<string, FunctionDef> = {};
    const currentErrors: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return; // Skip empty lines and comments

      // Try matching indexed recursive function: f_k(z) = f_{k-1}(z - c_k) with f_0(z) = z
      const indexedMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)_([a-zA-Z_])\((.*?)\)\s*=\s*(.*?)\s+(?:with|where|;|,\s*)\s+\1_0\((.*?)\)\s*=\s*(.*)$/i);
      if (indexedMatch) {
        const name = indexedMatch[1];
        const indexParam = indexedMatch[2];
        const param = indexedMatch[3].trim();
        const bodyStr = indexedMatch[4].trim();
        const baseParam = indexedMatch[5].trim();
        const baseCaseStr = indexedMatch[6].trim();

        try {
          const bodyAST = parseExpression(bodyStr);
          if (!bodyAST) throw new Error(`Falha ao compilar fórmula: "${bodyStr}"`);
          
          const baseCaseAST = parseExpression(baseCaseStr);
          if (!baseCaseAST) throw new Error(`Falha ao compilar caso base: "${baseCaseStr}"`);

          const key = `${name}_${indexParam}`;
          newDefs[key] = {
            name: `${name}_${indexParam}`,
            param,
            isIndexed: true,
            indexParam,
            body: bodyAST,
            baseCase: baseCaseAST
          };
        } catch (err: any) {
          currentErrors.push(`${lang === 'pt' ? 'Linha' : 'Line'} ${index + 1}: ${err.message || 'Sintaxe inválida'}`);
        }
        return;
      }

      // Try matching standard function: f(z) = z^2 + c
      const standardMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)\s*=\s*(.*)$/);
      if (standardMatch) {
        const name = standardMatch[1];
        const param = standardMatch[2].trim();
        const bodyStr = standardMatch[3].trim();

        try {
          const bodyAST = parseExpression(bodyStr);
          if (!bodyAST) throw new Error(`Falha ao compilar fórmula: "${bodyStr}"`);

          newDefs[name] = {
            name,
            param,
            body: bodyAST,
            isIndexed: false
          };
        } catch (err: any) {
          currentErrors.push(`${lang === 'pt' ? 'Linha' : 'Line'} ${index + 1}: ${err.message || 'Sintaxe inválida'}`);
        }
        return;
      }

      currentErrors.push(`${lang === 'pt' ? 'Linha' : 'Line'} ${index + 1}: Formato inválido. Use "f(z) = expr" ou "f_k(z) = expr with f_0(z) = base"`);
    });

    setEditorErrors(currentErrors);

    // If there are no errors and we parsed at least one definition, update the active definitions!
    if (currentErrors.length === 0 && Object.keys(newDefs).length > 0) {
      setFunctionDefs(newDefs);
      
      // Auto-fallback for selected function if previous one is deleted
      if (!newDefs[selectedFunction]) {
         const firstKey = Object.keys(newDefs)[0];
         setSelectedFunction(firstKey);
      }
    }
  }, [editorText, lang]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black font-sans shadow-2xl">
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        <canvas ref={axesCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none block" />
        
        {/* Draggable Variables */}
        {kConfirmed && dynamicVars.map(v => {
           const val = variables[v];
           if (!val) return null;
           const pos = toScreen(val[0], val[1]);
           return (
             <div 
               key={v}
               onPointerDown={(e) => { e.stopPropagation(); setActiveVar(v); }}
               className="absolute w-8 h-8 -ml-4 -mt-4 bg-emerald-500/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-500/40 transition-colors z-30"
               style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
             >
               <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
               <span className="absolute -bottom-6 text-xs font-mono text-emerald-300 font-bold bg-zinc-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm shadow">{v}</span>
             </div>
           );
        })}
      </div>

      {/* Floating Left Control Panel */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-none max-w-sm w-full z-40">
         <div className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 p-4 rounded-xl shadow-2xl pointer-events-auto">
            <h2 className="text-xl font-bold mb-1 text-zinc-100">{t.title}</h2>
            <p className="text-xs text-zinc-400 mb-3">{t.desc}</p>
            
            {/* Function Selector Dropdown */}
            <div className="flex flex-col gap-1 mb-3">
              <label className="text-xs font-semibold text-zinc-400">{t.selectFunc}</label>
              <select 
                value={selectedFunction} 
                onChange={e => setSelectedFunction(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800 text-emerald-400 p-2.5 rounded-lg text-sm w-full outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {Object.keys(functionDefs).map(key => {
                  const def = functionDefs[key];
                  return (
                    <option key={key} value={key} className="bg-zinc-950 text-emerald-400">
                      {def.isIndexed ? `${def.name}(${def.param}) (${lang === 'pt' ? 'Recursiva' : 'Recursive'})` : `${def.name}(${def.param})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Slider for k (visible dynamically after confirmation/unlocking) */}
            {functionDefs[selectedFunction]?.isIndexed && kConfirmed && (
               <div className="flex flex-col gap-2 p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg mb-3">
                 <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-emerald-400">f_k(z) Index (k)</span>
                   <span className="text-xs font-mono font-bold bg-emerald-400 text-black px-1.5 py-0.5 rounded">
                     k = {indexValues[selectedFunction] ?? 3}
                   </span>
                 </div>
                 <input 
                   type="range" min="0" max="12" 
                   value={indexValues[selectedFunction] ?? 3} 
                   onChange={e => {
                     const val = parseInt(e.target.value, 10);
                     setIndexValues(prev => ({ ...prev, [selectedFunction]: val }));
                   }}
                   className="w-full accent-emerald-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                 />
               </div>
            )}

            {/* MathField Display of the unrolled mathematical equation */}
            <div className="mt-3">
               {React.createElement('math-field', {
                 ref: mathFieldRef,
                 readOnly: true,
                 style: { 
                   width: '100%', 
                   padding: '12px', 
                   backgroundColor: 'rgba(24, 24, 27, 0.6)', 
                   color: '#a7f3d0', 
                   borderRadius: '0.5rem', 
                   outline: 'none', 
                   border: error ? '1px solid #ef4444' : '1px solid rgba(63, 63, 70, 0.5)', 
                   boxShadow: error ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                   fontSize: '1.25rem' 
                 }
               })}
            </div>
            {error && (
              <p className="text-red-400 text-xs mt-1 bg-red-950/20 border border-red-900/40 p-1.5 rounded font-mono">
                {error}
              </p>
            )}
         </div>

         {/* Accordion Definitions Editor */}
         <div className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 rounded-xl shadow-2xl pointer-events-auto overflow-hidden">
            <button 
              onClick={() => setShowDefinitionsEditor(!showDefinitionsEditor)}
              className="w-full text-left p-3.5 flex justify-between items-center text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <span>{t.editDefs}</span>
              <svg className={`w-4 h-4 transform transition-transform ${showDefinitionsEditor ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDefinitionsEditor && (
              <div className="p-3.5 border-t border-zinc-800/40 flex flex-col gap-3 custom-scrollbar overflow-y-auto max-h-96">
                <textarea
                  value={editorText}
                  onChange={e => setEditorText(e.target.value)}
                  spellCheck={false}
                  rows={6}
                  className={`w-full min-h-[160px] bg-zinc-900/60 border ${editorErrors.length > 0 ? 'border-red-500/80 focus:border-red-400' : 'border-zinc-800/80 focus:border-emerald-500'} text-emerald-300 font-mono p-3 rounded-lg text-xs outline-none resize-none transition-all custom-scrollbar`}
                  placeholder={lang === 'pt' ? "# Escreva uma fórmula por linha\nf(z) = z^2 + c\ng(z) = sin(z) * c_1\nf_k(z) = f_{k-1}(z - c_k) with f_0(z) = z" : "# Write one formula per line\nf(z) = z^2 + c\ng(z) = sin(z) * c_1\nf_k(z) = f_{k-1}(z - c_k) with f_0(z) = z"}
                />

                {editorErrors.length > 0 && (
                  <div className="flex flex-col gap-1.5 bg-red-950/20 border border-red-900/40 p-3 rounded-lg text-[11px] font-mono text-red-400 custom-scrollbar max-h-28 overflow-y-auto">
                    {editorErrors.map((err, i) => (
                      <div key={i} className="flex gap-1.5 items-start">
                        <span className="text-red-500">✕</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
         </div>
      </div>

      {/* Prominent Overlay Prompt Modal for choosing index value k BEFORE showing */}
      {showPromptModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
           <div className="bg-zinc-950 border border-zinc-800/80 max-w-md w-full p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-center">
              <h3 className="text-xl font-bold text-zinc-100 flex items-center justify-center gap-2">
                 <span className="text-emerald-400">f_k(z)</span> {lang === 'pt' ? 'Função Indexada' : 'Indexed Function'}
              </h3>
              <p className="text-sm text-zinc-400">
                 {t.chooseK}
              </p>
              
              {/* Dynamic Subscript display f_{k=37} */}
              <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-wider bg-emerald-500/5 py-3 border border-emerald-500/10 rounded-xl">
                 f_&#123;k={indexValues[selectedFunction] ?? 3}&#125;(z)
              </div>

              {/* k Selection Slider */}
              <div className="flex flex-col gap-1.5 mt-2">
                 <input 
                   type="range" min="0" max="12" 
                   value={indexValues[selectedFunction] ?? 3} 
                   onChange={e => {
                     const val = parseInt(e.target.value, 10);
                     setIndexValues(prev => ({ ...prev, [selectedFunction]: val }));
                   }}
                   className="w-full accent-emerald-400 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                 />
                 <div className="flex justify-between text-xs text-zinc-500 font-mono">
                    <span>k = 0</span>
                    <span>k = 6</span>
                    <span>k = 12</span>
                 </div>
              </div>

              {/* Confirm & Visualize Button */}
              <button 
                onClick={() => {
                   setKConfirmed(true);
                   setShowPromptPrompt(false);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] mt-2"
              >
                 {t.confirmVis} (f_&#123;k={indexValues[selectedFunction] ?? 3}&#125;)
              </button>
           </div>
        </div>
      )}

      {/* Floating Right Control Panel: Display Options Button & Box */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-40 items-end">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 p-3 rounded-full hover:bg-zinc-900/60 pointer-events-auto transition-colors shadow-lg flex items-center justify-center cursor-pointer"
            title={t.settings}
          >
             <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
          </button>
          
          {showSettings && (
            <div className={`bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 p-4 rounded-xl shadow-2xl ${isEditingGLSL ? 'w-96' : 'w-64'} flex flex-col gap-4 mt-2 pointer-events-auto transition-all duration-300`}>
              <Switch label={t.enableAxes} checked={variables.enable_axes[0] > 0.5} onChange={c => setVariables({...variables, enable_axes: [c?1:0, 0]})} />
              <Switch label={t.cartesian} checked={variables.grid_type[0] > 0.5} onChange={c => setVariables({...variables, grid_type: [c?1:0, 0]})} />
              <Switch label={t.polar} checked={variables.polar_grid[0] > 0.5} onChange={c => setVariables({...variables, polar_grid: [c?1:0, 0]})} />
              <Switch label={t.enableCheckerboard} checked={variables.enable_checkerboard[0] > 0.5} onChange={c => setVariables({...variables, enable_checkerboard: [c?1:0, 0]})} />
              <Switch label={t.invertGradient} checked={variables.invert_gradient[0] > 0.5} onChange={c => setVariables({...variables, invert_gradient: [c?1:0, 0]})} />
              <Switch label={t.continuousGradient} checked={variables.continuous_gradient[0] > 0.5} onChange={c => setVariables({...variables, continuous_gradient: [c?1:0, 0]})} />
              <Switch label={lang === 'pt' ? "Editar Código GLSL" : "Edit GLSL Code"} checked={isEditingGLSL} onChange={c => {
                 setIsEditingGLSL(c);
                 if (!c) {
                    setError(null);
                 }
              }} />

              {isEditingGLSL && (
                <div className="flex flex-col gap-1.5 border-t border-zinc-800/40 pt-3">
                  <span className="text-xs font-semibold text-zinc-400 font-mono">vec2 mapping(vec2 z)</span>
                  <textarea
                    value={glslCode}
                    onChange={e => setGlslCode(e.target.value)}
                    rows={10}
                    spellCheck={false}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 text-emerald-400 font-mono p-2.5 rounded-lg text-xs outline-none focus:border-emerald-500 resize-none custom-scrollbar"
                  />
                  <p className="text-[10px] text-zinc-500 italic">
                    {lang === 'pt' ? "* Altere para escrever loops ou lógicas de fractais customizadas." : "* Modify this to write raw loops or custom fractal logic."}
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
