import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';

const mask = getHushMask('phase22-jagged-record');
assert(mask, 'missing Phase 22 jagged record mask');

const message = 'Keep DOC-77 with 04/21. The file was visible before noon, and the date is the anchor.';
const result = buildHushSwap({
  sourceText: message,
  mask,
  maskProfile: mask.profile,
  contextType: 'group-chat',
  options: { candidateCount: 24 }
});

const output = result.selectedOutput || '';
assert.equal(result.version, 'phase-22');
assert(output.trim().length > 0, 'Phase 22 live quality smoke produced no output');
assert.notEqual(output.trim(), message.trim(), 'output should not be unchanged');
assert(result.payloadIntegrity, 'missing payload integrity');
assert.equal(result.payloadIntegrity.passed, true, `payload integrity failed: ${JSON.stringify(result.payloadIntegrity)}`);
assert(output.includes('DOC-77'));
assert(output.includes('04/21'));
assert(/file/i.test(output));
assert(/before noon|noon/i.test(output));

console.log('hush-live-quality-regression tests passed');
