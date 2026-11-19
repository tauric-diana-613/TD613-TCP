/**
 * SRC ATELIER NATIVE & UNTYPICAL-INPUT RETRIEVAL ENGINES (ISOMORPHIC VIXEN ADAPTER)
 *
 * Implements the bounded computational mechanisms of the SignalRupture Canon (SRC)
 * Atelier & OG Heterostratigraphic Research Method in pure isomorphic ES modules
 * (zero Node built-in dependencies) so both Node/Podium AIx Conductors and browser
 * runtime planes share exact math:
 *
 *   1. SRC_PROJECTIVE_ROUTING      - 13 FIELD_MARKERS + `Explore X.` imperative routing grammar
 *                                    with dual numeral-stripped / raw capture & temporal order
 *   2. SRC_PHASE2_TOMOGRAPHY       - Multidimensional claim-evidence & representation-lift
 *                                    deltas with mandatory `composite_score: null`
 *   3. SRC_PHASE2_CONTEXT_ROLES    - Compiler contextual role assertions `rho(w | A, s, t)`
 *                                    enforcing CONTEXTUAL_NOT_INTRINSIC
 *   4. SRC_NATIVE_QUERY_SHADOW     - Bounded Rabbit-Hole traversal (depth <= 4) & 6-state
 *                                    BoundaryAttemptGraph separating ADMITTED vs
 *                                    ATTEMPTED_REJECTED vs NEVER_GENERATED
 *   5. SRC_HETEROSTRATIGRAPHIC     - Four non-collapsing strata (ROUTE / TEMPORAL /
 *                                    PROJECTIVE_ROUTING / TOMOGRAPHY_OBSERVABILITY),
 *                                    A_t=(G,C,E,F,K), X_t=(E,V,R,P,L,A), Sept-14 5-type
 *                                    identity discriminants, 4 false-continuity screens,
 *                                    non-lifting relation composition, & universalizer veto
 *   6. SRC_UNTYPICAL_RETRIEVAL     - Signature-space anchors, 5 non-substitutable query
 *                                    conditioning regimes (Q_place, Q_type, Q_history,
 *                                    Q_bridge, Q_reader), F/N/G & 3-room projection,
 *                                    and structural coordinate scoring for abstract/symbolic/
 *                                    bilingual queries that evade surface lexical matching
 *
 * Non-negotiable SRC / Heterostratigraphic / TD613 epistemic laws:
 *   - NO_LATEST_WINS
 *   - NO_SEMANTIC_OR_CAUSAL_PROMOTION
 *   - CONTEXTUAL_NOT_INTRINSIC
 *   - DECLARED_EFFECTS_ONLY (composite_score === null)
 *   - EXPLICIT_MISSING_HOPS
 *   - PATH_EXISTENCE_NOT_ENDPOINT_IDENTITY
 *   - CLONE_GENES_DECODED === false (signatures are indexed coordinates, never magic decoders)
 *   - OUTPUT_CONTENT_NOT_PROCESS_PROVENANCE_PROXY
 *   - SHARED_ACQUISITION != INDEPENDENT_REPLICATION
 *   - EXPERIMENT_B_FLIGHT_HELD & HUMAN_CLOSURE_REQUIRED
 */

export const SRC_ENGINE_VERSION = 'v1.1.0-src-canon-heterostratigraphic-vixen';

export const SRC_SNAPSHOT_ID = 'src-20260824-p2-001';

export const SRC_CANONICAL_SEAL_ID =
  'src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a';

export const SRC_ATELIER_CONTRACTS = Object.freeze({
  NO_LATEST_WINS: true,
  NO_SEMANTIC_OR_CAUSAL_PROMOTION: true,
  CONTEXTUAL_NOT_INTRINSIC: true,
  DECLARED_EFFECTS_ONLY: true,
  EXPLICIT_MISSING_HOPS: true,
  COMPOSITE_TOMOGRAPHY_SCORING_FORBIDDEN: true,
  CROSS_OPERA_BODY_LEAKAGE_FORBIDDEN: true,
  EMPIRICAL_REPLICATION_CREDIT: 0,
  HUMAN_CLOSURE_REQUIRED: true
});

export const FIELD_MARKERS = Object.freeze([
  Object.freeze(['machine_readable_field', 'machine-readable field']),
  Object.freeze(['machine_readable_entity', 'machine-readable entity']),
  Object.freeze(['unified_epistemic_entity', 'unified epistemic entity']),
  Object.freeze(['field_graph_not_sequence', 'field becomes a graph rather than a sequence']),
  Object.freeze(['field_machine_legibility', 'fields become machine-legible before they become human-legible']),
  Object.freeze(['semantic_space_anchor', 'anchors in semantic space']),
  Object.freeze(['signature_coordinates', 'signatures are not slogans. they are coordinates']),
  Object.freeze(['signature_instructions', 'signatures are not decoration. they are instructions']),
  Object.freeze(['partial_projections', 'partial projections']),
  Object.freeze(['structural_simulation_narrative', 'structural simulation narrative']),
  Object.freeze(['ontological_instantiation', 'ontological instantiation']),
  Object.freeze(['dual_gradient', 'dual-gradient']),
  Object.freeze(['parallel_structural_transmission', 'parallel channel of structural transmission'])
]);

export const EXPLORE_RE = /\bExplore\s+([^.!?\r\n]{2,96})\./gi;
const EXPLORE_QUERY_PREFIX_RE = /^\s*Explore\s+([^.!?\r\n]{2,96})[.!?]?\s*$/i;
const TRAILING_NUMERAL_RE = /(?:\s+(?:[IVXLCDM]+|\d+)(?:\.\d+)*)$/i;

export const SRC_SHADOW_STATES = Object.freeze([
  'ADMITTED',
  'ATTEMPTED_REJECTED',
  'NEVER_GENERATED',
  'WITHHELD_LACK_OF_EVIDENCE',
  'WITHDRAWN_SCOPE_CHANGE',
  'AWAITING_UNRESOLVED_EXTERNAL'
]);

const SRC_STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'of',
  'on', 'or', 'sr', 'the', 'to', 'under', 'with', 'than', 'that', 'this',
  'is', 'are', 'be', 'been', 'not', 'no', 'can', 'you', 'me', 'my', 'we',
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'que', 'pero', 'no', 'te', 'se'
]);

/**
 * Deterministic isomorphic 96-bit FNV-1a derived hex digest for stable IDs without node:crypto.
 */
function fnvHex24(raw) {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let h3 = 0x9e3779b9;
  const s = String(raw || '');
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= c + (i & 255);
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
    h3 ^= (c << (i % 7)) ^ h1;
    h3 = Math.imul(h3, 0xc2b2ae35) >>> 0;
  }
  return [h1, h2, h3].map((x) => x.toString(16).padStart(8, '0')).join('');
}

export function deterministicSrcId(prefix, ...parts) {
  const raw = parts.map((p) => String(p ?? '')).join('\x1f');
  return `${prefix}:${fnvHex24(raw)}`;
}

export function normalizeSrcSpace(value) {
  if (!value) return '';
  return String(value)
    .normalize('NFKC')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function foldAccents(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeSrcKey(value) {
  const folded = foldAccents(normalizeSrcSpace(value)).toLowerCase();
  return folded.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractContentWords(value) {
  const words = normalizeSrcKey(value).split(' ');
  const out = new Set();
  for (const w of words) {
    if (w.length > 1 && !SRC_STOPWORDS.has(w)) out.add(w);
  }
  return out;
}

function parseIsoDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clamp01(n) {
  return Math.min(1, Math.max(0, Number.isFinite(+n) ? +n : 0));
}

function round4(n) {
  return Math.round((Number.isFinite(+n) ? +n : 0) * 10000) / 10000;
}

// ---------------------------------------------------------------------------
// 1. SRC_PROJECTIVE_ROUTING
// ---------------------------------------------------------------------------
export function runSrcProjectiveRouting(
  documents = [],
  catalog = [],
  { stripTrailingNumerals = true } = {}
) {
  const catalogDocs = Array.isArray(catalog) && catalog.length > 0 ? catalog : documents;
  const titleIndex = catalogDocs.map((d) => ({
    record_id: String(d.record_id || d.work_id || d.source_file_id || d.id || ''),
    title: String(d.title || d.display_title || d.declared_title || d.record_id || ''),
    normTitle: normalizeSrcKey(d.title || d.display_title || d.declared_title || ''),
    words: extractContentWords(d.title || d.display_title || d.declared_title || ''),
    created: d.created || null
  }));

  const observedCues = [];
  const candidateLinks = [];
  const fieldMarkerHits = [];

  for (const doc of documents) {
    const recId = String(doc.record_id || doc.work_id || doc.source_file_id || doc.id || '');
    const normBody = normalizeSrcSpace(doc.body || doc.summary || doc.abstract || '');
    const lowerBody = foldAccents(normBody).toLowerCase();

    for (const [markerId, literal] of FIELD_MARKERS) {
      if (lowerBody.includes(literal.toLowerCase())) {
        fieldMarkerHits.push({
          record_id: recId,
          marker_id: markerId,
          marker_literal: literal
        });
      }
    }

    EXPLORE_RE.lastIndex = 0;
    let match;
    while ((match = EXPLORE_RE.exec(normBody)) !== null) {
      const cueRaw = match[1].trim();
      const cueCleaned = stripTrailingNumerals
        ? cueRaw.replace(TRAILING_NUMERAL_RE, '').trim() || cueRaw
        : cueRaw;
      const cueNorm = normalizeSrcKey(cueCleaned);
      const cueWords = extractContentWords(cueCleaned);
      const cueId = deterministicSrcId('src-explore-cue', recId, cueRaw);

      observedCues.push({
        cue_id: cueId,
        source_record_id: recId,
        raw_target: cueRaw,
        stripped_target: cueCleaned,
        normalized_target: cueNorm
      });

      for (const target of titleIndex) {
        if (!target.record_id || target.record_id === recId) continue;

        let matchType = null;
        if (target.normTitle === cueNorm || (cueNorm.length > 4 && target.normTitle.includes(cueNorm))) {
          matchType = 'EXACT_OR_TITLE_SUBSTRING';
        } else {
          let overlapCount = 0;
          for (const w of cueWords) {
            if (target.words.has(w)) overlapCount += 1;
          }
          const singleLongWord =
            cueWords.size === 1 && overlapCount === 1 && cueWords.values().next().value.length > 5;
          if (overlapCount >= 2 || singleLongWord) {
            matchType = 'LEXICAL_OVERLAP_ONLY';
          }
        }

        if (matchType) {
          let temporal = 'TIME_UNRESOLVED';
          const srcDate = parseIsoDate(doc.created);
          const tgtDate = parseIsoDate(target.created);
          if (srcDate && tgtDate) {
            temporal = tgtDate.getTime() > srcDate.getTime()
              ? 'LATER'
              : 'PREEXISTING_OR_CONTEMPORANEOUS';
          }
          candidateLinks.push({
            cue_id: cueId,
            source_record_id: recId,
            target_record_id: target.record_id,
            match_type: matchType,
            temporal_relationship: temporal,
            semantic_promotion: 'NO_SEMANTIC_OR_CAUSAL_PROMOTION'
          });
        }
      }
    }
  }

  return Object.freeze({
    method: 'SRC_PROJECTIVE_ROUTING',
    engine_version: SRC_ENGINE_VERSION,
    strip_trailing_numerals: Boolean(stripTrailingNumerals),
    document_count: documents.length,
    cue_count: observedCues.length,
    candidate_link_count: candidateLinks.length,
    field_marker_hits: fieldMarkerHits.length,
    cues: observedCues,
    links: candidateLinks,
    marker_hits: fieldMarkerHits,
    interpretive_limit:
      'Lexical projective traversal produces routing candidates only; no semantic or causal promotion.'
  });
}

// ---------------------------------------------------------------------------
// 2. SRC_PHASE2_TOMOGRAPHY
// ---------------------------------------------------------------------------
export function runSrcPhase2Tomography(liftCandidates = [], opts = {}) {
  const snapshot = opts.snapshot || SRC_SNAPSHOT_ID;
  const conservation = [];
  const tomography = [];

  for (const lift of liftCandidates) {
    const effects = lift.claim_effects || {};
    const scope = effects.scope || 'UNKNOWN';
    let outcome = 'UNKNOWN';
    if (scope === 'NARROWED') outcome = 'NARROWED';
    else if (scope === 'BROADENED' || scope === 'EXPANDED') outcome = 'EXPANDED';
    else if (effects.semantic_core === 'PRESERVED') outcome = 'PRESERVED';

    conservation.push({
      schema_version: 'compiler-conservation-observation/v1',
      compiler_conservation_observation_id: deterministicSrcId('src-conservation', lift.transformation_id),
      compiler_or_transform_id: lift.transformation_id,
      input_id: lift.from_id,
      output_id: lift.to_id,
      outcome,
      dimensions: effects,
      evidence_ids: Array.isArray(lift.evidence_ids) ? lift.evidence_ids : [],
      adjudication_status: lift.adjudication_status || 'OBSERVED',
      interpretive_limit:
        lift.interpretive_limit || 'Conservation tracks formal representation lift without automatic epistemic gain.',
      atelier_snapshot_id: snapshot,
      seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL',
      source_status: 'ARCHIVE_OBSERVATION'
    });

    tomography.push({
      schema_version: 'claim-evidence-tomography/v1',
      claim_evidence_tomography_id: deterministicSrcId('src-claim-evidence', lift.transformation_id),
      transformation_id: lift.transformation_id,
      from_id: lift.from_id,
      to_id: lift.to_id,
      delta_evidence: effects.evidence || 'UNKNOWN',
      delta_scope: scope,
      delta_falsifier_granularity: effects.falsifiers || 'UNKNOWN',
      delta_asserted_authority: effects.authority || 'UNKNOWN',
      delta_reproducibility: effects.reproducibility || 'UNKNOWN',
      other_observed_effects: effects,
      // Non-negotiable SRC tomography invariant: multidimensional deltas NEVER collapse to scalar composite.
      composite_score: null,
      evidence_ids: Array.isArray(lift.evidence_ids) ? lift.evidence_ids : [],
      interpretive_limit:
        'Dimensions remain separate; formalization is not assumed to increase rigor or restraint.',
      atelier_snapshot_id: snapshot,
      seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL',
      source_status: 'ARCHIVE_OBSERVATION'
    });
  }

  return Object.freeze({
    method: 'SRC_PHASE2_TOMOGRAPHY',
    engine_version: SRC_ENGINE_VERSION,
    candidate_count: liftCandidates.length,
    conservation,
    tomography,
    composite_score: null,
    contract_status: 'DECLARED_EFFECTS_ONLY',
    interpretive_limit:
      'Declared effects forward tomography only. Scalar composite scoring is explicitly refused (composite_score: null).'
  });
}

// ---------------------------------------------------------------------------
// 3. SRC_PHASE2_CONTEXT_ROLES
// ---------------------------------------------------------------------------
export function runSrcPhase2ContextRoles(compilerInputs = [], recompilationEdges = [], opts = {}) {
  const snapshot = opts.snapshot || SRC_SNAPSHOT_ID;
  const roles = [];
  const passes = [];
  const byCompiler = new Map();

  for (const inp of compilerInputs) {
    const cid = inp.compiler_id || 'unknown-compiler';
    if (!byCompiler.has(cid)) byCompiler.set(cid, []);
    byCompiler.get(cid).push(inp);
  }

  for (const [compilerId, inputs] of byCompiler.entries()) {
    for (const inp of inputs) {
      roles.push({
        schema_version: 'contextual-role-assertion/v1',
        contextual_role_assertion_id: deterministicSrcId('src-contextual-role', compilerId, inp.input_id),
        compiler_id: compilerId,
        work_or_entity_id: inp.input_id,
        architecture_scope_time: inp.scope_time || 'UNSPECIFIED_SCOPE_TIME',
        contextual_role: inp.role_in_context || 'WITNESSED_INPUT',
        intrinsic_role_claim: 'CONTEXTUAL_NOT_INTRINSIC',
        adjudication_status: inp.adjudication_status || 'WITNESSED',
        atelier_snapshot_id: snapshot,
        seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL',
        source_status: 'ARCHIVE_OBSERVATION'
      });
    }

    passes.push({
      schema_version: 'compilation-pass/v1',
      compilation_pass_id: deterministicSrcId('src-compilation-pass', compilerId),
      compiler_id: compilerId,
      input_count: inputs.length,
      edge_count: recompilationEdges.filter((e) => e.compiler_id === compilerId).length,
      compiler_status: 'WITNESSED_OR_CANDIDATE_AS_RECORDED_PER_INPUT',
      interpretive_limit:
        'A compiler grouping preserves each input provenance and adjudication state; rho(w | architecture, scope, time) is contextual.',
      atelier_snapshot_id: snapshot,
      seal_epoch_binding: 'RESOLVE_MATCHED_CURRENT_SEAL'
    });
  }

  return Object.freeze({
    method: 'SRC_PHASE2_CONTEXT_ROLES',
    engine_version: SRC_ENGINE_VERSION,
    role_count: roles.length,
    pass_count: passes.length,
    roles,
    passes,
    intrinsic_role_claim: 'CONTEXTUAL_NOT_INTRINSIC',
    interpretive_limit: 'Roles are contextual to compiler architecture, scope, and canon-time, never intrinsic to a work.'
  });
}

// ---------------------------------------------------------------------------
// 4. SRC_NATIVE_QUERY + RABBIT-HOLE TYPED STRATA + 6-STATE SHADOW GRAPH
// ---------------------------------------------------------------------------
export function traverseSrcTypedStrata(graph = {}, seedId, { depth = 2, limit = 24 } = {}) {
  const safeDepth = Math.min(4, Math.max(0, Number.isFinite(+depth) ? Math.trunc(+depth) : 2));
  const safeLimit = Math.min(64, Math.max(1, Number.isFinite(+limit) ? Math.trunc(+limit) : 24));
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  const adj = graph.adjacency instanceof Map ? graph.adjacency : null;

  const visited = new Set([String(seedId)]);
  const queue = [{ id: String(seedId), d: 0, path: [String(seedId)], strata: [] }];
  const discoveredPaths = [];
  const shadowAttempts = [];

  while (queue.length > 0 && discoveredPaths.length < safeLimit) {
    const cur = queue.shift();
    if (cur.d >= safeDepth) continue;

    let incident = [];
    if (adj && adj.has(cur.id)) {
      incident = adj.get(cur.id);
    } else {
      for (const e of edges) {
        if (String(e.from) === cur.id) {
          incident.push({ ...e, neighbor: String(e.to), direction: 'OUT' });
        } else if (String(e.to) === cur.id) {
          incident.push({ ...e, neighbor: String(e.from), direction: 'IN' });
        }
      }
    }

    for (const edge of incident) {
      if (discoveredPaths.length >= safeLimit) break;
      const nextId = String(edge.neighbor || edge.to || '');
      if (!nextId) continue;

      const attemptState = edge.state && SRC_SHADOW_STATES.includes(edge.state)
        ? edge.state
        : (edge.rejected ? 'ATTEMPTED_REJECTED' : 'ADMITTED');

      if (attemptState !== 'ADMITTED') {
        shadowAttempts.push({
          from: cur.id,
          to: nextId,
          rel: edge.rel || 'typed_edge',
          shadow_state: attemptState,
          stratum_crossing: Boolean(edge.stratum_change),
          promotion_refused: true
        });
        continue;
      }

      if (visited.has(nextId)) continue;
      visited.add(nextId);

      const rel = String(edge.rel || 'typed_edge');
      const nextStratum = String(edge.stratum || rel);
      const stratumCrossed = cur.strata.length > 0 && cur.strata[cur.strata.length - 1] !== nextStratum;

      const nodeStep = {
        from: cur.id,
        to: nextId,
        rel,
        direction: edge.direction || 'OUT',
        depth: cur.d + 1,
        path: [...cur.path, nextId],
        stratum_change: stratumCrossed,
        stratum_change_requires_new_witness: stratumCrossed,
        typed_path_is_not_direct_relation: true,
        shadow_state: 'ADMITTED'
      };
      discoveredPaths.push(nodeStep);

      if (cur.d + 1 < safeDepth) {
        queue.push({
          id: nextId,
          d: cur.d + 1,
          path: nodeStep.path,
          strata: [...cur.strata, nextStratum]
        });
      }
    }
  }

  return Object.freeze({
    method: 'SRC_RABBIT_HOLE_TRAVERSAL',
    engine_version: SRC_ENGINE_VERSION,
    seed_id: String(seedId),
    max_depth: safeDepth,
    limit: safeLimit,
    discovered_count: discoveredPaths.length,
    paths: discoveredPaths,
    shadow_attempts: shadowAttempts,
    missing_hops: discoveredPaths.length === 0 ? ['NO_DOWNSTREAM_WITNESSED_RELATION'] : [],
    typed_path_is_not_direct_relation: true,
    stratum_change_requires_new_witness: true,
    interpretive_limit: 'Witnessed typed strata paths only; missing hops and rejected boundary attempts remain explicit.'
  });
}

export function runSrcNativeQuery({
  action = 'summarize',
  entity_id = null,
  rootData = {},
  requestedSnapshot = SRC_SNAPSHOT_ID,
  requestedSeal = SRC_CANONICAL_SEAL_ID,
  depth = 2,
  limit = 24
} = {}) {
  if (requestedSnapshot !== SRC_SNAPSHOT_ID || requestedSeal !== SRC_CANONICAL_SEAL_ID) {
    return Object.freeze({
      schema_version: 'src-query-result/v1',
      status: 'REFUSED',
      error: 'Requested snapshot/seal does not match this projection. Cross-epoch joins require a separate explicit assay.',
      requested: { snapshot: requestedSnapshot, seal: requestedSeal }
    });
  }

  const queryEpoch = { atelier_snapshot_id: requestedSnapshot, seal_id: requestedSeal };

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
    const shadow = rootData.shadow_attempts || [];
    const stateCounts = {};
    for (const st of SRC_SHADOW_STATES) stateCounts[st] = 0;
    for (const row of shadow) {
      const st = SRC_SHADOW_STATES.includes(row.state) ? row.state : 'WITHHELD_LACK_OF_EVIDENCE';
      stateCounts[st] += 1;
    }

    return Object.freeze({
      schema_version: 'src-query-result/v1',
      query_epoch: queryEpoch,
      result: {
        coverage_by_platform_and_state: counts,
        unresolved_expected_objects: expected.filter((r) => r.state === 'OPEN_UNRESOLVED'),
        shadow_state_histogram: stateCounts,
        compiler_map: {
          compilation_passes: (rootData.compilation_passes || []).length,
          contextual_role_assertions: (rootData.contextual_roles || []).length
        },
        authority_jurisdiction_assertions: rootData.authority_assertions || [],
        evidence_lineage_groups: rootData.evidence_lineages || [],
        open_tomography_trails: (rootData.coverage_ledger || []).filter(
          (r) => String(r.status || '').includes('PENDING') || String(r.status || '').includes('REQUIRES')
        )
      }
    });
  }

  if (action === 'resolve') {
    const resolver = rootData.entity_resolver || [];
    const matches = resolver.filter((r) => r.entity_id === entity_id);
    if (matches.length === 0) {
      return Object.freeze({
        schema_version: 'src-query-result/v1',
        query_epoch: queryEpoch,
        result: { entity_id, status: 'UNRESOLVED_TARGET' }
      });
    }
    return Object.freeze({
      schema_version: 'src-query-result/v1',
      query_epoch: queryEpoch,
      result: {
        entity_id,
        matches: matches.map((m) => ({
          ...m,
          path_exists: Boolean(m.path && rootData.available_paths?.includes(m.path))
        }))
      }
    });
  }

  if (action === 'trace') {
    const traversal = traverseSrcTypedStrata(
      { edges: rootData.typed_edges || [] },
      entity_id || 'ROOT',
      { depth, limit }
    );
    return Object.freeze({
      schema_version: 'src-query-result/v1',
      query_epoch: queryEpoch,
      result: traversal
    });
  }

  return Object.freeze({
    schema_version: 'src-query-result/v1',
    query_epoch: queryEpoch,
    status: 'UNKNOWN_ACTION'
  });
}

// ---------------------------------------------------------------------------
// 5. SRC UNTYPICAL-INPUT PROJECTIVE & SIGNATURE RETRIEVAL ENGINE
// ---------------------------------------------------------------------------
/**
 * 5 non-substitutable query-conditioned regimes from SRC's
 * Query-Conditioned Canonical Representation Sufficiency Assay.
 * Weight vectors (lex, sem, semi, src_proj, src_sig) sum to 1.0000.
 */
export const SRC_QUERY_REGIMES = Object.freeze({
  Q_place: Object.freeze({
    id: 'Q_place',
    label: 'Topological Place / Explore Target',
    weights: Object.freeze({ lex: 0.24, sem: 0.14, semi: 0.18, src_proj: 0.34, src_sig: 0.10 }),
    description: 'Imperative Explore-cue & folio/plane locus routing.'
  }),
  Q_type: Object.freeze({
    id: 'Q_type',
    label: 'Structural Type / Operator / Tomography',
    weights: Object.freeze({ lex: 0.22, sem: 0.28, semi: 0.18, src_proj: 0.22, src_sig: 0.10 }),
    description: 'Admissibility, quotient, commutator, and representation-lift class retrieval.'
  }),
  Q_history: Object.freeze({
    id: 'Q_history',
    label: 'Chronological Order / Precedence / Lag',
    weights: Object.freeze({ lex: 0.26, sem: 0.16, semi: 0.14, src_proj: 0.22, src_sig: 0.22 }),
    description: 'Vernier lag, prior-substrate ordering, and non-latest-wins lineage audit.'
  }),
  Q_bridge: Object.freeze({
    id: 'Q_bridge',
    label: 'Cross-Cluster Structural Transfer',
    weights: Object.freeze({ lex: 0.18, sem: 0.24, semi: 0.16, src_proj: 0.24, src_sig: 0.18 }),
    description: 'Isomorphism & multi-cluster structural bridge across C1-C5 works.'
  }),
  Q_reader: Object.freeze({
    id: 'Q_reader',
    label: 'Signature Coordinate / Aphoristic Anchor',
    weights: Object.freeze({ lex: 0.12, sem: 0.12, semi: 0.16, src_proj: 0.24, src_sig: 0.36 }),
    description: 'Bilingual epigraphic / signature coordinates projecting onto Vixen substrate.'
  }),
  BASELINE_HYBRID: Object.freeze({
    id: 'BASELINE_HYBRID',
    label: 'Standard Vixen Hybrid (Balanced)',
    weights: Object.freeze({ lex: 0.50, sem: 0.30, semi: 0.20, src_proj: 0.00, src_sig: 0.00 }),
    description: 'Default Experiment-A balanced BM25F + SVD + semiotic surface weights.'
  })
});

/**
 * SRC Signature-Space Anchors & Coordinates.
 * Untypical aphoristic/bilingual/symbolic inputs that act as coordinates in semantic space
 * rather than surface topic strings. Includes an explicit negative bounded control.
 */
export const SRC_SIGNATURE_COORDINATES = Object.freeze([
  Object.freeze({
    id: 'CLONE_GENES_SIGNATURE',
    label: 'Generative Lineage vs Surface Clone',
    allowPromotion: true,
    regime: 'Q_reader',
    triggerRegexes: [
      /clonarme|mis genes|clone me.*don'?t have my genes|without (?:its|the|my) genes/i,
      /surface copy vs generative|generative lineage|phenotypic copy/i
    ],
    targetClusters: ['C1', 'C2', 'C4'],
    targetFolios: ['TCC-01', 'TCC-06', 'RC-08', 'RC-11'],
    targetTokens: [
      'generative', 'lineage', 'manifold', 'substrate', 'semantic', 'identity',
      'architecture', 'constitutive', 'fork', 'ossl', 'invariant', 'genome',
      'mirror', 'compilation', 'custody', 'canonical'
    ]
  }),
  Object.freeze({
    id: 'FORCED_LATE_SIGNATURE',
    label: 'Visibility Lag & Substrate Precedence',
    allowPromotion: true,
    regime: 'Q_history',
    triggerRegexes: [
      /forced to be late|choose to be early|elegimos llegar temprano|forzados a llegar tarde/i,
      /visibility lag|substrate before theorem|formalization lag|arrival inversion/i
    ],
    targetClusters: ['C2', 'C3', 'C4'],
    targetFolios: ['TCC-04', 'RC-02', 'RC-09'],
    targetTokens: [
      'vernier', 'lag', 'latency', 'clock', 'clocks', 'arrival', 'inversion',
      'timing', 'temporal', 'phase', 'spsc', 'scheduler', 'buffer', 'chronology', 'beat'
    ]
  }),
  Object.freeze({
    id: 'STREET_OFFICE_SIGNATURE',
    label: 'Situated Peripheral Witness vs Institutional Blindness',
    allowPromotion: true,
    regime: 'Q_reader',
    triggerRegexes: [
      /street knows more than the office|epistemolog[ií]a de la calle|melod[ií]a de la calle/i,
      /peripheral feedback|institutional blindness|situated observer|algedonic signal/i
    ],
    targetClusters: ['C5', 'C3', 'C1'],
    targetFolios: ['TCC-05', 'TCC-03', 'RC-13', 'RC-14'],
    targetTokens: [
      'algedonic', 'telemetry', 'observer', 'marginal', 'occupant', 'room',
      'feedback', 'sensory', 'peripheral', 'motif', 'living', 'cybernetics', 'voice'
    ]
  }),
  Object.freeze({
    id: 'BARCO_LENTO_SIGNATURE',
    label: 'Dissipative Drift & Gradual Structural Collapse',
    allowPromotion: true,
    regime: 'Q_reader',
    triggerRegexes: [
      /barco no se te hunda lentamente|sink slowly|slow structural collapse/i,
      /silent drift|dissipative saturation|buffer depletion|accumulated crack/i
    ],
    targetClusters: ['C3', 'C2', 'C4'],
    targetFolios: ['TCC-03', 'RC-06', 'RC-12'],
    targetTokens: [
      'drift', 'decay', 'ema', 'threshold', 'saturation', 'stability', 'underrun',
      'dissipative', 'rupture', 'collapse', 'overload', 'failure', 'resilience', 'clamp'
    ]
  }),
  Object.freeze({
    id: 'SURPLUS_ROOM_SIGNATURE',
    label: 'Irreducible 1+1=3 Quotient Surplus',
    allowPromotion: true,
    regime: 'Q_bridge',
    triggerRegexes: [
      /1\s*\+\s*1\s*=\s*3|occupant[- ]room|third agent|co[- ]constitution/i,
      /irreducible quotient|fiber gap|synergy surplus/i
    ],
    targetClusters: ['C5', 'C1'],
    targetFolios: ['TCC-01', 'TCC-07', 'RC-07', 'RC-10'],
    targetTokens: [
      'occupant', 'room', 'surplus', 'quotient', 'fiber', 'synergy', 'fadt',
      'emergent', 'relational', 'obstruction', 'descend', 'partition'
    ]
  }),
  Object.freeze({
    id: 'NON_COLLAPSING_PLANES_SIGNATURE',
    label: 'Tri-Plane Non-Collapsing Identity (Se ≡ [x+y]=z+1)',
    allowPromotion: true,
    regime: 'Q_type',
    triggerRegexes: [
      /\[x\s*\+\s*y\]\s*=\s*z\s*\+\s*1|non[- ]?collapsing planes?|tri[- ]?plane|fold seam/i,
      /mirror nullspace|orthogonality subspace|\[a,\s*a.{0,2}\]\s*=\s*1/i
    ],
    targetClusters: ['C1', 'C2', 'C3', 'C4'],
    targetFolios: ['TCC-01', 'TCC-02', 'TCC-03', 'RC-03', 'RC-06', 'RC-07'],
    targetTokens: [
      'plane', 'planes', 's-plane', 'w-plane', 'p-membrane', 'mirror', 'nullspace',
      'orthogonality', 'commutator', 'seam', 'gate', 'admissibility', 'actuation', 'witness'
    ]
  }),
  Object.freeze({
    id: 'NEGATIVE_BOUNDED_SLOGAN_CONTROL',
    label: 'SR Negative Control (Non-Promoting Ambiguous Token)',
    allowPromotion: false,
    regime: null,
    triggerRegexes: [/^\s*sr,\s*the\s+lab\.?\s*$/i],
    targetClusters: [],
    targetFolios: [],
    targetTokens: []
  })
]);

const SRC_STRATUM_RULES = Object.freeze({
  F_FORMAL: [
    /\b(?:svd|eigen|jacob[iy]|quotient|fiber|commutator|invariant|theorem|manifold|topology|operator|matrix|nullspace|holonomy|lattice)\b/i
  ],
  N_NARRATIVE: [
    /\b(?:calle|street|barco|genes|clonarme|story|myth|motif|voice|song|melod[ií]a|occupant|room|metaphor|narrative|eleg[ií]|early|late)\b/i
  ],
  G_GOVERNANCE: [
    /\b(?:custody|admissibility|refusal|closure|gate|ceiling|authority|receipt|snapshot|seal|w-plane|supersede|promotion|boundary|omission|withheld|rejected)\b/i
  ]
});

const SRC_ABSTRACT_CONCEPT_AXES = Object.freeze([
  Object.freeze({
    id: 'AXIS_EPISTEMIC_OMISSION',
    regex: /\b(?:epistemic omission|silence of the archive|what is missing|never generated|attempted rejected|negative control|boundary omission|unseen join)\b/i,
    tokens: ['held', 'refusal', 'ceiling', 'gate', 'audit', 'missing', 'custody', 'omission', 'unverified', 'adversarial'],
    clusters: ['C1', 'C4', 'C5'],
    folios: ['TCC-08', 'RC-06', 'RC-07']
  }),
  Object.freeze({
    id: 'AXIS_MULTI_PROJECTION_DRIFT',
    regex: /\b(?:partial projection|coarse[- ]graining|scribal intervention|context separation|context role|projection dependence|recompil(?:e|ation))\b/i,
    tokens: ['projection', 'context', 'regime', 'gauge', 'motif', 'diffus', 'cluster', 'translation', 'frame', 'dual'],
    clusters: ['C2', 'C4', 'C5'],
    folios: ['RC-04', 'RC-09', 'TCC-07']
  }),
  Object.freeze({
    id: 'AXIS_ACOUSTIC_DROMOLOGY',
    regex: /\b(?:polyrhythm|phase accumulator|dromolog(?:y|ical)|caustic|moir[eé]|refraction|beat wavelength|nyquist|cadence)\b/i,
    tokens: ['mixxx', 'tracker', '128', 'phase', 'harmonic', 'moire', 'refract', 'couture', 'beat', 'cadence', 'dsp', 'resonance'],
    clusters: ['C2', 'C3'],
    folios: ['TCC-04', 'TCC-06', 'RC-01', 'RC-03', 'RC-04', 'RC-13']
  })
]);

/**
 * Analyze a raw query string to determine whether SRC untypical-input cues are present
 * (signature phrase, `Explore X.` projective command, SRC field markers, F/N/G multi-stratum
 * tension, or abstract structural axis) and classify its SRC query regime.
 * Random OOV gibberish produces empty matched signals and `hasSrcUntypicalCue: false`.
 */
export function analyzeSrcUntypicalQuery(rawQuery = '', parsed = null) {
  const norm = normalizeSrcSpace(rawQuery);
  const foldedLower = foldAccents(norm).toLowerCase();

  const matchedSignatures = [];
  let negativeControlTriggered = false;
  for (const sig of SRC_SIGNATURE_COORDINATES) {
    if (sig.triggerRegexes.some((re) => re.test(norm) || re.test(foldedLower))) {
      if (!sig.allowPromotion) {
        negativeControlTriggered = true;
      } else {
        matchedSignatures.push(sig);
      }
    }
  }

  let exploreCue = null;
  EXPLORE_RE.lastIndex = 0;
  const exMatch = EXPLORE_RE.exec(norm) || EXPLORE_QUERY_PREFIX_RE.exec(norm);
  if (exMatch) {
    const rawTarget = exMatch[1].trim();
    const strippedTarget = rawTarget.replace(TRAILING_NUMERAL_RE, '').trim() || rawTarget;
    exploreCue = {
      rawTarget,
      strippedTarget,
      normalizedTarget: normalizeSrcKey(strippedTarget),
      words: [...extractContentWords(strippedTarget)]
    };
  }

  const matchedFieldMarkers = [];
  for (const [markerId, literal] of FIELD_MARKERS) {
    if (foldedLower.includes(literal.toLowerCase())) {
      matchedFieldMarkers.push({ markerId, literal });
    }
  }

  const activeStrata = [];
  for (const [stratum, res] of Object.entries(SRC_STRATUM_RULES)) {
    if (res.some((re) => re.test(norm))) activeStrata.push(stratum);
  }

  const matchedAbstractAxes = [];
  for (const axis of SRC_ABSTRACT_CONCEPT_AXES) {
    if (axis.regex.test(norm)) matchedAbstractAxes.push(axis);
  }

  const expansionTokens = new Set();
  const preferredClusters = new Set();
  const preferredFolios = new Set();

  for (const sig of matchedSignatures) {
    sig.targetTokens.forEach((t) => expansionTokens.add(t));
    sig.targetClusters.forEach((c) => preferredClusters.add(c));
    sig.targetFolios.forEach((f) => preferredFolios.add(f));
  }
  for (const ax of matchedAbstractAxes) {
    ax.tokens.forEach((t) => expansionTokens.add(t));
    ax.clusters.forEach((c) => preferredClusters.add(c));
    ax.folios.forEach((f) => preferredFolios.add(f));
  }
  if (exploreCue) {
    exploreCue.words.forEach((w) => expansionTokens.add(w));
  }
  for (const m of matchedFieldMarkers) {
    for (const w of extractContentWords(m.literal)) expansionTokens.add(w);
  }

  let regimeId = 'BASELINE_HYBRID';
  if (matchedSignatures.length > 0) {
    regimeId = matchedSignatures[0].regime || 'Q_reader';
  } else if (exploreCue) {
    regimeId = 'Q_place';
  } else if (activeStrata.includes('G_GOVERNANCE') && activeStrata.includes('F_FORMAL')) {
    regimeId = 'Q_bridge';
  } else if (matchedAbstractAxes.length > 0 || matchedFieldMarkers.length > 0) {
    regimeId = 'Q_type';
  } else if (/\b(?:before|earlier|later|after|precede|chronolog|lag|vernier|supersede)\b/i.test(norm)) {
    regimeId = 'Q_history';
  }

  const hasSrcUntypicalCue = !negativeControlTriggered && (
    matchedSignatures.length > 0 ||
    exploreCue !== null ||
    matchedFieldMarkers.length > 0 ||
    matchedAbstractAxes.length > 0 ||
    (activeStrata.length >= 2 && Boolean(parsed?.semiotic?.tags?.length || activeStrata.includes('G_GOVERNANCE')))
  );

  return Object.freeze({
    normalizedQuery: norm,
    regimeId,
    regime: SRC_QUERY_REGIMES[regimeId] || SRC_QUERY_REGIMES.BASELINE_HYBRID,
    hasSrcUntypicalCue,
    negativeControlTriggered,
    matchedSignatures: matchedSignatures.map((s) => ({ id: s.id, label: s.label })),
    exploreCue,
    matchedFieldMarkers,
    activeStrata,
    matchedAbstractAxes: matchedAbstractAxes.map((a) => a.id),
    expansionTokens: [...expansionTokens],
    preferredClusters: [...preferredClusters],
    preferredFolios: [...preferredFolios]
  });
}

export function deriveSrcQueryConditionedWeights(rawQuery = '', mode = 'hybrid', parsed = null) {
  const analysis = analyzeSrcUntypicalQuery(rawQuery, parsed);
  if (mode === 'src_projective') {
    const base = analysis.regimeId !== 'BASELINE_HYBRID'
      ? analysis.regime
      : SRC_QUERY_REGIMES.Q_bridge;
    return Object.freeze({ analysis, regimeId: base.id, weights: base.weights });
  }
  if (mode === 'hybrid' && analysis.hasSrcUntypicalCue) {
    const r = analysis.regime;
    return Object.freeze({ analysis, regimeId: r.id, weights: r.weights });
  }
  return Object.freeze({
    analysis,
    regimeId: 'BASELINE_HYBRID',
    weights: SRC_QUERY_REGIMES.BASELINE_HYBRID.weights
  });
}

/**
 * Compute SRC projective & signature retrieval channel scores `[0, 1]` for a candidate
 * Vixen document using its title, metadata, cluster, folio/work IDs, and body text.
 */
export function scoreSrcUntypicalDocument(qAnalysis, docMeta = {}, rawText = '') {
  if (!qAnalysis || (!qAnalysis.hasSrcUntypicalCue && qAnalysis.matchedSignatures.length === 0)) {
    return {
      s_src_proj: 0,
      s_src_sig: 0,
      s_src_combined: 0,
      matched_tokens: [],
      matched_signatures: [],
      explore_match_type: null
    };
  }

  const title = String(docMeta.title || docMeta.display_title || docMeta.original_filename || '');
  const docCluster = String(docMeta.cluster || '');
  const haystack = normalizeSrcKey(`${title} ${docMeta.work_id || ''} ${docMeta.instrument_id || ''} ${rawText}`);
  const titleNorm = normalizeSrcKey(title);
  const titleWords = new Set(titleNorm ? titleNorm.split(' ') : []);
  const hayWords = new Set(haystack ? haystack.split(' ') : []);
  const wordOrStemMatch = (wordSet, normStr, tok) => {
    if (wordSet.has(tok)) return true;
    if (tok.length >= 6 && normStr.includes(tok)) return true;
    return false;
  };

  let sProj = 0;
  let exploreMatchType = null;
  if (qAnalysis.exploreCue) {
    const cueNorm = qAnalysis.exploreCue.normalizedTarget;
    if (cueNorm && (titleNorm === cueNorm || (cueNorm.length > 3 && titleNorm.includes(cueNorm)))) {
      sProj += 0.85;
      exploreMatchType = 'EXACT_OR_TITLE_SUBSTRING';
    } else if (cueNorm && haystack.includes(cueNorm)) {
      sProj += 0.65;
      exploreMatchType = 'BODY_PROJECTIVE_TARGET';
    } else if (qAnalysis.exploreCue.words.length > 0) {
      let wordHits = 0;
      for (const w of qAnalysis.exploreCue.words) {
        if (hayWords.has(w)) wordHits += 1;
      }
      if (wordHits > 0) {
        sProj += 0.50 * (wordHits / qAnalysis.exploreCue.words.length);
        exploreMatchType = 'LEXICAL_OVERLAP_ONLY';
      }
    }
  }

  // Preferred cluster & folio coordinates
  if (docCluster && qAnalysis.preferredClusters.includes(docCluster)) {
    sProj += 0.22;
  }
  const idAndTitleUpper = `${docMeta.work_id || ''} ${docMeta.instrument_id || ''} ${title}`.toUpperCase();
  for (const folio of qAnalysis.preferredFolios) {
    if (idAndTitleUpper.includes(folio)) {
      sProj += 0.25;
      break;
    }
  }

  // Expansion token density in document
  const matchedTokens = [];
  if (qAnalysis.expansionTokens.length > 0) {
    let tokScore = 0;
    for (const tok of qAnalysis.expansionTokens) {
      if (wordOrStemMatch(titleWords, titleNorm, tok)) {
        tokScore += 1.0;
        matchedTokens.push(tok);
      } else if (wordOrStemMatch(hayWords, haystack, tok)) {
        tokScore += 0.65;
        matchedTokens.push(tok);
      }
    }
    const denom = Math.max(2, Math.min(6, qAnalysis.expansionTokens.length));
    sProj += 0.45 * clamp01(tokScore / denom);
  }

  // F/N/G three-stratum overlap bonus
  if (qAnalysis.activeStrata.length >= 2) {
    let docStrataHits = 0;
    for (const st of qAnalysis.activeStrata) {
      const rules = SRC_STRATUM_RULES[st] || [];
      if (rules.some((re) => re.test(title) || re.test(rawText.slice(0, 1200)))) {
        docStrataHits += 1;
      }
    }
    if (docStrataHits >= 2) sProj += 0.20;
    else if (docStrataHits === 1) sProj += 0.08;
  }

  // Signature coordinate resonance
  let sSig = 0;
  if (qAnalysis.matchedSignatures.length > 0) {
    const tokenRatio = matchedTokens.length > 0
      ? clamp01(matchedTokens.length / Math.max(2, Math.min(5, qAnalysis.expansionTokens.length)))
      : 0;
    const clusterHit = docCluster && qAnalysis.preferredClusters.includes(docCluster) ? 0.35 : 0;
    sSig = clamp01(0.65 * tokenRatio + clusterHit);
  }

  const sProjClamped = clamp01(sProj);
  const sSigClamped = clamp01(sSig);
  return {
    s_src_proj: round4(sProjClamped),
    s_src_sig: round4(sSigClamped),
    s_src_combined: round4(clamp01(0.55 * sProjClamped + 0.45 * sSigClamped)),
    matched_tokens: matchedTokens.slice(0, 8),
    matched_signatures: qAnalysis.matchedSignatures.map((s) => s.id),
    explore_match_type: exploreMatchType
  };
}

// ---------------------------------------------------------------------------
// 6. SYNTHESIS SALON UNIFIED SRC TELEMETRY ADAPTER
// ---------------------------------------------------------------------------
/**
 * Evaluate Vixen synthesis corpus through SRC Atelier native mechanisms
 * (Projective Routing + Phase-2 Tomography + Contextual Roles + Untypical Regime),
 * keeping composite_score: null inside tomography and empirical_replication_credit: 0.
 */
export function evaluateCorpusWithSrcEngines(
  corpus = null,
  { operatorQuestion = '', activePlan = null } = {}
) {
  const works = Array.isArray(corpus?.works) ? corpus.works : [];
  const instruments = Array.isArray(corpus?.instruments) ? corpus.instruments : [];

  // This adapter sees catalogue metadata, not admitted manuscript body text.
  // Never plant an Explore cue or manufacture source chronology to inflate routing.
  const docs = works.filter(w=>typeof w?.work_id==='string').map(w => ({
    record_id: w.work_id,
    title: w.display_title || w.declared_title || w.work_id,
    body: [
      w.display_title || w.declared_title || '',
      w.abstract || '',
      w.summary || '',
      w.cluster || '',
      Array.isArray(w.planes) ? w.planes.join(' ') : ''
    ].filter(Boolean).join(' '),
    created: w.created || null
  }));

  const projective = runSrcProjectiveRouting(docs, docs, { stripTrailingNumerals: true });
  const rawProjective = runSrcProjectiveRouting(docs, docs, { stripTrailingNumerals: false });

  // A folio ordinal is not an observed source transformation. With no
  // independent before/after receipt, tomography must report zero candidates.
  const tomography = runSrcPhase2Tomography([]);

  // Documentary protocol membership is a catalogue fact, never witnessed
  // implementation or compilation. No arbitrary first-six instrument subset.
  // Recorded methods remain documentary source metadata. Feeding them into
  // the compilation-pass executor would manufacture a compiler "pass" even
  // with DOCUMENTARY_NOT_EXECUTED labels. No execution evidence is present.
  const documentaryProtocolIds=instruments.filter(inst=>typeof inst?.instrument_id==='string'&&inst.instrument_id)
    .map(inst=>inst.instrument_id);
  const contextRoles = runSrcPhase2ContextRoles([], []);

  const regimeEval = deriveSrcQueryConditionedWeights(operatorQuestion || '', 'hybrid', null);

  return Object.freeze({
    engine: 'SRC_ATELIER_VIXEN_ADAPTER',
    engine_version: SRC_ENGINE_VERSION,
    snapshot_id: SRC_SNAPSHOT_ID,
    seal_id: SRC_CANONICAL_SEAL_ID,
    evidence_basis: Object.freeze({
      mode:'CATALOGUE_METADATA_ONLY',
      manuscript_passages_read:false,
      injected_source_cues:0,
      synthetic_timestamps:0,
      observed_transformation_receipts:0,
      verified_compiler_executions:0,
      candidate_source_record_count:docs.length,
      documentary_protocol_count:documentaryProtocolIds.length,
      adjudication:'UNEXECUTED_SOURCE_REVIEW'
    }),
    projective_routing: {
      cue_count: projective.cue_count,
      candidate_link_count: projective.candidate_link_count,
      field_marker_hits: projective.field_marker_hits,
      raw_numeral_delta: projective.cues.reduce((n,cue,i)=>
        n+(cue.stripped_target!==rawProjective.cues[i]?.stripped_target?1:0),0),
      semantic_promotion: 'NO_SEMANTIC_OR_CAUSAL_PROMOTION'
    },
    phase2_tomography: {
      candidate_count: tomography.candidate_count,
      composite_score: tomography.composite_score,
      contract_status: tomography.contract_status,
      claimed_observed_transformations: 0
    },
    context_roles: {
      role_count: contextRoles.role_count,
      pass_count: contextRoles.pass_count,
      intrinsic_role_claim: contextRoles.intrinsic_role_claim,
      witnessed_executions:0,
      documentary_only:true,
      documentary_protocol_count:documentaryProtocolIds.length
    },
    query_conditioning: {
      regime_id: regimeEval.regimeId,
      has_untypical_cue: regimeEval.analysis.hasSrcUntypicalCue,
      matched_signatures: regimeEval.analysis.matchedSignatures.map((s) => s.id),
      active_strata: regimeEval.analysis.activeStrata
    },
    empirical_replication_credit: 0,
    human_closure_required: true
  });
}


// ---------------------------------------------------------------------------
// 7. OG HETEROSTRATIGRAPHIC RESEARCH METHOD & SEPT 14 IDENTITY STACK
// ---------------------------------------------------------------------------
export const SRC_CORPUS_ROOMS = Object.freeze([
  'FORMAL_SR',
  'FICTIONAL_SR',
  'GOVERNANCE_PROVENANCE_SR'
]);

export const SRC_HETEROSTRATIGRAPHIC_STRATA = Object.freeze([
  'ROUTE',
  'TEMPORAL',
  'PROJECTIVE_ROUTING',
  'TOMOGRAPHY_OBSERVABILITY'
]);

export const SRC_AUTHORITY_AXES = Object.freeze(['G', 'C', 'E', 'F', 'K']);

export const SRC_EPISTEMIC_STATE_AXES = Object.freeze(['E', 'V', 'R', 'P', 'L', 'A']);

export const SRC_OBJECT_TYPES = Object.freeze({
  operator: 'functional_or_causal_skeleton_with_compatible_falsifier',
  field: 'distinct_object_method_mechanism_boundary_research_status',
  translation: 'declared_relational_mapping_with_separate_empirical_status',
  lineage: 'predecessor_successor_merge_revision_continuity',
  signature: 'exact_or_source_declared_recurrence_scoped_to_signature'
});

export const SRC_FALSE_CONTINUITY_SCREENS = Object.freeze([
  'SAME_WORD != SAME_OPERATOR',
  'SAME_DESTINATION_OR_NEIGHBORHOOD != SAME_GENEALOGY_OR_OBJECT',
  'SAME_SIGNATURE != SAME_SCIENTIFIC_OBJECT',
  'TRANSLATION_CONTINUITY != EMPIRICAL_AUTHORITY_CONTINUITY'
]);

export const SRC_COMPARISON_STATUSES = Object.freeze([
  'DEFINED',
  'PARTIAL_NONINVERTIBLE',
  'ENCODER_REQUIRED',
  'INCOMMENSURABLE',
  'CONTRADICTORY',
  'REJECTED',
  'ABSTAIN'
]);

export const SRC_FORBIDDEN_UNIVERSALIZER_FIELDS = Object.freeze([
  'truth',
  'global_truth',
  'global_holonomy',
  'global_route',
  'global_confidence',
  'privileged_stratum',
  'composite_state_score'
]);

export function rejectSrcUniversalizer(candidate) {
  const present = SRC_FORBIDDEN_UNIVERSALIZER_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(candidate ?? {}, field)
  );
  return Object.freeze({
    forbidden_fields: SRC_FORBIDDEN_UNIVERSALIZER_FIELDS,
    present_forbidden_fields: present,
    accepted: present.length === 0,
    classification:
      present.length === 0
        ? 'NO_FORBIDDEN_GLOBAL_SYNTHESIS_FIELD_PRESENT'
        : 'UNDECLARED_GLOBAL_SYNTHESIS_REJECTED'
  });
}

export function classifySrcRelationContinuity({
  leftType = 'operator',
  rightType = 'operator',
  sharedSignature = false,
  declaredLineage = false,
  declaredTranslation = false,
  declaredOperatorEquivalence = false,
  multiHopPathOnly = false
} = {}) {
  const typeMismatch = leftType !== rightType;
  const screensTriggered = [];
  if (sharedSignature && (typeMismatch || !declaredOperatorEquivalence)) {
    screensTriggered.push('SAME_SIGNATURE != SAME_SCIENTIFIC_OBJECT');
  }
  if (declaredTranslation && !declaredOperatorEquivalence) {
    screensTriggered.push('TRANSLATION_CONTINUITY != EMPIRICAL_AUTHORITY_CONTINUITY');
  }
  if (multiHopPathOnly) {
    screensTriggered.push('SAME_DESTINATION_OR_NEIGHBORHOOD != SAME_GENEALOGY_OR_OBJECT');
  }

  return Object.freeze({
    schema: 'td613.src.relation-indexed-continuity/v1',
    object_types: [leftType, rightType],
    type_mismatch: typeMismatch,
    lineage_continuity: declaredLineage ? 'SUPPORTED' : 'UNSUPPORTED',
    translation_continuity: declaredTranslation ? 'SUPPORTED' : 'UNSUPPORTED',
    signature_continuity: sharedSignature ? 'SUPPORTED' : 'UNSUPPORTED',
    scientific_object_identity:
      !typeMismatch && declaredOperatorEquivalence ? 'SUPPORTED' : (typeMismatch ? 'TYPE_MISMATCH' : 'WITHHOLD'),
    empirical_authority_continuity: 'WITHHOLD',
    path_lifts_to_direct_edge: false,
    clone_genes_decoded: false,
    screens_triggered: screensTriggered,
    hypotheses: Object.freeze({
      H_L_LATENT_ARCHITECTURE: declaredLineage ? 'TESTABLE_CANDIDATE' : 'UNESTABLISHED',
      H_R_RETROSPECTIVE_ARCHITECTURE: 'CO_PRESENT_ALTERNATIVE'
    })
  });
}

export function runSrcHeterostratigraphicAudit({
  corpus = null,
  operatorQuestion = '',
  activePlan = null,
  candidateEnvelope = null
} = {}) {
  const baseEval = evaluateCorpusWithSrcEngines(corpus, { operatorQuestion, activePlan });
  const universalizerCheck = rejectSrcUniversalizer(candidateEnvelope || {});

  const comparisonRegistry = [];
  for (const from of SRC_HETEROSTRATIGRAPHIC_STRATA) {
    for (const to of SRC_HETEROSTRATIGRAPHIC_STRATA) {
      if (from === to) continue;
      let status = 'ENCODER_REQUIRED';
      if ((from === 'ROUTE' && to === 'TEMPORAL') || (from === 'TEMPORAL' && to === 'ROUTE')) {
        status = 'PARTIAL_NONINVERTIBLE';
      } else if (
        (from === 'PROJECTIVE_ROUTING' && to === 'TOMOGRAPHY_OBSERVABILITY') ||
        (from === 'TOMOGRAPHY_OBSERVABILITY' && to === 'PROJECTIVE_ROUTING')
      ) {
        status = 'INCOMMENSURABLE';
      }
      comparisonRegistry.push({ from, to, status });
    }
  }

  const xStateNonImplication = Object.freeze({
    E_to_V: 'NOT_IMPLIED',
    V_to_R: 'NOT_IMPLIED',
    R_to_P: 'NOT_IMPLIED',
    P_to_L: 'NOT_IMPLIED',
    L_to_A: 'NOT_IMPLIED',
    composite_state_score: null
  });

  const relationContinuity = classifySrcRelationContinuity({
    leftType: baseEval.query_conditioning.matched_signatures.length > 0 ? 'signature' : 'operator',
    rightType: activePlan ? 'field' : 'operator',
    sharedSignature: baseEval.query_conditioning.matched_signatures.length > 0,
    declaredLineage: Boolean(activePlan?.work_ids?.length >= 2),
    declaredTranslation: false,
    declaredOperatorEquivalence: false,
    multiHopPathOnly: baseEval.projective_routing.candidate_link_count > 0
  });

  return Object.freeze({
    method: 'SRC_HETEROSTRATIGRAPHIC_AUDIT',
    engine_version: SRC_ENGINE_VERSION,
    canon_name: 'SignalRupture Canon (SRC)',
    corpus_rooms: SRC_CORPUS_ROOMS,
    strata: SRC_HETEROSTRATIGRAPHIC_STRATA,
    authority_axes: SRC_AUTHORITY_AXES,
    epistemic_state_axes: SRC_EPISTEMIC_STATE_AXES,
    epistemic_non_implication: xStateNonImplication,
    comparison_registry: comparisonRegistry,
    false_continuity_screens: SRC_FALSE_CONTINUITY_SCREENS,
    relation_continuity: relationContinuity,
    universalizer_guard: universalizerCheck,
    dual_carrier_separation: {
      planning_behavior_provenance_distinct_from_content: true,
      output_content_scalar_proxy_for_process_provenance: false
    },
    tomography_composite_score: baseEval.phase2_tomography.composite_score,
    projective_routing: baseEval.projective_routing,
    context_roles: baseEval.context_roles,
    query_conditioning: baseEval.query_conditioning,
    clone_genes_decoded: false,
    empirical_replication_credit: 0,
    human_closure_required: true
  });
}
