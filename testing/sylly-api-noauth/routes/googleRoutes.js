const { Router } = require('express');
const {
  getGoogleStatus,
  getOAuthUrl,
  handleOAuthCallback,
  pushEvents,
} = require('../controllers/googleController');
const { checkJwt, attachUser } = require('../middleware/auth');

const router = Router();

router.get('/status', checkJwt, attachUser, getGoogleStatus);
router.get('/oauth/url', checkJwt, attachUser, getOAuthUrl);
router.post('/calendar/push', checkJwt, attachUser, pushEvents);
router.get('/oauth/callback', handleOAuthCallback);

module.exports = router;