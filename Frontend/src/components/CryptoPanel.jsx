import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Bell, Zap, Cpu, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../services/api.js';

export default function CryptoPanel({
  cryptos = [],
  selectedCoin,
  onSelectCoin,
  alerts = [],
  onAddAlert,
  onDeleteAlert,
  triggerNotification,
}) {
  const [alertValue, setAlertValue] = useState('');
  const [alertCond, setAlertCond] = useState('above');
  const [isPredicting, setIsPredicting] = useState(false);

  const [predictionCurve, setPredictionCurve] = useState(null);
  const [predictionChannel, setPredictionChannel] = useState(null);
  const [predictionCommentary, setPredictionCommentary] = useState('');
  const [mlLogs, setMlLogs] = useState([]);

  const [timeframe, setTimeframe] = useState('REALTIME');
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (!selectedCoin || timeframe === 'REALTIME') return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const { data } = await api.get(`/api/cryptos/${selectedCoin.coinId}/history?timeframe=${timeframe}`);
        setHistoricalData(data);
      } catch (err) {
        console.error('Error obteniendo historial:', err);
        triggerNotification(`⚠️ No se pudo cargar el historial de ${timeframe}`);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, selectedCoin?.coinId]);

  useEffect(() => {
    if (!selectedCoin) return;
    alerts.forEach((alert) => {
      if (alert.isActive && !alert.isTriggered && alert.coinId === selectedCoin.coinId) {
        const isMet =
          (alert.condition === 'above' && selectedCoin.price >= alert.value) ||
          (alert.condition === 'below' && selectedCoin.price <= alert.value);

        if (isMet) {
          alert.isTriggered = true;
          triggerNotification(`🚨 Alerta de Volatilidad: ¡${alert.coinName} ha cruzado el límite de $${alert.value}! (Actual: $${selectedCoin.price})`);
        }
      }
    });
  }, [cryptos, selectedCoin, alerts, triggerNotification]);

  // 3. Simulación Predictiva
  const runPredictiveModel = async () => {
    if (!selectedCoin) return;
    setIsPredicting(true);
    setPredictionCurve(null);
    setPredictionChannel(null);
    setPredictionCommentary('');
    setMlLogs([]);

  const steps = [
      '🐍 Conectando con el motor Python ML Service...',
      `📈 Analizando timeframe: ${timeframe}...`,
      '🛠️ Calculando medias móviles e índices de fuerza relativa (RSI)...',
      '🔄 Ejecutando modelo Random Forest Regressor...',
      '⚡ Ajustando canales de volatilidad según horizonte temporal...',
      '🧬 Generando conclusión técnica con IA generativa...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((res) => setTimeout(res, 350));
      setMlLogs((prev) => [...prev, steps[i]]);
    }

    try {
      const { data } = await api.post('/api/cryptos/forecast', {
        coinId: selectedCoin.coinId,
        timeframe: timeframe
      });

      if (data.estimatedCurve?.length > 0) {
        setPredictionCurve(data.estimatedCurve);
        setPredictionChannel(data.fluctuationChannel || []);
        setPredictionCommentary(data.aiConclusion || '');
      }
    } catch {
      triggerNotification('⚠️ Error al conectar con el motor predictivo.');
    } finally {
      setIsPredicting(false);
    }
  };

  // 4. Crear Alertas
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    const valueNum = parseFloat(alertValue);
    if (!selectedCoin || isNaN(valueNum) || valueNum <= 0) return;

    try {
      await api.post('/api/alerts', {
        coinId: selectedCoin.coinId,
        coinName: selectedCoin.name,
        condition: alertCond,
        value: valueNum
      });
      onAddAlert(selectedCoin.coinId, selectedCoin.name, alertCond, valueNum);
      setAlertValue('');
      triggerNotification(`🔔 Alerta guardada para ${selectedCoin.name} en $${valueNum}`);
    } catch {
      triggerNotification('⚠️ Error al guardar la alerta.');
    }
  };

  const renderInteractiveChart = () => {
    if (!selectedCoin) return null;

    // MAGIA EN VIVO: Si estamos en histórico, el último punto siempre es el precio real actual
    let histData = timeframe === 'REALTIME' ? [...(selectedCoin.sparkline || [])] : [...historicalData];
    if (timeframe !== 'REALTIME' && histData.length > 0) {
      histData[histData.length - 1] = selectedCoin.price;
    }

    const histCount = histData.length;
    if (isLoadingHistory || histCount === 0)
      return <div className="text-center text-slate-500 py-20 animate-pulse font-mono text-xs">Cargando oráculo histórico...</div>;

    const width = 640, height = 240, padding = 34;
    const allValues = predictionCurve ? [...histData, ...predictionCurve.map(p => p.price)] : histData;
    const maxVal = Math.max(...allValues) * 1.01;
    const minVal = Math.min(...allValues) * 0.99;
    const range = maxVal - minVal || 1;

    const getX = (index, isPred = false) => {
      const segW = (width - padding * 2) * (isPred ? 0.4 : 0.55);
      const baseStart = isPred ? padding + (width - padding * 2) * 0.55 + padding : padding;
      const divisor = isPred ? 5 : Math.max(histCount - 1, 1);
      return baseStart + (index / divisor) * segW;
    };

    const getY = (val) => height - padding - ((val - minVal) / range) * (height - padding * 2);

    let histPath = '';
    histData.forEach((val, idx) => { histPath += idx === 0 ? `M ${getX(idx)} ${getY(val)}` : ` L ${getX(idx)} ${getY(val)}`; });

    let predPath = '';
    if (predictionCurve && histCount > 0) {
      predPath = `M ${getX(histCount - 1)} ${getY(histData[histCount - 1])}`;
      predictionCurve.forEach((p, idx) => { predPath += ` L ${getX(idx, true)} ${getY(p.price)}`; });
    }

    const avgConfidence = predictionChannel?.length > 0
      ? Math.round(predictionChannel.reduce((acc, p) => acc + (p.confidence || 0), 0) / predictionChannel.length)
      : null;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-slate-950/60 rounded-xl border border-slate-800/80 p-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const yVal = minVal + (range / 4) * i;
            const yCoord = getY(yVal);
            return (
              <g key={i}>
                <line x1={padding} y1={yCoord} x2={width - padding} y2={yCoord} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                <text x={padding - 6} y={yCoord + 4} fill="#64748b" fontSize="8" textAnchor="end" className="font-mono">
                  ${yVal.toLocaleString(undefined, { maximumFractionDigits: selectedCoin.price > 100 ? 0 : 4 })}
                </text>
              </g>
            );
          })}

          <text x={getX(4)} y={height - 8} fill="#d1d5db" fontSize="9" textAnchor="middle">
            Historial ({timeframe === 'REALTIME' ? 'Tiempo Real' : timeframe})
          </text>

          {predictionCurve && (
            <text x={getX(2.5, true)} y={height - 8} fill="#06b6d4" fontSize="9" textAnchor="middle">Proyección IA (LSTM)</text>
          )}

          <line x1={getX(histCount - 1) + padding / 2} y1={padding / 2} x2={getX(histCount - 1) + padding / 2} y2={height - padding} stroke="#475569" strokeDasharray="5 5" strokeWidth="1.5" />

          <path d={histPath} fill="none" stroke={selectedCoin.change24h >= 0 ? '#10b981' : '#ef4444'} strokeWidth="2.5" strokeLinecap="round" />

          {predictionCurve && predPath && (
            <path d={predPath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 2" />
          )}

          {/* Puntos históricos */}
          {histData.map((val, idx) => (
            <circle
              key={`h-${idx}`} cx={getX(idx)} cy={getY(val)}
              r={idx === histCount - 1 ? '4' : '2.5'}
              fill={idx === histCount - 1 ? '#eab308' : (selectedCoin.change24h >= 0 ? '#10b981' : '#ef4444')} // Destacamos en amarillo el precio en vivo
              className="hover:cursor-pointer transition-all duration-200 hover:r-[6px]"
              onMouseEnter={() => setHoveredPoint({ x: getX(idx), y: getY(val), price: val, type: idx === histCount - 1 ? 'En Vivo' : 'Histórico' })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Puntos predicción */}
          {predictionCurve?.map((p, idx) => (
            <g key={`p-${idx}`}>
              <circle
                cx={getX(idx, true)} cy={getY(p.price)} r="3.5" fill="#06b6d4"
                className="hover:cursor-pointer transition-all duration-200 hover:r-[6px]"
                onMouseEnter={() => setHoveredPoint({ x: getX(idx, true), y: getY(p.price), price: p.price, type: 'Proyección IA' })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <text x={getX(idx, true)} y={getY(p.price) - 8} fill="#38bdf8" fontSize="7" textAnchor="middle">
                ${p.price?.toLocaleString(undefined, { maximumFractionDigits: selectedCoin.price > 100 ? 1 : 4 })}
              </text>
            </g>
          ))}
        </svg>

        {predictionCurve && avgConfidence !== null && (
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-cyan-500/30 text-[10px] text-cyan-400 py-1 px-2.5 rounded font-mono flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Confianza Promedio: {avgConfidence}%
          </div>
        )}

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-slate-900 border border-slate-700 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl font-mono z-50 whitespace-nowrap"
            style={{ left: `${hoveredPoint.x + 15}px`, top: `${hoveredPoint.y - 15}px` }}
          >
            <span className="text-slate-400 block mb-0.5 text-[9px] uppercase tracking-wider">{hoveredPoint.type}</span>
            <span className="font-bold text-slate-100 text-xs">
              ${hoveredPoint.price.toLocaleString(undefined, { maximumFractionDigits: selectedCoin.price > 100 ? 2 : 4 })}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full" id="crypto-panel">
      {/* Sidebar de Monedas */}
      <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
            <Zap className="text-indigo-400 w-4 h-4" /> Activos Financieros
          </h3>
          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            {cryptos?.map((coin) => {
              const isSelected = selectedCoin?.coinId === coin.coinId;
              const isUp = coin.change24h >= 0;
              return (
                <button
                  key={coin.coinId}
                  onClick={() => onSelectCoin(coin)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${isSelected ? 'bg-gradient-to-r from-indigo-950/50 to-slate-950/80 border border-indigo-500/40 text-white shadow-lg' : 'bg-slate-900 hover:bg-slate-800 border-transparent text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg font-mono font-bold text-xs ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-850'}`}>{coin.symbol}</div>
                    <div>
                      <span className="font-semibold block text-sm">{coin.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">MCap: ${((coin.marketCap || 0) / 1e9).toFixed(1)}B</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold block text-sm text-slate-100">
                      ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : coin.price}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {isUp ? '+' : ''}{coin.change24h?.toFixed(2)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gestor Alertas */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-500" /> Límites de Volatilidad
          </h4>
          <form onSubmit={handleCreateAlert} className="flex gap-2 mb-3">
            <select value={alertCond} onChange={(e) => setAlertCond(e.target.value)} className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-mono">
              <option value="above">≥</option>
              <option value="below">≤</option>
            </select>
            <input type="number" step="any" value={alertValue} onChange={(e) => setAlertValue(e.target.value)} placeholder={`Ej: ${selectedCoin ? (selectedCoin.price * 1.05).toFixed(0) : '200'}`} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono" />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Fijar</button>
          </form>

          <div className="max-h-[105px] overflow-y-auto space-y-1.5 pr-1">
            {alerts.length === 0 ? (
              <span className="text-[11px] text-slate-600 italic block text-center py-2">Sin alertas activas</span>
            ) : (
              alerts.map((al) => (
                <div key={al.id} className="flex items-center justify-between bg-slate-950/70 border border-slate-900 rounded-lg px-2.5 py-1 text-[11px] font-mono">
                  <span className="text-slate-400 capitalize">{al.coinName} {al.condition === 'above' ? '≥' : '≤'} ${al.value}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 rounded border ${al.isTriggered ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {al.isTriggered ? '¡Gatillada!' : 'Activa'}
                    </span>
                    <button type="button" onClick={() => onDeleteAlert(al.id)} className="text-slate-500 hover:text-slate-300">&times;</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel Principal */}
      <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between">
        {selectedCoin ? (
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Panel Analítico: <span className="text-indigo-400">{selectedCoin.name}</span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{selectedCoin.symbol}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Fluctuación extrema y modelado predictivo LSTM de volatilidad financiera.</p>
              </div>

              <button onClick={runPredictiveModel} disabled={isPredicting} className={`flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 disabled:from-slate-800 disabled:to-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg ${isPredicting ? 'animate-pulse' : ''}`}>
                <Cpu className={`w-4 h-4 ${isPredicting ? 'animate-spin-slow' : ''}`} />
                {isPredicting ? 'Procesando ML...' : 'Ejecutar Predicción'}
              </button>
            </div>

            {isPredicting && (
              <div className="bg-slate-950 border border-cyan-550/20 rounded-xl p-4 font-mono text-[10px] text-cyan-400 space-y-1 h-[240px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-cyan-950 pb-2 mb-2">
                  <span className="font-semibold text-xs tracking-wider flex items-center gap-1.5 uppercase"><Sparkles className="w-3.5 h-3.5 animate-spin" /> Stream: ml-analytic-service</span>
                  <span className="text-[9px] bg-cyan-950/50 px-1.5 py-0.5 rounded">STATUS: RUNNING</span>
                </div>
                {mlLogs.map((log, i) => (<div key={i} className="flex items-start gap-1"><span className="text-slate-650">[{new Date().toLocaleTimeString()}]</span><span>{log}</span></div>))}
                <div className="animate-pulse bg-cyan-400/20 w-40 h-3 rounded mt-2" />
              </div>
            )}

            {!isPredicting && (
              <div className="flex-1 flex flex-col justify-center">

                {/* Selector Timeframe */}
                <div className="flex bg-slate-950 p-1 rounded-xl gap-1 mb-4 mt-2 w-fit border border-slate-800">
                  {['REALTIME', '1H', '1D', '1M', '1Y'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => { setTimeframe(tf); setPredictionCurve(null); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${timeframe === tf ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                    >
                      {tf === 'REALTIME' ? '🔴 LIVE' : tf}
                    </button>
                  ))}
                </div>

                {renderInteractiveChart()}

                {/* Stats Generales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-slate-950/40 rounded-xl p-3 border border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Máximo 24h</span>
                    <span className="text-sm font-semibold text-slate-200 mt-0.5 block font-mono">${selectedCoin.high24h >= 1 ? selectedCoin.high24h.toLocaleString() : selectedCoin.high24h}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Mínimo 24h</span>
                    <span className="text-sm font-semibold text-slate-300 mt-0.5 block font-mono">${selectedCoin.low24h >= 1 ? selectedCoin.low24h.toLocaleString() : selectedCoin.low24h}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Volumen Diario</span>
                    <span className="text-sm font-semibold text-slate-200 mt-0.5 block font-mono">${((selectedCoin.volume24h || 0) / 1e6).toFixed(1)}M</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Elasticidad Vol.</span>
                    <span className={`inline-flex items-center text-xs font-semibold mt-1 font-mono uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded ${selectedCoin.volatilityElasticity === 'ALTA' || Math.abs(selectedCoin.change24h) > 5 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {selectedCoin.volatilityElasticity || (Math.abs(selectedCoin.change24h) > 5 ? 'Alta' : 'Moderada')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {predictionCurve && !isPredicting && (
              <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase font-mono">Conclusiones</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{predictionCommentary}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <AlertTriangle className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-sm">Selecciona un activo criptográfico para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
}