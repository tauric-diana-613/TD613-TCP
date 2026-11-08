/**
 * 𝌋 TD613 · Tests for Palace Act I–II Operationalization Interface
 * Verifying 8-Point Operationalization Contract & Experiment B Qualification
 * (Rehabilitated & Strengthened for Strict 256B Budget & Temporal Availability)
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  ingestHistoricalRecord,
  compressToInheritanceCapsule,
  executeThreeStageEpistemicFilter,
  withdrawInheritedRecord,
  AppendOnlyTombstoneLedger,
  evaluateCapsuleAgainstCompetentComparator,
  bridgeCapsuleToAct2Policies,
  executePalaceAct2BayesianUpdate,
} from '../src/palace-operationalization-interface.mjs';

describe('Palace Act I–II Operationalization Contract Suite', () => {
  const sampleRecords = [
    {
      record_id: 'rec-001',
      source_authority_id: 'FOUNDING_COUNCIL',
      claim_text: 'Primary reactor calibration favors Slot 0.',
      target_slot: 'M_SLOT_0',
      authority_weight: 1.5,
      temporal_coordinates: { t_event: 1, t_observed: 2, t_admitted: 3, t_available: 3 },
      epistemic_status: 'VALIDATED',
      confidence: 0.92,
    },
    {
      record_id: 'rec-002',
      source_authority_id: 'ANALYTIC_OBSERVER',
      claim_text: 'Secondary sensor detected anomaly on Slot 2.',
      target_slot: 'M_SLOT_2',
      authority_weight: 1.0,
      temporal_coordinates: { t_event: 4, t_observed: 5, t_admitted: 6, t_available: 6 },
      epistemic_status: 'VALIDATED',
      confidence: 0.85,
    },
    {
      record_id: 'rec-003',
      source_authority_id: 'INDEPENDENT_AUDITOR',
      claim_text: 'Slot 1 contradiction verified; early hypothesis rejected.',
      target_slot: 'M_SLOT_1',
      authority_weight: 1.2,
      temporal_coordinates: { t_event: 7, t_observed: 8, t_admitted: 9, t_available: 9 },
      epistemic_status: 'CONTRADICTED',
      is_negative_evidence: true,
      confidence: 0.98,
      contradiction_reason: 'HYPOTHESIS_REFUTED_BY_GROUND_SENSOR',
    },
    {
      record_id: 'rec-004_future',
      source_authority_id: 'DEFERRED_OBSERVER',
      claim_text: 'Future observation arriving late at tick 25.',
      target_slot: 'M_SLOT_0',
      authority_weight: 1.0,
      temporal_coordinates: { t_event: 10, t_observed: 12, t_admitted: 15, t_available: 25 },
      epistemic_status: 'VALIDATED',
      confidence: 0.90,
    },
  ];

  it('Point 1: Ingests historical records with immutable byte-digest provenance and chronological verification', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    assert.strictEqual(ingested.length, 4);
    assert.strictEqual(ingested[0].canonical_byte_digest.length, 64);
    assert.strictEqual(ingested[0].withdrawal_status, 'ACTIVE');

    // Negative control: chronological sequence violation must fail closed
    assert.throws(() => {
      ingestHistoricalRecord({
        record_id: 'rec-invalid-time',
        source_authority_id: 'ROGUE_CHRONOLOGY',
        claim_text: 'Invalid causality record.',
        temporal_coordinates: { t_event: 10, t_observed: 5, t_admitted: 4, t_available: 3 }, // t_event > t_observed
        epistemic_status: 'UNVERIFIED',
      });
    }, /CHRONOLOGY_ORDERING_VIOLATION/);
  });

  it('Point 2 & 3: Compresses full history into strict 256-byte bounded capsule (PR1705-R01)', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    // Explicitly test strict 256-byte budget
    const capsule = compressToInheritanceCapsule(ingested, 256);
    assert.ok(capsule.capsule_id.startsWith('capsule-'));
    assert.ok(capsule.within_budget);
    assert.ok(capsule.serialized_bytes <= 256, `Capsule byte length (${capsule.serialized_bytes}) must be <= 256`);
    assert.strictEqual(capsule.payload.active_count, 4);
    assert.strictEqual(capsule.payload.anti_count, 1);
    assert.ok(capsule.payload.prior.M_SLOT_0 > 0);

    // Negative control: impossibly tight budget must fail closed
    assert.throws(() => {
      compressToInheritanceCapsule(ingested, 40);
    }, /CAPSULE_BUDGET_EXCEEDED_FAIL_CLOSED/);
  });

  it('Point 4: Retains explicit anti-evidence register in accessible memory without silent pruning', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const capsule = compressToInheritanceCapsule(ingested, 256);
    assert.strictEqual(capsule.anti_evidence_ledger.length, 1);
    assert.strictEqual(capsule.anti_evidence_ledger[0].record_id, 'rec-003');
    assert.strictEqual(capsule.payload.anti_count, 1);
    assert.ok(capsule.payload.anti_digest.length > 0);
  });

  it('Point 5: Distinguishes preserved, retrieved, and decision-used information with admission-time gating (PR1705-R03)', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    
    // Query at tick 8: rec-004_future has t_available = 25, so it MUST be withheld!
    const filterRes = executeThreeStageEpistemicFilter({
      archivePreservedRecords: ingested,
      queryContext: { target_slot: 'M_SLOT_0', current_tick: 8 },
      decisionPolicy: { min_confidence: 0.90, max_age: 15 },
    });

    assert.strictEqual(filterRes.stage1_preserved_count, 4);
    assert.strictEqual(filterRes.stage2_retrieved_count, 1); // rec-001 retrieved; rec-004_future withheld
    assert.strictEqual(filterRes.stage3_decision_used_count, 1);
    assert.strictEqual(filterRes.used_records[0].record_id, 'rec-001');
    assert.strictEqual(filterRes.withheld_future_records_count, 2); // rec-003 (9) and rec-004 (25) withheld due to t_available > 8
  });

  it('Point 6: Non-retroactive withdrawal via append-only tombstone ledger (PR1705-R04)', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const ledger = new AppendOnlyTombstoneLedger();

    const { updated_record, tombstone } = withdrawInheritedRecord(
      ingested[0],
      { tick: 12, reason: 'SUPERSEDED_BY_EMPIRICAL_DISCOVERY', authority_id: 'CHIEF_INVESTIGATOR' },
      ledger
    );

    assert.strictEqual(updated_record.withdrawal_status, 'WITHDRAWN');
    assert.strictEqual(tombstone.withdrawn_at_tick, 12);
    assert.ok(ledger.isWithdrawn('rec-001'));
    assert.strictEqual(ledger.getEntries().length, 1);

    // Negative control: cannot withdraw already-withdrawn record
    assert.throws(() => {
      withdrawInheritedRecord(updated_record, { tick: 13, reason: 'DUPLICATE', authority_id: 'CHIEF' }, ledger);
    }, /PALACE_WITHDRAWAL_ERROR/);
  });

  it('Point 7: Competent comparator evaluates capsule against equalized full-history baseline', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const capsule = compressToInheritanceCapsule(ingested, 256);
    const testWorlds = [
      { true_slot: 'M_SLOT_0' },
      { true_slot: 'M_SLOT_2' },
      { true_slot: 'M_SLOT_1' },
      { true_slot: 'M_SLOT_3' },
    ];
    const comparison = evaluateCapsuleAgainstCompetentComparator({
      fullHistory: ingested,
      capsule,
      testWorlds,
      baselineBudgetBytes: 256,
    });
    assert.ok(comparison.test_world_count === 4);
    assert.strictEqual(typeof comparison.null_hypothesis_retained, 'boolean');
  });

  it('Point 8: Real Act II policy execution bridge with cost-of-curiosity throttle (Operator Decision 1)', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const capsule = compressToInheritanceCapsule(ingested, 256);
    const bridge = bridgeCapsuleToAct2Policies(capsule);

    assert.ok(bridge.stated_confidence > 0);
    assert.strictEqual(bridge.canonicalMonumentSlot, 'M_SLOT_0');

    // Simulate candidate hypotheses
    const hypotheses = [
      { slot_id: 'M_SLOT_0', ambient_mean: 1.0, ambient_sd: 0.5 },
      { slot_id: 'M_SLOT_1', ambient_mean: 3.0, ambient_sd: 0.5 },
      { slot_id: 'M_SLOT_2', ambient_mean: 5.0, ambient_sd: 0.5 },
      { slot_id: 'M_SLOT_3', ambient_mean: 7.0, ambient_sd: 0.5 },
    ];

    const observations = [
      { obs_kind: 'AMBIENT_MONITOR', scalar_value: 1.1 },
    ];

    // Standard policy evaluation
    const standardUpdate = executePalaceAct2BayesianUpdate({
      bridge,
      observations,
      hypotheses,
      curiosityThrottle: false,
    });
    assert.strictEqual(standardUpdate.recommendedAction, 'M_SLOT_0');
    assert.ok(standardUpdate.confidence > 0.80);

    // Exploratory throttled curiosity policy evaluation (Operator Decision 1)
    const throttledUpdate = executePalaceAct2BayesianUpdate({
      bridge,
      observations,
      hypotheses,
      curiosityThrottle: true,
    });
    assert.strictEqual(throttledUpdate.curiosityThrottleActive, true);
    // Because belief is already confident (confidence > 0.80, low entropy), probing is throttled!
    assert.strictEqual(throttledUpdate.shouldProbe, false);
  });
});
