const { Router } = require('express');
const {
  getGoogleStatus,
  getOAuthUrl,
  handleOAuthCallback,
  pushEvents,
} = require('../controllers/googleController');

const router = Router();

router.get('/status', getGoogleStatus);
router.get('/oauth/url', getOAuthUrl);
router.get('/oauth/callback', handleOAuthCallback);
router.post('/calendar/push', pushEvents);

module.exports = router;