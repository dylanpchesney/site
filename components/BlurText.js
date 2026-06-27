/**
 * Vanilla JS port of React Bits BlurText (https://reactbits.dev).
 * Uses GSAP for blur / fade-in animations.
 */
export default class BlurText {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.container) return;

    this.gsap = typeof window.gsap !== 'undefined' ? window.gsap : null;
    this.options = {
      text: '',
      delay: 200,
      className: '',
      animateBy: 'words',
      direction: 'top',
      threshold: 0.1,
      rootMargin: '0px',
      stepDuration: 0.35,
      onAnimationComplete: undefined,
      ...options,
    };

    this.spans = [];
    this.observer = null;
    this.timelines = [];
    this.started = false;

    this.init();
  }

  init() {
    const { className, animateBy } = this.options;
    const text = this.options.text || this.container.textContent?.trim() || '';
    const segments = animateBy === 'words' ? text.split(' ') : text.split('');

    this.container.textContent = '';
    this.container.classList.add('blur-text');
    if (className) {
      this.container.classList.add(className);
    }

    segments.forEach((segment, index) => {
      const span = document.createElement('span');
      span.className = 'blur-text__segment';
      span.textContent = segment === ' ' ? '\u00A0' : segment;

      if (animateBy === 'words' && index < segments.length - 1) {
        span.append(document.createTextNode('\u00A0'));
      }

      this.container.appendChild(span);
      this.spans.push(span);
    });

    if (!this.gsap) {
      this.revealImmediately();
      return;
    }

    this.setInitialState();
    this.observeVisibility();
  }

  getDefaultFrom() {
    return this.options.direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, y: -50 }
      : { filter: 'blur(10px)', opacity: 0, y: 50 };
  }

  getDefaultToSteps() {
    const midY = this.options.direction === 'top' ? 5 : -5;
    return [
      { filter: 'blur(5px)', opacity: 0.5, y: midY },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ];
  }

  setInitialState() {
    const from = this.getDefaultFrom();
    this.spans.forEach((span) => {
      this.gsap.set(span, from);
    });
  }

  revealImmediately() {
    this.spans.forEach((span) => {
      span.style.filter = 'none';
      span.style.opacity = '1';
      span.style.transform = 'none';
    });
    this.options.onAnimationComplete?.();
  }

  isInViewport() {
    const rect = this.container.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  observeVisibility() {
    const start = () => {
      if (this.started) return;
      this.started = true;
      this.animate();
    };

    if (this.isInViewport()) {
      start();
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.observer?.disconnect();
          start();
        }
      },
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin,
      }
    );

    this.observer.observe(this.container);
  }

  animate() {
    const { delay, stepDuration, onAnimationComplete } = this.options;
    const from = this.getDefaultFrom();
    const steps = this.getDefaultToSteps();

    this.spans.forEach((span, index) => {
      const timeline = this.gsap.timeline({
        delay: (index * delay) / 1000,
        onComplete:
          index === this.spans.length - 1 ? onAnimationComplete : undefined,
      });

      timeline.set(span, from);

      steps.forEach((step) => {
        timeline.to(span, {
          ...step,
          duration: stepDuration,
          ease: 'power2.out',
        });
      });

      this.timelines.push(timeline);
    });
  }

  destroy() {
    this.observer?.disconnect();
    this.timelines.forEach((timeline) => timeline.kill());
  }
}
