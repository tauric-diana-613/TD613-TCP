import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildPhase25HushSwap } from '../app/engine/hush-phase25-swap.js';

const jagged = getHushMask('phase22-jagged-record');
const clear = getHushMask('phase24-clear-record');
assert(jagged, 'phase22-jagged-record missing');
assert(clear, 'phase24-clear-record missing');

const forward = buildPhase25HushSwap({
  sourceText: 'FILE-72 exported at the same minute, but one copy has the footer and one copy does not.',
  mask: jagged,
  maskProfile: jagged.profile,
  direction: 'coherent-to-jagged',
  options: { candidateCount: 24 }
});
assert.equal(forward.version, 'phase-25');
assert.equal(forward.phase24Version, 'phase-24');
assert(forward.garbleSummary, 'missing garble summary');
assert(forward.eventShapeSummary, 'missing event shape summary');
assert(forward.candidates.some((candidate) => Number.isFinite(candidate.phase25Score)));
if (forward.reviewOutput) assert(forward.reviewOutput.includes('FILE-72'));

const reverse = buildPhase25HushSwap({
  sourceText: 'not polished: INV-440 at 2:18, Jordan hold resend until finance knows version.',
  mask: clear,
  maskProfile: clear.profile,
  direction: 'jagged-to-coherent',
  options: { candidateCount: 24 }
});
assert.equal(reverse.version, 'phase-25');
assert.equal(reverse.direction.direction, 'jagged-to-coherent');
if (reverse.reviewOutput) assert(reverse.reviewOutput.includes('INV-440'));

console.log('hush-phase25-swap tests passed');
