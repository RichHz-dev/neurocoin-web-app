const express = require('express');
const router = express.Router();
const { getScenarios, createScenario, runScenarioSimulation, getGlobalHistory} = require('../controllers/scenarioController');

router.get('/', getScenarios);               
router.post('/', createScenario);             
router.post('/simulate', runScenarioSimulation); 
router.get('/history', getGlobalHistory);

module.exports = router;