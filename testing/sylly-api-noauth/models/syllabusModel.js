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
    prisma.syllabus.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        school: true,
        professor: true,
        createdAt: true,
      },
    }),
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
        fileUrl: true,
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
  listEventsForOwner: (ownerId) =>
    prisma.syllabus.findMany({
      where: { ownerId },
      select: {
        id: true,
        title: true,
        eventsJson: true,
      },
    }),
  listUpcomingEvents: async (ownerId, { limit = 10 } = {}) => {
    const syllabi = await prisma.syllabus.findMany({
      where: { ownerId },
      select: {
        id: true,
        title: true,
        eventsJson: true,
      },
    });

    const now = new Date();
    const events = [];

    for (const syllabus of syllabi) {
      const eventList = Array.isArray(syllabus.eventsJson) ? syllabus.eventsJson : [];
      for (const event of eventList) {
        const startValue = event?.start?.dateTime || event?.start?.date;
        if (!startValue) continue;

        let startDate = null;
        if (event.start?.dateTime) {
          startDate = new Date(event.start.dateTime);
        } else if (event.start?.date) {
          startDate = new Date(event.start.date + 'T00:00:00');
        }
        if (!startDate || Number.isNaN(startDate.getTime())) continue;
        if (startDate < now) continue;

        events.push({
          syllabusId: syllabus.id,
          syllabusTitle: syllabus.title,
          summary: event.summary || 'Untitled event',
          start: event.start,
          end: event.end,
          location: event.location || '',
          startDate,
        });
      }
    }

    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return events.slice(0, limit).map(({ startDate, ...rest }) => rest);
  },
};

module.exports = { SyllabusModel };
