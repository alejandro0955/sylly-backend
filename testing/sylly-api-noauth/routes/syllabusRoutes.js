const { Router } = require('express');
const { createSyllabus, parseSyllabus, getSyllabus } = require('../controllers/syllabusController');
const r = Router();
r.post('/', createSyllabus);
r.post('/:id/parse', parseSyllabus);
r.get('/:id', getSyllabus);
module.exports = r;
