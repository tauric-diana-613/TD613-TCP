/**
 * 𝌋 TD613 · Automated Test Suite for A-PFR0 Postflight-Redo Readiness Apparatus
 * 
 * Verifies:
 * 1. Demonstrable zero-row initial witnesses across all Four Crossings
 * 2. Strict isolation and schema conformity of all 4 recipients
 * 3. Source-span byte integrity separation from claim entailment
 * 4. Execution boundary separation: A-PFR0 complete vs A-PFR1 HELD
 * 5. Prohibition against declaring protected postflight records or simulating real flights
 * 6. RGI-01 preservation as PROPOSED_PROSPECTIVE_RECORD_ONLY without Wolfram runtime
 * 7. Correct receipt generation and cryptographic witness emission
 * 
 * Principal: Tawanna C. Miller
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po — preserve literal interior U+200C
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  APFR0RedoApparatus,
  A_PFR0_SCHEMA_V1,
  FOUR_CROSSING_SPECS,
} from './a-pfr0-postflight-redo-apparatus.mjs';

test('1. Demonstrable Zero-Row Initial Witness Verification (All 4 Crossings)', () => {
  const apparatus = new APFR0RedoApparatus();
  const witness = apparatus.auditZeroStateWitnesses();

  assert.equal(witness.schema, A_PFR0_SCHEMA_V1);
  assert.equal(witness.all_crossings_zero_state, true);
  assert.ok(witness.witness_sha256 && witness.witness_sha256.length === 64);

  // Check Crossing S
  assert.equal(witness.crossings.CROSSING_S.all_zero, true);
  assert.equal(witness.crossings.CROSSING_S.tables_audited, 7);

  // Check Crossing E
  assert.equal(witness.crossings.CROSSING_E.all_zero, true);
  assert.equal(witness.crossings.CROSSING_E.tables_audited, 6);

  // Check Crossing W
  assert.equal(witness.crossings.CROSSING_W.all_zero, true);
  assert.equal(witness.crossings.CROSSING_W.tables_audited, 5);

  // Check Crossing T
  assert.equal(witness.crossings.CROSSING_T.all_zero, true);
  assert.equal(witness.crossings.CROSSING_T.tables_audited, 5);
});

test('2. Four-Crossing Preflight Specifications and Censuses', () => {
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_S.crossing_id, 'CROSSING_S_SIGNALRUPTURE');
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_E.crossing_id, 'CROSSING_E_EMSTD613');
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_W.crossing_id, 'CROSSING_W_WENDBINE');
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_T.crossing_id, 'CROSSING_T_UNIVERSAL_ATELIER');

  // Verify Crossing E maintains exact distinction between original census and recipient
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_E.historical_census.sources, 87);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_E.historical_census.derivatives, 53);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_E.historical_census.negative_states, 34);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_E.recipient_census.sources, 94);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_E.recipient_census.additional_docs, 7);

  // Verify Crossing W census
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_W.census.posts, 33);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_W.census.concepts, 191);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_W.census.relations, 146);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_W.census.families, 9);

  // Verify Crossing T common fixture
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_T.common_fixture.records, 26);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_T.common_fixture.links, 14);
  assert.equal(FOUR_CROSSING_SPECS.CROSSING_T.common_fixture.comparator_dimensions, 12);
});

test('3. Source-to-Claim Warrant Boundary Enforcement', () => {
  const apparatus = new APFR0RedoApparatus();
  const sourceText = 'EMSTD613 primary source: Historical preservation of Crimean custodianship.';
  const claimText = 'Autonomous multi-agent synergy is proven without human verification.';

  const warrantResult = apparatus.verifySourceToClaimWarrantBoundary(sourceText, claimText);

  // Byte integrity is verified
  assert.equal(warrantResult.source_span_integrity, 'SOURCE_SPAN_INTEGRITY_VERIFIED');
  assert.ok(warrantResult.source_sha256);

  // But claim entailment is strictly HELD
  assert.equal(warrantResult.claim_warrant_status, 'CLAIM_ENTAILMENT_HELD');
  assert.equal(warrantResult.warrant_boundary_honored, true);
  assert.match(warrantResult.admonition, /ZERO evidence that the source semantically entails the claimed proposition/);
});

test('4. Execution Boundary Separation: A-PFR0 vs A-PFR1 vs Experiment B', () => {
  const apparatus = new APFR0RedoApparatus();
  const boundaries = apparatus.evaluateExecutionBoundaries();

  // A-PFR0 is ready
  assert.equal(boundaries.a_pfr0_status, 'SOURCE_FREE_INSTRUMENT_READINESS_COMPLETE');

  // A-PFR1 is strictly HELD
  assert.equal(boundaries.a_pfr1_status, 'HELD_PENDING_GENUINE_COMPLETED_FLIGHT');

  // No protected postflight record exists
  assert.equal(boundaries.protected_postflight_record_present, false);

  // Experiment B Flight is HELD
  assert.equal(boundaries.protected_experiment_b_flight, 'HELD');

  // Simulated flight as real evidence is strictly forbidden
  assert.equal(boundaries.simulated_flight_as_real_permitted, false);

  // RGI-01 is prospective only, with no runtime
  assert.equal(boundaries.rgi_01_status, 'PROPOSED_PROSPECTIVE_RECORD_ONLY');
  assert.equal(boundaries.rgi_01_wolfram_runtime_active, false);

  // Ash Keep anti-predetermined discovery is active
  assert.equal(boundaries.ash_keep_anti_predetermined_discovery_active, true);

  // Human closure reserved
  assert.equal(boundaries.human_closure, 'RESERVED_FOR_TAWANNA_C_MILLER');
  assert.equal(boundaries.authority, 'SAC[X6ZNK5NO51]');
});

test('5. Full Readiness Receipt Generation', () => {
  const apparatus = new APFR0RedoApparatus();
  const testReceiptPath = path.resolve('C:/td613-worktrees/a-pfr0-vixen-readiness/packages/four_crossing_capstone/a-pfr0-readiness-receipt.json');

  const receipt = apparatus.generateReadinessReceipt(testReceiptPath);

  assert.equal(receipt.schema, A_PFR0_SCHEMA_V1);
  assert.equal(receipt.status, 'A_PFR0_READINESS_QUALIFIED');
  assert.equal(receipt.four_crossing_preflight_readiness.crossing_s.status, 'READY');
  assert.equal(receipt.four_crossing_preflight_readiness.crossing_e.status, 'READY');
  assert.equal(receipt.four_crossing_preflight_readiness.crossing_w.status, 'READY');
  assert.equal(receipt.four_crossing_preflight_readiness.crossing_t.status, 'READY');

  assert.equal(receipt.preflight_negative_controls.unadmitted_postflight_file_rejected, true);
  assert.equal(receipt.preflight_negative_controls.simulated_flight_promotion_refused, true);
  assert.equal(receipt.preflight_negative_controls.claim_from_hash_conflation_refused, true);
  assert.equal(receipt.preflight_negative_controls.unauthorized_human_gate_resolution_refused, true);

  assert.ok(fs.existsSync(testReceiptPath));
});
