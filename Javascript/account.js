/* Global Configuration */
const apiUrl = "https://cakestudio.onrender.com/api";
const frontendUrl = "https://cakeorpastry.netlify.app";
const path = window.location.pathname;

/* Global Variables */
let jwtToken = localStorage.getItem("token");
let discordUser = null;
let loggedIn = false;

/* Initialize Authentication on Page Load */
document.addEventListener("DOMContentLoaded", async function() {
  const profilePicture = document.getElementById("profilePicture");
  const username = document.getElementById("username");
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  /* Validate token if it exists */
  if (jwtToken) {
    try {
      const response = await fetch(`${apiUrl}/auth/validatetoken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Token validation failed: ${response.status}`);
      }

      const data = await response.json();
      discordUser = data.user;
      loggedIn = true;

      updateUI();
    } catch (err) {
      console.error('Authentication error:', err.message);
      /* Clear invalid token */
      localStorage.removeItem("token");
      jwtToken = null;
      loggedIn = false;
      discordUser = null;

      updateUI();
    }
  } else {
    loggedIn = false;
    updateUI();
  }

  /* Set up button event listeners */
  if (loginButton) {
    loginButton.addEventListener("click", login);
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
});

/* Update UI based on login state */
function updateUI() {
  const profilePicture = document.getElementById("profilePicture");
  const username = document.getElementById("username");
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  if (loggedIn && discordUser) {
    /* User is logged in */
    if (loginButton) loginButton.disabled = true;
    if (logoutButton) logoutButton.disabled = false;

    if (profilePicture) {
      profilePicture.src = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`;
    }

    if (username) {
      username.innerText = discordUser.username;
    }
  } else {
    /* User is not logged in */
    if (loginButton) loginButton.disabled = false;
    if (logoutButton) logoutButton.disabled = true;

    if (profilePicture) {
      profilePicture.src = "https://cdn.discordapp.com/emojis/1285189009722839060.png";
    }

    if (username) {
      username.innerText = "Guest";
    }
  }
}

/* Redirect to login page */
function login() {
  window.location.href = `${frontendUrl}/auth/login?redirect=${encodeURIComponent(path)}`;
}

/* Redirect to logout page */
function logout() {
  window.location.href = `${frontendUrl}/auth/logout?redirect=${encodeURIComponent(path)}`;
}
