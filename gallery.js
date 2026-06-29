import DomeGallery from './components/DomeGallery.js';
import { initPageEffects } from './components/initPageEffects.js';

const domeRoot = document.getElementById('gallery-dome');
const statusEl = document.getElementById('gallery-status');

function showStatus(message) {
  if (!statusEl) return;
  statusEl.hidden = false;
  statusEl.textContent = message;
}

function hideStatus() {
  if (statusEl) statusEl.hidden = true;
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
      showStatus('No gallery images yet. Add photos to images/gallery/ and gallery.json.');
      return;
    }

    hideStatus();

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
    showStatus('Unable to load the gallery right now.');
  }
});
