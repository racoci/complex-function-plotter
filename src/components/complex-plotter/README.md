# Arquitetura do Complex Function Plotter

Este módulo renderiza e compila funções analíticas complexas $f(z)$ em alta performance diretamente na placa de vídeo (GPU) do usuário utilizando WebGL e React. 

## 1. O Compilador Matemático (Parser $\to$ GLSL)

Quando o usuário insere uma string matemática (via `math-field` do MathLive), o pipeline abaixo é acionado de forma estritamente síncrona:

1. **`mathlive-converter.ts`**: Destila formatações puras do LaTeX do MathLive (`\frac{a}{b}`, `\left| c \right|`, etc) para a notação algébrica legível (`(a)/(b)`, `abs(c)`).
2. **`grammar.ne` (Nearley Parser)**: Recebe a string e monta uma **Árvore de Sintaxe Abstrata (AST)** através de uma gramática livre de contexto.
   - *Suporte nativo a loops:* Reconhece sumatórios e produtórios (`\sum`, `\prod`), variáveis livres, constantes e operações compostas.
   - O output bruto é tipado recursivamente como `ASTNode`.
3. **`compiler.ts` (Otimizador)**: Realiza dobramento de constantes (Constant Folding), distribui operações e expande constructos híbridos de polinômios.
4. **Dupla Tradução (Simetria WebGL/CPU)**:
   - **`to-glsl.ts`**: Transforma a AST em um código fonte de *Fragment Shader* (`.glsl`) em C-like. Se houver `sum` ou `prod`, gera funções auxiliares (helpers) com loops `for` de tamanho estático, mantendo a performance da GPU altíssima.
   - **`to-js.ts`**: Transforma a mesmíssima AST para uma função executável em JavaScript usando `mathjs`.
   - **`to-latex.ts`**: Reverte a AST validada de volta para LaTeX seguro.

## 2. A Renderização por Domain Coloring (WebGL)

O gráfico utiliza a técnica de **Mapeamento de Cores de Domínio**.
Cada pixel representa um número complexo de entrada $z = x + iy$.
A GPU recebe a variável $z$, aplica o Fragment Shader gerado pelo compilador para obter $w = f(z) = u + iv$.
A cor desse pixel na tela é então definida convertendo $w$ para coordenadas polares $(r, \theta)$:

*   **Hue (Matiz)** $\to$ Definida pelo ângulo $\theta$ (Fase).
*   **Value (Brilho)** $\to$ Ciclada logaritmicamente pela magnitude $r$. Isso gera "curvas de nível" onde o brilho se quebra subitamente, revelando a ordem e a localização de Zeros e Polos geométricos no plano complexo sem perda de range numérico.

**Anti-Aliasing Físico:** Implementamos um sub-sampling (Superamostragem 4-Rook) dentro do shader (`shaders.ts`). Ele processa a função $f(z)$ 4 vezes em micro-posições distintas por pixel para suavizar o Moiré perto de descontinuidades extremas.

## 3. UI e Variáveis Dinâmicas

A interface no React (`ComplexPlotter.tsx`) escuta todos os eventos dinâmicos e roda em sincronia total.
*   **Variáveis Livres (`getFreeVariables`)**: Se a AST acusar o uso de tokens desconhecidos (ex: $c$, $a$, $b$), eles são injetados no React como variáveis de estado e nós flutuantes arrastáveis `<div/>`.
*   O arrasto traduz coordenadas da Tela (Pixels em Inversão $Y$) de volta para o plano Imaginário escalado, preenchendo a matriz de uniformes WebGL em 60 frames por segundo.
*   **Camada Superior 2D (`scene.ts`)**: Um `<canvas>` tradicional flutua sobre o WebGL para renderizar as linhas dos eixos em super-resolução vetorial (Grade Cartesiana e Polar) em sincronia com o estado de pan e zoom do componente.
