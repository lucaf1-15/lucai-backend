# LucAI Backend API

Node.js + Express backend with JWT authentication, rate limiting, and Groq AI integration.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Start server
npm start

# Development mode (with auto-reload)
npm run dev
```

## Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
GROQ_API_KEY=your-groq-api-key-here
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

## API Documentation

### Authentication Endpoints

#### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "standard",
    "verified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /auth/login
Login with existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": { ... }
}
```

#### GET /auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Token is valid",
  "user": { ... }
}
```

### Chat Endpoints

#### POST /api/chat
Send a message to the AI (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "model": "llama-3.3-70b-versatile"
}
```

**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "Hello! How can I help you today?"
  },
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

#### GET /api/chat/history
Get user's chat history.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "chats": [ ... ],
  "count": 10
}
```

#### GET /api/chat/status
Get current rate limit status.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": "user@example.com",
  "role": "standard",
  "requestsUsed": 5,
  "dailyLimit": 20,
  "remaining": 15
}
```

### Admin Endpoints

#### GET /admin/users
Get all users (admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "users": [ ... ],
  "count": 50
}
```

#### GET /admin/stats
Get platform statistics (admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "totalUsers": 50,
  "standardUsers": 48,
  "adminUsers": 2,
  "totalChats": 500,
  "activeUsersToday": 10
}
```

## Rate Limiting

- **Standard Users:** 20 requests per day
- **Admin Users:** Unlimited requests
- Limits reset at midnight (local server time)
- Rate limit info included in response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`

## Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `users.json` - User accounts
- `chats.json` - Chat history

### Manual Admin Creation

To create an admin user:

1. Sign up normally via API
2. Open `data/users.json`
3. Find your user
4. Change `"role": "standard"` to `"role": "admin"`
5. Save file

## Deployment (Replit)

1. Create new Repl with Node.js
2. Upload backend files
3. Add environment variables in Secrets
4. Run `npm install`
5. Start with `npm start`
6. Copy Replit URL for frontend configuration

## Development

```bash
# Run with auto-reload
npm run dev

# Or use nodemon if installed
npx nodemon server.js
```

## Security Notes

- Never commit `.env` files
- Use strong JWT secrets
- Keep Groq API key secure
- Update CORS origin for production
- Implement rate limiting on all public endpoints

## Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `groq-sdk` - Groq AI integration
- `dotenv` - Environment variables

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Groq API errors:**
- Check API key validity
- Verify API credits
- Check Groq service status
