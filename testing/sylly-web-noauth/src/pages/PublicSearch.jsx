import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useSchools } from "../hooks/useSchools";

export default function PublicSearch({ compact = false }) {
  const { schools, loading: loadingSchools, error: schoolsError } = useSchools();
  const [school, setSchool] = useState("");
  const [professor, setProfessor] = useState("");
  const [professorOptions, setProfessorOptions] = useState([]);
  const [loadingProfessors, setLoadingProfessors] = useState(false);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const sortedSchools = useMemo(() => [...schools].sort((a, b) => a.localeCompare(b)), [schools]);
  const matchedSchool = useMemo(() => {
    if (!school) return null;
    return schools.find((s) => s.toLowerCase() === school.toLowerCase()) || null;
  }, [school, schools]);

  useEffect(() => {
    if (!matchedSchool) {
      setProfessorOptions([]);
      return;
    }

    let cancelled = false;
    async function loadProfessors() {
      setLoadingProfessors(true);
      try {
        const params = new URLSearchParams({ school: matchedSchool });
        const resp = await api.get(`/api/public/professors?${params.toString()}`);
        if (!cancelled) {
          setProfessorOptions(resp.professors || []);
        }
      } catch (err) {
        if (!cancelled) {
          setProfessorOptions([]);
        }
      } finally {
        if (!cancelled) setLoadingProfessors(false);
      }
    }

    loadProfessors();
    return () => {
      cancelled = true;
    };
  }, [matchedSchool]);

  async function handleSearch(e) {
    e?.preventDefault?.();
    if (!matchedSchool) {
      setStatus("Choose a school from the list.");
      return;
    }
    if (!professor.trim()) {
      setStatus("Enter a professor name or partial name.");
      return;
    }

    setSearching(true);
    setStatus("Searching syllabi...");
    try {
      const params = new URLSearchParams({ school: matchedSchool, professor });
      const resp = await api.get(`/api/public/syllabi?${params.toString()}`);
      setResults(resp.syllabi?.map((item) => ({ ...item, school: matchedSchool })) || []);
      setStatus(resp.count ? `Found ${resp.count} syllabus${resp.count === 1 ? "" : "es"}.` : "No syllabi found yet.");
    } catch (err) {
      setStatus(`Search failed: ${err.message}`);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className={compact ? "card" : "card"} style={compact ? {} : { marginTop: 24 }}>
      <h2>Find Shared Syllabi</h2>
      <p className="muted" style={{ marginBottom: 12 }}>
        Browse syllabi fellow students have uploaded. Pick a school and the professor to see shared course outlines.
      </p>
      <form onSubmit={handleSearch} className="grid" style={{ gap: 12 }}>
        <div className="row" style={{ gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="muted" htmlFor="school-input">
              School
            </label>
            <input
              id="school-input"
              list="school-options"
              placeholder={loadingSchools ? "Loading schools..." : "Start typing a school"}
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
            <label className="muted" htmlFor="prof-input">
              Professor
            </label>
            <input
              id="prof-input"
              list="professor-options"
              placeholder={matchedSchool ? "Professor name" : "Select a school first"}
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              disabled={!matchedSchool}
              required
            />
            <datalist id="professor-options">
              {professorOptions.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            {loadingProfessors && <div className="text-sm muted">Loading professors…</div>}
          </div>
        </div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
          <button type="submit" disabled={searching || loadingSchools}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
      {status && <div className="muted" style={{ marginTop: 12 }}>{status}</div>}
      {results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="grid" style={{ gap: 12 }}>
            {results.map((item) => (
              <article key={item.id} className="card" style={{ margin: 0 }}>
                <header className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
                  <h3 style={{ margin: 0 }}>{item.title || "Untitled Syllabus"}</h3>
                  <span className="muted text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
                </header>
                <div className="muted text-sm" style={{ marginTop: 4 }}>
                  <strong>{item.professor}</strong> &middot; {item.school}
                </div>
                <details style={{ marginTop: 8 }}>
                  <summary className="muted">View syllabus text</summary>
                  <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                    {item.rawTextPreview || item.rawText || "No text extracted yet."}
                  </pre>
                </details>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}