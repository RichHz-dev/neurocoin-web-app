import { Globe, Zap, MessageSquare } from 'lucide-react';

export default function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'cryptos', icon: <Zap className="w-4 h-4" />, label: 'Monitoreo & ML (LSTM)' },
    { id: 'scenarios', icon: <Globe className="w-4 h-4" />, label: 'Simulador de Escenarios' },
    { id: 'chat', icon: <MessageSquare className="w-4 h-4" />, label: 'Asesor de Cryptos' },
  ];

  return (
    <nav className="flex bg-slate-900/50 border border-slate-800/80 rounded-2xl p-1 mb-6 gap-1 flex-wrap">
      {tabs.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex-1 min-w-[120px] text-center flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium hover:cursor-pointer transition-all ${
            activeTab === id
              ? 'bg-gradient-to-r from-pink-650 to-indigo-650 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
