document.addEventListener("DOMContentLoaded", function() {
    const inputBox = document.getElementById("question");
    const sendButton = document.getElementById("send");
    const responseContainer = document.getElementById("response");

    sendButton.addEventListener("click", async function() {
        const question = inputBox.value;
        if (!question) return;

        sendButton.disabled = true;
        sendButton.innerText = "..."; // Change button text during loading

        const startTime = Date.now();
        const response = await fetch(`https://tilki.dev/api/hercai?soru=${encodeURIComponent(question)}`);
        const data = await response.json();
        const endTime = Date.now();

        const timeTaken = endTime - startTime;
        const formattedTime = formatDuration(timeTaken);

        // Generate a random color in decimal format (Discord expects an integer)
        const randomColor = Math.floor(Math.random() * 16777215); // Random color as a decimal number

        const embedMessage = {
            title: "API Used",
            description: `
**Question:** ${question}

**Response:** ${data.cevap}

**Time taken to respond:** ${formattedTime}
            `.trim(),
            color: randomColor // Random color in decimal (integer format)
        };

        // Send embed message to webhook
        await sendWebhook(embedMessage);

        responseContainer.innerText = data.cevap;
        sendButton.disabled = false;
        sendButton.innerText = "Send"; // Reset button text
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
