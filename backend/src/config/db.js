const mongoose = require('mongoose');

const connectDB = async () => {
  // 1. Intentar conectar primero a MongoDB Atlas (Nube)
  try {
    console.log('\nIntentando conectar a MongoDB Atlas (Nube)...');
    await mongoose.connect(process.env.MONGO_URI_ATLAS);
    console.log('====== MongoDB ATLAS Conectado Exitosamente ======');
    return; // Si funciona, salimos de la función felizmente
  } catch (atlasError) {
    console.error('Error al conectar a MongoDB Atlas:', atlasError.message);
    console.log('Iniciando protocolo de contingencia...');
  }

  // 2. FALLBACK: Si la nube falló, intentamos conectar localmente
  try {
    console.log('\nConectando a MongoDB Local de respaldo...');
    await mongoose.connect(process.env.MONGO_URI_LOCAL);
    console.log('====== MongoDB LOCAL Conectado (Modo Desconectado/Fallback) ======');
  } catch (localError) {
    console.error('[CRÍTICO] Error fatal: Tampoco se pudo conectar a MongoDB Local:', localError.message);
    process.exit(1); // Cerramos el servidor porque sin ninguna DB la app no puede arrancar
  }
};

module.exports = connectDB;