const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.Mixed, default: 'invitado_neurocoin' },
  messages: [
    {
      sender: { type: String, enum: ['user', 'assistant'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);