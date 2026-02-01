# Research

## Summary
Completed comprehensive scan of frontend codebase (cakestudio). Found 18 HTML pages, 9 JavaScript files, and 1 CSS file. The site is a personal portfolio/learning project with Discord OAuth authentication, visitor tracking, and several interactive mini-projects. The testgpt.html page is an AI chatbot interface requiring login. The codebase uses event-driven architecture with global variables for cross-script communication. Single CSS file handles all styling with Discord-themed colors and dark mode support.

## Repository: cakestudio

### Files Found
**HTML Files (18 total):**
- testgpt.html (mentioned by user)
- auth/index.html, auth/login.html, auth/callback.html, auth/logout.html
- index.html (main page)
- Various game/utility pages: numberguesser.html, yt.html, crasherzoner.html, etc.
- Error pages: 404.html, 503.html

**CSS Files (1 total):**
- CSS/style.css (single CSS file as user mentioned)

**JavaScript Files (9 total):**
- scripttestgpt.js (mentioned by user)
- auth.js (mentioned by user)
- account.js (mentioned by user)
- Other scripts: script.js, dark-mode.js, ip.js, scriptbgcolor.js, scriptnumberguesser.js, scriptyt.js

---

## Key Files Deep Dive

### testgpt.html
**Location:** `/cakestudio/testgpt.html`
**Purpose:** Chat interface page for AI chatbot feature (TestGPT)

**How it works:**
- Main chat interface with question input field and send button
- Displays API response in a text container with copy-to-clipboard functionality
- Shows HTTP status codes and status messages with colored indicators
- Includes account section with profile picture, username, login/logout buttons
- Loads multiple scripts: scripttestgpt.js, account.js, ip.js, dark-mode.js, script.js

**UI Elements:**
- Input field (`#questionInput`) for user questions
- Send button (`#sendButton`) - initially disabled
- Response container (`#responseContainer`) for API replies
- Status indicators with SVG circle that changes color (gray/lime/red)
- Account profile section with Discord CDN emoji placeholders

---

### scripttestgpt.js
**Location:** `/cakestudio/Javascript/scripttestgpt.js`
**Purpose:** Handles the TestGPT chat functionality and API communication

**How it works:**
- Waits for 'ipProcessed' event before enabling the UI
- Sends questions to `${apiUrl}/testgpt?question=${question}&token=${jwtToken}` endpoint
- Validates user is logged in before allowing questions (checks `jwtToken` and `loggedIn`)
- Handles multiple HTTP error codes: 401 (expired session), 403 (forbidden), 429 (rate limited)
- Sends Discord webhook notifications for both successful questions and errors
- Includes 3-second cooldown after each request
- Contains commented-out error handling functions (`minorErrorMessageHandler`, `errorIndicatorImageHandler`)
- Has `copyTextToClipboard()` function for copying API responses

**Dependencies:**
- Requires `jwtToken` and `loggedIn` from account.js
- Requires `apiUrl` from account.js
- Requires `userInfoDescription` variable (likely from ip.js)
- Uses `sendWebhook()` function (likely from script.js or ip.js)

---

### auth.js
**Location:** `/cakestudio/Javascript/auth.js`
**Purpose:** OAuth callback handler that validates tokens and redirects users

**How it works:**
- Extracts `token` and `redirect` URL parameters from query string
- Validates token by calling `https://cakestudio.onrender.com/api/auth/validatetoken?token=${token}`
- If token is valid, stores it in localStorage as "token"
- Redirects user to `https://cakeorpastry.netlify.app${redirectParam}` after validation
- Handles errors with alert dialogs showing HTTP status codes

**URL Parameters:**
- `token` - JWT token from OAuth provider
- `redirect` - Where to redirect after successful login (defaults to "/")

---

### account.js
**Location:** `/cakestudio/Javascript/account.js`
**Purpose:** Manages user authentication state and profile UI

**How it works:**
- Defines global variables: `apiUrl`, `path`, `jwtToken`, `discordUser`, `loggedIn`
- On page load, checks for `jwtToken` in localStorage
- If token exists, validates it with API endpoint `${apiUrl}/auth/validatetoken`
- Updates UI based on login state (profile picture, username, button states)
- Dispatches 'discordUserLoaded' event when user data is loaded
- Enables/disables login/logout buttons based on authentication state

**Functions:**
- `updateUI()` - Updates profile picture (Discord CDN avatar) and username display
- `login()` - Redirects to `/auth/login?redirect=${currentPath}`
- `logout()` - Redirects to `/auth/logout?redirect=${currentPath}`

**Global Variables Exported:**
- `apiUrl` = "https://cakestudio.onrender.com/api"
- `jwtToken` - Retrieved from localStorage
- `discordUser` - User object from API
- `loggedIn` - Boolean authentication state

---

## Core Support Files

### index.html
**Location:** `/cakestudio/index.html`
**Purpose:** Homepage/landing page with project links

**How it works:**
- Simple navigation hub with list of project links
- Links to: amysteriousworld, testgpt, crasherzoner, numberguesser, bgcolor, nikhil
- Includes "About Me" section with social media handles
- Uses shared header with logo and dark mode toggle
- Only loads script.js and dark-mode.js (no account/auth on homepage)

---

### script.js
**Location:** `/cakestudio/Javascript/script.js`
**Purpose:** Provides global utility functions for error handling

**How it works:**
- Defines `minorErrorMessageHandler(message)` - Shows temporary error messages for 3 seconds
- Defines `errorIndicatorImageHandler()` - Animated fade-in/fade-out for error indicator image
- Contains commented-out dark mode toggle code (moved to dark-mode.js)
- Functions are globally scoped so other scripts can call them

**Functions:**
- `minorErrorMessageHandler(message)` - Displays error in `#minorErrorMessage` element, disables send button temporarily
- `errorIndicatorImageHandler()` - Animates `#errorIndicatorImage` with opacity transitions (1.5s fade-in, 1s fade-out)

---

### ip.js
**Location:** `/cakestudio/Javascript/ip.js`
**Purpose:** Tracks visitor information and sends it to Discord webhook

**How it works:**
- Waits for 'discordUserLoaded' event from account.js to get user data
- Fetches visitor IP information from ipinfo.io API
- Collects: IP address, city, region, country, timezone, org, location, cookies
- Combines IP data with Discord user data (if logged in)
- Sends formatted data to Discord webhook via `sendWebhook()` function
- Dispatches 'ipProcessed' event when complete (used by scripttestgpt.js)

**Global Variables Exported:**
- `userInfoDescription` - Formatted string with all visitor data
- `userData` - Discord user object (or null)
- `userDataFormatted` - Formatted Discord user string

**Functions:**
- `sendWebhook(title, description, color)` - Calls `${apiUrl}/webhooksend` endpoint

**Tracking Flow:**
1. Wait for Discord user data
2. Fetch IP info from ipinfo.io
3. Send combined data to webhook
4. Dispatch 'ipProcessed' event

---

### dark-mode.js
**Location:** `/cakestudio/Javascript/dark-mode.js`
**Purpose:** Toggle dark mode on/off

**How it works:**
- Listens for click on `#toggleDarkModeButton`
- Toggles `dark-mode` class on document.body
- Changes button emoji: 🌙 (light mode) ↔️ ☀️ (dark mode)

---

## Authentication Flow Files

### auth/login.html
**Location:** `/cakestudio/auth/login.html`
**Purpose:** Login redirect page

**How it works:**
- Extracts `redirect` parameter from URL (defaults to "/")
- Immediately redirects to `https://cakestudio.onrender.com/api/auth/login?redirect=${redirect}`
- Backend handles OAuth flow (likely Discord OAuth)
- No stylesheets or external scripts - pure redirect

---

### auth/callback.html
**Location:** `/cakestudio/auth/callback.html`
**Purpose:** OAuth callback landing page

**How it works:**
- Loads auth.js script which handles token validation
- Empty body - all logic in auth.js
- Backend redirects here with `?token=${jwt}&redirect=${path}` after OAuth success
- auth.js validates token and stores it in localStorage

---

### auth/logout.html
**Location:** `/cakestudio/auth/logout.html`
**Purpose:** Logout page

**How it works:**
- Extracts `redirect` parameter from URL (defaults to "/")
- Removes "token" from localStorage (also tries to remove legacy "jwtToken")
- Redirects to `https://cakeorpastry.netlify.app${redirectParam}`
- No backend API call - pure client-side logout

---

## Styling

### CSS/style.css
**Location:** `/cakestudio/CSS/style.css`
**Purpose:** Single CSS file for entire website (as user mentioned)

**Key Styles:**
- **Background:** Radial gradient (pink → purple → #9000ff)
- **Dark Mode:** Black background, white text (toggled via `.dark-mode` class)
- **Animations:** bounce, move-left, move-right, ping, pulse
- **Header:** Flexbox layout with logo and dark mode button
- **Buttons:** 4 styles - primary (Discord blue), secondary (gray), success (green), danger (red)
- **Input fields:** Dark theme (#40444b background), white text, Discord blue focus border
- **Containers/Boxes:** Dark boxes (#1d1f22) with rounded corners, shadows
- **Profile elements:** Circular profile pictures, username styling
- **Custom scrollbar:** Thin purple/blue scrollbar (#8083ff)
- **Tables:** Styled with borders, hover effects

**Button Classes:**
- `.primary-button` - #5865f2 (Discord blue)
- `.secondary-button` - #72767d (gray)
- `.success-button` - #3ba55d (green)
- `.danger-button` - #f04747 (red)

**All buttons have disabled states with reduced opacity**

---

## Game/Utility Pages

### numberguesser.html + scriptnumberguesser.js
**Location:** `/cakestudio/numberguesser.html` + `/cakestudio/Javascript/scriptnumberguesser.js`
**Purpose:** Interactive number guessing trick/game

**How it works:**
- Classic math trick: think of number 1-9, add random numbers, subtract original = predictable result
- Game flow: Start → Add firstNumber → Add secondNumber → Subtract original → Reveal result
- Uses state machine with stages: `_stage_1` through `_stage_5`
- 3-second debounce between button clicks
- Random numbers generated (5-100 range) that add up to reveal final result
- Has `window.onbeforeunload` warning ("janko im sowwyy~ :(") to prevent accidental page close
- Game auto-restarts after completion with new random numbers

**UI States:**
- Start button → enables Next/Stop buttons
- Stop button → resets game with 3-second cooldown
- Next button → advances through stages with debounce

---

### bgcolor.html + scriptbgcolor.js
**Location:** `/cakestudio/bgcolor.html` + `/cakestudio/Javascript/scriptbgcolor.js`
**Purpose:** Background color testing/demo page with URL params

**How it works:**
- Allows users to test background colors/gradients interactively
- Two input fields: color name and radial gradient position
- Supports multiple color formats: names (red), hex (#2aff00), rgb, gradients
- Has URI encoder/decoder tools built-in
- URL parameters support:
  - `?color=value` - Set color on page load
  - `?radialgradientposition=value` - Set gradient position
  - `?hideui=true` - Hide all UI to preview colors only

**Functions:**
- `color(color)` - Applies background color/gradient to body
- `refresh()` - Resets to default state
- `paramsChecker()` - Reads and applies URL parameters on page load
- URI encode/decode functionality with error handling

**Educational content:** Includes explanations of URL params, examples, and interactive URI component tools

---

## Event Flow & Dependencies

### Script Loading Order (testgpt.html example):
1. `script.js` - Global utility functions loaded first
2. `account.js` - Sets up auth state, dispatches 'discordUserLoaded'
3. `ip.js` - Waits for 'discordUserLoaded', fetches IP info, dispatches 'ipProcessed'
4. `scripttestgpt.js` - Waits for 'ipProcessed', enables UI
5. `dark-mode.js` - Independent dark mode toggle

### Custom Events Chain:
```
page load
  → account.js validates token
    → dispatches 'discordUserLoaded'
      → ip.js fetches IP data
        → dispatches 'ipProcessed'
          → scripttestgpt.js enables send button
```

---

## Architecture Overview

**Frontend Structure:**
- Single-page apps per feature (testgpt, numberguesser, bgcolor, etc.)
- Shared components: header with logo, dark mode button, navigation
- Consistent styling via single CSS file
- Global utility functions in script.js
- Backend API: `https://cakestudio.onrender.com/api`
- Frontend domain: `https://cakeorpastry.netlify.app`

**Authentication:**
- Discord OAuth flow via backend
- JWT tokens stored in localStorage
- Token validation on every page load (if present)
- Auth state managed globally via account.js

**Tracking:**
- Visitor IP tracking via ipinfo.io
- Discord webhooks for monitoring:
  - User visits
  - TestGPT questions/responses
  - Error events
  - IP info fetch errors

**Code Style Notes:**
- Mix of uppercase HTML tags (old-school style)
- Global variables for cross-script communication
- Event-driven architecture (custom events)
- Commented-out code sections (legacy/experimental features)
- Inline scripts in some HTML files (auth pages)

---
