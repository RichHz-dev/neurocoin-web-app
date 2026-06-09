const Crypto = require('../models/Crypto');

// Obtener las y la crypto moneda => FRONTEND
const getCryptos = async (req, res) => {
  try {
    const cryptos = await Crypto.find({});
    return res.status(200).json(cryptos);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las criptomonedas', error: error.message });
  }
};

const getCryptoById = async (req, res) => {
  try {
    const { coinId } = req.params; // ej: /api/cryptos/bitcoin
    const crypto = await Crypto.findOne({ coinId });
    if (!crypto) return res.status(404).json({ message: 'Moneda no encontrada' });
    return res.status(200).json(crypto);
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

module.exports = { getCryptos, getCryptoById }; 

