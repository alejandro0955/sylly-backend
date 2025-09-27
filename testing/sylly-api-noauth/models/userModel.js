const { prisma } = require('../config/db');
const DEMO = { sub: 'demo', email: 'demo@example.com' };

async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { auth0Id: DEMO.sub },
    create: { auth0Id: DEMO.sub, email: DEMO.email, name: 'Demo User' },
    update: {},
  });
}
module.exports = { ensureDemoUser };
