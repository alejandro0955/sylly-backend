const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const { callGeminiJSON } = require("./geminiService");

const promptPath = path.join(__dirname, "..", "prompt.txt");
let basePrompt = "Generate Google Calendar events as JSON.";
try {
	const filePrompt = fs.readFileSync(promptPath, "utf8");
	basePrompt =
		filePrompt
			.replace(/```/g, "")
			.replace(/\uFFFD/g, "'")
			.trim() || basePrompt;
} catch (err) {
	console.warn(
		"calendarEventService: prompt.txt not found, falling back to default prompt"
	);
}

const DateOrDateTime = z
	.object({
		dateTime: z.string().optional(),
		date: z.string().optional(),
		timeZone: z.string().optional(),
	})
	.refine((val) => Boolean(val.dateTime || val.date), {
		message: "Provide either dateTime or date",
	});

const ReminderOverrides = z.array(
	z.object({
		method: z.enum(["email", "popup"]),
		minutes: z.number().int().nonnegative(),
	})
);

const Reminders = z
	.object({
		useDefault: z.boolean().optional(),
		overrides: ReminderOverrides.optional(),
	})
	.partial();

const Attendee = z.object({ email: z.string().email() });

const CalendarEventInput = z.object({
	summary: z.string().min(1),
	location: z.string().optional(),
	description: z.string().optional(),
	start: DateOrDateTime,
	end: DateOrDateTime.optional(),
	recurrence: z.array(z.string()).optional(),
	attendees: z.array(Attendee).optional(),
	reminders: Reminders.optional(),
});

function normalizeEvents(raw) {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw;
	if (typeof raw === "object") {
		if (Array.isArray(raw.events)) return raw.events;
		return [raw];
	}
	return [];
}

function ensureEnd(event) {
	if (event.end) return event;
	if (event.start.date) {
		return { ...event, end: { date: event.start.date } };
	}
	if (event.start.dateTime) {
		return {
			...event,
			end: {
				dateTime: event.start.dateTime,
				timeZone: event.start.timeZone,
			},
		};
	}
	return event;
}

async function extractCalendarEventsFromText(text) {
	const syllabusText = text?.trim?.() ? text : "";
	const raw = await callGeminiJSON(basePrompt, syllabusText);
	console.log(
		`this is gemini text ${raw} and this is something else ${syllabusText}`
	);
	const events = normalizeEvents(raw).map((evt, idx) => {
		try {
			const parsed = CalendarEventInput.parse(evt);
			return ensureEnd(parsed);
		} catch (err) {
			throw new Error(`Invalid event at index ${idx}: ${err.message}`);
		}
	});
	return events.map((event) => JSON.parse(JSON.stringify(event)));
}

module.exports = { extractCalendarEventsFromText, CalendarEventInput };
