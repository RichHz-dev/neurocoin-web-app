const Crypto = require('../models/Crypto');
const Scenario = require('../models/Scenario');
const HistorySimulation = require('../models/HistorySimulation');
const { analyzeGeopoliticalScenario } = require('../services/geminiService');
const axios = require('axios');

// Obtener escenarios (predefinidos) => ADMIN
const getScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find().sort({ isPredefined: -1, createdAt: -1 });
    return res.status(200).json(scenarios);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener escenarios', error: error.message });
  }
};

// Crear nuevos escenarios para mostrar => ADMIN
const createScenario = async (req, res) => {
  try {
    const { title, type, impact, description } = req.body;

    if (!title || !type || !impact || !description) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios para guardar el escenario.' });
    }

    const newScenario = new Scenario({
      title,
      type,
      impact,
      description,
      isPredefined: false // Al ser creado desde la UI, no es de fábrica
    });

    await newScenario.save();
    return res.status(201).json({ message: 'Escenario guardado con éxito', scenario: newScenario });
  } catch (error) {
    return res.status(500).json({ message: 'Error al guardar escenario', error: error.message });
  }
};

// Ejecutar simulación matemática + conclusion IA => FRONTEND
const runScenarioSimulation = async (req, res) => {
  try {
    const { userId, coinId, contextType, expectedImpact, description } = req.body;

    const cryptoData = await Crypto.findOne({ coinId });
    if (!cryptoData) return res.status(404).json({ message: 'Moneda no encontrada.' });

    let mlData;
    try {
      const pythonPayload = {
        context_type: contextType,
        expected_impact: expectedImpact,
        event_description: description
      };
      
      console.log(`\n🚀 [NODE] Enviando payload a Python (http://127.0.0.1:8000/predict/scenario/${cryptoData.symbol}):`);
      console.log(pythonPayload);
      
      const pythonResponse = await axios.post(`http://127.0.0.1:8000/predict/scenario/${cryptoData.symbol}`, pythonPayload);
      mlData = pythonResponse.data;
    } catch (pythonError) {
      console.error('[ML Service Error]:', pythonError.message);
      return res.status(503).json({ message: 'El motor de Machine Learning no está disponible en este momento.' });
    }

    // 2. LLAMADA A GEMINI (Oráculo Analítico Cualitativo)
    const fullPromptContext = `
      [CONTEXTO MÓDULO SIMULADOR]: El usuario está simulando un evento de tipo "${contextType}" sobre la moneda ${cryptoData.name}.
      [IMPACTO ESPERADO]: ${expectedImpact}.
      [MÉTRICAS ML]: Sentimiento NLP calculado: ${mlData.metrics.nlp_sentiment_score}. Volatilidad base: ${mlData.metrics.volatility_base}.
      [DESCRIPCIÓN DEL EVENTO]: "${description}"
      Genera la conclusión analítica compacta en un solo párrafo para NeuroCoin.
    `;
    
    const aiConclusion = await analyzeGeopoliticalScenario(fullPromptContext);

    // 3. GUARDAR HISTORIAL
    const savedSimulation = new HistorySimulation({
      coinId,
      symbol: cryptoData.symbol,
      contextType,
      expectedImpact,
      description,
      initialPrice: cryptoData.price,
      estimatedCurve: mlData.estimatedCurve,
      fluctuationChannel: mlData.fluctuationChannel,
      aiConclusion
    });

    await savedSimulation.save();

    // 4. DEVOLVER RESPUESTA AL FRONTEND
    return res.status(200).json({
      simulationId: savedSimulation._id,
      asset: { symbol: cryptoData.symbol, currentPrice: cryptoData.price },
      simulationInputs: { contextType, expectedImpact, description },
      estimatedCurve: mlData.estimatedCurve,
      fluctuationChannel: mlData.fluctuationChannel,
      aiConclusion
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error en la simulación', error: error.message });
  }
};
// Historial global de las simulaciones hechas
const getGlobalHistory = async (req, res) => {
  try {
    // Trae las últimas 10 simulaciones hechas en toda la plataforma
    const history = await HistorySimulation.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el historial' });
  }
};

module.exports = { getScenarios, createScenario, runScenarioSimulation, getGlobalHistory };