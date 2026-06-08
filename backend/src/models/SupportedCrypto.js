const mongoose = require('mongoose');

const SupportedCryptoSchema = new mongoose.Schema({
  binanceSymbol: { type: String, required: true, unique: true }, 
  coinId: { type: String, required: true, unique: true },       
  name: { type: String, required: true },                        
  symbol: { type: String, required: true },                       
  circulatingSupply: { type: Number, required: true }             // Para el cálculo de tu MCAP
});

module.exports = mongoose.model('SupportedCrypto', SupportedCryptoSchema);