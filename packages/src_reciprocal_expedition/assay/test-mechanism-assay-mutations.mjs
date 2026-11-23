/**
 * 𝌋 TD613 · Mechanism Assay Mutation & Adversarial Falsification Suite
 * 
 * Verifies that the rehabilitated measurement instrument (run-mechanism-assay-v2.mjs)
 * is sensitive to defects, and that metrics dynamically drop when corrupted.
 */

import { runCellV2, corpusV2, expectedV2, evaluateGroundedSpanWarrant } from './run-mechanism-assay-v2.mjs';

console.log('================================================================');
console.log('MECHANISM ASSAY MUTATION & SENSITIVITY TEST SUITE');
console.log('================================================================\n');

let testsPassed = 0;
let testsTotal = 0;

function assert(condition, message) {
  testsTotal++;
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
  testsPassed++;
}

// -------------------------------------------------------------
// BASELINE: All tests pass under nominal corpus
// -------------------------------------------------------------
console.log('--- TEST 1: Nominal Baseline Performance ---');
const nominalC1 = runCellV2({ cellId: 'C1_nominal', order: 'ENCYCLOPEDIA_FIRST', retrievalEnabled: true });
assert(nominalC1.metrics.grounded_recall === 1.0, 'Baseline recall is 1.0');
assert(nominalC1.metrics.candidate_precision === 1.0, 'Baseline precision is 1.0');
assert(nominalC1.metrics.chronological_correctness === 1.0, 'Baseline chronology is 1.0');
assert(nominalC1.metrics.exact_source_span_valid === true, 'Baseline exact spans valid is true');
assert(nominalC1.metrics.admitted_false_link_count === 0, 'Baseline admitted false links is 0');
assert(nominalC1.metrics.unsupported_link_count === 0, 'Baseline unsupported link count is 0');

// -------------------------------------------------------------
// MUTATION 1: Chronological Inversion (target_beta made older than source)
// -------------------------------------------------------------
console.log('\n--- TEST 2: Chronological Inversion Mutation ---');
const mutatedCorpusChronology = JSON.parse(JSON.stringify(corpusV2));
// Move target_beta created date to before doc:explicit_explore_1 (2026-07-01 vs 2026-08-01)
const targetBeta = mutatedCorpusChronology.catalog.find(c => c.record_id === 'doc:target_beta');
targetBeta.created = '2026-07-01T00:00:00Z';
const docTargetBeta = mutatedCorpusChronology.documents.find(d => d.source_id === 'doc:target_beta');
docTargetBeta.created = '2026-07-01T00:00:00Z';

const mutC1Chrono = runCellV2({
  cellId: 'C1_mut_chrono',
  order: 'ENCYCLOPEDIA_FIRST',
  retrievalEnabled: true,
  corpus: mutatedCorpusChronology,
});
// Target is now in the past of all sources, so all edges should be blocked by PREEXISTING_CHRONOLOGY_BLOCKED!
assert(mutC1Chrono.metrics.admitted_edge_count === 0, 'All edges blocked by chronology mutation');
assert(mutC1Chrono.metrics.grounded_recall === 0.0, 'Recall dropped to 0.0 on chronological inversion');
assert(mutC1Chrono.metrics.retained_rejections_count > nominalC1.metrics.retained_rejections_count, 'Rejections increased on chronology failure');

// -------------------------------------------------------------
// MUTATION 2: Span Text / Coordinate Corruption Mutation
// -------------------------------------------------------------
console.log('\n--- TEST 3: Coordinate & Span Corruption Mutation ---');
// Test evaluateGroundedSpanWarrant directly on corrupted coordinates
const corruptSpan1 = { byte_start: 10.5, byte_end: 20, text_span: 'Target Beta Document' };
const warrant1 = evaluateGroundedSpanWarrant(corruptSpan1, { title: 'Target Beta Document' });
assert(warrant1.warranted === false && warrant1.reason === 'INVALID_SPAN_COORDINATES', 'Rejected fractional byte coordinate');

const corruptSpan2 = { byte_start: -5, byte_end: 20, text_span: 'Target Beta Document' };
const warrant2 = evaluateGroundedSpanWarrant(corruptSpan2, { title: 'Target Beta Document' });
assert(warrant2.warranted === false && warrant2.reason === 'INVALID_SPAN_COORDINATES', 'Rejected negative byte coordinate');

const corruptSpan3 = { byte_start: 50, byte_end: 20, text_span: 'Target Beta Document' };
const warrant3 = evaluateGroundedSpanWarrant(corruptSpan3, { title: 'Target Beta Document' });
assert(warrant3.warranted === false && warrant3.reason === 'INVALID_SPAN_COORDINATES', 'Rejected inverted byte span [50, 20]');

const corruptSpan4 = { byte_start: 0, byte_end: 20, text_span: 'Completely Different Text' };
const warrant4 = evaluateGroundedSpanWarrant(corruptSpan4, { title: 'Target Beta Document' });
assert(warrant4.warranted === false && warrant4.reason === 'EXACT_SPAN_TEXT_MISMATCH', 'Rejected span text mismatch');

// -------------------------------------------------------------
// MUTATION 3: Unwarranted Noise & Predicate Failure
// -------------------------------------------------------------
console.log('\n--- TEST 4: Noise Rejection & Insufficient Predicate Mutation ---');
const noiseSpan = {
  byte_start: 0,
  byte_end: 80,
  text_span: 'Discussion of unrelated weather events. Mentions Target Beta Document in passing as an arbitrary metaphor.',
};
const noiseWarrant = evaluateGroundedSpanWarrant(noiseSpan, { title: 'Target Beta Document' });
assert(noiseWarrant.warranted === false && noiseWarrant.reason === 'UNWARRANTED_NOISE_REJECTED', 'Noise predicate correctly detected and rejected');

const bareSpan = {
  byte_start: 0,
  byte_end: 30,
  text_span: 'Here is Target Beta Document.',
};
const bareWarrant = evaluateGroundedSpanWarrant(bareSpan, { title: 'Target Beta Document' });
assert(bareWarrant.warranted === false && bareWarrant.reason === 'INSUFFICIENT_EVIDENCE_WARRANT', 'Bare span lacking positive evidence predicate rejected');

// -------------------------------------------------------------
// MUTATION 4: Unexpected Extra Admitted Edge -> Drops Precision
// -------------------------------------------------------------
console.log('\n--- TEST 5: Unexpected Edge Mutation (Precision Drop Test) ---');
const mutatedExpected = JSON.parse(JSON.stringify(expectedV2));
// Remove one expected edge from manifest so an admitted edge becomes an admitted false positive
mutatedExpected.expected_warranted_relations.retrieval_enabled.pop();

const mutC1Prec = runCellV2({
  cellId: 'C1_mut_prec',
  order: 'ENCYCLOPEDIA_FIRST',
  retrievalEnabled: true,
  expected: mutatedExpected,
});
assert(mutC1Prec.metrics.admitted_false_link_count === 1, 'Admitted false link count detected extra edge');
assert(mutC1Prec.metrics.candidate_precision < 1.0, 'Precision dropped below 1.0 when extra edge was admitted');

console.log('\n================================================================');
console.log(`ALL ${testsPassed}/${testsTotal} MUTATION SENSITIVITY TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================');
