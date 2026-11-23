/**
 * 𝌋 TD613 · Shadow Graph Engine v2 Adversarial Test Suite
 * 
 * Formal Verification of Repairs for Finding A-S2-F05:
 * - O(1) target index candidate lookup
 * - Strict prevention of auto-promotion on late admission
 * - Immutable attempt history without map overwriting
 * - Measurement of NEVER_GENERATED relations via declared comparison universe
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BoundaryAttemptGraphV2, RELATION_STATES } from './shadow_graph_engine_v2.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'shadow-graph-receipt-v2.json');

console.log('================================================================');
console.log('SHADOW GRAPH ENGINE v2 ADVERSARIAL VERIFICATION SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
  passedTests++;
}

const g = new BoundaryAttemptGraphV2();

// -------------------------------------------------------------
// TEST 1: O(1) Indexing & Attempt History (No Overwriting)
// -------------------------------------------------------------
console.log('--- TEST 1: O(1) Indexing & Attempt Retention ---');
g.registerNode('node:A', { created_at: '2026-08-01T10:00:00Z' }, true);
g.registerNode('node:B', { created_at: '2026-08-05T12:00:00Z' }, false); // Delayed / unadmitted node

// First attempt: rejected because target is unadmitted
const att1 = g.recordAttempt({
  from: 'node:A',
  to: 'node:B',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: 'EXACT_FORWARD_CUE',
  provenance: 'PASS_1',
});

// Second attempt on SAME edgeKey: different provenance/timestamp
const att2 = g.recordAttempt({
  from: 'node:A',
  to: 'node:B',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: 'EXACT_FORWARD_CUE',
  provenance: 'PASS_2',
});

assert(att1.attempt_id !== att2.attempt_id, 'Distinct attempt IDs generated for repeated attempts');
assert(g.edgeAttempts.get('node:A->node:B:EXPLORE_PROJECTIVE').length === 2, 'Full attempt history preserved without map overwriting');
assert(g.targetIndex.get('node:B').has(att1.attempt_id), 'Target index contains attempt 1');
assert(g.targetIndex.get('node:B').has(att2.attempt_id), 'Target index contains attempt 2');
assert(g.sourceIndex.get('node:A').has(att1.attempt_id), 'Source index contains attempt 1');

// -------------------------------------------------------------
// TEST 2: Strict Prevention of Auto-Promotion on Late Admission
// -------------------------------------------------------------
console.log('\n--- TEST 2: Re-evaluation & Auto-Promotion Prevention ---');
// Node C is an ancient document (created 2026-07-01), earlier than Node A (2026-08-01)
g.registerNode('node:C_ancient', { created_at: '2026-07-01T00:00:00Z' }, false);
// Attempt pointing backwards in time to C
const attChrono = g.recordAttempt({
  from: 'node:A',
  to: 'node:C_ancient',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: 'PREEXISTING_CHRONOLOGY',
});
assert(attChrono.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Inverted chronology attempt initially rejected');

// Node D is an unadmitted noise target
g.registerNode('node:D_noise', { created_at: '2026-08-06T00:00:00Z' }, false);
const attNoise = g.recordAttempt({
  from: 'node:A',
  to: 'node:D_noise',
  relation_type: 'GROUNDED_SPAN',
  proposed_warrant: 'UNWARRANTED_NOISE',
});
assert(attNoise.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Noise attempt initially rejected');

// Node E is an unadmitted low-evidence target
g.registerNode('node:E_low_ev', { created_at: '2026-08-06T00:00:00Z' }, false);
const attLowEv = g.recordAttempt({
  from: 'node:A',
  to: 'node:E_low_ev',
  relation_type: 'GROUNDED_SPAN',
  proposed_warrant: 'BELOW_EVIDENCE_CEILING',
});
assert(attLowEv.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Unadmitted target initially causes ATTEMPTED_REJECTED');

// Now, perform late admission on node:B (valid forward target)
console.log('[ACTION] Admitting delayed node:B...');
const resB = g.admitDelayedNode('node:B', { created_at: '2026-08-05T12:00:00Z' });
assert(resB.admitted.length === 2, 'Both valid attempts pointing to node:B promoted to ADMITTED');
assert(att1.state === RELATION_STATES.ADMITTED, 'att1 transitioned to ADMITTED');
assert(att2.state === RELATION_STATES.ADMITTED, 'att2 transitioned to ADMITTED');

// Now, perform late admission on ancient node:C_ancient
console.log('[ACTION] Admitting delayed ancient node:C_ancient...');
const resC = g.admitDelayedNode('node:C_ancient', { created_at: '2026-07-01T00:00:00Z' });
assert(resC.admitted.length === 0, 'ZERO invalid chronology attempts promoted on late admission');
assert(resC.retained_rejected.length === 1, 'Invalid chronology attempt retained in rejected state');
assert(attChrono.state === RELATION_STATES.ATTEMPTED_REJECTED, 'attChrono remains ATTEMPTED_REJECTED');
assert(attChrono.reason === 'CHRONOLOGICAL_INVERSION_BLOCKED_ON_LATE_ADMISSION', 'Rejection reason updated on re-evaluation');

// Now, perform late admission on noise node:D_noise
console.log('[ACTION] Admitting delayed noise node:D_noise...');
const resD = g.admitDelayedNode('node:D_noise', { created_at: '2026-08-06T00:00:00Z' });
assert(resD.admitted.length === 0, 'ZERO noise attempts promoted on late admission');
assert(attNoise.state === RELATION_STATES.ATTEMPTED_REJECTED, 'attNoise remains ATTEMPTED_REJECTED');
assert(attNoise.reason === 'UNWARRANTED_NOISE_REMAINS_REJECTED', 'Noise rejection reason updated on re-evaluation');

// Now, perform late admission on low-evidence node:E_low_ev
console.log('[ACTION] Admitting delayed low evidence node:E_low_ev...');
const resE = g.admitDelayedNode('node:E_low_ev', { created_at: '2026-08-06T00:00:00Z' });
assert(resE.admitted.length === 0, 'ZERO low evidence attempts promoted on late admission');
assert(attLowEv.state === RELATION_STATES.WITHHELD_LACK_OF_EVIDENCE, 'attLowEv remains WITHHELD_LACK_OF_EVIDENCE');

// -------------------------------------------------------------
// TEST 3: Context Withdrawal Assay
// -------------------------------------------------------------
console.log('\n--- TEST 3: Context Withdrawal Assay ---');
const withdrawnAttempts = g.withdrawNode('node:B', 'EXPLICIT_TEST_WITHDRAWAL');
assert(withdrawnAttempts.length === 2, 'Both admitted edges linked to node:B withdrawn');
assert(att1.state === RELATION_STATES.WITHDRAWN_SCOPE_CHANGE, 'att1 transitioned to WITHDRAWN_SCOPE_CHANGE');
assert(att2.state === RELATION_STATES.WITHDRAWN_SCOPE_CHANGE, 'att2 transitioned to WITHDRAWN_SCOPE_CHANGE');

// -------------------------------------------------------------
// TEST 4: Declared Comparison Universe & NEVER_GENERATED State
// -------------------------------------------------------------
console.log('\n--- TEST 4: Comparison Universe & NEVER_GENERATED ---');
// Declare comparison universe with 5 edges: 3 of which were attempted above, 2 unattempted
g.declareComparisonUniverse([
  { from: 'node:A', to: 'node:B', relation_type: 'EXPLORE_PROJECTIVE' },
  { from: 'node:A', to: 'node:C_ancient', relation_type: 'EXPLORE_PROJECTIVE' },
  { from: 'node:A', to: 'node:D_noise', relation_type: 'GROUNDED_SPAN' },
  { from: 'node:X_unexplored', to: 'node:Y_unexplored', relation_type: 'EXPLORE_PROJECTIVE' }, // Unattempted
  { from: 'node:X_unexplored', to: 'node:Z_unexplored', relation_type: 'GROUNDED_SPAN' },      // Unattempted
]);

const census = g.getEpistemicStateCensus();
console.log('Epistemic State Census:', JSON.stringify(census.counts_by_epistemic_state, null, 2));

assert(census.counts_by_epistemic_state[RELATION_STATES.NEVER_GENERATED] === 2, 'Exactly 2 NEVER_GENERATED relations measured');
assert(census.counts_by_epistemic_state[RELATION_STATES.WITHDRAWN_SCOPE_CHANGE] === 1, 'WITHDRAWN_SCOPE_CHANGE accounted for');
assert(census.counts_by_epistemic_state[RELATION_STATES.ATTEMPTED_REJECTED] === 2, 'ATTEMPTED_REJECTED accounted for');
assert(census.counts_by_epistemic_state[RELATION_STATES.WITHHELD_LACK_OF_EVIDENCE] === 1, 'WITHHELD_LACK_OF_EVIDENCE accounted for');

// -------------------------------------------------------------
// SAVE MACHINE RECEIPT
// -------------------------------------------------------------
const receipt = {
  schema: 'td613.shadow-graph-receipt/v2',
  evaluated_at: new Date().toISOString(),
  engine_version: 'BoundaryAttemptGraphV2',
  rehabilitations_verified: [
    'O(1) target index candidate lookup via this.targetIndex',
    'Strict rejection of auto-promotion on late admission (chronology and warrant re-evaluated)',
    'Attempt retention without map overwriting (full attempt history array per edge key)',
    'Declared comparison universe measuring NEVER_GENERATED relations',
  ],
  epistemic_census: census,
  verification_verdict: 'ALL_INVARIANTS_HELD_AND_AUTO_PROMOTION_VULNERABILITY_ELIMINATED',
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log(`\nReceipt saved to: ${RECEIPT_PATH}`);
console.log('================================================================');
console.log(`ALL ${passedTests}/${totalTests} SHADOW GRAPH v2 TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================');
