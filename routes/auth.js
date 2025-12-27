import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format',
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters',
      });
    }

    // Create user
    const user = await User.create({ email, password });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(409).json({
        error: 'User exists',
        message: 'An account with this email already exists',
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create user',
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isValid = await User.verifyPassword(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to login',
    });
  }
});

/**
 * GET /auth/verify
 * Verify token and return user info
 */
router.get('/verify', authenticate, async (req, res) => {
  try {
    res.json({
      message: 'Token is valid',
      user: req.user,
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify token',
    });
  }
});

export default router;
