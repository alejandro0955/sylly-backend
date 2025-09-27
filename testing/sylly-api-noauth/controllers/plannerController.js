const { prisma } = require('../config/db');
const { ensureDemoUser } = require('../models/userModel');
const { planTasks } = require('../services/plannerService');

async function generatePlan(req, res) {
  const user = await ensureDemoUser();
  const { syllabusId, prefs } = req.body;
  const s = await prisma.syllabus.findUnique({ where: { id: syllabusId }, include: { items: true } });
  const constraints = await prisma.constraint.findMany({ where: { userId: user.id } });
  const tasks = planTasks({ items: s?.items || [], constraints, prefs });
  res.json({ tasks });
}

module.exports = { generatePlan };
