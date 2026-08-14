import createShaderProgram from './shaders';
import { ASTNode, WebGLRenderingContextExtended } from './types';

function initBuffers(gl: WebGLRenderingContext): void {
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  const vertices = [
    -1, -1,
    1, -1,
    -1, 1,

    -1, 1,
    1, -1,
    1, 1
  ];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW
  );
}

function initializeScene(
  gl: WebGLRenderingContextExtended, 
  expression: ASTNode | null, 
  customShader: boolean, 
  variableNames: string[]
): Record<string, WebGLUniformLocation | null> | null {
  if (expression === null) {return null;}

  const shaderProgram = createShaderProgram(
    gl,
    expression, customShader,
    variableNames
  );

  if (shaderProgram === null) {
    console.error('AST could not be compiled:', expression);
    return null;
  }

  initBuffers(gl);
  gl.useProgram(shaderProgram);

  const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const variableLocations: Record<string, WebGLUniformLocation | null> = {};
  for (const name of variableNames) {
    variableLocations[name] = gl.getUniformLocation(shaderProgram, name);
  }
  return variableLocations;
}

function drawScene(
  gl: WebGLRenderingContextExtended, 
  variables: Record<string, [WebGLUniformLocation | null, any]>, 
  axis_ctx: CanvasRenderingContext2D
): void {
  for (const key of Object.keys(variables)) {
    const [location, value] = variables[key];
    if (location) {
      if (Array.isArray(value)) {
        if (gl.LOG_MODE) {
          gl.uniform3f(location, value[0], value[1], 0.0);
        } else {
          gl.uniform2f(location, value[0], value[1]);
        }
      } else {
        if (gl.LOG_MODE) {
          gl.uniform3f(location, value, 0.0, 0.0);
        } else {
          gl.uniform2f(location, value, 0.0);
        }
      }
    }
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const scalarVariables: Record<string, [WebGLUniformLocation | null, number]> = {};
  for (const key of Object.keys(variables)) {
    const [location, value] = variables[key];
    scalarVariables[key] = [location, Array.isArray(value) ? value[0] : value];
  }

  drawAxes(axis_ctx, scalarVariables);
}

function drawAxes(
  ctx: CanvasRenderingContext2D, 
  variables: Record<string, [WebGLUniformLocation | null, any]>
): void {
    const dpr = window.devicePixelRatio || 1;
    const [width, height] = [ctx.canvas.width, ctx.canvas.height];
    ctx.clearRect(0, 0, width, height);
    if (!variables.enable_axes || variables.enable_axes[1] < 0.5) {return;}

    const scale = Math.exp(variables.log_scale[1]) * dpr;
    
    let rawLogLabelScale = 2.3 - variables.log_scale[1] / Math.log(10);
    rawLogLabelScale += 3e-2 * Math.abs(rawLogLabelScale); // Make room for long labels
    let logLabelScale = Math.round(rawLogLabelScale);
    let labelScale = Math.pow(10, logLabelScale);

    if (logLabelScale - rawLogLabelScale > 0.2) {
        labelScale /= 5;
        logLabelScale--;
    } else if (logLabelScale - rawLogLabelScale > 0) {
        labelScale /= 2;
        logLabelScale--;
    }

    const [x0, y0] = [
        width/2 - scale * variables.center_x[1],
        height/2 + scale * variables.center_y[1],
    ];

    const [x_min, x_max] = [-x0/scale, (width - x0)/scale];
    const [y_min, y_max] = [(y0-height)/scale, y0/scale];

    function horizontalLine(y: number): void {
        const yy = Math.round(y0 - scale*y);
        ctx.moveTo(0, yy);
        ctx.lineTo(width, yy);
    }

    function verticalLine(x: number): void {
        const xx = Math.round(x0 + scale*x);
        ctx.moveTo(xx, 0);
        ctx.lineTo(xx, height);
    }

    function xLabel(x: number): void {
        const xx = x0 + scale * x;
        if (xx > width - 30*dpr || xx < 30*dpr) {return;}

        const dy = (y0 < height/3) ? 22 : -10;
        const y = Math.min(Math.max(y0 + dy*dpr, 90 * dpr), height-20*dpr);

        let label = x.toFixed(Math.max(0, -logLabelScale)).replace('-', '−');
        const textWidth = ctx.measureText(label).width + 6 * dpr;

        ctx.textAlign = 'center';
        ctx.clearRect(xx - textWidth/2, y - 18*dpr, textWidth, 24*dpr);
        ctx.strokeText(label, xx, y);
        ctx.fillText(label, xx, y);
    }

    function yLabel(y: number, iWidth: number): void {
        const yy = y0 - scale * y + 6 * dpr;
        if (yy > height - 50*dpr || yy < 100*dpr) {return;}

        const alignLeft = (x0 < 2*width/3);
        const dx = alignLeft ? 10: -10;
        ctx.textAlign = alignLeft ? 'left' : 'right';

        const x = Math.min(Math.max(x0 + dx*dpr, 20 * dpr), width -20*dpr);

        let label = y.toFixed(Math.max(0, -logLabelScale)).replace('-', '−');
        if (label === '1') {label = '';}
        if (label === '−1') {label = '−';}

        ctx.font = `${20 * dpr}px Computer Modern Serif`;
        const textWidth = ctx.measureText(label).width;

        const clearWidth = textWidth + iWidth + 8*dpr;
        ctx.clearRect(
            x - (alignLeft ? 3*dpr : clearWidth - 4*dpr),
            yy - 18*dpr,
            clearWidth,
            24*dpr
        );

        const textOffset = alignLeft ? 0 : -iWidth - dpr;
        ctx.strokeText(label, x + textOffset, yy);
        ctx.fillText(label, x + textOffset, yy);

        ctx.font = `italic ${20 * dpr}px Computer Modern Serif`;
        const iOffset = alignLeft ? textWidth + dpr : 0;
        ctx.strokeText('i', x + iOffset, yy);
        ctx.fillText('i', x + iOffset, yy);
    }

    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#ffffff';

    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Cartesian Grid
    if (variables.grid_type && variables.grid_type[1] > 0.5) {
      for (let i = Math.ceil(x_min/labelScale); i < x_max/labelScale; i++) {
          if (i === 0) {continue;}
          verticalLine(i * labelScale);
      }
      for (let i = Math.ceil(y_min/labelScale); i < y_max/labelScale; i++) {
          if (i === 0) {continue;}
          horizontalLine(i * labelScale);
      }
    }

    // Polar Grid
    if (variables.polar_grid && variables.polar_grid[1] > 0.5) {
      // Concentric circles
      const maxRadius = Math.hypot(Math.max(Math.abs(x_min), Math.abs(x_max)), Math.max(Math.abs(y_min), Math.abs(y_max)));
      for (let r = labelScale; r < maxRadius; r += labelScale) {
        ctx.moveTo(x0 + scale * r, y0);
        ctx.arc(x0, y0, scale * r, 0, 2 * Math.PI);
      }
      
      // Radial lines (every pi/6 = 30 degrees)
      const numLines = 12;
      for (let i = 0; i < numLines; i++) {
        const theta = (i * Math.PI) / (numLines / 2);
        const endX = x0 + scale * maxRadius * Math.cos(theta);
        const endY = y0 - scale * maxRadius * Math.sin(theta);
        ctx.moveTo(x0, y0);
        ctx.lineTo(endX, endY);
      }
    }
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    verticalLine(0);
    horizontalLine(0);
    ctx.stroke();

    ctx.font = `${20 * dpr}px Computer Modern Serif`;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#444444';
    for (let i = Math.ceil(x_min/labelScale); i < x_max/labelScale; i++) {
        if (i === 0) {continue;}
        xLabel(i * labelScale);
    }

    ctx.font = `italic ${20 * dpr}px Computer Modern Serif`;
    const iWidth = ctx.measureText('i').width;
    for (let i = Math.ceil(y_min/labelScale); i < y_max/labelScale; i++) {
        if (i === 0) {continue;}
        yLabel(i * labelScale, iWidth);
    }
}

export {initializeScene, drawScene};
