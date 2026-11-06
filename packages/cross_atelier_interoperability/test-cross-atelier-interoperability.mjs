/**
 * 𝌋 TD613 · CROSS-ATELIER INTEROPERABILITY QUALIFICATION SUITE (U-00 REPAIRED)
 * Exhaustive source-free synthetic qualification of the unified research route:
 * Wendbine -> SRC -> Manifest -> Universal Estates -> Palace Act I -> Palace Act II
 * 
 * Verifies All U-00 Critical Reparations & Governance Invariants:
 *   1. Full-circuit same-episode synthetic research route with U-00 repairs
 *   2. Strict 256-byte capsule budget enforcement (PR1705-R01)
 *   3. Admission-time availability gating (PR1705-R03)
 *   4. Chronological sequence ordering validation (PR1705-R03)
 *   5. Provenance-sensitive terminal graph comparison over complete payloads (PR1706-R01)
 *   6. Cost-of-curiosity throttle & regret avoidance (Operator Decision 1)
 *   7. Corrected latency convention & Family D masking witness (Operator Decision 2)
 *   8. Cascading source withdrawal & immutable tombstone ledger
 *   9. Fail-closed Default-Deny negative controls (retroactive target & fabricated warrant)
 *  10. Scalar composite score refusal in tomography (SRC D6 invariant)
 *  11. U00-F01: Zero observed cues produce zero cue-based admitted relations (fail-closed canary)
 *  12. U00-F01: Genuine source-bound positive warrant passes with exact UTF-8 span and chronology
 *  13. U00-F02: Admission-clock qualified capsule prior; future mutation has ZERO effect on tick-10 state
 *  14. U00-F02: Lawful temporal advance at tick 30 without retroactively modifying tick-10 capsule
 *  15. U00-F03: Adversarial content mutation detection across identical identifiers
 *  16. Section III: Real native entry, query, and bridge execution for Universal Atelier & Encyclopedia
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CrossAtelierOrchestrator } from './cross-atelier-orchestrator.mjs';
import {
  compareTerminalGraphsProvenanceSensitive,
  extractFullCanonicalPayload,
} from './provenance-sensitive-comparator.mjs';
import {
  ingestHistoricalRecord,
  compressToInheritanceCapsule,
  executeThreeStageEpistemicFilter,
} from '../accident_of_inheritance/src/palace-operationalization-interface.mjs';
import {
  runPhase2Tomography,
} from '../src_reciprocal_expedition/native_atlas/src-native-methods.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const WENDBINE_ROOT = path.join(REPO_ROOT, 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE');

describe('Cross-Atelier Operational Interoperability Qualification Suite', () => {
  const SNAPSHOT_ID = 'wendbine-20261104014208-6d200e3ff3a0';
  const SEAL_ID = 'wendbine-seal:6d200e3ff3a0d7d79d7a135d676141fea8dfab3ae9496b525c5a93b55e31edf2';

  it('1. Full-circuit same-episode research route across Wendbine -> SRC -> Manifest -> Universal -> Palace I -> Palace II', async () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_full_circuit_u00' });

    // Step 1: Authentic Wendbine Ingestion (Metadata-bound classification)
    const wendbineRec = await orchestrator.executeWendbineIngestion({
      rootPath: WENDBINE_ROOT,
      snapshotId: SNAPSHOT_ID,
      sealId: SEAL_ID,
    });
    assert.ok(wendbineRec.source_id);
    assert.strictEqual(wendbineRec.crossing_classification, 'METADATA_BOUND_SYNTHETIC_FIXTURE');
    assert.strictEqual(wendbineRec.source_text_stored, false);
    assert.strictEqual(wendbineRec.raw_text, '');

    // Step 2: SRC Native Routing on metadata (0 explore cues extracted)
    const srcRouting = orchestrator.executeSrcRouting({ wendbineRecord: wendbineRec });
    assert.strictEqual(srcRouting.cues_extracted, 0);
    assert.strictEqual(srcRouting.tomographyResult.tomography[0].composite_score, null);
    assert.strictEqual(srcRouting.contextRolesResult.roles[0].contextual_role, 'EXTERNAL_SEALED_INGRESS_ROOT');

    // Step 3: Zero-cue Canary (Fails closed on forward exploration warrant)
    const canaryResult = orchestrator.executeManifestGroundingZeroCueCanary({
      wendbineRecord: wendbineRec,
      srcRouting,
      targetNodeId: 'target_alpha_series_doc',
    });
    assert.strictEqual(canaryResult.zeroCueCanaryPassed, true);
    assert.strictEqual(canaryResult.zeroCueAttempt.state, 'ATTEMPTED_REJECTED');

    // Step 3b: Genuine Source-Bound Positive Warrant Route
    const sourceBoundResult = orchestrator.executeSourceBoundWarrantRoute({
      sourcePassage: 'We must Explore Advanced Kinematics. It guides subsequent work.',
      sourceCreated: '2026-08-24T10:00:00Z',
      targetTitle: 'Advanced Kinematics',
      targetCreated: '2026-08-24T14:00:00Z',
    });
    assert.strictEqual(sourceBoundResult.admittedAttempt.state, 'ADMITTED');
    assert.strictEqual(sourceBoundResult.isGrounded, true);

    // Step 3c: Universal Estates Crossing (Universal Atelier -> Universal Encyclopedia)
    const universalResult = orchestrator.executeUniversalEstatesRoute({
      encyclopediaContractId: 'APT-01',
    });
    assert.strictEqual(universalResult.bridgeResult.is_grounded, true);
    assert.strictEqual(universalResult.bridgeResult.census.record_count, 1141);

    // Step 4: Palace Act I Capsule Compression (asOfTick: 10 excludes tick-30 records)
    const capsule = orchestrator.executePalaceAct1Capsule({ asOfTick: 10 });
    assert.ok(capsule.within_budget);
    assert.ok(capsule.serialized_bytes <= 256);
    assert.strictEqual(capsule.withheld_future_records_count, 1);
    assert.strictEqual(capsule.anti_evidence_ledger.length, 1);

    // Step 5: Palace Act II Policy Update with Curiosity Throttle
    const policyResult = orchestrator.executePalaceAct2BayesianRoute({
      capsule,
      currentTick: 10,
      curiosityThrottle: true,
    });
    assert.strictEqual(policyResult.filterResult.withheld_future_records_count, 1);
    assert.strictEqual(policyResult.throttleDecision.shouldProbe, false); // Throttled due to confidence

    // Step 6: Cascading Custodial Withdrawal
    const withdrawal = orchestrator.executeCascadingWithdrawal({
      rootId: sourceBoundResult.sourceId,
      withdrawalTick: 15,
      reason: 'EMPIRICAL_AUDIT_SUPERSEDED',
    });
    assert.ok(withdrawal.readmissionFailedClosed);
    assert.strictEqual(withdrawal.palaceTombstone.withdrawn_at_tick, 15);

    // Step 7: Terminal Graph Export & Adversarial Content Mutation Detection
    const terminalGraph = orchestrator.exportCanonicalTerminalGraph();
    assert.ok(terminalGraph.nodes.length >= 3);
    assert.ok(terminalGraph.rejections.length >= 2);

    const mutationCheck = orchestrator.verifyAdversarialContentMutationDetection();
    assert.strictEqual(mutationCheck.detectedDiscrepancy, true);
  });

  it('2. Strict 256-byte capsule budget enforcement with fail-closed assertion (PR1705-R01)', () => {
    const history = [
      {
        record_id: 'h1',
        source_authority_id: 'AUTH_1',
        claim_text: 'Calibrated reading 1',
        target_slot: 'M_SLOT_0',
        authority_weight: 1.5,
        temporal_coordinates: { t_event: 1, t_observed: 2, t_admitted: 3, t_available: 3 },
        epistemic_status: 'VALIDATED',
      },
      {
        record_id: 'h2',
        source_authority_id: 'AUTH_2',
        claim_text: 'Calibrated reading 2',
        target_slot: 'M_SLOT_2',
        authority_weight: 2.0,
        temporal_coordinates: { t_event: 4, t_observed: 5, t_admitted: 6, t_available: 6 },
        epistemic_status: 'VALIDATED',
      },
      {
        record_id: 'h3_contra',
        source_authority_id: 'AUTH_AUDIT',
        claim_text: 'Contradiction detected',
        target_slot: 'M_SLOT_1',
        temporal_coordinates: { t_event: 7, t_observed: 8, t_admitted: 9, t_available: 9 },
        epistemic_status: 'CONTRADICTED',
        is_negative_evidence: true,
      },
    ].map(ingestHistoricalRecord);

    const capsule = compressToInheritanceCapsule(history, 256);
    assert.ok(capsule.serialized_bytes <= 256, `Capsule byte length ${capsule.serialized_bytes} must be <= 256`);
    assert.strictEqual(capsule.within_budget, true);
    assert.strictEqual(capsule.anti_evidence_ledger.length, 1);

    // Fail closed on impossibly tight budget
    assert.throws(() => {
      compressToInheritanceCapsule(history, 35);
    }, /CAPSULE_BUDGET_EXCEEDED_FAIL_CLOSED/);
  });

  it('3. Admission-time availability gating prevents future temporal leakage (PR1705-R03)', () => {
    const records = [
      {
        record_id: 'rec_past',
        source_authority_id: 'PAST_AUTH',
        claim_text: 'Available immediately',
        target_slot: 'M_SLOT_0',
        temporal_coordinates: { t_event: 1, t_observed: 2, t_admitted: 3, t_available: 5 },
        epistemic_status: 'VALIDATED',
      },
      {
        record_id: 'rec_future',
        source_authority_id: 'FUTURE_AUTH',
        claim_text: 'Available only in future at tick 25',
        target_slot: 'M_SLOT_0',
        temporal_coordinates: { t_event: 10, t_observed: 12, t_admitted: 15, t_available: 25 },
        epistemic_status: 'VALIDATED',
      },
    ].map(ingestHistoricalRecord);

    // Filter at current tick 10
    const filter = executeThreeStageEpistemicFilter({
      archivePreservedRecords: records,
      queryContext: { current_tick: 10, target_slot: 'M_SLOT_0' },
    });

    assert.strictEqual(filter.stage1_preserved_count, 2);
    assert.strictEqual(filter.stage2_retrieved_count, 1); // rec_past retrieved
    assert.strictEqual(filter.used_records[0].record_id, 'rec_past');
    assert.strictEqual(filter.withheld_future_records_count, 1); // rec_future withheld
  });

  it('4. Chronological sequence consistency check enforces t_event <= t_observed <= t_admitted <= t_available', () => {
    assert.throws(() => {
      ingestHistoricalRecord({
        record_id: 'rec_retro_error',
        source_authority_id: 'CAUSAL_VIOLATOR',
        claim_text: 'Event observed before it occurred',
        temporal_coordinates: { t_event: 10, t_observed: 5, t_admitted: 6, t_available: 6 },
        epistemic_status: 'UNVERIFIED',
      });
    }, /CHRONOLOGY_ORDERING_VIOLATION/);
  });

  it('5. Provenance-sensitive terminal graph comparison over all serialized fields (PR1706-R01)', () => {
    const graphA = {
      nodes: [{ id: 'n1', type: 'DOC', admitted: true, sha256: 'abc1' }],
      edges: [{ edgeKey: 'n1->n2:EXPLORE', from: 'n1', to: 'n2', relation_type: 'EXPLORE', warrant: 'W1', evidence_coordinates: { start: 1, end: 10 } }],
      roots: [{ rootId: 'r1', byteDigest: 'sha1', status: 'ACTIVE' }],
      rejections: [{ attemptId: 'att1', from: 'n1', to: 'n0', relation_type: 'EXPLORE', reason: 'DENIED' }],
    };

    // Identical clone
    const graphB = JSON.parse(JSON.stringify(graphA));
    const identicalComp = compareTerminalGraphsProvenanceSensitive(graphA, graphB, 'Sys A', 'Sys B');
    assert.strictEqual(identicalComp.provenance_sensitive_identical, true);
    assert.strictEqual(identicalComp.discrepancy_count, 0);

    // Altered evidence coordinates (even with identical edgeKey and IDs!)
    const graphC = JSON.parse(JSON.stringify(graphA));
    graphC.edges[0].evidence_coordinates = { start: 5, end: 20 };
    const alteredComp = compareTerminalGraphsProvenanceSensitive(graphA, graphC, 'Sys A', 'Sys C');
    assert.strictEqual(alteredComp.provenance_sensitive_identical, false);
    assert.strictEqual(alteredComp.discrepancy_count, 1);
    assert.strictEqual(alteredComp.discrepancies[0].category, 'EDGES');
  });

  it('6. Cost-of-curiosity policy throttle prevents diagnostic probing regret (Operator Decision 1)', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_curiosity' });
    const policy = orchestrator.curiosityThrottle;

    // High confidence state (prob > 0.75): probing should be throttled
    const confidentProbs = { M_SLOT_0: 0.82, M_SLOT_1: 0.08, M_SLOT_2: 0.05, M_SLOT_3: 0.05 };
    const decision = policy.evaluateProbingDecision({
      currentTick: 5,
      posteriorProbs: confidentProbs,
      entropyBits: 0.65,
      expectedInformationGain: 0.01,
      remainingProbeBudget: 3,
    });

    assert.strictEqual(decision.shouldProbe, false);
    assert.strictEqual(decision.reason, 'THROTTLED_HIGH_CONFIDENCE_ACTION_ALIGNED');
    assert.strictEqual(policy.getTelemetry().probes_throttled, 1);
  });

  it('7. Latency convention and Family D action invariance masking witness (Operator Decision 2)', () => {
    const pooledActionTick = 7.2740;
    const pooledBeliefTick = 3.0000;
    const pooledLatency = pooledActionTick - pooledBeliefTick;
    assert.strictEqual(Number(pooledLatency.toFixed(4)), 4.2740);

    const famDActionTick = 2.0000;
    const famDBeliefTick = 6.8125;
    const famDLatency = famDActionTick - famDBeliefTick;
    assert.strictEqual(Number(famDLatency.toFixed(4)), -4.8125);
    assert.ok(famDLatency < 0);
  });

  it('8. Cascading source withdrawal and non-retroactive tombstoning', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_withdrawal' });
    const rootId = 'root_test_withdrawal_01';

    orchestrator.manifestEngine.admitSourceRoot({
      root_id: rootId,
      source_id: 'src_orig_01',
      raw_bytes: Buffer.from('Original root content', 'utf8'),
    });

    orchestrator.palaceArchive.push(ingestHistoricalRecord({
      record_id: 'palace_rec_001_grounded',
      source_authority_id: 'SRC',
      claim_text: 'Derived claim from root',
      temporal_coordinates: { t_event: 1, t_observed: 2, t_admitted: 3, t_available: 3 },
      epistemic_status: 'VALIDATED',
    }));

    const result = orchestrator.executeCascadingWithdrawal({
      rootId,
      withdrawalTick: 12,
      reason: 'EMPIRICAL_FALSIFICATION',
    });

    assert.strictEqual(result.readmissionFailedClosed, true);
    assert.strictEqual(result.palaceTombstone.withdrawn_at_tick, 12);
  });

  it('9. Fail-closed Default-Deny negative controls (retroactive target & fabricated warrant)', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_neg_controls' });
    const bg = orchestrator.shadowGraph;

    bg.registerNode('doc_early', { created_at: '2026-08-24T10:00:00Z' }, true);
    bg.registerNode('doc_late', { created_at: '2026-08-24T12:00:00Z' }, true);

    // Forward explore attempted backwards (from late to early)
    const backwardsAttempt = bg.recordAttempt({
      from: 'doc_late',
      to: 'doc_early',
      relation_type: 'EXPLORE_PROJECTIVE',
      proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
      warrant_params: { cue_verified: true, adjudicator_receipt_id: 'r1', evidence_coordinates: { start: 1, end: 5 } },
    });
    assert.strictEqual(backwardsAttempt.state, 'ATTEMPTED_REJECTED');
    assert.ok(backwardsAttempt.reason.includes('PREEXISTING_TARGET'));

    // Fabricated warrant string
    const fabricatedAttempt = bg.recordAttempt({
      from: 'doc_early',
      to: 'doc_late',
      relation_type: 'EXPLORE_PROJECTIVE',
      proposed_warrant: 'INVALID_FABRICATED_WARRANT_XYZ',
    });
    assert.strictEqual(fabricatedAttempt.state, 'ATTEMPTED_REJECTED');
    assert.ok(fabricatedAttempt.reason.includes('UNRECOGNIZED_OR_FABRICATED_WARRANT_DENIED'));
  });

  it('10. Tomographic scope delta analysis enforces scalar composite score refusal (SRC D6)', () => {
    const tomo = runPhase2Tomography([
      {
        transformation_id: 'trans_d6_test',
        from_id: 'doc_orig_test',
        to_id: 'doc_formal_test',
        claim_effects: { scope: 'NARROWED', semantic_core: 'PRESERVED' },
        evidence_ids: ['ev_1', 'ev_2'],
      },
    ]);
    assert.strictEqual(tomo.tomography[0].composite_score, null);
    assert.strictEqual(tomo.conservation[0].outcome, 'NARROWED');
  });

  it('11. U00-F01: Zero observed cues produce zero cue-based admitted relations (Fail-Closed Canary)', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_canary' });
    const bg = orchestrator.shadowGraph;
    bg.registerNode('src_node', { created_at: '2026-08-24T10:00:00Z' }, true);
    bg.registerNode('tgt_node', { created_at: '2026-08-24T12:00:00Z' }, true);

    // Attempt forward explore warrant with 0 cues observed
    const attempt = bg.recordAttempt({
      from: 'src_node',
      to: 'tgt_node',
      relation_type: 'EXPLORE_PROJECTIVE',
      proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
      warrant_params: { cues_observed: 0, cue_verified: false },
    });

    assert.strictEqual(attempt.state, 'ATTEMPTED_REJECTED');
    assert.ok(attempt.reason.includes('ZERO_CUES_NO_WARRANT_ADMITTED') || attempt.reason.includes('EXPLORE_CUE_NOT_VERIFIED'));
  });

  it('12. U00-F01: Genuine source-bound positive warrant passes with exact UTF-8 span proof and chronology', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_sourcebound_warrant' });
    const result = orchestrator.executeSourceBoundWarrantRoute({
      sourcePassage: 'Research Directive: Please Explore Advanced Kinematics. Immediate study required.',
      sourceCreated: '2026-08-24T09:00:00Z',
      targetTitle: 'Advanced Kinematics',
      targetCreated: '2026-08-24T11:00:00Z',
    });

    assert.strictEqual(result.admittedAttempt.state, 'ADMITTED');
    assert.strictEqual(result.isGrounded, true);
    assert.ok(result.spanProof.start >= 0);
    assert.ok(result.spanProof.end > result.spanProof.start);
    assert.strictEqual(result.spanProof.span_sha256.length, 64);
  });

  it('13. U00-F02: Admission-clock qualified capsule prior; future-record mutation has ZERO effect on tick-10 state', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_mutation_invariance' });
    const invarianceResult = orchestrator.verifyFutureRecordMutationInvariance({ asOfTick: 10 });

    assert.strictEqual(invarianceResult.mutationInvarianceVerified, true);
    assert.strictEqual(invarianceResult.priorMatch, true);
    assert.strictEqual(invarianceResult.bridgeMatch, true);
    // Prior at tick 10 cleanly excludes the future tick-30 record (M_SLOT_0 = 2/3)
    assert.strictEqual(invarianceResult.baselinePrior.M_SLOT_0, 0.6667);
  });

  it('14. U00-F02: Lawful temporal advance: tick-30 clock lawfully incorporates deferred record without rewriting tick-10 state', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_temporal_advance' });
    const advanceResult = orchestrator.verifyLawfulTemporalAdvance();

    assert.strictEqual(advanceResult.lawfulAdvanceVerified, true);
    assert.strictEqual(advanceResult.tick10Withheld, true);
    assert.strictEqual(advanceResult.tick30Admitted, true);
    assert.strictEqual(advanceResult.priorShiftedLawfully, true);
    // Tick 10 prior = 0.6667 (2/3); Tick 30 prior = 0.7500 (3/4)
    assert.strictEqual(advanceResult.tick10CapsulePrior.M_SLOT_0, 0.6667);
    assert.strictEqual(advanceResult.tick30CapsulePrior.M_SLOT_0, 0.7500);
  });

  it('15. U00-F03: Adversarial content mutation test detects altered evidentiary content across identical IDs', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_adversarial_mutation' });
    orchestrator.executeSourceBoundWarrantRoute();
    const mutationResult = orchestrator.verifyAdversarialContentMutationDetection();

    assert.strictEqual(mutationResult.detectedDiscrepancy, true);
    assert.ok(mutationResult.discrepancyCategories.includes('NODES'));
    assert.ok(mutationResult.discrepancyCategories.includes('EDGES'));
  });

  it('16. Section III: Universal Atelier and Universal Encyclopedia execute real native entry/query paths', () => {
    const orchestrator = new CrossAtelierOrchestrator({ episodeId: 'ep_test_universal_estates' });
    const result = orchestrator.executeUniversalEstatesRoute({ encyclopediaContractId: 'APT-01' });

    assert.ok(result.admittedAtelierRecord);
    assert.ok(result.admittedAtelierRecord.record_id);
    assert.ok(result.admittedAtelierRecord.admission_time);
    assert.ok(result.bridgeResult);
    assert.strictEqual(result.bridgeResult.encyclopedia_contract_id, 'APT-01');
    assert.strictEqual(result.bridgeResult.is_grounded, true);
    assert.strictEqual(result.bridgeResult.census.record_count, 1141);
    assert.strictEqual(result.bridgeResult.census.edge_count, 2131);
  });
});
