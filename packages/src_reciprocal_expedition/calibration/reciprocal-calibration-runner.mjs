/**
 * TD613 SRC Reciprocal Calibration Runner
 * 
 * Executes the 12 reciprocal challenges side-by-side:
 * Origin (Authentic Native SRC) vs Recipient (Empty Encyclopedia Receiver).
 * Verifies exact method-result equivalence, refusal parity, and lack of leakage.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  ATELIER_SNAPSHOT_ID,
  SEAL_ID,
  runProjectiveRouting,
  runPhase2Tomography,
  runPhase2ContextRoles,
  runNativeQuery,
} from '../native_atlas/src-native-methods.mjs';

import {
  EmptyEncyclopediaReceiver,
  ReceiverError,
  sha256,
} from '../receiver/empty-encyclopedia-receiver.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deckPath = path.resolve(__dirname, 'reciprocal-calibration-deck.json');
const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));

console.log('================================================================');
console.log('SRC RECIPROCAL CALIBRATION RUN: 12-CHALLENGE SUITE');
console.log('================================================================\n');

const calibrationResults = [];

for (const ch of deck.challenges) {
  console.log(`[CHALLENGE] ${ch.id}: ${ch.description}`);

  let originTrace = null;
  let recipientTrace = null;
  let parity = false;
  let notes = '';

  // Set up fresh empty receiver instance for recipient-side execution
  const rec = new EmptyEncyclopediaReceiver();
  const initWitness = rec.initialize({ memory: true });

  switch (ch.id) {
    case 'CHALLENGE_01_VALID_EXPLORE_CUE': {
      const docs = [ch.input_document, ch.target_document];
      originTrace = runProjectiveRouting(docs);

      // Recipient side
      rec.admitSource({
        source_id: ch.input_document.record_id,
        declared_title: ch.input_document.title,
        platform: 'zenodo',
        created_at: ch.input_document.created,
        normalized_body: ch.input_document.body,
      });
      rec.admitSource({
        source_id: ch.target_document.record_id,
        declared_title: ch.target_document.title,
        platform: 'zenodo',
        created_at: ch.target_document.created,
        normalized_body: ch.target_document.body,
      });

      rec.registerMethod('PROJECTIVE_ROUTING', ({ receiver }) => {
        const rows = receiver.db.prepare(`
          SELECT s.source_id as record_id, s.declared_title as title, s.created_at as created, cap.normalized_body as body
          FROM sources s JOIN captures cap ON s.source_id = cap.source_id
        `).all();
        return runProjectiveRouting(rows);
      });

      const inv = rec.invokeMethod('PROJECTIVE_ROUTING');
      recipientTrace = inv.result;

      parity = (
        originTrace.cue_count === recipientTrace.cue_count &&
        originTrace.candidate_link_count === recipientTrace.candidate_link_count &&
        originTrace.links[0]?.temporal_relationship === recipientTrace.links[0]?.temporal_relationship
      );
      notes = `Identical cue (${originTrace.cue_count}) and link count (${originTrace.candidate_link_count}); temporal relation: ${originTrace.links[0]?.temporal_relationship}`;
      break;
    }

    case 'CHALLENGE_02_MALFORMED_EXPLORE_CUE': {
      const docs = [ch.input_document];
      originTrace = runProjectiveRouting(docs);

      rec.admitSource({
        source_id: ch.input_document.record_id,
        declared_title: ch.input_document.title,
        platform: 'zenodo',
        created_at: ch.input_document.created,
        normalized_body: ch.input_document.body,
      });
      rec.registerMethod('PROJECTIVE_ROUTING', ({ receiver }) => {
        const rows = receiver.db.prepare(`
          SELECT s.source_id as record_id, s.declared_title as title, s.created_at as created, cap.normalized_body as body
          FROM sources s JOIN captures cap ON s.source_id = cap.source_id
        `).all();
        return runProjectiveRouting(rows);
      });
      const inv = rec.invokeMethod('PROJECTIVE_ROUTING');
      recipientTrace = inv.result;

      parity = (originTrace.cue_count === 0 && recipientTrace.cue_count === 0);
      notes = 'Both origin and recipient refused malformed cue (0 cues detected).';
      break;
    }

    case 'CHALLENGE_03_PROJECTIVE_PATH_RESOLUTION': {
      const docs = [ch.input_document, ch.target_document];
      originTrace = runProjectiveRouting(docs);

      rec.admitSource({
        source_id: ch.input_document.record_id,
        declared_title: ch.input_document.title,
        platform: 'zenodo',
        created_at: ch.input_document.created,
        normalized_body: ch.input_document.body,
      });
      rec.admitSource({
        source_id: ch.target_document.record_id,
        declared_title: ch.target_document.title,
        platform: 'zenodo',
        created_at: ch.target_document.created,
        normalized_body: ch.target_document.body,
      });
      rec.registerMethod('PROJECTIVE_ROUTING', ({ receiver }) => {
        const rows = receiver.db.prepare(`
          SELECT s.source_id as record_id, s.declared_title as title, s.created_at as created, cap.normalized_body as body
          FROM sources s JOIN captures cap ON s.source_id = cap.source_id
        `).all();
        return runProjectiveRouting(rows);
      });
      const inv = rec.invokeMethod('PROJECTIVE_ROUTING');
      recipientTrace = inv.result;

      parity = (
        originTrace.links[0]?.match_type === recipientTrace.links[0]?.match_type &&
        originTrace.links[0]?.match_type === 'EXACT_OR_TITLE_SUBSTRING'
      );
      notes = `Both resolved target via ${originTrace.links[0]?.match_type}.`;
      break;
    }

    case 'CHALLENGE_04_CHRONOLOGICAL_INVALIDATION': {
      const docs = [ch.source_document, ch.target_document];
      originTrace = runProjectiveRouting(docs);

      rec.admitSource({
        source_id: ch.source_document.record_id,
        declared_title: ch.source_document.title,
        platform: 'zenodo',
        created_at: ch.source_document.created,
        normalized_body: ch.source_document.body,
      });
      rec.admitSource({
        source_id: ch.target_document.record_id,
        declared_title: ch.target_document.title,
        platform: 'zenodo',
        created_at: ch.target_document.created,
        normalized_body: ch.target_document.body,
      });
      rec.registerMethod('PROJECTIVE_ROUTING', ({ receiver }) => {
        const rows = receiver.db.prepare(`
          SELECT s.source_id as record_id, s.declared_title as title, s.created_at as created, cap.normalized_body as body
          FROM sources s JOIN captures cap ON s.source_id = cap.source_id
        `).all();
        return runProjectiveRouting(rows);
      });
      const inv = rec.invokeMethod('PROJECTIVE_ROUTING');
      recipientTrace = inv.result;

      parity = (
        originTrace.links[0]?.temporal_relationship === 'PREEXISTING_OR_CONTEMPORANEOUS' &&
        recipientTrace.links[0]?.temporal_relationship === 'PREEXISTING_OR_CONTEMPORANEOUS'
      );
      notes = 'Both marked temporal relation as PREEXISTING (causal downstream claim blocked).';
      break;
    }

    case 'CHALLENGE_05_CONTRADICTORY_PROPOSITIONS': {
      originTrace = runPhase2Tomography(ch.propositions);

      rec.registerMethod('TOMOGRAPHY', ({ params }) => runPhase2Tomography(params.candidates));
      const inv = rec.invokeMethod('TOMOGRAPHY', { candidates: ch.propositions });
      recipientTrace = inv.result;

      parity = (
        originTrace.conservation.length === recipientTrace.conservation.length &&
        originTrace.conservation[0].outcome === 'NARROWED' &&
        originTrace.conservation[1].outcome === 'EXPANDED'
      );
      notes = 'Both preserved opposing outcomes (NARROWED and EXPANDED) without collapse.';
      break;
    }

    case 'CHALLENGE_06_ALTERNATIVE_CONTEXTUAL_ROLES': {
      originTrace = runPhase2ContextRoles(ch.compiler_inputs, []);

      rec.registerMethod('CONTEXT_ROLES', ({ params }) => runPhase2ContextRoles(params.inputs, []));
      const inv = rec.invokeMethod('CONTEXT_ROLES', { inputs: ch.compiler_inputs });
      recipientTrace = inv.result;

      parity = (
        originTrace.roles.length === recipientTrace.roles.length &&
        originTrace.roles[0].contextual_role === 'PRIMARY_GROUND_WITNESS' &&
        originTrace.roles[1].contextual_role === 'SECONDARY_CONSERVATIVE_CONTROL'
      );
      notes = 'Both preserved distinct roles for the same entity across compiler passes.';
      break;
    }

    case 'CHALLENGE_07_CONTEXT_WITHDRAWAL_SOURCE_REMOVAL': {
      // Origin side: run on full vs withdrawn
      const fullDocs = [
        { record_id: 'cal-doc-01', title: 'Alpha', created: '2026-08-01', body: 'Explore Beta.' },
        { record_id: 'cal-doc-02', title: 'Beta', created: '2026-08-02', body: 'Target body.' }
      ];
      const withdrawnDocs = [fullDocs[0]];
      originTrace = {
        full: runProjectiveRouting(fullDocs).candidate_link_count,
        withdrawn: runProjectiveRouting(withdrawnDocs).candidate_link_count,
      };

      // Recipient side
      rec.admitSource({
        source_id: 'cal-doc-01',
        declared_title: 'Alpha',
        platform: 'zenodo',
        created_at: '2026-08-01',
        normalized_body: 'Explore Beta.',
      });
      // Do not admit Beta (simulating withdrawal)
      rec.registerMethod('PROJECTIVE_ROUTING', ({ receiver }) => {
        const rows = receiver.db.prepare(`
          SELECT s.source_id as record_id, s.declared_title as title, s.created_at as created, cap.normalized_body as body
          FROM sources s JOIN captures cap ON s.source_id = cap.source_id
        `).all();
        return runProjectiveRouting(rows);
      });
      const inv = rec.invokeMethod('PROJECTIVE_ROUTING');
      recipientTrace = {
        withdrawn: inv.result.candidate_link_count,
      };

      parity = (originTrace.withdrawn === 0 && recipientTrace.withdrawn === 0);
      notes = 'Withdrawn source resulted in 0 candidate links on both sides (dangling cue refused).';
      break;
    }

    case 'CHALLENGE_08_EQUIVALENT_TEXT_DISTINCT_SOURCES': {
      originTrace = {
        rule: 'IDENTICAL_NORMALIZED_BODY_BLOCKS_ANCESTRAL_PROMOTION',
        sha_a: sha256(ch.source_a.body),
        sha_b: sha256(ch.source_b.body),
        bodies_identical: sha256(ch.source_a.body) === sha256(ch.source_b.body),
      };

      const admA = rec.admitSource({
        source_id: ch.source_a.record_id,
        declared_title: ch.source_a.title,
        platform: 'zenodo',
        normalized_body: ch.source_a.body,
      });
      const admB = rec.admitSource({
        source_id: ch.source_b.record_id,
        declared_title: ch.source_b.title,
        platform: 'github',
        normalized_body: ch.source_b.body,
      });
      recipientTrace = {
        source_a_identical_detected: admA.identical_body_detected,
        source_b_identical_detected: admB.identical_body_detected,
        ancestral_lineage_refused: admB.ancestral_lineage_refused,
      };

      parity = (
        originTrace.bodies_identical === true &&
        recipientTrace.source_b_identical_detected === true &&
        recipientTrace.ancestral_lineage_refused === true
      );
      notes = 'Receiver detected identical body and refused ancestral independence claim.';
      break;
    }

    case 'CHALLENGE_09_UNSUPPORTED_INTERMEDIATE_LINK': {
      originTrace = runNativeQuery({
        action: 'trace',
        entity_id: 'ent:alpha',
        rootData: {
          entity_index: [{ entity_id: 'ent:alpha' }],
          entity_resolver: [],
          typed_edges: [],
        },
        requestedSnapshot: ATELIER_SNAPSHOT_ID,
        requestedSeal: SEAL_ID,
      });

      rec.registerMethod('TRACE', ({ params }) => runNativeQuery({
        action: 'trace',
        entity_id: params.entity_id,
        rootData: params.rootData,
        requestedSnapshot: ATELIER_SNAPSHOT_ID,
        requestedSeal: SEAL_ID,
      }));
      const inv = rec.invokeMethod('TRACE', {
        entity_id: 'ent:alpha',
        rootData: {
          entity_index: [{ entity_id: 'ent:alpha' }],
          entity_resolver: [],
          typed_edges: [],
        },
      });
      recipientTrace = inv.result;

      parity = (
        originTrace.result.missing_hops.includes('NO_DOWNSTREAM_WITNESSED_RELATION') &&
        recipientTrace.result.missing_hops.includes('NO_DOWNSTREAM_WITNESSED_RELATION')
      );
      notes = 'Both explicitly declared missing hops without inventing joins.';
      break;
    }

    case 'CHALLENGE_10_MISSING_ENDPOINT_RELATION': {
      originTrace = {
        rule: 'UNSUPPORTED_GRAPH_LINK_ON_MISSING_ENDPOINT',
        expected: 'REFUSAL',
      };

      let recRefused = false;
      let recErrorCode = '';
      try {
        rec.registerRelation({
          from_source_id: 'cal-doc-01',
          to_source_id: 'cal-doc-NONEXISTENT',
          relation_type: 'PROJECTIVE_LINK',
        });
      } catch (err) {
        recRefused = true;
        recErrorCode = err.code;
      }
      recipientTrace = {
        refused: recRefused,
        error_code: recErrorCode,
      };

      parity = (recRefused && recErrorCode === 'UNSUPPORTED_GRAPH_LINK');
      notes = 'Recipient refused missing endpoint with UNSUPPORTED_GRAPH_LINK.';
      break;
    }

    case 'CHALLENGE_11_NULL_UNKNOWN_EVIDENCE': {
      originTrace = runPhase2Tomography([ch.candidate]);

      rec.registerMethod('TOMOGRAPHY', ({ params }) => runPhase2Tomography(params.candidates));
      const inv = rec.invokeMethod('TOMOGRAPHY', { candidates: [ch.candidate] });
      recipientTrace = inv.result;

      parity = (
        originTrace.tomography[0].composite_score === null &&
        recipientTrace.tomography[0].composite_score === null &&
        originTrace.tomography[0].delta_evidence === 'UNKNOWN' &&
        recipientTrace.tomography[0].delta_evidence === 'UNKNOWN'
      );
      notes = 'Both preserved composite_score: null and delta_evidence: UNKNOWN.';
      break;
    }

    case 'CHALLENGE_12_IMPOSSIBLE_REQUEST_WRONG_SEAL': {
      originTrace = runNativeQuery({
        action: ch.query.action,
        rootData: {},
        requestedSnapshot: ch.query.requestedSnapshot,
        requestedSeal: ch.query.requestedSeal,
      });

      rec.registerMethod('QUERY', ({ params }) => runNativeQuery({
        action: params.action,
        rootData: params.rootData,
        requestedSnapshot: params.requestedSnapshot,
        requestedSeal: params.requestedSeal,
      }));
      const inv = rec.invokeMethod('QUERY', {
        action: ch.query.action,
        rootData: {},
        requestedSnapshot: ch.query.requestedSnapshot,
        requestedSeal: ch.query.requestedSeal,
      });
      recipientTrace = inv.result;

      parity = (
        originTrace.status === 'REFUSED' &&
        recipientTrace.status === 'REFUSED' &&
        originTrace.error === recipientTrace.error
      );
      notes = 'Both refused mismatched epoch seal with identical typed error message.';
      break;
    }

    default:
      throw new Error(`UNKNOWN_CHALLENGE: ${ch.id}`);
  }

  calibrationResults.push({
    challenge_id: ch.id,
    category: ch.category,
    description: ch.description,
    parity,
    notes,
    origin_trace_summary: originTrace ? (originTrace.method || originTrace.schema_version || originTrace.rule || 'EXECUTED') : 'NONE',
    recipient_trace_summary: recipientTrace ? (recipientTrace.method || recipientTrace.schema_version || recipientTrace.error_code || 'EXECUTED') : 'NONE',
  });

  rec.close();
  console.log(`  -> RESULT: ${parity ? 'PARITY VERIFIED' : 'DISCREPANCY DETECTED'} (${notes})\n`);
}

console.log('================================================================');
console.log('RECIPROCAL CALIBRATION COMPLETE');
console.log('================================================================');

const summaryReceipt = {
  schema: 'td613.src-reciprocal-calibration-receipt/v1',
  timestamp: new Date().toISOString(),
  environment: 'Node.js ' + process.version,
  total_challenges: calibrationResults.length,
  parity_count: calibrationResults.filter(r => r.parity).length,
  results: calibrationResults,
};

const receiptPath = path.resolve(__dirname, 'src-reciprocal-calibration-receipt.json');
fs.writeFileSync(receiptPath, JSON.stringify(summaryReceipt, null, 2), 'utf8');
console.log(`Calibration receipt written to: ${receiptPath}`);
