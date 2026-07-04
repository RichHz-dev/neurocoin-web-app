const mongoose = require('mongoose');

const connectDB = async () => {
  // Intentar conectar primero a MongoDB Atlas (Nube)
  try {
    console.log('\n[INFO] Intentando conectar a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI_ATLAS);
    console.log('====== MongoDB ATLAS Conectado Exitosamente ======');
    return; // Si funciona, salimos de la función
  } catch (atlasError) {
    console.error('[ERROR] Al conectar a MongoDB Atlas:', atlasError.message);
    console.log('\n[INFO] Iniciando protocolo de contingencia...');
  }

  // FALLBACK: Si la nube falló, intentamos conectar localmente
  try {
    console.log('\n[INFO] Conectando a MongoDB Local de respaldo...');
    await mongoose.connect(process.env.MONGO_URI_LOCAL);
    console.log('====== MongoDB LOCAL Conectado (Modo Fallback) ======');
  } catch (localError) {
    console.error('[CRÍTICO] Tampoco se pudo conectar a MongoDB Local:', localError.message);
    process.exit(1); // Cerramos el servidor porque sin ninguna DB la app no puede arrancar
  }
};

module.exports = connectDB;