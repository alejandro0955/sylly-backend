const { Router } = require('express');
const { me } = require('../controllers/userController');
const { checkJwt, attachUser } = require('../middleware/auth');

const r = Router();
r.get('/me', checkJwt, attachUser, me);

module.exports = r;