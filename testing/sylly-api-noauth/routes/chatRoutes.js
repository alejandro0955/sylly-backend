const { Router } = require('express');
const { ask } = require('../controllers/chatController');
const r = Router();
r.post('/', ask);
module.exports = r;
