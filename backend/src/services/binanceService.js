const axios = require('axios');
const Crypto = require('../models/Crypto');
const SupportedCrypto = require('../models/SupportedCrypto');

const fetchAndUpdateMarketData = async () => {
  try {
    console.log('[INFO] Sincronizando datos dinámicos con Binance...');
    
    // Obtener la lista de monedas soportadas desde la DB
    const supportedList = await SupportedCrypto.find({});
    if (supportedList.length === 0) {
      console.log('[ALERT] No hay monedas configuradas en supported_cryptos.');
      return;
    }

    // Crear una lista de símbolos para filtrar rápido (ej: ['BTCUSDT', 'ETHUSDT'])
    const targetSymbols = supportedList.map(item => item.binanceSymbol);

    // Llamada a la api de Binance
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const allTickers = response.data;

    // Filtrar los tickers que coincidan con nuestra DB
    const filteredTickers = allTickers.filter(ticker => targetSymbols.includes(ticker.symbol));

    for (const ticker of filteredTickers) {
      // Buscar la configuración específica de esta moneda dentro de nuestra lista
      const config = supportedList.find(item => item.binanceSymbol === ticker.symbol);
      const currentPrice = parseFloat(ticker.lastPrice);
      
      const calculatedMarketCap = currentPrice * config.circulatingSupply;
      const percent = Math.abs(parseFloat(ticker.priceChangePercent));
      let elasticity = percent > 7 ? 'ALTA' : percent > 3 ? 'MEDIA' : 'BAJA';

      // Guardar/Actualizar el estado del mercado
      await Crypto.findOneAndUpdate(
        { coinId: config.coinId },
        {
          $set: {
            name: config.name,
            symbol: config.symbol,
            price: currentPrice,
            change24h: parseFloat(ticker.priceChangePercent),
            marketCap: calculatedMarketCap,
            volume24h: parseFloat(ticker.volume),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            volatilityElasticity: elasticity
          },
          $push: { sparkline: { $each: [currentPrice], $slice: -10 } }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('[INFO] Base de datos dinámica actualizada');
  } catch (error) {
    console.error('[ERROR] En la actualización dinámica:', error.message);
  }
};

module.exports = { fetchAndUpdateMarketData };