import DomeGallery from './components/DomeGallery.js';
import { initPageEffects } from './components/initPageEffects.js';

const domeRoot = document.getElementById('gallery-dome');
const emptyEl = document.getElementById('gallery-empty');

function showUnderConstruction() {
  emptyEl.hidden = false;
  domeRoot.hidden = true;
  domeRoot.classList.remove('gallery-dome--active');
}

function showGallery() {
  emptyEl.hidden = true;
  domeRoot.hidden = false;
  domeRoot.classList.add('gallery-dome--active');
}

async function loadGallery() {
  const response = await fetch('gallery.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Could not load gallery.json (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data.images) ? data.images : [];
}

document.addEventListener('DOMContentLoaded', async () => {
  initPageEffects({ mainSelector: '.gallery-main' });

  if (!domeRoot) return;

  try {
    const images = await loadGallery();

    if (images.length === 0) {
      showUnderConstruction();
      return;
    }

    showGallery();

    new DomeGallery(domeRoot, {
      images,
      fit: 1,
      minRadius: 400,
      maxVerticalRotationDeg: 13,
      segments: 20,
      dragDampening: 4,
      grayscale: false,
      overlayBlurColor: '#5c7380',
      openedImageWidth: '400px',
      openedImageHeight: '400px',
      imageBorderRadius: '30px',
      openedImageBorderRadius: '30px',
    });
  } catch (error) {
    console.error(error);
    if (emptyEl) {
      emptyEl.querySelector('.gallery-empty__text').textContent =
        'Gallery is temporarily unavailable. Please try again later.';
    }
    showUnderConstruction();
  }
});
