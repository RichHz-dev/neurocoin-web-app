const Crypto = require('../models/Crypto');
const Scenario = require('../models/Scenario');
const HistorySimulation = require('../models/HistorySimulation');
const { analyzeGeopoliticalScenario } = require('../services/geminiService');

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

    const currentPrice = cryptoData.price;
    const estimatedCurve = [];
    const fluctuationChannel = [];
    
    let impactMultiplier = 0;
    if (expectedImpact === 'ALCISTA' || expectedImpact === 'alcista') impactMultiplier = 0.025;
    if (expectedImpact === 'BAJISTA' || expectedImpact === 'bajista') impactMultiplier = -0.035;
    if (expectedImpact === 'VOLÁTIL' || expectedImpact === 'volatil') impactMultiplier = 0.005;

    let runningPrice = currentPrice;
    let baseConfidence = 85;

    for (let h = 1; h <= 6; h++) {
      const randomness = (Math.random() - 0.5) * 0.01;
      const hourlyChange = impactMultiplier + randomness;
      
      runningPrice = runningPrice * (1 + hourlyChange);
      const totalPercentageFromStart = ((runningPrice - currentPrice) / currentPrice) * 100;

      estimatedCurve.push({
        hour: `T+${h}h`,
        price: parseFloat(runningPrice.toFixed(2)),
        percentageChange: parseFloat(totalPercentageFromStart.toFixed(1))
      });

      fluctuationChannel.push({
        hour: `T+${h}h`,
        confidence: baseConfidence,
        range: parseFloat((Math.abs(hourlyChange * 15) + 4).toFixed(1))
      });

      baseConfidence -= 5;
    }

    const fullPromptContext = `
      [CONTEXTO MÓDULO SIMULADOR]: El usuario está simulando un evento de tipo "${contextType}" sobre la moneda ${cryptoData.name}.
      [IMPACTO ESPERADO]: ${expectedImpact}.
      [DESCRIPCIÓN DEL EVENTO]: "${description}"
      Genera la conclusión analítica compacta en un solo párrafo para NeuroCoin.
    `;
    
    const aiConclusion = await analyzeGeopoliticalScenario(fullPromptContext);

    const savedSimulation = new HistorySimulation({
      coinId,
      symbol: cryptoData.symbol,
      contextType,
      expectedImpact,
      description,
      initialPrice: currentPrice,
      estimatedCurve,
      fluctuationChannel,
      aiConclusion
    });

    await savedSimulation.save();

    return res.status(200).json({
      simulationId: savedSimulation._id,
      asset: { symbol: cryptoData.symbol, currentPrice },
      simulationInputs: { contextType, expectedImpact, description },
      estimatedCurve,
      fluctuationChannel,
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