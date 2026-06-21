import { useState } from 'react';

export default function CryptoChart({
  selectedCoin,
  timeframe,
  historicalData,
  isLoadingHistory,
  predictionCurve,
  predictionChannel
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!selectedCoin) return null;

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
            fill={idx === histCount - 1 ? '#eab308' : (selectedCoin.change24h >= 0 ? '#10b981' : '#ef4444')}
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
}
