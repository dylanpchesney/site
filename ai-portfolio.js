import { initPageEffects } from './components/initPageEffects.js';

const listEl = document.getElementById('portfolio-list');
const statusEl = document.getElementById('portfolio-status');

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createParagraph(label, text) {
  return `
    <p class="ai-portfolio-card__paragraph">
      <span class="ai-portfolio-card__paragraph-label">${escapeHtml(label)}</span>
      ${escapeHtml(text)}
    </p>
  `;
}

function renderArticle(article) {
  const item = document.createElement('li');
  item.className = 'ai-portfolio-card';
  item.innerHTML = `
    <div class="ai-portfolio-card__meta">
      <h2 class="ai-portfolio-card__title">${escapeHtml(article.title)}</h2>
      <time class="ai-portfolio-card__date" datetime="${escapeHtml(article.publishedDate)}">
        ${escapeHtml(formatDate(article.publishedDate))}
      </time>
    </div>
    <div class="ai-portfolio-card__content">
      ${createParagraph('Problem', article.problem)}
      ${createParagraph('AI Solution', article.aiSolution)}
      ${createParagraph('Results', article.results)}
    </div>
    <figure class="ai-portfolio-card__image-wrap">
      <img
        class="ai-portfolio-card__image"
        src="${escapeHtml(article.imageUrl)}"
        alt="${escapeHtml(article.title)}"
        loading="lazy"
        decoding="async">
    </figure>
  `;
  return item;
}

function showStatus(message, isError = false) {
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.className = isError ? 'ai-portfolio-error' : 'ai-portfolio-empty';
}

function hideStatus() {
  statusEl.hidden = true;
}

async function loadPortfolio() {
  showStatus('Loading portfolio…');

  try {
    const response = await fetch('portfolio.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load portfolio.json (${response.status})`);
    }

    const data = await response.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];

    articles.sort((a, b) => {
      const dateA = new Date(`${a.publishedDate}T12:00:00`).getTime();
      const dateB = new Date(`${b.publishedDate}T12:00:00`).getTime();
      return dateB - dateA;
    });

    listEl.textContent = '';

    if (articles.length === 0) {
      showStatus('No portfolio articles yet. Check back soon.');
      return;
    }

    hideStatus();
    articles.forEach((article) => {
      listEl.appendChild(renderArticle(article));
    });
  } catch (error) {
    console.error(error);
    showStatus('Unable to load the AI portfolio right now. Please try again later.', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initPageEffects({ mainSelector: '.ai-portfolio-main' });
  loadPortfolio();
});
