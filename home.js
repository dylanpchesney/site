import TextType from './components/TextType.js';
import ClickSpark from './components/ClickSpark.js';
import Magnet from './components/Magnet.js';

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const main = document.querySelector('.home-main');
  const footer = document.querySelector('.home-footer');
  if (main) {
    const pageShell = document.createElement('div');
    pageShell.className = 'click-spark-page';
    document.body.insertBefore(pageShell, main);
    pageShell.appendChild(main);
    if (footer) pageShell.appendChild(footer);

    new ClickSpark(pageShell, {
      sparkColor: '#fff',
      sparkSize: 10,
      sparkRadius: 15,
      sparkCount: 8,
      duration: 400,
    });
  }

  const title = document.querySelector('.home-title');
  if (title) {
    new TextType(title, {
      text: title.textContent.trim(),
      loop: false,
      typingSpeed: 45,
      pauseDuration: 3600,
      deletingSpeed: 20,
      showCursor: true,
      cursorCharacter: '|',
      cursorBlinkDuration: 1.3,
      startOnVisible: true,
    });
  }

  const intro = document.querySelector('.home-intro-text');
  if (intro) {
    new TextType(intro, {
      text: intro.textContent.trim(),
      loop: false,
      typingSpeed: 22,
      pauseDuration: 3600,
      deletingSpeed: 20,
      showCursor: true,
      cursorCharacter: '|',
      cursorBlinkDuration: 1.3,
      startOnVisible: true,
    });
  }

  document.querySelectorAll('.home-footer__nav a').forEach((link) => {
    new Magnet(link, {
      padding: 50,
      magnetStrength: 6,
    });
  });
});
