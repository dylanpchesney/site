/**
 * Vanilla JS port of React Bits ScrollFloat (https://reactbits.dev).
 * Uses GSAP ScrollTrigger for scroll-scrubbed character animation.
 */
export default class ScrollFloat {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (
      !this.container ||
      typeof window.gsap === 'undefined' ||
      typeof window.ScrollTrigger === 'undefined'
    ) {
      return;
    }

    this.gsap = window.gsap;
    this.ScrollTrigger = window.ScrollTrigger;
    this.gsap.registerPlugin(this.ScrollTrigger);

    this.options = {
      text: '',
      scrollContainer: null,
      containerClassName: '',
      textClassName: '',
      animationDuration: 1,
      ease: 'back.inOut(2)',
      scrollStart: 'center bottom+=50%',
      scrollEnd: 'bottom bottom-=40%',
      stagger: 0.03,
      ...options,
    };

    this.tween = null;

    this.init();
  }

  init() {
    const {
      text,
      scrollContainer,
      containerClassName,
      textClassName,
      animationDuration,
      ease,
      scrollStart,
      scrollEnd,
      stagger,
    } = this.options;

    const sourceText = text || this.container.textContent.trim();

    this.container.textContent = '';
    this.container.classList.add('scroll-float');
    if (containerClassName) {
      this.container.classList.add(...containerClassName.split(/\s+/).filter(Boolean));
    }

    const textEl = document.createElement('span');
    textEl.className = `scroll-float-text ${textClassName}`.trim();

    sourceText.split('').forEach((char) => {
      const charEl = document.createElement('span');
      charEl.className = 'char';
      charEl.textContent = char === ' ' ? '\u00A0' : char;
      textEl.appendChild(charEl);
    });

    this.container.appendChild(textEl);

    const scroller = scrollContainer || window;
    const charElements = this.container.querySelectorAll('.char');

    this.tween = this.gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%',
      },
      {
        duration: animationDuration,
        ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger,
        scrollTrigger: {
          trigger: this.container,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
        },
      }
    );
  }

  destroy() {
    if (this.tween) {
      const scrollTrigger = this.tween.scrollTrigger;
      this.tween.kill();
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
    }
  }
}
