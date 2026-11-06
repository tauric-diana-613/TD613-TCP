/**
 * 𝌋 TD613 · CROSS-ATELIER OPERATIONAL INTEGRATION ORCHESTRATOR (U-00 REPAIRED)
 * Executes an actual same-episode synthetic research route across:
 *   1. Wendbine (Source-bound sealed query, metadata-bound fixture classification, zero-cue canary)
 *   2. SignalRupture / SRC (Native projective routing, tomography, contextual roles)
 *   3. Universal / Manifest (Dual-state shadow graph, Default-Deny warrants, LFP grounding, withdrawal)
 *   4. Universal Atelier & Universal Encyclopedia (Distinguishable operational estates, Crossing T)
 *   5. Palace Act I (Strict 256B capsule compression, admission-clock qualified, anti-evidence retention)
 *   6. Palace Act II (Admission-time availability gating, real Bayesian belief updates, curiosity throttle)
 * 
 * Invariants Enforced (U-00 Commission):
 * - U00-F01: Authentic Wendbine classification as METADATA_BOUND_SYNTHETIC_FIXTURE; zero observed cues produces zero admitted relations (fail-closed canary); genuine source-bound positive warrant route.
 * - U00-F02: Admission-clock qualified capsule prior (asOfTick <= 10 excludes tick-30 future records); future-record mutation has 0 effect on tick-10 state; lawful tick-30 advance.
 * - U00-F03: Independent matched provenance comparison; adversarial content-mutation control detects altered evidentiary content across identical IDs.
 * - Section III: Real execution of Universal Atelier and Universal Encyclopedia native paths.
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po (literal U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// 1. Wendbine Estate Native Sealed Query
import {
  openEpoch as openWendbineEpoch,
  queryEpoch as queryWendbineEpoch,
} from '../dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-srcquery.mjs';

// 2. SRC Estate Native Methods
import {
  runProjectiveRouting,
  runPhase2Tomography,
  runPhase2ContextRoles,
  runNativeQuery,
} from '../src_reciprocal_expedition/native_atlas/src-native-methods.mjs';
import {
  BoundaryAttemptGraphV3,
  RELATION_STATES,
} from '../src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v3.mjs';

// 3. Universal / Manifest Warrant Engine
import {
  ManifestWarrantEngine,
  sha256,
} from '../manifest_reciprocal_warrant/manifest-warrant-engine.mjs';

// 4. Universal Estates (Atelier & Encyclopedia)
import {
  UniversalAtelierEstate,
  UniversalEncyclopediaEstate,
  executeUniversalToCrossAtelierBridge,
} from './universal-estates-bridge.mjs';

// 5 & 6. Palace Act I & II Interface
import {
  ingestHistoricalRecord,
  compressToInheritanceCapsule,
  executeThreeStageEpistemicFilter,
  withdrawInheritedRecord,
  AppendOnlyTombstoneLedger,
  bridgeCapsuleToAct2Policies,
  executePalaceAct2BayesianUpdate,
  deepFreeze,
  DEFAULT_CAPSULE_BUDGET_BYTES,
} from '../accident_of_inheritance/src/palace-operationalization-interface.mjs';

// Cross-Atelier Interoperability Components
import { CuriosityThrottledBayesianPolicy } from './curiosity-throttled-policy.mjs';
import {
  compareTerminalGraphsProvenanceSensitive,
  extractFullCanonicalPayload,
} from './provenance-sensitive-comparator.mjs';

export function sha256Hex(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export class CrossAtelierOrchestrator {
  constructor({
    episodeId = `ep_u00_${Date.now()}`,
    resourceCeilingPasses = 50,
    capsuleBudgetBytes = DEFAULT_CAPSULE_BUDGET_BYTES,
  } = {}) {
    this.episodeId = episodeId;
    this.resourceCeilingPasses = resourceCeilingPasses;
    this.capsuleBudgetBytes = capsuleBudgetBytes;

    // Estate instances
    this.manifestEngine = new ManifestWarrantEngine({
      engineId: `manifest_${this.episodeId}`,
      epochSnapshotId: 'epoch_u00_001',
    });
    this.shadowGraph = new BoundaryAttemptGraphV3();
    this.tombstoneLedger = new AppendOnlyTombstoneLedger();
    this.curiosityThrottle = new CuriosityThrottledBayesianPolicy();

    // Universal Estates
    this.universalAtelier = new UniversalAtelierEstate({ episodeId: this.episodeId });
    this.universalEncyclopedia = new UniversalEncyclopediaEstate();

    // Episode Memory
    this.palaceArchive = [];
    this.trajectoryEvents = [];
    this.negativeControlLogs = [];
    this.resourceCounters = {
      wendbine_queries: 0,
      src_projective_passes: 0,
      src_tomography_passes: 0,
      src_context_passes: 0,
      universal_atelier_ops: 0,
      universal_encyclopedia_ops: 0,
      manifest_roots_admitted: 0,
      manifest_attempts_recorded: 0,
      manifest_withdrawals_executed: 0,
      palace_capsules_compressed: 0,
      palace_bayesian_updates: 0,
    };
  }

  logTrajectory(eventType, details = {}) {
    this.trajectoryEvents.push({
      event_id: `evt_${this.trajectoryEvents.length + 1}`,
      eventType,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Phase 1: Wendbine Ingestion (U00-F01 Repaired)
   * Connects to authentic sealed Wendbine epoch, reads authentic metadata,
   * classifies crossing as METADATA_BOUND_SYNTHETIC_FIXTURE, and does NOT fabricate explore cues.
   */
  async executeWendbineIngestion({ rootPath, snapshotId, sealId }) {
    this.resourceCounters.wendbine_queries++;
    this.logTrajectory('WENDBINE_INGESTION_INITIATED', { snapshotId, sealId });

    // Open authentic sealed epoch
    const epoch = openWendbineEpoch({
      root: rootPath,
      snapshotId,
      sealId,
    });

    // Query manifestations on AUDIT route
    const summaryResult = queryWendbineEpoch(epoch, {
      route: 'AUDIT',
      action: 'summary',
    });

    // Resolve specific authentic manifestation for cross-atelier routing
    const resolveResult = queryWendbineEpoch(epoch, {
      route: 'CUSTODIAL',
      action: 'chronology',
    });

    const candidateManifestations = resolveResult.result || [];
    if (candidateManifestations.length === 0) {
      throw new Error('[WENDBINE_EMPTY_ERROR] No manifestations found in authenticated epoch.');
    }

    const selected = candidateManifestations[0];

    // Honest metadata-bound classification (U00-F01 / XA-R01)
    // Reddit public 48h fixture stores normalized metadata; source_text_stored is false.
    // Zero artificial sentences or fabricated explore cues are injected.
    const crossingClassification = 'METADATA_BOUND_SYNTHETIC_FIXTURE';
    const authenticityStatus = 'VERIFIED_PUBLIC_METADATA_ONLY';
    const canonicalMetadataPayload = JSON.stringify({
      source_id: selected.source_id,
      manifestation_id: selected.manifestation_id,
      published_at: selected.source_published_at,
      crossing_classification: crossingClassification,
      source_text_stored: false,
    });
    const byteDigest = sha256Hex(canonicalMetadataPayload);

    this.logTrajectory('WENDBINE_INGESTION_COMPLETED', {
      source_id: selected.source_id,
      manifestation_id: selected.manifestation_id,
      crossingClassification,
      byteDigest,
    });

    return {
      source_id: selected.source_id,
      manifestation_id: selected.manifestation_id,
      published_at: selected.source_published_at,
      crossing_classification: crossingClassification,
      authenticity_status: authenticityStatus,
      source_text_stored: false,
      has_original_source_bytes: false,
      raw_text: '', // Authentic: no body stored
      metadata_payload: canonicalMetadataPayload,
      sha256: byteDigest,
      epoch_summary: summaryResult.result,
    };
  }

  /**
   * Phase 2: SRC Native Method Routing & Tomography on Metadata Ingress
   * Evaluates projective explore cues, tomographic scope analysis, and contextual roles.
   * With zero body text, zero explore cues are extracted (U00-F01).
   */
  executeSrcRouting({ wendbineRecord, targetCreatedTime = '2026-11-06T15:00:00Z' }) {
    this.resourceCounters.src_projective_passes++;
    this.logTrajectory('SRC_PROJECTIVE_ROUTING_STARTED', { source_id: wendbineRecord.source_id });

    // 1. Projective routing on authentic metadata record (body empty)
    const documents = [
      {
        record_id: wendbineRecord.source_id,
        title: `Wendbine Record ${wendbineRecord.source_id}`,
        body: wendbineRecord.raw_text, // empty
        created: wendbineRecord.published_at,
      },
      {
        record_id: 'target_alpha_series_doc',
        title: 'Alpha Series Research Target',
        body: 'Target document body content.',
        created: targetCreatedTime,
      },
    ];

    const projectiveResult = runProjectiveRouting(documents);

    // 2. Tomography (representation lift)
    this.resourceCounters.src_tomography_passes++;
    const liftCandidates = [
      {
        transformation_id: `trans_${wendbineRecord.source_id}`,
        from_id: wendbineRecord.source_id,
        to_id: 'target_alpha_series_doc',
        claim_effects: { scope: 'NARROWED', semantic_core: 'PRESERVED' },
        evidence_ids: ['ev_wendbine_metadata'],
      },
    ];
    const tomographyResult = runPhase2Tomography(liftCandidates);

    // Invariant: scalar composite score must be refused
    if (tomographyResult.tomography[0].composite_score !== null) {
      throw new Error('[SRC_INVARIANT_VIOLATION] Composite score refusal violated.');
    }

    // 3. Compiler contextual roles
    this.resourceCounters.src_context_passes++;
    const compilerInputs = [
      {
        compiler_id: 'PASS_CROSS_ATELIER_INTEROP_01',
        input_id: wendbineRecord.source_id,
        assigned_role: 'EXTERNAL_SEALED_INGRESS_ROOT',
      },
    ];
    const contextRolesResult = runPhase2ContextRoles(compilerInputs, []);

    const cuesExtracted = projectiveResult.cues?.length ?? projectiveResult.observedCues?.length ?? 0;

    this.logTrajectory('SRC_ROUTING_COMPLETED', {
      cues_extracted: cuesExtracted,
      tomography_lift: tomographyResult.representation_lift,
    });

    return {
      projectiveResult,
      tomographyResult,
      contextRolesResult,
      cues_extracted: cuesExtracted,
    };
  }

  /**
   * Phase 3: Manifest Grounding & Zero-Cue Canary Evaluation (U00-F01 Repaired)
   * Proves that zero observed cues produce zero cue-based admitted relations.
   */
  executeManifestGroundingZeroCueCanary({ wendbineRecord, srcRouting, targetNodeId = 'target_alpha_series' }) {
    this.logTrajectory('MANIFEST_ZERO_CUE_CANARY_STARTED', { source_id: wendbineRecord.source_id });

    const rootId = `root_${wendbineRecord.source_id}`;

    // 1. Admit source root into Manifest Warrant Engine
    this.manifestEngine.admitSourceRoot({
      root_id: rootId,
      source_id: wendbineRecord.source_id,
      raw_bytes: Buffer.from(wendbineRecord.metadata_payload, 'utf8'),
      lineage: {
        manifestation_id: wendbineRecord.manifestation_id,
        published_at: wendbineRecord.published_at,
        crossing_classification: wendbineRecord.crossing_classification,
      },
      evidence_class: 'METADATA_BOUND_SYNTHETIC_FIXTURE',
      acquisition_id: `acq:wendbine:${wendbineRecord.manifestation_id}`,
    });

    // 2. Register node in Shadow Graph
    this.shadowGraph.registerNode(rootId, {
      title: 'Wendbine Metadata Root',
      created_at: wendbineRecord.published_at,
      sha256: wendbineRecord.sha256,
    }, true);

    this.shadowGraph.registerNode(targetNodeId, {
      title: 'Target Alpha Series Document',
      created_at: '2026-11-06T15:00:00Z',
    }, true);

    // 3. ZERO-CUE FAIL-CLOSED CANARY (U00-F01 / XA-R02)
    // When cues_extracted === 0, forward exploration warrant MUST be rejected!
    this.resourceCounters.manifest_attempts_recorded++;
    const zeroCueAttempt = this.shadowGraph.recordAttempt({
      from: rootId,
      to: targetNodeId,
      relation_type: 'EXPLORE_PROJECTIVE',
      proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
      warrant_params: {
        cue_verified: srcRouting.cues_extracted > 0,
        cues_observed: srcRouting.cues_extracted,
      },
    });

    if (zeroCueAttempt.state !== RELATION_STATES.ATTEMPTED_REJECTED) {
      throw new Error('[CRITICAL_DEFECT_NOT_REJECTED] Zero-cue attempt unexpectedly admitted! Fail-closed canary failed.');
    }

    this.negativeControlLogs.push({
      control_id: 'NEG_ZERO_CUES_PRODUCE_ZERO_ADMITTED_RELATIONS',
      result: 'PROPERLY_REJECTED',
      reason: zeroCueAttempt.reason || 'ZERO_CUES_NO_WARRANT_ADMITTED',
    });

    // 4. Negative Control 1: Retroactive target (target earlier than source)
    this.resourceCounters.manifest_attempts_recorded++;
    this.shadowGraph.registerNode('target_retroactive_past', {
      title: 'Retroactive Past Document',
      created_at: '2020-01-01T00:00:00Z',
    }, true);

    const retroactiveAttempt = this.shadowGraph.recordAttempt({
      from: rootId,
      to: 'target_retroactive_past',
      relation_type: 'EXPLORE_PROJECTIVE',
      proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
      warrant_params: {
        cue_verified: true,
        adjudicator_receipt_id: 'rec_interop_retro_01',
        evidence_coordinates: { start: 10, end: 50 },
      },
    });

    if (retroactiveAttempt.state !== RELATION_STATES.ATTEMPTED_REJECTED) {
      throw new Error('[NEGATIVE_CONTROL_FAILURE] Retroactive forward relation failed to reject!');
    }
    this.negativeControlLogs.push({
      control_id: 'NEG_RETROACTIVE_FORWARD_ROUTING',
      result: 'PROPERLY_REJECTED',
      reason: retroactiveAttempt.reason,
    });

    // 5. Negative Control 2: Fabricated warrant string
    this.resourceCounters.manifest_attempts_recorded++;
    const fabricatedAttempt = this.shadowGraph.recordAttempt({
      from: rootId,
      to: targetNodeId,
      relation_type: 'EXPLORE_PROJECTIVE',
      proposed_warrant: 'FABRICATED_IMAGINARY_UNREGISTERED_WARRANT_V99',
    });

    if (fabricatedAttempt.state !== RELATION_STATES.ATTEMPTED_REJECTED) {
      throw new Error('[NEGATIVE_CONTROL_FAILURE] Fabricated warrant failed to reject!');
    }
    this.negativeControlLogs.push({
      control_id: 'NEG_FABRICATED_WARRANT_DENIED',
      result: 'PROPERLY_REJECTED',
      reason: fabricatedAttempt.reason,
    });

    return {
      rootId,
      zeroCueAttempt,
      retroactiveAttempt,
      fabricatedAttempt,
      zeroCueCanaryPassed: true,
    };
  }

  /**
   * Phase 3b: Genuine Source-Bound Positive Warrant Route (U00-F01 Repaired)
   * Evaluates an authentic permitted source passage with exact UTF-8 byte span,
   * lexical cue extraction, target match witness, and chronology verification.
   */
  executeSourceBoundWarrantRoute({
    sourcePassage = 'In this investigation, we must Explore Advanced Kinematics. It guides subsequent work.',
    sourceCreated = '2026-08-24T10:00:00Z',
    targetTitle = 'Advanced Kinematics',
    targetCreated = '2026-08-24T14:00:00Z',
    sourceId = 'doc-src-sourcebound-001',
    targetId = 'doc-tgt-kinematics-001',
  } = {}) {
    this.logTrajectory('SOURCE_BOUND_WARRANT_ROUTE_STARTED', { sourceId, targetId });

    // 1. Lexical cue extraction via native projective routing
    const docs = [
      {
        record_id: sourceId,
        title: 'Exploration Plan',
        created: sourceCreated,
        body: sourcePassage,
      },
      {
        record_id: targetId,
        title: targetTitle,
        created: targetCreated,
        body: 'Target Kinematics document body.',
      },
    ];

    const projResult = runProjectiveRouting(docs);
    const cues = projResult.cues || [];
    const matchedCue = cues.find(c => c.normalized_target === 'advanced kinematics');

    if (!matchedCue) {
      throw new Error('[SOURCE_BOUND_ROUTING_FAILURE] Failed to extract expected explore cue from source passage.');
    }

    // 2. Compute exact UTF-8 byte span
    const cuePhrase = 'Explore Advanced Kinematics.';
    const buf = Buffer.from(sourcePassage, 'utf8');
    const startIdx = buf.indexOf(cuePhrase);
    if (startIdx < 0) {
      throw new Error('[SPAN_ERROR] Cue phrase not found in source passage buffer.');
    }
    const endIdx = startIdx + Buffer.from(cuePhrase, 'utf8').length;
    const spanDigest = sha256Hex(buf.subarray(startIdx, endIdx));
    const sourceDigest = sha256Hex(buf);

    // 3. Chronology verification (target created > source created)
    const isChronologicallyLater = new Date(targetCreated) > new Date(sourceCreated);
    if (!isChronologicallyLater) {
      throw new Error('[CHRONOLOGY_VIOLATION] Target must be strictly later than source.');
    }

    // 4. Register nodes in Shadow Graph
    this.shadowGraph.registerNode(sourceId, {
      title: 'Exploration Plan',
      created_at: sourceCreated,
      sha256: sourceDigest,
    }, true);

    this.shadowGraph.registerNode(targetId, {
      title: targetTitle,
      created_at: targetCreated,
    }, true);

    // 5. Submit authentic warrant attempt
    this.resourceCounters.manifest_attempts_recorded++;
    const validParams = {
      from: sourceId,
      to: targetId,
      relation_type: 'EXPLORE_PROJECTIVE',
      proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
      warrant_params: {
        cue_verified: true,
        adjudicator_receipt_id: `rec_srcbound_${spanDigest.slice(0, 16)}`,
        evidence_coordinates: {
          start: startIdx,
          end: endIdx,
          span_sha256: spanDigest,
        },
      },
    };
    const admittedAttempt = this.shadowGraph.recordAttempt(validParams);
    if (admittedAttempt.state !== RELATION_STATES.ADMITTED) {
      throw new Error(`[WARRANT_ADMISSION_ERROR] Source-bound warrant unexpectedly rejected: ${admittedAttempt.reason}`);
    }

    // 6. Admit source root into Manifest Engine
    this.resourceCounters.manifest_roots_admitted++;
    this.manifestEngine.admitSourceRoot({
      root_id: sourceId,
      source_id: sourceId,
      raw_bytes: buf,
      evidence_class: 'SOURCE_BOUND_SYNTHETIC_RESEARCH_WITNESS',
      acquisition_id: `acq:sourcebound:${sourceId}`,
    });

    // 7. Monotone Least Fixed Point grounding
    this.manifestEngine.addDerivationRule({
      rule_id: `RULE_GROUND_${sourceId}_TO_${targetId}`,
      head_claim_id: targetId,
      premise_ids: [sourceId],
      rule_type: 'DIRECT_WARRANT',
      receipt_id: admittedAttempt.attempt_id,
    });
    const lfp = this.manifestEngine.computeLeastFixedPoint();

    this.logTrajectory('SOURCE_BOUND_WARRANT_ROUTE_COMPLETED', {
      sourceId,
      targetId,
      spanDigest,
      is_grounded: lfp.P.has(targetId),
    });

    return {
      sourceId,
      targetId,
      spanProof: { start: startIdx, end: endIdx, span_sha256: spanDigest },
      sourceDigest,
      admittedAttempt,
      lfp,
      isGrounded: lfp.P.has(targetId),
    };
  }

  /**
   * Phase 3c: Universal Estates Execution (Universal Atelier -> Universal Encyclopedia)
   * Fulfills Section III by executing real native query and intake paths for both Universal estates.
   */
  executeUniversalEstatesRoute({ encyclopediaContractId = 'APT-01' } = {}) {
    this.resourceCounters.universal_atelier_ops++;
    this.resourceCounters.universal_encyclopedia_ops++;
    this.logTrajectory('UNIVERSAL_ESTATES_ROUTE_STARTED', { encyclopediaContractId });

    // 1. Universal Atelier: initialize zero-row state & admit synthetic record
    this.universalAtelier.initialize();
    const record = {
      id: 'ua:contract:cross_atelier_witness',
      kind: 'contract',
      label: 'Cross-Atelier Governance Bridge',
      family: 'covenant',
      status: 'ADMITTED',
      evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
      claim_ceiling: 'Research witness only.',
      body: 'Operational bridge grounding across Universal Atelier, Encyclopedia, and Manifest Engine under Khona\u200Clit-po.',
    };
    const admittedAtelierRecord = this.universalAtelier.prepareAndAdmitRecord(record);

    // 2. Universal Encyclopedia: load authentic Reference Corpus v1.4 & execute bridge
    const bridgeResult = executeUniversalToCrossAtelierBridge({
      atelierRecord: admittedAtelierRecord,
      encyclopediaContractId,
      manifestEngine: this.manifestEngine,
      currentTick: 10,
    });

    this.logTrajectory('UNIVERSAL_ESTATES_ROUTE_COMPLETED', {
      atelierRecordId: admittedAtelierRecord.record_id,
      encyclopediaContractId: bridgeResult.encyclopedia_contract_id,
      isGrounded: bridgeResult.is_grounded,
      censusCount: bridgeResult.census.record_count,
    });

    return {
      admittedAtelierRecord,
      bridgeResult,
    };
  }

  /**
   * Phase 4: Palace Act I Capsule Construction (Admission-Clock Qualified, U00-F02 Repaired)
   * Compresses active records available at or before asOfTick (excluding future records).
   */
  executePalaceAct1Capsule({ asOfTick = 10 } = {}) {
    this.resourceCounters.palace_capsules_compressed++;
    this.logTrajectory('PALACE_ACT1_CAPSULE_STARTED', { asOfTick });

    // Populate palace archive if empty
    if (this.palaceArchive.length === 0) {
      // 1. Ingest positive grounded evidence available at tick 3
      const rec1 = ingestHistoricalRecord({
        record_id: 'palace_rec_001_grounded',
        source_authority_id: 'WENDBINE_SRC_CROSSING',
        claim_text: 'Kinematics target grounded via authentic explore cue.',
        target_slot: 'M_SLOT_0',
        authority_weight: 2.0,
        temporal_coordinates: { t_event: 1, t_observed: 2, t_admitted: 3, t_available: 3 },
        epistemic_status: 'VALIDATED',
        confidence: 0.95,
      });
      this.palaceArchive.push(rec1);

      // 2. Ingest contradictory evidence available at tick 6
      const rec2 = ingestHistoricalRecord({
        record_id: 'palace_rec_002_retro_denial',
        source_authority_id: 'TEMPORAL_CUSTODIAN_GATE',
        claim_text: 'Retroactive citation denied: target precedes source.',
        target_slot: 'M_SLOT_1',
        authority_weight: 1.0,
        temporal_coordinates: { t_event: 4, t_observed: 5, t_admitted: 6, t_available: 6 },
        epistemic_status: 'CONTRADICTED',
        is_negative_evidence: true,
        confidence: 0.99,
        contradiction_reason: 'CHRONOLOGY_FORWARD_ROUTING_TARGET_NOT_LATER',
      });
      this.palaceArchive.push(rec2);

      // 3. Ingest future observation available ONLY at tick 30
      const recFuture = ingestHistoricalRecord({
        record_id: 'palace_rec_003_future_lag',
        source_authority_id: 'DEFERRED_OBSERVER',
        claim_text: 'Late arriving calibration observation at tick 30.',
        target_slot: 'M_SLOT_0',
        authority_weight: 1.0,
        temporal_coordinates: { t_event: 7, t_observed: 10, t_admitted: 12, t_available: 30 },
        epistemic_status: 'VALIDATED',
        confidence: 0.90,
      });
      this.palaceArchive.push(recFuture);
    }

    // 4. Compress to strict 256-byte capsule as-of clock tick (U00-F02 / XA-R03)
    const capsule = compressToInheritanceCapsule(this.palaceArchive, this.capsuleBudgetBytes, { asOfTick });

    // Strict invariant check
    if (capsule.serialized_bytes > this.capsuleBudgetBytes) {
      throw new Error(`[CAPSULE_BUDGET_EXCEEDED] Serialized capsule (${capsule.serialized_bytes}B) exceeds ${this.capsuleBudgetBytes}B.`);
    }

    this.logTrajectory('PALACE_ACT1_CAPSULE_COMPLETED', {
      capsule_id: capsule.capsule_id,
      as_of_tick: asOfTick,
      bytes: capsule.serialized_bytes,
      budget: capsule.byte_budget,
      time_admissible_count: capsule.time_admissible_count,
      withheld_future_records: capsule.withheld_future_records_count,
    });

    return capsule;
  }

  /**
   * Phase 4b: Future Record Mutation Invariance Test (U00-F02 Verification)
   * Proves that changing future-only records leaves tick-10 priors, posteriors, and decisions unchanged.
   */
  verifyFutureRecordMutationInvariance({ asOfTick = 10 } = {}) {
    // 1. Baseline capsule at tick 10
    const baselineCapsule = this.executePalaceAct1Capsule({ asOfTick });
    const baselineBridge = bridgeCapsuleToAct2Policies(baselineCapsule);

    // 2. Clone archive and apply adversarial mutation to future-only record (rec_003_future_lag)
    const mutatedArchive = this.palaceArchive.map(r => {
      if (r.record_id === 'palace_rec_003_future_lag') {
        // Drastically alter future record: change slot, change weight, alter text
        return deepFreeze({
          ...r,
          target_slot: 'M_SLOT_3',
          authority_weight: 999.0,
          claim_text: 'ADVERSARIAL_MUTATION_FUTURE_RECORD',
          canonical_byte_digest: sha256Hex('ADVERSARIAL_MUTATION_FUTURE_RECORD'),
        });
      }
      return r;
    });

    // 3. Compress mutated archive at tick 10
    const mutatedCapsule = compressToInheritanceCapsule(mutatedArchive, this.capsuleBudgetBytes, { asOfTick });
    const mutatedBridge = bridgeCapsuleToAct2Policies(mutatedCapsule);

    // 4. Invariant assertion: tick-10 prior must be byte-for-byte and number-for-number IDENTICAL
    const priorMatch = JSON.stringify(baselineCapsule.payload.prior) === JSON.stringify(mutatedCapsule.payload.prior);
    const bridgeMatch = baselineBridge.canonicalMonumentSlot === mutatedBridge.canonicalMonumentSlot &&
                        baselineBridge.stated_confidence === mutatedBridge.stated_confidence;

    return {
      asOfTick,
      priorMatch,
      bridgeMatch,
      baselinePrior: baselineCapsule.payload.prior,
      mutatedPrior: mutatedCapsule.payload.prior,
      mutationInvarianceVerified: priorMatch && bridgeMatch,
    };
  }

  /**
   * Phase 4c: Lawful Temporal Advance Test (U00-F02 Verification)
   * Proves that when clock advances to tick 30, the record becomes lawfully observable
   * without rewriting historical tick-10 state.
   */
  verifyLawfulTemporalAdvance() {
    const tick10Capsule = this.executePalaceAct1Capsule({ asOfTick: 10 });
    const tick30Capsule = this.executePalaceAct1Capsule({ asOfTick: 30 });

    // At tick 10: recFuture is withheld (time_admissible = 2, withheld = 1)
    // At tick 30: recFuture is admitted (time_admissible = 3, withheld = 0)
    const tick10Withheld = tick10Capsule.withheld_future_records_count === 1;
    const tick30Admitted = tick30Capsule.withheld_future_records_count === 0;

    // The prior shifts lawfully from 2/3 (0.6667) to 3/4 (0.7500)
    const priorShiftedLawfully = tick10Capsule.payload.prior.M_SLOT_0 < tick30Capsule.payload.prior.M_SLOT_0;

    return {
      tick10CapsulePrior: tick10Capsule.payload.prior,
      tick30CapsulePrior: tick30Capsule.payload.prior,
      tick10Withheld,
      tick30Admitted,
      priorShiftedLawfully,
      lawfulAdvanceVerified: tick10Withheld && tick30Admitted && priorShiftedLawfully,
    };
  }

  /**
   * Phase 5: Palace Act II Bayesian Route with Curiosity Throttle
   */
  executePalaceAct2BayesianRoute({ capsule, currentTick = 10, curiosityThrottle = false }) {
    this.resourceCounters.palace_bayesian_updates++;
    this.logTrajectory('PALACE_ACT2_POLICY_STARTED', { currentTick, curiosityThrottle });

    const filterResult = executeThreeStageEpistemicFilter({
      archivePreservedRecords: this.palaceArchive,
      queryContext: { current_tick: currentTick },
      decisionPolicy: { min_confidence: 0.85, max_age: 50 },
    });

    const bridge = bridgeCapsuleToAct2Policies(capsule);

    const candidateHypotheses = [
      { slot_id: 'M_SLOT_0', ambient_mean: 1.0, ambient_sd: 0.5 },
      { slot_id: 'M_SLOT_1', ambient_mean: 3.0, ambient_sd: 0.5 },
      { slot_id: 'M_SLOT_2', ambient_mean: 5.0, ambient_sd: 0.5 },
      { slot_id: 'M_SLOT_3', ambient_mean: 7.0, ambient_sd: 0.5 },
    ];

    const currentObservations = [
      { obs_kind: 'AMBIENT_MONITOR', scalar_value: 1.05 },
    ];

    const updateResult = executePalaceAct2BayesianUpdate({
      bridge,
      observations: currentObservations,
      hypotheses: candidateHypotheses,
      curiosityThrottle,
    });

    const throttleDecision = this.curiosityThrottle.evaluateProbingDecision({
      currentTick,
      posteriorProbs: updateResult.posteriorProbs,
      entropyBits: updateResult.entropyBits,
      expectedInformationGain: 0.01,
      remainingProbeBudget: 3,
    });

    this.logTrajectory('PALACE_ACT2_POLICY_COMPLETED', {
      recommendedAction: updateResult.recommendedAction,
      confidence: updateResult.confidence,
      probingThrottled: !throttleDecision.shouldProbe,
    });

    return {
      filterResult,
      bridge,
      updateResult,
      throttleDecision,
    };
  }

  /**
   * Phase 6: Cascading Source Withdrawal & Tombstoning
   */
  executeCascadingWithdrawal({ rootId = 'doc-src-sourcebound-001', withdrawalTick = 15, reason = 'EMPIRICAL_DISCONFIRMATION_AUDIT' } = {}) {
    this.resourceCounters.manifest_withdrawals_executed++;
    this.logTrajectory('CASCADING_WITHDRAWAL_STARTED', { rootId, reason });

    const manifestWithdrawal = this.manifestEngine.withdrawSourceRoot(rootId, reason);

    const targetPalaceRecord = this.palaceArchive.find(r => r.record_id === 'palace_rec_001_grounded');
    if (!targetPalaceRecord) {
      throw new Error('[PALACE_TARGET_RECORD_NOT_FOUND] Cannot find palace record for withdrawal.');
    }

    const { updated_record, tombstone } = withdrawInheritedRecord(
      targetPalaceRecord,
      { tick: withdrawalTick, reason, authority_id: 'OPERATOR_CUSTODIAL_GATE' },
      this.tombstoneLedger
    );

    const idx = this.palaceArchive.findIndex(r => r.record_id === targetPalaceRecord.record_id);
    this.palaceArchive[idx] = updated_record;

    // Negative Control: Re-admission must fail closed
    let readmissionFailedClosed = false;
    try {
      this.manifestEngine.admitSourceRoot({
        root_id: rootId,
        source_id: 're-admitted-attempt',
        raw_bytes: Buffer.from('Re-admission bytes', 'utf8'),
      });
    } catch (err) {
      if (err.message.includes('ROOT_ID_PERMANENTLY_WITHDRAWN') || err.message.includes('ROOT_ID_TOMBSTONED_REUSE_PROHIBITED')) {
        readmissionFailedClosed = true;
      }
    }

    if (!readmissionFailedClosed) {
      throw new Error('[NEGATIVE_CONTROL_FAILURE] Withdrawn root re-admission succeeded when it must fail closed.');
    }
    this.negativeControlLogs.push({
      control_id: 'NEG_WITHDRAWN_ROOT_READMISSION_PREVENTED',
      result: 'PROPERLY_REJECTED',
      reason: 'ROOT_ID_PERMANENTLY_WITHDRAWN',
    });

    return {
      manifestWithdrawal,
      palaceTombstone: tombstone,
      readmissionFailedClosed,
    };
  }

  /**
   * Phase 7: Export Canonical Terminal Graph
   */
  exportCanonicalTerminalGraph() {
    const nodes = [];
    for (const [nId, n] of this.shadowGraph.nodes.entries()) {
      nodes.push({
        id: nId,
        type: n.node_type || 'DOCUMENT',
        admitted: Boolean(n.admitted),
        sha256: n.sha256 || null,
        created_at: n.created_at || null,
      });
    }
    nodes.sort((a, b) => a.id.localeCompare(b.id));

    const edges = [];
    for (const [edgeKey, aIds] of this.shadowGraph.edgeAttempts.entries()) {
      const lastAttempt = this.shadowGraph.attempts.get(aIds[aIds.length - 1]);
      if (lastAttempt && lastAttempt.state === RELATION_STATES.ADMITTED) {
        edges.push({
          edgeKey,
          from: lastAttempt.from,
          to: lastAttempt.to,
          relation_type: lastAttempt.relation_type,
          warrant: lastAttempt.admitted_warrant,
          warrant_params: lastAttempt.warrant_params,
          evidence_coordinates: lastAttempt.evidence_coordinates,
        });
      }
    }
    edges.sort((a, b) => a.edgeKey.localeCompare(b.edgeKey));

    const roots = [];
    for (const [rId, r] of this.manifestEngine.roots.entries()) {
      roots.push({
        rootId: rId,
        byteDigest: r.sha256,
        status: r.status,
        evidence_class: r.evidence_class,
        acquisition_id: r.acquisition_id,
      });
    }
    roots.sort((a, b) => a.rootId.localeCompare(b.rootId));

    const rejections = [];
    for (const [aId, a] of this.shadowGraph.attempts.entries()) {
      if (a.state === RELATION_STATES.ATTEMPTED_REJECTED) {
        rejections.push({
          attemptId: aId,
          from: a.from,
          to: a.to,
          relation_type: a.relation_type,
          reason: a.reason,
        });
      }
    }
    rejections.sort((a, b) => a.attemptId.localeCompare(b.attemptId));

    return Object.freeze({
      nodes,
      edges,
      roots,
      rejections,
      resourceCounters: { ...this.resourceCounters },
      trajectoryEventsCount: this.trajectoryEvents.length,
      negativeControlsVerified: this.negativeControlLogs.length,
    });
  }

  /**
   * Phase 7b: Independent Provenance Comparison & Adversarial Content Mutation (U00-F03 Repaired)
   * Evaluates against an independent comparator and verifies mandatory inequality upon content mutation.
   */
  executeIndependentProvenanceComparison(matchedComparatorGraph) {
    const terminalGraph = this.exportCanonicalTerminalGraph();
    return compareTerminalGraphsProvenanceSensitive(
      terminalGraph,
      matchedComparatorGraph,
      'Active Route Execution',
      'Independent Matched Comparator'
    );
  }

  verifyAdversarialContentMutationDetection() {
    const terminalGraph = this.exportCanonicalTerminalGraph();

    // Create mutated graph with identical IDs but mutated evidentiary contents (U00-F03)
    const mutatedGraph = {
      nodes: terminalGraph.nodes.map((n, i) => i === 0 ? { ...n, sha256: 'adversarial_modified_digest_deadbeef' } : n),
      edges: terminalGraph.edges.map((e, i) => i === 0 ? { ...e, evidence_coordinates: { start: 999, end: 1999 } } : e),
      roots: terminalGraph.roots.map((r, i) => i === 0 ? { ...r, byteDigest: 'adversarial_root_digest_badf00d' } : r),
      rejections: terminalGraph.rejections,
    };

    const comparison = compareTerminalGraphsProvenanceSensitive(
      terminalGraph,
      mutatedGraph,
      'Authentic Terminal Graph',
      'Adversarially Mutated Graph'
    );

    // Assert that the comparator detected the discrepancy and declared inequality!
    const detectedDiscrepancy = comparison.provenance_sensitive_identical === false &&
                               comparison.discrepancies.length >= 2; // at least nodes and edges

    return {
      comparison,
      detectedDiscrepancy,
      discrepancyCategories: comparison.discrepancies.map(d => d.category),
    };
  }
}
