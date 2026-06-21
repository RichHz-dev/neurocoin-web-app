import { Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 py-4 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono tracking-wide">
        <div className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-pink-400" />
          <span>NeuroCoin Scenario Predictor Platform © 2026. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
