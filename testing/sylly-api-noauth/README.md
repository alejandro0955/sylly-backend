# Sylly API (No Auth)

Minimal API without Auth0. Creates/uses a single demo user under the hood.

## Setup
1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install & migrate:
   ```bash
   npm i
   npx prisma migrate dev --name init
   npx prisma generate
   ```
3. Run:
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /api/health` → `{ ok: true }`
- `GET /api/users/me` → demo user object
- `POST /api/syllabi` `{ title, rawText?, fileUrl? }` → creates syllabus
- `POST /api/syllabi/:id/parse` → parses with Gemini (needs `GEMINI_API_KEY`)
- `GET /api/syllabi/:id` → syllabus + items
- `POST /api/planner/plan` `{ syllabusId, prefs? }` → returns tasks
- `POST /api/chat` `{ syllabusId, question }` → AI answer
