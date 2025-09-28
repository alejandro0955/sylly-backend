const { callGeminiText } = require('../services/geminiService');
const { SyllabusModel } = require('../models/syllabusModel');

function cleanAnswer(text) {
  if (!text) return '';
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*([*•-]|\d+\.)\s*/, '')
        .replace(/\*\*/g, '')
        .trimEnd()
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
  const instructions = 'Answer in natural language based only on this syllabus content. If unsure, say you do not know. Respond in plain sentences without bullet points, numbered lists, or markdown formatting.';
  const rawAnswer = await callGeminiText(
    instructions,
    miniContext + '\n\nQ: ' + question
  );
  const answer = cleanAnswer(rawAnswer);
  res.json({ answer: answer || 'I was unable to find that in the syllabus.' });
}

module.exports = { ask };
