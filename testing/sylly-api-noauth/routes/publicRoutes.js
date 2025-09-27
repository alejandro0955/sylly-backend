const { Router } = require('express');
const { listSchools, listProfessors, searchPublicSyllabi } = require('../controllers/publicController');

const router = Router();

router.get('/schools', listSchools);
router.get('/professors', listProfessors);
router.get('/syllabi', searchPublicSyllabi);

module.exports = router;