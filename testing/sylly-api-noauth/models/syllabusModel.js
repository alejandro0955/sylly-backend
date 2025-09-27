const { prisma } = require('../config/db');

const SyllabusModel = {
  create: (ownerId, { title, fileUrl, rawText }) =>
    prisma.syllabus.create({ data: { ownerId, title, fileUrl, rawText } }),
  findById: (id) => prisma.syllabus.findUnique({ where: { id }, include: { items: true } }),
  addItems: (id, items) =>
    prisma.$transaction([
      prisma.syllabusItem.deleteMany({ where: { syllabusId: id } }),
      prisma.syllabusItem.createMany({ data: items.map((i)=>({ ...i, syllabusId:id })) }),
      prisma.syllabus.update({ where: { id }, data: { parsedAt: new Date() } }),
    ]),
};
module.exports = { SyllabusModel };
