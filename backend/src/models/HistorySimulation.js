const mongoose = require('mongoose');

const HistorySimulationSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  symbol: { type: String, required: true },
  contextType: { type: String, required: true, enum: ['geografico', 'politico', 'social', 'economico']},
  expectedImpact: { type: String, required: true, enum: ['alcista', 'bajista', 'volatil'] },
  description: { type: String, required: true },
  initialPrice: { type: Number, required: true },
  estimatedCurve: [
    {
      hour: { type: String },
      price: { type: Number },
      percentageChange: { type: Number }
    }
  ],
  fluctuationChannel: [
    {
      hour: { type: String },
      confidence: { type: Number },
      range: { type: Number }
    }
  ],
  aiConclusion: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('HistorySimulation', HistorySimulationSchema);