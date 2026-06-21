import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function CoinList({ cryptos, selectedCoin, onSelectCoin }) {
  return (
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
  );
}
