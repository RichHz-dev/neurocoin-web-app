require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cryptoRoutes = require('./routes/cryptoRoutes');
const alertRoutes = require('./routes/alertRoutes');
const aiRoutes = require('./routes/aiRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes'); 
const { runMarketEngine } = require('./services/marketService');
// const seedSupportedCryptos = require('./config/seed');

const app = express();

// Middlewares obligatorios para comunicarse con el Frontend
app.use(cors());
app.use(express.json());

connectDB(); 

// Registro de Rutas
app.use('/api/cryptos', cryptoRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);                   // Probamos el agente de IA
app.use('/api/scenarios', scenarioRoutes); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n[INFO] Servidor de NeuroCoin corriendo en el puerto ${PORT}`);

  // try {
  //   // 3. Ejecución del Seed: Revisa e inyecta las monedas y escenarios base si la BD está vacía
  //   console.log('[INFO] Verificando datos iniciales de la base de datos...');
  //   await seedSupportedCryptos(); 
  // } catch (seedError) {
  //   console.error('[ERROR] Al procesar el seed inicial:', seedError.message);
  // }

  // Ejecución inicial del motor de mercado
  await runMarketEngine();

  // Tarea automatizada: Consulta a Binance cada 10 segundos para actualizar precios y sparklines
  setInterval(async () => {
    await runMarketEngine();
  }, 10000);
});