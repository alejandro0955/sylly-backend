const { Router } = require('express');
const { generatePlan, upcomingEvents, suggestStudySessions, pushStudySessions } = require('../controllers/plannerController');
const { checkJwt, attachUser } = require('../middleware/auth');

const r = Router();
r.get('/events', checkJwt, attachUser, upcomingEvents);
r.post('/plan', checkJwt, attachUser, generatePlan);
r.post('/study-suggestions', checkJwt, attachUser, suggestStudySessions);
r.post('/study-sessions/push', checkJwt, attachUser, pushStudySessions);
module.exports = r;

