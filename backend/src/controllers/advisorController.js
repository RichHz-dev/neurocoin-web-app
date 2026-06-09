const Chat = require('../models/Chat');
const { chatWithAdvisor } = require('../services/geminiService');

const askQuestion = async (req, res) => {
  try {
    const { sessionId, userId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId y message son obligatorios.' });
    }

    // 1. Buscar el chat existente o crear uno nuevo
    let chat = await Chat.findOne({ sessionId });
    
    if (!chat) {
      chat = new Chat({
        sessionId,
        userId: userId || 'invitado_neurocoin',
        messages: []
      });
    }

    // 2. Extraer historial viejo (para dárselo a Gemini) y guardar el nuevo mensaje del usuario
    const previousMessages = chat.messages;
    chat.messages.push({ sender: 'user', text: message });
    await chat.save(); // Guardamos rápido para no perderlo si la IA falla

    // 3. Consultar a Gemini pasándole el historial
    const aiResponseText = await chatWithAdvisor(message, previousMessages);

    // 4. Guardar la respuesta de la IA en la BD
    chat.messages.push({ sender: 'assistant', text: aiResponseText });
    await chat.save();

    // 5. Devolver la respuesta al Frontend
    return res.status(200).json({
      sessionId: chat.sessionId,
      role: 'assistant',
      content: aiResponseText
    });

  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

module.exports = { askQuestion };