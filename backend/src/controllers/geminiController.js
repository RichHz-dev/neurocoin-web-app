const { analyzeGeopoliticalScenario } = require('../services/geminiService');

const getScenarioAnalysis = async (req, res) => {
  try {
    const { scenario } = req.body;

    if (!scenario || scenario.trim() === '') {
      return res.status(400).json({ message: 'El campo scenario es obligatorio.' });
    }

    const analysis = await analyzeGeopoliticalScenario(scenario);
    return res.status(200).json({ scenario, analysis });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno en el asesor de IA', error: error.message });
  }
};

module.exports = { getScenarioAnalysis };