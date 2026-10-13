import assert from 'node:assert/strict';
import {
  hydrateState,
  readStoredState,
  writeStoredState,
  clearStoredState,
} from '../app/dome-world/domeblox/game/state-resilience.js';

const defaults = () => ({
  schema: 1,
  savedAt: 'default',
  world: {
    day: 1,
    springald: { candidate: false, witnessed: false, armedUntil: 0, releases: 0 },
    tendencies: { care: .1, rest: .1, attention: .1 },
  },
  player: {
    x: 0,
    inventory: { food: 2, cloth: 0 },
    stats: { woven: 0, springaldWitnesses: 0 },
  },
  ledger: [{ type: 'world_opened', at: 'default', message: 'open' }],
});

const partial = {
  schema: 1,
  savedAt: '2026-07-20T00:00:00.000Z',
  world: { day: '4', springald: null, unknown: 'discard' },
  player: { x: '15', inventory: { food: '3' }, stats: null },
  ledger: [{ type: 'old', message: 'preserved' }],
};
const hydrated = hydrateState(defaults, partial);
assert.equal(hydrated.world.day, 4);
assert.equal(hydrated.player.x, 15);
assert.equal(hydrated.player.inventory.food, 3);
assert.equal(hydrated.player.inventory.cloth, 0);
assert.equal(hydrated.player.stats.woven, 0);
assert.equal(hydrated.world.springald.candidate, false);
assert.equal(hydrated.world.tendencies.attention, .1);
assert.equal('unknown' in hydrated.world, false);
assert.equal(hydrated.ledger[0].type, 'old');

const memory = new Map();
const storage = {
  getItem: key => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: key => memory.delete(key),
};
assert.equal(writeStoredState(storage, 'save', hydrated), true);
const reread = readStoredState(storage, 'save', defaults);
assert.equal(reread.world.day, 4);
assert.equal(reread.player.inventory.cloth, 0);
assert.equal(clearStoredState(storage, 'save'), true);
assert.equal(memory.has('save'), false);

const denied = {
  getItem: () => { throw new Error('denied'); },
  setItem: () => { throw new Error('denied'); },
  removeItem: () => { throw new Error('denied'); },
};
assert.doesNotThrow(() => readStoredState(denied, 'save', defaults));
assert.equal(writeStoredState(denied, 'save', hydrated), false);
assert.equal(clearStoredState(denied, 'save'), false);

console.log('DomeBlox state resilience PASS');
