# Sylly — AI Syllabus → Schedule

Turn any course syllabus PDF into a living plan in minutes: calendar events, AI‑suggested study sessions, and a syllabus‑aware chat. This repo contains both the API and the web app.

## Highlights

- Instant PDF ingest in the browser (privacy‑friendly) and course creation
- AI extraction of lectures, exams, and deadlines to Google Calendar events
- One‑click Google Calendar sync (and safe error reporting)
- AI study session planner that avoids conflicts with your real calendar
- Syllabus‑aware chat (“When’s the midterm? What’s the weight?”)
- Public browse of shared syllabi by school and professor

## Monorepo Layout

```
.
├─ sylly-api/      # Node.js + Express API (Auth0, Prisma, Google, Gemini)
└─ sylly-web/      # React + Vite frontend (Auth0, pdf.js, react-dropzone)
```

## Architecture

```
[Browser]
  ├─ React + Vite app (Auth0 SPA)
  ├─ PDF text extraction (pdfjs-dist) & file drop (react-dropzone)
  └─ API client attaches Bearer token when present
            │
            ▼
[API: Node.js + Express]
  ├─ Auth: Auth0 JWT middleware (express-oauth2-jwt-bearer)
  ├─ DB: Prisma ORM → PostgreSQL
  ├─ AI: Gemini 2.0 Flash (JSON/text) via fetch
  ├─ Calendar: Google OAuth2 + Calendar Events API
  ├─ Validation: Zod schemas for Calendar event shape
  └─ Security: helmet, CORS, morgan
```

## Tech Stack

- Backend: Node.js 18+, Express, Prisma, PostgreSQL, Auth0 (JWT), Zod, Helmet, CORS, Morgan
- AI: Google Gemini 2.0 Flash (JSON mode for events, text for chat)
- Integrations: Google OAuth 2.0 (offline refresh) + Calendar v3
- Frontend: React 18, Vite, Auth0 React SDK, pdfjs-dist, react-dropzone, react-icons, Bootstrap

## Features (Deeper Dive)

- PDF → Text in the browser: No server roundtrip for extraction (pdfjs‑dist)
- Syllabus parsing: `calendarEventService` prompts Gemini to return strict JSON; Zod enforces Google Calendar event shapes (dates, attendees, reminders)
- Google Calendar sync: OAuth flow, access/refresh tokens, push events with granular success/failure reporting
- Study planner: Deterministic interval engine finds non‑overlapping slots (8am–8pm, 30‑minute increments), merges busy from syllabus events, your Google events, and saved tasks
- Syllabus chat: Small context slice + clear instructions to keep answers focused and in plain text
- Public browse: Query public syllabi by school and professor; ships with an included schools list (`sylly-api/schools.txt`)

## Prerequisites

- Node.js ≥ 18.17
- PostgreSQL database (local or hosted)
- Auth0 tenant (SPA app + API)
- Google Cloud project with OAuth2 client (Web app) and Calendar API enabled
- Gemini API key

## Environment Variables

Configure both apps from their `.env.example` files.

sylly-api/.env

```
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
GEMINI_API_KEY=""
AUTH0_ISSUER_BASE_URL="https://YOUR_AUTH0_DOMAIN/"
AUTH0_AUDIENCE="https://YOUR_API_IDENTIFIER"
GOOGLE_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_OAUTH_CLIENT_SECRET"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3000/api/google/oauth/callback"
GOOGLE_OAUTH_SUCCESS_REDIRECT="http://localhost:5173"
```

sylly-web/.env

```
VITE_API_BASE_URL="http://localhost:3000"
VITE_AUTH0_DOMAIN="YOUR_AUTH0_DOMAIN"
VITE_AUTH0_CLIENT_ID="YOUR_AUTH0_SPA_CLIENT_ID"
VITE_AUTH0_AUDIENCE="https://YOUR_API_IDENTIFIER"
```

Notes
- `AUTH0_ISSUER_BASE_URL` is your Auth0 domain (with trailing slash), e.g. `https://dev-xyz123.us.auth0.com/`
- `AUTH0_AUDIENCE` should match your Auth0 API Identifier (the API the SPA requests)
- `GOOGLE_OAUTH_REDIRECT_URI` must match your Google OAuth client’s authorized redirect
- Use `prompt=consent` + `access_type=offline` (already set) to receive refresh tokens on first connect

## Getting Started (Local)

1) API

```
cd sylly-api
cp .env.example .env
npm i
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

2) Web

```
cd sylly-web
cp .env.example .env
npm i
npm run dev
```

Default dev ports
- API: http://localhost:3000
- Web: http://localhost:5173

Point the web app at the API via `VITE_API_BASE_URL`.

## Core Flows

- Upload syllabus (Web → API)
  - Browser extracts PDF text with pdf.js, posts both `rawText` and a data URL of the PDF to `POST /api/syllabi`
- Parse to events (API)
  - `POST /api/syllabi/:id/parse` → calls Gemini JSON with a strict prompt and Zod validation; persists to `Syllabus.eventsJson`
- Google connect & sync
  - Start: `GET /api/google/oauth/url` → redirect to Google; callback saves refresh token and email
  - Push: `POST /api/google/calendar/push` → sends validated events; returns successes/failures
- Study suggestions
  - `POST /api/planner/study-suggestions` → merges busy intervals (syllabus + Google + tasks) and returns non‑overlapping slots/events
  - `POST /api/planner/study-sessions/push` → pushes suggested sessions, then upserts matching `Task` rows
- Chat
  - `POST /api/chat` → Gemini text completion over a narrow syllabus slice; responds in plain sentences

## API Surface (Summary)

Public
- `GET /api/health` → `{ ok: true }`
- `GET /api/public/schools` → list of available schools
- `GET /api/public/professors?school=Name` → distinct professors for a school
- `GET /api/public/syllabi?school=Name&professor=Query` → public syllabi

Authenticated (Auth0 JWT)
- `GET /api/users/me` → current user
- `GET /api/syllabi` → your syllabi
- `POST /api/syllabi` → create syllabus `{ title, school, professor, rawText, fileUrl }`
- `POST /api/syllabi/:id/parse` → extract events with Gemini
- `GET /api/syllabi/:id` → syllabus with items
- `GET /api/planner/events` → upcoming events (from saved syllabi)
- `POST /api/planner/plan` → load/generate events for a syllabus
- `POST /api/planner/study-suggestions` → suggest study sessions
- `POST /api/planner/study-sessions/push` → push suggested sessions + save tasks
- `POST /api/chat` → ask question `{ syllabusId, question }`
- `GET /api/google/status` → connection status/email
- `GET /api/google/oauth/url?continue=/path` → start OAuth
- `POST /api/google/calendar/push` → push syllabus events to Google

## Data Model (Prisma)

- `User` (Auth0‑backed identity)
- `Syllabus` (title, school, professor, rawText, fileUrl, eventsJson, visibility)
- `SyllabusItem` (typed items, optional linkage to tasks)
- `Task` (user tasks; study sessions persisted here)
- `Constraint` (user time constraints)
- `Integration` (Google refresh token + email)

See `sylly-api/prisma/schema.prisma` for details.

## Security & Privacy

- All private routes gated by Auth0 JWTs; user is ensured/upserted on first request
- CORS allowlist is env‑driven; dev defaults include `http://localhost:5173`
- PDF → text extraction runs entirely client‑side via pdf.js
- Google scopes are minimal (`calendar.events`, `userinfo.email`)

## Troubleshooting

- No Google refresh token after OAuth: ensure first‑time connect and that the consent screen grants offline access
- Gemini returns empty/invalid JSON: check `GEMINI_API_KEY`, network, and ensure the syllabus text isn’t empty; validation errors include the index and reason
- CORS blocked: set `FRONTEND_URL` or `CORS_ALLOWED_ORIGINS` (comma‑separated) on the API
- DB connection: verify `DATABASE_URL` and that Postgres is reachable; re‑run `prisma migrate dev`

## Scripts

- API: `npm run dev` (nodemon), `npm start`
- Web: `npm run dev`, `npm run build`, `npm run preview`

---

Made with React, Express, Prisma, and a lot of coffee.

