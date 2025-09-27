const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_CALENDAR_EVENTS_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

function getConfig() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_OAUTH_REDIRECT_URI,
    GOOGLE_OAUTH_SUCCESS_REDIRECT,
  } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_OAUTH_REDIRECT_URI) {
    throw new Error("Missing Google OAuth environment variables.");
  }
  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_OAUTH_REDIRECT_URI,
    successRedirect: GOOGLE_OAUTH_SUCCESS_REDIRECT || "http://localhost:5173",
  };
}

function encodeState(payload) {
  return Buffer.from(JSON.stringify(payload || {})).toString("base64url");
}

function decodeState(state) {
  if (!state) return {};
  try {
    const json = Buffer.from(state, "base64url").toString("utf8");
    return JSON.parse(json) || {};
  } catch (err) {
    return {};
  }
}

function buildAuthUrl({ continuePath } = {}) {
  const { clientId, redirectUri } = getConfig();
  const state = encodeState({ continuePath });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES.join(" "),
    state,
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const { clientId, clientSecret, redirectUri } = getConfig();
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to exchange code: ${errorText}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

async function refreshAccessToken(refreshToken) {
  const { clientId, clientSecret } = getConfig();
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to refresh token: ${errorText}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch user info: ${errorText}`);
  }
  return res.json();
}

function prune(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => prune(entry))
      .filter((entry) => entry !== undefined && entry !== null);
  }
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined || val === null) continue;
      const pruned = prune(val);
      if (pruned !== undefined && pruned !== null && !(typeof pruned === "object" && !Array.isArray(pruned) && Object.keys(pruned).length === 0)) {
        next[key] = pruned;
      }
    }
    return Object.keys(next).length ? next : undefined;
  }
  return value;
}

async function pushEventsToCalendar(accessToken, events = []) {
  const cleanEvents = events
    .map((event) => prune(event))
    .filter(Boolean);
  const successes = [];
  const failures = [];

  for (const event of cleanEvents) {
    try {
      const res = await fetch(GOOGLE_CALENDAR_EVENTS_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(event),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        failures.push({ summary: event.summary, error: payload.error || payload });
      } else {
        successes.push({ id: payload.id, summary: payload.summary, htmlLink: payload.htmlLink });
      }
    } catch (err) {
      failures.push({ summary: event.summary, error: err.message });
    }
  }

  return { successes, failures };
}

function buildSuccessRedirect(continuePath) {
  const { successRedirect } = getConfig();
  const url = new URL(successRedirect);
  if (continuePath) {
    try {
      const [path, query] = continuePath.split("?");
      if (path) url.pathname = path;
      if (query) {
        for (const [key, value] of new URLSearchParams(query)) {
          url.searchParams.set(key, value);
        }
      }
    } catch (err) {
      // ignore malformed path, fallback to base
    }
  }
  url.searchParams.set("google", "connected");
  return url.toString();
}

module.exports = {
  buildAuthUrl,
  decodeState,
  exchangeCodeForTokens,
  refreshAccessToken,
  fetchGoogleProfile,
  pushEventsToCalendar,
  buildSuccessRedirect,
};