import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const CHATS_FILE = path.join(DB_DIR, 'chats.json');
const USAGE_FILE = path.join(DB_DIR, 'usage.json');

// Initialize database files
async function initDB() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    
    // Initialize users file
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize chats file
    try {
      await fs.access(CHATS_FILE);
    } catch {
      await fs.writeFile(CHATS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize usage file
    try {
      await fs.access(USAGE_FILE);
    } catch {
      await fs.writeFile(USAGE_FILE, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Read JSON file
async function readJSON(filepath) {
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return filepath === USAGE_FILE ? {} : [];
  }
}

// Write JSON file
async function writeJSON(filepath, data) {
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
}

// User operations
export async function getUsers() {
  return await readJSON(USERS_FILE);
}

export async function getUserByEmail(email) {
  const users = await getUsers();
  return users.find(u => u.email === email);
}

export async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id);
}

export async function createUser(user) {
  const users = await getUsers();
  users.push(user);
  await writeJSON(USERS_FILE, users);
  return user;
}

export async function updateUser(id, updates) {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    await writeJSON(USERS_FILE, users);
    return users[index];
  }
  return null;
}

// Chat operations
export async function getChats(userId) {
  const chats = await readJSON(CHATS_FILE);
  return chats.filter(c => c.userId === userId);
}

export async function createChat(chat) {
  const chats = await readJSON(CHATS_FILE);
  chats.push(chat);
  await writeJSON(CHATS_FILE, chats);
  return chat;
}

// Usage tracking
export async function getTodayUsage(userId) {
  const usage = await readJSON(USAGE_FILE);
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;
  return usage[key] || 0;
}

export async function incrementUsage(userId) {
  const usage = await readJSON(USAGE_FILE);
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}-${today}`;
  usage[key] = (usage[key] || 0) + 1;
  await writeJSON(USAGE_FILE, usage);
  return usage[key];
}

export async function getAllUsageStats() {
  return await readJSON(USAGE_FILE);
}

// Initialize database on import
await initDB();
