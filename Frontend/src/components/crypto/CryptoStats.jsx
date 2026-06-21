export default function CryptoStats({ selectedCoin }) {
  if (!selectedCoin) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-slate-950/40 rounded-xl p-3 border border-slate-850">
      <div>
        <span className="text-[10px] text-slate-500 font-mono block uppercase">Máximo 24h</span>
        <span className="text-sm font-semibold text-slate-200 mt-0.5 block font-mono">
          ${selectedCoin.high24h >= 1 ? selectedCoin.high24h.toLocaleString() : selectedCoin.high24h}
        </span>
      </div>
      <div>
        <span className="text-[10px] text-slate-500 font-mono block uppercase">Mínimo 24h</span>
        <span className="text-sm font-semibold text-slate-300 mt-0.5 block font-mono">
          ${selectedCoin.low24h >= 1 ? selectedCoin.low24h.toLocaleString() : selectedCoin.low24h}
        </span>
      </div>
      <div>
        <span className="text-[10px] text-slate-500 font-mono block uppercase">Volumen Diario</span>
        <span className="text-sm font-semibold text-slate-200 mt-0.5 block font-mono">
          ${((selectedCoin.volume24h || 0) / 1e6).toFixed(1)}M
        </span>
      </div>
      <div>
        <span className="text-[10px] text-slate-500 font-mono block uppercase">Elasticidad Vol.</span>
        <span className={`inline-flex items-center text-xs font-semibold mt-1 font-mono uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded ${selectedCoin.volatilityElasticity === 'ALTA' || Math.abs(selectedCoin.change24h) > 5 ? 'text-amber-400' : 'text-slate-400'}`}>
          {selectedCoin.volatilityElasticity || (Math.abs(selectedCoin.change24h) > 5 ? 'Alta' : 'Moderada')}
        </span>
      </div>
    </div>
  );
}
