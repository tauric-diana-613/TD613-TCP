import { listHushMasks } from './engine/hush-mask-studio.js';
import { buildHushPersonaCard } from './hush-card-grammar.js';

export const HUSH_PERSONA_GALLERY_VERSION = 'phase-31';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function buildHushPersonaGallery(masks = listHushMasks()) {
  const cards = list(masks).map((mask) => buildHushPersonaCard(mask));
  return { version: HUSH_PERSONA_GALLERY_VERSION, cards, maskCount: cards.length, ready: cards.every((card) => card.label && card.story && card.riskTell) };
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

export function renderHushPersonaGallery(target, masks = listHushMasks()) {
  const gallery = buildHushPersonaGallery(masks);
  if (target) target.innerHTML = gallery.cards.map(renderHushPersonaCard).join('');
  return gallery;
}

export function summarizeHushPersonaGallery(gallery = {}) {
  const cards = list(gallery.cards);
  return { version: gallery.version || HUSH_PERSONA_GALLERY_VERSION, maskCount: gallery.maskCount || cards.length, cardsBuilt: cards.length, storiesVisible: cards.every((card) => Boolean(card.story)), riskTellsVisible: cards.every((card) => Boolean(card.riskTell)), targetRegisterCards: cards.filter((card) => card.cardClass === 'target-register-card').length, ready: gallery.ready === true };
}
