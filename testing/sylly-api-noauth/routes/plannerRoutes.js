const { Router } = require('express');
const { generatePlan } = require('../controllers/plannerController');
const r = Router();
r.post('/plan', generatePlan);
module.exports = r;
