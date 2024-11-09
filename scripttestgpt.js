// Base API URL
const apiUrl = 'https://cakestudio.onrender.com/api';
// Emoji list
const statusEmojis = {
    check: 'https://cdn.discordapp.com/emojis/1218461285746741350.png',
    empty: 'https://cdn.discordapp.com/emojis/1218461482543484929.png',
    cross: 'https://cdn.discordapp.com/emojis/1218461700198633523.png',
    warning: 'https://cdn.discordapp.com/emojis/1271705073650503680.png',
    yellowAlert: 'https://cdn.discordapp.com/emojis/1271705121859833856.png',
    orangeAlert: 'https://cdn.discordapp.com/emojis/1271705220736483378.png',
    error: 'https://cdn.discordapp.com/emojis/1271705264038346813.png',
    space: 'https://cdn.discordapp.com/emojis/1273231578402918401.png',
    ellipsis: 'https://cdn.discordapp.com/emojis/1285189210835390534.png',
    rage: 'https://em-content.zobj.net/source/twitter/408/pouting-face_1f621.png',
    user: 'https://cdn.discordapp.com/emojis/1285189009722839060.png',
    entry: 'https://cdn.discordapp.com/emojis/1267398812557774848.png',
    exit: 'https://cdn.discordapp.com/emojis/1267384023257321572.png',
    LOL: 'https://cdn.discordapp.com/emojis/1267385971352145950.png'
};
// List of banned users
const bannedUsers = [{
    cookie: 'example_cookie1',
    ip: '192.168.1.1',
    discord_id: ''
},
{
    cookie: 'example_cookie2',
    ip: '192.168.1.2',
    discord_id: ''
},
{
    cookie: 'locale=en-US',
    ip: '',
    discord_id: '743429269207646299'
}];
document.addEventListener('DOMContentLoaded', async function() {
    const toggleButton = document.getElementById('toggleDarkModeButton');
    const sendButton = document.getElementById("send");
    const responseContainer = document.getElementById("response");
    const statusMessage = document.getElementById("status-message");
    const statusImage = document.getElementById("status-image");
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");
    const profileUI = document.querySelector('.profile-ui');
    const discordUser = localStorage.getItem('discordUser');
    const jwtToken = localStorage.getItem('jwtToken'); // Get JWT token from localStorage
    const userData = discordUser ? JSON.parse(discordUser) : null;
    const userDataFormatted = userData ? `ID: ${userData.id}\nUsername: ${userData.username}\nEmail: ${userData.email}` : 'No user data';
    let loggedIn = !!jwtToken; // If JWT token exists, user is logged in

    // Dark mode toggle functionality
    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Fetch IP information from your API
    const ipInfoResponse = await fetch(`https://ipinfo.io/json`);
    const ipData = await ipInfoResponse.json();
    const visitorCookie = document.cookie || 'No cookies found';

    // Default status before checking
    statusImage.src = statusEmojis.space;
    statusMessage.innerText = "Loading...";
    loginButton.disabled = true;
    logoutButton.disabled = true;

    // Check if the visitor is banned
    const isBanned = bannedUsers.some(user => user.cookie === visitorCookie || user.ip === ipData.ip);
    if (isBanned) {
        await sendWebhook("Banned User Visit", `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
**Discord User Data:** \`\`\`py
${userDataFormatted}
\`\`\`
`, 16711680); // Red color for banned user
        sendButton.disabled = true;
        statusMessage.innerText = "You are blacklisted from using this service.";
        responseContainer.innerText = "";
        statusImage.src = statusEmojis.rage;
        return;
    }

    await sendWebhook("User Visit", `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
**Discord User Data:** \`\`\`py
${userDataFormatted}
\`\`\`
`, Math.floor(Math.random() * 16777215)); // Random color for user visit;
    statusMessage.innerText = "Waiting...";
    statusImage.src = statusEmojis.ellipsis;
    loginButton.disabled = false;
    logoutButton.disabled = false;

    // Handle question asking and response
    const inputBox = document.getElementById("question");
    sendButton.addEventListener("click", async function() {
        const question = inputBox.value;
        if (!question || !loggedIn) return; // Don't proceed if not logged in
        sendButton.disabled = true;
        statusMessage.innerText = "Waiting...";
        statusImage.src = statusEmojis.ellipsis;

        try {
            const response = await fetch(`${apiUrl}/testgpt?question=${encodeURIComponent(question)}`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}` // Add JWT token to the request header
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Code: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            await sendWebhook("Question Asked", `
**Question:** ${question}
**Response:** ${data.reply}
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
**Discord User Data:** \`\`\`py
${userDataFormatted}
\`\`\`
`, Math.floor(Math.random() * 16777215)); // Random color
            responseContainer.innerText = data.reply;
            statusImage.src = statusEmojis.check;
            statusMessage.innerText = "The API is all good!";
        } catch (error) {
            console.error('Fetch error:', error);
            await sendWebhook("Fetch Error", `
**Question:** ${question}
**Error Message:** ${error.message}
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
**Discord User Data:** \`\`\`py
${userDataFormatted}
\`\`\`
`, 16711680); // Red color for errors
            statusMessage.innerText = `An error occurred. Please try again later. Error Message : ${error.message}`;
            responseContainer.innerText = "";
            statusImage.src = statusEmojis.error;
        }

        // Cooldown before re-enabling the button
        setTimeout(() => {
            sendButton.disabled = false;
            sendButton.innerText = "Send";
        }, 3000); // 3-second cooldown
    });

    // Discord login functionality
    loginButton.addEventListener('click', function() {
        const discordLoginUrl = `${apiUrl}/auth/discord`;
        window.location.href = discordLoginUrl;
    });

    // Logout functionality with JWT
    logoutButton.addEventListener('click', async function() {
        await sendWebhook("User Logout", `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
**Discord User Data:** \`\`\`py
${userDataFormatted}
\`\`\`
`, Math.floor(Math.random() * 16777215)); // Random color
        localStorage.removeItem('discordUser');
        localStorage.removeItem('jwtToken'); // Remove the JWT token on logout
        loggedIn = false;
        updateUI();
        window.location.href = 'https://cakeorpastry.netlify.app/testgpt';
    });

// Function to update UI based on login status
async function updateUI() {
    if (discordUser && jwtToken) {
        const usernameElement = document.querySelector('.username');
        usernameElement.innerText = userData.username;
        const profilePicture = profileUI.querySelector('.profile-picture');
        profilePicture.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`;
        logoutButton.disabled = false;
        loginButton.disabled = true;
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token') || localStorage.getItem('jwtToken'); // Try token from URL or localStorage

        if (tokenParam) {
            try {
                const response = await fetch(`${apiUrl}/auth/validatetoken`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${tokenParam}`, // Send token in Authorization header
                    },
                });
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                localStorage.setItem('discordUser', JSON.stringify(data.user));
                localStorage.setItem('jwtToken', data.token); // Store JWT token
                loggedIn = true;
                
                await sendWebhook("User Login", `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
**Discord User Data:** \`\`\`py
${userDataFormatted}
\`\`\`
`, Math.floor(Math.random() * 16777215)); // Random color
                
                updateUI(); // Update the UI after successful login
                window.location.href = 'https://cakeorpastry.netlify.app/testgpt';
            } catch (error) {
                console.error("Invalid token or tampering detected:", error);
                localStorage.removeItem('discordUser');
                localStorage.removeItem('jwtToken');
                alert(`Invalid login, please try again. Error: ${error}`);
            }
        } else {
            logoutButton.disabled = true;
            loginButton.disabled = false;
            sendButton.disabled = true;
            loggedIn = false;
            statusMessage.innerText = "You need to login to use this service.";
            statusImage.src = statusEmojis.LOL;
        }
    }
}

// Initial UI setup
updateUI(); // Check and update UI on page load

    // Copy to clipboard functionality
    const copyButton = document.getElementById('copyResponseToClipboard');
    copyButton.addEventListener('click', function() {
        const textToCopy = responseContainer.innerText;
        if (textToCopy) {
            copyButton.disabled = true;
            const originalText = copyButton.innerText;
            copyButton.innerText = "Copied!";
            navigator.clipboard.writeText(textToCopy).then(() => {
                setTimeout(() => {
                    copyButton.innerText = originalText;
                    copyButton.disabled = false;
                }, 3000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
                copyButton.innerText = originalText;
                copyButton.disabled = false;
            });
        } else {
            alert('No response to copy.');
        }
    });

    // sendWebhook function
    async function sendWebhook(title, description, color) {
        await fetch(`${apiUrl}/webhooksend?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&color=${color}`);
    }
});