import React, { useState } from "react";
import { api } from "../api/client";
import FileDropAndParse from "../components/filedrop";

export default function Syllabi() {
	const [title, setTitle] = useState("My Course");
	const [rawText, setRawText] = useState(
		"Week 1: Reading due 2025-10-01\nMidterm on 2025-10-20 (20%)"
	);
	const [id, setId] = useState("");
	const [syllabus, setSyllabus] = useState(null);
	const [events, setEvents] = useState([]);
	const [status, setStatus] = useState("");

	async function create(e) {
		e.preventDefault();
		setStatus("Creating syllabus...");
		const s = await api.post("/api/syllabi", { title, rawText });
		setId(s.id);
		setSyllabus(s);
		setEvents(Array.isArray(s.eventsJson) ? s.eventsJson : []);
		setStatus("Syllabus saved. Parse it to generate calendar events.");
	}

	async function parse() {
		if (!id) return;
		setStatus("Asking Gemini to generate calendar events...");
		const result = await api.post(`/api/syllabi/${id}/parse`, {});
		const nextEvents = result.events || [];
		setEvents(nextEvents);
		setSyllabus((prev) => (prev ? { ...prev, eventsJson: nextEvents } : { id, eventsJson: nextEvents }));
		setStatus(`Generated ${result.count || 0} events.`);
	}

	async function fetchS() {
		if (!id) return;
		setStatus("Fetching syllabus...");
		const s = await api.get(`/api/syllabi/${id}`);
		setSyllabus(s);
		setRawText(s.rawText || "");
		setEvents(Array.isArray(s.eventsJson) ? s.eventsJson : []);
		setStatus(s.eventsJson?.length ? `Loaded ${s.eventsJson.length} events.` : "No events saved yet.");
	}

	const eventCount = events.length;

	return (
		<div>
			<h2>Syllabi</h2>
			<div className="card">
				<form onSubmit={create}>
					<div className="row">
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Course title"
						/>
						<button type="submit" disabled={!rawText.trim()}>
							Create
						</button>
					</div>
				</form>
				<p style={{ marginTop: 12 }}>
					Upload a syllabus file to extract its contents, or edit the text below before saving.
				</p>
				<div style={{ marginTop: 12 }}>
					<FileDropAndParse
						initialText={rawText}
						onTextChange={setRawText}
						variant="compact"
						heading="Extract syllabus text"
						subheading="Drop a PDF, DOCX, or TXT to populate the syllabus body."
						footerNote=""
					/>
				</div>
				{status && (
					<div style={{ marginTop: 12 }} className="muted">
						{status}
					</div>
				)}
			</div>
			{!!id && (
				<div className="card">
					<div className="row" style={{ gap: 12 }}>
						<div>
							Created id: <code>{id}</code>
						</div>
						<button onClick={parse} disabled={!rawText.trim()}>
							Generate calendar events
						</button>
						<button onClick={fetchS}>Refresh from API</button>
					</div>
				</div>
			)}
			{eventCount > 0 && (
				<div className="card">
					<h3>Extracted Calendar Events</h3>
					<table>
						<thead>
							<tr>
								<th>Title</th>
								<th>Start</th>
								<th>End</th>
								<th>Location</th>
							</tr>
						</thead>
						<tbody>
							{events.map((evt, i) => (
								<tr key={i}>
									<td>{evt.summary}</td>
									<td>{evt.start?.dateTime || evt.start?.date || ""}</td>
									<td>{evt.end?.dateTime || evt.end?.date || ""}</td>
									<td>{evt.location || ""}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{syllabus && (
				<div className="card">
					<h3>Raw API response</h3>
					<pre>{JSON.stringify(syllabus, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}