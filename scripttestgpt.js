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
    rage: 'https://link-to-rage-emoji.png', // Placeholder, to be updated later
    entry: 'https://cdn.discordapp.com/emojis/1267398812557774848.png',
    exit: 'https://cdn.discordapp.com/emojis/1267384023257321572.png'
};

// List of banned users
const bannedUsers = [
    { cookie: 'example_cookie1', ip: '192.168.1.1', discord_id: ''},
    { cookie: 'example_cookie2', ip: '192.168.1.2', discord_id: ''},
    { cookie: 'locale=en-US', ip: '', discord_id: '743429269207646299'}
];

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
    let userData;

    // Dark mode toggle functionality
    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Check if user is logged in
    if (!discordUser) {
        // User is not logged in, redirect to login
        window.location.href = `${apiUrl}/auth/discord`;
        return; // Exit the script to prevent further execution
    }

    userData = JSON.parse(discordUser); // Initialize userData
    const usernameElement = document.querySelector('.username');
    usernameElement.innerText = userData.username; // Update username
    const profilePicture = profileUI.querySelector('.profile-picture');
    profilePicture.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`; // Update profile picture

    // Enable logout button, disable login button
    logoutButton.disabled = false;
    loginButton.disabled = true;

    // Discord login functionality
    loginButton.addEventListener('click', function() {
        const discordLoginUrl = `${apiUrl}/auth/discord`;
        window.location.href = discordLoginUrl;
    });

    // Logout functionality
    logoutButton.addEventListener('click', async function() {
        // Send webhook for user logout
        await sendWebhook("User Logout", `
            **Discord User Data:** \`\`\`json
            ${JSON.stringify(userData)}
            \`\`\`
        `.trim(), Math.floor(Math.random() * 16777215)); // Random color for user logout

        // Remove user data from local storage
        localStorage.removeItem('discordUser');

        // Update the UI after logout
        updateUI();
        
        // Redirect to the desired URL
        window.location.href = 'https://cakeorpastry.netlify.app/testgpt';
    });

    // Update UI function
    function updateUI() {
        if (!localStorage.getItem('discordUser')) {
            logoutButton.disabled = true;
            loginButton.disabled = false;
            return; // Exit if user is not logged in
        }

        userData = JSON.parse(localStorage.getItem('discordUser')); // Refresh user data
        usernameElement.innerText = userData.username; // Update username
        profilePicture.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`; // Update profile picture

        // Enable logout button, disable login button
        logoutButton.disabled = false;
        loginButton.disabled = true;
    }

    // Fetch IP information from your API
    const ipInfoResponse = await fetch(`https://ipinfo.io/json`);
    const ipData = await ipInfoResponse.json();
    const visitorCookie = document.cookie || 'No cookies found';

    // Default status before checking
    sendButton.disabled = true;
    statusImage.src = statusEmojis.space;
    statusMessage.innerText = "Loading...";
    
    // Handle banned users
    const isBanned = bannedUsers.some(user =>
        user.cookie === visitorCookie || 
        user.ip === ipData.ip || 
        (user.discord_id && user.discord_id === userData.id)
    );

    if (isBanned) {
        await sendWebhook("Banned User Visit", `
            **IP:** ${ipData.ip}
            **Cookies:** ${visitorCookie}
            **Discord User Data:** \`\`\`json
            ${JSON.stringify(userData)}
            \`\`\`
        `.trim(), 16711680); // Red color for banned user

        // Disable interaction and notify the user
        sendButton.disabled = true;
        statusMessage.innerText = "You are blacklisted from using this service.";
        responseContainer.innerText = ""; // Clear the response container
        statusImage.src = statusEmojis.cross; // Set to cross emoji
        return; // Exit the script if the user is banned
    }

    // Enable interaction and show waiting message
    statusMessage.innerText = "Waiting...";
    statusImage.src = statusEmojis.ellipsis;
    loginButton.disabled = false;
    logoutButton.disabled = false;

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

            const data = await response.json();

            // Check if there's an error field in the response
            if (data.error) {
                throw new Error(data.error);
            }

            // Send webhook for the question
            await sendWebhook("Question Asked", `
                **Question:** ${question}
                **Response:** ${data.cevap}
                **IP:** ${ipData.ip}
                **Cookies:** ${visitorCookie}
                **Discord User Data:** \`\`\`json
                ${JSON.stringify(userData)}
                \`\`\`
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
                **Cookies:** ${visitorCookie}
                **Discord User Data:** \`\`\`json
                ${JSON.stringify(userData)}
                \`\`\`
            `.trim(), 16711680); // Red color for errors

            // Update the UI to reflect the error
            statusMessage.innerText = "An error occurred. Please try again later. If this error persists, inform the developer.";
            responseContainer.innerText = ""; // Clear the response container
            statusImage.src = statusEmojis.error; // Set to error emoji
        }

        // Cooldown before re-enabling the button
        setTimeout(() => {
            sendButton.disabled = false;
            sendButton.innerText = "Send";
        }, 3000); // 3-second cooldown
    });

    // Copy to clipboard functionality
    const copyButton = document.getElementById('copyResponseToClipboard');
    copyButton.addEventListener('click', function() {
        const textToCopy = responseContainer.innerText; // Get the text from the <P> element
        if (textToCopy) {
            copyButton.disabled = true; // Disable the button
            const originalText = copyButton.innerText; // Store original button text
            copyButton.innerText = "Copied!"; // Change button text

            navigator.clipboard.writeText(textToCopy).then(() => {
                // Cooldown before re-enabling the button
                setTimeout(() => {
                    copyButton.innerText = originalText; // Restore original text
                    copyButton.disabled = false; // Re-enable the button
                }, 3000); // 3-second cooldown
            }).catch(err => {
                console.error('Could not copy text: ', err);
                // Re-enable the button in case of an error
                copyButton.innerText = originalText; 
                copyButton.disabled = false; 
            });
        } else {
            alert('No response to copy.');
        }
    });

    async function sendWebhook(title, description, color) {
        await fetch(`${apiUrl}/webhooksend?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&color=${color}`);
    }
});