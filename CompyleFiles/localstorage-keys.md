# localStorage Keys Documentation

This document lists all localStorage keys used across the frontend.

---

## Authentication

### `token`
- **Used by:** account.js, ip.js
- **Type:** String (JWT token)
- **Example:** `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
- **Purpose:** Stores user's JWT token for authentication
- **Lifecycle:**
  - Set: After successful Discord OAuth login (auth.js)
  - Read: Every page load (account.js), IP logging (ip.js)
  - Removed: When user logs out (auth/logout.html)

---

## TestGPT Chat

### `testgpt_messages`
- **Used by:** scripttestgpt.js
- **Type:** JSON array of message objects
- **Example:**
```json
[
  {
    "role": "user",
    "content": "What is JavaScript?",
    "timestamp": 1738387200000
  },
  {
    "role": "assistant",
    "content": "JavaScript is a programming language...",
    "timestamp": 1738387205000
  }
]
```
- **Purpose:** Saves all chat messages so they persist across page refreshes
- **Lifecycle:**
  - Set: After each message sent/received (scripttestgpt.js)
  - Read: On page load (scripttestgpt.js)
  - Removed: When user clicks "Clear Chat History" button

### `timeToday`
- **Used by:** scripttestgpt.js
- **Type:** String (number in milliseconds)
- **Example:** `"450000"` (7 minutes 30 seconds)
- **Purpose:** Tracks total time spent on testgpt.html today
- **Lifecycle:**
  - Set: Before page unload (scripttestgpt.js)
  - Read: On page load (scripttestgpt.js)
  - Removed: Never (accumulates indefinitely)
  - **Note:** Resets daily manually if user wants

---

## Background Color Tester

### `bgcolor_color`
- **Used by:** scriptbgcolor.js
- **Type:** String (CSS color value)
- **Example:** `"red"` or `"#ff0000"` or `"red, green, blue"`
- **Purpose:** Saves user's preferred background color
- **Lifecycle:**
  - Set: When user clicks "Save to Browser" button (scriptbgcolor.js)
  - Read: On page load (scriptbgcolor.js)
  - Removed: When user clicks "Reset to Default" button

### `bgcolor_gradient`
- **Used by:** scriptbgcolor.js
- **Type:** String (CSS radial gradient position)
- **Example:** `"circle at top left"` or `"circle at bottom right"`
- **Purpose:** Saves gradient position for multi-color backgrounds
- **Lifecycle:**
  - Set: When user clicks "Save to Browser" button (scriptbgcolor.js)
  - Read: On page load (scriptbgcolor.js)
  - Removed: When user clicks "Reset to Default" button

---

## Summary Table

| Key | Used By | Type | Can Be Removed Manually? |
|-----|---------|------|--------------------------|
| `token` | account.js, ip.js | JWT String | Yes (logout) |
| `testgpt_messages` | scripttestgpt.js | JSON Array | Yes (clear history button) |
| `timeToday` | scripttestgpt.js | Number String | Manual only |
| `bgcolor_color` | scriptbgcolor.js | CSS Color String | Yes (reset button) |
| `bgcolor_gradient` | scriptbgcolor.js | CSS String | Yes (reset button) |

---

## Developer Notes

### Accessing localStorage in Browser Console

```javascript
// View all localStorage
console.log(localStorage);

// Get specific key
localStorage.getItem("token");

// View chat messages
JSON.parse(localStorage.getItem("testgpt_messages"));

// Clear specific key
localStorage.removeItem("testgpt_messages");

// Clear everything (careful!)
localStorage.clear();
```

### Storage Limits

- **Browser Limit:** ~5-10MB per domain
- **Current Usage:** Very minimal
  - token: ~500 bytes
  - testgpt_messages: ~1KB per 10 messages
  - timeToday: ~10 bytes
  - bgcolor_*: ~50 bytes each

### Privacy Considerations

- All data stored locally in user's browser
- Nothing sent to server except:
  - `token` - sent to backend for auth
  - Chat messages are visual only (NOT sent to AI)
- Users can clear all data via browser settings

---

## JWT Token Format

The `token` key stores a JWT with this structure:

```javascript
// Decoded token example:
{
  "id": "123456789",
  "username": "CakeDev",
  "avatar": "a_1234567890abcdef",
  "iat": 1738387200,
  "exp": 1738473600
}
```

**Important:** Frontend never decodes the token. It just passes it to backend.

---

## Migration Notes

### From Old Frontend to New:

**Old keys that are NO LONGER USED:**
- `jwtToken` (replaced by `token`)

**Migration handled automatically:**
- Old logout.html removes both `jwtToken` and `token` for compatibility
