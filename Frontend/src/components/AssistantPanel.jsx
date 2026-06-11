import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Terminal, BookOpen, Layers } from 'lucide-react';

export default function AssistantPanel({
  chatHistory = [],
  onSendMessage,
  isChatLoading,
  triggerNotification,
}) {
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isChatLoading) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const handlePredefinedQuery = (query) => {
    if (isChatLoading) return;
    triggerNotification(`Consultando al arquitecto DevOps: "${query}"`);
    onSendMessage(query);
  };

  const sampleQueries = [
    { label: 'Impacto Geopolítico', text: '¿De qué manera los conflictos transfronterizos o crisis energéticas alteran el precio de Bitcoin y el Hashrate de minería?' },
    { label: 'Efecto de Regulaciones', text: '¿Qué impacto tienen las normativas restrictivas de bancos centrales y los cambios de la SEC sobre Ethereum y Ripple?' },
    { label: 'Sentimiento e Influencers', text: '¿Cómo influyen los tweets de líderes de opinión como Elon Musk o las corrientes de Reddit en el pánico y volatilidad de Solana o Ripple?' },
    { label: 'Políticas de la Fed', text: '¿Por qué las rebajas o alzas en las tasas de interés de la Fed redefinen los flujos de liquidez hacia activos virtuales?' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full" id="assistant-panel">
      {/* Informative Side Card with Scenario Overview (4 Columns) */}
      <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between" id="side-card-chat">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest font-mono mb-3 flex items-center gap-2">
            <BookOpen className="text-pink-400 w-4 h-4" /> Asesor de Escenarios
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Interactúa con un modelo avanzado de Inteligencia Artificial que comprende cómo acontecimientos internacionales, tensiones de gobernanza global y el sentimiento social moldean el curso del ecosistema criptográfico.
          </p>
          
          <div className="border-t border-slate-800/80 pt-3">
            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider block mb-2">Preguntas sugeridas:</span>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {sampleQueries.map((q, idx) => (
                <button
                   key={idx}
                   onClick={() => handlePredefinedQuery(q.text)}
                   disabled={isChatLoading}
                   className="w-full text-left text-xs bg-slate-950 hover:bg-slate-850 disabled:bg-slate-950/40 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-850 hover:border-slate-700/80 transition-all font-sans block text-ellipsis overflow-hidden"
                >
                  🧩 {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Culture statement footer */}
        <div className="mt-5 border-t border-slate-850 pt-4 text-[10px] text-slate-500 font-mono leading-relaxed flex items-center gap-2">
          <Layers className="w-4 h-4 text-pink-500/85" />
          <span>Macro & Sentiment Analysis: Vigilando la correlación de activos digitales.</span>
        </div>
      </div>

      {/* Main Interactive Chat Sandbox Console (8 Columns) */}
      <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[420px]" id="chat-box-console">
        {/* Messages feed area */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 scroll-smooth"
        >
          {chatHistory?.map((msg) => {
            const isAI = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[90%] ${isAI ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'}`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isAI ? 'bg-pink-550/10 text-pink-400' : 'bg-slate-900 text-pink-400'}`}>
                  {isAI ? <Sparkles className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                </div>
                <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                  isAI
                    ? 'bg-slate-900/60 border border-slate-800 text-slate-200'
                    : 'bg-gradient-to-r from-pink-700 to-indigo-700 text-white select-text font-medium'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`text-[8px] block mt-1.5 ${isAI ? 'text-slate-500 text-left' : 'text-indigo-250 text-right'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isChatLoading && (
            <div className="flex gap-3 max-w-[90%] mr-auto items-start animate-pulse">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 font-mono">
                El consultor AI está componiendo un reporte del mercado y geopolítica...
              </div>
            </div>
          )}
        </div>

        {/* Messaging toolbar & form */}
        <form onSubmit={handleSubmit} className="flex gap-2.5 border-t border-slate-900 pt-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isChatLoading}
            placeholder={isChatLoading ? 'Espere la respuesta...' : 'Consúltame sobre regulaciones de la SEC, tweets virales, tasas de interés, minería...'}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isChatLoading}
            id="send-chat-message-btn"
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:cursor-pointer transition-all flex items-center justify-center animate-pulse-ring"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
