const { prisma } = require('../config/db');
const { callGeminiJSON } = require('../services/geminiService');

async function ask(req, res) {
  const { syllabusId, question } = req.body;
  const s = await prisma.syllabus.findUnique({ where: { id: syllabusId }, include: { items: true } });
  const miniContext = (s?.rawText || '').split(/\n\n+/).slice(0, 10).join('\n\n');
  const prompt = `Answer based only on this syllabus content. If unsure, say you don't know. Include an item title or snippet when citing.`;
  const json = await callGeminiJSON(prompt, `${miniContext}\n\nQ: ${question}`);
  res.json({ answer: json });
}

module.exports = { ask };
