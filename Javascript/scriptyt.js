const apiUrl = "https://cakestudio.onrender.com";

document.addEventListener("DOMContentLoaded", function() {
    const linkInput = document.getElementById("linkInput");
    const checkButton = document.getElementById("checkButton");
    const checkServerButton = document.getElementById("checkServerButton");
    const checkServerP = document.getElementById("checkServerP");
    let checkingLink = false;
    
    checkServerButton.addEventListener("click", async function() {
        checkServerButton.disabled = true;
        const originalBtnText = checkServerButton.innerText;
        const originalPText = checkServerP.innerText;
        checkServerButton.innerText = "...";
        checkServerP.innerText = "Checking if server is alive or dead...";
        
        const response = await fetch(apiUrl);
        if (response.ok) {
            checkServerP.innerText = "Server is alive.";
            checkServerButton.innerText = originalBtnText;
            setTimeout(() => {
                checkServerP.innerText = originalPText;
                checkServerButton.disabled = false;
            }, 5000);
        };
        
    });
    
    // Ignored
    linkInput.addEventListener("input", function() {
        checkButton.disabled = linkInput.value.trim() === "";
    });
    /*
    setInterval(() => {
        if (linkInput.value != "" && !checkingLink) {
            checkButton.disabled = false;
        }
        else {
            checkButton.disabled = true;
        }
    }, 16);
    */
});