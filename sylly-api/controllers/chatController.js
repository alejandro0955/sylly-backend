const { callGeminiJSON } = require('../services/geminiService');
const { SyllabusModel } = require('../models/syllabusModel');

async function ask(req, res) {
  const { syllabusId, question } = req.body;
  if (!syllabusId || !question) {
    return res.status(400).json({ error: 'syllabusId and question are required' });
  }
  const syllabus = await SyllabusModel.findById(syllabusId, req.user.id);
  if (!syllabus) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }
  const miniContext = (syllabus.rawText || '').split(/\n\n+/).slice(0, 10).join('\n\n');
  const prompt = `Answer based only on this syllabus content. If unsure, say you don't know. Include an item title or snippet when citing.`;
  const json = await callGeminiJSON(prompt, `${miniContext}\n\nQ: ${question}`);
  res.json({ answer: json });
}

module.exports = { ask };