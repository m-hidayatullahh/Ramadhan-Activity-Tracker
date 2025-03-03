const fs = require('fs');
const path = require('path');

const DATA_DIR = '/tmp/data';
const DATA_FILE = path.join(DATA_DIR, 'activities.json');

// 🔹 Pastikan direktori `/tmp/data` ada sebelum menulis file
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 🔹 Pastikan file JSON ada sebelum dibaca
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return {
        statusCode: 200,
        body: data,
        headers: { "Content-Type": "application/json" }
      };
    } catch (error) {
      console.error('Error reading data file:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to read activities' })
      };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const activities = JSON.parse(event.body);
      fs.writeFileSync(DATA_FILE, JSON.stringify(activities, null, 2));
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Activities saved successfully' })
      };
    } catch (error) {
      console.error('Error writing data file:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save activities' })
      };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
