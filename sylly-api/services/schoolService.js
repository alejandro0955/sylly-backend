const fs = require('fs');
const path = require('path');

let cachedSchools = null;

function loadSchools() {
  if (cachedSchools) return cachedSchools;
  const schoolsPath = path.join(__dirname, '..', 'schools.txt');
  try {
    const raw = fs.readFileSync(schoolsPath, 'utf8');
    cachedSchools = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (err) {
    console.warn('Unable to load schools.txt', err.message);
    cachedSchools = [];
  }
  return cachedSchools;
}

module.exports = { loadSchools };