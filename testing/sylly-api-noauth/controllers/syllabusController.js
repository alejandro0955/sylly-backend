const { SyllabusModel } = require('../models/syllabusModel');
const { ensureDemoUser } = require('../models/userModel');
const { extractCalendarEventsFromText } = require('../services/calendarEventService');

async function createSyllabus(req, res) {
  const owner = await ensureDemoUser();
  const { title, fileUrl, rawText } = req.body;
  const s = await SyllabusModel.create(owner.id, { title, fileUrl, rawText });
  res.json(s);
}

async function parseSyllabus(req, res) {
  const { id } = req.params;
  const s = await SyllabusModel.findById(id);
  if (!s) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }
  try {
    const text = s?.rawText || '';
    const events = await extractCalendarEventsFromText(text);
    await SyllabusModel.setEvents(id, events);
    res.json({ ok: true, count: events.length, events });
  } catch (err) {
    console.error('parseSyllabus error', err);
    res.status(500).json({ error: 'Failed to generate events', detail: err.message });
  }
}

async function getSyllabus(req, res) {
  const { id } = req.params;
  const s = await SyllabusModel.findById(id);
  if (!s) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }
  res.json(s);
}

module.exports = { createSyllabus, parseSyllabus, getSyllabus };