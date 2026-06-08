const axios = require('axios');
const Crypto = require('../models/Crypto');

// Mapeo con el suministro circulante aproximado de cada activo
const CRYPTO_MAPPING = {
  'BTCUSDT': { coinId: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', circulatingSupply: 19800000 },
  'ETHUSDT': { coinId: 'ethereum', name: 'Ethereum', symbol: 'ETH', circulatingSupply: 120000000 },
  'SOLUSDT': { coinId: 'solana', name: 'Solana', symbol: 'SOL', circulatingSupply: 460000000 },
  'ADAUSDT': { coinId: 'cardano', name: 'Cardano', symbol: 'ADA', circulatingSupply: 35600000000 },
  'XRPUSDT': { coinId: 'ripple', name: 'Ripple', symbol: 'XRP', circulatingSupply: 55000000000 }
};

const fetchAndUpdateMarketData = async () => {
  try {
    console.log('Sincronizando datos con la API de Binance...');
    
    // Llamada a Binance para obtener estadísticas de las últimas 24 horas
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const allTickers = response.data;

    // Filtrar solo las 5 monedas que le interesan a NeuroCoin
    const targetSymbols = Object.keys(CRYPTO_MAPPING);
    const filteredTickers = allTickers.filter(ticker => targetSymbols.includes(ticker.symbol));

    for (const ticker of filteredTickers) {
      const config = CRYPTO_MAPPING[ticker.symbol];
      const currentPrice = parseFloat(ticker.lastPrice);

      // 1. Cálculo dinámico del Market Cap (Precio x Suministro)
      const calculatedMarketCap = currentPrice * config.circulatingSupply;

      // 2. Determinar elasticidad (el paso anterior)
      const percent = Math.abs(parseFloat(ticker.priceChangePercent));
      let elasticity = 'BAJA';
      if (percent > 3 && percent <= 7) elasticity = 'MEDIA';
      if (percent > 7) elasticity = 'ALTA';

      // 3. Guardar en MongoDB
      await Crypto.findOneAndUpdate(
        { coinId: config.coinId },
        {
          $set: {
            name: config.name,
            symbol: config.symbol,
            price: currentPrice,
            change24h: parseFloat(ticker.priceChangePercent),
            marketCap: calculatedMarketCap, // ◄ AQUÍ GUARDAS EL DATO PROCESADO
            volume24h: parseFloat(ticker.volume),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            volatilityElasticity: elasticity
          },
          $push: {
            sparkline: { $each: [currentPrice], $slice: -20 }
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log('Base de datos actualizada con éxito desde Binance.');
  } catch (error) {
    console.error('Error al consumir la API de Binance:', error.message);
  }
};

module.exports = { fetchAndUpdateMarketData };