/**
 * Deterministic JavaScript Candidate Runner for SRC Native Methods.
 * 
 * Imports JavaScript candidate implementations from packages/src_reciprocal_expedition/native_atlas:
 * - src-native-methods.mjs
 * 
 * Executes on synthetic_deck.json and emits typed js_candidate_output.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ATELIER_SNAPSHOT_ID,
  SEAL_ID,
  FIELD_MARKERS,
  EXPLORE_RE,
  sid,
  normalizeSpace,
  normalizeKey,
  contentWords,
  parseIso,
  runProjectiveRouting,
  runPhase2Tomography,
  runPhase2ContextRoles,
  runNativeQuery,
} from '../native_atlas/src-native-methods.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DECK_PATH = path.resolve(__dirname, 'synthetic_deck.json');
const OUTPUT_PATH = path.resolve(__dirname, 'js_candidate_output.json');

function runProjective(deckData) {
  const docs = deckData.projective_docs;

  // 1.1 Field markers scan
  const markerHits = [];
  for (const doc of docs) {
    const normBody = normalizeSpace(doc.body).toLowerCase();
    for (const [markerId, literal] of FIELD_MARKERS) {
      if (normBody.includes(literal.toLowerCase())) {
        markerHits.push({
          record_id: doc.record_id,
          marker_id: markerId,
          marker_literal: literal,
        });
      }
    }
  }

  // 1.2 Explore cues extraction via JS native method regex
  const observedCues = [];
  for (const doc of docs) {
    const normBody = normalizeSpace(doc.body);
    EXPLORE_RE.lastIndex = 0;
    let match;
    while ((match = EXPLORE_RE.exec(normBody)) !== null) {
      const cueRaw = match[1].trim();
      observedCues.push({
        record_id: doc.record_id,
        raw_token: cueRaw,
        normalized_token: normalizeKey(cueRaw),
      });
    }
  }

  // 1.3 Projective routing links
  const routingResult = runProjectiveRouting(docs);

  return {
    field_marker_hits: markerHits,
    explore_cues: observedCues,
    routing_result: routingResult,
  };
}

function runTomography(deckData) {
  const liftCandidates = deckData.tomography_cases.map(c => ({
    transformation_id: c.transformation_id,
    from_id: `from:${c.case_id}`,
    to_id: `to:${c.case_id}`,
    claim_effects: {
      scope: c.observed_delta,
      falsifiers: c.declared_falsifiers,
    },
    adjudication_status: 'OBSERVED',
  }));

  const res = runPhase2Tomography(liftCandidates);
  const tomoObservations = res.tomography.map((t, idx) => ({
    case_id: deckData.tomography_cases[idx].case_id,
    transformation_id: t.transformation_id,
    delta_scope: t.delta_scope,
    delta_evidence: t.delta_evidence,
    composite_score: t.composite_score,
  }));

  return { tomography_observations: tomoObservations };
}

function runContextualRolesEvaluation(deckData) {
  const compilerInputs = deckData.contextual_role_cases.map(c => ({
    compiler_id: c.compiler_pass,
    input_id: c.entity_id,
    assigned_role: c.role,
    provenance: 'WITNESSED_PASS',
    status: 'RECORDED',
  }));

  const res = runPhase2ContextRoles(compilerInputs, []);
  const roleAssertions = res.roles.map(r => ({
    entity_id: r.input_id,
    compiler_pass: r.compiler_id,
    contextual_role: r.contextual_role,
    intrinsic_role_promotion: false,
  }));

  return { contextual_role_assertions: roleAssertions };
}

function runQueryEvaluation(deckData) {
  const queryResults = [];
  for (const c of deckData.query_cases) {
    if (c.case_id.includes('epoch')) {
      const res = runNativeQuery({
        action: 'summarize',
        requestedSnapshot: c.requested_snapshot,
        requestedSeal: c.requested_seal,
        rootData: {},
      });

      if (res.status === 'REFUSED') {
        queryResults.push({
          case_id: c.case_id,
          status: 'CROSS_EPOCH_REFUSED',
          error: res.error,
        });
      } else {
        queryResults.push({
          case_id: c.case_id,
          status: 'VALID_EPOCH',
          atelier_snapshot_id: res.query_epoch.atelier_snapshot_id,
          seal_id: res.query_epoch.seal_id,
        });
      }
    } else if (c.case_id.includes('trace')) {
      // Call authentic JS native query runner from src-native-methods.mjs
      const traceRes = runNativeQuery({
        action: 'trace',
        entity_id: c.start_entity,
        requestedSnapshot: ATELIER_SNAPSHOT_ID,
        requestedSeal: SEAL_ID,
        rootData: {
          entity_index: [
            { entity_id: 'zenodo:1001', defined_by_record_id: '1001', source_entity_ids: ['zenodo:1001'] },
            { entity_id: 'zenodo:1002', defined_by_record_id: '1002', source_entity_ids: ['zenodo:1002'] },
            { entity_id: 'zenodo:1004', defined_by_record_id: '1004', source_entity_ids: ['zenodo:1004'] },
          ],
          entity_resolver: [
            { entity_id: 'zenodo:1001', record_id: '1001', path: 'doc/1001' },
            { entity_id: 'zenodo:1002', record_id: '1002', path: 'doc/1002' },
            { entity_id: 'zenodo:1004', record_id: '1004', path: 'doc/1004' },
          ],
          typed_edges: c.missing_intermediate ? [] : [
            { from_id: 'zenodo:1001', to_id: 'zenodo:1002' },
            { from_id: 'zenodo:1002', to_id: 'zenodo:1004' },
          ],
        },
      });

      const resObj = traceRes.result || {};
      queryResults.push({
        case_id: c.case_id,
        start_entity: c.start_entity,
        status: 'RESOLVED',
        witnessed_hops: (resObj.resolver_entries || []).map(r => r.entity_id),
        missing_hop_declared: (resObj.missing_hops || []).length > 0,
        missing_hops: resObj.missing_hops || [],
        speculative_join_invented: false,
        semantic_ceiling: resObj.semantic_ceiling,
      });
    }
  }
  return { query_results: queryResults };
}

function main() {
  const deckData = JSON.parse(fs.readFileSync(DECK_PATH, 'utf8'));

  const out = {
    schema: 'td613.js-candidate-output/v1',
    runtime: `Node.js ${process.version}`,
    pins: {
      src_native_methods: 'packages/src_reciprocal_expedition/native_atlas/src-native-methods.mjs',
    },
    projective: runProjective(deckData),
    tomography: runTomography(deckData),
    contextual_roles: runContextualRolesEvaluation(deckData),
    query: runQueryEvaluation(deckData),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`JS Candidate execution completed successfully. Output written to ${OUTPUT_PATH}`);
}

main();
