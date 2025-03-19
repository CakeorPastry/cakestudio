document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleDarkModeButton');

    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    function minorErrorMessageHandler(message) {
        const minorErrorMessage = document.getElementById("minorErrorMessage");

        if (!minorErrorMessage) { 
            return; 
        }

        minorErrorMessage.innerText = message;
        minorErrorMessage.parentNode.parentNode.style.display = "flex";
        sendButton.disabled = true;

        setTimeout(() => {
            sendButton.disabled = false;
            minorErrorMessage.parentNode.parentNode.style.display = "none";
        }, 3000);
    }

    function errorIndicatorImageHandler() {
        const errorIndicatorImage = document.getElementById("errorIndicatorImage");
        
        if (!errorIndicatorImage) { 
            return; 
        }

        // Step 1: Make the element visible and start fading in
        errorIndicatorImage.style.display = "inline-block";  
        setTimeout(() => {  
            errorIndicatorImage.style.opacity = 1; // Fade-in
        }, 10);

        // Step 2: After some time, start fading it out
        setTimeout(() => {
            errorIndicatorImage.style.opacity = 0; // Fade-out
        }, 1500); // This will happen 1.5 seconds after fade-in starts

        // Step 3: After the fade-out is complete (after 2.5 seconds), hide the element
        setTimeout(() => {
            errorIndicatorImage.style.display = "none"; // Hide after fade-out
        }, 2500); // Match this to the fade-out duration (opacity transition time)
    }
});
