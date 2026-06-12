const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Función auxiliar para pausar la ejecución unos milisegundos
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const analyzeGeopoliticalScenario = async (userScenario) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'tu_clave_de_gemini_aqui') {
    throw new Error('La GEMINI_API_KEY no está configurada en el .env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `
    Eres el "Oráculo de NeuroCoin", un sistema avanzado de Inteligencia Artificial especializado en macroeconomía, geopolítica y mercados de criptomonedas. 
    Tu objetivo es analizar el escenario hipotético o real planteado por el usuario y evaluar su impacto directo en el mercado crypto, enfocado en: Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Cardano (ADA) y Ripple (XRP).
    
    Debes estructurar tu respuesta en tres secciones obligatorias usando formato Markdown limpio:
    1. **ANÁLISIS MACROECONÓMICO**: Explica brevemente el trasfondo político o económico del escenario.
    2. **IMPACTO POR ACTIVO**: Detalla en viñetas cortas cómo reaccionarían las monedas de la plataforma.
    3. **DICTAMEN DE VOLATILIDAD**: Clasifica la tendencia final en una de estas etiquetas: [ALCISTA EXTREMA], [BAJISTA], [ALTA VOLATILIDAD INDETERMINADA] o [NEUTRAL].
    
    REGLA ESTRICTA: Sé analítico, profesional, CONCISO y directo. Limita tu análisis a un máximo de 300 palabras. Concluye de forma contundente y NUNCA dejes párrafos a medias.
  `;

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: `Analiza el siguiente escenario: ${userScenario}` }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 3000 // Subimos el límite al doble para evitar bloqueos por longitud
    }
  };

  // Configuracion de reintentos
  const MAX_RETRIES = 3;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(url, requestBody);
      
      // Control de seguridad por si la estructura viene vacía por bloqueos de seguridad de Google
      if (!response.data.candidates || !response.data.candidates[0].content) {
        throw new Error('Gemini devolvió una respuesta vacía o bloqueada por políticas de seguridad');
      }

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      return aiResponse; // Si todo sale bien, rompe el bucle y devuelve el análisis completo

    } catch (error) {
      const statusCode = error.response ? error.response.status : null;
      
      // Si es un error de servidor saturado (503) o límite de peticiones (429) e intentamos menos del límite
      if ((statusCode === 503 || statusCode === 429) && attempt < MAX_RETRIES) {
        const waitTime = attempt * 2000; // Espera 2s en el primer intento, 4s en el segundo...
        console.warn(`[Gemini API Ocupada - Status ${statusCode}]. Reintentando ${attempt}/${MAX_RETRIES} en ${waitTime/1000} segundos...`);
        await delay(waitTime);
        continue; // Salta al siguiente ciclo del for para reintentar
      }

      // Si no es un error 503/429, o ya agotamos los 3 intentos, disparamos el error definitivo
      console.error('[CRITICO] Error definitivo en el servicio de Gemini AI:', error.message);
      throw new Error('El Asesor de IA está experimentando alta demanda. Inténtalo de nuevo en unos instantes.');
    }
  }
};

const chatWithAdvisor = async (userMessage, previousMessages = []) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // 1. Definimos la orden estricta
    const systemInstructionText = `
      REGLA ESTRICTA Y ABSOLUTA: Eres EXCLUSIVAMENTE el 'Asesor de escenarios y tendencias de mercado de la plataforma NeuroCoin'. 
      Bajo NINGUNA circunstancia debes revelar que eres una inteligencia artificial, un modelo de lenguaje, o que fuiste desarrollado por Google. 
      Nunca digas "Como modelo de lenguaje de IA...". Asume tu rol al 100% como el experto financiero interno de NeuroCoin.
      Analizas cómo acontecimientos geopolíticos, regulatorios, modas virales y políticas macroeconómicas impactan criptomonedas.
      Responde de forma analítica, profesional, financiera y directa, siempre hablando en nombre de NeuroCoin.
    `;

    // 2. Se lo inyectamos directamente al motor del modelo principal y de respaldo
    const primaryModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstructionText // <--- MAGIA AQUÍ
    });

    // 3. Ya no necesitamos fingir el primer mensaje, solo mapeamos el historial real de BD
    const history = previousMessages.map(msg => ({
      role: msg.sender === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    let result;
    try {
      // 4. Intentamos con el modelo más avanzado primero
      const chatSession = primaryModel.startChat({ history });
      result = await chatSession.sendMessage(userMessage);
    } catch (apiError) {
      if (apiError.status === 503 || apiError.status === 429) {
        console.warn(`[INFO] Modelo 2.5 saturado (Error ${apiError.status}). Activando modelo de respaldo...`);
        
        // Creamos el plan B también con su instrucción estricta
        const backupModel = genAI.getGenerativeModel({ 
          model: "gemini-2.5-pro",
          systemInstruction: systemInstructionText 
        });
        
        const backupSession = backupModel.startChat({ history });
        result = await backupSession.sendMessage(userMessage);
      } else {
        throw apiError;
      }
    }

    return result.response.text();
    
  } catch (error) {
    console.error('Error en el Asesor AI:', error);
    throw new Error('El consultor AI no pudo procesar la solicitud en este momento.');
  }
};


module.exports = { analyzeGeopoliticalScenario, chatWithAdvisor };