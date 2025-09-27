import React, { useMemo, useState } from "react";
import { api } from "../api/client";
import FileDropAndParse from "../components/filedrop";
import { useSchools } from "../hooks/useSchools";
import { useMySyllabi } from "../hooks/useMySyllabi";

export default function Syllabi() {
  const { schools, loading: loadingSchools, error: schoolsError } = useSchools();
  const sortedSchools = useMemo(() => [...schools].sort((a, b) => a.localeCompare(b)), [schools]);

  const {
    syllabi: mySyllabi,
    loading: loadingMySyllabi,
    error: mySyllabiError,
    refresh: refreshMySyllabi,
  } = useMySyllabi();

  const [title, setTitle] = useState("My Course");
  const [school, setSchool] = useState("");
  const [professor, setProfessor] = useState("");
  const [rawText, setRawText] = useState(
    "Week 1: Reading due 2025-10-01\nMidterm on 2025-10-20 (20%)"
  );
  const [id, setId] = useState("");
  const [syllabus, setSyllabus] = useState(null);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");

  const matchedSchool = useMemo(() => {
    if (!school) return null;
    return schools.find((s) => s.toLowerCase() === school.toLowerCase()) || null;
  }, [school, schools]);

  async function create(e) {
    e.preventDefault();
    if (!matchedSchool) {
      setStatus("Choose a school from the list.");
      return;
    }
    if (!professor.trim()) {
      setStatus("Enter the professor's name before saving.");
      return;
    }
    if (!rawText.trim()) {
      setStatus("Provide syllabus text first.");
      return;
    }

    setStatus("Saving syllabus...");
    try {
      const payload = { title, rawText, school: matchedSchool, professor };
      const s = await api.post("/api/syllabi", payload);
      setId(s.id);
      setSyllabus(s);
      setSchool(matchedSchool);
      setEvents(Array.isArray(s.eventsJson) ? s.eventsJson : []);
      setStatus("Syllabus saved. Parse it to generate calendar events.");
      refreshMySyllabi();
    } catch (err) {
      setStatus(`Failed to save syllabus: ${err.message}`);
    }
  }

  async function parse() {
    if (!id) return;
    setStatus("Asking Gemini to generate calendar events...");
    try {
      const result = await api.post(`/api/syllabi/${id}/parse`, {});
      const nextEvents = result.events || [];
      setEvents(nextEvents);
      setSyllabus((prev) =>
        prev ? { ...prev, eventsJson: nextEvents } : { id, eventsJson: nextEvents }
      );
      setStatus(`Generated ${result.count || 0} events.`);
    } catch (err) {
      setStatus(`Failed to generate events: ${err.message}`);
    }
  }

  async function fetchS(targetId = id) {
    if (!targetId) return;
    setStatus("Fetching syllabus...");
    try {
      const s = await api.get(`/api/syllabi/${targetId}`);
      setId(s.id);
      setSyllabus(s);
      setTitle(s.title || "");
      setSchool(s.school || "");
      setProfessor(s.professor || "");
      setRawText(s.rawText || "");
      setEvents(Array.isArray(s.eventsJson) ? s.eventsJson : []);
      setStatus(s.eventsJson?.length ? `Loaded ${s.eventsJson.length} events.` : "No events saved yet.");
    } catch (err) {
      setStatus(`Failed to fetch syllabus: ${err.message}`);
    }
  }

  const eventCount = events.length;

  return (
    <div>
      <h2>Syllabi</h2>
      <div className="card">
        <form onSubmit={create} className="grid" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 12 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={!rawText.trim() || !school.trim() || !professor.trim()}>
              Save syllabus
            </button>
          </div>
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="muted" htmlFor="school-input">School</label>
              <input
                id="school-input"
                list="school-options"
                placeholder={loadingSchools ? "Loading schools..." : "Start typing your school"}
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={loadingSchools}
                required
              />
              <datalist id="school-options">
                {sortedSchools.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {schoolsError && <div className="text-sm text-red-600">{schoolsError}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label className="muted" htmlFor="prof-input">Professor</label>
              <input
                id="prof-input"
                placeholder="Professor name"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                required
              />
            </div>
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

      <section className="card" style={{ marginTop: 16 }}>
        <h3>My uploaded syllabi</h3>
        {loadingMySyllabi && <div className="muted">Loading...</div>}
        {mySyllabiError && <div className="text-sm text-red-600">{mySyllabiError}</div>}
        {!loadingMySyllabi && !mySyllabiError && mySyllabi.length === 0 && (
          <div className="muted">You haven't uploaded any syllabi yet.</div>
        )}
        {!loadingMySyllabi && mySyllabi.length > 0 && (
          <table style={{ width: '100%', marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Course</th>
                <th style={{ textAlign: 'left' }}>Professor</th>
                <th style={{ textAlign: 'left' }}>School</th>
                <th style={{ textAlign: 'left' }}>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mySyllabi.map((item) => (
                <tr key={item.id}>
                  <td>{item.title || 'Untitled'}</td>
                  <td>{item.professor || '—'}</td>
                  <td>{item.school || '—'}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button type="button" onClick={() => fetchS(item.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {!!id && (
        <div className="card">
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <div>
              Created id: <code>{id}</code>
            </div>
            <div className="muted text-sm">
              {school && professor ? `${school} · ${professor}` : ''}
            </div>
            <button onClick={parse} disabled={!rawText.trim()}>
              Generate calendar events
            </button>
            <button onClick={() => fetchS(id)}>Refresh from API</button>
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
                  <td>{evt.start?.dateTime || evt.start?.date || ''}</td>
                  <td>{evt.end?.dateTime || evt.end?.date || ''}</td>
                  <td>{evt.location || ''}</td>
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