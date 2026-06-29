import TextType from './components/TextType.js';
import BlurText from './components/BlurText.js';
import { initPageEffects } from './components/initPageEffects.js';

document.addEventListener('DOMContentLoaded', () => {
  const { reducedMotion } = initPageEffects({ mainSelector: '.home-main' });

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
});
