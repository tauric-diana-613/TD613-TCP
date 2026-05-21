import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildPhase24HushSwap } from '../app/engine/hush-phase24-swap.js';

const jagged = getHushMask('phase22-jagged-record');
const clear = getHushMask('phase24-clear-record');
assert(jagged, 'phase22-jagged-record missing');
assert(clear, 'phase24-clear-record missing');

const forward = buildPhase24HushSwap({
  sourceText: 'ROSTER-8 changed after 4:30 on 05/20. Keep the timing attached.',
  mask: jagged,
  maskProfile: jagged.profile,
  direction: 'coherent-to-jagged',
  options: { candidateCount: 24 }
});

assert.equal(forward.version, 'phase-24');
assert.equal(forward.phase23Version, 'phase-23');
assert.equal(forward.direction.direction, 'coherent-to-jagged');
assert(forward.caseStabilitySummary, 'missing case stability summary');
assert(forward.flatteningSummary, 'missing flattening summary');
assert(forward.directionSummary, 'missing direction summary');
assert(forward.candidates.some((candidate) => Number.isFinite(candidate.phase24Score)));
if (forward.selectedOutput) {
  assert(forward.selectedOutput.includes('ROSTER-8'));
  assert(forward.selectedOutput.includes('05/20'));
  assert(!forward.selectedOutput.includes('rOSTER-8'));
}

const reverse = buildPhase24HushSwap({
  sourceText: 'rough note / FILE-72 same export minute / one copy footer there, one copy no footer.',
  mask: clear,
  maskProfile: clear.profile,
  direction: 'jagged-to-coherent',
  options: { candidateCount: 24 }
});

assert.equal(reverse.version, 'phase-24');
assert.equal(reverse.direction.direction, 'jagged-to-coherent');
if (reverse.reviewOutput) assert(reverse.reviewOutput.includes('FILE-72'));

console.log('hush-phase24-swap tests passed');
