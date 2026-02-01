# Netlify Setup & Meta Tags Guide

## Meta Tags in HTML - Do They Need to Be in Every File?

**Short answer:** YES, meta tags need to be in each HTML file's `<head>` section.

**Why?**
- Each HTML file is a separate document
- Browsers read each file independently
- Meta tags affect that specific page only

**Can it be automated?**
Sort of, but not easily for static HTML. Here are your options:

---

## Option 1: Keep Meta Tags in Each File (RECOMMENDED)

**Best for:** Static sites like yours

Just copy/paste this template into each HTML file:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta property="og:title" content="Page Title - Cake's Studio">
  <meta property="og:description" content="Page description">
  <meta property="og:url" content="https://cakeorpastry.netlify.app/page">
  <meta property="og:image" content="https://cakestudio.onrender.com/assets/favicon.png">
  <meta property="og:type" content="website">
  <link rel="icon" href="/Assets/Studio/favicon.png" type="image/png">
  <link rel="stylesheet" href="/CSS/style.css">
  <title>Page Title - Cake's Studio</title>
</head>
```

**Pros:**
- Simple, no build process needed
- Works with Netlify drag-and-drop
- Each page can have custom meta tags

**Cons:**
- Repetitive (but that's okay!)

---

## Option 2: Use a Build Process (ADVANCED)

**Best for:** If you want to learn build tools

Use a static site generator that has templates:
- **11ty (Eleventy)** - Simple, JavaScript-based
- **Hugo** - Super fast, Go-based
- **Jekyll** - Ruby-based, Netlify loves it

**Example with 11ty:**
```html
<!-- _includes/layout.njk -->
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} - Cake's Studio</title>
  <!-- More meta tags -->
</head>
<body>
  {{ content }}
</body>
</html>
```

Then each page:
```markdown
---
title: TestGPT
---
<div>Your content here</div>
```

**Pros:**
- Write meta tags once
- Reuse across all pages

**Cons:**
- Requires learning a new tool
- Adds build step
- More complex setup

---

## Option 3: JavaScript Injection (NOT RECOMMENDED)

You could use JavaScript to inject meta tags, but:
- ❌ Bad for SEO (search engines may not see them)
- ❌ Slow (tags load after JavaScript runs)
- ❌ Doesn't work if JavaScript is disabled

**Don't do this unless you have a specific reason.**

---

## Netlify Configuration

### What is `netlify.toml`?

A config file that tells Netlify how to build and deploy your site.

### Example `netlify.toml`:

```toml
# Build settings (if you have a build process)
[build]
  publish = "."  # Publish current directory (no build needed for static HTML)
  command = ""   # No build command needed

# Custom headers for all pages
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/CSS/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/Javascript/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/Assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Redirects (if needed)
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301

# SPA redirect (if you make it a single-page app later)
# [[redirects]]
#   from = "/*"
#   to = "/index.html"
#   status = 200
```

### What Can You Do with `netlify.toml`?

1. **Set HTTP Headers**
   - Security headers (X-Frame-Options, CSP, etc.)
   - Cache control
   - CORS headers

2. **Redirects**
   - Permanent redirects (301)
   - Temporary redirects (302)
   - Proxy requests to your backend

3. **Build Settings**
   - Build command (if you add a build process later)
   - Publish directory
   - Environment variables

4. **Functions**
   - Configure Netlify serverless functions
   - Set timeouts, memory limits

---

## Recommended `netlify.toml` for Your Site

Create this file in your cakestudio root:

```toml
# cakestudio/netlify.toml

[build]
  publish = "."
  command = ""

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache CSS/JS/Assets for 1 year
[[headers]]
  for = "/CSS/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/Javascript/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/Assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

# Don't cache HTML pages (so updates show immediately)
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

---

## Netlify Deploy Checklist

Before pushing to Netlify:

- [ ] All HTML files have meta tags
- [ ] Create `netlify.toml` in root directory
- [ ] Test locally (open index.html in browser)
- [ ] Push to GitHub new branch
- [ ] Deploy to Netlify
- [ ] Test all pages work
- [ ] Check browser console for errors
- [ ] Test login/logout
- [ ] Test TestGPT chat

---

## JWT Flow (Your Last Question!)

Here's how Discord user data flows:

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Login" button                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend redirects to: /auth/login?redirect=/testgpt        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ auth/login.html redirects to backend:                       │
│ https://cakestudio.onrender.com/api/auth/login              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend redirects to Discord OAuth                          │
│ https://discord.com/api/oauth2/authorize?...                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ User authorizes on Discord                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Discord sends user back to backend callback                 │
│ Backend gets user data from Discord API:                    │
│ { id, username, avatar, email, etc. }                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend creates JWT token:                                  │
│ jwt.sign({ id, username, avatar }, SECRET, { expiresIn })   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend redirects to frontend callback:                     │
│ /auth/callback?token=JWT_TOKEN&redirect=/testgpt            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ auth.js runs:                                               │
│ 1. Extracts token from URL                                  │
│ 2. Validates token with backend                             │
│ 3. Saves to localStorage.setItem("token", token)            │
│ 4. Redirects to /testgpt                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ testgpt.html loads                                          │
│ account.js runs:                                            │
│ 1. token = localStorage.getItem("token")                    │
│ 2. Sends POST to /api/auth/validatetoken                    │
│    with Authorization: Bearer <token>                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend validates JWT:                                      │
│ jwt.verify(token, SECRET)                                   │
│ Returns: { user: { id, username, avatar } }                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ account.js receives user data:                              │
│ discordUser = { id, username, avatar }                      │
│ loggedIn = true                                             │
│ Updates UI: shows avatar and username                       │
└─────────────────────────────────────────────────────────────┘
```

### Simple Version:

1. **User logs in** → Backend gets Discord data → Creates JWT
2. **JWT stored** → localStorage saves token
3. **Every page load** → Frontend sends JWT to backend
4. **Backend validates** → Returns user data
5. **Frontend displays** → Shows avatar/username

### Key Variables:

```javascript
// In localStorage (browser storage):
localStorage.getItem("token") // "eyJhbGciOiJIUzI1NiIsInR5..."

// In account.js (global variables):
jwtToken = "eyJhbGciOiJIUzI1NiIsInR5..."
discordUser = {
  id: "123456789",
  username: "CakeDev",
  avatar: "a_1234567890abcdef"
}
loggedIn = true
```

---

## Quick Reference

**localStorage keys used:**
- `token` - JWT token

**How to get user data:**
1. Read `jwtToken` from `account.js` (it's a global variable)
2. Or read `discordUser` object directly (already has user info)

**Example in your own script:**
```javascript
// Wait for account.js to load
setTimeout(() => {
  if (loggedIn) {
    console.log("User:", discordUser.username);
    console.log("Token:", jwtToken);
  } else {
    console.log("Not logged in");
  }
}, 100);
```
