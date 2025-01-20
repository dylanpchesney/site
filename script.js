const toggle = document.createElement('button');
toggle.textContent = 'Toggle Dark Mode';
document.body.prepend(toggle);

toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Add CSS for dark mode in style.css
/* .dark-mode {
    background-color: #333;
    color: #fff;
} */