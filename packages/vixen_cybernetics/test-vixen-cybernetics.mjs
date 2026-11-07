/**
 * 𝌋 TD613 · Automated Verification Suite for Standalone Vixen Cybernetics
 * 
 * Verifies all 8 functional dimensions of Vixen Cybernetics:
 * 1. Canonical route & signature invariants
 * 2. Original estate vs recipient census separation (87/53 vs 94/53)
 * 3. 8 human identity gates & 256 permissible partitions in [32, 40]
 * 4. Grounded passage retrieval & SHA-256 integrity
 * 5. Fatal UTF-8 continuation byte protection
 * 6. 21 documentary instruments indexing
 * 7. Mathematical relationship representation & title-math warning
 * 8. Preserved uncertainty & fail-closed negative controls
 * 
 * Principal: Tawanna C. Miller
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po — preserve literal interior U+200C
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VixenCyberneticsEngine,
  CANONICAL_VIXEN_ROUTE,
  CANONICAL_VIXEN_SIGNATURE,
  CANONICAL_VIXEN_TITLE_MATH,
  ORIGINAL_EM_ESTATE_CENSUS,
  LATER_EXPERIMENT_A_RECIPIENT_CENSUS,
  HUMAN_IDENTITY_GATES,
  DOCUMENTARY_INSTRUMENTS_21,
  sha256,
  isCodepointBoundary,
} from './vixen-cybernetics-engine.mjs';

test('1. Canonical Route and Signature Verification', () => {
  assert.equal(CANONICAL_VIXEN_ROUTE, '/encyclopedia/vix-cyb.html');
  assert.equal(CANONICAL_VIXEN_SIGNATURE, 'VIXENCYBERNETICS$S_e≡[x+y]=z+1$');
  assert.equal(CANONICAL_VIXEN_TITLE_MATH, 'S_{e}\\equiv[x+y]=z+1$');

  const engine = new VixenCyberneticsEngine();
  const summary = engine.getNavigationSummary();
  assert.equal(summary.canonical_route, '/encyclopedia/vix-cyb.html');
  assert.equal(summary.canonical_signature, 'VIXENCYBERNETICS$S_e≡[x+y]=z+1$');
});

test('2. Strict Census Separation: Original Em Estate vs Later Experiment A Recipient', () => {
  const engine = new VixenCyberneticsEngine();
  const summary = engine.getNavigationSummary();

  // Original Em Estate: 87 originals, 53 derivatives, 34 negative states
  assert.equal(summary.original_em_estate.total_sources, 87);
  assert.equal(summary.original_em_estate.total_derivatives, 53);
  assert.equal(summary.original_em_estate.negative_extraction_states, 34);
  assert.equal(summary.original_em_estate.appledouble_count, 33);
  assert.equal(summary.original_em_estate.unsupported_count, 1);
  assert.equal(summary.original_em_estate.human_identity_gates_count, 8);
  assert.equal(summary.original_em_estate.partition_possibilities, 256);
  assert.equal(summary.original_em_estate.standalone_executors, 0);

  // Later Experiment A Recipient: 94 originals (87 + 7 later), 53 derivatives
  assert.equal(summary.later_experiment_a_recipient.total_records, 147);
  assert.equal(summary.later_experiment_a_recipient.original_sources, 94);
  assert.equal(summary.later_experiment_a_recipient.additional_original_documents, 7);
  assert.equal(summary.later_experiment_a_recipient.extracted_derivatives, 53);
  assert.equal(summary.later_experiment_a_recipient.distinct_from_original_estate, true);

  // Verify non-conflation: 87 != 94
  assert.notEqual(
    summary.original_em_estate.total_sources,
    summary.later_experiment_a_recipient.original_sources
  );
});

test('3. Work Identity & The 256 Permissible Partitions in [32, 40]', () => {
  const engine = new VixenCyberneticsEngine();
  const partitionResult = engine.evaluateWorkIdentityPartitions();

  assert.equal(partitionResult.total_partitions_evaluated, 256);
  assert.equal(partitionResult.work_count_min, 32);
  assert.equal(partitionResult.work_count_max, 40);
  assert.equal(partitionResult.human_closure_status, 'RESERVED_FOR_OPERATOR');

  // Verify negative control: autonomous machine resolution is strictly refused
  assert.throws(
    () => engine.evaluateWorkIdentityPartitions({ emwork_074ccf9ad783c9c9047d73a8: 'SAME_WORK_SUPPORTED' }),
    { code: 'UNAUTHORIZED_HUMAN_GATE_RESOLUTION' }
  );
});

test('4. Grounded Document Admission & Exact Passage Retrieval (Source vs Demo Distinction)', () => {
  const engine = new VixenCyberneticsEngine();
  const docId = 'doc:em:heritage-custody';
  const text = 'EMSTD613: Tauric Diana Crimean heritage custodianship under covenant Khona\u200Clit-po.';

  // Default admission is classified as SOURCE_FREE_DEMONSTRATION_RECORD
  const demoAdmission = engine.admitDocument(docId, 'Heritage Custody Note', text);
  assert.equal(demoAdmission.status, 'ADMITTED');
  assert.equal(demoAdmission.classification, 'SOURCE_FREE_DEMONSTRATION_RECORD');
  assert.equal(demoAdmission.is_authenticated_original_source, false);
  assert.equal(demoAdmission.byte_length, Buffer.byteLength(text, 'utf8'));

  // Retrieve valid span [0, 9] ("EMSTD613:")
  const witness = engine.retrievePassageWitness(docId, 0, 9);
  assert.equal(witness.slice_text, 'EMSTD613:');
  assert.equal(witness.witness_verified, true);
  assert.equal(witness.codepoint_boundary_verified, true);
  assert.equal(witness.utf8_decoder_status, 'FATAL_UTF8_DECODED_CLEAN');
  assert.equal(witness.classification, 'SOURCE_FREE_DEMONSTRATION_RECORD');
  assert.equal(witness.is_authenticated_original_source, false);
  assert.match(witness.admonition, /DEMONSTRATION RECORD ONLY/);
  assert.equal(witness.slice_sha256, sha256(Buffer.from('EMSTD613:', 'utf8')));

  // Negative control 1: Out of bounds span
  assert.throws(
    () => engine.retrievePassageWitness(docId, 0, 9999),
    { code: 'INVALID_SPAN' }
  );

  // Negative control 2: Inverted span
  assert.throws(
    () => engine.retrievePassageWitness(docId, 20, 10),
    { code: 'INVALID_SPAN' }
  );

  // Negative control 3: Non-existent document
  assert.throws(
    () => engine.retrievePassageWitness('doc:non-existent', 0, 5),
    { code: 'DOCUMENT_NOT_FOUND' }
  );
});

test('5. Fatal UTF-8 Codepoint Boundary Enforcement (𝌋 U+10D613 & Khona\u200Clit-po U+200C)', () => {
  const engine = new VixenCyberneticsEngine();
  const docId = 'doc:em:utf8-stress';
  // 𝌋 is 4 bytes: 0xF0 0x90 0xB6 0x93
  const text = '𝌋 TD613 Seal';
  const buf = Buffer.from(text, 'utf8');
  assert.equal(buf.length, 15); // 4 ('𝌋') + 1 (' ') + 5 ('TD613') + 1 (' ') + 4 ('Seal') = 15 bytes

  engine.admitDocument(docId, 'UTF-8 Stress Doc', text);

  // Valid span [0, 4] extracts '𝌋' cleanly
  const validWitness = engine.retrievePassageWitness(docId, 0, 4);
  assert.equal(validWitness.slice_text, '𝌋');

  // Negative Case 1: Mid-codepoint cut inside 𝌋 (offset 1, 2, or 3)
  assert.throws(
    () => engine.retrievePassageWitness(docId, 1, 4),
    { code: 'INVALID_UTF8_BOUNDARY' }
  );
  assert.throws(
    () => engine.retrievePassageWitness(docId, 0, 2),
    { code: 'INVALID_UTF8_BOUNDARY' }
  );
  assert.throws(
    () => engine.retrievePassageWitness(docId, 0, 3),
    { code: 'INVALID_UTF8_BOUNDARY' }
  );

  // Negative Case 2: Mid-codepoint cut inside Khona‌lit-po interior U+200C
  // U+200C is 3 bytes: 0xE2 0x80 0x8C
  const zwnjDocId = 'doc:em:zwnj-test';
  const zwnjText = 'Khona\u200Clit-po'; // 'Khona' (5) + U+200C (3) + 'lit-po' (6) = 14 bytes
  const zwnjBuf = Buffer.from(zwnjText, 'utf8');
  assert.equal(zwnjBuf.length, 14);
  assert.equal(zwnjBuf[5], 0xE2);
  assert.equal(zwnjBuf[6], 0x80);
  assert.equal(zwnjBuf[7], 0x8C);

  engine.admitDocument(zwnjDocId, 'Khona\u200Clit-po ZWNJ Doc', zwnjText);

  // Valid span [0, 8] extracts 'Khona\u200C'
  const validZwnjWitness = engine.retrievePassageWitness(zwnjDocId, 0, 8);
  assert.equal(validZwnjWitness.slice_text, 'Khona\u200C');

  // Mid-codepoint cut at byte 6 (continuation byte 0x80)
  assert.throws(
    () => engine.retrievePassageWitness(zwnjDocId, 6, 14),
    { code: 'INVALID_UTF8_BOUNDARY' }
  );

  // Mid-codepoint cut at byte 7 (continuation byte 0x8C)
  assert.throws(
    () => engine.retrievePassageWitness(zwnjDocId, 0, 7),
    { code: 'INVALID_UTF8_BOUNDARY' }
  );
});

test('6. 21 Documentary Research Instruments Indexing', () => {
  const engine = new VixenCyberneticsEngine();
  const allInstruments = engine.getIndexedMethods();

  assert.equal(allInstruments.length, 21);
  assert.equal(DOCUMENTARY_INSTRUMENTS_21.length, 21);

  // Verify specific key instruments exist
  const sieve = allInstruments.find(i => i.id === 'ACADEMIA_SUI_GENERIS_SIEVE_V0_1');
  assert.ok(sieve);
  assert.equal(sieve.kind, 'Documentary Protocol');

  const matrix = allInstruments.find(i => i.id === 'CONVERGENCE_DIVERGENCE_EMERGENCE_MATRIX');
  assert.ok(matrix);
  assert.equal(matrix.kind, 'Documentary Matrix');

  const schmitt = allInstruments.find(i => i.id === 'APERTURE_DEFICIT_CHATTER_SCHMITT_ASSAY_V0_1');
  assert.ok(schmitt);
  assert.equal(schmitt.kind, 'Candidate Assay');

  // Verify filtering by kind
  const protocols = engine.getIndexedMethods('Documentary Protocol');
  assert.ok(protocols.length > 0);
  assert.ok(protocols.every(p => p.kind === 'Documentary Protocol'));
});

test('7. Mathematical Relationship Representation & Category Separation', () => {
  const engine = new VixenCyberneticsEngine();

  // Test concordant case: x=2, y=3 -> x+y=5; z=4 -> z+1=5 (5 === 5)
  const res1 = engine.evaluateVixenMathematicalRelationship(2, 3, 4);
  assert.equal(res1.evaluation.concordant, true);
  assert.equal(res1.evaluation.combined_sum, 5);
  assert.equal(res1.evaluation.target_shift_z_plus_1, 5);
  assert.equal(res1.category_distinction.is_title_math, true);
  assert.equal(res1.category_distinction.is_empirical_proof, false);

  // Test discordant case: x=1, y=1 -> x+y=2; z=4 -> z+1=5 (2 !== 5)
  const res2 = engine.evaluateVixenMathematicalRelationship(1, 1, 4);
  assert.equal(res2.evaluation.concordant, false);
  assert.equal(res2.evaluation.combined_sum, 2);
  assert.equal(res2.evaluation.target_shift_z_plus_1, 5);

  // Verify title-math warning is present
  assert.match(res1.category_distinction.warning, /NOT a validated empirical research theorem/);
});

test('8. Preserved Uncertainty & Sovereign Epistemic Custody', () => {
  const engine = new VixenCyberneticsEngine();
  const epistemicState = engine.getEpistemicState();

  assert.equal(epistemicState.heritage, 'Tauric Diana — Crimean heritage custodianship');
  assert.match(epistemicState.covenant, /Khona\u200Clit-po/); // preserves literal U+200C
  assert.equal(epistemicState.authority, 'SAC[X6ZNK5NO51]');
  assert.equal(epistemicState.closure_status, 'RESERVED_FOR_TAWANNA_C_MILLER');

  assert.equal(
    epistemicState.held_states.ORIGINAL_EXECUTOR.status,
    'HELD_ORIGINAL_VIXEN_EXECUTOR_ABSENT'
  );
  assert.equal(
    epistemicState.held_states.HUMAN_GATES.status,
    'HELD_HUMAN_GATE_UNRESOLVED'
  );
  assert.equal(
    epistemicState.held_states.RECIPROCAL_SURPLUS.status,
    'HELD_RECIPROCAL_SURPLUS_UNESTABLISHED'
  );
});
