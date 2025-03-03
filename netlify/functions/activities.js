import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'activities.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Create empty JSON file if it doesn't exist
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
