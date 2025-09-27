const { SyllabusModel } = require('../models/syllabusModel');
const { extractCalendarEventsFromText } = require('../services/calendarEventService');

async function listSyllabi(req, res) {
  const owner = req.user;
  const syllabi = await SyllabusModel.listByOwner(owner.id);
  res.json({ syllabi });
}

async function createSyllabus(req, res) {
  const owner = req.user;
  const { title, fileUrl, rawText, school, professor } = req.body;
  if (!school) {
    return res.status(400).json({ error: 'school is required' });
  }
  if (!professor) {
    return res.status(400).json({ error: 'professor is required' });
  }
  const s = await SyllabusModel.create(owner.id, {
    title,
    fileUrl,
    rawText,
    school,
    professor,
  });
  res.json(s);
}

async function parseSyllabus(req, res) {
  const { id } = req.params;
  const owner = req.user;
  const s = await SyllabusModel.findById(id, owner.id);
  if (!s) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }
  try {
    const text = s?.rawText || '';
    const events = await extractCalendarEventsFromText(text);
    await SyllabusModel.setEvents(id, owner.id, events);
    res.json({ ok: true, count: events.length, events });
  } catch (err) {
    console.error('parseSyllabus error', err);
    res.status(500).json({ error: 'Failed to generate events', detail: err.message });
  }
}

async function getSyllabus(req, res) {
  const { id } = req.params;
  const owner = req.user;
  const s = await SyllabusModel.findById(id, owner.id);
  if (!s) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }
  res.json(s);
}

module.exports = { listSyllabi, createSyllabus, parseSyllabus, getSyllabus };