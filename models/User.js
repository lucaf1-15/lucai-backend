import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import Database from '../utils/database.js';

const db = new Database('users.json');

/**
 * User Model
 * Handles user data and authentication
 */
class User {
  static async create({ email, password, role = 'standard' }) {
    // Check if user already exists
    const existingUser = db.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const user = {
      id: randomUUID(),
      email,
      password: hashedPassword,
      role, // 'standard' or 'admin'
      verified: true, // Auto-verify for simplicity
      requestCount: 0,
      lastRequestDate: null,
      createdAt: new Date().toISOString(),
    };

    // Save to database
    db.insert(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async findByEmail(email) {
    return db.findOne({ email });
  }

  static async findById(id) {
    return db.findById(id);
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async updateRequestCount(userId) {
    const user = db.findById(userId);
    if (!user) return false;

    const today = new Date().toISOString().split('T')[0];
    const lastRequestDate = user.lastRequestDate?.split('T')[0];

    // Reset count if it's a new day
    const requestCount = lastRequestDate === today ? user.requestCount + 1 : 1;

    return db.update(userId, {
      requestCount,
      lastRequestDate: new Date().toISOString(),
    });
  }

  static async getRequestCount(userId) {
    const user = db.findById(userId);
    if (!user) return 0;

    const today = new Date().toISOString().split('T')[0];
    const lastRequestDate = user.lastRequestDate?.split('T')[0];

    // Return 0 if it's a new day
    return lastRequestDate === today ? user.requestCount : 0;
  }

  static async getAllUsers() {
    const users = db.read();
    return users.map(({ password, ...user }) => user);
  }
}

export default User;
