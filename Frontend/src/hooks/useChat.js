import { useState } from 'react';
import api from '../services/api.js';

// ID de sesión persistente por tab del navegador
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function useChat() {
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'w1',
      sender: 'assistant',
      text: '🤖 ¡Hola! Soy el Asesor General de Criptomonedas de NeuroCoin.\n\nEstoy aquí para ayudarte a comprender el mundo de los activos digitales. Ya sea que estés dando tus primeros pasos y quieras entender cómo funciona Blockchain o una Wallet, o si eres un usuario experimentado buscando discutir estrategias de inversión y DeFi.\n\n¿En qué te puedo ayudar hoy?',
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
