import { useEffect, useState } from 'react';
import ComplexPlotter from './components/complex-plotter/ComplexPlotter';

export default function App() {
  const [lang, setLang] = useState<'en' | 'pt'>('en');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlLang = searchParams.get('lang');
    if (urlLang === 'pt') {
      setLang('pt');
    } else {
      setLang('en');
    }
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-black">
      <ComplexPlotter lang={lang} />
    </div>
  );
}
