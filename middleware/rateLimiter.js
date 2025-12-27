import User from '../models/User.js';

/**
 * Rate Limiting Middleware
 * Limits standard users to 20 requests per day
 * Admin users have unlimited access
 */
export const rateLimiter = async (req, res, next) => {
  try {
    const user = req.user;

    // Admin users bypass rate limiting
    if (user.role === 'admin') {
      return next();
    }

    // Check current request count
    const requestCount = await User.getRequestCount(user.id);

    // Standard users limited to 20 requests per day
    const DAILY_LIMIT = 20;

    if (requestCount >= DAILY_LIMIT) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `You have reached your daily limit of ${DAILY_LIMIT} requests`,
        limit: DAILY_LIMIT,
        current: requestCount,
      });
    }

    // Increment request count
    await User.updateRequestCount(user.id);

    // Attach rate limit info to response headers
    res.setHeader('X-RateLimit-Limit', DAILY_LIMIT);
    res.setHeader('X-RateLimit-Remaining', DAILY_LIMIT - requestCount - 1);

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    res.status(500).json({ 
      error: 'Rate limiting error',
      message: 'Internal server error' 
    });
  }
};
