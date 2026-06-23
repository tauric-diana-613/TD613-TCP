import assert from 'node:assert/strict';
import fixtures from '../app/data/hush-phase8-fixtures/cryo-cristiano-fixtures.js';

assert.equal(fixtures.length, 8);
assert.equal(fixtures[0].mask_id, 'night-shift-note');

console.log('hush-phase8-handoff-fixtures: ok');
