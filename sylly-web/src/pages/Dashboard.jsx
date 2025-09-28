import React, { useEffect, useState, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { api } from "../api/client";

const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

function formatDateRange(event) {
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  const startString =
    startDate && !Number.isNaN(startDate.getTime())
      ? startDate.toLocaleString()
      : "TBD";
  const endString =
    endDate && !Number.isNaN(endDate.getTime()) ? endDate.toLocaleString() : "";

  return endString ? `${startString} - ${endString}` : startString;
}

export default function Dashboard() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🟢 Filter states
  const [selectedCourse, setSelectedCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setLoading(false);
      setEvents([]);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        await getAccessTokenSilently({
          authorizationParams: audience ? { audience } : undefined,
        });
        const resp = await api.get("/api/planner/events");
        if (!cancelled) {
          setEvents(resp.events || []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          const message = err?.message || "Failed to load events";
          setError(message);
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Filter by course
      if (selectedCourse && evt.syllabusTitle !== selectedCourse) return false;

      // Filter by date range
      const eventDate = new Date(evt.start?.dateTime || evt.start?.date);
      if (startDate && new Date(startDate) > eventDate) return false;
      if (endDate && new Date(endDate) < eventDate) return false;

      return true;
    });
  }, [events, selectedCourse, startDate, endDate]);

  const uniqueCourses = useMemo(() => {
    const courses = events.map((e) => e.syllabusTitle).filter(Boolean);
    return Array.from(new Set(courses));
  }, [events]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "TBD";

    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Tomorrow";
    if (diffInDays > 1 && diffInDays <= 7) return `In ${diffInDays} days`;
    if (diffInDays < 0 && diffInDays >= -1) return "Recently passed";
    return date.toLocaleDateString();
  };

  const getEventIcon = (summary) => {
    const s = summary.toLowerCase();
    if (
      s.includes("exam") ||
      s.includes("test") ||
      s.includes("midterm") ||
      s.includes("final")
    )
      return "📝";
    if (
      s.includes("assignment") ||
      s.includes("homework") ||
      s.includes("project")
    )
      return "📋";
    if (s.includes("lecture") || s.includes("class")) return "🎓";
    if (s.includes("quiz")) return "❓";
    if (s.includes("lab")) return "🔬";
    if (s.includes("presentation")) return "📊";
    return "📅";
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <div
        className="card"
        style={{
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3>Filter Events</h3>
        <div
          className="filter-row"
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ flex: 2, minWidth: "150px" }}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ flex: 1, minWidth: "120px" }}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ flex: 1, minWidth: "120px" }}
          />

          <button
            onClick={() => {
              setSelectedCourse("");
              setStartDate("");
              setEndDate("");
            }}
            style={{
              flex: 1,
              minWidth: "80px",
              borderRadius: "var(--border-radius)",
              justifyContent: "center",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "20px" }}>
        <h3 style={{ marginBottom: "16px" }}>📅 Upcoming Events</h3>

        {loading && <p>Loading...</p>}
        {error && !loading && <p style={{ color: "red" }}>{error}</p>}
        {!loading && filteredEvents.length === 0 && (
          <p>No events match the selected filters.</p>
        )}

        {!loading && filteredEvents.length > 0 && (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredEvents.map((event, index) => (
              <div
                key={`${event.syllabusId}-${index}`}
                className="event-card"
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.08)";
                }}
              >
                {/* Top Row: Course + Time */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "#f0f0f0",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {event.syllabusTitle || "Untitled Course"}
                  </div>
                  <div className="muted" style={{ fontSize: "12px" }}>
                    {formatRelativeTime(
                      event.start?.dateTime || event.start?.date
                    )}
                  </div>
                </div>

                {/* Main Row: Icon + Details */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>
                    {getEventIcon(event.summary)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "16px",
                        marginBottom: "4px",
                      }}
                    >
                      {event.summary}
                    </div>
                    <div className="muted" style={{ fontSize: "13px" }}>
                      {formatDateRange(event)}
                    </div>
                    {event.location && (
                      <div
                        className="muted"
                        style={{ fontSize: "13px", marginTop: "4px" }}
                      >
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
