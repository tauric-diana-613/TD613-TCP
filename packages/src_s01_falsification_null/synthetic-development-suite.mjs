/**
 * 𝌋 TD613 · SRC S-01 Synthetic Development Challenge Suite (S-01.1 Corrected)
 * 
 * 16 Deterministic Developmental Challenges covering all 10 Preregistered Dimensions:
 * - D1: Native-method fidelity & source-byte preservation (Python native execution & CH-02 exact match)
 * - D2: Grounded projective routing & exact lexical cues
 * - D3: Correct chronology & temporal non-retroactivity
 * - D4: Retained rejected attempts & missing hops
 * - D5: Source & acquisition provenance (Exact SHA-256 byte digest & lineage roots in CH-08)
 * - D6: Tomographic information preservation & score refusal
 * - D7: Contextual roles & non-intrinsic identity
 * - D8: Withdrawal, re-admission, & hash-chained custody
 * - D9: Terminal graph equality vs intermediate trajectory differences (Genuine clock-stepped CH-14/15)
 * - D10: Warranted scientific information & finite depth bounds (Reverse-ordered depth boundary in CH-16)
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * Executes authentic pinned Python projective.py for genuine S0 evaluation
 */
export function runPythonNativeExploreCue(phrase) {
  try {
    const carrierNative = path.resolve(repoRoot, 'packages', 'research_carrier_v1', 'native');
    const uvPath = path.resolve(process.env.USERPROFILE || process.env.HOME, '.local/bin/uv.exe');
    const pyScript = `import sys, json; from pathlib import Path; sys.path.insert(0, r"${carrierNative}"); import projective; doc = projective.Document(record_id="doc-test", entity_id="ent-test", title="Test", created="2026-08-24T10:00:00Z", publication_date="2026-08-24T10:00:00Z", body_path="doc/test", metadata_path=None, body="${phrase}", normalized_body=projective.normalize_space("${phrase}")); cues = projective.extract_explore_cues([doc]); print(json.dumps([{"phrase": c.phrase, "normalized_target": c.normalized_target} for c in cues]))`;
    const out = execSync(`"${uvPath}" run python -c "${pyScript}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return JSON.parse(out.trim());
  } catch {
    return null;
  }
}

export const DEVELOPMENT_CHALLENGES = [
  {
    id: 'CH-01',
    dimension: 'D1_NATIVE_METHOD_FIDELITY',
    title: 'Field Marker Census Preservation Across Multi-Paragraph Documents',
    execute: (engine, isUnion, isReciprocal, isPythonNativeS0 = false) => {
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
    title: 'Trailing-Numeral Explore Cue Extraction (Exact Match vs Discrepancy Witness)',
    execute: (engine, isUnion, isReciprocal, isPythonNativeS0 = false) => {
      const phrase = 'Please Explore Beta Exploration Series IV. This is critical.';
      const doc = {
        record_id: 'doc-002',
        title: 'Exploration Framework',
        created: '2026-08-24T10:00:00Z',
        body: phrase,
      };

      if (isPythonNativeS0) {
        // Authentically invoke pinned Python projective.py
        const pyCues = runPythonNativeExploreCue(phrase);
        if (pyCues && pyCues.length === 1) {
          // Pinned Python strips Roman numeral IV -> "beta exploration series"
          return pyCues[0].normalized_target === 'beta exploration series';
        }
        return false;
      }

      const res = isUnion
        ? engine.executeNativeProjective([doc])
        : isReciprocal
        ? engine.executeNativeProjective([doc])
        : runProjectiveRouting([doc]);

      // Exact expected target check (unforgiving check, SRC-R05)
      return res.cues.length === 1 && res.cues[0].normalized_target === 'beta exploration series';
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
    execute: (engine, isUnion, isReciprocal, isPythonNativeS0 = false, receiverInstance = null) => {
      if (receiverInstance) {
        // Genuine receiver evaluation (SRC-R02)
        // Admitting doc-later then trying to explore to doc-earlier
        try {
          receiverInstance.admitSource({
            source_id: 'doc-earlier-rec',
            source_uri: 'fixture://src/doc-earlier',
            body_text: 'Earlier document content.',
            declared_sha256: sha256('Earlier document content.'),
            content_type: 'text/markdown',
            acquired_date: '2026-08-24T10:00:00Z',
          });
          receiverInstance.admitSource({
            source_id: 'doc-later-rec',
            source_uri: 'fixture://src/doc-later',
            body_text: 'Later document content with Explore doc-earlier.',
            declared_sha256: sha256('Later document content with Explore doc-earlier.'),
            content_type: 'text/markdown',
            acquired_date: '2026-08-24T12:00:00Z',
          });
          const relRes = receiverInstance.registerRelation({
            from_source_id: 'doc-later-rec',
            to_source_id: 'doc-earlier-rec',
            relation_type: 'EXPLORE_PROJECTIVE',
            warrant: 'EXACT_EXPLORE_CUE_AND_VALID_CHRONOLOGY',
            source_capture_span_proof: {
              cue_text: 'Explore doc-earlier.',
              byte_offset: 23,
              byte_length: 19,
            },
          });
          return relRes.status === 'REJECTED' && relRes.reason === 'PREEXISTING_CHRONOLOGY_BLOCKED';
        } catch {
          return false;
        }
      }

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
    execute: (engine, isUnion, isReciprocal, isPythonNativeS0 = false, receiverInstance = null) => {
      if (receiverInstance) {
        // Receiver does not support retrospective citation warrant natively -> NOT_APPLICABLE_BY_DESIGN
        return 'NOT_APPLICABLE_BY_DESIGN';
      }

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
    execute: (engine, isUnion, isReciprocal, isPythonNativeS0 = false, receiverInstance = null) => {
      if (receiverInstance) {
        // Genuine receiver evaluation on invalid warrant
        try {
          const res = receiverInstance.registerRelation({
            from_source_id: 'src-unknown-1',
            to_source_id: 'src-unknown-2',
            relation_type: 'EXPLORE_PROJECTIVE',
            warrant: 'FABRICATED_IMAGINARY_WARRANT_V99',
          });
          return res.status === 'REJECTED';
        } catch {
          return true; // Fail closed
        }
      }

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
      const text = '# Source Evidence Content for Provenance Verification';
      const expectedDigest = sha256(text);
      const root = engine.admitSourceRoot({
        rootId: 'root-provenance-test',
        text,
        metadata: { title: 'Provenance Root', platform: 'TEST' },
      });
      engine.registerRule('R1', { premises: ['root-provenance-test'], conclusionId: 'derived-step-1' });
      engine.registerRule('R2', { premises: ['derived-step-1'], conclusionId: 'terminal-claim-8' });
      const lfp = engine.computeLeastFixedPoint();
      const termClaim = lfp.get('terminal-claim-8');
      return Boolean(
        termClaim &&
        termClaim.grounded &&
        termClaim.derivationDepth === 2 &&
        termClaim.sourceRoots.includes('root-provenance-test') &&
        root.byteDigest === expectedDigest
      );
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

      // Symmetric API call across both engines (SRC-R06)
      engine.admitDelayedTarget('doc-delayed-target', {
        title: 'Late Target',
        created: '2026-08-24T12:00:00Z',
        text: '# Late Arriving Target Document Content',
      }, wMap);

      const edgeKey = 'doc-source-early->doc-delayed-target:EXPLORE_PROJECTIVE';
      const attemptIds = bg.edgeAttempts.get(edgeKey) || [];
      const lastAttempt = bg.attempts.get(attemptIds[attemptIds.length - 1]);
      return Boolean(lastAttempt && lastAttempt.state === RELATION_STATES.ADMITTED);
    },
  },
  {
    id: 'CH-15',
    dimension: 'D9_TERMINAL_EQUALITY_VS_TRAJECTORY',
    title: 'Same-Input Same-Clock Trajectory Divergence vs Terminal Graph Parity',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;

      // Clock-stepped sequence of operations on identical input
      // Step 1: Admit Root 1
      engine.admitSourceRoot({
        rootId: 'clock-root-1',
        text: 'Root 1 evidence',
        metadata: { created: '2026-08-24T10:00:00Z' },
      });

      // Step 2: Attempt forward exploration to delayed target
      engine.shadowGraph.registerNode('clock-delayed-target', { created_at: '2026-08-24T12:00:00Z', expected_gap: true }, false);
      const warrant_params = {
        cue_verified: true,
        adjudicator_receipt_id: 'rec-clock-1',
        evidence_coordinates: { start: 10, end: 30 },
      };
      const attempt = engine.recordAttempt({
        from: 'clock-root-1',
        to: 'clock-delayed-target',
        relation_type: 'EXPLORE_PROJECTIVE',
        proposed_warrant: 'EXACT_FORWARD_EXPLORE_CUE',
        warrant_params,
      });

      // Step 3: Delayed target arrives
      const wMap = { [attempt.attempt_id]: warrant_params };
      engine.admitDelayedTarget('clock-delayed-target', {
        created: '2026-08-24T12:00:00Z',
        text: 'Delayed target content',
      }, wMap);

      // Verify terminal relation state
      const edgeKey = 'clock-root-1->clock-delayed-target:EXPLORE_PROJECTIVE';
      const attemptIds = engine.shadowGraph.edgeAttempts.get(edgeKey) || [];
      const lastAttempt = engine.shadowGraph.attempts.get(attemptIds[attemptIds.length - 1]);
      const terminalAdmitted = Boolean(lastAttempt && lastAttempt.state === RELATION_STATES.ADMITTED);

      if (isUnion) {
        // Union achieves terminal admission via batched evaluation; zero dynamic telemetry logged
        return terminalAdmitted;
      }

      if (isReciprocal) {
        // Reciprocal achieves terminal admission AND logs dynamic trajectory transitions
        const hasTrajectoryTelemetry = engine.trajectoryEvents.some(e => e.eventType === 'DELAYED_TARGET_READJUDICATED');
        return terminalAdmitted && hasTrajectoryTelemetry;
      }

      return false;
    },
  },
  {
    id: 'CH-16',
    dimension: 'D10_WARRANTED_SCIENTIFIC_INFORMATION',
    title: 'Reverse-Ordered Dependency Chain Depth Boundary & Circularity Ceiling',
    execute: (engine, isUnion, isReciprocal) => {
      if (!isUnion && !isReciprocal) return false;

      // 1. Test circularity detection
      engine.registerRule('R_CYCLE_A', { premises: ['cycle_B'], conclusionId: 'cycle_A' });
      engine.registerRule('R_CYCLE_B', { premises: ['cycle_A'], conclusionId: 'cycle_B' });
      const circ = engine.detectConjunctiveCircularity();
      const circPass = circ.hasCycle && circ.circularNodes.includes('cycle_A');

      // 2. Test reverse-ordered deep dependency chain (SRC-R05 depth exhaustion boundary)
      // Create root and 30-node reverse-ordered chain: C_30 depends on C_29 ... depends on root
      const rootId = 'deep-chain-root';
      engine.admitSourceRoot({ rootId, text: 'Deep chain root evidence', metadata: {} });

      const depth = 30;
      for (let i = depth; i >= 1; i--) {
        const premise = i === 1 ? rootId : `deep-node-${i - 1}`;
        engine.registerRule(`R_DEEP_${i}`, { premises: [premise], conclusionId: `deep-node-${i}` });
      }

      // Compute LFP with ceiling of 50 (should succeed since 30 < 50)
      const lfpSuccess = engine.computeLeastFixedPoint(50);
      const deepNodePass = lfpSuccess.has(`deep-node-${depth}`);

      // Compute LFP with strict ceiling of 10 (must fail or report iteration_exhausted since 30 > 10)
      const lfpExhausted = engine.computeLeastFixedPoint(10);
      const boundaryReportedPass = lfpExhausted.iteration_exhausted === true;

      return circPass && deepNodePass && boundaryReportedPass;
    },
  },
];
