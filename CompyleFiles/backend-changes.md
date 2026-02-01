# Backend Changes Required for Frontend Rebuild

## Summary
The frontend has been completely rebuilt with better security, cleaner code, and new features. Your backend needs updates to support these changes.

---

## 🚨 Critical Changes Required

### 1. **POST /api/ipinfo** (NEW - IP Logging)
**Method:** `POST`
**Purpose:** Log visitor IP address to console

**Request:**
- **Headers:**
  - `Authorization: Bearer <token>` (optional - only if user is logged in)
  - `Content-Type: application/json`
- **Body:** None

**What backend should do:**
```javascript
app.post('/api/ipinfo', optionalAuth, (req, res) => {
  const ip = req.ip; // From trust proxy
  const user = req.user; // From JWT token if provided

  // Log to console
  if (user) {
    console.log(`[IP] User: ${user.username} (${user.id}) - IP: ${ip}`);
  } else {
    console.log(`[IP] Guest - IP: ${ip}`);
  }

  // Return success (frontend ignores response)
  res.json({ ip });
});
```

**Notes:**
- DO NOT save IP to database (just console log)
- `optionalAuth` middleware = validate token if provided, but allow request even without token
- Frontend calls this on testgpt.html page load

---

### 2. **POST /api/auth/validatetoken** (CHANGED - Now POST)
**Method:** `POST` (was GET before)
**Purpose:** Validate JWT token and return user info

**Request:**
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body:** None

**Response:**
```json
{
  "user": {
    "id": "123456789",
    "username": "CakeDev",
    "avatar": "a_1234567890abcdef"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Token expired or invalid
- `500 Internal Server Error` - Server error

**What changed:**
- **Before:** `GET /api/auth/validatetoken?token=xxx`
- **After:** `POST /api/auth/validatetoken` with token in Authorization header

---

### 3. **POST /api/auth/logout** (NEW - Token Invalidation)
**Method:** `POST`
**Purpose:** Invalidate user's JWT token

**Request:**
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body:** None

**Response:**
```json
{
  "success": true
}
```

**What backend should do:**
- Invalidate the token (add to blacklist, remove from session store, etc.)
- If you don't have token invalidation yet, implement one of these:
  - **Option A:** Simple blacklist (Set/Array of invalidated tokens)
  - **Option B:** Short-lived tokens (15min) + refresh tokens (7 days)
  - **Option C:** Redis session store

**Example with blacklist:**
```javascript
const tokenBlacklist = new Set();

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  tokenBlacklist.add(token);
  res.json({ success: true });
});

// In authenticateToken middleware:
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token invalidated' });
  }

  // ... rest of validation
}
```

---

### 4. **POST /api/testgpt** (CHANGED - Now POST with Auth Header)
**Method:** `POST` (was GET before)
**Purpose:** Send question to AI, get response

**Request:**
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "question": "What is JavaScript?"
}
```

**Response:**
```json
{
  "reply": "JavaScript is a programming language..."
}
```
OR
```json
{
  "answer": "JavaScript is a programming language..."
}
```

**Error Responses:**
- `401 Unauthorized` - Token expired/invalid
- `403 Forbidden` - User doesn't have permission
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Server error

**What changed:**
- **Before:** `GET /api/testgpt?question=xxx&token=xxx`
- **After:** `POST /api/testgpt` with token in Authorization header, question in body

**Security improvements:**
- Token no longer in URL (not logged in browser history)
- POST supports longer questions (no URL length limit)
- Standard REST practice

---

## 📋 Optional/Nice-to-Have Changes

### 5. **Remove Discord Webhook Spam**
The old frontend had a `/api/webhooksend` endpoint that users could abuse. Consider:
- Remove the endpoint entirely
- Or restrict it to server-side only (don't expose to frontend)

---

## 🔧 Middleware Changes Needed

### Create Optional Auth Middleware
For endpoints like `/api/ipinfo` that should work with or without login:

```javascript
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // No token provided - continue as guest
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Invalid token - continue as guest
    req.user = null;
    next();
  }
}
```

---

## 📝 Summary Checklist

Before deploying, ensure your backend has:

- [ ] **POST /api/ipinfo** - Logs IP to console
- [ ] **POST /api/auth/validatetoken** - Changed from GET to POST
- [ ] **POST /api/auth/logout** - New endpoint for token invalidation
- [ ] **POST /api/testgpt** - Changed from GET to POST, token in header
- [ ] Token blacklist or invalidation system
- [ ] Optional auth middleware for IP logging
- [ ] Remove/restrict Discord webhook endpoint (optional)

---

## 🧪 Testing Your Backend

Use these curl commands to test:

```bash
# Test IP logging (without auth)
curl -X POST https://cakestudio.onrender.com/api/ipinfo \
  -H "Content-Type: application/json"

# Test IP logging (with auth)
curl -X POST https://cakestudio.onrender.com/api/ipinfo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test token validation
curl -X POST https://cakestudio.onrender.com/api/auth/validatetoken \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test logout
curl -X POST https://cakestudio.onrender.com/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test testgpt
curl -X POST https://cakestudio.onrender.com/api/testgpt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question": "Hello!"}'
```

---

## 🔄 Migration Path

If you need to support both old and new frontends temporarily:

1. Keep old GET endpoints working
2. Add new POST endpoints alongside them
3. Gradually migrate
4. Remove old endpoints once all users moved to new frontend

Example:
```javascript
// Support both old and new
app.get('/api/testgpt', oldHandler); // For old frontend
app.post('/api/testgpt', newHandler); // For new frontend
```

---

## ❓ Questions?

If you need help implementing any of these changes, check:
- JWT validation examples in your current code
- Express.js documentation for middleware
- Your current auth flow for patterns to follow
