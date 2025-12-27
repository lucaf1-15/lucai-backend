import express from 'express';
import Groq from 'groq-sdk';
import { authenticate } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import Chat from '../models/Chat.js';

const router = express.Router();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * POST /api/chat
 * Send message to AI and get response
 * Protected by authentication and rate limiting
 */
router.post('/chat', authenticate, rateLimiter, async (req, res) => {
  try {
    const { messages, model = 'llama-3.3-70b-versatile' } = req.body;

    // Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Messages array is required and cannot be empty',
      });
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error('No response from AI');
    }

    // Store chat history
    await Chat.create({
      userId: req.user.id,
      messages: [
        ...messages,
        assistantMessage,
      ],
    });

    res.json({
      message: assistantMessage,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Chat error:', error);

    // Handle Groq API errors
    if (error.status === 401) {
      return res.status(500).json({
        error: 'API Configuration Error',
        message: 'Invalid Groq API key. Please check server configuration.',
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'API Rate Limit',
        message: 'Groq API rate limit exceeded. Please try again later.',
      });
    }

    res.status(500).json({
      error: 'Chat error',
      message: 'Failed to get AI response',
      details: error.message,
    });
  }
});

/**
 * GET /api/chat/history
 * Get user's chat history
 */
router.get('/chat/history', authenticate, async (req, res) => {
  try {
    const chats = await Chat.getUserChats(req.user.id);
    
    res.json({
      chats,
      count: chats.length,
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve chat history',
    });
  }
});

/**
 * GET /api/chat/status
 * Get current rate limit status
 */
router.get('/chat/status', authenticate, async (req, res) => {
  try {
    const { getRequestCount } = await import('../models/User.js');
    const requestCount = await getRequestCount.default(req.user.id);
    const limit = req.user.role === 'admin' ? 'unlimited' : 20;

    res.json({
      user: req.user.email,
      role: req.user.role,
      requestsUsed: requestCount,
      dailyLimit: limit,
      remaining: req.user.role === 'admin' ? 'unlimited' : Math.max(0, 20 - requestCount),
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve status',
    });
  }
});

export default router;
