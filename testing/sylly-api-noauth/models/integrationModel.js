const { prisma } = require('../config/db');

const IntegrationModel = {
  getByUserId: (userId) =>
    prisma.integration.findUnique({ where: { userId } }),
  upsertGoogle: (userId, { refreshToken, email }) =>
    prisma.integration.upsert({
      where: { userId },
      create: {
        userId,
        googleRefresh: refreshToken,
        googleEmail: email,
      },
      update: {
        googleRefresh: refreshToken ?? undefined,
        googleEmail: email ?? undefined,
      },
    }),
};

module.exports = { IntegrationModel };