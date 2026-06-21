import { Globe, ShieldAlert, Sparkles, Landmark, RefreshCw, Activity } from 'lucide-react';

export default function ScenarioConfigurator({
  cryptos,
  activeCoin,
  setTargetCoinId,
  activeTab,
  setActiveTab,
  selectedScenarioId,
  setSelectedScenarioId,
  customType,
  setCustomType,
  customImpact,
  setCustomImpact,
  customDescription,
  setCustomDescription,
  predefinedScenarios,
  isSimulating,
  onTriggerSimulation
}) {
  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'bullish':
        return (
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/35 uppercase font-mono">
            Alcista
          </span>
        );
      case 'bearish':
        return (
          <span className="text-[10px] bg-rose-500/15 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-500/35 uppercase font-mono">
            Bajista
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-amber-500/15 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/35 uppercase font-mono">
            Alta Volatilidad
          </span>
        );
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'geographic':  return <Globe className="w-4 h-4 text-sky-400" />;
      case 'political':   return <ShieldAlert className="w-4 h-4 text-indigo-400" />;
      case 'social':      return <Sparkles className="w-4 h-4 text-violet-400" />;
      case 'economic':    return <Landmark className="w-4 h-4 text-emerald-400" />;
      default:            return null;
    }
  };

  return (
    <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
            <Globe className="text-pink-500 w-4 h-4 animate-pulse" /> Parametrizador de Eventos
          </h3>
          <span className="text-[9px] bg-slate-950 font-mono text-slate-500 px-2 py-0.5 rounded border border-slate-805">
            ORACLE V2
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Configura y simula el impacto de eventos macroeconómicos o regulatorios sobre el activo seleccionado.
        </p>

        <div className="mb-4">
          <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mb-1">
            Activo a Simular:
          </label>
          <select
            value={activeCoin?.coinId || ''}
            onChange={(e) => setTargetCoinId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {cryptos?.map((coin) => (
              <option key={coin.coinId} value={coin.coinId}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl gap-1 mb-4">
          {['predefined', 'custom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'predefined' ? 'Predefinidos' : 'Evento Propio'}
            </button>
          ))}
        </div>

        {activeTab === 'predefined' ? (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {predefinedScenarios.map((sc) => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-950/80 to-indigo-950/20 border-indigo-500/50 text-white'
                      : 'bg-slate-950 hover:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      {getTypeIcon(sc.type)}
                      {sc.title}
                    </span>
                    {getImpactBadge(sc.impact)}
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed line-clamp-2 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mb-1">
                Tipo de Contexto:
              </label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="geographic">🌍 Geográfico</option>
                <option value="political">⚖️ Político / Regulatorio</option>
                <option value="social">📣 Social / Hype Viral</option>
                <option value="economic">🏦 Económico / Macro</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mb-1">
                Impacto Esperado:
              </label>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
                {['bullish', 'bearish', 'volatile'].map((imp) => (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => setCustomImpact(imp)}
                    className={`flex-1 text-center py-1 rounded text-[10px] uppercase font-mono tracking-wide font-semibold ${
                      customImpact === imp
                        ? imp === 'bullish'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : imp === 'bearish'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {imp === 'volatile' ? 'Volátil' : imp === 'bullish' ? 'Alcista' : 'Bajista'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mb-1">
                Descripción del Evento:
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Ej: El Congreso de EE.UU. aprueba una ley de fomento minero de activos con energía limpia..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-650 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <button
          onClick={onTriggerSimulation}
          disabled={isSimulating || (activeTab === 'custom' && !customDescription.trim())}
          className="w-full bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-900 text-white rounded-xl py-2.5 text-xs font-semibold shadow-lg shadow-pink-950/20 hover:cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Simulando Red Predictiva...</span>
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              <span>Ejecutar Simulación de Escenario</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
