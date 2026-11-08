/**
 * 𝌋 TD613 · Shadow Graph Engine v3 Adversarial Verification Suite
 * 
 * Formal Verification of Repairs for Findings S21-F01 and S21-F02:
 * 1. Default-deny warrant validation contract (arbitrary warrants rejected).
 * 2. Relation-specific temporal rules (backward citations legitimately permitted; forward cues strictly forward).
 * 3. Two-phase late admission with explicit PENDING_READJUDICATION state.
 * 4. Retained event history verification.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BoundaryAttemptGraphV3, RELATION_STATES, WARRANT_CONTRACTS } from './shadow_graph_engine_v3.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'shadow-graph-receipt-v3.json');

console.log('================================================================');
console.log('SHADOW GRAPH ENGINE v3 DEFAULT-DENY & TEMPORAL VERIFICATION');
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

const g = new BoundaryAttemptGraphV3();

// -------------------------------------------------------------
// TEST 1: Default-Deny on Arbitrary or Fabricated Warrants
// -------------------------------------------------------------
console.log('--- TEST 1: Default-Deny Warrant Enforcement ---');
g.registerNode('doc:source_2026', { created_at: '2026-08-01T12:00:00Z' }, true);
g.registerNode('doc:target_2026', { created_at: '2026-08-05T12:00:00Z' }, true);

// Attempt with fabricated warrant
const attFabricated = g.recordAttempt({
  from: 'doc:source_2026',
  to: 'doc:target_2026',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: 'FABRICATED_CITATION_STRING_XYZ',
});
assert(attFabricated.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Arbitrary warrant rejected by default-deny');
assert(attFabricated.reason.includes('UNRECOGNIZED_OR_FABRICATED_WARRANT_DENIED'), 'Reason cites unrecognized warrant');

// Attempt with empty warrant
const attEmpty = g.recordAttempt({
  from: 'doc:source_2026',
  to: 'doc:target_2026',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: '',
});
assert(attEmpty.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Empty warrant rejected');

// Attempt with mismatched relation type
const attMismatch = g.recordAttempt({
  from: 'doc:source_2026',
  to: 'doc:target_2026',
  relation_type: 'GROUNDED_SPAN_CO_OCCURRENCE',
  proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE', // explore cue cannot warrant grounded span
});
assert(attMismatch.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Relation-type mismatch rejected');
assert(attMismatch.reason.includes('WARRANT_RELATION_MISMATCH'), 'Reason cites relation mismatch');

// -------------------------------------------------------------
// TEST 2: Relation-Specific Chronology (Historical Citation vs Forward Exploration)
// -------------------------------------------------------------
console.log('\n--- TEST 2: Relation-Specific Chronology & Backward Citation ---');
g.registerNode('doc:foundation_paper_2024', { created_at: '2024-01-01T00:00:00Z' }, true);
g.registerNode('doc:current_paper_2026', { created_at: '2026-08-10T12:00:00Z' }, true);

// Negative control: citation without adjudicator receipt fails closed
const attCitationNoAdj = g.recordAttempt({
  from: 'doc:current_paper_2026',
  to: 'doc:foundation_paper_2024',
  relation_type: 'HISTORICAL_CITATION',
  proposed_warrant: 'HISTORICAL_RETROSPECTIVE_CITATION',
  warrant_params: {
    citation_verified: true,
  },
});
assert(attCitationNoAdj.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Citation missing adjudicator receipt fails closed');
assert(attCitationNoAdj.reason === 'ADJUDICATOR_RECEIPT_ID_REQUIRED', 'Cites required adjudicator receipt');

// Later paper legitimately citing earlier foundation paper with full adjudicator verification
const attCitation = g.recordAttempt({
  from: 'doc:current_paper_2026',
  to: 'doc:foundation_paper_2024',
  relation_type: 'HISTORICAL_CITATION',
  proposed_warrant: 'HISTORICAL_RETROSPECTIVE_CITATION',
  warrant_params: {
    citation_verified: true,
    adjudicator_receipt_id: 'rec:adj_historical_001',
  },
});
assert(attCitation.state === RELATION_STATES.ADMITTED, 'Backward historical citation is ADMITTED');
assert(attCitation.temporal_classification === 'PREEXISTING', 'Temporal classification recorded as PREEXISTING');
assert(attCitation.admitted_warrant === 'HISTORICAL_RETROSPECTIVE_CITATION', 'Warrant recorded as admitted');

// Negative control: unverified cross reference fails closed
const attCrossUnverified = g.recordAttempt({
  from: 'doc:current_paper_2026',
  to: 'doc:source_2026',
  relation_type: 'CROSS_REFERENCE',
  proposed_warrant: 'CONTEMPORANEOUS_CROSS_REFERENCE',
  warrant_params: {},
});
assert(attCrossUnverified.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Cross reference without verified predicate fails closed');
assert(attCrossUnverified.reason === 'CROSS_REFERENCE_EVIDENCE_NOT_VERIFIED', 'Cites unverified cross reference');

// Forward exploration attempt pointing backwards in time
const attForwardBackward = g.recordAttempt({
  from: 'doc:current_paper_2026',
  to: 'doc:foundation_paper_2024',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
  warrant_params: {
    cue_verified: true,
    adjudicator_receipt_id: 'rec:adj_explore_001',
    evidence_coordinates: { line: 42, offset: 12 },
  },
});
assert(attForwardBackward.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Forward exploration pointing backward is REJECTED');
assert(attForwardBackward.reason === 'FORWARD_ROUTING_CANNOT_ROUTE_TO_PREEXISTING_TARGET', 'Cites forward routing temporal constraint');

// -------------------------------------------------------------
// TEST 3: Two-Phase Late Admission with PENDING_READJUDICATION
// -------------------------------------------------------------
console.log('\n--- TEST 3: Two-Phase Late Admission & Re-adjudication ---');
g.registerNode('doc:delayed_target', { created_at: '2026-08-15T00:00:00Z' }, false);

// Candidate 1: Valid forward exploration cue
const attDelayedValid = g.recordAttempt({
  from: 'doc:current_paper_2026',
  to: 'doc:delayed_target',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
  warrant_params: {
    cue_verified: true,
    adjudicator_receipt_id: 'rec:adj_delayed_001',
    evidence_coordinates: { line: 10, offset: 5 },
  },
});
assert(attDelayedValid.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Initially rejected on unadmitted target');

// Candidate 2: Fabricated warrant pointing to delayed target from different source
const attDelayedFabricated = g.recordAttempt({
  from: 'doc:source_2026',
  to: 'doc:delayed_target',
  relation_type: 'EXPLORE_PROJECTIVE',
  proposed_warrant: 'INVENTED_WARRANT_TRYING_TO_SLIP_IN',
});
assert(attDelayedFabricated.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Initially rejected on unadmitted target');

console.log('[ACTION] Admitting doc:delayed_target...');
const lateResult = g.admitDelayedNode('doc:delayed_target', { created_at: '2026-08-15T00:00:00Z' }, {
  [attDelayedValid.attempt_id]: {
    cue_verified: true,
    adjudicator_receipt_id: 'rec:adj_delayed_001',
    evidence_coordinates: { line: 10, offset: 5 },
  },
});

assert(lateResult.admitted.length === 1, 'Exactly 1 valid attempt promoted to ADMITTED');
assert(lateResult.retained_rejected.length === 1, 'Fabricated warrant attempt remains REJECTED');
assert(attDelayedValid.state === RELATION_STATES.ADMITTED, 'Valid attempt transitioned to ADMITTED');
assert(attDelayedFabricated.state === RELATION_STATES.ATTEMPTED_REJECTED, 'Fabricated warrant remains REJECTED');

// Verify transitional history contains PENDING_READJUDICATION
const validTransitions = attDelayedValid.history.map(h => h.state);
assert(validTransitions.includes(RELATION_STATES.PENDING_READJUDICATION), 'attDelayedValid transitioned through PENDING_READJUDICATION');
assert(validTransitions[validTransitions.length - 1] === RELATION_STATES.ADMITTED, 'Final state is ADMITTED');

const fabTransitions = attDelayedFabricated.history.map(h => h.state);
assert(fabTransitions.includes(RELATION_STATES.PENDING_READJUDICATION), 'attDelayedFabricated transitioned through PENDING_READJUDICATION');
assert(fabTransitions[fabTransitions.length - 1] === RELATION_STATES.ATTEMPTED_REJECTED, 'Final state is ATTEMPTED_REJECTED');

// -------------------------------------------------------------
// TEST 4: Comparison Universe & Epistemic State Census
// -------------------------------------------------------------
console.log('\n--- TEST 4: Comparison Universe & Census ---');
g.declareComparisonUniverse([
  { from: 'doc:current_paper_2026', to: 'doc:foundation_paper_2024', relation_type: 'HISTORICAL_CITATION' },
  { from: 'doc:current_paper_2026', to: 'doc:delayed_target', relation_type: 'EXPLORE_PROJECTIVE' },
  { from: 'doc:unexplored_a', to: 'doc:unexplored_b', relation_type: 'EXPLORE_PROJECTIVE' },
]);

const census = g.getEpistemicStateCensus();
console.log('Epistemic State Census:', JSON.stringify(census.counts_by_epistemic_state, null, 2));

assert(census.counts_by_epistemic_state[RELATION_STATES.ADMITTED] === 2, '2 ADMITTED edges in census');
assert(census.counts_by_epistemic_state[RELATION_STATES.NEVER_GENERATED] === 1, '1 NEVER_GENERATED edge measured');

// -------------------------------------------------------------
// EMIT RECEIPT
// -------------------------------------------------------------
const receipt = {
  schema: 'td613.shadow-graph-receipt/v3',
  evaluated_at: new Date().toISOString(),
  engine_version: 'BoundaryAttemptGraphV3',
  verified_rehabilitations: [
    'Default-deny warrant validation: unrecognized/fabricated warrants strictly rejected',
    'Relation-specific temporal rules: backward historical citations permitted; forward exploration strictly forward',
    'Two-phase re-adjudication: PENDING_READJUDICATION precedes predicate validation',
    'Retained event history preserves full trajectory without in-place mutation loss',
    'Comparison universe accurately measures NEVER_GENERATED relations',
  ],
  census,
  verdict: 'ALL_SHADOW_GRAPH_V3_DEFAULT_DENY_INVARIANTS_HELD',
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log(`\nReceipt saved to: ${RECEIPT_PATH}`);
console.log('================================================================');
console.log(`ALL ${passedTests}/${totalTests} SHADOW GRAPH v3 TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================');
