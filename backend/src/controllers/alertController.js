const Alert = require('../models/Alert');

const createAlert = async (req, res) => {
  try {
    const { coinId, coinName, condition, value } = req.body;
    
    const newAlert = new Alert({
      coinId,
      coinName,
      condition,
      value: parseFloat(value)
    });

    await newAlert.save();
    return res.status(201).json({ message: 'Alerta programada con éxito', alert: newAlert });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la alerta', error: error.message });
  }
};

// RUTAS SOLO PARA INFO DEL BACKEND
const getAlerts = async (req, res) => {
  try {
    // En el futuro, aquí filtrarías por el ID del usuario autenticado: { userId: req.user.id }
    const alerts = await Alert.find({}).sort({ createdAt: -1 }); // Muestra las más recientes primero
    return res.status(200).json(alerts);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las alertas', error: error.message });
  }
};

// 2. ELIMINAR / CANCELAR UNA ALERTA
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alertDeleted = await Alert.findByIdAndDelete(id);

    if (!alertDeleted) {
      return res.status(404).json({ message: 'La alerta no existe o ya fue eliminada' });
    }

    return res.status(200).json({ message: 'Alerta cancelada y eliminada con éxito' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar la alerta', error: error.message });
  }
};


module.exports = { createAlert, getAlerts, deleteAlert };