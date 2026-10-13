import assert from 'node:assert/strict';
import { scoreDelayedClarification, scoreMemoryReturn, scoreRevisionPressure, scoreTemporalDraftingSignature } from '../app/engine/hush-phase14-cognitive-authorship-gate.js';

const flat = 'FILE-72 remains attached. The footer mismatch is not resolved. The receipt matters as evidence.';
const temporal = 'FILE-72 appears first.\n\nHold that. The footer mismatch is not resolved.\n\nBack to FILE-72: that earlier attachment matters later because the receipt is evidence, not decoration.';

assert.ok(scoreMemoryReturn(temporal) > scoreMemoryReturn(flat));
assert.ok(scoreDelayedClarification(temporal) > scoreDelayedClarification(flat));
assert.ok(scoreRevisionPressure(temporal) > scoreRevisionPressure(flat));
assert.ok(scoreTemporalDraftingSignature(temporal) > scoreTemporalDraftingSignature(flat));

console.log('hush-phase14-temporal-drafting-signature: ok');
