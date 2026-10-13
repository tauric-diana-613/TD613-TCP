import assert from 'node:assert/strict';
import { resolvePhase13Profile } from '../app/data/hush-phase13-mask-fidelity-profiles.js';
import { scoreMaskNativeVariance, scoreProfileFidelity } from '../app/engine/hush-phase13-profile-fidelity-gate.js';

const luz = resolvePhase13Profile({ id: 'luz-index' });
const cryo = resolvePhase13Profile({ id: 'cryo-cristiano' });
const rex = resolvePhase13Profile({ id: 'rex-fractura' });
const queenie = resolvePhase13Profile({ id: 'receipts-queenie' });
const zora = resolvePhase13Profile({ id: 'harbor-zora' });

assert.ok(scoreMaskNativeVariance('1. FILE-72 stays attached.\n2. Footer mismatch is not resolved.\n\nCare note.', luz) > 0.55);
assert.ok(scoreMaskNativeVariance('Status: held.\n\nDo not overexplain. Keep the handoff short.', cryo) > 0.5);
assert.ok(scoreMaskNativeVariance('Hard edge.\nAbrupt pivot.\nSemantic hold.', rex) > 0.35);
assert.ok(scoreMaskNativeVariance('Evidence: FILE-72 first. The shade follows the record.', queenie) > 0.3);
assert.ok(scoreMaskNativeVariance('Care holds the boundary. The source still matters.', zora) > 0.2);
assert.ok(scoreProfileFidelity('1. FILE-72 stays attached.\n2. Footer mismatch is not resolved.\n\nCare note.', luz) > scoreProfileFidelity('This is a smooth summary of the issue.', luz));

console.log('hush-phase13-mask-native-variance: ok');
