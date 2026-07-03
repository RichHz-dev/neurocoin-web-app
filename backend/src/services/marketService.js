const Crypto = require('../models/Crypto');
const Alert = require('../models/Alert');
const { fetchAndUpdateMarketData } = require('./binanceService');

// 1. FUNCIÓN PRINCIPAL: Coordina la actualización de precios
const runMarketEngine = async () => {
  try {
    // Intenta obtener datos reales de Binance
    await fetchAndUpdateMarketData();
    
    // Una vez actualizados los datos reales, procesamos las alertas
    await checkAllAlerts();
  } catch (error) {
    console.log('[ALERT] Binance no disponible. Activando motor matemático secundario...');
    await runSimulatedFallback();
  }
};

// 2. MOTOR MATEMÁTICO SECUNDARIO: Corre solo si Binance falla
const runSimulatedFallback = async () => {
  try {
    const cryptos = await Crypto.find({});
    
    for (let crypto of cryptos) {
      // Simula una pequeña variación porcentual de entre -0.5% y +0.5%
      const variation = 1 + (Math.random() - 0.5) * 0.01;
      const newPrice = crypto.price * variation;

      await Crypto.findOneAndUpdate(
        { coinId: crypto.coinId },
        {
          $set: { price: newPrice },
          $push: { sparkline: { $each: [newPrice], $slice: -20 } }
        },
        { returnDocument: 'after' }
      );
    }
    console.log('[INFO] Precios actualizados mediante simulación matemática (Fallback).');
    await checkAllAlerts();
  } catch (err) {
    console.error('[CRITICO] Error en el motor de simulación:', err.message);
  }
};

// 3. MOTOR DE ALERTAS: Verifica si los precios cruzaron los límites de los usuarios
const checkAllAlerts = async () => {
  try {
    // Buscar alertas que estén activas y que no se hayan disparado aún
    const activeAlerts = await Alert.find({ isActive: true, isTriggered: false });
    if (activeAlerts.length === 0) return;

    for (let alert of activeAlerts) {
      const crypto = await Crypto.findOne({ coinId: alert.coinId });
      if (!crypto) continue;

      let shouldTrigger = false;
      if (alert.condition === 'above' && crypto.price >= alert.value) shouldTrigger = true;
      if (alert.condition === 'below' && crypto.price <= alert.value) shouldTrigger = true;

      if (shouldTrigger) {
        alert.isTriggered = true;
        alert.isActive = false; // Se apaga para que no se dispare en bucle
        alert.triggeredAt = new Date();
        
        console.log(`[ALERT DISPARADA] ${alert.coinName} cruzó el umbral de ${alert.value}. Precio actual: ${crypto.price}`);
        
        await alert.save();
      }
    }
  } catch (error) {
    console.error('[ERROR] Al procesar las alertas:', error.message);
  }
};

module.exports = { runMarketEngine };