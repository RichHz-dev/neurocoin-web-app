const SupportedCrypto = require('../models/SupportedCrypto');
const Scenario = require('../models/Scenario'); // ◄ NUEVO

const seedSupportedCryptos = async () => {
  try {
    // --- SEED DE CRIPTOMONEDAS ---
    const cryptoCount = await SupportedCrypto.countDocuments();
    if (cryptoCount === 0) {
      console.log('[INFO] Poblando monedas iniciales...');
      const initialCryptos = [
        { binanceSymbol: 'BTCUSDT', coinId: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', circulatingSupply: 19800000 },
        { binanceSymbol: 'ETHUSDT', coinId: 'ethereum', name: 'Ethereum', symbol: 'ETH', circulatingSupply: 120000000 },
        { binanceSymbol: 'SOLUSDT', coinId: 'solana', name: 'Solana', symbol: 'SOL', circulatingSupply: 460000000 },
        { binanceSymbol: 'ADAUSDT', coinId: 'cardano', name: 'Cardano', symbol: 'ADA', circulatingSupply: 35600000000 },
        { binanceSymbol: 'XRPUSDT', coinId: 'ripple', name: 'Ripple', symbol: 'XRP', circulatingSupply: 55000000000 }
      ];
      await SupportedCrypto.insertMany(initialCryptos);
    }

    // --- ◄ NUEVO: SEED DE ESCENARIOS PREDEFINIDOS ---
    const scenarioCount = await Scenario.countDocuments({ isPredefined: true });
    if (scenarioCount === 0) {
      console.log('{INFO] Poblando escenarios predefinidos para la interfaz...');
      const defaultScenarios = [
        {
          title: "Crisis Energética e Hashrate",
          type: "geografico",
          impact: "bajista",
          description: "Inestabilidad geopolítica regional en Asia Central provoca un apagón masivo y reduce el Hashrate global activo del ecosistema de minería en un 15%.",
          isPredefined: true
        },
        {
          title: "Aprobación de ETFs en América Latina",
          type: "politico",
          impact: "alcista",
          description: "Tres países de Latinoamérica adoptan regulaciones favorables aprobando fondos cotizados (ETF) basados en spot para promover la inclusión financiera...",
          isPredefined: true
        },
        {
          title: "Hype Viral de Magnate de Redes",
          type: "social",
          impact: "alcista",
          description: "Un famoso magnate de la tecnología publica hilos asertivos de soporte sobre la eficiencia energética del activo en Twitter, desatando histeria minorista de...",
          isPredefined: true
        }
      ];
      await Scenario.insertMany(defaultScenarios);
      console.log('{INFO] Escenarios de fábrica inyectados con éxito.');
    }

  } catch (error) {
    console.error('[ERROR] Al ejecutar el seed:', error.message);
  }
};

module.exports = seedSupportedCryptos;