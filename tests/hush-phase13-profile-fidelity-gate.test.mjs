import assert from 'node:assert/strict';
import { HUSH_PHASE13_MASK_FIDELITY_PROFILES } from '../app/data/hush-phase13-mask-fidelity-profiles.js';

assert.ok(Array.isArray(HUSH_PHASE13_MASK_FIDELITY_PROFILES));
assert.ok(HUSH_PHASE13_MASK_FIDELITY_PROFILES.length > 0);

console.log('hush-phase13-profile-fidelity-gate: ok');
