const mongoose = require('mongoose');

const CryptoSchema = new mongoose.Schema({
  coinId: { type: String, required: true, unique: true }, // ej: "bitcoin"
  name: { type: String, required: true },
  symbol: { type: String, required: true },               // ej: "BTC"
  price: { type: Number, required: true },
  change24h: { type: Number },
  sparkline: { type: [Number], default: [] },             // Almacena las últimas fluctuaciones
  marketCap: { type: Number, default: 0 },
  volume24h: { type: Number },
  high24h: { type: Number },
  low24h: { type: Number },
  volatilityElasticity: { type: String, default: 'MEDIA' }
}, { timestamps: true });

module.exports = mongoose.model('Crypto', CryptoSchema);