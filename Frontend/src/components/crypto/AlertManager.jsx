import { useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../../services/api.js';

export default function AlertManager({ selectedCoin, alerts, onAddAlert, onDeleteAlert, triggerNotification }) {
  const [alertCond, setAlertCond] = useState('above');
  const [alertValue, setAlertValue] = useState('');

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

  return (
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
  );
}
