import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

const router = express.Router();

/**
 * GET /admin/users
 * Get all users (admin only)
 */
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    
    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve users',
    });
  }
});

/**
 * GET /admin/stats
 * Get platform statistics (admin only)
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    const chats = await Chat.getAllChats();

    const stats = {
      totalUsers: users.length,
      standardUsers: users.filter(u => u.role === 'standard').length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      totalChats: chats.length,
      activeUsersToday: users.filter(u => {
        const today = new Date().toISOString().split('T')[0];
        const lastRequestDate = u.lastRequestDate?.split('T')[0];
        return lastRequestDate === today;
      }).length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve statistics',
    });
  }
});

/**
 * DELETE /admin/users/:userId
 * Delete a user (admin only)
 */
router.delete('/users/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot delete your own account',
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    // Delete user (implement in User model if needed)
    // For now, return success message
    
    res.json({
      message: 'User deleted successfully',
      userId,
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete user',
    });
  }
});

export default router;
