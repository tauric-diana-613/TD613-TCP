import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { FLOWCORE_AIA_ROUTE_IDS, FLOWCORE_AIA_ROUTES } from './flowcore-pedagogue-law.js';
import { clone, deterministic, deterministicId, freeze, noForbidden } from './flowcore-pedagogue-utils.js';
import { validateScene, validateTransition } from './flowcore-pedagogue-validators.js';

export const AIA_VIEW_SCHEMA = 'td613.aia.view/v0.1';
export const AIA_POSTURES = Object.freeze(['child', 'custodian', 'auditor', 'technical']);
export const AIA_ROUTE_IDS = FLOWCORE_AIA_ROUTE_IDS;

const ROUTE_ALIASES = Object.freeze({
  child: 'EXPERIENTIAL', experiential: 'EXPERIENTIAL',
  custodian: 'CUSTODIAL', custodial: 'CUSTODIAL',
  auditor: 'AUDIT', audit: 'AUDIT',
  technical: 'IMPLEMENTATION', implementation: 'IMPLEMENTATION'
});

const INVARIANT_KEYS = Object.freeze([
  'provenance', 'missingness', 'contradictions', 'causal_structure',
  'claim_ceiling', 'station_ownership', 'authorized_actions',
  'local_section_boundaries', 'source_status', 'observation_status'
]);

function routeId(posture) {
  const raw = String(posture || '');
  const direct = raw.toUpperCase();
  if (FLOWCORE_AIA_ROUTE_IDS.includes(direct)) return direct;
  const alias = ROUTE_ALIASES[raw.toLowerCase()];
  if (!alias) throw new Error('AIA posture must be explicitly selected from the canonical route registry.');
  return alias;
}

function sortedUnique(values = []) {
  return [...new Set(values.filter(value => typeof value === 'string'))].sort();
}

function invariants(scene, transition) {
  return {
    provenance: clone(scene.provenance),
    missingness: sortedUnique([...(scene.missingness || []), ...(transition.missingness || [])]),
    contradictions: sortedUnique([...(scene.contradictions || []), ...(transition.contradictions || [])]),
    causal_structure: clone(scene.causal_structure),
    claim_ceiling: clone(scene.claim_ceiling),
    station_ownership: sortedUnique([
      scene.station_owner,
      ...(scene.provenance?.station_owners || []),
      transition.station_owner
    ]),
    authorized_actions: sortedUnique(transition.authorized_actions || []),
    local_section_boundaries: clone(scene.route_topology),
    source_status: scene.source_status,
    observation_status: scene.observation_status
  };
}

function experientialSurface(scene, transition) {
  return {
    order: ['visible_condition', 'meaningful_action', 'world_answer', 'plain_consequence', 'relation_after_experience', 'rest', 'exit'],
    visible_condition: clone(scene.visible_condition),
    meaningful_action: clone(transition.selected_action),
    world_answer: {
      causal_trace: clone(transition.causal_trace || []),
      unresolved_relations: clone(transition.unresolved_relations || [])
    },
    plain_consequence: transition.name?.plain_language || scene.visible_condition?.plain_language || 'A bounded consequence remains visible.',
    relation_after_experience: transition.name ? {
      plain_language: transition.name.plain_language,
      glyph_relation: transition.name.glyph_relation,
      technical_term: transition.name.technical_term,
      non_equivalence: clone(transition.name.non_equivalence || [])
    } : null,
    alternate_explanations: clone(scene.research_frame?.alternative_explanations || []),
    terminology: {
      density: 'LOW',
      withheld_until_world_answer: clone(scene.technical_terms_withheld || [])
    }
  };
}

function custodialSurface(scene, transition) {
  return {
    order: ['source_relationship', 'sensitivity', 'custody_posture', 'lawful_next_action', 'downstream_consequence', 'continuity', 'rest', 'exit'],
    source_relationship: clone(scene.provenance),
    sensitivity: {
      source_status: scene.source_status,
      observation_status: scene.observation_status,
      missingness: sortedUnique([...(scene.missingness || []), ...(transition.missingness || [])])
    },
    custody_posture: {
      host_station: scene.station_owner,
      source_station_owners: clone(scene.provenance?.station_owners || []),
      flowcore_commands_station: false
    },
    lawful_next_action: clone(transition.selected_action),
    downstream_consequence: clone(transition.world_delta),
    continuity: {
      rest_preserves_continuity: scene.rest?.continuity_preserved === true,
      closure_status: scene.closure?.status
    }
  };
}

function auditSurface(scene, transition) {
  return {
    order: ['source_status', 'evidence_basis', 'transformation_history', 'alternatives', 'residuals', 'abstention', 'receipt_replay', 'rest', 'exit'],
    source_status: scene.source_status,
    evidence_basis: clone(scene.provenance?.evidence_basis || []),
    transformation_history: clone(scene.provenance?.transformations || []),
    alternatives: clone(scene.research_frame?.alternative_explanations || []),
    residuals: {
      losses: clone(transition.losses || []),
      missingness: sortedUnique([...(scene.missingness || []), ...(transition.missingness || [])]),
      contradictions: sortedUnique([...(scene.contradictions || []), ...(transition.contradictions || [])]),
      unresolved_relations: clone(transition.unresolved_relations || [])
    },
    abstention: clone(scene.research_frame?.abstention_conditions || []),
    receipt_replay: {
      scene_reference: scene.scene_id,
      transition_reference: transition.transition_id,
      deterministic_replay_required: true
    }
  };
}

function implementationSurface(scene, transition) {
  return {
    order: ['schemas', 'deterministic_references', 'calibration', 'equations', 'implementation_references', 'bounded_json', 'rest', 'exit'],
    schemas: { scene: scene.schema, transition: transition.schema, view: AIA_VIEW_SCHEMA },
    deterministic_references: { scene_id: scene.scene_id, transition_id: transition.transition_id },
    calibration: {
      source_status: scene.source_status,
      observation_status: scene.observation_status,
      source_status_is_claim_ceiling: false
    },
    equations: clone(scene.causal_structure?.equations || []),
    implementation_references: clone(scene.provenance?.source_references || []),
    bounded_json: {
      source_content_included: false,
      scene_reference: scene.scene_id,
      transition_reference: transition.transition_id,
      canonical_projection: canonicalJson({
        scene_reference: scene.scene_id,
        transition_reference: transition.transition_id,
        phase: transition.phase,
        missingness: sortedUnique([...(scene.missingness || []), ...(transition.missingness || [])]),
        contradictions: sortedUnique([...(scene.contradictions || []), ...(transition.contradictions || [])])
      })
    },
    technical_terms: clone(scene.technical_terms_withheld || [])
  };
}

const SURFACE_BUILDERS = Object.freeze({
  EXPERIENTIAL: experientialSurface,
  CUSTODIAL: custodialSurface,
  AUDIT: auditSurface,
  IMPLEMENTATION: implementationSurface
});

function validateAIAView(view) {
  if (!view || view.schema !== AIA_VIEW_SCHEMA) throw new Error('Malformed AIA view.');
  if (!FLOWCORE_AIA_ROUTE_IDS.includes(view.route)) throw new Error('Unknown AIA route.');
  if (view.selection !== 'EXPLICIT_OPERATOR_SELECTION_ONLY' || view.route_inference_forbidden !== true) throw new Error('AIA route selection cannot be inferred.');
  if (view.rest?.available !== true || view.rest?.penalty !== false || view.exit?.available !== true || view.exit?.penalty !== false) throw new Error('AIA rest or exit removed.');
  if (view.authority?.flowcore_commands_station !== false || view.authority?.automatic_ash_action !== false || view.authority?.station_mutation_authorized !== false || view.authority?.human_closure_required !== true) throw new Error('AIA view widened authority.');
  if (view.closure?.status !== 'OPEN' || view.closure?.closed_by !== null) throw new Error('AIA view closed automatically.');
  for (const key of INVARIANT_KEYS) if (!(key in view.invariants)) throw new Error(`AIA invariant missing: ${key}`);
  noForbidden(view);
  canonicalJson(view);
  return true;
}

export async function compileAIAView(scene, transition, posture, options = {}) {
  validateScene(scene);
  validateTransition(transition);
  deterministic(options);
  if (transition.scene_reference !== scene.scene_id) throw new Error('Transition does not belong to scene.');
  const route = routeId(posture);
  const registry = FLOWCORE_AIA_ROUTES.routes[route];
  const preserved = invariants(scene, transition);
  const surface = SURFACE_BUILDERS[route](scene, transition);
  const subject = {
    scene_reference: scene.scene_id,
    transition_reference: transition.transition_id,
    route,
    invariants: preserved,
    surface
  };
  const view = {
    schema: AIA_VIEW_SCHEMA,
    view_id: await deterministicId('flowped_aia_', 'TD613:FLOWCORE:AIA-VIEW-ID:v1', subject, options),
    scene_reference: scene.scene_id,
    transition_reference: transition.transition_id,
    route,
    posture_alias: AIA_POSTURES[FLOWCORE_AIA_ROUTE_IDS.indexOf(route)],
    selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
    route_inference_forbidden: true,
    purpose: registry.purpose,
    emphasis: clone(registry.priorities),
    invariants: preserved,
    surface,
    station_owner: scene.station_owner,
    authorized_actions: clone(preserved.authorized_actions),
    rest: { available: true, penalty: false, continuity_preserved: true, replay_available: true },
    exit: { available: true, penalty: false },
    claim_ceiling: clone(scene.claim_ceiling),
    authority: {
      flowcore_commands_station: false,
      automatic_ash_action: false,
      release_authorized: false,
      station_mutation_authorized: false,
      authority_may_cross: false,
      human_closure_required: true
    },
    closure: { status: 'OPEN', closed_by: null },
    non_equivalence: {
      canonical_law: FLOWCORE_AIA_ROUTES.non_equivalence_law,
      route_surfaces_must_differ: true,
      invariants_must_match: true
    }
  };
  validateAIAView(view);
  return freeze(view);
}

export function compareAIAViews(left, right) {
  validateAIAView(left);
  validateAIAView(right);
  if (left.scene_reference !== right.scene_reference || left.transition_reference !== right.transition_reference) throw new Error('AIA views must describe the same governed scene transition.');
  const mismatches = [];
  for (const key of INVARIANT_KEYS) {
    if (canonicalJson(left.invariants[key]) !== canonicalJson(right.invariants[key])) mismatches.push(key);
  }
  return freeze({
    schema: 'td613.aia.view-comparison/v0.1',
    left_route: left.route,
    right_route: right.route,
    same_governed_transition: true,
    invariant_mismatches: mismatches,
    invariants_preserved: mismatches.length === 0,
    surfaces_non_equivalent: left.route !== right.route && canonicalJson(left.surface) !== canonicalJson(right.surface),
    authority_equal_and_bounded: canonicalJson(left.authority) === canonicalJson(right.authority) && left.authority.authority_may_cross === false,
    rest_and_exit_preserved: left.rest.available && right.rest.available && left.exit.available && right.exit.available
  });
}

export function verifyAIAInvariants(scene, views) {
  validateScene(scene);
  if (!Array.isArray(views) || views.length !== FLOWCORE_AIA_ROUTE_IDS.length) throw new Error('Exactly four canonical AIA views are required.');
  views.forEach(validateAIAView);
  const routeSet = [...new Set(views.map(view => view.route))].sort();
  if (canonicalJson(routeSet) !== canonicalJson([...FLOWCORE_AIA_ROUTE_IDS].sort())) throw new Error('Canonical AIA routes are incomplete or duplicated.');
  if (views.some(view => view.scene_reference !== scene.scene_id)) throw new Error('AIA view references another scene.');
  const comparisons = [];
  for (let i = 0; i < views.length; i += 1) {
    for (let j = i + 1; j < views.length; j += 1) comparisons.push(compareAIAViews(views[i], views[j]));
  }
  const failures = comparisons.filter(item => !item.invariants_preserved || !item.surfaces_non_equivalent || !item.authority_equal_and_bounded || !item.rest_and_exit_preserved);
  if (failures.length) throw new Error('AIA invariant verification failed.');
  return freeze({
    schema: 'td613.aia.invariant-report/v0.1',
    scene_reference: scene.scene_id,
    routes: clone(FLOWCORE_AIA_ROUTE_IDS),
    pair_count: comparisons.length,
    all_invariants_preserved: true,
    all_surfaces_non_equivalent: true,
    route_inference_forbidden: true,
    authority_transferred: false,
    human_closure_required: true,
    closure: { status: 'OPEN', closed_by: null }
  });
}
