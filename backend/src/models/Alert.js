const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', nullable: true },
  coinId: { type: String, required: true },
  coinName: { type: String, required: true },
  condition: { type: String, enum: ['above', 'below'], required: true },
  value: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);