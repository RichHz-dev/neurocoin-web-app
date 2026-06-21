import { useState } from 'react';
import api from '../services/api.js';

// ID de sesión persistente por tab del navegador
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function useChat() {
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'w1',
      sender: 'assistant',
      text: '🤖 ¡Hola! Soy el asesor de escenarios y tendencias de mercado de NeuroCoin.\n\nEstoy aquí para analizar cómo acontecimientos geopolíticos, decisiones regulatorias nacionales (como regulaciones de la SEC o de la UE), las corrientes y modas virales de redes sociales, o los recortes de tasas de interés de la Fed impactan sobre los precios de Bitcoin, Ethereum, Solana, Cardano y Ripple.\n\n¿Qué escenario global o caso de contingencia te gustaría explorar o simular hoy?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

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

  return { chatHistory, isChatLoading, handleSendMessage };
}
