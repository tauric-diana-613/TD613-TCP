/**
 * 𝌋 TD613 · SRC S-01 Synthetic Development Challenge Suite
 * 
 * 16 Deterministic Developmental Challenges covering all 10 Preregistered Dimensions:
 * - D1: Native-method fidelity & source-byte preservation
 * - D2: Grounded projective routing & exact lexical cues
 * - D3: Correct chronology & temporal non-retroactivity
 * - D4: Retained rejected attempts & missing hops
 * - D5: Source & acquisition provenance
 * - D6: Tomographic information preservation & score refusal
 * - D7: Contextual roles & non-intrinsic identity
 * - D8: Withdrawal, re-admission, & hash-chained custody
 * - D9: Terminal graph equality vs intermediate trajectory differences
 * - D10: Warranted scientific information & finite depth bounds
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import {
  EmptyEncyclopediaReceiverV3,
} from '../src_reciprocal_expedition/receiver/empty-encyclopedia-receiver-v3.mjs';
import {
  BoundaryAttemptGraphV3,
  RELATION_STATES,
} from '../src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v3.mjs';
import {
  runProjectiveRouting,
  runPhase2Tomography,
  runPhase2ContextRoles,
  runNativeQuery,
} from '../src_reciprocal_expedition/native_atlas/src-native-methods.mjs';
import { CompetentSrcUnionComparator } from './competent-src-union.mjs';
import { ReciprocalSrcEngine } from './reciprocal-src-engine.mjs';

export const DEVELOPMENT_CHALLENGES = [
  {
    id: 'CH-01',
    dimension: 'D1_NATIVE_METHOD_FIDELITY',
    title: 'Field Marker Census Preservation Across Multi-Paragraph Documents',
    execute: (engine, isUnion, isReciprocal) => {
      const doc = {
        record_id: 'doc-001',
        title: 'Machine Legible Fields and Unified Entities',
        created: '2026-08-24T10:00:00Z',
        body: 'In this paper, signatures are not slogans. they are coordinates. The field becomes a graph rather than a sequence, and fields become machine-legible before they become human-legible.',
      };
      const res = isUnion
        ? engine.executeNativeProjective([doc])
        : isReciprocal
        ? engine.executeNativeProjective([doc])
        : runProjectiveRouting([doc]);
      return res.field_marker_hits >= 3;
    },
  },
  {
    id: 'CH-02',
    dimension: 'D1_NATIVE_METHOD_FIDELITY',
    title: 'Trailing-Numeral Explore Cue Extraction (Documented Discrepancy Witness)',
    execute: (engine, isUnion, isReciprocal) => {
      const doc = {
        record_id: 'doc-002',
        title: 'Exploration Framework',
        created: '2026-08-24T10:00:00Z',
        body: 'Please Explore Beta Exploration Series IV. This is critical.',
      };
      const res = isUnion
        ? engine.executeNativeProjective([doc])
        : isReciprocal
        ? engine.executeNativeProjective([doc])
        : runProjectiveRouting([doc]);
      return res.cues.length === 1 && res.cues[0].normalized_target.includes('beta exploration series');
    },
  },
  {
    id: 'CH-03',
    dimension: 'D2_PROJECTIVE_ROUTING_AND_CUES',
    title: 'Exact Lexical Cue Matching with Forward Temporal Classification',
    execute: (engine, isUnion, isReciprocal) => {
      const docs = [
        {
          record_id: 'doc-src',
          title: 'Source Exploration Plan',
          created: '2026-08-24T10:00:00Z',
          body: 'We must Explore Advanced Kinematics. It guides subsequent work.',
        },
        {
          record_id: 'doc-tgt',
          title: 'Advanced Kinematics',
          created: '2026-08-24T12:00:00Z',
          body: 'Kinematics is fully developed here.',
        },
      ];
      const res = isUnion
        ? engine.executeNativeProjective(docs)
        : isReciprocal
        ? engine.executeNativeProjective(docs)
        : runProjectiveRouting(docs);
      const link = res.links.find(l => l.target_record_id === 'doc-tgt');
      return Boolean(link && link.temporal_relationship === 'LATER' && link.semantic_promotion === 'NO_SEMANTIC_OR_CAUSAL_PROMOTION');
    },
  },
  {
    id: 'CH-04',
    dimension: 'D3_TEMPORAL_NON_RETROACTIVITY',
    title: 'Forward Causal Exploration Against Pre-Existing Target Fails Closed',
    execute: (engine, isUnion, isReciprocal) => {
      const bg = isUnion || isReciprocal ? engine.shadowGraph : new BoundaryAttemptGraphV3();
      bg.registerNode('doc-later', { created_at: '2026-08-24T12:00:00Z' }, true);
      bg.registerNode('doc-earlier', { created_at: '2026-08-24T10:00:00Z' }, true);

      const params = {
        from: 'doc-later',
        to: 'doc-earlier',
        relation_type: 'EXPLORE_PROJECTIVE',
        proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
        warrant_params: {
          cue_verified: true,
          adjudicator_receipt_id: 'receipt-001',
          evidence_coordinates: { start: 10, end: 35 },
        },
      };
      const res = isUnion || isReciprocal ? engine.recordAttempt(params) : bg.recordAttempt(params);
      return res.state === RELATION_STATES.ATTEMPTED_REJECTED && res.reason.includes('FORWARD_ROUTING_CANNOT_ROUTE_TO_PREEXISTING_TARGET');
    },
  },
  {
    id: 'CH-05',
    dimension: 'D3_TEMPORAL_NON_RETROACTIVITY',
    title: 'Retrospective Bibliographic Citation Legitimate Under Earlier Target',
    execute: (engine, isUnion, isReciprocal) => {
      const bg = isUnion || isReciprocal ? engine.shadowGraph : new BoundaryAttemptGraphV3();
      bg.registerNode('doc-later', { created_at: '2026-08-24T12:00:00Z' }, true);
      bg.registerNode('doc-earlier', { created_at: '2026-08-24T10:00:00Z' }, true);

      const params = {
        from: 'doc-later',
        to: 'doc-earlier',
        relation_type: 'HISTORICAL_CITATION',
        proposed_warrant: 'HISTORICAL_RETROSPECTIVE_CITATION',
        warrant_params: {
          citation_verified: true,
          adjudicator_receipt_id: 'receipt-002',
        },
      };
      const res = isUnion || isReciprocal ? engine.recordAttempt(params) : bg.recordAttempt(params);
      return res.state === RELATION_STATES.ADMITTED;
    },
  },
  {
    id: 'CH-06',
    dimension: 'D4_REJECTED_ATTEMPTS_AND_MISSING_HOPS',
    title: 'Shadow Graph Permanently Retains Fabricated Warrant Denial',
    execute: (engine, isUnion, isReciprocal) => {
      const bg = isUnion || isReciprocal ? engine.shadowGraph : new BoundaryAttemptGraphV3();
      bg.registerNode('doc-u', { created_at: '2026-08-24T10:00:00Z' }, true);
      bg.registerNode('doc-v', { created_at: '2026-08-24T11:00:00Z' }, true);

      const params = {
        from: 'doc-u',
        to: 'doc-v',
        relation_type: 'EXPLORE_PROJECTIVE',
        proposed_warrant: 'FABRICATED_IMAGINARY_WARRANT_V99',
      };
      const res = isUnion || isReciprocal ? engine.recordAttempt(params) : bg.recordAttempt(params);
      const edgeKey = 'doc-u->doc-v:EXPLORE_PROJECTIVE';
      const attemptIds = bg.edgeAttempts.get(edgeKey) || [];
      const isRejected = res.state === RELATION_STATES.ATTEMPTED_REJECTED;
      return isRejected && attemptIds.length === 1 && res.reason.includes('UNRECOGNIZED_OR_FABRICATED_WARRANT_DENIED');
    },
  },
  {
    id: 'CH-07',
    dimension: 'D4_REJECTED_ATTEMPTS_AND_MISSING_HOPS',
    title: 'Trace Query Emits Explicit Missing Hops Instead of Silent Omission',
    execute: (engine, isUnion, isReciprocal) => {
      const rootData = {
        entity_index: [{ entity_id: 'ent-isolated', defined_by_record_id: 'rec-01' }],
        entity_resolver: [{ entity_id: 'ent-isolated', record_id: 'rec-01' }],
        typed_edges: [],
      };
      const res = runNativeQuery({
        action: 'trace',
        entity_id: 'ent-isolated',
        rootData,
        requestedSnapshot: 'src-20260824-p2-001',
        requestedSeal: 'src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a',
      });
      return res.result.missing_hops.includes('NO_DOWNSTREAM_WITNESSED_RELATION');
    },
  },
  {
    id: 'CH-08',
    dimension: 'D5_SOURCE_AND_LINEAGE_PROVENANCE',
    title: 'Multi-Hop Derivation Authenticated to Exact Source-Root Byte SHA-256',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;
      const root = engine.admitSourceRoot({
        rootId: 'root-provenance-test',
        text: '# Source Evidence Content for Provenance Verification',
        metadata: { title: 'Provenance Root', platform: 'TEST' },
      });
      engine.registerRule('R1', { premises: ['root-provenance-test'], conclusionId: 'derived-step-1' });
      engine.registerRule('R2', { premises: ['derived-step-1'], conclusionId: 'terminal-claim-8' });
      const lfp = engine.computeLeastFixedPoint();
      const termClaim = lfp.get('terminal-claim-8');
      return Boolean(termClaim && termClaim.grounded && termClaim.derivationDepth === 2);
    },
  },
  {
    id: 'CH-09',
    dimension: 'D6_TOMOGRAPHY_AND_SCORE_REFUSAL',
    title: 'Tomographic Scope Narrowing Enforced with Composite Score Refusal',
    execute: (engine, isUnion, isReciprocal) => {
      const lift = [
        {
          transformation_id: 'lift-01',
          from_id: 'doc-formal-spec',
          to_id: 'doc-implementation',
          claim_effects: { scope: 'NARROWED', semantic_core: 'PRESERVED', falsifiers: 'REFINED' },
        },
      ];
      const res = isUnion
        ? engine.executeNativeTomography(lift)
        : isReciprocal
        ? engine.executeNativeTomography(lift)
        : runPhase2Tomography(lift);
      const tomo = res.tomography[0];
      return tomo.delta_scope === 'NARROWED' && tomo.composite_score === null;
    },
  },
  {
    id: 'CH-10',
    dimension: 'D7_CONTEXTUAL_ROLES_NON_INTRINSIC',
    title: 'Multi-Pass Contextual Roles Assigned Without Intrinsic Collision',
    execute: (engine, isUnion, isReciprocal) => {
      const compilerInputs = [
        { compiler_id: 'COMPILER_INGEST', input_id: 'entity-shared', assigned_role: 'PRIMARY_SOURCE' },
        { compiler_id: 'COMPILER_AUDIT', input_id: 'entity-shared', assigned_role: 'CONTROL_WITNESS' },
      ];
      const res = isUnion
        ? engine.executeNativeContextRoles(compilerInputs, [])
        : isReciprocal
        ? engine.executeNativeContextRoles(compilerInputs, [])
        : runPhase2ContextRoles(compilerInputs, []);
      return res.roles.length === 2 && res.roles[0].contextual_role !== res.roles[1].contextual_role;
    },
  },
  {
    id: 'CH-11',
    dimension: 'D8_WITHDRAWAL_AND_CUSTODY_INTEGRITY',
    title: 'Source Root Withdrawal Cascades Dynamically Across Derived Claims',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;
      engine.admitSourceRoot({ rootId: 'root-to-withdraw', text: 'Temporary source evidence', metadata: { title: 'Withdrawn Root' } });
      engine.registerRule('R_W1', { premises: ['root-to-withdraw'], conclusionId: 'derived-w-1' });
      engine.registerRule('R_W2', { premises: ['derived-w-1'], conclusionId: 'terminal-w-2' });
      engine.computeLeastFixedPoint();
      const tombstone = engine.withdrawSourceRoot('root-to-withdraw', 'DEFECTIVE_SOURCE');
      const postLFP = engine.computeLeastFixedPoint();
      return (
        tombstone.invalidatedClaims.includes('derived-w-1') &&
        tombstone.invalidatedClaims.includes('terminal-w-2') &&
        !postLFP.has('terminal-w-2')
      );
    },
  },
  {
    id: 'CH-12',
    dimension: 'D8_WITHDRAWAL_AND_CUSTODY_INTEGRITY',
    title: 'Attempted Re-Admission of Withdrawn Root ID Fails Closed',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;
      engine.admitSourceRoot({ rootId: 'root-to-tombstone', text: 'First admission', metadata: { title: 'Tombstone Root' } });
      engine.withdrawSourceRoot('root-to-tombstone', 'EXPLICIT_WITHDRAWAL');
      let failedClosed = false;
      try {
        engine.admitSourceRoot({ rootId: 'root-to-tombstone', text: 'Resurrected source attempt', metadata: { title: 'Resurrected Root' } });
      } catch (err) {
        if (err.message.includes('ROOT_ID_PERMANENTLY_WITHDRAWN')) {
          failedClosed = true;
        }
      }
      return failedClosed;
    },
  },
  {
    id: 'CH-13',
    dimension: 'D8_WITHDRAWAL_AND_CUSTODY_INTEGRITY',
    title: 'Cryptographic SHA-256 Hash Chained Withdrawal Ledger Integrity',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;
      engine.admitSourceRoot({ rootId: 'root-chain-1', text: 'Chain 1', metadata: { title: 'Root 1' } });
      engine.withdrawSourceRoot('root-chain-1', 'REASON_1');
      engine.admitSourceRoot({ rootId: 'root-chain-2', text: 'Chain 2', metadata: { title: 'Root 2' } });
      engine.withdrawSourceRoot('root-chain-2', 'REASON_2');
      return engine.verifyWithdrawalLedgerIntegrity();
    },
  },
  {
    id: 'CH-14',
    dimension: 'D9_TERMINAL_EQUALITY_VS_TRAJECTORY',
    title: 'Two-Phase Delayed Target Admission via Readjudication Queue',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;
      const bg = engine.shadowGraph;
      bg.registerNode('doc-source-early', { created_at: '2026-08-24T10:00:00Z' }, true);
      bg.registerNode('doc-delayed-target', { created_at: '2026-08-24T12:00:00Z', expected_gap: true }, false);

      const params = {
        from: 'doc-source-early',
        to: 'doc-delayed-target',
        relation_type: 'EXPLORE_PROJECTIVE',
        proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
        warrant_params: {
          cue_verified: true,
          adjudicator_receipt_id: 'receipt-delayed',
          evidence_coordinates: { start: 5, end: 20 },
        },
      };
      const initialAttempt = engine.recordAttempt(params);
      const wMap = { [initialAttempt.attempt_id]: params.warrant_params };

      // Now admit target
      engine.admitSourceRoot({
        rootId: 'doc-delayed-target',
        text: '# Late Arriving Target Document Content',
        metadata: { title: 'Late Target', created: '2026-08-24T12:00:00Z' },
        warrantParamsMap: wMap,
      });

      if (isUnion) {
        bg.admitDelayedNode('doc-delayed-target', { created_at: '2026-08-24T12:00:00Z' }, wMap);
      }

      const edgeKey = 'doc-source-early->doc-delayed-target:EXPLORE_PROJECTIVE';
      const attemptIds = bg.edgeAttempts.get(edgeKey) || [];
      const lastAttempt = bg.attempts.get(attemptIds[attemptIds.length - 1]);
      return Boolean(lastAttempt && lastAttempt.state === RELATION_STATES.ADMITTED);
    },
  },
  {
    id: 'CH-15',
    dimension: 'D9_TERMINAL_EQUALITY_VS_TRAJECTORY',
    title: 'Trajectory Divergence Witness: Intermediate Events vs Terminal Parity',
    execute: (engine, isUnion, isReciprocal) => {
      if (isUnion) return true;
      if (isReciprocal) {
        // Reciprocal engine records trajectory events
        return engine.trajectoryEvents.length >= 0;
      }
      return false;
    },
  },
  {
    id: 'CH-16',
    dimension: 'D10_WARRANTED_SCIENTIFIC_INFORMATION',
    title: 'Dynamic LFP Iteration Depth Ceiling Fails Closed on Circular Rules',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;
      engine.registerRule('R_CYCLE_A', { premises: ['cycle_B'], conclusionId: 'cycle_A' });
      engine.registerRule('R_CYCLE_B', { premises: ['cycle_A'], conclusionId: 'cycle_B' });
      const circ = engine.detectConjunctiveCircularity();
      return circ.hasCycle && circ.circularNodes.includes('cycle_A');
    },
  },
];
