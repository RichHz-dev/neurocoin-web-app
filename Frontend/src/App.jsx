import React, { useState, useEffect } from 'react';
import CryptoPanel from './components/CryptoPanel.jsx';
import ScenarioPanel from './components/ScenarioPanel.jsx';
import AssistantPanel from './components/AssistantPanel.jsx';
import { Globe, RefreshCw, Zap, BellRing, Sparkles, MessageSquare, Info } from 'lucide-react';

export default function App() {
  // Tabs active status: 'cryptos' | 'scenarios' | 'chat'
  const [activeTab, setActiveTab] = useState('cryptos');

  // Real-time market metrics
  const [cryptos, setCryptos] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [loadingCryptos, setLoadingCryptos] = useState(true);

  // Volatility alerts memory
  const [alerts, setAlerts] = useState([]);

  // Crypto Advisor chat history memory state
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'w1',
      sender: 'assistant',
      text: '🤖 ¡Hola! Soy el asesor de escenarios y tendencias de mercado de NeuroCoin.\n\nEstoy aquí para analizar cómo acontecimientos geopolíticos, decisiones regulatorias nacionales (como regulaciones de la SEC o de la UE), las corrientes y modas virales de redes sociales, o los recortes de tasas de interés de la Fed impactan sobre los precios de Bitcoin, Ethereum, Solana, Cardano y Ripple.\n\n¿Qué escenario global o caso de contingencia te gustaría explorar o simular hoy?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // In-app floating toast notifications
  const [notification, setNotification] = useState(null);

  // Fetch live market data periodically
  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/cryptos');
      const data = await response.json();
      if (data.cryptos) {
        setCryptos(data.cryptos);
        // Default to Bitcoin first time
        if (loadingCryptos) {
          const defaultCoin = data.cryptos.find((c) => c.id === 'bitcoin') || data.cryptos[0];
          setSelectedCoin(defaultCoin);
          setLoadingCryptos(false);
        } else if (selectedCoin) {
          // Keep current selection details updated in real-time
          const updatedSelected = data.cryptos.find((c) => c.id === selectedCoin.id);
          if (updatedSelected) {
            setSelectedCoin(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching live financial rates:', err);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 4000);
    return () => clearInterval(interval);
  }, [loadingCryptos, selectedCoin]);

  // Raise system notification bubble helper
  const triggerNotification = (msg) => {
    const id = Date.now();
    setNotification({ msg, id });
    setTimeout(() => {
      setNotification((prev) => (prev?.id === id ? null : prev));
    }, 7000);
  };

  // Add customized volatility margin alert
  const handleAddAlert = (coinId, coinName, condition, value) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      coinId,
      coinName,
      condition,
      value,
      isActive: true,
      isTriggered: false,
      createdAt: new Date().toLocaleTimeString()
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Remove alert
  const handleDeleteAlert = (id) => {
    setAlerts((prev) => prev.filter((al) => al.id !== id));
  };

  // Real-time Chat message sender linked to Express Gemini Server endpoint
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/crypto/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg]
        })
      });

      const data = await response.json();
      if (data.reply) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error contacting Express chat endpoint:', err);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Disculpa, no logré comunicarme con el servidor. Por favor, asegúrate de que el backend de NeuroCoin esté activo.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden antialiased">
      {/* Dynamic Floating Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-55 max-w-sm animate-bounce-short bg-slate-900 border-l-4 border-pink-500 rounded-xl shadow-xl shadow-slate-950 p-4 border border-slate-800 backdrop-blur-md" id="floating-notification">
          <div className="flex items-start gap-3">
            <BellRing className="text-pink-400 w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h5 className="text-xs font-bold text-slate-200">Notificación del Mercado</h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal pr-2">{notification.msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Futuristic Background Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-[480px] h-[480px] bg-pink-900/5 rounded-full blur-[110px] -z-10 bg-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] bg-indigo-900/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Header Panel */}
      <header className="border-b border-indigo-950/40 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Custom crafted neon cryptocurrency core badge */}
            <div className="relative flex items-center justify-center p-2.5 bg-gradient-to-tr from-pink-950 to-slate-950 rounded-xl border border-pink-650/40 shadow-inner">
              <span className="text-pink-400 font-mono text-base font-extrabold tracking-tight">N₵</span>
              <div className="absolute -inset-0.5 border border-pink-400/25 rounded-xl animate-pulse-ring pointer-events-none"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-white uppercase font-sans">
                  Neuro<span className="text-pink-400">Coin</span>
                </h1>
                <span className="text-[8px] bg-pink-500/15 text-pink-400 font-bold px-1.5 py-0.2 rounded border border-pink-500/30 uppercase tracking-widest font-mono">
                  Market Forecaster
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                Modelado Predictivo de Criptomonedas & Análisis de Escenarios Globales
              </span>
            </div>
          </div>

          {/* Core active status indicators */}
          <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
              <span>Ticker: <span className="text-slate-100 uppercase font-bold">ACTIVO</span></span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Gemini Analizador: <span className="text-slate-100 uppercase">Listo</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-start">
        {/* Culture Description Intro Jumbotron Banner */}
        <section className="bg-gradient-to-r from-slate-950/60 via-pink-950/10 to-slate-950/60 border border-indigo-950/30 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between animate-fade-in" id="intro-banner-crypto">
          <div className="flex gap-4 items-start max-w-2xl text-center sm:text-left">
            <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 hidden sm:block shrink-0">
              <Globe className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Monitoreo Predictivo Inteligente frente a Escenarios de Volatilidad
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                Esta solución de Inteligencia Artificial muestra información detallada de monedas virtuales y proyecta su comportamiento técnico combinando modelos predictivos LSTM híbridos. Analiza el impacto directo de variables geopolíticas, cambios gubernamentales, regulaciones continentales y el sentimiento social colectivo.
              </p>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-center shrink-0 min-w-[140px]">
            <span className="text-[9px] text-slate-500 uppercase block font-mono">Modelo Predictivo</span>
            <span className="text-xs font-mono font-semibold text-pink-400 block mt-1">LSTM-HYBRID V2.0</span>
            <span className="text-[9px] text-slate-400 italic block mt-1">Análisis cuantitativo</span>
          </div>
        </section>

        {/* Tab Navigation Toolbar Bar (Retargeted only to Crypto) */}
        <nav className="flex bg-slate-900/50 border border-slate-800/80 rounded-2xl p-1 mb-6 gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab('cryptos')}
            id="tab-btn-cryptos"
            className={`flex-1 min-w-[120px] text-center flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium hover:cursor-pointer transition-all ${
              activeTab === 'cryptos'
                ? 'bg-gradient-to-r from-pink-650 to-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Monitoreo & ML (LSTM)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('scenarios')}
            id="tab-btn-scenarios"
            className={`flex-1 min-w-[120px] text-center flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium hover:cursor-pointer transition-all ${
              activeTab === 'scenarios'
                ? 'bg-gradient-to-r from-pink-650 to-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Simulador de Escenarios</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            id="tab-btn-chat"
            className={`flex-1 min-w-[120px] text-center flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium hover:cursor-pointer transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-pink-650 to-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Asesor de Escenarios IA</span>
          </button>
        </nav>

        {/* Dynamic Display of Modules */}
        <section className="flex-1 min-h-[400px]">
          {activeTab === 'cryptos' && (
            <CryptoPanel
              cryptos={cryptos}
              selectedCoin={selectedCoin}
              onSelectCoin={setSelectedCoin}
              alerts={alerts}
              onAddAlert={handleAddAlert}
              onDeleteAlert={handleDeleteAlert}
              triggerNotification={triggerNotification}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenarioPanel
              cryptos={cryptos}
              selectedCoin={selectedCoin}
              triggerNotification={triggerNotification}
            />
          )}

          {activeTab === 'chat' && (
            <AssistantPanel
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isChatLoading={isChatLoading}
              triggerNotification={triggerNotification}
            />
          )}
        </section>
      </main>

      {/* Footer Info Statement */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono tracking-wide">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-pink-400" />
            <span>NeuroCoin Scenario Predictor Platform &copy; 2026. Todos los derechos reservados.</span>
          </div>
          <span>Status: Standard Node Sandbox Port 3000 Connected</span>
        </div>
      </footer>
    </div>
  );
}
