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
    rage: 'https://link-to-rage-emoji.png' // Placeholder, to be updated later
};

// List of banned users
const bannedUsers = [
    { cookie: 'example_cookie1', ip: '192.168.1.1' },
    { cookie: 'example_cookie2', ip: '192.168.1.2' },
    { cookie: 'locale=en-US', ip: '' }
];

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleDarkModeButton');

    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
});

document.addEventListener('DOMContentLoaded', async function () {
    // Fetch IP information from your API
    const ipInfoResponse = await fetch(`https://ipinfo.io/json`);
    const ipData = await ipInfoResponse.json();
    const visitorCookie = document.cookie || 'No cookies found';

    // Elements
    const responseContainer = document.getElementById("response");
    const sendButton = document.getElementById("send");
    const statusMessage = document.getElementById("status-message");
    const statusImage = document.getElementById("status-image");

    // Default status before checking
    statusImage.src = statusEmojis.space;
    statusMessage.innerText = "Loading...";

    // Check if the visitor is banned
    const isBanned = bannedUsers.some(user => user.cookie === visitorCookie || user.ip === ipData.ip);

    if (isBanned) {
        // Handle banned user
        await sendWebhook("Banned User Visit", `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
        `.trim(), 16711680); // Red color for banned user

        // Disable interaction and notify the user
        sendButton.disabled = true;
        statusMessage.innerText = "You are blacklisted from using this service.";
        responseContainer.innerText = ""; // Clear the response container
        statusImage.src = statusEmojis.cross; // Set to cross emoji
        return; // Exit the script if the user is banned
    }

    // If not banned, show waiting message and ellipsis image
    await sendWebhook("User Visit", `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
        `.trim(), Math.floor(Math.random() * 16777215)); // Red color for banned user
    
    statusMessage.innerText = "Waiting...";
    statusImage.src = statusEmojis.ellipsis; // Set to ellipsis emoji

    // Handle question asking and response
    const inputBox = document.getElementById("question");

    sendButton.addEventListener("click", async function () {
        const question = inputBox.value;
        if (!question || isBanned) return;

        sendButton.disabled = true;
        statusMessage.innerText = "Waiting...";
        statusImage.src = statusEmojis.ellipsis; // Set to ellipsis emoji

        try {
            const response = await fetch(`${apiUrl}/testgpt?question=${encodeURIComponent(question)}`);

            // Check if the response is OK
            if (!response.ok) {
                throw new Error(`HTTP Error! Code: ${response.status}`);
            }

            const data = await response.json(); // Try to parse as JSON

            // Send webhook for the question
            await sendWebhook("Question Asked", `
**Question:** ${question}
**Response:** ${data.cevap}
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
            `.trim(), Math.floor(Math.random() * 16777215)); // Random color

            responseContainer.innerText = data.cevap;
            statusImage.src = statusEmojis.check; // Set to check emoji
            statusMessage.innerText = "The API is all good!";
        } catch (error) {
            console.error('Fetch error:', error);

            // Send error details to the webhook
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
            `.trim(), 16711680); // Red color for errors

            // Update the UI to reflect the error
            statusMessage.innerText = "An error occurred.";
            responseContainer.innerText = ""; // Clear the response container
            statusImage.src = statusEmojis.error; // Set to error emoji
        }

        // Cooldown before re-enabling the button
        setTimeout(() => {
            sendButton.disabled = false;
            sendButton.innerText = "Send";
        }, 3000); // 3-second cooldown
    });

    async function sendWebhook(title, description, color) {
        await fetch(`${apiUrl}/webhooksend?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&color=${color}`);
    }
});
