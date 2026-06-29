import ClickSpark from './ClickSpark.js';
import Magnet from './Magnet.js';

const DEFAULT_SPARK_OPTIONS = {
  sparkColor: '#fff',
  sparkSize: 10,
  sparkRadius: 15,
  sparkCount: 8,
  duration: 400,
};

const DEFAULT_MAGNET_OPTIONS = {
  padding: 50,
  magnetStrength: 6,
};

/**
 * Shared homepage-style interactions for marketing pages:
 * click sparks on the page shell and magnetic footer links.
 */
export function initPageEffects({
  mainSelector,
  footerSelector = '.home-footer',
  magnetSelector = '.home-footer__nav a',
  sparkOptions = DEFAULT_SPARK_OPTIONS,
  magnetOptions = DEFAULT_MAGNET_OPTIONS,
} = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!mainSelector) {
    return { reducedMotion };
  }

  const main = document.querySelector(mainSelector);
  const footer = document.querySelector(footerSelector);

  if (main) {
    const pageShell = document.createElement('div');
    pageShell.className = 'click-spark-page';
    document.body.insertBefore(pageShell, main);
    pageShell.appendChild(main);
    if (footer) pageShell.appendChild(footer);

    if (!reducedMotion) {
      new ClickSpark(pageShell, sparkOptions);
    }
  }

  document.querySelectorAll(magnetSelector).forEach((link) => {
    new Magnet(link, magnetOptions);
  });

  return { reducedMotion };
}
