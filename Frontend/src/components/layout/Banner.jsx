import { Globe } from 'lucide-react';

export default function Banner() {
  return (
    <section className="bg-gradient-to-r from-slate-950/60 via-pink-950/10 to-slate-950/60 border border-indigo-950/30 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between animate-fade-in">
      <div className="flex gap-4 items-start max-w-2xl text-center sm:text-left">
        <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 hidden sm:block shrink-0">
          <Globe className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Monitoreo Predictivo Inteligente frente a Escenarios de Volatilidad
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
            Esta solución de Inteligencia Artificial muestra información detallada de monedas
            virtuales y proyecta su comportamiento técnico combinando modelos predictivos LSTM
            híbridos. Analiza el impacto directo de variables geopolíticas, cambios
            gubernamentales, regulaciones continentales y el sentimiento social colectivo.
          </p>
        </div>
      </div>
      {/* <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-center shrink-0 min-w-[140px]">
        <span className="text-[9px] text-slate-500 uppercase block font-mono">Modelo Predictivo</span>
        <span className="text-xs font-mono font-semibold text-pink-400 block mt-1">LSTM-HYBRID V2.0</span>
        <span className="text-[9px] text-slate-400 italic block mt-1">Análisis cuantitativo</span>
      </div> */}
    </section>
  );
}
