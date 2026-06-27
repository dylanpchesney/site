/**
 * Vanilla JS port of React Bits Magnet (https://reactbits.dev).
 * Pulls an element toward the cursor when the pointer is nearby.
 */
export default class Magnet {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.container) return;

    this.options = {
      padding: 100,
      disabled: false,
      magnetStrength: 2,
      activeTransition: 'transform 0.3s ease-out',
      inactiveTransition: 'transform 0.5s ease-in-out',
      wrapperClassName: '',
      innerClassName: '',
      ...options,
    };

    this.isActive = false;
    this.position = { x: 0, y: 0 };

    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.init();
  }

  init() {
    const { wrapperClassName, innerClassName, disabled } = this.options;

    this.wrapper = document.createElement('div');
    this.wrapper.className = ['magnet', wrapperClassName].filter(Boolean).join(' ');

    this.inner = document.createElement('div');
    this.inner.className = ['magnet__inner', innerClassName].filter(Boolean).join(' ');

    const parent = this.container.parentNode;
    parent.insertBefore(this.wrapper, this.container);
    this.inner.appendChild(this.container);
    this.wrapper.appendChild(this.inner);

    if (!disabled) {
      window.addEventListener('mousemove', this.handleMouseMove);
    }

    this.updateTransform();
  }

  handleMouseMove(e) {
    if (this.options.disabled || !this.wrapper) return;

    const { left, top, width, height } = this.wrapper.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const { padding, magnetStrength } = this.options;

    const distX = Math.abs(centerX - e.clientX);
    const distY = Math.abs(centerY - e.clientY);

    if (distX < width / 2 + padding && distY < height / 2 + padding) {
      this.isActive = true;
      this.position = {
        x: (e.clientX - centerX) / magnetStrength,
        y: (e.clientY - centerY) / magnetStrength,
      };
    } else {
      this.isActive = false;
      this.position = { x: 0, y: 0 };
    }

    this.updateTransform();
  }

  updateTransform() {
    const transition = this.isActive
      ? this.options.activeTransition
      : this.options.inactiveTransition;

    this.inner.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;
    this.inner.style.transition = transition;
    this.inner.style.willChange = 'transform';
  }

  destroy() {
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
}
