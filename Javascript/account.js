const apiUrl = "https://cakestudio.onrender.com/api";
const jwtToken = localStorage.getItem("token");
let discordUser;
let loggedIn = false;

document.addEventListener("DOMContentLoaded", async function() {
    const profileInfo = document.getElementById("profile-info");
    const profilePicture = document.getElementById("profilePicture");
    const username = document.getElementById("username");
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");
    
    if (jwtToken) {
        try {
            const response = await fetch(`${apiUrl}/auth/validatetoken?token=${jwtToken}`);
            
            if (response.status === 401) {
                throw {
                    status: response.status, 
                    message: "Your login session has expired."
                };
            }
            const data = await response.json();
            discordUser = data.user;
            loggedIn = true;
            window.dispatchEvent(new Event('discordUserLoaded'));
            loginButton.disabled = true;
            logoutButton.disabled = false;
            updateUI();
        } catch (err) {
            console.error(`Error Message : ${err.message}\nHTTP Status Code : ${err.status}`);
            loggedIn = false;
            window.dispatchEvent(new Event('discordUserLoaded'));
            loginButton.disabled = false;
            logoutButton.disabled = true;
            updateUI();
        }
    }
    else {
        loggedIn = false;
        loginButton.disabled = false;
        logoutButton.disabled = true;
        updateUI();
    };

    
});

async function updateUI() {
    if (loggedIn) {
        loginButton.disabled = true;
        logoutButton.disabled = false;
        profilePicture.src = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}`;
        username.innerText = discordUser.username;
    }
    else {
            loginButton.disabled = false;
            logoutButton.disabled = true;
            profilePicture.src = "https://cdn.discordapp.com/emojis/1285189009722839060.png";
            username.innerText = "Username";
    }
// window.dispatchEvent(new Event("updatedUI"));
}
    
async function login() {
    window.location.href = "https://cakeorpastry.netlify.app/auth/login";
}
    
async function logout() {
    window.location.href = "https://cakeorpastry.netlify.app/auth/logout";
}
