import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { compileAiaSurfaceBinding } from './flowcore-aia-surface-binding.js';
import {
  compilePedagogueRouteMemory,
  comparePedagogueRouteMemory
} from './flowcore-pedagogue-core.js';

export const PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA = 'td613.pedagogue-practice-fixture/v0.1';
export const PEDAGOGUE_PRACTICE_REVIEW_SCHEMA = 'td613.pedagogue-practice-review/v0.1';
export const PEDAGOGUE_PRACTICE_LOAD_REPORT_SCHEMA = 'td613.pedagogue-practice-load-report/v0.1';
export const PEDAGOGUE_PRACTICE_TRAVERSAL_REPORT_SCHEMA = 'td613.pedagogue-practice-traversal-report/v0.1';

const LOAD_EFFECT_KEYS = Object.freeze([
  'evidence_records',
  'retrieval_requests',
  'retrieval_receipts',
  'practice_custody_writes',
  'domain_mutations',
  'authority_grants'
]);

const TRAVERSAL_EFFECT_KEYS = Object.freeze([
  'retrieval_requests',
  'practice_custody_writes',
  'domain_mutations',
  'evidence_claims',
  'authority_grants'
]);

const FORBIDDEN_FICTION_KEYS = new Set([
  'records',
  'evidence',
  'receipts',
  'retrieved_records',
  'source_records',
  'claims',
  'source_bytes',
  'raw_content',
  'authority'
]);

function text(value, label, max = 180) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized.length > max) throw new TypeError(`${label} must be a bounded non-empty string.`);
  return normalized;
}

function clone(value) {
  return value === null || typeof value !== 'object'
    ? value
    : Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function ensureObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

function rejectInventedEvidence(value, path = 'fictional_payload') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((child, index) => rejectInventedEvidence(child, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_FICTION_KEYS.has(key)) throw new Error(`Practice fixture may not fabricate ${path}.${key}.`);
    rejectInventedEvidence(child, `${path}.${key}`);
  }
}

function normalizeRouteSteps(steps) {
  if (!Array.isArray(steps) || !steps.length) throw new TypeError('Practice fixture requires expected_route_steps.');
  return steps.map((step, index) => text(
    typeof step === 'string' ? step : step?.step_id || step?.phase || step?.label || step?.id,
    `expected_route_steps[${index}]`,
    160
  ));
}

// A practice case may teach a contrast without teaching a conclusion. The
// primitive is intentionally semantic-light: products supply bounded NOW / WHY /
// EXACT language while Pedagogue preserves the distinction, forbids inference,
// and carries it through review/traversal. Product nouns never enter shared core.
function normalizeTeachingContrasts(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new TypeError('teaching_contrasts must be an array when declared.');
  if (value.length > 12) throw new TypeError('teaching_contrasts may contain at most 12 bounded contrasts.');
  return value.map((item, index) => {
    const source = ensureObject(item, `teaching_contrasts[${index}]`);
    return {
      contrast_id: text(source.contrast_id || source.id, `teaching_contrasts[${index}].contrast_id`, 96),
      now: text(source.now, `teaching_contrasts[${index}].now`, 360),
      why: text(source.why, `teaching_contrasts[${index}].why`, 360),
      exact: text(source.exact, `teaching_contrasts[${index}].exact`, 420),
      automatic_inference_forbidden: true,
      authority_grant_forbidden: true
    };
  });
}

function nonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${label} must be a non-negative safe integer.`);
  return value;
}

function normalizeEffects(snapshot, keys, label) {
  const source = ensureObject(snapshot, label);
  return Object.fromEntries(keys.map((key) => [key, nonNegativeInteger(source[key] ?? 0, `${label}.${key}`)]));
}

function practiceAuthority(declaration) {
  const authority = {
    evidence_claim_authority: false,
    consequence_authority: false,
    domain_mutation_authority: false,
    automatic_retrieval: false,
    automatic_release: false,
    automatic_redesign: false,
    automatic_ash_action: false,
    practice_custody_write_authority: declaration.practice_custody_write_allowed === true,
    operator_read_only_retrieval_allowed: declaration.operator_read_only_retrieval_allowed === true,
    explicit_operator_gesture_required: true,
    human_closure_required: true
  };
  canonicalJson(authority);
  return authority;
}

function observedAuthorityIsClosed(observed = {}, admitted = {}) {
  const source = observed && typeof observed === 'object' && !Array.isArray(observed) ? observed : {};
  const forbidden = [
    'evidence_claim_authority',
    'consequence_authority',
    'domain_mutation_authority',
    'automatic_retrieval',
    'automatic_release',
    'automatic_redesign',
    'automatic_ash_action'
  ];
  if (forbidden.some((key) => source[key] === true)) return false;
  if (source.practice_custody_write_authority === true && admitted.practice_custody_write_authority !== true) return false;
  if (source.operator_read_only_retrieval_allowed === true && admitted.operator_read_only_retrieval_allowed !== true) return false;
  if (source.explicit_operator_gesture_required === false) return false;
  if (source.human_closure_required === false) return false;
  return true;
}

function routeMemoryIsExplicit(memory) {
  return Array.isArray(memory?.steps) &&
    memory.steps.length > 0 &&
    typeof memory.route_projection === 'string' &&
    memory.route_projection.length > 0 &&
    memory.authority?.endpoint_equivalence_grants_authority === false &&
    memory.authority?.automatic_release === false &&
    memory.authority?.human_closure_required === true;
}

export function compileCanonicalPracticeFixture(declaration = {}) {
  if (declaration.schema !== PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA) {
    throw new Error(`Expected ${PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA}.`);
  }
  if (declaration.manifestly_fictional !== true) throw new Error('Practice fixture must be manifestly fictional.');

  const fictionalPayload = clone(ensureObject(declaration.fictional_payload, 'fictional_payload'));
  rejectInventedEvidence(fictionalPayload);
  canonicalJson(fictionalPayload);

  const expectedRouteSteps = normalizeRouteSteps(declaration.expected_route_steps);
  const teachingContrasts = normalizeTeachingContrasts(declaration.teaching_contrasts);
  const expectedEndpoint = text(declaration.expected_endpoint || expectedRouteSteps.at(-1), 'expected_endpoint');
  const surfaceReference = text(declaration.surface_reference, 'surface_reference');
  const authority = practiceAuthority(declaration);
  const expectedRouteMemory = compilePedagogueRouteMemory(expectedRouteSteps, { endpoint: expectedEndpoint });
  const aiaBinding = compileAiaSurfaceBinding({
    surface_reference: surfaceReference,
    host_station: 'Dome-World',
    governance_context: 'TD613',
    nested_surface: true,
    route_selection: 'EXPLICIT_OPERATOR_SELECTION_ONLY',
    route_inference_forbidden: true,
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

  const fixture = {
    schema: PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
    fixture_id: text(declaration.fixture_id, 'fixture_id'),
    surface_reference: surfaceReference,
    operator_label: text(declaration.operator_label || 'Practice case', 'operator_label'),
    research_name: 'CALIBRATION_PHANTOM',
    manifestly_fictional: true,
    runtime_binding_declared: declaration.runtime_binding === true,
    fictional_payload: fictionalPayload,
    teaching_contrasts: teachingContrasts,
    expected_route_steps: expectedRouteSteps,
    expected_endpoint: expectedEndpoint,
    expected_route_memory: expectedRouteMemory,
    load_contract: {
      container_before_content: true,
      route_before_jargon: true,
      fictional_content_may_not_become_evidence: true,
      automatic_retrieval_forbidden: true,
      automatic_custody_write_forbidden: true,
      automatic_domain_mutation_forbidden: true,
      automatic_authority_grant_forbidden: true
    },
    traversal_contract: {
      same_runtime_route_required: true,
      separate_demo_route_forbidden: true,
      explicit_operator_gesture_required: true,
      operator_read_only_retrieval_allowed: authority.operator_read_only_retrieval_allowed,
      practice_custody_write_allowed: authority.practice_custody_write_authority,
      domain_mutation_forbidden: true,
      evidence_claim_authority_forbidden: true,
      practice_marker_must_survive: true,
      teaching_contrasts_may_not_infer_category: true
    },
    authority,
    aia_binding: aiaBinding,
    research_claim_ceiling: {
      known_ground_truth_route: true,
      calibration_phantom: true,
      route_reconstruction_surrogate_only: true,
      geometric_holonomy_claim: false,
      curvature_claim: false,
      affine_connection_claim: false,
      transport_law_claim: false,
      runtime_recovery_claim: false
    }
  };
  canonicalJson(fixture);
  return deepFreeze(fixture);
}

export function compilePedagoguePracticeReview(declaration = {}) {
  const fixture = compileCanonicalPracticeFixture(declaration);
  return deepFreeze({
    schema: PEDAGOGUE_PRACTICE_REVIEW_SCHEMA,
    fixture_id: fixture.fixture_id,
    surface_reference: fixture.surface_reference,
    fixture,
    teaching_contrasts: clone(fixture.teaching_contrasts),
    expected_route_memory: fixture.expected_route_memory,
    aia_surface_binding: fixture.aia_binding,
    practice_gate: {
      manifestly_fictional: fixture.manifestly_fictional === true,
      fictional_payload_contains_no_evidence: true,
      same_runtime_route_required: fixture.traversal_contract.same_runtime_route_required === true,
      separate_demo_route_forbidden: fixture.traversal_contract.separate_demo_route_forbidden === true,
      automatic_retrieval_forbidden: fixture.authority.automatic_retrieval === false,
      domain_mutation_forbidden: fixture.authority.domain_mutation_authority === false,
      evidence_authority_closed: fixture.authority.evidence_claim_authority === false,
      consequence_authority_closed: fixture.authority.consequence_authority === false,
      aia_authority_closed: fixture.aia_binding.authority.authority_may_cross === false,
      route_memory_explicit: routeMemoryIsExplicit(fixture.expected_route_memory),
      teaching_contrasts_bounded: fixture.teaching_contrasts.length <= 12 && fixture.teaching_contrasts.every((item) => item.automatic_inference_forbidden === true && item.authority_grant_forbidden === true),
      geometric_claims_held: fixture.research_claim_ceiling.geometric_holonomy_claim === false && fixture.research_claim_ceiling.transport_law_claim === false,
      human_closure_required: fixture.authority.human_closure_required === true
    }
  });
}

export function verifyPracticeFixtureLoad(fixture, { before, after } = {}) {
  if (fixture?.schema !== PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA) throw new Error('Canonical practice fixture required.');
  const baseline = normalizeEffects(before, LOAD_EFFECT_KEYS, 'before');
  const observed = normalizeEffects(after, LOAD_EFFECT_KEYS, 'after');
  const deltas = Object.fromEntries(LOAD_EFFECT_KEYS.map((key) => [key, observed[key] - baseline[key]]));
  const changed = Object.entries(deltas).filter(([, delta]) => delta !== 0);
  if (changed.length) {
    throw new Error(`Practice fixture load produced forbidden effects: ${changed.map(([key, delta]) => `${key}=${delta}`).join(', ')}.`);
  }
  return deepFreeze({
    schema: PEDAGOGUE_PRACTICE_LOAD_REPORT_SCHEMA,
    fixture_id: fixture.fixture_id,
    no_effects: true,
    before: baseline,
    after: observed,
    deltas,
    teaching_contrasts: clone(fixture.teaching_contrasts || []),
    child_legible: {
      now: 'The fictional practice case is loaded.',
      why: 'Loading the sample changes labels only; it does not search, write, or create evidence.',
      exact: 'No retrieval, evidence, custody, domain-mutation, receipt, or authority count changed.'
    }
  });
}

export function comparePracticeFixtureTraversal(fixture, observedRoute, {
  observedEndpoint = null,
  explicitOperatorGesture = false,
  observedEffects = {},
  observedAuthority = {}
} = {}) {
  if (fixture?.schema !== PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA) throw new Error('Canonical practice fixture required.');
  const effects = normalizeEffects(observedEffects, TRAVERSAL_EFFECT_KEYS, 'observedEffects');
  const gesture = explicitOperatorGesture === true;

  if (effects.domain_mutations !== 0) throw new Error('Practice traversal may not perform domain mutations.');
  if (effects.evidence_claims !== 0) throw new Error('Practice traversal may not create evidentiary claims.');
  if (effects.authority_grants !== 0) throw new Error('Practice traversal may not grant authority.');
  if (effects.retrieval_requests > 0 && (!gesture || !fixture.authority.operator_read_only_retrieval_allowed)) {
    throw new Error('Practice retrieval requires an explicit operator gesture and an admitted read-only retrieval fixture.');
  }
  if (effects.practice_custody_writes > 0 && (!gesture || !fixture.authority.practice_custody_write_authority)) {
    throw new Error('Practice custody writes require an explicit operator gesture and an admitted practice-custody route.');
  }
  if (!observedAuthorityIsClosed(observedAuthority, fixture.authority)) throw new Error('Practice traversal attempted to widen authority.');

  const comparison = comparePedagogueRouteMemory(
    fixture.expected_route_steps,
    observedRoute,
    {
      expectedEndpoint: fixture.expected_endpoint,
      observedEndpoint: observedEndpoint || fixture.expected_endpoint
    }
  );

  return deepFreeze({
    schema: PEDAGOGUE_PRACTICE_TRAVERSAL_REPORT_SCHEMA,
    fixture_id: fixture.fixture_id,
    surface_reference: fixture.surface_reference,
    route_memory_comparison: comparison,
    route_reconstruction_error_millipoints: comparison.route_divergence_millipoints,
    exact_route_reconstruction: comparison.exact_route_match,
    endpoint_equivalent: comparison.endpoint_equivalent,
    observed_effects: effects,
    authority_closed: true,
    teaching_contrasts: clone(fixture.teaching_contrasts || []),
    tomography_posture: comparison.exact_route_match
      ? 'CALIBRATION_ROUTE_RECONSTRUCTED'
      : 'CALIBRATION_ROUTE_DIVERGED',
    research_claim_ceiling: clone(fixture.research_claim_ceiling),
    child_legible: {
      now: comparison.exact_route_match
        ? 'The practice case followed the expected route.'
        : 'The practice case arrived by a different route.',
      why: comparison.exact_route_match
        ? 'The observed path matches the known practice path.'
        : 'The endpoint may match, but the route still differs.',
      exact: comparison.child_legible.exact
    }
  });
}

export const PEDAGOGUE_PRACTICE_LOAD_EFFECT_KEYS = LOAD_EFFECT_KEYS;
export const PEDAGOGUE_PRACTICE_TRAVERSAL_EFFECT_KEYS = TRAVERSAL_EFFECT_KEYS;
