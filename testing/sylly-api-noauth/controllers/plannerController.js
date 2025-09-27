const { SyllabusModel } = require('../models/syllabusModel');
const { extractCalendarEventsFromText } = require('../services/calendarEventService');

async function generatePlan(req, res) {
  const { syllabusId } = req.body;
  if (!syllabusId) {
    return res.status(400).json({ error: 'syllabusId is required' });
  }
  const owner = req.user;
  const syllabus = await SyllabusModel.findById(syllabusId, owner.id);
  if (!syllabus) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }

  try {
    let events = Array.isArray(syllabus.eventsJson) ? syllabus.eventsJson : [];
    if (events.length === 0) {
      events = await extractCalendarEventsFromText(syllabus.rawText || '');
      await SyllabusModel.setEvents(syllabus.id, owner.id, events);
    }

    res.json({ events });
  } catch (err) {
    console.error('generatePlan error', err);
    res.status(500).json({ error: 'Failed to load events', detail: err.message });
  }
}

module.exports = { generatePlan };