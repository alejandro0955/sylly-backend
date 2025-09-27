const { prisma } = require('../config/db');
const { SyllabusModel } = require('../models/syllabusModel');
const { ensureDemoUser } = require('../models/userModel');
const { parseSyllabusToItems } = require('../services/parsingService');

async function createSyllabus(req, res) {
  const owner = await ensureDemoUser();
  const { title, fileUrl, rawText } = req.body;
  const s = await SyllabusModel.create(owner.id, { title, fileUrl, rawText });
  res.json(s);
}

async function parseSyllabus(req, res) {
  const { id } = req.params;
  const s = await SyllabusModel.findById(id);
  const text = s?.rawText || '';
  const items = await parseSyllabusToItems(text);
  await SyllabusModel.addItems(id, items);
  res.json({ ok: true, count: items.length });
}

async function getSyllabus(req, res) {
  const { id } = req.params;
  const s = await SyllabusModel.findById(id);
  res.json(s);
}

module.exports = { createSyllabus, parseSyllabus, getSyllabus };
