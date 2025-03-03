import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'activities.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Create empty JSON file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Middleware
app.use(cors());
app.use(express.json());

// Get all activities
app.get('/api/activities', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data file:', error);
    res.status(500).json({ error: 'Failed to read activities' });
  }
});

// Save activities
app.post('/api/activities', (req, res) => {
  try {
    const activities = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(activities, null, 2));
    res.json({ success: true, message: 'Activities saved successfully' });
  } catch (error) {
    console.error('Error writing data file:', error);
    res.status(500).json({ error: 'Failed to save activities' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data file location: ${DATA_FILE}`);
});