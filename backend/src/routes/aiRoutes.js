const express = require('express');
const router = express.Router();
const { getScenarioAnalysis } = require('../controllers/geminiController');

router.post('/analyze', getScenarioAnalysis);

module.exports = router;