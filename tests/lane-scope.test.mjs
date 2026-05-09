// Lane-scope assessor + refusal-layer test. The engine's transformation
// pipeline only knows how to reshape content within four register lanes.
// `assessRegisterLaneScope` exposes the per-lane signal flags so callers
// can tell when an input matches no lane (= out of scope). `buildCadenceTransfer
// ({ refuseOutOfScope: true })` honors that and returns a refusal instead
// of producing a misleading "weak" output.
//
// Reporting-only — does not gate npm test.

import {
  assessRegisterLaneScope,
  buildCadenceTransfer,
  extractCadenceProfile
} from '../app/engine/stylometry.js';
import { HELDOUT_CASES, buildHeldoutShell } from './heldout-cases.mjs';

console.log('--- in-scope sources (held-out 8) should all assess inScope=true ---');
let inScopeOk = 0;
for (const tc of HELDOUT_CASES) {
  const scope = assessRegisterLaneScope(tc.sourceText);
  const ok = scope.inScope;
  if (ok) inScopeOk += 1;
  console.log(`  ${ok ? 'OK  ' : 'MISS'} ${tc.id}  inferredLane=${scope.inferredLane}, matchingLanes=[${scope.matchingLanes.join(',')}]`);
}
console.log(`  ${inScopeOk}/${HELDOUT_CASES.length} held-out sources correctly assessed in-scope`);
console.log();

// Adversarial inputs the engine has never been designed for. None should
// fire any of the four lane signals; the assessor should report inScope=false.
const OUT_OF_SCOPE_INPUTS = [
  {
    id: 'academic-prose',
    text: 'The chaperone-mediated protein folding process exhibits temperature-dependent kinetics consistent with predictions from the Levinthal paradox literature on conformational search.'
  },
  {
    id: 'code-snippet',
    text: 'function compose(f, g) { return (x) => f(g(x)); } const inc = (n) => n + 1; const sq = (n) => n * n; const f = compose(inc, sq);'
  },
  {
    id: 'haiku',
    text: 'old pond / a frog jumps in / sound of water'
  },
  {
    id: 'shopping-list',
    text: 'milk eggs bread olives garlic onion rice tomato sauce parmesan'
  }
];

console.log('--- out-of-scope adversarial inputs should assess inScope=false ---');
let outOfScopeOk = 0;
for (const input of OUT_OF_SCOPE_INPUTS) {
  const scope = assessRegisterLaneScope(input.text);
  const ok = !scope.inScope;
  if (ok) outOfScopeOk += 1;
  console.log(`  ${ok ? 'OK  ' : 'MISS'} ${input.id}  inScope=${scope.inScope}, matchingLanes=[${scope.matchingLanes.join(',')}]`);
}
console.log(`  ${outOfScopeOk}/${OUT_OF_SCOPE_INPUTS.length} adversarial inputs correctly assessed out-of-scope`);
console.log();

// End-to-end refusal test: with refuseOutOfScope, the engine returns a
// transfer-shaped result with transferClass='out-of-scope' instead of
// producing a weak transformation.
console.log('--- buildCadenceTransfer({ refuseOutOfScope: true }) on out-of-scope inputs ---');
let refusalOk = 0;
for (const input of OUT_OF_SCOPE_INPUTS) {
  const heldoutDonor = HELDOUT_CASES[0];
  const shell = buildHeldoutShell(extractCadenceProfile, heldoutDonor);
  const result = buildCadenceTransfer(input.text, shell, {
    retrieval: true,
    refuseOutOfScope: true
  });
  const ok = result.transferClass === 'out-of-scope' && result.outOfScope?.reason === 'no-matching-register-lane';
  if (ok) refusalOk += 1;
  console.log(`  ${ok ? 'OK  ' : 'MISS'} ${input.id}  transferClass=${result.transferClass}  text==source? ${result.text === input.text}`);
  if (result.outOfScope) {
    console.log(`        ${result.outOfScope.message}`);
  }
}
console.log(`  ${refusalOk}/${OUT_OF_SCOPE_INPUTS.length} adversarial inputs correctly refused with transferClass='out-of-scope'`);
console.log();

// Sanity check: refuseOutOfScope on in-scope held-out sources should NOT
// trigger refusal — it should produce a normal transfer.
console.log('--- refuseOutOfScope on in-scope held-out should NOT refuse ---');
let nonRefusalOk = 0;
for (const tc of HELDOUT_CASES) {
  const shell = buildHeldoutShell(extractCadenceProfile, tc);
  const result = buildCadenceTransfer(tc.sourceText, shell, {
    retrieval: true,
    sourceRegisterLane: tc.sourceVariant,
    refuseOutOfScope: true
  });
  const ok = result.transferClass !== 'out-of-scope';
  if (ok) nonRefusalOk += 1;
  console.log(`  ${ok ? 'OK  ' : 'MISS'} ${tc.id}  transferClass=${result.transferClass}`);
}
console.log(`  ${nonRefusalOk}/${HELDOUT_CASES.length} in-scope held-out sources NOT incorrectly refused`);
console.log();
console.log('reporting-only; does not gate npm test.');
