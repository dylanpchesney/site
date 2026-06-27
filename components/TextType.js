/**
 * Vanilla JS port of React Bits TextType (https://reactbits.dev).
 * Uses GSAP for cursor blink animation.
 */
export default class TextType {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.container) {
      return;
    }

    this.gsap = typeof window.gsap !== 'undefined' ? window.gsap : null;
    this.options = {
      typingSpeed: 80,
      initialDelay: 0,
      pauseDuration: 2000,
      deletingSpeed: 30,
      loop: true,
      className: '',
      showCursor: true,
      hideCursorWhileTyping: false,
      cursorCharacter: '|',
      cursorClassName: '',
      cursorBlinkDuration: 0.5,
      textColors: [],
      variableSpeed: undefined,
      onSentenceComplete: undefined,
      startOnVisible: false,
      reverseMode: false,
      ...options,
    };

    const sourceText =
      this.options.text ??
      this.container.textContent?.trim() ??
      '';

    this.textArray = Array.isArray(sourceText) ? sourceText : [sourceText];
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.currentTextIndex = 0;
    this.isVisible = !this.options.startOnVisible;
    this.timeoutId = null;
    this.cursorTween = null;

    this.contentEl = null;
    this.cursorEl = null;

    this.init();
  }

  init() {
    const { className, showCursor, cursorCharacter, cursorClassName } = this.options;

    this.container.textContent = '';
    this.container.classList.add('text-type');
    if (className) {
      this.container.classList.add(className);
    }

    this.contentEl = document.createElement('span');
    this.contentEl.className = 'text-type__content';
    this.container.appendChild(this.contentEl);

    if (showCursor) {
      this.cursorEl = document.createElement('span');
      this.cursorEl.className = `text-type__cursor ${cursorClassName}`.trim();
      this.cursorEl.textContent = cursorCharacter;
      this.container.appendChild(this.cursorEl);
      this.startCursorBlink();
    }

    if (this.options.startOnVisible) {
      this.observeVisibility();
    } else {
      this.startTypingLoop();
    }
  }

  getRandomSpeed() {
    const { variableSpeed, typingSpeed } = this.options;
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }

  getCurrentTextColor() {
    const { textColors } = this.options;
    if (textColors.length === 0) return 'inherit';
    return textColors[this.currentTextIndex % textColors.length];
  }

  isElementInViewport() {
    const rect = this.container.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  observeVisibility() {
    const start = () => {
      if (this.isVisible) return;
      this.isVisible = true;
      this.startTypingLoop();
    };

    if (this.isElementInViewport()) {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            start();
          }
        });
      },
      { threshold: 0, rootMargin: '100px 0px' }
    );

    observer.observe(this.container);
  }

  startCursorBlink() {
    if (!this.cursorEl || !this.gsap) return;

    this.gsap.set(this.cursorEl, { opacity: 1 });
    this.cursorTween = this.gsap.to(this.cursorEl, {
      opacity: 0,
      duration: this.options.cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
  }

  updateCursorVisibility() {
    if (!this.cursorEl) return;

    const currentText = this.textArray[this.currentTextIndex];
    const shouldHide =
      this.options.hideCursorWhileTyping &&
      (this.currentCharIndex < currentText.length || this.isDeleting);

    this.cursorEl.classList.toggle('text-type__cursor--hidden', shouldHide);
  }

  render() {
    this.contentEl.textContent = this.displayedText;
    this.contentEl.style.color = this.getCurrentTextColor() || 'inherit';
    this.updateCursorVisibility();
  }

  schedule(nextDelay, callback) {
    this.clearTimeout();
    this.timeoutId = window.setTimeout(callback, nextDelay);
  }

  clearTimeout() {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  startTypingLoop() {
    this.render();
    this.runTypingStep(true);
  }

  runTypingStep(isInitial = false) {
    if (!this.isVisible) return;

    const {
      typingSpeed,
      deletingSpeed,
      pauseDuration,
      loop,
      initialDelay,
      reverseMode,
      variableSpeed,
      onSentenceComplete,
    } = this.options;

    const currentText = this.textArray[this.currentTextIndex];
    const processedText = reverseMode
      ? currentText.split('').reverse().join('')
      : currentText;

    const executeTypingAnimation = () => {
      if (this.isDeleting) {
        if (this.displayedText === '') {
          this.isDeleting = false;

          if (this.currentTextIndex === this.textArray.length - 1 && !loop) {
            this.render();
            return;
          }

          if (onSentenceComplete) {
            onSentenceComplete(this.textArray[this.currentTextIndex], this.currentTextIndex);
          }

          this.currentTextIndex = (this.currentTextIndex + 1) % this.textArray.length;
          this.currentCharIndex = 0;
          this.schedule(pauseDuration, () => this.runTypingStep());
        } else {
          this.schedule(deletingSpeed, () => {
            this.displayedText = this.displayedText.slice(0, -1);
            this.render();
            this.runTypingStep();
          });
        }
      } else if (this.currentCharIndex < processedText.length) {
        const delay = variableSpeed ? this.getRandomSpeed() : typingSpeed;
        this.schedule(delay, () => {
          this.displayedText += processedText[this.currentCharIndex];
          this.currentCharIndex += 1;
          this.render();
          this.runTypingStep();
        });
      } else if (this.textArray.length >= 1) {
        if (!loop && this.currentTextIndex === this.textArray.length - 1) {
          this.render();
          return;
        }

        this.schedule(pauseDuration, () => {
          this.isDeleting = true;
          this.runTypingStep();
        });
      }
    };

    if (isInitial && this.currentCharIndex === 0 && !this.isDeleting && this.displayedText === '') {
      this.schedule(initialDelay, executeTypingAnimation);
    } else {
      executeTypingAnimation();
    }
  }

  destroy() {
    this.clearTimeout();
    if (this.cursorTween) {
      this.cursorTween.kill();
    }
  }
}
