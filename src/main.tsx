import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Configure MathLive fonts directory CDN to prevent local 404 woff2 font asset load errors on GitHub Pages
if (typeof window !== 'undefined') {
  (window as any).MathfieldElement = (window as any).MathfieldElement || {};
  (window as any).MathfieldElement.fontsDirectory = "https://cdn.jsdelivr.net/npm/mathlive@0.110.0/fonts/";
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
