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
  const [rawText, setRawText] = useState("");
  const [fileData, setFileData] = useState("");
  const [id, setId] = useState("");
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
    if (!fileData) {
      setStatus("Upload a PDF before saving.");
      return;
    }

    setStatus("Saving syllabus...");
    try {
      const payload = { title, rawText, school: matchedSchool, professor, fileUrl: fileData };
      const s = await api.post("/api/syllabi", payload);
      setId(s.id);
      setSchool(matchedSchool);
      setProfessor(s.professor || professor);
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
      setStatus(`Generated ${result.count || 0} events.`);
    } catch (err) {
      setStatus(`Failed to generate events: ${err.message}`);
    }
  }

  async function fetchS(targetId, { suppressStatus = false } = {}) {
    if (!targetId) return null;
    if (!suppressStatus) setStatus("Fetching syllabus...");
    try {
      const s = await api.get(`/api/syllabi/${targetId}`);
      setId(s.id);
      setTitle(s.title || "");
      setSchool(s.school || "");
      setProfessor(s.professor || "");
      setRawText(s.rawText || "");
      setFileData(s.fileUrl || "");
      setEvents(Array.isArray(s.eventsJson) ? s.eventsJson : []);
      if (!suppressStatus) {
        setStatus(s.eventsJson?.length ? `Loaded ${s.eventsJson.length} events.` : "No events saved yet.");
      }
      return s;
    } catch (err) {
      if (!suppressStatus) setStatus(`Failed to fetch syllabus: ${err.message}`);
      return null;
    }
  }

  const togglePreview = async (item) => {
    if (previewId === item.id) {
      setPreviewId(null);
      setPreviewUrl("");
      return;
    }
    const fetched = await fetchS(item.id, { suppressStatus: true });
    if (fetched?.fileUrl) {
      setPreviewId(item.id);
      setPreviewUrl(fetched.fileUrl);
      setStatus("PDF preview ready.");
    } else {
      setPreviewId(null);
      setPreviewUrl("");
      setStatus("No PDF available for this syllabus yet.");
    }
  };

  const eventCount = events.length;

  return (
    <div>
      <h2>Syllabi</h2>
      <div className="card">
        <h3>📚 Upload New Syllabus</h3>
        <form onSubmit={create} className="grid" style={{ gap: 16 }}>
          <div className="row" style={{ gap: 16 }}>
            <div style={{ flex: 2 }}>
              <label htmlFor="course-title">Course Title</label>
              <input
                id="course-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Computer Science"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <button type="submit" disabled={!rawText.trim() || !school.trim() || !professor.trim() || !fileData} style={{ height: '46px', marginTop: '22px' }}>
                💾 Save Syllabus
              </button>
            </div>
          </div>
          <div className="row" style={{ gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="school-input">🏫 School</label>
              <input
                id="school-input"
                list="school-options"
                placeholder={loadingSchools ? "Loading schools..." : "Start typing your school name"}
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
              {schoolsError && <div className="status-error">{schoolsError}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="prof-input">👨‍🏫 Professor</label>
              <input
                id="prof-input"
                placeholder="Professor's full name"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                required
              />
            </div>
          </div>
        </form>

        <div style={{ marginTop: 24, padding: '20px', background: 'var(--gray-50)', borderRadius: 'var(--border-radius)', border: '2px dashed var(--gray-300)' }}>
          <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📄 Upload Syllabus PDF
          </h4>
          <p className="muted" style={{ margin: '0 0 16px 0' }}>
            Drop your PDF here and we'll automatically extract the text content for processing.
          </p>
          <FileDropAndParse
            initialText={rawText}
            onTextChange={setRawText}
            onFileData={setFileData}
            variant="compact"
            heading=""
            subheading=""
            showTextArea={false}
          />
        </div>

        {status && (
          <div className={status.includes('Failed') || status.includes('Error') ? 'status-error' : status.includes('saved') || status.includes('Generated') ? 'status-success' : 'status-warning'} style={{ marginTop: 16 }}>
            {status}
          </div>
        )}
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h3>📋 My Uploaded Syllabi</h3>
        {loadingMySyllabi && (
          <div className="empty-state">
            <div className="loading-skeleton" style={{ height: '20px', width: '200px', margin: '0 auto' }}></div>
            <div className="muted" style={{ marginTop: 8 }}>Loading your syllabi...</div>
          </div>
        )}
        {mySyllabiError && <div className="status-error">{mySyllabiError}</div>}
        {!loadingMySyllabi && !mySyllabiError && mySyllabi.length === 0 && (
          <div className="empty-state">
            <h3>No syllabi uploaded yet</h3>
            <p>Upload your first syllabus above to get started with automatic event extraction and calendar planning.</p>
          </div>
        )}
        {!loadingMySyllabi && mySyllabi.length > 0 && (
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            {mySyllabi.map((item) => (
              <div key={item.id} className="card" style={{ margin: 0, padding: '20px' }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      {item.title || 'Untitled Course'}
                    </h4>
                    <div className="muted text-sm" style={{ marginTop: '4px' }}>
                      👨‍🏫 {item.professor || 'No professor'} • 🏫 {item.school || 'No school'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="badge">{new Date(item.createdAt).toLocaleDateString()}</div>
                    <div style={{ marginTop: '8px' }}>
                      <button type="button" onClick={() => togglePreview(item)} style={{ fontSize: '13px', padding: '8px 16px' }}>
                        {previewId === item.id ? '❌ Close PDF' : '📄 View PDF'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {previewId && previewUrl && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>PDF Preview</h3>
            <button type="button" onClick={() => { setPreviewId(null); setPreviewUrl(''); }}>
              Close
            </button>
          </div>
          <iframe
            title="Syllabus preview"
            src={previewUrl}
            style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </div>
      )}

      {!!id && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>🤖 Generate Calendar Events</h3>
          <div style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: 'var(--border-radius)', marginBottom: '16px' }}>
            <div className="row" style={{ gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <strong>Syllabus ID:</strong> <code>{id}</code>
              </div>
              {school && professor && (
                <div className="muted">
                  📚 {school} - {professor}
                </div>
              )}
            </div>
          </div>
          <button onClick={parse} disabled={!rawText.trim()} style={{ width: '100%' }}>
            ✨ Generate Calendar Events with AI
          </button>
        </div>
      )}

      {eventCount > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>📅 Extracted Calendar Events ({eventCount})</h3>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            {events.map((evt, i) => (
              <div key={i} className="event-card" style={{ margin: 0 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{evt.summary}</div>
                  <div className="badge">Event {i + 1}</div>
                </div>
                <div className="grid" style={{ gap: '4px' }}>
                  {(evt.start?.dateTime || evt.start?.date) && (
                    <div className="muted text-sm">
                      📅 Start: {evt.start.dateTime || evt.start.date}
                    </div>
                  )}
                  {(evt.end?.dateTime || evt.end?.date) && (
                    <div className="muted text-sm">
                      🏁 End: {evt.end.dateTime || evt.end.date}
                    </div>
                  )}
                  {evt.location && (
                    <div className="muted text-sm">
                      📍 Location: {evt.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

