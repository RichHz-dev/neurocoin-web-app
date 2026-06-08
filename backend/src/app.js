require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cryptoRoutes = require('./routes/cryptoRoutes');
const alertRoutes = require('./routes/alertRoutes');

const { runMarketEngine } = require('./services/marketService');


const app = express();

// Middlewares obligatorios para comunicarse con el Frontend
app.use(cors());
app.use(express.json());

// Conexión a MongoDB (Asegúrate de tener tu URI en el .env)
connectDB();

// Registro de Rutas
app.use('/api/cryptos', cryptoRoutes);
app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Servidor de NeuroCoin corriendo en el puerto ${PORT}`);

//   // Ejecución inmediata al encender el backend para no tener la DB vacía
//   await fetchAndUpdateMarketData();

// Ejecucion inicial
await runMarketEngine();

  // Tarea automatizada: Consulta a Binance cada 10 segundos para actualizar precios y sparklines
  setInterval(async () => {
    await runMarketEngine();
  }, 10000);
});