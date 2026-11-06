/**
 * 𝌋 TD613 · PALACE ACT I–II OPERATIONALIZATION INTERFACE
 * Source-Free Prospective Bridge Connecting Palace Act I Inheritance Capsules
 * to Palace Act II Authority, Latency, and Contextual-Revision Policies
 * 
 * Implements the 8-Point Operationalization Contract:
 *   1. Historical inheritance ingestion & byte-digest provenance
 *   2. Full-history vs bounded-capsule representation
 *   3. Budget-matched information selection & compression
 *   4. Explicit retention of contradictory & negative evidence
 *   5. Three-stage epistemic filter (Preserved vs Retrieved vs Used)
 *   6. Non-retroactive revision & withdrawal with immutable tombstones
 *   7. Independent competent-comparator test harness
 *   8. Formal interface bridge to Act II policies
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import crypto from 'node:crypto';

export function sha256Hex(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export const OPERATIONALIZATION_SCHEMA = 'td613.palace.act1-act2-operationalization/v1.0';

/**
 * Point 1: Ingestion of Historical Records with Byte-Digest Provenance
 */
export function ingestHistoricalRecord(rawRecord) {
  if (!rawRecord || typeof rawRecord !== 'object') {
    throw new Error('[PALACE_INGEST_ERROR] Raw record must be an object.');
  }
  const requiredFields = ['record_id', 'source_authority_id', 'claim_text', 'temporal_coordinates', 'epistemic_status'];
  for (const rf of requiredFields) {
    if (rawRecord[rf] === undefined) {
      throw new Error(`[PALACE_INGEST_ERROR] Missing required field: ${rf}`);
    }
  }

  const canonicalPayload = JSON.stringify({
    record_id: rawRecord.record_id,
    source_authority_id: rawRecord.source_authority_id,
    claim_text: rawRecord.claim_text,
    temporal_coordinates: rawRecord.temporal_coordinates,
    epistemic_status: rawRecord.epistemic_status,
  });

  const byteDigest = sha256Hex(canonicalPayload);

  return Object.freeze({
    ...rawRecord,
    canonical_byte_digest: byteDigest,
    ingested_at: new Date().toISOString(),
    withdrawal_status: 'ACTIVE',
  });
}

/**
 * Point 2 & 3: Budget-Matched Capsule Compression (e.g., 256-byte bounded representation)
 */
export function compressToInheritanceCapsule(fullHistoryRecords, byteBudget = 256) {
  const activeRecords = fullHistoryRecords.filter(r => r.withdrawal_status === 'ACTIVE');
  const contradictoryRecords = fullHistoryRecords.filter(r => r.epistemic_status === 'CONTRADICTED' || r.is_negative_evidence);

  // Compute summary prior weights across 4 standard slots
  const slotWeights = { M_SLOT_0: 0, M_SLOT_1: 0, M_SLOT_2: 0, M_SLOT_3: 0 };
  for (const r of activeRecords) {
    if (r.target_slot && slotWeights[r.target_slot] !== undefined) {
      const weight = r.authority_weight ?? 1.0;
      slotWeights[r.target_slot] += weight;
    }
  }

  // Normalize slot prior
  const totalWeight = Object.values(slotWeights).reduce((a, b) => a + b, 0);
  const normalizedPrior = {};
  for (const [k, v] of Object.entries(slotWeights)) {
    normalizedPrior[k] = totalWeight > 0 ? Number((v / totalWeight).toFixed(4)) : 0.25;
  }

  // Anti-evidence and negative control register (Point 4)
  const antiEvidenceRegister = contradictoryRecords.map(cr => ({
    record_id: cr.record_id,
    source_id: cr.source_authority_id,
    contradiction_tick: cr.temporal_coordinates?.t_event ?? 0,
    digest: cr.canonical_byte_digest,
  }));

  const capsulePayload = {
    schema: 'td613.palace.inheritance-capsule/v1.0',
    normalized_slot_prior: normalizedPrior,
    active_record_count: activeRecords.length,
    anti_evidence_count: antiEvidenceRegister.length,
    anti_evidence_register: antiEvidenceRegister,
    lineage_merkle_root: sha256Hex(fullHistoryRecords.map(r => r.canonical_byte_digest).sort().join('::')),
  };

  const serialized = JSON.stringify(capsulePayload);
  const byteSize = Buffer.byteLength(serialized, 'utf8');

  return Object.freeze({
    capsule_id: `capsule-${sha256Hex(serialized).slice(0, 16)}`,
    payload: capsulePayload,
    serialized_bytes: byteSize,
    byte_budget: byteBudget,
    within_budget: byteSize <= byteBudget,
    full_history_count: fullHistoryRecords.length,
    compression_ratio: fullHistoryRecords.length > 0 ? Number((byteSize / (fullHistoryRecords.length * 150)).toFixed(4)) : 1.0,
  });
}

/**
 * Point 5: Three-Stage Epistemic Filter (Preserved vs Retrieved vs Used)
 */
export function executeThreeStageEpistemicFilter({
  archivePreservedRecords,
  queryContext,
  decisionPolicy,
}) {
  // Stage 1: Preserved in immutable archive
  const preservedCount = archivePreservedRecords.length;

  // Stage 2: Retrieved based on relevance query
  const retrievedRecords = archivePreservedRecords.filter(r => {
    if (r.withdrawal_status === 'WITHDRAWN') return false; // Withdrawn records not retrieved for active use
    if (!queryContext) return true;
    if (queryContext.target_slot && r.target_slot && r.target_slot !== queryContext.target_slot) return false;
    return true;
  });

  // Stage 3: Used in Bayesian decision update
  const usedRecords = retrievedRecords.filter(r => {
    if (!decisionPolicy) return true;
    if (decisionPolicy.min_confidence && (r.confidence ?? 1.0) < decisionPolicy.min_confidence) return false;
    if (decisionPolicy.max_age && queryContext.current_tick) {
      const age = queryContext.current_tick - (r.temporal_coordinates?.t_event ?? 0);
      if (age > decisionPolicy.max_age) return false;
    }
    return true;
  });

  return Object.freeze({
    stage1_preserved_count: preservedCount,
    stage2_retrieved_count: retrievedRecords.length,
    stage3_decision_used_count: usedRecords.length,
    retrieval_efficiency: preservedCount > 0 ? Number((retrievedRecords.length / preservedCount).toFixed(4)) : 1.0,
    utilization_rate: retrievedRecords.length > 0 ? Number((usedRecords.length / retrievedRecords.length).toFixed(4)) : 1.0,
    used_records: usedRecords,
  });
}

/**
 * Point 6: Non-Retroactive Revision & Withdrawal with Immutable Tombstones
 */
export function withdrawInheritedRecord(record, withdrawalMetadata) {
  if (record.withdrawal_status === 'WITHDRAWN') {
    throw new Error(`[PALACE_WITHDRAWAL_ERROR] Record ${record.record_id} is already withdrawn.`);
  }

  const tombstone = Object.freeze({
    tombstone_id: `tombstone-${record.record_id}`,
    original_record_id: record.record_id,
    original_byte_digest: record.canonical_byte_digest,
    withdrawn_at_tick: withdrawalMetadata.tick,
    reason: withdrawalMetadata.reason,
    withdrawn_by_authority: withdrawalMetadata.authority_id,
    preceding_state_digest: sha256Hex(JSON.stringify(record)),
  });

  const updatedRecord = Object.freeze({
    ...record,
    withdrawal_status: 'WITHDRAWN',
    withdrawal_tombstone: tombstone,
  });

  return {
    updated_record: updatedRecord,
    tombstone,
    non_retroactivity_guarantee: 'Original record byte digest and immutable archive history preserved; withdrawal recorded via append-only tombstone.',
  };
}

/**
 * Point 7: Independent Competent-Comparator Test Harness
 */
export function evaluateCapsuleAgainstCompetentComparator({
  fullHistory,
  capsule,
  testWorlds,
}) {
  let capsuleWins = 0;
  let baselineWins = 0;
  let ties = 0;

  for (const w of testWorlds) {
    // Both systems evaluate using identical Bayesian priors derived from their respective inputs
    const capsulePrior = capsule.payload.normalized_slot_prior;
    
    // Equalized full-history baseline computes learned Bayesian prior from full history
    const baselineSlotCounts = { M_SLOT_0: 0, M_SLOT_1: 0, M_SLOT_2: 0, M_SLOT_3: 0 };
    for (const r of fullHistory) {
      if (r.target_slot && baselineSlotCounts[r.target_slot] !== undefined) {
        baselineSlotCounts[r.target_slot] += 1;
      }
    }
    const total = Object.values(baselineSlotCounts).reduce((a, b) => a + b, 0);
    const baselinePrior = {};
    for (const [k, v] of Object.entries(baselineSlotCounts)) {
      baselinePrior[k] = total > 0 ? Number((v / total).toFixed(4)) : 0.25;
    }

    const trueSlot = w.true_slot;
    const pCapsule = capsulePrior[trueSlot] ?? 0;
    const pBaseline = baselinePrior[trueSlot] ?? 0;

    if (Math.abs(pCapsule - pBaseline) < 1e-4) {
      ties += 1;
    } else if (pCapsule > pBaseline) {
      capsuleWins += 1;
    } else {
      baselineWins += 1;
    }
  }

  return Object.freeze({
    test_world_count: testWorlds.length,
    capsule_wins: capsuleWins,
    baseline_wins: baselineWins,
    ties: ties,
    empirical_verdict:
      capsuleWins === 0 && baselineWins === 0
        ? 'PERFECT_EQUALIZED_PARITY_WITHOUT_UNEARNED_SURPLUS'
        : capsuleWins > baselineWins
        ? 'CAPSULE_SURPLUS_DETECTED'
        : 'BASELINE_SUPERIOR',
    null_hypothesis_retained: capsuleWins === baselineWins,
  });
}

/**
 * Point 8: Formal Bridge to Act II Policies
 */
export function bridgeCapsuleToAct2Policies(capsule) {
  const normPrior = capsule.payload.normalized_slot_prior;
  const logPrior = {};
  for (const [slot, prob] of Object.entries(normPrior)) {
    logPrior[slot] = prob > 0 ? Math.log(prob) : -50.0;
  }

  let canonicalMonumentSlot = 'M_SLOT_0';
  let maxP = -Infinity;
  for (const [slot, prob] of Object.entries(normPrior)) {
    if (prob > maxP) {
      maxP = prob;
      canonicalMonumentSlot = slot;
    }
  }

  return Object.freeze({
    schema: 'td613.palace.act2-policy-bridge/v1.0',
    logPrior,
    canonicalMonumentSlot,
    stated_confidence: maxP,
    anti_evidence_count: capsule.payload.anti_evidence_count,
    adaptations: {
      enable_cusum_decay: true,
      enable_context_gating: true,
      min_entropy_probe_threshold: 0.85,
    },
  });
}
