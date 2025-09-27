const { prisma } = require('../config/db');

const SyllabusModel = {
  create: (ownerId, { title, fileUrl, rawText }) =>
    prisma.syllabus.create({ data: { ownerId, title, fileUrl, rawText } }),
  findById: (id) =>
    prisma.syllabus.findUnique({ where: { id }, include: { items: true } }),
  setEvents: (id, events) =>
    prisma.syllabus.update({ where: { id }, data: { eventsJson: events, parsedAt: new Date() } }),
};

module.exports = { SyllabusModel };