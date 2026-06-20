const express = require('express');
const router = express.Router();
const { getCryptos, getCryptoById,getCryptoHistory,runTechnicalForecast } = require('../controllers/cryptoController');

router.get('/', getCryptos);
router.get('/:coinId', getCryptoById);
router.get('/:coinId/history', getCryptoHistory);
router.post('/forecast', runTechnicalForecast);

module.exports = router;