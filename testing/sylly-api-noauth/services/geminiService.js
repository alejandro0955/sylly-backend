async function callGeminiJSON(systemPrompt, userText) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const body = {
    contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nSyllabus:\n${userText}` }] }],
    generationConfig: { responseMimeType: 'application/json' },
  };
  const res = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return [];
  const data = await res.json();
  try {
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    return JSON.parse(text);
  } catch { return []; }
}
module.exports = { callGeminiJSON };
