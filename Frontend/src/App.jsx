import { useState, useEffect, useRef } from 'react';
import CryptoPanel from './components/CryptoPanel.jsx';
import ScenarioPanel from './components/ScenarioPanel.jsx';
import AssistantPanel from './components/AssistantPanel.jsx';
import api from './services/api.js';
import { Globe, Zap, BellRing, MessageSquare, Info } from 'lucide-react';

// ID de sesión persistente por tab del navegador
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const [activeTab, setActiveTab] = useState('cryptos');

  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 segundos

  const [cryptos, setCryptos] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [loadingCryptos, setLoadingCryptos] = useState(true);

  const [alerts, setAlerts] = useState([]);
  const [notification, setNotification] = useState(null);

  const [chatHistory, setChatHistory] = useState([
    {
      id: 'w1',
      sender: 'assistant',
      text: '🤖 ¡Hola! Soy el asesor de escenarios y tendencias de mercado de NeuroCoin.\n\nEstoy aquí para analizar cómo acontecimientos geopolíticos, decisiones regulatorias nacionales (como regulaciones de la SEC o de la UE), las corrientes y modas virales de redes sociales, o los recortes de tasas de interés de la Fed impactan sobre los precios de Bitcoin, Ethereum, Solana, Cardano y Ripple.\n\n¿Qué escenario global o caso de contingencia te gustaría explorar o simular hoy?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Evita que la referencia a selectedCoin en el interval quede desactualizada
  const selectedCoinRef = useRef(selectedCoin);
  useEffect(() => {
    selectedCoinRef.current = selectedCoin;
  }, [selectedCoin]);

  // ─── Fetch de criptomonedas ───────────────────────────────────────────────
  const fetchMarketData = async () => {
    try {
      // El backend expone: GET /api/cryptos → devuelve array de documentos Crypto
      const { data } = await api.get('/api/cryptos');

      // El controller devuelve el array directamente (sin wrapper .cryptos)
      const list = Array.isArray(data) ? data : data.cryptos ?? [];

      if (list.length === 0) return;

      setCryptos(list);

      // ACTUALIZACIÓN DE ESTADO SEGURA (Adiós selectedCoinRef)
      setSelectedCoin((prevSelected) => {
        // 1. Si es la primera vez (no hay moneda seleccionada)
        if (!prevSelected) {
          return list.find((c) => c.coinId === 'bitcoin') || list[0];
        }

        // 2. Si el usuario ya seleccionó una, buscamos esa misma para actualizar su precio
        const updatedCoin = list.find((c) => c.coinId === prevSelected.coinId);

        // 3. Devolvemos la moneda actualizada, o mantenemos la que estaba si hubo error
        return updatedCoin || prevSelected;
      });

      // Apagamos el loader si es la primera carga
      if (loadingCryptos) {
        setLoadingCryptos(false);
      }

    } catch (err) {
      console.error('Error al obtener tasas financieras:', err.message);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, refreshInterval); // coincide con el intervalo del backend
    return () => clearInterval(interval);
  }, [refreshInterval]); // eslint-disable-line react-hooks/exhaustive-deps


  // ─── Notificaciones flotantes ─────────────────────────────────────────────
  const triggerNotification = (msg) => {
    const id = Date.now();
    setNotification({ msg, id });
    setTimeout(() => setNotification((prev) => (prev?.id === id ? null : prev)), 7000);
  };

  // ─── Alertas de volatilidad (estado local) ────────────────────────────────
  const handleAddAlert = (coinId, coinName, condition, value) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      coinId,
      coinName,
      condition,
      value,
      isActive: true,
      isTriggered: false,
      createdAt: new Date().toLocaleTimeString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (id) => setAlerts((prev) => prev.filter((al) => al.id !== id));

  // ─── Chat con el asesor de IA ─────────────────────────────────────────────
  // El backend espera POST /api/advisor/ask con { sessionId, message }
  // y devuelve { sessionId, role, content }
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const { data } = await api.post('/api/advisor/ask', {
        sessionId: SESSION_ID,
        userId: 'neurocoin_user',
        message: text,
      });

      // El backend devuelve el campo "content" con la respuesta del asesor
      const replyText = data.content || data.reply || 'Sin respuesta del servidor.';

      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error('Error contactando al asesor AI:', err.message);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Disculpa, no logré comunicarme con el servidor. Por favor, asegúrate de que el backend de NeuroCoin esté activo en el puerto 5000.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden antialiased">
      {/* Toast flotante */}
      {notification && (
        <div className="fixed top-5 right-5 z-55 max-w-sm animate-bounce-short bg-slate-900 border-l-4 border-pink-500 rounded-xl shadow-xl shadow-slate-950 p-4 border border-slate-800 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <BellRing className="text-pink-400 w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h5 className="text-xs font-bold text-slate-200">Notificación del Mercado</h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal pr-2">{notification.msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Luces ambientales */}
      <div className="absolute top-0 left-1/4 w-[480px] h-[480px] bg-pink-900/5 rounded-full blur-[110px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] bg-indigo-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-indigo-950/40 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-2.5 bg-gradient-to-tr from-pink-950 to-slate-950 rounded-xl border border-pink-650/40 shadow-inner">
              <span className="text-pink-400 font-mono text-base font-extrabold tracking-tight">N₵</span>
              <div className="absolute -inset-0.5 border border-pink-400/25 rounded-xl animate-pulse-ring pointer-events-none" />
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
                Modelado Predictivo de Criptomonedas &amp; Análisis de Escenarios Globales
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
              <span>
                Ticker: <span className="text-slate-100 uppercase font-bold">ACTIVO</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                Gemini Analizador: <span className="text-slate-100 uppercase">Listo</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-start">
        {/* Banner intro */}
        <section className="bg-gradient-to-r from-slate-950/60 via-pink-950/10 to-slate-950/60 border border-indigo-950/30 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between animate-fade-in">
          <div className="flex gap-4 items-start max-w-2xl text-center sm:text-left">
            <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 hidden sm:block shrink-0">
              <Globe className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Monitoreo Predictivo Inteligente frente a Escenarios de Volatilidad
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                Esta solución de Inteligencia Artificial muestra información detallada de monedas
                virtuales y proyecta su comportamiento técnico combinando modelos predictivos LSTM
                híbridos. Analiza el impacto directo de variables geopolíticas, cambios
                gubernamentales, regulaciones continentales y el sentimiento social colectivo.
              </p>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-center shrink-0 min-w-[140px]">
            <span className="text-[9px] text-slate-500 uppercase block font-mono">Modelo Predictivo</span>
            <span className="text-xs font-mono font-semibold text-pink-400 block mt-1">LSTM-HYBRID V2.0</span>
            <span className="text-[9px] text-slate-400 italic block mt-1">Análisis cuantitativo</span>
          </div>
        </section>

        {/* Tabs */}
        <nav className="flex bg-slate-900/50 border border-slate-800/80 rounded-2xl p-1 mb-6 gap-1 flex-wrap">
          {[
            { id: 'cryptos', icon: <Zap className="w-4 h-4" />, label: 'Monitoreo & ML (LSTM)' },
            { id: 'scenarios', icon: <Globe className="w-4 h-4" />, label: 'Simulador de Escenarios' },
            { id: 'chat', icon: <MessageSquare className="w-4 h-4" />, label: 'Asesor de Escenarios IA' },
          ].map(({ id, icon, label }) => (
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

        {/* Paneles */}
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono tracking-wide">
          <div className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-pink-400" />
            <span>NeuroCoin Scenario Predictor Platform © 2026. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}