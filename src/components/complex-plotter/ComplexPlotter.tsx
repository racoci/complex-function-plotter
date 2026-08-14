"use client";

import React, { useRef, useEffect, useState } from 'react';
import { initializeScene, drawScene } from './gl-code/scene';
import { parseExpression } from './gl-code/complex-functions';
import { getFreeVariables } from './gl-code/utils/variables';
import toLaTeX from './gl-code/translators/to-latex';
import { convertMathLiveToAlgebraic } from './gl-code/translators/mathlive-converter';
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
    continuousGradient: 'Gradiente Contínuo'
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
    continuousGradient: 'Continuous Gradient'
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const axesCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mathFieldRef = useRef<any>(null);

  const [expression, setExpression] = useState("z^2 + c");
  const [dynamicVars, setDynamicVars] = useState<string[]>([]);
  const [latexStr, setLatexStr] = useState("z^2 + c");

  // Sync initial and external expression changes to the math-field safely without destroying cursor
  useEffect(() => {
    if (mathFieldRef.current && mathFieldRef.current.value !== expression) {
      mathFieldRef.current.value = expression;
    }
  }, [expression]);
  
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
  });

  const [error, setError] = useState<string | null>(null);
  const [lastValidAst, setLastValidAst] = useState<any>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [centerStart, setCenterStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showSettings, setShowSettings] = useState(false);
  
  // Dragging custom variables
  const [activeVar, setActiveVar] = useState<string | null>(null);

  // Parse expression when it changes
  useEffect(() => {
    try {
      const mathliveAlgebraic = convertMathLiveToAlgebraic(expression);
      const ast = parseExpression(mathliveAlgebraic);
      if (ast) {
        setError(null);
        setLastValidAst(ast);
        setLatexStr(toLaTeX(ast));
        
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
    } catch (err) {
      console.error("Compilation Error in parseExpression. Context: ", { expression, err });
      setError("Compilation Error");
    }
  }, [expression]);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const axesCanvas = axesCanvasRef.current;
    const astToRender = lastValidAst;
    if (!canvas || !axesCanvas || dimensions.width === 0 || dimensions.height === 0 || !astToRender) return;
    
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
    const varLocations: any = initializeScene(gl, astToRender, false, varNames);
    if (!varLocations) return;

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
  }, [lastValidAst, variables, dimensions]);

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
       // Dragging a variable
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

  // Convert complex value to screen coordinates
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

  return (
    <div className="relative h-[85vh] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black font-sans shadow-2xl">
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
        {dynamicVars.map(v => {
           const val = variables[v];
           if (!val) return null;
           const pos = toScreen(val[0], val[1]);
           return (
             <div 
               key={v}
               onPointerDown={(e) => { e.stopPropagation(); setActiveVar(v); }}
               className="absolute w-8 h-8 -ml-4 -mt-4 bg-emerald-500/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-500/40 transition-colors"
               style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
             >
               <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
               <span className="absolute -bottom-6 text-xs font-mono text-emerald-300 font-bold bg-zinc-900/80 px-1.5 py-0.5 rounded backdrop-blur-sm shadow">{v}</span>
             </div>
           );
        })}
      </div>

      {/* Floating Header UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
         <div className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 p-4 rounded-xl shadow-2xl pointer-events-auto max-w-md w-full">
            <h2 className="text-xl font-bold mb-1 text-zinc-100">{t.title}</h2>
            <div className="mt-3">
               {React.createElement('math-field', {
                 ref: mathFieldRef,
                 'math-virtual-keyboard-policy': 'manual',
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
                 },
                 onInput: (e: any) => setExpression(e.target.value)
               })}
            </div>
         </div>
         
         <div className="flex flex-col gap-2 pointer-events-auto items-end">
             <button 
               onClick={() => setShowSettings(!showSettings)}
               className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 p-3 rounded-full hover:bg-zinc-900/60 transition-colors shadow-lg flex items-center justify-center"
               title={t.settings}
             >
                <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
             </button>
             
             {showSettings && (
               <div className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 p-4 rounded-xl shadow-2xl w-64 flex flex-col gap-4 mt-2">
                 <Switch label={t.enableAxes} checked={variables.enable_axes[0] > 0.5} onChange={c => setVariables({...variables, enable_axes: [c?1:0, 0]})} />
                 <Switch label={t.cartesian} checked={variables.grid_type[0] > 0.5} onChange={c => setVariables({...variables, grid_type: [c?1:0, 0]})} />
                 <Switch label={t.polar} checked={variables.polar_grid[0] > 0.5} onChange={c => setVariables({...variables, polar_grid: [c?1:0, 0]})} />
                 <Switch label={t.enableCheckerboard} checked={variables.enable_checkerboard[0] > 0.5} onChange={c => setVariables({...variables, enable_checkerboard: [c?1:0, 0]})} />
                 <Switch label={t.invertGradient} checked={variables.invert_gradient[0] > 0.5} onChange={c => setVariables({...variables, invert_gradient: [c?1:0, 0]})} />
                 <Switch label={t.continuousGradient} checked={variables.continuous_gradient[0] > 0.5} onChange={c => setVariables({...variables, continuous_gradient: [c?1:0, 0]})} />
               </div>
             )}
         </div>
      </div>
    </div>
  );
}
