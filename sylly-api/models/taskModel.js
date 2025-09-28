const { prisma } = require('../config/db')

const TaskModel = {
  listBetween: (userId, start, end) => {
    if (!userId || !start || !end) return Promise.resolve([])
    return prisma.task.findMany({
      where: {
        userId,
        start: { lt: end },
        end: { gt: start },
      },
      orderBy: { start: 'asc' },
    })
  },
  upsertStudyTask: async (userId, { title, start, end, calendarId }) => {
    if (!userId || !start || !end) return null
    const existing = await prisma.task.findFirst({
      where: {
        userId,
        start,
        end,
      },
    })
    if (existing) {
      return prisma.task.update({
        where: { id: existing.id },
        data: {
          title,
          calendarId: calendarId ?? existing.calendarId,
          flexible: false,
        },
      })
    }
    return prisma.task.create({
      data: {
        userId,
        title,
        start,
        end,
        flexible: false,
        calendarId: calendarId ?? null,
      },
    })
  },
}

module.exports = { TaskModel }

