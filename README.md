# Complex Function Plotter (Standalone Widget) <img src="public/favicon.ico" width=32 alt="App Icon">

A highly optimized, responsive, and modern **Complex Function Plotter** widget featuring web-based domain coloring, real-time parameter animation, and multi-touch support.

This repository is built and deployed as a **standalone static widget** optimized to be imported in any external site (e.g. portfolios, blogs, or publications) through a sandboxed `<iframe>`.

---

## 🚀 Live Demo & Embedding

The widget is automatically built and served live at:
**[https://racoci.github.io/complex-function-plotter/](https://racoci.github.io/complex-function-plotter/)**

### How to Embed in Your Page

Simply copy and paste the following HTML snippet to embed the widget dynamically in your application:

```html
<iframe
  src="https://racoci.github.io/complex-function-plotter/?lang=pt"
  style="width: 100%; height: 600px; border: none; border-radius: 12px;"
  title="Complex Function Plotter"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-forms"
  loading="lazy"
/>
```

### Multilingual Support (Parâmetro de Idioma)
Pass the `lang` search parameter in the URL query string to select the default language:
- `?lang=pt`: Idioma em Português (Brasil)
- `?lang=en` (Default): English language

---

## ✨ Upgraded Features

This codebase represents a complete technological rewrite of the original plotter, featuring:
1. **Modern Stack:** Upgraded from React 16 + ejected Webpack to **React 19 + TypeScript + Vite + Tailwind CSS v4**, reducing bundle size by 70% and maximizing compile-time safety.
2. **Formula Editor (MathLive):** Replaced static text inputs with an interactive **MathLive LaTeX equation editor**, featuring virtual keyboard support and physical keyboard synchronization.
3. **Draggable Variables:** Zeroes, poles, or custom parameters (like `c`) can be adjusted in real-time by dragging tactile neon dots directly on the complex plane canvas.
4. **WebGL Shaders (Anti-Moiré & Supersampling):** Fragment shaders are compiled dynamically on the GPU, integrating **4-Rook diagonal supersampling** and derivative estimation to remove aliasing and coordinate grid distortion.
5. **No double scrollbars:** Optimized layouts with absolute boundary scrolling.

---

## 🛠️ Local Development & Scripts

To run the project locally on your machine:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Build Production Assets:**
   ```bash
   npm run build
   ```

4. **Deploy to GitHub Pages Manually:**
   ```bash
   npm run deploy
   ```

---

## 🔄 Automated Deployment Pipeline

A high-fidelity **GitHub Actions Workflow** (`.github/workflows/deploy.yml`) is active. Every push to the `master` branch triggers:
1. Automated dependency validation and type-checking (`tsc`).
2. Production bundle compilation and minification via Vite.
3. Automated deployment of the compiled standalone assets directly to the `gh-pages` branch.
