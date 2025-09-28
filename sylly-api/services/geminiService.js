const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGeminiJSON(systemPrompt, userText) {
	const body = {
		contents: [
			{
				role: "user",
				parts: [{ text: systemPrompt + "\n\nSyllabus:\n" + userText }],
			},
		],
		generationConfig: { responseMimeType: "application/json" },
	};
	const res = await fetch(
		GEMINI_URL + "?key=" + (process.env.GEMINI_API_KEY || ""),
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		}
	);
	if (!res.ok) {
		console.log("Gemini JSON call failed", res.status);
		return [];
	}
	const data = await res.json();
	try {
		const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
		return JSON.parse(text);
	} catch {
		return [];
	}
}

async function callGeminiText(systemPrompt, userText) {
	const body = {
		contents: [
			{
				role: "user",
				parts: [{ text: systemPrompt + "\n\nSyllabus:\n" + userText }],
			},
		],
	};
	const res = await fetch(
		GEMINI_URL + "?key=" + (process.env.GEMINI_API_KEY || ""),
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		}
	);
	if (!res.ok) {
		console.log(
			"Gemini text call failed",
			res.status,
			await res.text().catch(() => "")
		);
		return "";
	}
	const data = await res.json();
	const parts = data?.candidates?.[0]?.content?.parts ?? [];
	return parts
		.map((part) => (typeof part.text === "string" ? part.text : ""))
		.join("")
		.trim();
}

module.exports = { callGeminiJSON, callGeminiText };
