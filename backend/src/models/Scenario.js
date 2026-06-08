const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['geografico', 'politico', 'social', 'economico'] },
  impact: { type: String, required: true, enum: ['alcista', 'bajista', 'volatil'] },       
  description: { type: String, required: true },
  isPredefined: { type: Boolean, default: false },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Scenario', ScenarioSchema);