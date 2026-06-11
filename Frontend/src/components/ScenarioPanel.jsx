import React, { useState } from 'react';
import { Globe, ShieldAlert, Sparkles, RefreshCw, Landmark, HelpCircle, Activity } from 'lucide-react';

export default function ScenarioPanel({
  cryptos,
  selectedCoin,
  triggerNotification,
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState('sec-1');
  const [customDescription, setCustomDescription] = useState('');
  const [customType, setCustomType] = useState('political');
  const [customImpact, setCustomImpact] = useState('bullish');
  const [activeTab, setActiveTab] = useState('predefined');

  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [simCommentary, setSimCommentary] = useState('');

  const predefinedScenarios = [
    {
      id: 'sec-1',
      title: 'Crisis Energética e Hashrate',
      type: 'geographic',
      impact: 'bearish',
      description: 'Inestabilidad geopolítica regional en Asia Central provoca un apagón masivo y reduce el Hashrate global activo del ecosistema de minería en un 15%.',
    },
    {
      id: 'sec-2',
      title: 'Aprobación de ETFs en América Latina',
      type: 'political',
      impact: 'bullish',
      description: 'Tres países de Latinoamérica adoptan regulaciones favorables aprobando fondos cotizados (ETF) basados en spot para promover la inclusión financiera masiva.',
    },
    {
      id: 'sec-3',
      title: 'Hype Viral de Magnate de Redes',
      type: 'social',
      impact: 'bullish',
      description: 'Un famoso magnate de la tecnología publica hilos asertivos de soporte sobre la eficiencia energética del activo en Twitter, desatando histeria minorista de compra.',
    },
    {
      id: 'sec-4',
      title: 'Restricción Fiscal Global Coordinada',
      type: 'political',
      impact: 'bearish',
      description: 'Organismos globales proponen altos impuestos específicos obligatorios sobre transacciones de protocolos descentralizados de autocustodia.',
    },
    {
      id: 'sec-5',
      title: 'Recorte Sorpresivo de Tasas de la Fed',
      type: 'economic',
      impact: 'bullish',
      description: 'La Reserva Federal estadounidense decide un recorte agresivo de 50 puntos básicos en las tasas para mitigar la desaceleración del sector manufacturero local.',
    },
    {
      id: 'sec-6',
      title: 'Guerra Fría de Servidores en la Nube',
      type: 'geographic',
      impact: 'volatile',
      description: 'Un conflicto comercial obliga al cese inmediato de almacenamiento de nodos validadores de blockchain en nubes públicas, induciendo caos de estabilidad.',
    }
  ];

  const currentScenario = predefinedScenarios.find(s => s.id === selectedScenarioId) || predefinedScenarios[0];

  const triggerSimulation = async () => {
    if (!selectedCoin) {
      triggerNotification('Por favor, selecciona primero una moneda virtual en el panel de Monitoreo.');
      return;
    }

    setIsSimulating(true);
    setSimResults(null);
    setSimCommentary('');

    const activeScenarioPayload = activeTab === 'predefined' 
      ? {
          type: currentScenario.type,
          impact: currentScenario.impact,
          description: currentScenario.description,
        }
      : {
          type: customType,
          impact: customImpact,
          description: customDescription || 'Simulación personalizada de evento global sin descripción proporcionada.',
        };

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coinId: selectedCoin.id,
          symbol: selectedCoin.symbol,
          currentPrice: selectedCoin.price,
          scenario: activeScenarioPayload,
        }),
      });

      const data = await response.json();
      if (data.predictions) {
        setSimResults(data.predictions);
        setSimCommentary(data.commentary);
        triggerNotification(`¡Simulación exitosa para ${selectedCoin.name}! El modelo computó un impacto de tipo ${activeScenarioPayload.impact}.`);
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Fallo de red al solicitar estimación de escenario.');
    } finally {
      setIsSimulating(false);
    }
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'bullish':
        return <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/35 uppercase font-mono">Alcista</span>;
      case 'bearish':
        return <span className="text-[10px] bg-rose-500/15 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-500/35 uppercase font-mono">Bajista</span>;
      default:
        return <span className="text-[10px] bg-amber-500/15 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/35 uppercase font-mono font-semibold">Alta Volatilidad</span>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'geographic':
        return <Globe className="w-4 h-4 text-sky-400" />;
      case 'political':
        return <ShieldAlert className="w-4 h-4 text-indigo-400" />;
      case 'social':
        return <Sparkles className="w-4 h-4 text-violet-400" />;
      case 'economic':
        return <Landmark className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="scenario-panel">
      {/* Scenario Parametrization Sidebar (5 Columns) */}
      <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
              <Globe className="text-pink-500 w-4.5 h-4.5 animate-pulse" /> Parametrizador de Eventos
            </h3>
            <span className="text-[9px] bg-slate-950 font-mono text-slate-500 px-2 py-0.5 rounded border border-slate-805">
              ORACLE V2
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Configura y simula el impacto que producen eventos macroeconómicos, crisis geográficas, pautas regulatorias o tendencias de redes sobre <span className="text-indigo-400 font-bold font-mono">{selectedCoin?.name || 'la moneda seleccionada'}</span>.
          </p>

          {/* Toggle between predefined scenarios and custom scenario formulation */}
          <div className="flex bg-slate-950 p-1 rounded-xl gap-1 mb-4">
            <button
              onClick={() => setActiveTab('predefined')}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'predefined'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Predefinidos
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'custom'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Evento Propio
            </button>
          </div>

          {activeTab === 'predefined' ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
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
                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {sc.description}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mb-1">Tipo de Contexto:</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="geographic">🌍 Geográfico (Recursos, Energía, Locales)</option>
                  <option value="political">⚖️ Político / Regulatorio (SEC, MiCA, Tasas, Leyes)</option>
                  <option value="social">📣 Social / Hype Viral (Elon Musk, Tendencia, Pánico)</option>
                  <option value="economic">🏦 Económico / Macro (Tasas de Interés, Inflación)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mb-1">Impacto Esperado:</label>
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
                <label className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mb-1">Descripción del Evento:</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Ej: El Congreso de EE.UU. aprueba una ley de fomento minero de activos con energía limpia, incentivando la migración de granjas de poder hacia su región..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-650 resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={triggerSimulation}
            disabled={isSimulating || (activeTab === 'custom' && !customDescription.trim())}
            id="run-scenario-btn"
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

      {/* Predictions Outcome & Analysis Display (7 Columns) */}
      <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-slate-350 tracking-wider uppercase font-mono">
              Resultado Proyectado
            </h3>
            {selectedCoin ? (
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono uppercase rounded">
                Activo: {selectedCoin.symbol} ($ {selectedCoin.price.toLocaleString()})
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
                <p className="text-xs text-slate-300 font-semibold uppercase font-mono tracking-widest animate-pulse">Consultando Red Neuronal IA</p>
                <p className="text-[10px] text-slate-500 mt-1">Computando variables de riesgo y sensibilidades macroeconómicas...</p>
              </div>
            </div>
          )}

          {!isSimulating && !simResults && (
            <div className="py-24 flex flex-col items-center justify-center text-slate-500 text-center px-4">
              <HelpCircle className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Simulador Listo</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                Selecciona tu hipótesis financiera en la barra izquierda y ejecútala para contrastar la predicción actual contra el evento propuesto.
              </p>
            </div>
          )}

          {!isSimulating && simResults && (
            <div className="space-y-5 animate-fade-in">
              {/* Predictions Table display */}
              <div>
                <h4 className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-2">Curva Futura Estimada (T+1h a T+6h):</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {simResults.map((p, idx) => {
                    const coinPrice = selectedCoin?.price || 1;
                    const changeRatio = ((p.priceValue - coinPrice) / coinPrice) * 100;
                    const isPositive = changeRatio >= 0;

                    return (
                      <div key={idx} className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 block">{p.timeLabel}</span>
                        <span className="text-xs font-bold text-slate-200 block font-mono mt-1">
                          ${p.priceValue.toLocaleString(undefined, { maximumFractionDigits: selectedCoin && selectedCoin.price > 100 ? 1 : 3 })}
                        </span>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-medium mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}{changeRatio.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Graphical Trend Map */}
              <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-2">Canal de fluctuación ponderado (upper/lower range):</span>
                <div className="space-y-1.5">
                  {simResults.map((p, idx) => {
                    const rangePercent = ((p.upperBond - p.lowerBond) / p.priceValue) * 105;
                    return (
                      <div key={idx} className="flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span className="w-10 text-[10px] text-slate-500">{p.timeLabel}</span>
                        <div className="flex-1 bg-slate-950 h-5.5 rounded-md border border-slate-900 flex items-center relative overflow-hidden px-1">
                          {/* Inner bar representing prediction range */}
                          <div 
                            style={{ width: `${Math.min(100, Math.max(10, rangePercent * 6))}%` }}
                            className="bg-indigo-600/35 border-l border-r border-indigo-400 h-full absolute left-1/4"
                          />
                          <span className="absolute inset-x-0 text-center text-[9px] font-bold text-slate-300">
                            Confianza: {p.confidence}% (Fluctuación: ±{(rangePercent/2).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Commentary by Gemini Oracle */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-start gap-3.5 shadow-md">
                <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-pink-400 tracking-widest uppercase font-mono">
                    Conclusión de Inteligencia Escenarios (Gemini Engine)
                  </h4>
                  <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-sans">
                    {simCommentary}
                  </p>
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
    </div>
  );
}
