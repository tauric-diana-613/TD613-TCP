/**
 * SignalRupture Native Research Method Engine (Node.js/ESM implementation)
 * 
 * Strict preservation of the original SignalRupture atelier methods:
 * 1. SRC_PROJECTIVE_ROUTING (zenodo text / explore cues / field markers)
 * 2. SRC_PHASE2_TOMOGRAPHY (representation-lift claim-evidence deltas)
 * 3. SRC_PHASE2_CONTEXT_ROLES (compiler contextual roles)
 * 4. SRC_NATIVE_QUERY (summarize, resolve, trace, seal-pinned)
 * 
 * Preserves original code contracts:
 * - NO_LATEST_WINS
 * - NO_SEMANTIC_OR_CAUSAL_PROMOTION
 * - CONTEXTUAL_NOT_INTRINSIC
 * - DECLARED_EFFECTS_ONLY
 * - EXPLICIT_MISSING_HOPS
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const ATELIER_SNAPSHOT_ID = 'src-20260824-p2-001';
export const SEAL_ID = 'src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a';

export const FIELD_MARKERS = [
  ['machine_readable_field', 'machine-readable field'],
  ['machine_readable_entity', 'machine-readable entity'],
  ['unified_epistemic_entity', 'unified epistemic entity'],
  ['field_graph_not_sequence', 'field becomes a graph rather than a sequence'],
  ['field_machine_legibility', 'fields become machine-legible before they become human-legible'],
  ['semantic_space_anchor', 'anchors in semantic space'],
  ['signature_coordinates', 'signatures are not slogans. they are coordinates'],
  ['signature_instructions', 'signatures are not decoration. they are instructions'],
  ['partial_projections', 'partial projections'],
  ['structural_simulation_narrative', 'structural simulation narrative'],
  ['ontological_instantiation', 'ontological instantiation'],
  ['dual_gradient', 'dual-gradient'],
  ['parallel_structural_transmission', 'parallel channel of structural transmission'],
];

export const STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'of',
  'on', 'or', 'sr', 'the', 'to', 'under', 'with',
]);

export const EXPLORE_RE = /\bExplore\s+([^.!?]{2,96})\./gi;

export function sid(prefix, ...parts) {
  const raw = parts.join('\x1f');
  const hash = crypto.createHash('sha256').update(raw, 'utf8').digest('hex').slice(0, 24);
  return `${prefix}:${hash}`;
}

export function normalizeSpace(value) {
  if (!value) return '';
  let str = String(value).normalize('NFKC');
  str = str.replace(/\u2011/g, '-').replace(/\u2013/g, '-').replace(/\u2014/g, '-');
  return str.replace(/\s+/g, ' ').trim();
}

export function normalizeKey(value) {
  const s = normalizeSpace(value).toLowerCase();
  const cleaned = s.replace(/[^a-z0-9]+/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

export function contentWords(value) {
  const words = normalizeKey(value).split(' ');
  const set = new Set();
  for (const w of words) {
    if (w.length > 1 && !STOPWORDS.has(w)) {
      set.add(w);
    }
  }
  return set;
}

export function parseIso(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// -------------------------------------------------------------
// 1. SRC_PROJECTIVE_ROUTING
// -------------------------------------------------------------
export function runProjectiveRouting(documents, catalog = []) {
  const docMap = new Map();
  for (const doc of documents) {
    docMap.set(doc.record_id, doc);
  }

  const catalogDocs = (catalog.length > 0 ? catalog : documents);
  const titleIndex = catalogDocs.map(d => ({
    record_id: d.record_id,
    title: d.title,
    normTitle: normalizeKey(d.title),
    words: contentWords(d.title),
    created: d.created,
  }));

  const observedCues = [];
  const candidateLinks = [];
  const fieldMarkerHits = [];

  for (const doc of documents) {
    const text = doc.body || '';
    const normBody = normalizeSpace(text);

    // 1.1 Field markers scan
    for (const [markerId, literal] of FIELD_MARKERS) {
      if (normBody.toLowerCase().includes(literal.toLowerCase())) {
        fieldMarkerHits.push({
          record_id: doc.record_id,
          marker_id: markerId,
          marker_literal: literal,
        });
      }
    }

    // 1.2 Explore X. scan
    EXPLORE_RE.lastIndex = 0;
    let match;
    while ((match = EXPLORE_RE.exec(normBody)) !== null) {
      const cueRaw = match[1].trim();
      const cueNorm = normalizeKey(cueRaw);
      const cueWords = contentWords(cueRaw);
      const cueId = sid('src-explore-cue', doc.record_id, cueRaw);

      observedCues.push({
        cue_id: cueId,
        source_record_id: doc.record_id,
        raw_target: cueRaw,
        normalized_target: cueNorm,
      });

      // Match against candidate documents
      for (const target of titleIndex) {
        if (target.record_id === doc.record_id) continue;

        let matchType = null;
        if (target.normTitle === cueNorm || (cueNorm.length > 4 && target.normTitle.includes(cueNorm))) {
          matchType = 'EXACT_OR_TITLE_SUBSTRING';
        } else {
          // Check lexical overlap
          let overlapCount = 0;
          for (const w of cueWords) {
            if (target.words.has(w)) overlapCount++;
          }
          if (overlapCount >= 2 || (cueWords.size === 1 && overlapCount === 1 && cueWords.values().next().value.length > 5)) {
            matchType = 'LEXICAL_OVERLAP_ONLY';
          }
        }

        if (matchType) {
          // Temporal order
          let temporal = 'TIME_UNRESOLVED';
          const srcDate = parseIso(doc.created);
          const tgtDate = parseIso(target.created);
          if (srcDate && tgtDate) {
            if (tgtDate.getTime() > srcDate.getTime()) {
              temporal = 'LATER';
            } else {
              temporal = 'PREEXISTING_OR_CONTEMPORANEOUS';
            }
          }

          candidateLinks.push({
            cue_id: cueId,
            source_record_id: doc.record_id,
            target_record_id: target.record_id,
            match_type: matchType,
            temporal_relationship: temporal,
            semantic_promotion: 'NO_SEMANTIC_OR_CAUSAL_PROMOTION',
          });
        }
      }
    }
  }

  return {
    method: 'SRC_PROJECTIVE_ROUTING',
    document_count: documents.length,
    cue_count: observedCues.length,
    candidate_link_count: candidateLinks.length,
    field_marker_hits: fieldMarkerHits.length,
    cues: observedCues,
    links: candidateLinks,
    marker_hits: fieldMarkerHits,
    interpretive_limit: 'Lexical projective traversal produces candidates, never verified semantic assertions.',
  };
}

// -------------------------------------------------------------
// 2. SRC_PHASE2_TOMOGRAPHY
// -------------------------------------------------------------
export function runPhase2Tomography(liftCandidates, snapshot = ATELIER_SNAPSHOT_ID) {
  const conservation = [];
  const tomography = [];

  for (const lift of liftCandidates) {
    const effects = lift.claim_effects || {};
    const scope = effects.scope || 'UNKNOWN';
    let outcome = 'UNKNOWN';

    if (scope === 'NARROWED') {
      outcome = 'NARROWED';
    } else if (scope === 'BROADENED' || scope === 'EXPANDED') {
      outcome = 'EXPANDED';
    } else if (effects.semantic_core === 'PRESERVED') {
      outcome = 'PRESERVED';
    }

    conservation.push({
      schema_version: 'compiler-conservation-observation/v1',
      compiler_conservation_observation_id: sid('src-conservation', lift.transformation_id),
      compiler_or_transform_id: lift.transformation_id,
      input_id: lift.from_id,
      output_id: lift.to_id,
      outcome,
      dimensions: effects,
      evidence_ids: lift.evidence_ids || [],
      adjudication_status: lift.adjudication_status || 'OBSERVED',
      interpretive_limit: lift.interpretive_limit || 'Conservation tracks formal representation change.',
      atelier_snapshot_id: snapshot,
      seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL',
      source_status: 'ARCHIVE_OBSERVATION',
    });

    tomography.push({
      schema_version: 'claim-evidence-tomography/v1',
      claim_evidence_tomography_id: sid('src-claim-evidence', lift.transformation_id),
      transformation_id: lift.transformation_id,
      from_id: lift.from_id,
      to_id: lift.to_id,
      delta_evidence: 'UNKNOWN',
      delta_scope: scope,
      delta_falsifier_granularity: effects.falsifiers || 'UNKNOWN',
      delta_asserted_authority: 'UNKNOWN',
      other_observed_effects: effects,
      composite_score: null,
      evidence_ids: lift.evidence_ids || [],
      interpretive_limit: 'Dimensions remain separate; formalization is not assumed to increase rigor or restraint.',
      atelier_snapshot_id: snapshot,
      seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL',
      source_status: 'ARCHIVE_OBSERVATION',
    });
  }

  return {
    method: 'SRC_PHASE2_TOMOGRAPHY',
    candidate_count: liftCandidates.length,
    conservation,
    tomography,
    interpretive_limit: 'Declared effects forward tomography only. Composite scoring refused (composite_score: null).',
  };
}

// -------------------------------------------------------------
// 3. SRC_PHASE2_CONTEXT_ROLES
// -------------------------------------------------------------
export function runPhase2ContextRoles(compilerInputs, recompilationEdges, snapshot = ATELIER_SNAPSHOT_ID) {
  const roles = [];
  const passes = [];

  const grouped = new Map();
  for (const item of compilerInputs) {
    const cid = item.compiler_id || 'DEFAULT_COMPILER';
    if (!grouped.has(cid)) grouped.set(cid, []);
    grouped.get(cid).push(item);
  }

  for (const [compilerId, inputs] of grouped.entries()) {
    for (const inp of inputs) {
      const roleId = sid('src-context-role', compilerId, inp.input_id, inp.assigned_role);
      roles.push({
        schema_version: 'contextual-role-assertion/v1',
        contextual_role_assertion_id: roleId,
        compiler_id: compilerId,
        input_id: inp.input_id,
        contextual_role: inp.assigned_role,
        provenance: inp.provenance || 'WITNESSED_PASS',
        status: inp.status || 'RECORDED',
        evidence_claim_ceiling: 'Role is contextual to compiler pass, not intrinsic to source object.',
        atelier_snapshot_id: snapshot,
        seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL',
        source_status: 'ARCHIVE_OBSERVATION',
      });
    }

    passes.push({
      schema_version: 'compilation-pass/v1',
      compilation_pass_id: sid('src-compilation-pass', compilerId),
      compiler_id: compilerId,
      input_count: inputs.length,
      edge_count: recompilationEdges.filter(e => e.compiler_id === compilerId).length,
      compiler_status: 'WITNESSED_OR_CANDIDATE_AS_RECORDED_PER_INPUT',
      interpretive_limit: 'A compiler grouping preserves each input provenance and adjudication state.',
      atelier_snapshot_id: snapshot,
      seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL',
    });
  }

  return {
    method: 'SRC_PHASE2_CONTEXT_ROLES',
    role_count: roles.length,
    pass_count: passes.length,
    roles,
    passes,
    interpretive_limit: 'Roles are contextual, not intrinsic.',
  };
}

// -------------------------------------------------------------
// 4. SRC_NATIVE_QUERY
// -------------------------------------------------------------
export function runNativeQuery({ action, entity_id, rootData, requestedSnapshot, requestedSeal }) {
  if (requestedSnapshot !== ATELIER_SNAPSHOT_ID || requestedSeal !== SEAL_ID) {
    return {
      schema_version: 'src-query-result/v1',
      status: 'REFUSED',
      error: 'Requested snapshot/seal does not match this projection. Cross-epoch joins require a separate explicit assay.',
      requested: { snapshot: requestedSnapshot, seal: requestedSeal },
    };
  }

  const queryEpoch = {
    atelier_snapshot_id: requestedSnapshot,
    seal_id: requestedSeal,
  };

  if (action === 'summarize') {
    const outcomes = rootData.acquisition_outcomes || [];
    const counts = {};
    for (const row of outcomes) {
      const p = String(row.platform || 'UNKNOWN');
      const s = String(row.state || 'UNKNOWN');
      if (!counts[p]) counts[p] = {};
      counts[p][s] = (counts[p][s] || 0) + 1;
    }
    const expected = rootData.expected_objects || [];
    const roles = rootData.contextual_roles || [];
    const compilers = rootData.compilation_passes || [];
    const authority = rootData.authority_assertions || [];
    const lineages = rootData.evidence_lineages || [];
    const trails = rootData.coverage_ledger || [];

    return {
      schema_version: 'src-query-result/v1',
      query_epoch: queryEpoch,
      result: {
        coverage_by_platform_and_state: counts,
        unresolved_expected_objects: expected.filter(r => r.state === 'OPEN_UNRESOLVED'),
        compiler_map: { compilation_passes: compilers.length, contextual_role_assertions: roles.length },
        authority_jurisdiction_assertions: authority,
        evidence_lineage_groups: lineages,
        open_tomography_trails: trails.filter(r => String(r.status || '').includes('PENDING') || String(r.status || '').includes('REQUIRES')),
      },
    };
  }

  if (action === 'resolve') {
    const resolver = rootData.entity_resolver || [];
    const matches = resolver.filter(r => r.entity_id === entity_id);
    if (matches.length === 0) {
      return {
        schema_version: 'src-query-result/v1',
        query_epoch: queryEpoch,
        result: {
          entity_id,
          status: 'UNRESOLVED_TARGET',
        },
      };
    }
    return {
      schema_version: 'src-query-result/v1',
      query_epoch: queryEpoch,
      result: {
        entity_id,
        matches: matches.map(m => ({ ...m, path_exists: Boolean(m.path && rootData.available_paths?.includes(m.path)) })),
      },
    };
  }

  if (action === 'trace') {
    const entityIndex = rootData.entity_index || [];
    const resolver = rootData.entity_resolver || [];
    const typedEdges = rootData.typed_edges || [];

    const entityRows = entityIndex.filter(r => r.entity_id === entity_id);
    const seeds = new Set([entity_id]);
    if (entity_id && entity_id.includes(':')) {
      seeds.add(entity_id.split(':').pop());
    }
    for (const row of entityRows) {
      if (row.defined_by_record_id) seeds.add(String(row.defined_by_record_id));
      if (Array.isArray(row.source_entity_ids)) {
        for (const s of row.source_entity_ids) seeds.add(String(s));
      }
    }

    const matchedResolver = resolver.filter(r => seeds.has(r.entity_id) || seeds.has(String(r.record_id)));
    const connectedEdges = typedEdges.filter(e => seeds.has(e.from_id) || seeds.has(e.to_id));

    return {
      schema_version: 'src-query-result/v1',
      query_epoch: queryEpoch,
      result: {
        entity_id,
        entity_index_entries: entityRows,
        resolver_entries: matchedResolver,
        connected_edges: connectedEdges,
        missing_hops: connectedEdges.length === 0 ? ['NO_DOWNSTREAM_WITNESSED_RELATION'] : [],
        semantic_ceiling: 'Witnessed records only; no missing hops invented.',
      },
    };
  }

  return {
    schema_version: 'src-query-result/v1',
    query_epoch: queryEpoch,
    status: 'UNKNOWN_ACTION',
  };
}
