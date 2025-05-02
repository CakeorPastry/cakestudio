// Now, the DOMContentLoaded event listener can remain as it is, 
// but it doesn't need to define the functions anymore
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleDarkModeButton');

    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
});