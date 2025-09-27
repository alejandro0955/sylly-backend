const { Router } = require('express');
const { ask } = require('../controllers/chatController');
const { checkJwt, attachUser } = require('../middleware/auth');

const r = Router();
r.post('/', checkJwt, attachUser, ask);
module.exports = r;