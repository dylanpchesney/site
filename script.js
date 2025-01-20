const toggle = document.createElement('button');
toggle.textContent = 'Toggle Dark Mode';
document.body.prepend(toggle);

toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});