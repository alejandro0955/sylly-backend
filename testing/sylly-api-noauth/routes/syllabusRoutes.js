const { Router } = require('express');
const { createSyllabus, parseSyllabus, getSyllabus } = require('../controllers/syllabusController');
const { checkJwt, attachUser } = require('../middleware/auth');

const r = Router();
r.use(checkJwt, attachUser);
r.post('/', createSyllabus);
r.post('/:id/parse', parseSyllabus);
r.get('/:id', getSyllabus);
module.exports = r;