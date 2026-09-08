import {
  compileAiaSurfaceBinding,
  compileAiaSurfaceProjection
} from '../../engine/flowcore-aia-surface-binding.js';
import {
  FLOWCORE_GLYPH_REGISTRY,
  getFlowcoreGlyphSemantic
} from '../data/flowcore-glyph-semantics-v01.js';

export const HOLONOMY_LOOM_AIA_MOTION_SCHEMA = 'td613.holonomy-loom.flowcore-aia-motion/v0.1';
export const HOLONOMY_LOOM_AIA_ROUTE = 'EXPERIENTIAL';

export const HOLONOMY_LOOM_MOTION_KEYS = Object.freeze([
  'gathering',
  'recurrence',
  'bounded_emergence',
  'release',
  'protected_continuity',
  'structural_rest'
]);

const EXPECTED_GLYPHS = Object.freeze({
  gathering: 'à',
  recurrence: '米',
  bounded_emergence: 'hõt',
  release: '出',
  protected_continuity: 'cōl',
  structural_rest: '𝄐'
});

const CHILD_LABELS = Object.freeze({
  gathering: 'Gathered',
  recurrence: 'Compared',
  bounded_emergence: 'Safer copy',
  release: 'Copy checked',
  protected_continuity: 'Return',
  structural_rest: 'Rest'
});

const MOTION_RECIPES = Object.freeze({
  gathering: Object.freeze({ duration_ms: 420, keyframes: Object.freeze([
    Object.freeze({ transform: 'translateX(-6px) scale(.97)', opacity: .72 }),
    Object.freeze({ transform: 'translateX(0) scale(1)', opacity: 1 })
  ]) }),
  recurrence: Object.freeze({ duration_ms: 520, keyframes: Object.freeze([
    Object.freeze({ transform: 'scale(1)' }),
    Object.freeze({ transform: 'scale(1.055)' }),
    Object.freeze({ transform: 'scale(1)' })
  ]) }),
  bounded_emergence: Object.freeze({ duration_ms: 560, keyframes: Object.freeze([
    Object.freeze({ transform: 'scale(.96)', opacity: .7 }),
    Object.freeze({ transform: 'scale(1.08)', opacity: 1 }),
    Object.freeze({ transform: 'scale(1)', opacity: 1 })
  ]) }),
  release: Object.freeze({ duration_ms: 520, keyframes: Object.freeze([
    Object.freeze({ transform: 'translateX(0)', opacity: 1 }),
    Object.freeze({ transform: 'translateX(10px)', opacity: .86 }),
    Object.freeze({ transform: 'translateX(0)', opacity: 1 })
  ]) }),
  protected_continuity: Object.freeze({ duration_ms: 560, keyframes: Object.freeze([
    Object.freeze({ transform: 'scale(1)', opacity: 1 }),
    Object.freeze({ transform: 'scale(.985)', opacity: .84 }),
    Object.freeze({ transform: 'scale(1)', opacity: 1 })
  ]) }),
  structural_rest: Object.freeze({ duration_ms: 640, keyframes: Object.freeze([
    Object.freeze({ transform: 'translateY(-2px)', opacity: 1 }),
    Object.freeze({ transform: 'translateY(0)', opacity: .82 }),
    Object.freeze({ transform: 'translateY(0)', opacity: 1 })
  ]) })
});

const binding = compileAiaSurfaceBinding({
  surface_reference: 'Dome-World/Holonomy Loom glyph-control motion',
  host_station: 'Dome-World',
  governance_context: 'TD613',
  nested_surface: true,
  route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
  route_inference_forbidden: true,
  consequence_order: 'CONSEQUENCE_BEFORE_ONTOLOGY',
  internal_legibility: 'NOW_WHY_EXACT',
  outside_posture: 'MINIMUM_DISCLOSURE_NON_AUTHORITATIVE',
  fabricated_decoys: false,
  rest: { available: true, penalty: false },
  exit: { available: true, penalty: false },
  authority: {
    station_mutation_authorized: false,
    automatic_release: false,
    automatic_redesign: false,
    route_inference_allowed: false,
    authority_may_cross: false,
    human_closure_required: true
  }
});

function descriptor(key) {
  if (!HOLONOMY_LOOM_MOTION_KEYS.includes(key)) throw new TypeError(`Unknown Holonomy Loom motion key: ${key}`);
  const semantic = getFlowcoreGlyphSemantic(key);
  if (!semantic || semantic.glyph !== EXPECTED_GLYPHS[key]) {
    throw new Error(`Canonical Flow-Core glyph registry mismatch for ${key}.`);
  }
  return Object.freeze({
    key,
    glyph: semantic.glyph,
    child_label: CHILD_LABELS[key],
    semantic_relation: semantic.semantic_relation,
    motion_grammar: semantic.motion_grammar,
    static_equivalent: semantic.static_equivalent,
    inspection_grammar: semantic.inspection_grammar,
    authority_ceiling: FLOWCORE_GLYPH_REGISTRY.authority_ceiling,
    motion_recipe: MOTION_RECIPES[key]
  });
}

export const HOLONOMY_LOOM_MOTION_DESCRIPTORS = Object.freeze(
  Object.fromEntries(HOLONOMY_LOOM_MOTION_KEYS.map(key => [key, descriptor(key)]))
);

function boundedRuleIds(analysis) {
  return [...new Set((analysis?.findings || []).map(item => String(item.rule_id || '')).filter(Boolean))].sort();
}

function authorizedActions(analysis) {
  const actions = ['REST', 'RETURN', 'EXIT', 'SHOW_PATH'];
  if (analysis?.release_boundary?.safer_copy_available === true) actions.push('MAKE_SAFER_COPY');
  if (analysis?.release_boundary?.raw_release_allowed === true) actions.push('COPY_CHECKED_MESSAGE');
  return actions;
}

function motionStateFor(key, analysis) {
  if (key === 'gathering' || key === 'recurrence') return 'COMPLETE';
  if (key === 'bounded_emergence') return analysis?.release_boundary?.safer_copy_available === true ? 'AVAILABLE' : 'NOT_NEEDED';
  if (key === 'release') return analysis?.release_boundary?.raw_release_allowed === true ? 'AVAILABLE' : 'BLOCKED';
  if (key === 'protected_continuity' || key === 'structural_rest') return 'AVAILABLE';
  return 'HELD';
}

export function compileHolonomyLoomAiaMotionProjection(analysis, { routeSelection } = {}) {
  if (!analysis || typeof analysis !== 'object') throw new TypeError('A Loom analysis is required.');
  if (routeSelection !== HOLONOMY_LOOM_AIA_ROUTE) {
    throw new Error('Holonomy Loom AIA motion requires explicit EXPERIENTIAL route selection.');
  }
  if (!analysis.receipt || !analysis.release_boundary || !Array.isArray(analysis.claim_ceiling)) {
    throw new Error('Holonomy Loom AIA motion requires the bounded deterministic Loom analysis contract.');
  }

  const ruleIds = boundedRuleIds(analysis);
  const invariants = {
    provenance: {
      evidence_basis: ['deterministic local Holonomy Loom receipt'],
      station_owners: ['Dome-World'],
      raw_content_included: false
    },
    missingness: [],
    contradictions: [],
    causal_structure: {
      order: ['ACT', 'WORLD_ANSWERS', 'OPTIONAL_NAME', 'REST'],
      status: String(analysis.status || 'HELD'),
      finding_count: Number(analysis.receipt.finding_count || 0),
      route_memory_relation_count: Number(analysis.receipt.route_memory_relation_count || 0),
      matched_rule_ids: ruleIds
    },
    claim_ceiling: [...analysis.claim_ceiling],
    station_ownership: ['Dome-World', 'Holonomy Loom'],
    authorized_actions: authorizedActions(analysis),
    source_status: 'OPERATOR_SUPPLIED_LOCAL_MESSAGE',
    observation_status: 'DETERMINISTIC_LOCAL_ANALYSIS'
  };

  const glyphPath = HOLONOMY_LOOM_MOTION_KEYS.map(key => {
    const item = HOLONOMY_LOOM_MOTION_DESCRIPTORS[key];
    return {
      key,
      glyph: item.glyph,
      child_label: item.child_label,
      state: motionStateFor(key, analysis),
      semantic_relation: item.semantic_relation,
      motion_grammar: [...item.motion_grammar],
      static_equivalent: [...item.static_equivalent]
    };
  });

  const projection = compileAiaSurfaceProjection(binding, routeSelection, {
    governed_reference: `${HOLONOMY_LOOM_AIA_MOTION_SCHEMA}:${String(analysis.status || 'HELD')}:${Number(analysis.receipt.finding_count || 0)}`,
    invariants,
    surface: {
      plain_consequence: String(analysis.summary || ''),
      status: String(analysis.status || 'HELD'),
      finding_count: Number(analysis.receipt.finding_count || 0),
      route_memory_relation_count: Number(analysis.receipt.route_memory_relation_count || 0),
      release_blocked: analysis.release_boundary.raw_release_allowed !== true,
      safer_copy_available: analysis.release_boundary.safer_copy_available === true,
      glyph_path: glyphPath
    }
  });

  return Object.freeze({
    schema: HOLONOMY_LOOM_AIA_MOTION_SCHEMA,
    route_selection_observed: routeSelection,
    route_inference_performed: false,
    raw_message_included: false,
    provider_call_required: false,
    external_network_required: false,
    generic_flowcore_taxonomy_mutated: false,
    glyph_registry_schema: FLOWCORE_GLYPH_REGISTRY.schema,
    binding,
    projection,
    descriptors: HOLONOMY_LOOM_MOTION_DESCRIPTORS,
    authority: Object.freeze({
      automatic_release: false,
      automatic_redesign: false,
      station_mutation_authorized: false,
      authority_may_cross: false,
      human_closure_required: true,
      merge_authority: false,
      vercel_authority: false,
      production_release_authority: false,
      provider_release_authority: false
    }),
    exogenous_witness_credit: 0,
    golden_egg_credit: 0
  });
}

export function getHolonomyLoomMotionDescriptor(key) {
  return HOLONOMY_LOOM_MOTION_DESCRIPTORS[key] || null;
}
