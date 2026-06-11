import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Initial state for simulated price movements
const initialCryptos = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price: 94820.5,
    change24h: 3.42,
    sparkline: [91300, 91800, 92200, 91900, 92700, 93400, 94100, 94820.5],
    marketCap: 1860432500000,
    volume24h: 38450120000,
    high24h: 95100.0,
    low24h: 91150.0,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price: 3412.8,
    change24h: -1.15,
    sparkline: [3480, 3460, 3420, 3445, 3390, 3405, 3430, 3412.8],
    marketCap: 410294100000,
    volume24h: 19830500000,
    high24h: 3495.0,
    low24h: 3380.0,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price: 184.25,
    change24h: 8.76,
    sparkline: [168.4, 171.2, 170.5, 174.9, 176.1, 179.8, 181.5, 184.25],
    marketCap: 85230900000,
    volume24h: 4210900000,
    high24h: 186.5,
    low24h: 167.9,
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price: 0.624,
    change24h: 1.84,
    sparkline: [0.612, 0.615, 0.608, 0.619, 0.614, 0.627, 0.621, 0.624],
    marketCap: 22150900000,
    volume24h: 489100000,
    high24h: 0.632,
    low24h: 0.605,
  },
  {
    id: "ripple",
    name: "Ripple",
    symbol: "XRP",
    price: 1.12,
    change24h: -0.45,
    sparkline: [1.14, 1.13, 1.15, 1.12, 1.10, 1.11, 1.14, 1.12],
    marketCap: 63900400000,
    volume24h: 1250100000,
    high24h: 1.16,
    low24h: 1.09,
  },
];

// Memory state to support real-time price updates while the container runs
const cryptoState = [...initialCryptos];

// Background ticker task: slightly modify prices every 4 seconds to give "real-time" feeling
setInterval(() => {
  cryptoState.forEach((coin) => {
    // Generate a small percentage change [-0.4% to +0.4%]
    const changePct = (Math.random() - 0.48) * 0.008;
    coin.price = Number((coin.price * (1 + changePct)).toFixed(coin.price > 100 ? 2 : 4));
    coin.change24h = Number((coin.change24h + changePct * 100).toFixed(2));
    
    // Auto adjust high/low
    if (coin.price > coin.high24h) coin.high24h = coin.price;
    if (coin.price < coin.low24h) coin.low24h = coin.price;

    // Shift sparkline, append new price
    coin.sparkline.shift();
    coin.sparkline.push(coin.price);
  });
}, 4000);

// API: Get live crypto monitoring stats
app.get("/api/cryptos", async (req, res) => {
  try {
    // Attempt to fetch from public Binance API for real-time rates of major coins
    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT", "XRPUSDT"];
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr`;
    
    const response = await fetch(binanceUrl).catch(() => null);
    if (response && response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        symbols.forEach((sym) => {
          const ticker = data.find((t) => t.symbol === sym);
          if (ticker) {
            const coinId = sym.replace("USDT", "").toLowerCase();
            const matchingCoin = cryptoState.find((c) => c.id === coinId || (c.symbol.toLowerCase() === coinId));
            if (matchingCoin) {
              const prevPrice = matchingCoin.price;
              matchingCoin.price = Number(parseFloat(ticker.lastPrice).toFixed(matchingCoin.price > 100 ? 2 : 4));
              matchingCoin.change24h = Number(parseFloat(ticker.priceChangePercent).toFixed(2));
              matchingCoin.high24h = Number(parseFloat(ticker.highPrice).toFixed(matchingCoin.price > 100 ? 2 : 4));
              matchingCoin.low24h = Number(parseFloat(ticker.lowPrice).toFixed(matchingCoin.price > 100 ? 2 : 4));
              matchingCoin.volume24h = Number(parseFloat(ticker.volume).toFixed(0));
              
              // Only push to sparkline if the price changed significantly to avoid duplicate flat lines
              if (prevPrice !== matchingCoin.price) {
                matchingCoin.sparkline.shift();
                matchingCoin.sparkline.push(matchingCoin.price);
              }
            }
          }
        });
      }
    }
  } catch (error) {
    console.warn("Binance live fetch failed, relying on dynamic simulated prices: ", error);
  }
  
  res.json({ cryptos: cryptoState });
});

// API: Predict price trend based on selected coin, live rate and custom global scenarios
app.post("/api/predict", async (req, res) => {
  const { coinId, symbol, currentPrice, scenario } = req.body;
  if (!coinId || !symbol || !currentPrice) {
    return res.status(400).json({ error: "Faltan parámetros requeridos (coinId, symbol, currentPrice)" });
  }

  // Pre-calculate scenario-based multiplier scales
  let multiplier = 1.0;
  let volatilityScale = 0.02;
  let scenarioDesc = scenario ? scenario.description : "Análisis de mercado estándar";

  if (scenario) {
    const type = scenario.type; // 'geographic' | 'political' | 'social' | 'economic'
    const impact = scenario.impact; // 'bullish' | 'bearish' | 'volatile'
    
    if (impact === 'bullish') {
      multiplier = 1.08;
      volatilityScale = 0.015;
    } else if (impact === 'bearish') {
      multiplier = 0.92;
      volatilityScale = 0.025;
    } else {
      multiplier = 1.02;
      volatilityScale = 0.06; // highly volatile
    }
  }

  // Fallback prediction data in case we don't have Gemini AI
  const fallbackPredictions = Array.from({ length: 6 }).map((_, i) => {
    const step = i + 1;
    // Simulate a trend factoring in scenario parameters
    const direction = multiplier + (Math.random() - 0.5) * volatilityScale;
    const factor = Math.pow(direction, step / 6);
    const predictedPrice = Number((currentPrice * factor).toFixed(currentPrice > 100 ? 2 : 4));
    
    return {
      timeLabel: `T+${step}h`,
      priceValue: predictedPrice,
      upperBond: Number((predictedPrice * (1 + volatilityScale * 1.5)).toFixed(currentPrice > 100 ? 2 : 4)),
      lowerBond: Number((predictedPrice * (1 - volatilityScale * 1.5)).toFixed(currentPrice > 100 ? 2 : 4)),
      confidence: Math.max(40, Math.round(88 - step * 4 - (scenario ? 10 : 0))),
    };
  });

  const fallbackCommentary = `Simulación NeuroCoin bajo escenario [${scenarioDesc}]: Debido al impacto proyectado del evento, estimamos niveles de soporte críticos alterados con un rango de volatilidad del ${(volatilityScale * 100).toFixed(1)}% para ${symbol}.`;

  if (!ai) {
    return res.json({
      predictions: fallbackPredictions,
      commentary: fallbackCommentary + " (Entorno local sin clave API configurada)",
    });
  }

  try {
    const prompt = `Analiza la criptomoneda ${symbol} cuyo precio actual es $${currentPrice}. 
    Queremos simular el impacto en su precio si ocurriera el siguiente escenario de tipo global (${scenario ? scenario.type : 'general'}):
    "${scenarioDesc}"
    
    Como el motor predictivo de NeuroCoin, genera un pronóstico secuencial para los próximos 6 períodos de tiempo sucesivos (T+1h, T+2h, T+3h, T+4h, T+5h, T+6h) respondiendo a cómo este evento afectará al precio a corto plazo. 
    Debes proveer las estimaciones de precio (priceValue), junto con un canal superior de confianza (upperBond) que sea mayor que el precio, un canal inferior (lowerBond) menor, y una puntuación porcentual de confianza de 0 a 100 (confidence).
    También redacta un comentario analítico estructurado en Español (máximo 4 oraciones) que explique la reacción del mercado de ${symbol} vinculando explícitamente el factor geográfico, político, social o económico elegido.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres el analista cuantitativo senior y especialista geopolítico de NeuroCoin de Inteligencia Artificial que predice tendencias financieras basándose en acontecimientos internacionales y dinámicas complejas.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.ARRAY,
              description: "Lista de 6 puntos de predicción secuencial",
              items: {
                type: Type.OBJECT,
                properties: {
                  timeLabel: { type: Type.STRING },
                  priceValue: { type: Type.NUMBER },
                  upperBond: { type: Type.NUMBER },
                  lowerBond: { type: Type.NUMBER },
                  confidence: { type: Type.INTEGER },
                },
                required: ["timeLabel", "priceValue", "upperBond", "lowerBond", "confidence"],
              },
            },
            commentary: {
              type: Type.STRING,
              description: "Análisis integral del impacto geopolítico/social en español.",
            },
          },
          required: ["predictions", "commentary"],
        },
      },
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    }
    
    throw new Error("No se recibió respuesta estructurada.");
  } catch (error) {
    console.error("Gemini API prediction error, playing mathematics fallback: ", error);
    return res.json({
      predictions: fallbackPredictions,
      commentary: fallbackCommentary + ` (Modelo matemático local, API error: ${error.message})`,
    });
  }
});

// API: Cryptocurrency and geopolitical scenarios analysis advisor
app.post("/api/crypto/chat", async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Mensajes inválidos o ausentes" });
  }

  if (!ai) {
    // Fallback response generator if there is no Gemini API configured
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    let reply = "Para asistirte de la mejor manera, analizo el impacto geopolítico y de redes sociales en el ecosistema cripto. Actualmente estoy operando en modo matemático local (sin Gemini API). En líneas generales: ";
    
    if (lastUserMessage.toLowerCase().includes("politic") || lastUserMessage.toLowerCase().includes("regula") || lastUserMessage.toLowerCase().includes("gobierno")) {
      reply += "Las decisiones regulatorias (como los cambios en la SEC, leyes fiscales sobre activos virtuales o prohibiciones mineras locales) tienden a inducir fluctuaciones rápidas. Bitcoin suele consolidarse mientras que los tokens de menor capitalización experimentan salidas severas.";
    } else if (lastUserMessage.toLowerCase().includes("social") || lastUserMessage.toLowerCase().includes("elon") || lastUserMessage.toLowerCase().includes("tweet") || lastUserMessage.toLowerCase().includes("hype")) {
      reply += "El sentimiento social, amplificado por figuras públicas o tendencias virales en Reddit/TikTok, actúa como catalizador de volatilidad psicológica de corto plazo, especialmente en Solana o Ripple. Carecen de soporte fundamental sólido pero gozan de alta liquidez transaccional momentánea.";
    } else if (lastUserMessage.toLowerCase().includes("conflict") || lastUserMessage.toLowerCase().includes("guerra") || lastUserMessage.toLowerCase().includes("geograf") || lastUserMessage.toLowerCase().includes("petroleo")) {
      reply += "Ante tensiones geopolíticas transfronterizas u crisis de materias primas, Bitcoin suele comportarse ocasionalmente como 'oro digital' o activo de refugio alternativo de última instancia, aunque inicialmente puede correlacionarse con el índice S&P 500 por la aversión al riesgo.";
    } else {
      reply += "Analizo cómo eventos geográficos (como la concentración de hashrate o desastres climáticos), políticos (elecciones y regulaciones), sociales (campañas virales) y económicos influyen sobre las curvas de tus monedas virtuales favoritas. ¿Tienes un escenario en mente?";
    }

    return res.json({ reply });
  }

  try {
    const history = messages.slice(-6).map((m) => {
      return {
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      };
    });

    const systemInstruction = `Eres "NeuroCoin Market & Scenario Advisor", un consultor de finanzas cuantitativas y experto geopolítico en español.
    Tu único rol es guiar al usuario analizando el mercado criptográfico frente a los siguientes factores:
    1. Geográficos: Concentración de centros mineros (como en Texas o Asia), impacto energético local, desastres naturales limitando infraestructura.
    2. Políticos: Cambios legislativos, elecciones gubernamentales, presiones fiscales de bancos centrales o regulaciones fiscales (como de la SEC o de la UE/MiCA).
    3. Sociales: Sentimiento colectivo en Twitter/Reddit, tweets de influencers tecnológicos de alto alcance (como de Elon Musk), modas culturales y pánicos masivos de retiro.
    4. Económicos: Tasas de interés de la Fed de EE.UU., inflación global, devaluación de la moneda fiduciaria nacional.
    
    Responde en español con estilo profesional, educado y financieramente objetivo. Evita dar consejos financieros definitivos (siempre aclara que es un análisis computacional).
    Bajo NINGUNA circunstancia hables de DevOps, Docker, Jenkins, Kubernetes, GitHub Pipelines, microservicios larping, orquestadores ni comandos de Linux de redes ni de despliegues de software. Mantén el foco 100% en criptorregulaciones, macroeconomía y tendencias sociales.`;

    const contents = history.map(item => ({
      role: item.role,
      parts: item.parts
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "Disculpa, no logré procesar tu solicitud adecuadamente sobre finanzas.";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini chat error: ", error);
    res.status(500).json({ error: "Error procesando el chat financiero de IA" });
  }
});


// Serve files via Vite / Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NeuroCoin] Server started on http://localhost:${PORT}`);
  });
}

startServer();
