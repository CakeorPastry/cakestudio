document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleDarkModeButton');

    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    function minorErrorMessageHandler(message) {
    const minorErrorMessage = document.getElementById("minorErrorMessage");
    
    if (!minorErrorMessage) { return; };

    minorErrorMessage.innerText = message;
    minorErrorMessage.parentNode.parentNode.style.display = "flex"
    sendButton.disabled = true;
    setTimeout(() => {
        sendButton.disabled = false;
        minorErrorMessage.parentNode.parentNode.style.display = "none";
    }, 3000)
}
});
