const { Router } = require('express');
const { me } = require('../controllers/userController');
const r = Router();
r.get('/me', me);
module.exports = r;
