/* IP Logging Module */
/* Sends visitor IP to backend for logging */

/* Log visitor IP address to backend */
async function logVisitorIP() {
  const apiUrl = "https://cakestudio.onrender.com/api";
  try {
    /* Get token if it exists */
    const token = localStorage.getItem("token");

    /* Build headers */
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    /* POST to backend IP endpoint */
    await fetch(`${apiUrl}/ipinfo`, {
      method: 'POST',
      headers: headers
    });

    /* Backend logs IP to console, nothing else needed */
  } catch (err) {
    console.error('Failed to log IP:', err);
    /* Continue anyway - don't block the app */
  }
}

/* Auto-run on page load */
document.addEventListener("DOMContentLoaded", function() {
  logVisitorIP();
});
