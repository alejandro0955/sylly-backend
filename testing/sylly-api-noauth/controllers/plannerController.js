const { SyllabusModel } = require('../models/syllabusModel');
const { IntegrationModel } = require('../models/integrationModel');
const { TaskModel } = require('../models/taskModel');
const { extractCalendarEventsFromText } = require('../services/calendarEventService');
const {
  refreshAccessToken,
  listCalendarEvents,
  pushEventsToCalendar,
} = require('../services/googleCalendarService');
const {
  generateStudyPlan,
  sanitizeEvents,
  assembleBusyIntervals,
} = require('../services/studyPlannerService');

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

async function upcomingEvents(req, res) {
  try {
    const owner = req.user;
    const events = await SyllabusModel.listUpcomingEvents(owner.id);
    res.json({ events });
  } catch (err) {
    console.error('upcomingEvents error', err);
    res.status(500).json({ error: 'Failed to load upcoming events', detail: err.message });
  }
}

function parseWindowDates({ startDate, endDate }) {
  let windowStart = startDate ? new Date(startDate) : new Date(Date.now() + 30 * 60000);
  if (Number.isNaN(windowStart.getTime())) {
    throw new Error('Invalid startDate');
  }
  const minStart = new Date(Date.now() + 15 * 60000);
  if (windowStart < minStart) windowStart = minStart;

  let windowEnd = endDate ? new Date(endDate) : null;
  if (windowEnd && Number.isNaN(windowEnd.getTime())) {
    throw new Error('Invalid endDate');
  }
  return { windowStart, windowEnd };
}

function collectSyllabusEvents(rows = []) {
  return rows.flatMap((row) => (Array.isArray(row.eventsJson) ? row.eventsJson : []));
}

function extractEventDates(events = []) {
  const dates = [];
  for (const event of events) {
    const startValue = event?.start?.dateTime || event?.start?.date;
    if (!startValue) continue;
    const date = new Date(startValue);
    if (!Number.isNaN(date.getTime())) {
      dates.push(date);
    }
  }
  return dates;
}

async function suggestStudySessions(req, res) {
  try {
    const owner = req.user;
    const {
      syllabusId,
      sessionMinutes = 60,
      sessionCount = 3,
      startDate,
      endDate,
    } = req.body || {};

    if (!syllabusId) {
      return res.status(400).json({ error: 'syllabusId is required' });
    }

    const minutes = Number(sessionMinutes);
    if (!Number.isFinite(minutes) || minutes < 15 || minutes > 240) {
      return res.status(400).json({ error: 'sessionMinutes must be between 15 and 240.' });
    }
    const count = Number(sessionCount);
    if (!Number.isFinite(count) || count < 1 || count > 20) {
      return res.status(400).json({ error: 'sessionCount must be between 1 and 20.' });
    }

    const syllabus = await SyllabusModel.findById(syllabusId, owner.id);
    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    const { windowStart, windowEnd: providedEnd } = parseWindowDates({ startDate, endDate });

    const syllabusEventsRows = await SyllabusModel.listEventsForOwner(owner.id);
    const syllabusEvents = collectSyllabusEvents(syllabusEventsRows);

    let windowEnd = providedEnd;
    if (!windowEnd) {
      const upcomingDates = extractEventDates(
        (Array.isArray(syllabus.eventsJson) ? syllabus.eventsJson : []).filter(Boolean),
      ).filter((date) => date > windowStart);
      if (upcomingDates.length) {
        upcomingDates.sort((a, b) => a.getTime() - b.getTime());
        windowEnd = new Date(upcomingDates[0]);
      }
    }
    if (!windowEnd || !(windowEnd > windowStart)) {
      windowEnd = new Date(windowStart.getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    let googleEvents = [];
    const integration = await IntegrationModel.getByUserId(owner.id);
    if (integration?.googleRefresh) {
      try {
        const { accessToken } = await refreshAccessToken(integration.googleRefresh);
        googleEvents = await listCalendarEvents(accessToken, {
          timeMin: windowStart,
          timeMax: windowEnd,
        });
      } catch (err) {
        console.warn('Failed to load Google Calendar events for suggestions', err.message);
      }
    }

    const tasks = await TaskModel.listBetween(owner.id, windowStart, windowEnd);

    const plan = generateStudyPlan({
      syllabusTitle: syllabus.title,
      windowStart,
      windowEnd,
      durationMinutes: minutes,
      sessionCount: count,
      syllabusEvents,
      googleEvents,
      tasks,
    });

    const suggestions = sanitizeEvents(plan.events);

    res.json({
      suggestions,
      count: suggestions.length,
      requestedCount: count,
      durationMinutes: minutes,
      window: {
        start: windowStart.toISOString(),
        end: windowEnd.toISOString(),
      },
      considered: {
        syllabusEvents: syllabusEvents.length,
        googleEvents: googleEvents.length,
        tasks: tasks.length,
      },
    });
  } catch (err) {
    console.error('suggestStudySessions error', err);
    res.status(500).json({ error: 'Failed to build study suggestions', detail: err.message });
  }
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function pushStudySessions(req, res) {
  try {
    const owner = req.user;
    const { events = [] } = req.body || {};

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Provide at least one study session event.' });
    }

    const integration = await IntegrationModel.getByUserId(owner.id);
    if (!integration?.googleRefresh) {
      return res.status(400).json({ error: 'Connect Google Calendar before pushing study sessions.' });
    }

    const cleanEvents = sanitizeEvents(events);

    const startTimes = cleanEvents
      .map((evt) => toDate(evt.start?.dateTime || evt.start?.date))
      .filter(Boolean);
    const endTimes = cleanEvents
      .map((evt) => toDate(evt.end?.dateTime || evt.end?.date))
      .filter(Boolean);

    if (!startTimes.length || !endTimes.length) {
      return res.status(400).json({ error: 'Study sessions must include valid start and end times.' });
    }

    const windowStart = new Date(Math.min(...startTimes.map((date) => date.getTime())));
    const windowEnd = new Date(Math.max(...endTimes.map((date) => date.getTime())));

    const [syllabusEventsRows, tasks] = await Promise.all([
      SyllabusModel.listEventsForOwner(owner.id),
      TaskModel.listBetween(owner.id, windowStart, windowEnd),
    ]);
    const syllabusEvents = collectSyllabusEvents(syllabusEventsRows);

    let googleEvents = [];
    const { accessToken } = await refreshAccessToken(integration.googleRefresh);
    try {
      googleEvents = await listCalendarEvents(accessToken, {
        timeMin: windowStart,
        timeMax: windowEnd,
      });
    } catch (err) {
      console.warn('Failed to reload Google events before push', err.message);
    }

    const busyIntervals = assembleBusyIntervals({
      windowStart,
      windowEnd,
      syllabusEvents,
      googleEvents,
      tasks,
    });

    const conflict = cleanEvents.find((evt) => {
      const start = toDate(evt.start?.dateTime || evt.start?.date);
      const end = toDate(evt.end?.dateTime || evt.end?.date);
      if (!start || !end) return true;
      return busyIntervals.some((interval) => start < interval.end && end > interval.start);
    });

    if (conflict) {
      return res.status(409).json({
        error: 'A study session overlaps with an existing event. Generate new suggestions and try again.',
      });
    }

    const result = await pushEventsToCalendar(accessToken, cleanEvents);

    const successPairs = result.successes
      .map((success) => {
        const match = cleanEvents.find((evt) => {
          const evtStart = evt.start?.dateTime || evt.start?.date;
          const successStart = success.start?.dateTime || success.start?.date;
          if (successStart) {
            return evt.summary === success.summary && evtStart === successStart;
          }
          return evt.summary === success.summary;
        });
        return match ? { event: match, success } : null;
      })
      .filter(Boolean);

    await Promise.all(
      successPairs.map(({ event, success }) =>
        TaskModel.upsertStudyTask(owner.id, {
          title: event.summary,
          start: toDate(event.start?.dateTime || event.start?.date),
          end: toDate(event.end?.dateTime || event.end?.date),
          calendarId: success.id || null,
        }),
      ),
    );

    res.json({
      pushed: result.successes.length,
      failures: result.failures,
    });
  } catch (err) {
    console.error('pushStudySessions error', err);
    res.status(500).json({ error: 'Failed to push study sessions', detail: err.message });
  }
}

module.exports = { generatePlan, upcomingEvents, suggestStudySessions, pushStudySessions };
