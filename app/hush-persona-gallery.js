import { listHushMasks } from './engine/hush-mask-studio.js';
import { buildHushPersonaCard } from './hush-card-grammar.js';

export const HUSH_PERSONA_GALLERY_VERSION = 'phase-31';
export const HUSH_PERSONA_CAROUSEL_VERSION = 'pr131-clickable-persona-carousel';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function buildHushPersonaGallery(masks = listHushMasks()) {
  const cards = list(masks).map((mask) => buildHushPersonaCard(mask));
  return {
    version: HUSH_PERSONA_GALLERY_VERSION,
    carouselVersion: HUSH_PERSONA_CAROUSEL_VERSION,
    cards,
    maskCount: cards.length,
    ready: cards.every((card) => card.label && card.story && card.riskTell)
  };
}

export function renderHushPersonaCard(card = {}) {
  const warnings = list(card.routeWarnings).slice(0, 4).map((item) => `<span class="persona-chip warning">${esc(item)}</span>`).join('');
  const hints = Object.entries(card.transformHints || {}).filter(([, value]) => value).slice(0, 4).map(([key, value]) => `<span class="persona-chip">${esc(key)}: ${esc(value)}</span>`).join('');
  return `<article class="persona-card ${esc(card.cardClass)}" data-mask-id="${esc(card.id)}">
    <div class="persona-card-top"><span class="persona-family">${esc(card.family)}</span><span class="persona-route">${esc(card.cardClass)}</span></div>
    <h3>${esc(card.label)}</h3>
    <p class="persona-story">${esc(card.story)}</p>
    <div class="persona-brief"><strong>Use when</strong><span>${esc(card.intendedUse)}</span></div>
    <div class="persona-brief risk"><strong>Risk tell</strong><span>${esc(card.riskTell)}</span></div>
    <div class="persona-chips">${hints}${warnings}</div>
    <button class="persona-select" data-mask-id="${esc(card.id)}" type="button">Select persona</button>
  </article>`;
}

function pageSizeForViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 4;
  if (window.matchMedia('(max-width: 720px)').matches) return 1;
  if (window.matchMedia('(max-width: 1120px)').matches) return 2;
  return 4;
}

function renderPageDots(pageCount, activePage) {
  return Array.from({ length: pageCount }, (_, index) => `<button class="persona-page-dot${index === activePage ? ' active' : ''}" data-persona-page="${index}" type="button" aria-label="Open persona page ${index + 1}"></button>`).join('');
}

function updatePersonaCarousel(target, state = {}) {
  const track = target?.querySelector?.('[data-persona-track]');
  const counter = target?.querySelector?.('[data-persona-counter]');
  const dots = target?.querySelector?.('[data-persona-dots]');
  const prev = target?.querySelector?.('[data-persona-prev]');
  const next = target?.querySelector?.('[data-persona-next]');
  if (!target || !track) return state;

  const total = Number(state.total || track.querySelectorAll('.persona-card').length || 0);
  const pageSize = pageSizeForViewport();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(0, Number(state.page || 0)), pageCount - 1);
  const offset = `calc(${page} * -1 * (100% + var(--persona-carousel-gap, 14px)))`;
  target.dataset.personaPage = String(page);
  target.dataset.personaPageSize = String(pageSize);
  target.dataset.personaPageCount = String(pageCount);
  track.style.transform = `translateX(${offset})`;
  if (counter) counter.textContent = `${page + 1} / ${pageCount}`;
  if (prev) prev.disabled = page <= 0;
  if (next) next.disabled = page >= pageCount - 1;
  if (dots) dots.innerHTML = renderPageDots(pageCount, page);
  return { total, pageSize, pageCount, page };
}

function installPersonaCarousel(target) {
  if (!target || target.dataset.personaCarouselInstalled === HUSH_PERSONA_CAROUSEL_VERSION) return;
  target.dataset.personaCarouselInstalled = HUSH_PERSONA_CAROUSEL_VERSION;
  let state = updatePersonaCarousel(target, { page: 0 });

  target.addEventListener('click', (event) => {
    const prev = event.target?.closest?.('[data-persona-prev]');
    const next = event.target?.closest?.('[data-persona-next]');
    const dot = event.target?.closest?.('[data-persona-page]');
    if (!prev && !next && !dot) return;
    if (prev) state.page -= 1;
    if (next) state.page += 1;
    if (dot) state.page = Number(dot.getAttribute('data-persona-page') || 0);
    state = updatePersonaCarousel(target, state);
  });

  target.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    state.page += event.key === 'ArrowRight' ? 1 : -1;
    state = updatePersonaCarousel(target, state);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      state = updatePersonaCarousel(target, state);
    }, { passive: true });
  }
}

export function renderHushPersonaGallery(target, masks = listHushMasks()) {
  const gallery = buildHushPersonaGallery(masks);
  const cards = gallery.cards.map(renderHushPersonaCard).join('');
  if (target) {
    target.classList.add('persona-gallery', 'persona-gallery-paged');
    target.tabIndex = 0;
    target.innerHTML = `<div class="persona-gallery-carousel" data-persona-carousel-version="${HUSH_PERSONA_CAROUSEL_VERSION}">
      <div class="persona-gallery-nav" aria-label="Persona gallery navigation">
        <button class="persona-nav-button" data-persona-prev type="button" aria-label="Previous persona page">‹</button>
        <div class="persona-gallery-position"><span data-persona-counter>1 / 1</span><span class="persona-gallery-position-label">Persona pages</span></div>
        <button class="persona-nav-button" data-persona-next type="button" aria-label="Next persona page">›</button>
      </div>
      <div class="persona-carousel-viewport">
        <div class="persona-carousel-track" data-persona-track>${cards}</div>
      </div>
      <div class="persona-page-dots" data-persona-dots aria-label="Persona pages"></div>
    </div>`;
    installPersonaCarousel(target);
  }
  return gallery;
}

export function summarizeHushPersonaGallery(gallery = {}) {
  const cards = list(gallery.cards);
  return {
    version: gallery.version || HUSH_PERSONA_GALLERY_VERSION,
    carouselVersion: gallery.carouselVersion || HUSH_PERSONA_CAROUSEL_VERSION,
    maskCount: gallery.maskCount || cards.length,
    cardsBuilt: cards.length,
    storiesVisible: cards.every((card) => Boolean(card.story)),
    riskTellsVisible: cards.every((card) => Boolean(card.riskTell)),
    targetRegisterCards: cards.filter((card) => card.cardClass === 'target-register-card').length,
    ready: gallery.ready === true
  };
}
