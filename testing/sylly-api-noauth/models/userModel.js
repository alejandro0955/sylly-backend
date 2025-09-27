const { prisma } = require('../config/db');

async function ensureUser({ auth0Id, email, name }) {
  if (!auth0Id) {
    throw new Error('auth0Id is required');
  }
  const data = {
    auth0Id,
  };
  if (email) data.email = email;
  if (name) data.name = name;

  return prisma.user.upsert({
    where: { auth0Id },
    create: {
      auth0Id,
      email: email || `${auth0Id}@placeholder.local`,
      name: name || null,
    },
    update: {
      email: email || undefined,
      name: name || undefined,
    },
  });
}

function findByAuth0Id(auth0Id) {
  if (!auth0Id) return null;
  return prisma.user.findUnique({ where: { auth0Id } });
}

module.exports = { ensureUser, findByAuth0Id };