import { randomUUID } from 'crypto';
import Database from '../utils/database.js';

const db = new Database('chats.json');

/**
 * Chat Model
 * Handles chat message storage and retrieval
 */
class Chat {
  static async create({ userId, messages }) {
    const chat = {
      id: randomUUID(),
      userId,
      messages,
      createdAt: new Date().toISOString(),
    };

    db.insert(chat);
    return chat;
  }

  static async getUserChats(userId) {
    const chats = db.read();
    return chats.filter(chat => chat.userId === userId);
  }

  static async getById(chatId) {
    return db.findById(chatId);
  }

  static async addMessage(chatId, message) {
    const chat = db.findById(chatId);
    if (!chat) return false;

    const updatedMessages = [...chat.messages, message];
    return db.update(chatId, { messages: updatedMessages });
  }

  static async delete(chatId) {
    return db.delete(chatId);
  }

  static async getAllChats() {
    return db.read();
  }
}

export default Chat;
