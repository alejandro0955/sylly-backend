const { Router } = require('express');
const { generatePlan } = require('../controllers/plannerController');
const { checkJwt, attachUser } = require('../middleware/auth');

const r = Router();
r.post('/plan', checkJwt, attachUser, generatePlan);
module.exports = r;