const { loadSchools } = require("../services/schoolService");
const { SyllabusModel } = require("../models/syllabusModel");

async function listSchools(req, res) {
  const schools = loadSchools();
  res.json({ schools });
}

async function listProfessors(req, res) {
  const { school } = req.query;
  if (!school) {
    return res.status(400).json({ error: "school is required" });
  }
  const schools = loadSchools();
  const matchedSchool = schools.find((s) => s.toLowerCase() === school.toLowerCase());
  if (!matchedSchool) {
    return res.status(400).json({ error: "Unknown school" });
  }
  const professors = await SyllabusModel.listProfessorsBySchool(matchedSchool);
  res.json({
    school: matchedSchool,
    professors: professors
      .map((row) => row.professor)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  });
}

async function searchPublicSyllabi(req, res) {
  const { school, professor } = req.query;
  if (!school) {
    return res.status(400).json({ error: "school is required" });
  }
  if (!professor) {
    return res.status(400).json({ error: "professor is required" });
  }

  const trimmedProfessor = professor.trim();
  if (!trimmedProfessor) {
    return res.status(400).json({ error: "professor cannot be empty" });
  }

  const schools = loadSchools();
  const matchedSchool = schools.find((s) => s.toLowerCase() === school.toLowerCase());
  if (!matchedSchool) {
    return res.status(400).json({ error: "Unknown school" });
  }

  const results = await SyllabusModel.searchPublic({
    school: matchedSchool,
    professor: trimmedProfessor,
  });

  const payload = results.map(({ rawText, ...rest }) => ({
    ...rest,
    rawTextPreview: rawText ? rawText.slice(0, 2000) : "",
  }));

  res.json({
    count: payload.length,
    syllabi: payload,
  });
}

module.exports = { listSchools, listProfessors, searchPublicSyllabi };