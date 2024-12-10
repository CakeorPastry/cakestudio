document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleDarkModeButton');

    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
});
