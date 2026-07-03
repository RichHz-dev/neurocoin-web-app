const Crypto = require('../models/Crypto');
const SupportedCrypto = require('../models/SupportedCrypto');
const axios = require('axios');
const { analyzeGeopoliticalScenario, analyzeTechnicalForecast } = require('../services/geminiService');


// Obtener las y la crypto moneda => FRONTEND
const getCryptos = async (req, res) => {
  try {
    const cryptos = await Crypto.find({});
    return res.status(200).json(cryptos);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las criptomonedas', error: error.message });
  }
};

const getCryptoById = async (req, res) => {
  try {
    const { coinId } = req.params; 
    const crypto = await Crypto.findOne({ coinId });
    if (!crypto) return res.status(404).json({ message: 'Moneda no encontrada' });
    return res.status(200).json(crypto);
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

const getCryptoHistory = async (req, res) => {
  try {
    const { coinId } = req.params;
    const { timeframe } = req.query; 

    const supported = await SupportedCrypto.findOne({ coinId });
    if (!supported) return res.status(404).json({ message: 'Moneda no configurada para historial' });

    let interval = '1m';
    let limit = 60;

    switch(timeframe) {
      case '1H': interval = '1m'; limit = 60; break;   
      case '1D': interval = '30m'; limit = 48; break;  
      case '1M': interval = '1d'; limit = 30; break;   
      case '1Y': interval = '1w'; limit = 52; break;  
      default: interval = '1m'; limit = 60;
    }

    const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
      params: { symbol: supported.binanceSymbol, interval, limit }
    });

    const historyData = response.data.map(candle => parseFloat(candle[4]));
    return res.status(200).json(historyData);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};

const runTechnicalForecast = async (req, res) => {
  try {
    const { coinId } = req.body;
    const cryptoData = await Crypto.findOne({ coinId });
    if (!cryptoData) return res.status(404).json({ message: 'Moneda no encontrada' });

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const pythonResponse = await axios.post(`${AI_SERVICE_URL}/predict/forecast/${cryptoData.symbol}`);
    const mlData = pythonResponse.data;

    let aiConclusion = '';
    try {
      // Llamamos a la nueva función pasándole los parámetros limpios directamente
      aiConclusion = await analyzeTechnicalForecast(
        cryptoData.name, 
        cryptoData.symbol, 
        mlData.trend, 
        cryptoData.price
      );
    } catch (aiError) {
      console.warn('[Gemini AI Fallback]:', aiError.message);
      aiConclusion = `La red neuronal detecta una tendencia ${mlData.trend}. (El analista de IA está experimentando alta demanda y no pudo generar el resumen detallado).`;
    }

    return res.status(200).json({
      predictions: mlData.predictions,
      aiConclusion: aiConclusion 
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error en forecast técnico', error: error.message });
  }
};

module.exports = { getCryptos, getCryptoById, getCryptoHistory, runTechnicalForecast };