const express = require('express');
const router = express.Router();
const { getCryptos, getCryptoById } = require('../controllers/cryptoController');

router.get('/', getCryptos);
router.get('/:coinId', getCryptoById);

module.exports = router;