import { useState, useEffect } from 'react';
import { Cpu, Sparkles, AlertTriangle } from 'lucide-react';

// Hooks
import { useCryptoHistory } from '../hooks/crypto/useCryptoHistory.js';
import { useCryptoML } from '../hooks/crypto/useCryptoML.js';

// Subcomponents
import CoinList from './crypto/CoinList.jsx';
import AlertManager from './crypto/AlertManager.jsx';
import CryptoChart from './crypto/CryptoChart.jsx';
import CryptoStats from './crypto/CryptoStats.jsx';

export default function CryptoPanel({
  cryptos = [],
  selectedCoin,
  onSelectCoin,
  alerts = [],
  onAddAlert,
  onDeleteAlert,
  triggerNotification,
}) {
  const [timeframe, setTimeframe] = useState('REALTIME');

  const { historicalData, isLoadingHistory } = useCryptoHistory(selectedCoin, timeframe, triggerNotification);

  const {
    isPredicting,
    predictionCurve,
    predictionChannel,
    predictionCommentary,
    mlLogs,
    runPredictiveModel,
    resetPrediction
  } = useCryptoML(selectedCoin, timeframe, triggerNotification);

  // Trigger alerts logic
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full" id="crypto-panel">
      {/* Sidebar de Monedas */}
      <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between">
        <CoinList cryptos={cryptos} selectedCoin={selectedCoin} onSelectCoin={onSelectCoin} />
        
        <AlertManager 
          selectedCoin={selectedCoin} 
          alerts={alerts} 
          onAddAlert={onAddAlert} 
          onDeleteAlert={onDeleteAlert} 
          triggerNotification={triggerNotification} 
        />
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
                      onClick={() => { setTimeframe(tf); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${timeframe === tf ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                    >
                      {tf === 'REALTIME' ? '🔴 LIVE' : tf}
                    </button>
                  ))}
                </div>

                <CryptoChart 
                  selectedCoin={selectedCoin} 
                  timeframe={timeframe} 
                  historicalData={historicalData} 
                  isLoadingHistory={isLoadingHistory} 
                  predictionCurve={predictionCurve} 
                  predictionChannel={predictionChannel} 
                />

                <CryptoStats selectedCoin={selectedCoin} />
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