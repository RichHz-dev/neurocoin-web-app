const express = require('express');
const router = express.Router();
const { getScenarios, createScenario, runScenarioSimulation } = require('../controllers/scenarioController');

router.get('/', getScenarios);               
router.post('/', createScenario);             
router.post('/simulate', runScenarioSimulation); 

module.exports = router;