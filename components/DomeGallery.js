/**
 * Vanilla JS port of React Bits DomeGallery (https://reactbits.dev).
 * 3D draggable photo dome with click-to-enlarge.
 */
const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};

function getDataNumber(el, name, fallback) {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
}

function buildItems(pool, seg) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map((c) => ({ ...c, src: '', alt: '' }));
  }
  if (pool.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
    );
  }

  const normalizedImages = pool.map((image) => {
    if (typeof image === 'string') {
      return { src: image, alt: '' };
    }
    return { src: image.src || '', alt: image.alt || '' };
  });

  const usedImages = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length]
  );

  for (let i = 1; i < usedImages.length; i += 1) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j += 1) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default class DomeGallery {
  constructor(container, options = {}) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.container) return;

    this.options = {
      images: [],
      fit: 0.5,
      fitBasis: 'auto',
      minRadius: 600,
      maxRadius: Infinity,
      padFactor: 0.25,
      overlayBlurColor: '#5c7380',
      maxVerticalRotationDeg: DEFAULTS.maxVerticalRotationDeg,
      dragSensitivity: DEFAULTS.dragSensitivity,
      enlargeTransitionMs: DEFAULTS.enlargeTransitionMs,
      segments: DEFAULTS.segments,
      dragDampening: 2,
      openedImageWidth: '250px',
      openedImageHeight: '350px',
      imageBorderRadius: '30px',
      openedImageBorderRadius: '30px',
      grayscale: true,
      ...options,
    };

    this.rotation = { x: 0, y: 0 };
    this.startRot = { x: 0, y: 0 };
    this.startPos = null;
    this.dragging = false;
    this.moved = false;
    this.inertiaRAF = null;
    this.opening = false;
    this.openStartedAt = 0;
    this.lastDragEndAt = 0;
    this.scrollLocked = false;
    this.lockedRadius = null;
    this.focusedEl = null;
    this.originalTilePosition = null;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onScrimClick = this.onScrimClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onTileClick = this.onTileClick.bind(this);
    this.onTilePointerUp = this.onTilePointerUp.bind(this);

    this.init();
  }

  init() {
    const { segments, overlayBlurColor, imageBorderRadius, openedImageBorderRadius, grayscale } =
      this.options;

    this.items = buildItems(this.options.images, segments);

    this.rootEl = document.createElement('div');
    this.rootEl.className = 'sphere-root';
    this.rootEl.style.setProperty('--segments-x', segments);
    this.rootEl.style.setProperty('--segments-y', segments);
    this.rootEl.style.setProperty('--overlay-blur-color', overlayBlurColor);
    this.rootEl.style.setProperty('--tile-radius', imageBorderRadius);
    this.rootEl.style.setProperty('--enlarge-radius', openedImageBorderRadius);
    this.rootEl.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');

    this.mainEl = document.createElement('main');
    this.mainEl.className = 'sphere-main';

    const stage = document.createElement('div');
    stage.className = 'stage';

    this.sphereEl = document.createElement('div');
    this.sphereEl.className = 'sphere';

    this.items.forEach((it, i) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.dataset.src = it.src;
      item.dataset.offsetX = it.x;
      item.dataset.offsetY = it.y;
      item.dataset.sizeX = it.sizeX;
      item.dataset.sizeY = it.sizeY;
      item.style.setProperty('--offset-x', it.x);
      item.style.setProperty('--offset-y', it.y);
      item.style.setProperty('--item-size-x', it.sizeX);
      item.style.setProperty('--item-size-y', it.sizeY);

      const imageBtn = document.createElement('div');
      imageBtn.className = 'item__image';
      imageBtn.setAttribute('role', 'button');
      imageBtn.tabIndex = 0;
      imageBtn.setAttribute('aria-label', it.alt || 'Open image');
      imageBtn.addEventListener('click', this.onTileClick);
      imageBtn.addEventListener('pointerup', this.onTilePointerUp);

      if (it.src) {
        const img = document.createElement('img');
        img.src = it.src;
        img.draggable = false;
        img.alt = it.alt;
        imageBtn.appendChild(img);
      }

      item.appendChild(imageBtn);
      this.sphereEl.appendChild(item);
    });

    stage.appendChild(this.sphereEl);

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const overlayBlur = document.createElement('div');
    overlayBlur.className = 'overlay overlay--blur';

    ['top', 'bottom'].forEach((edge) => {
      const fade = document.createElement('div');
      fade.className = `edge-fade edge-fade--${edge}`;
      this.mainEl.appendChild(fade);
    });

    this.viewerEl = document.createElement('div');
    this.viewerEl.className = 'viewer';

    this.scrimEl = document.createElement('div');
    this.scrimEl.className = 'scrim';
    this.scrimEl.addEventListener('click', this.onScrimClick);

    this.frameEl = document.createElement('div');
    this.frameEl.className = 'frame';

    this.viewerEl.append(this.scrimEl, this.frameEl);

    this.mainEl.append(stage, overlay, overlayBlur, this.viewerEl);
    this.rootEl.appendChild(this.mainEl);
    this.container.appendChild(this.rootEl);

    this.mainEl.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);

    this.resizeObserver = new ResizeObserver((entries) => {
      this.handleResize(entries[0].contentRect);
    });
    this.resizeObserver.observe(this.rootEl);

    this.applyTransform(this.rotation.x, this.rotation.y);
  }

  applyTransform(xDeg, yDeg) {
    if (this.sphereEl) {
      this.sphereEl.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  }

  handleResize(contentRect) {
    const {
      fit,
      fitBasis,
      minRadius,
      maxRadius,
      padFactor,
      overlayBlurColor,
      grayscale,
      imageBorderRadius,
      openedImageBorderRadius,
      openedImageWidth,
      openedImageHeight,
    } = this.options;

    const w = Math.max(1, contentRect.width);
    const h = Math.max(1, contentRect.height);
    const minDim = Math.min(w, h);
    const maxDim = Math.max(w, h);
    const aspect = w / h;

    let basis;
    switch (fitBasis) {
      case 'min':
        basis = minDim;
        break;
      case 'max':
        basis = maxDim;
        break;
      case 'width':
        basis = w;
        break;
      case 'height':
        basis = h;
        break;
      default:
        basis = aspect >= 1.3 ? w : minDim;
    }

    let radius = basis * fit;
    const heightGuard = h * 1.35;
    radius = Math.min(radius, heightGuard);
    radius = clamp(radius, minRadius, maxRadius);
    this.lockedRadius = Math.round(radius);

    const viewerPad = Math.max(8, Math.round(minDim * padFactor));
    this.rootEl.style.setProperty('--radius', `${this.lockedRadius}px`);
    this.rootEl.style.setProperty('--viewer-pad', `${viewerPad}px`);
    this.rootEl.style.setProperty('--overlay-blur-color', overlayBlurColor);
    this.rootEl.style.setProperty('--tile-radius', imageBorderRadius);
    this.rootEl.style.setProperty('--enlarge-radius', openedImageBorderRadius);
    this.rootEl.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
    this.applyTransform(this.rotation.x, this.rotation.y);

    const enlargedOverlay = this.viewerEl?.querySelector('.enlarge');
    if (enlargedOverlay && this.frameEl && this.mainEl) {
      const frameR = this.frameEl.getBoundingClientRect();
      const mainR = this.mainEl.getBoundingClientRect();

      if (openedImageWidth && openedImageHeight) {
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `position:absolute;width:${openedImageWidth};height:${openedImageHeight};visibility:hidden;`;
        document.body.appendChild(tempDiv);
        const tempRect = tempDiv.getBoundingClientRect();
        document.body.removeChild(tempDiv);

        enlargedOverlay.style.left = `${frameR.left - mainR.left + (frameR.width - tempRect.width) / 2}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top + (frameR.height - tempRect.height) / 2}px`;
      } else {
        enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
        enlargedOverlay.style.width = `${frameR.width}px`;
        enlargedOverlay.style.height = `${frameR.height}px`;
      }
    }
  }

  lockScroll() {
    if (this.scrollLocked) return;
    this.scrollLocked = true;
    document.body.classList.add('dg-scroll-lock');
  }

  unlockScroll() {
    if (!this.scrollLocked) return;
    if (this.rootEl?.getAttribute('data-enlarging') === 'true') return;
    this.scrollLocked = false;
    document.body.classList.remove('dg-scroll-lock');
  }

  stopInertia() {
    if (this.inertiaRAF) {
      cancelAnimationFrame(this.inertiaRAF);
      this.inertiaRAF = null;
    }
  }

  startInertia(vx, vy) {
    const { dragDampening, maxVerticalRotationDeg } = this.options;
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames = Math.round(90 + 270 * d);

    const step = () => {
      vX *= frictionMul;
      vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
        this.inertiaRAF = null;
        return;
      }
      frames += 1;
      if (frames > maxFrames) {
        this.inertiaRAF = null;
        return;
      }
      const nextX = clamp(
        this.rotation.x - vY / 200,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg
      );
      const nextY = wrapAngleSigned(this.rotation.y + vX / 200);
      this.rotation = { x: nextX, y: nextY };
      this.applyTransform(nextX, nextY);
      this.inertiaRAF = requestAnimationFrame(step);
    };

    this.stopInertia();
    this.inertiaRAF = requestAnimationFrame(step);
  }

  onPointerDown(event) {
    if (this.focusedEl) return;
    this.stopInertia();
    this.dragging = true;
    this.moved = false;
    this.startRot = { ...this.rotation };
    this.startPos = { x: event.clientX, y: event.clientY };
    this.lastPointer = { x: event.clientX, y: event.clientY, time: performance.now() };
    this.velocity = { x: 0, y: 0 };
  }

  onPointerMove(event) {
    if (this.focusedEl || !this.dragging || !this.startPos) return;

    const dxTotal = event.clientX - this.startPos.x;
    const dyTotal = event.clientY - this.startPos.y;

    if (!this.moved && dxTotal * dxTotal + dyTotal * dyTotal > 16) {
      this.moved = true;
    }

    const now = performance.now();
    if (this.lastPointer) {
      const dt = Math.max(now - this.lastPointer.time, 1);
      this.velocity = {
        x: (event.clientX - this.lastPointer.x) / dt,
        y: (event.clientY - this.lastPointer.y) / dt,
      };
    }
    this.lastPointer = { x: event.clientX, y: event.clientY, time: now };

    const { dragSensitivity, maxVerticalRotationDeg } = this.options;
    const nextX = clamp(
      this.startRot.x - dyTotal / dragSensitivity,
      -maxVerticalRotationDeg,
      maxVerticalRotationDeg
    );
    const nextY = wrapAngleSigned(this.startRot.y + dxTotal / dragSensitivity);

    if (this.rotation.x !== nextX || this.rotation.y !== nextY) {
      this.rotation = { x: nextX, y: nextY };
      this.applyTransform(nextX, nextY);
    }
  }

  onPointerUp() {
    if (!this.dragging) return;

    this.dragging = false;

    const vx = clamp((this.velocity?.x ?? 0) * 0.02, -1.2, 1.2);
    const vy = clamp((this.velocity?.y ?? 0) * 0.02, -1.2, 1.2);

    if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
      this.startInertia(vx, vy);
    }

    if (this.moved) {
      this.lastDragEndAt = performance.now();
    }

    this.moved = false;
    this.startPos = null;
  }

  onTileClick(event) {
    if (this.dragging || this.moved) return;
    if (performance.now() - this.lastDragEndAt < 80) return;
    if (this.opening) return;
    this.openItemFromElement(event.currentTarget);
  }

  onTilePointerUp(event) {
    if (event.pointerType !== 'touch') return;
    if (this.dragging || this.moved) return;
    if (performance.now() - this.lastDragEndAt < 80) return;
    if (this.opening) return;
    this.openItemFromElement(event.currentTarget);
  }

  openItemFromElement(el) {
    if (this.opening) return;

    const { enlargeTransitionMs, openedImageWidth, openedImageHeight, segments } = this.options;
    const parent = el.parentElement;

    this.opening = true;
    this.openStartedAt = performance.now();
    this.lockScroll();
    this.focusedEl = el;
    el.setAttribute('data-focused', 'true');

    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(this.rotation.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - this.rotation.x;

    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference';
    refDiv.style.opacity = '0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = this.mainEl.getBoundingClientRect();
    const frameR = this.frameEl.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      this.opening = false;
      this.focusedEl = null;
      refDiv.remove();
      this.unlockScroll();
      return;
    }

    this.originalTilePosition = {
      left: tileR.left,
      top: tileR.top,
      width: tileR.width,
      height: tileR.height,
    };

    el.style.visibility = 'hidden';
    el.style.zIndex = '0';

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.position = 'absolute';
    overlay.style.left = `${frameR.left - mainR.left}px`;
    overlay.style.top = `${frameR.top - mainR.top}px`;
    overlay.style.width = `${frameR.width}px`;
    overlay.style.height = `${frameR.height}px`;
    overlay.style.opacity = '0';
    overlay.style.zIndex = '30';
    overlay.style.willChange = 'transform, opacity';
    overlay.style.transformOrigin = 'top left';
    overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;

    const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
    const img = document.createElement('img');
    img.src = rawSrc;
    overlay.appendChild(img);
    this.viewerEl.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;
    const validSx0 = Number.isFinite(sx0) && sx0 > 0 ? sx0 : 1;
    const validSy0 = Number.isFinite(sy0) && sy0 > 0 ? sy0 : 1;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

    setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      this.rootEl.setAttribute('data-enlarging', 'true');
    }, 16);

    if (openedImageWidth || openedImageHeight) {
      overlay.addEventListener(
        'transitionend',
        (ev) => {
          if (ev.propertyName !== 'transform') return;
          const tempWidth = openedImageWidth || `${frameR.width}px`;
          const tempHeight = openedImageHeight || `${frameR.height}px`;
          overlay.style.transition = 'none';
          overlay.style.width = tempWidth;
          overlay.style.height = tempHeight;
          const newRect = overlay.getBoundingClientRect();
          overlay.style.width = `${frameR.width}px`;
          overlay.style.height = `${frameR.height}px`;
          void overlay.offsetWidth;
          overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
          overlay.style.left = `${frameR.left - mainR.left + (frameR.width - newRect.width) / 2}px`;
          overlay.style.top = `${frameR.top - mainR.top + (frameR.height - newRect.height) / 2}px`;
          overlay.style.width = tempWidth;
          overlay.style.height = tempHeight;
        },
        { once: true }
      );
    }
  }

  closeFocusedItem() {
    if (performance.now() - this.openStartedAt < 250) return;

    const el = this.focusedEl;
    if (!el) return;

    const { enlargeTransitionMs } = this.options;
    const parent = el.parentElement;
    const overlay = this.viewerEl.querySelector('.enlarge');
    if (!overlay) return;

    const refDiv = parent.querySelector('.item__image--reference');
    const originalPos = this.originalTilePosition;

    if (!originalPos) {
      overlay.remove();
      refDiv?.remove();
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');
      el.style.visibility = '';
      el.style.zIndex = '0';
      this.focusedEl = null;
      this.rootEl.removeAttribute('data-enlarging');
      this.opening = false;
      this.unlockScroll();
      return;
    }

    const currentRect = overlay.getBoundingClientRect();
    const rootRect = this.rootEl.getBoundingClientRect();
    const originalPosRelativeToRoot = {
      left: originalPos.left - rootRect.left,
      top: originalPos.top - rootRect.top,
      width: originalPos.width,
      height: originalPos.height,
    };
    const overlayRelativeToRoot = {
      left: currentRect.left - rootRect.left,
      top: currentRect.top - rootRect.top,
      width: currentRect.width,
      height: currentRect.height,
    };

    const animatingOverlay = document.createElement('div');
    animatingOverlay.className = 'enlarge-closing';
    animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius:var(--enlarge-radius,32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;

    const originalImg = overlay.querySelector('img');
    if (originalImg) {
      const closingImg = originalImg.cloneNode();
      closingImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      animatingOverlay.appendChild(closingImg);
    }

    overlay.remove();
    this.rootEl.appendChild(animatingOverlay);
    void animatingOverlay.getBoundingClientRect();

    requestAnimationFrame(() => {
      animatingOverlay.style.left = `${originalPosRelativeToRoot.left}px`;
      animatingOverlay.style.top = `${originalPosRelativeToRoot.top}px`;
      animatingOverlay.style.width = `${originalPosRelativeToRoot.width}px`;
      animatingOverlay.style.height = `${originalPosRelativeToRoot.height}px`;
      animatingOverlay.style.opacity = '0';
    });

    animatingOverlay.addEventListener(
      'transitionend',
      () => {
        animatingOverlay.remove();
        this.originalTilePosition = null;
        refDiv?.remove();
        parent.style.transition = 'none';
        el.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');

        requestAnimationFrame(() => {
          el.style.visibility = '';
          el.style.opacity = '0';
          el.style.zIndex = '0';
          this.focusedEl = null;
          this.rootEl.removeAttribute('data-enlarging');

          requestAnimationFrame(() => {
            parent.style.transition = '';
            el.style.transition = 'opacity 300ms ease-out';
            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.opacity = '';
                this.opening = false;
                if (!this.dragging && this.rootEl.getAttribute('data-enlarging') !== 'true') {
                  document.body.classList.remove('dg-scroll-lock');
                  this.scrollLocked = false;
                }
              }, 300);
            });
          });
        });
      },
      { once: true }
    );
  }

  onScrimClick() {
    this.closeFocusedItem();
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      this.closeFocusedItem();
    }
  }

  destroy() {
    this.stopInertia();
    this.resizeObserver?.disconnect();
    this.mainEl?.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    this.scrimEl?.removeEventListener('click', this.onScrimClick);
    document.body.classList.remove('dg-scroll-lock');
  }
}
