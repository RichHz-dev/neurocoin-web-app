const axios = require('axios');
const Crypto = require('../models/Crypto');
const SupportedCrypto = require('../models/SupportedCrypto');

const fetchAndUpdateMarketData = async () => {
  try {
    // 1. Obtener la lista de monedas soportadas desde la DB
    const supportedList = await SupportedCrypto.find({});
    if (supportedList.length === 0) {
      console.log('[ALERT] No hay monedas configuradas en supported_cryptos.');
      return;
    }

    // Crear una lista de símbolos para filtrar mejor
    const targetSymbols = supportedList.map(item => item.binanceSymbol);

    // Usamos el endpoint global de tickers de 24 horas
    console.log('[INFO] Consultando precios en tiempo real a Binance...');
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const allTickers = response.data;

    if (!Array.isArray(allTickers)) {
      throw new Error('La respuesta de Binance no es un array válido.');
    }

    // Filtrar los tickers que coincidan con nuestra DB
    const filteredTickers = allTickers.filter(ticker => targetSymbols.includes(ticker.symbol));

    for (const ticker of filteredTickers) {
      // Buscar la configuración específica de esta moneda dentro de nuestra lista
      const config = supportedList.find(item => item.binanceSymbol === ticker.symbol);
      if (!config) continue;

      const currentPrice = parseFloat(ticker.lastPrice) || 0;
      const calculatedMarketCap = currentPrice * (config.circulatingSupply || 0);
      const percent = Math.abs(parseFloat(ticker.priceChangePercent) || 0);
      let elasticity = percent > 7 ? 'ALTA' : percent > 3 ? 'MEDIA' : 'BAJA';

      // Guardar/Actualizar el estado del mercado
      await Crypto.findOneAndUpdate(
        { coinId: config.coinId },
        {
          $set: {
            name: config.name,
            symbol: config.symbol,
            price: currentPrice,
            change24h: parseFloat(ticker.priceChangePercent) || 0,
            marketCap: calculatedMarketCap,
            volume24h: parseFloat(ticker.volume) || 0,
            high24h: parseFloat(ticker.highPrice) || 0,
            low24h: parseFloat(ticker.lowPrice) || 0,
            volatilityElasticity: elasticity
          },
          $push: { sparkline: { $each: [currentPrice], $slice: -5 } }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('[SUCCESS] Base de datos de NeuroCoin actualizada correctamente.');
  } catch (error) {
    console.error('[ERROR] En la actualización dinámica:', error.response?.data || error.message);
  }
};

module.exports = { fetchAndUpdateMarketData };