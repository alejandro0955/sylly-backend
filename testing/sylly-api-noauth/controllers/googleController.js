const { ensureUser } = require('../models/userModel');
const { IntegrationModel } = require('../models/integrationModel');
const { SyllabusModel } = require('../models/syllabusModel');
const {
  buildAuthUrl,
  decodeState,
  exchangeCodeForTokens,
  fetchGoogleProfile,
  refreshAccessToken,
  pushEventsToCalendar,
  buildSuccessRedirect,
} = require('../services/googleCalendarService');
const { extractCalendarEventsFromText } = require('../services/calendarEventService');

async function getGoogleStatus(req, res) {
  const user = req.user;
  const integration = await IntegrationModel.getByUserId(user.id);
  res.json({
    connected: Boolean(integration?.googleRefresh),
    email: integration?.googleEmail || null,
  });
}

async function getOAuthUrl(req, res) {
  try {
    const continuePath = req.query.continue || '/';
    const url = buildAuthUrl({ continuePath, auth0Id: req.user.auth0Id });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate OAuth URL', detail: err.message });
  }
}

async function handleOAuthCallback(req, res) {
  const { code, state } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }
  const payload = decodeState(state);
  if (!payload?.auth0Id) {
    return res.status(400).json({ error: 'Missing user information in state' });
  }
  try {
    const { accessToken, refreshToken } = await exchangeCodeForTokens(code);
    if (!refreshToken) {
      throw new Error('Google did not return a refresh token. Ensure access_type=offline and prompt=consent.');
    }
    const profile = await fetchGoogleProfile(accessToken);
    const user = await ensureUser({
      auth0Id: payload.auth0Id,
      email: profile?.email,
      name: profile?.name || profile?.email,
    });
    await IntegrationModel.upsertGoogle(user.id, {
      refreshToken,
      email: profile?.email || null,
    });
    const successUrl = buildSuccessRedirect(payload?.continuePath || '/');
    res.redirect(successUrl);
  } catch (err) {
    console.error('handleOAuthCallback error', err);
    res.status(500).send('Failed to connect Google Calendar. Check server logs.');
  }
}

async function pushEvents(req, res) {
  try {
    const user = req.user;
    const integration = await IntegrationModel.getByUserId(user.id);
    if (!integration?.googleRefresh) {
      return res.status(400).json({ error: 'Google Calendar is not connected yet.' });
    }

    const { syllabusId } = req.body;
    if (!syllabusId) {
      return res.status(400).json({ error: 'syllabusId is required' });
    }
    const syllabus = await SyllabusModel.findById(syllabusId, user.id);
    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    let events = Array.isArray(syllabus.eventsJson) ? syllabus.eventsJson : [];
    if (!events.length) {
      events = await extractCalendarEventsFromText(syllabus.rawText || '');
      await SyllabusModel.setEvents(syllabus.id, user.id, events);
    }
    if (!events.length) {
      return res.status(400).json({ error: 'No events available to push.' });
    }

    const { accessToken } = await refreshAccessToken(integration.googleRefresh);
    const result = await pushEventsToCalendar(accessToken, events);
    res.json({
      pushed: result.successes.length,
      failures: result.failures,
      successes: result.successes,
    });
  } catch (err) {
    console.error('pushEvents error', err);
    res.status(500).json({ error: 'Failed to push events to Google Calendar', detail: err.message });
  }
}

module.exports = {
  getGoogleStatus,
  getOAuthUrl,
  handleOAuthCallback,
  pushEvents,
};