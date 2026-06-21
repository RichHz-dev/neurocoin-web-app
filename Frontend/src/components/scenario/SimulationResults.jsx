import { RefreshCw, HelpCircle, Sparkles, Landmark } from 'lucide-react';

export default function SimulationResults({
  activeCoin,
  isSimulating,
  simCurve,
  simChannel,
  simCommentary
}) {
  return (
    <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-350 tracking-wider uppercase font-mono">
            Resultado Proyectado
          </h3>
          {activeCoin ? (
            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono uppercase rounded">
              Activo: {activeCoin.symbol} ($&nbsp;
              {activeCoin.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })})
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono uppercase rounded">
              Sin Activo Elegido
            </span>
          )}
        </div>

        {isSimulating && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="w-10 h-10 text-pink-500 animate-spin" />
            <div className="text-center">
              <p className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-widest animate-pulse">
                Consultando Red Neuronal IA
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Computando variables de riesgo y sensibilidades macroeconómicas...
              </p>
            </div>
          </div>
        )}

        {!isSimulating && !simCurve && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 text-center px-4">
            <HelpCircle className="w-12 h-12 text-slate-700 mb-3" />
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
              Simulador Listo
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
              Selecciona tu hipótesis financiera en la barra izquierda y ejecútala para
              contrastar la predicción actual contra el evento propuesto.
            </p>
          </div>
        )}

        {!isSimulating && simCurve && (
          <div className="space-y-5 animate-fade-in">
            {/* Tabla de curva estimada */}
            <div>
              <h4 className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-2">
                Curva Futura Estimada (T+1h a T+6h):
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {simCurve.map((p, idx) => {
                  const isPositive = (p.percentageChange ?? 0) >= 0;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-center"
                    >
                      <span className="text-[10px] font-mono text-slate-500 block">{p.hour}</span>
                      <span className="text-xs font-bold text-slate-200 block font-mono mt-1">
                        ${p.price?.toLocaleString(undefined, {
                          maximumFractionDigits: (activeCoin?.price ?? 0) > 100 ? 1 : 4,
                        })}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-medium mt-1 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {p.percentageChange?.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canal de fluctuación */}
            {simChannel && simChannel.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-2">
                  Canal de fluctuación ponderado (rango de confianza):
                </span>
                <div className="space-y-1.5">
                  {simChannel.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 text-xs font-mono text-slate-400"
                    >
                      <span className="w-10 text-[10px] text-slate-500">{p.hour}</span>
                      <div className="flex-1 bg-slate-950 h-5.5 rounded-md border border-slate-900 flex items-center relative overflow-hidden px-1">
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(10, (p.range ?? 0) * 6))}%`,
                          }}
                          className="bg-indigo-600/35 border-l border-r border-indigo-400 h-full absolute left-1/4"
                        />
                        <span className="absolute inset-x-0 text-center text-[9px] font-bold text-slate-300">
                          Confianza: {p.confidence}% (±{p.range?.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conclusión del oráculo - CORREGIDA CON SCROLL Y LIMPIEZA DE MARKDOWN */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-start gap-3.5 shadow-md">
              <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-lg shrink-0">
                <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-bold text-pink-400 tracking-widest uppercase font-mono mb-2">
                  Conclusión de Inteligencia Escenarios (Gemini Engine)
                </h4>
                <div className="max-h-[160px] overflow-y-auto pr-2">
                  <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {/* ◄ Reemplazamos los asteriscos dobles y simples del markdown para dejar puro texto */}
                    {simCommentary.replace(/\*\*/g, '').replace(/\*/g, '')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-slate-850 pt-4 text-[10px] text-slate-500 font-mono flex items-center gap-2">
        <Landmark className="w-4 h-4 text-pink-500" />
        <span>Análisis descriptivos simulados dinámicamente mediante el oráculo de IA generativa.</span>
      </div>
    </div>
  );
}
