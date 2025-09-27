const { prisma } = require('../config/db');

const SyllabusModel = {
  create: (ownerId, { title, fileUrl, rawText, school, professor, visibility = 'PUBLIC' }) =>
    prisma.syllabus.create({
      data: {
        ownerId,
        title,
        fileUrl,
        rawText,
        school: school?.trim() || null,
        professor: professor?.trim() || null,
        visibility,
      },
    }),
  findById: (id, ownerId) =>
    prisma.syllabus.findFirst({ where: { id, ownerId }, include: { items: true } }),
  listByOwner: (ownerId) =>
    prisma.syllabus.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } }),
  setEvents: (id, ownerId, events) =>
    prisma.syllabus.updateMany({
      where: { id, ownerId },
      data: { eventsJson: events, parsedAt: new Date() },
    }),
  searchPublic: ({ school, professor }) =>
    prisma.syllabus.findMany({
      where: {
        visibility: 'PUBLIC',
        school: school ? { equals: school, mode: 'insensitive' } : undefined,
        professor: professor ? { contains: professor, mode: 'insensitive' } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        school: true,
        professor: true,
        rawText: true,
        createdAt: true,
      },
    }),
  listProfessorsBySchool: (school) =>
    prisma.syllabus.findMany({
      where: {
        visibility: 'PUBLIC',
        school: { equals: school, mode: 'insensitive' },
        professor: { not: null },
      },
      distinct: ['professor'],
      select: { professor: true },
    }),
};

module.exports = { SyllabusModel };