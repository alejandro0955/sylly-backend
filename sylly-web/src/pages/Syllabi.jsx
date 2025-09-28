import React, { useMemo, useState } from "react";
import { api } from "../api/client";
import FileDropAndParse from "../components/filedrop";
import { useSchools } from "../hooks/useSchools";
import { useMySyllabi } from "../hooks/useMySyllabi";

export default function Syllabi() {
  const {
    schools,
    loading: loadingSchools,
    error: schoolsError,
  } = useSchools();
  const sortedSchools = useMemo(
    () => [...schools].sort((a, b) => a.localeCompare(b)),
    [schools]
  );

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
    return (
      schools.find((s) => s.toLowerCase() === school.toLowerCase()) || null
    );
  }, [school, schools]);

  async function create(e) {
    e.preventDefault();
    if (!matchedSchool) return setStatus("Choose a school from the list.");
    if (!professor.trim())
      return setStatus("Enter the professor's name before saving.");
    if (!rawText.trim()) return setStatus("Provide syllabus text first.");
    if (!fileData) return setStatus("Upload a PDF before saving.");

    setStatus("Saving syllabus...");
    try {
      const payload = {
        title,
        rawText,
        school: matchedSchool,
        professor,
        fileUrl: fileData,
      };
      const s = await api.post("/api/syllabi", payload);
      setId(s.id);
      setSchool(matchedSchool);
      setProfessor(s.professor || professor);
      setEvents(Array.isArray(s.eventsJson) ? s.eventsJson : []);
      setStatus("✅ Syllabus saved. Parse it to generate calendar events.");
      refreshMySyllabi();
    } catch (err) {
      setStatus(`❌ Failed to save syllabus: ${err.message}`);
    }
  }

  async function parse() {
    if (!id) return;
    setStatus("⚡ Generating events...");
    try {
      const result = await api.post(`/api/syllabi/${id}/parse`, {});
      const nextEvents = result.events || [];
      setEvents(nextEvents);
      setStatus(`✨ Generated ${result.count || 0} events.`);
    } catch (err) {
      setStatus(`❌ Failed to generate events: ${err.message}`);
    }
  }

  const togglePreview = async (item) => {
    if (previewId === item.id) {
      setPreviewId(null);
      setPreviewUrl("");
      return;
    }
    const fetched = await api.get(`/api/syllabi/${item.id}`);
    if (fetched?.fileUrl) {
      setPreviewId(item.id);
      setPreviewUrl(fetched.fileUrl);
      setStatus("📄 PDF preview ready.");
    } else {
      setPreviewId(null);
      setPreviewUrl("");
      setStatus("⚠️ No PDF available.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
      {/* LEFT COLUMN - Upload Form */}
      <div style={{ flex: 1 }}>
        <h2>📚 Upload New Syllabus</h2>
        <div className="card" style={{ padding: "20px" }}>
          <form onSubmit={create} className="grid" style={{ gap: 16 }}>
            <div className="row" style={{ gap: 16 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Course Title"
                style={{ flex: 2 }}
                required
              />
              <button
                type="submit"
                disabled={
                  !rawText.trim() ||
                  !school.trim() ||
                  !professor.trim() ||
                  !fileData
                }
                style={{
                  flex: 1,
                  borderRadius: "var(--border-radius)",
                  justifyContent: "center",
                }}
              >
                💾 Save
              </button>
            </div>
            <input
              list="school-options"
              placeholder={
                loadingSchools ? "Loading schools..." : "School name"
              }
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
            />
            <datalist id="school-options">
              {sortedSchools.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <input
              placeholder="Professor's full name"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              required
            />

            <FileDropAndParse
              initialText={rawText}
              onTextChange={setRawText}
              onFileData={setFileData}
              showTextArea={false}
            />
          </form>

          {status && (
            <div
              style={{
                marginTop: "12px",
                padding: "8px",
                borderRadius: "6px",
                background: status.startsWith("❌") ? "#fee2e2" : "#e0f2fe",
              }}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - My Syllabi */}
      <div style={{ flex: 1 }}>
        <h2>📋 My Syllabi</h2>
        <div className="card" style={{ padding: "20px" }}>
          {loadingMySyllabi && <p>Loading...</p>}
          {mySyllabiError && <p style={{ color: "red" }}>{mySyllabiError}</p>}
          {!loadingMySyllabi && mySyllabi.length === 0 && (
            <p>No syllabi uploaded yet.</p>
          )}
          {mySyllabi.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{ marginBottom: "12px", padding: "12px" }}
            >
              <h4>{item.title}</h4>
              <p className="muted">
                👨‍🏫 {item.professor || "Unknown"} • 🏫 {item.school || "Unknown"}
              </p>
              <button
                onClick={() => togglePreview(item)}
                style={{
                  flex: 1,
                  borderRadius: "var(--border-radius)",
                  justifyContent: "center",
                }}
              >
                {previewId === item.id ? "❌ Close PDF" : "📄 View PDF"}
              </button>
            </div>
          ))}
        </div>

        {previewId && previewUrl && (
          <div className="card" style={{ marginTop: "16px", padding: "16px" }}>
            <h3>PDF Preview</h3>
            <iframe
              title="Syllabus Preview"
              src={previewUrl}
              style={{
                width: "100%",
                height: "400px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        {id && (
          <div className="card" style={{ marginTop: "16px", padding: "16px" }}>
            <h3>🤖 Generate Calendar Events</h3>
            <button
              onClick={parse}
              style={{
                width: "100%",
                marginTop: "8px",
                borderRadius: "var(--border-radius)",
              }}
            >
              ✨ Generate Events
            </button>
          </div>
        )}

        {events.length > 0 && (
          <div className="card" style={{ marginTop: "16px", padding: "16px" }}>
            <h3>📅 Extracted Events</h3>
            {events.map((evt, i) => (
              <div key={i} className="event-card" style={{ margin: "8px 0" }}>
                <strong>{evt.summary}</strong>
                <p>📅 {evt.start?.dateTime || evt.start?.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
