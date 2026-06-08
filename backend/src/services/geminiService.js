const axios = require('axios');

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
    
    Sé analítico, profesional y directo. Concluye siempre todas tus ideas, no dejes párrafos a medias.
  `;

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: `Analiza el siguiente escenario: ${userScenario}` }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500 
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

module.exports = { analyzeGeopoliticalScenario };