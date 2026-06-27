/**
 * Vanilla JS port of React Bits ClickSpark (https://reactbits.dev).
 * Draws animated spark lines from canvas on click.
 */
export default class ClickSpark {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.container) return;

    this.options = {
      sparkColor: '#fff',
      sparkSize: 10,
      sparkRadius: 15,
      sparkCount: 8,
      duration: 400,
      easing: 'ease-out',
      extraScale: 1.0,
      ...options,
    };

    this.sparks = [];
    this.animationId = null;
    this.resizeTimeout = null;

    this.handleClick = this.handleClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.draw = this.draw.bind(this);

    this.init();
  }

  easeFunc(t) {
    switch (this.options.easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t * (2 - t);
    }
  }

  init() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'click-spark';

    const parent = this.container.parentNode;
    parent.insertBefore(this.wrapper, this.container);
    this.wrapper.appendChild(this.container);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'click-spark__canvas';
    this.wrapper.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.wrapper.addEventListener('click', this.handleClick);

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.wrapper);
    this.resizeCanvas();

    this.animationId = requestAnimationFrame(this.draw);
  }

  resizeCanvas() {
    const { width, height } = this.wrapper.getBoundingClientRect();
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.resizeCanvas(), 100);
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();
    const { sparkCount } = this.options;

    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
    }));

    this.sparks.push(...newSparks);
  }

  draw(timestamp) {
    const { sparkColor, sparkSize, sparkRadius, duration, extraScale } = this.options;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.sparks = this.sparks.filter((spark) => {
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= duration) {
        return false;
      }

      const progress = elapsed / duration;
      const eased = this.easeFunc(progress);
      const distance = eased * sparkRadius * extraScale;
      const lineLength = sparkSize * (1 - eased);

      const x1 = spark.x + distance * Math.cos(spark.angle);
      const y1 = spark.y + distance * Math.sin(spark.angle);
      const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
      const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

      this.ctx.strokeStyle = sparkColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();

      return true;
    });

    this.animationId = requestAnimationFrame(this.draw);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    clearTimeout(this.resizeTimeout);
    this.wrapper.removeEventListener('click', this.handleClick);
  }
}
