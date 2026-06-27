import TextType from './components/TextType.js';
import BlurText from './components/BlurText.js';
import ClickSpark from './components/ClickSpark.js';
import Magnet from './components/Magnet.js';

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const main = document.querySelector('.home-main');
  const footer = document.querySelector('.home-footer');
  if (main) {
    const pageShell = document.createElement('div');
    pageShell.className = 'click-spark-page';
    document.body.insertBefore(pageShell, main);
    pageShell.appendChild(main);
    if (footer) pageShell.appendChild(footer);

    if (!reducedMotion) {
      new ClickSpark(pageShell, {
        sparkColor: '#fff',
        sparkSize: 10,
        sparkRadius: 15,
        sparkCount: 8,
        duration: 400,
      });
    }
  }

  const title = document.querySelector('.home-title');
  if (title && !reducedMotion) {
    new TextType(title, {
      text: title.textContent.trim(),
      loop: false,
      typingSpeed: 45,
      pauseDuration: 3600,
      deletingSpeed: 20,
      showCursor: true,
      cursorCharacter: '|',
      cursorBlinkDuration: 1.3,
      startOnVisible: false,
    });
  }

  const intro = document.querySelector('.home-intro-text');
  if (intro && !reducedMotion) {
    new BlurText(intro, {
      text: intro.textContent.trim(),
      delay: 150,
      animateBy: 'words',
      direction: 'top',
      threshold: 0.1,
      rootMargin: '0px',
      stepDuration: 0.35,
    });
  }

  document.querySelectorAll('.home-footer__nav a').forEach((link) => {
    new Magnet(link, {
      padding: 50,
      magnetStrength: 6,
    });
  });
});
