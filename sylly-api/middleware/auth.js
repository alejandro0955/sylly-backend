const { auth } = require('express-oauth2-jwt-bearer');
const { ensureUser } = require('../models/userModel');

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});

async function attachUser(req, res, next) {
  try {
    const payload = req.auth?.payload;
    if (!payload?.sub) {
      return res.status(401).json({ error: 'Invalid access token' });
    }
    const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload['https://sylly.ai/email'] || null;
    const name = payload.name || payload.nickname || email || payload.sub;
    const user = await ensureUser({
      auth0Id: payload.sub,
      email,
      name,
    });
    req.user = user;
    next();
  } catch (err) {
    console.error('attachUser error', err);
    res.status(500).json({ error: 'Failed to resolve user' });
  }
}

module.exports = { checkJwt, attachUser };