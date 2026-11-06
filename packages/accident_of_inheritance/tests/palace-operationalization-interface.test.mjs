/**
 * 𝌋 TD613 · Tests for Palace Act I–II Operationalization Interface
 * Verifying 8-Point Operationalization Contract & Experiment B Qualification
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
  evaluateCapsuleAgainstCompetentComparator,
  bridgeCapsuleToAct2Policies,
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
    },
  ];

  it('Point 1: Ingests historical records with immutable byte-digest provenance', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    assert.strictEqual(ingested.length, 3);
    assert.ok(ingested[0].canonical_byte_digest.length === 64);
    assert.strictEqual(ingested[0].withdrawal_status, 'ACTIVE');
  });

  it('Point 2 & 3: Compresses full history into budget-matched bounded capsule', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const capsule = compressToInheritanceCapsule(ingested, 1024);
    assert.ok(capsule.capsule_id.startsWith('capsule-'));
    assert.ok(capsule.within_budget);
    assert.strictEqual(capsule.payload.active_record_count, 3);
    assert.strictEqual(capsule.payload.anti_evidence_count, 1);
    assert.ok(capsule.payload.normalized_slot_prior.M_SLOT_0 > 0);
  });

  it('Point 4: Retains explicit anti-evidence register without silent pruning', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const capsule = compressToInheritanceCapsule(ingested, 1024);
    assert.strictEqual(capsule.payload.anti_evidence_register.length, 1);
    assert.strictEqual(capsule.payload.anti_evidence_register[0].record_id, 'rec-003');
  });

  it('Point 5: Distinguishes preserved, retrieved, and decision-used information', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const filterRes = executeThreeStageEpistemicFilter({
      archivePreservedRecords: ingested,
      queryContext: { target_slot: 'M_SLOT_0', current_tick: 10 },
      decisionPolicy: { min_confidence: 0.90, max_age: 15 },
    });
    assert.strictEqual(filterRes.stage1_preserved_count, 3);
    assert.strictEqual(filterRes.stage2_retrieved_count, 1);
    assert.strictEqual(filterRes.stage3_decision_used_count, 1);
    assert.strictEqual(filterRes.used_records[0].record_id, 'rec-001');
  });

  it('Point 6: Withdraws inherited record via non-retroactive tombstone', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const { updated_record, tombstone } = withdrawInheritedRecord(ingested[0], {
      tick: 12,
      reason: 'SUPERSEDED_BY_EMPIRICAL_DISCOVERY',
      authority_id: 'CHIEF_INVESTIGATOR',
    });
    assert.strictEqual(updated_record.withdrawal_status, 'WITHDRAWN');
    assert.strictEqual(tombstone.withdrawn_at_tick, 12);
    assert.strictEqual(tombstone.original_byte_digest, ingested[0].canonical_byte_digest);
  });

  it('Point 7: Competent comparator evaluates capsule against equalized full-history baseline', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const capsule = compressToInheritanceCapsule(ingested, 1024);
    const testWorlds = [
      { world_id: 'w-1', true_slot: 'M_SLOT_0' },
      { world_id: 'w-2', true_slot: 'M_SLOT_2' },
    ];
    const compRes = evaluateCapsuleAgainstCompetentComparator({
      fullHistory: ingested,
      capsule,
      testWorlds,
    });
    assert.strictEqual(compRes.test_world_count, 2);
    assert.ok(compRes.null_hypothesis_retained !== undefined);
  });

  it('Point 8: Bridges capsule to Act II authority and adaptation policies', () => {
    const ingested = sampleRecords.map(ingestHistoricalRecord);
    const capsule = compressToInheritanceCapsule(ingested, 1024);
    const bridge = bridgeCapsuleToAct2Policies(capsule);
    assert.strictEqual(bridge.schema, 'td613.palace.act2-policy-bridge/v1.0');
    assert.ok(typeof bridge.logPrior.M_SLOT_0 === 'number');
    assert.strictEqual(bridge.canonicalMonumentSlot, 'M_SLOT_0');
    assert.strictEqual(bridge.anti_evidence_count, 1);
  });
});
