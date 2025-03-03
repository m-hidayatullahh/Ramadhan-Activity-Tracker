import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DATA_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'activities.json');

// Pastikan direktori `data` ada
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Pastikan file JSON ada
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

export async function handler(event) {
  if (event.httpMethod === "GET") {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return {
        statusCode: 200,
        body: data,
        headers: { "Content-Type": "application/json" }
      };
    } catch (error) {
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
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save activities' })
      };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
}
