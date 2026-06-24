export default function Header() {
  return (
    <header className="border-b border-indigo-950/40 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-2.5 bg-gradient-to-tr from-pink-950 to-slate-950 rounded-xl border border-pink-650/40 shadow-inner">
            <span className="text-pink-400 font-mono text-base font-extrabold tracking-tight">NC</span>
            <div className="absolute -inset-0.5 border border-pink-400/25 rounded-xl animate-pulse-ring pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-white uppercase font-sans">
                Neuro<span className="text-pink-400">Coin</span>
              </h1>
              {/* <span className="text-[8px] bg-pink-500/15 text-pink-400 font-bold px-1.5 py-0.2 rounded border border-pink-500/30 uppercase tracking-widest font-mono">
                Market Forecaster
              </span> */}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
              Modelado Predictivo de Criptomonedas &amp; Análisis de Escenarios Globales
            </span>
          </div>
        </div>

        {/* <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            <span>
              Ticker: <span className="text-slate-100 uppercase font-bold">ACTIVO</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              Gemini Analizador: <span className="text-slate-100 uppercase">Listo</span>
            </span>
          </div>
        </div> */}
      </div>
    </header>
  );
}
