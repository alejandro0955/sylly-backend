const { z } = require('zod');
const { callGeminiJSON } = require('./geminiService');

const Item = z.object({
  type: z.enum(['LECTURE','READING','HOMEWORK','PROJECT','EXAM','QUIZ','OTHER']),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  weight: z.number().optional(),
  sourceText: z.string().optional(),
});

async function parseSyllabusToItems(text) {
  const prompt = `Extract course items from the syllabus text. Return a JSON array of {type,title,description?,dueDate?(ISO),weight?,sourceText}.`;
  const raw = await callGeminiJSON(prompt, text || '');
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((x) => Item.parse(x));
}

module.exports = { parseSyllabusToItems };
