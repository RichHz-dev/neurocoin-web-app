const mongoose = require('mongoose');

const SupportedCryptoSchema = new mongoose.Schema({
  binanceSymbol: { type: String, required: true, unique: true }, // Ej: "DOTUSDT"
  coinId: { type: String, required: true, unique: true },        // Ej: "polkadot"
  name: { type: String, required: true },                       // Ej: "Polkadot"
  symbol: { type: String, required: true },                     // Ej: "DOT"
  circulatingSupply: { type: Number, required: true }           // Para el cálculo de tu MCAP
});

module.exports = mongoose.model('SupportedCrypto', SupportedCryptoSchema);