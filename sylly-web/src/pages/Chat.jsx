import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useMySyllabi } from "../hooks/useMySyllabi";

export default function Chat() {
  const {
    syllabi,
    loading: loadingSyllabi,
    error: syllabiError,
    refresh: refreshSyllabi,
  } = useMySyllabi();

  const [syllabusId, setSyllabusId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");

  // Load first syllabus automatically
  useEffect(() => {
    if (syllabi.length > 0) {
      setSyllabusId((prev) => prev || syllabi[0].id);
    } else {
      setSyllabusId("");
    }
  }, [syllabi]);

  // Clear chat when changing syllabus
  useEffect(() => {
    setMessages([]);
  }, [syllabusId]);

  const activeSyllabus = useMemo(
    () => syllabi.find((s) => s.id === syllabusId) || null,
    [syllabi, syllabusId]
  );

  async function ask(e) {
    e.preventDefault();
    if (!syllabusId) return setStatus("Select a syllabus first.");
    if (!question.trim()) return setStatus("Type a question to ask.");

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setStatus("Thinking...");

    try {
      const res = await api.post("/api/chat", { syllabusId, question });
      const botMessage = {
        role: "bot",
        text: res.answer || "Sorry, I couldn’t find an answer.",
      };
      setMessages((prev) => [...prev, botMessage]);
      setStatus("");
      setQuestion(""); // clear input
      refreshSyllabi();
    } catch (err) {
      setStatus(`Failed to ask: ${err.message}`);
    }
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        height: "80vh",
      }}
    >
      <h2 style={{ marginBottom: "12px" }}>💬 Chat with Your Syllabi</h2>

      {/* Select Syllabus */}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="chat-syllabus" style={{ fontWeight: 600 }}>
          📚 Select Course
        </label>
        <select
          id="chat-syllabus"
          value={syllabusId}
          onChange={(e) => setSyllabusId(e.target.value)}
          disabled={loadingSyllabi || syllabi.length === 0}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginTop: "6px",
          }}
        >
          {syllabi.length === 0 && (
            <option value="">No syllabi uploaded yet</option>
          )}
          {syllabi.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title || "Untitled"}
              {s.professor ? ` - ${s.professor}` : ""}
            </option>
          ))}
        </select>
        {syllabiError && (
          <div style={{ color: "red", fontSize: "13px" }}>{syllabiError}</div>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          overflowY: "auto",
          marginBottom: "12px",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#666", fontSize: "14px" }}>
            Start by asking a question 👇
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                background: msg.role === "user" ? "#007bff" : "#f1f3f5",
                color: msg.role === "user" ? "white" : "#333",
                padding: "10px 14px",
                borderRadius:
                  msg.role === "user" ? "16px 16px 0 16px" : "16px 16px 16px 0",
                maxWidth: "70%",
                fontSize: "14px",
                lineHeight: "1.5",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={ask}
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <textarea
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(e); // 🚀 send on Enter
            }
          }}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            resize: "none",
          }}
        />
        <button
          type="submit"
          disabled={!syllabusId || !question.trim()}
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#1e847f",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🚀
        </button>
      </form>

      {status && (
        <div
          style={{
            fontSize: "13px",
            color: status.includes("Failed")
              ? "#d9534f"
              : status.includes("Thinking")
              ? "#f0ad4e"
              : "#6c757d",
            marginTop: "8px",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}
