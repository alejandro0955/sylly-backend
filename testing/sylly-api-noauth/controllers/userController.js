const { ensureDemoUser } = require('../models/userModel');

async function me(req, res) {
  const user = await ensureDemoUser();
  res.json({ user, note: 'No-auth mode: always demo user' });
}
module.exports = { me };
