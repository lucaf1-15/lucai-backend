import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Simple JSON-based database utility
 * Stores data in JSON files for persistence
 */
class Database {
  constructor(filename) {
    this.filepath = path.join(DATA_DIR, filename);
    this.ensureFile();
  }

  ensureFile() {
    if (!fs.existsSync(this.filepath)) {
      fs.writeFileSync(this.filepath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.filepath}:`, error.message);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${this.filepath}:`, error.message);
      return false;
    }
  }

  findOne(query) {
    const data = this.read();
    return data.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  findById(id) {
    const data = this.read();
    return data.find(item => item.id === id);
  }

  insert(item) {
    const data = this.read();
    data.push(item);
    return this.write(data);
  }

  update(id, updates) {
    const data = this.read();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    data[index] = { ...data[index], ...updates };
    return this.write(data);
  }

  delete(id) {
    const data = this.read();
    const filtered = data.filter(item => item.id !== id);
    return this.write(filtered);
  }
}

export default Database;
