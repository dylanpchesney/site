import TextType from './components/TextType.js';
import ScrollFloat from './components/ScrollFloat.js';

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

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
    new ScrollFloat(intro, {
      text: intro.textContent.trim(),
      animationDuration: 1,
      ease: 'back.inOut(2)',
      scrollStart: 'center bottom+=50%',
      scrollEnd: 'bottom bottom-=40%',
      stagger: 0.03,
    });
  }
});
