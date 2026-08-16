# TD613 UI Components

## Framework finding

TD613-TCP is a static, vanilla HTML/CSS/JavaScript application. It has no React/Vue/Svelte/Next.js layer, no Tailwind configuration, and no third-party component library. UI composition is performed with semantic HTML, CSS classes, and small ES-module renderers. Giving is currently a single page controller rather than a component directory, so its page-local render functions are traced in pages.md rather than misclassified as shared primitives.

The reusable UI modules below are the actual Hush primitives that carry TD613's strongest existing card, carousel, status, warning, and evidence-display grammar.

## HushPersonaGallery / HushPersonaCard

- File: app/hush-persona-gallery.js
- Description: Builds accessible, paginated persona cards with family, route, story, risk, and warning chips.
- Key inputs: target HTMLElement; masks array. Cards are derived through buildHushPersonaCard.

~~~javascript
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
~~~


## HushPersonaCardGrammar

- File: app/hush-card-grammar.js
- Description: Deterministically classifies persona cards and derives visible route warnings before rendering.
- Key inputs: mask object; no DOM dependency.

~~~javascript
export const HUSH_CARD_GRAMMAR_VERSION = 'phase-31';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const text = (value) => String(value ?? '').trim();

export function classifyPersonaCard(mask = {}) {
  const id = text(mask.id);
  const family = text(mask.family).toLowerCase();
  if (id.includes('phase28') || family.includes('target')) return 'target-register-card';
  if (id.includes('phase27') || family.includes('register')) return 'custody-lantern-card';
  if (id.includes('phase22') || id.includes('phase24') || family.includes('stress')) return 'lab-stress-card';
  if (mask.source === 'custom' || id.startsWith('custom')) return 'forge-born-card';
  return 'field-persona-card';
}

export function derivePersonaRouteWarnings(mask = {}) {
  const warnings = [...list(mask.pressureWarnings)];
  const cardClass = classifyPersonaCard(mask);
  if (cardClass === 'target-register-card') warnings.push('explicit-target-register-review');
  if (cardClass === 'lab-stress-card') warnings.push('stress-mask-not-default');
  if (cardClass === 'forge-born-card') warnings.push('custom-mask-local-only');
  if (!mask.riskTell) warnings.push('risk-tell-missing');
  return [...new Set(warnings)];
}

export function buildHushPersonaCard(mask = {}) {
  const routeWarnings = derivePersonaRouteWarnings(mask);
  return {
    version: HUSH_CARD_GRAMMAR_VERSION,
    id: text(mask.id),
    label: text(mask.label),
    family: text(mask.family),
    story: text(mask.description),
    intendedUse: text(mask.intendedUse),
    riskTell: text(mask.riskTell),
    pressureWarnings: list(mask.pressureWarnings),
    transformHints: mask.transformHints || {},
    cardClass: classifyPersonaCard(mask),
    routeWarnings
  };
}

export function summarizePersonaCard(card = {}) {
  return { id: card.id || '', label: card.label || '', cardClass: card.cardClass || '', hasStory: Boolean(card.story), hasRiskTell: Boolean(card.riskTell), warningCount: list(card.routeWarnings).length };
}
~~~


## HushGeneratorStatusPlate

- File: app/hush-generator-status-plate.js
- Description: Ensures a live-region status plate at the Hush action gate and maps info/ok/warning/error tones to a visible edge signal.
- Key inputs: status message and tone through window.__TD613_HUSH_GENERATOR_STATUS_PLATE__.

~~~javascript
const TD613_HUSH_GENERATOR_STATUS_PLATE_VERSION = 'generator-status-plate/v1';

function byId(id) {
  return document.getElementById(id);
}

function actionGateHost() {
  return byId('hushGateStrip') || byId('generateMaskedOutputBtn')?.closest('.hush-transform-gate') || null;
}

function stylePlate(plate) {
  if (!plate) return;
  plate.classList.add('hush-warning-panel', 'hush-generator-status', 'hush-transmission-plate');
  plate.style.setProperty('display', 'block', 'important');
  plate.style.setProperty('position', 'relative', 'important');
  plate.style.setProperty('width', '100%', 'important');
  plate.style.setProperty('box-sizing', 'border-box', 'important');
  plate.style.setProperty('margin', '.62rem 0 .42rem', 'important');
  plate.style.setProperty('padding', '.76rem .92rem .76rem 1.05rem', 'important');
  plate.style.setProperty('border', '1px solid rgba(137,255,240,.24)', 'important');
  plate.style.setProperty('border-left', '4px solid rgba(137,255,240,.88)', 'important');
  plate.style.setProperty('border-radius', '16px', 'important');
  plate.style.setProperty('background', 'linear-gradient(135deg,rgba(3,9,20,.88),rgba(10,7,22,.78))', 'important');
  plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(137,255,240,.08)', 'important');
  plate.style.setProperty('color', 'rgba(226,255,236,.92)', 'important');
  plate.style.setProperty('font-size', 'clamp(.82rem,2.7vw,1rem)', 'important');
  plate.style.setProperty('line-height', '1.35', 'important');
  plate.style.setProperty('letter-spacing', '.025em', 'important');
  plate.style.setProperty('white-space', 'normal', 'important');
  plate.style.setProperty('overflow-wrap', 'anywhere', 'important');
}

function ensureStatusPlate(message = 'Strict provider bridge ready.') {
  const host = actionGateHost();
  let plate = byId('hushGeneratorStatus') || byId('hushStrictProviderStatus');
  if (!plate) {
    plate = document.createElement('div');
    plate.id = 'hushGeneratorStatus';
    plate.setAttribute('aria-live', 'polite');
  }
  if (plate.id !== 'hushGeneratorStatus') plate.id = 'hushGeneratorStatus';
  stylePlate(plate);
  if (!plate.textContent.trim()) plate.textContent = message;
  if (host?.id === 'hushGateStrip') {
    if (plate.nextElementSibling !== host) host.insertAdjacentElement('beforebegin', plate);
  } else if (host && !host.contains(plate)) {
    host.appendChild(plate);
  }
  return plate;
}

function setStatusPlate(message = '', tone = 'info') {
  const plate = ensureStatusPlate();
  plate.dataset.tone = tone || 'info';
  if (message) plate.textContent = message;
  if (tone === 'ok') {
    plate.style.setProperty('border-left-color', 'rgba(49,255,138,.88)', 'important');
    plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(49,255,138,.12)', 'important');
  } else if (tone === 'error' || tone === 'warning') {
    plate.style.setProperty('border-left-color', 'rgba(255,194,104,.88)', 'important');
    plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(255,194,104,.12)', 'important');
  } else {
    plate.style.setProperty('border-left-color', 'rgba(137,255,240,.88)', 'important');
    plate.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,.06),0 0 18px rgba(137,255,240,.08)', 'important');
  }
  return plate;
}

function boot() {
  ensureStatusPlate();
  window.setTimeout(() => ensureStatusPlate(), 120);
  window.setTimeout(() => ensureStatusPlate(), 520);
  window.setTimeout(() => ensureStatusPlate(), 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => window.setTimeout(boot, 120));
window.__TD613_HUSH_GENERATOR_STATUS_PLATE__ = { version: TD613_HUSH_GENERATOR_STATUS_PLATE_VERSION, ensure: ensureStatusPlate, set: setStatusPlate };
~~~
