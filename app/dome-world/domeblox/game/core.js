import { clearStoredState, readStoredState, writeStoredState } from './state-resilience.js';

export const CANONICAL = String.fromCodePoint(0x10D613);
export const SAVE_KEY = 'td613.domeblox.browser-world/v1';
export const TAU = Math.PI * 2;
export const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, Number(value) || 0));
export const lerp = (a, b, t) => a + (b - a) * t;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const format = value => (Number(value) || 0).toFixed(2);
export const nowIso = () => new Date().toISOString();
export const capitalize = value => String(value).charAt(0).toUpperCase() + String(value).slice(1);

export const palette = Object.freeze({
  wasteland: '#181513', dome: '#173c36', grass: '#2c6654', path: '#9c8662',
  water: '#58a8b7', waterDark: '#286b79', wood: '#9d7650', roof: '#d7b56f',
  leaf: '#65a95e', bamboo: '#87b55a', garden: '#6d9d58', stone: '#78928b',
  loom: '#a87cb4', keep: '#566a82', player: '#f0d58b', playerDark: '#7b5a36',
  white: '#edf8f3', accent: '#8de1cf', gold: '#f1d88b', danger: '#ff9a8b'
});

export const objectives = Object.freeze([
  'Walk to the fountain and lift water.',
  'Harvest bamboo, refine pulp, and spin thread.',
  'Offer 米 at the Loom and begin a weave.',
  'Harvest produce or eggs and cook at your home.',
  'Tend care, rest, and attention until the Dome settles.',
  'Visit the Ash Keep when the Springald chamber awakens.'
]);

export function defaultState() {
  return {
    schema: 1, savedAt: nowIso(),
    world: {
      day: 1, fullDayCount: 0, season: 'spring', clock: 7.5, weather: 'clear',
      phase: 'ambiguity', warmth: .55, moisture: .48, integrity: 1, folds: 0,
      hydration: .5, phasonicReserve: 1, reflux: .1, routeHolonomy: .16,
      observabilityDeficit: .08, garden: 5, nest: 4, water: 20,
      bamboo: { standing: 12, pulp: 0, thread: 0 },
      tendencies: { care: .12, rest: .12, attention: .12 },
      springald: { candidate: false, witnessed: false, armedUntil: 0, releases: 0 }
    },
    player: {
      x: 0, y: 180, facing: 0, home: 1,
      needs: { hunger: 1, thirst: 1, rest: 1, release: 1 },
      inventory: { food: 2, eggs: 0, produce: 0, bamboo: 0, pulp: 0, thread: 0, cloth: 0 },
      dirt: { cloth: 0, dishes: 0, body: 0 },
      stats: { play: 0, tending: 0, woven: 0, springaldWitnesses: 0 },
      loom: { glyph: null, mode: null, progress: 0, ready: false }, objective: 0
    },
    ledger: [{ type: 'world_opened', at: nowIso(), message: 'The chair remains open.' }]
  };
}

export function loadState(storage = globalThis.localStorage) {
  return readStoredState(storage, SAVE_KEY, defaultState);
}

const canvas = document.querySelector('#gameCanvas');
const mapCanvas = document.querySelector('#mapCanvas');
export const G = {
  canvas, ctx: canvas.getContext('2d', { alpha: false }),
  mapCanvas, mapCtx: mapCanvas.getContext('2d'),
  ui: Object.fromEntries([...document.querySelectorAll('[id]')].map(element => [element.id, element])),
  state: loadState(), running: false, hudCollapsed: false, mapOpen: false,
  springaldOpen: false, currentInteraction: null, lastFrame: performance.now(),
  accumulator: 0, autosaveTimer: 0, weatherTimer: 0,
  camera: { x: 0, y: 0, zoom: 1 }, keys: new Set(),
  pointer: { x: 0, y: 0, active: false }, particles: [], animals: [], objects: []
};
G.camera.x = G.state.player.x;
G.camera.y = G.state.player.y;

export function appendLedger(type, message, data = null) {
  G.state.ledger.push({ type, at: nowIso(), message, data });
  if (G.state.ledger.length > 200) G.state.ledger.splice(0, G.state.ledger.length - 200);
}

export function message(text) {
  G.ui.messageLog.textContent = text;
  appendLedger('message', text);
}

export function writeStateSnapshot(storage = globalThis.localStorage) {
  G.state.savedAt = nowIso();
  G.state.ledger = G.state.ledger.slice(-200);
  return writeStoredState(storage, SAVE_KEY, G.state);
}

export function clearSavedState(storage = globalThis.localStorage) {
  return clearStoredState(storage, SAVE_KEY);
}

export function saveState(reason = 'manual') {
  G.state.ledger = G.state.ledger.slice(-160);
  appendLedger('save', `Local world saved (${reason}).`);
  const saved = writeStateSnapshot();
  const announce = reason === 'manual' || reason === 'api';
  if (saved && announce) G.ui.messageLog.textContent = 'Local world saved.';
  if (!saved) {
    appendLedger('save_failed', `Local save unavailable (${reason}). Export remains available.`);
    G.ui.messageLog.textContent = 'Local storage is unavailable. Export remains available.';
  }
  return saved;
}

export function exportState() {
  const payload = JSON.stringify({ ...G.state, canonical: CANONICAL, exportSchema: 'td613.domeblox.browser-save/v1' }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `domeblox-save-day-${G.state.world.day}.json`;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  message('Local save exported.');
}

function add(id, name, glyph, x, y, radius, color, action, detail, kind = 'station') {
  G.objects.push({ id, name, glyph, x, y, radius, color, action, detail, kind });
}

export function buildWorldObjects() {
  if (G.objects.length) return;
  for (let index = 0; index < 12; index += 1) {
    const angle = -Math.PI / 2 + index * TAU / 12;
    add(`home-${index + 1}`, `Dome-home ${index + 1}`, '⌂', Math.cos(angle) * 380, Math.sin(angle) * 280, 45, palette.roof, 'home', 'Rest, cook, and take prepared food.', 'home');
  }
  add('fountain', 'Play fountain', '出', 0, 20, 55, palette.water, 'play', 'Lift water into the battery pool.', 'fountain');
  add('care', 'Care garden', '米', -150, 70, 48, palette.garden, 'care', 'Tend care or harvest produce.', 'garden');
  add('rest', 'Rest circle', CANONICAL, -205, -35, 43, palette.stone, 'rest', 'Rest without disappearing from the village.', 'rest');
  add('attention', 'Attention station', 'à', -130, -145, 38, palette.accent, 'attention', 'Settle attention and observe the Dome.');
  add('bamboo', 'Bamboo grove', '上', 165, 92, 54, palette.bamboo, 'bamboo', 'Harvest bamboo.', 'bamboo');
  add('workbench', 'Pulp and thread bench', '下', 210, 5, 44, palette.wood, 'workbench', 'Refine bamboo and spin thread.', 'workbench');
  add('loom', 'Village Loom', '米', 30, 125, 48, palette.loom, 'loom', 'Offer 米, begin a weave, and take cloth.', 'loom');
  add('nest', 'Duck nest', '◉', -70, -185, 38, '#bd9d64', 'nest', 'Gather eggs when the nest is ready.', 'nest');
  add('cleansing', 'Cascade cleansing', '≈', 150, -120, 48, palette.waterDark, 'cleanse', 'Wash dishes, bathe, and air cloth.', 'water');
  add('release', 'Release court', '出', 70, -155, 38, '#cf8d68', 'release', 'Release restores room for the next cycle.');
  add('keep', 'Ash Keep and Springald', '⟐', 0, -285, 58, palette.keep, 'springald', 'Witness and locally release accumulated contradiction.', 'keep');
  add('battery', 'Forward Battery console', '𝌋', 255, -125, 38, '#855d8f', 'battery', 'Open the Forward Battery in a new page.', 'console');
}

export function seedAnimals() {
  if (G.animals.length) return;
  const groups = [['duck', 6, -70, -180], ['rabbit', 4, 125, 165], ['sheep', 4, -245, 125], ['chicken', 7, 235, 105]];
  for (const [kind, count, x, y] of groups) {
    for (let index = 0; index < count; index += 1) {
      G.animals.push({ kind, x: x + (Math.random() - .5) * 90, y: y + (Math.random() - .5) * 70, vx: 0, vy: 0, turn: Math.random() * 3 });
    }
  }
}
