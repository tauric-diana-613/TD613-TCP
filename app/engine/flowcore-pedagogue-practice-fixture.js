import { comparePedagogueRouteMemory } from './flowcore-pedagogue-route-memory.js';

export const PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA = 'td613.flowcore.pedagogue-practice-fixture/v0.1';
export const PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA = 'td613.flowcore.pedagogue-practice-observation/v0.1';
export const PEDAGOGUE_PRACTICE_REPORT_SCHEMA = 'td613.flowcore.pedagogue-practice-report/v0.1';

const CLOSED_AUTHORITY = Object.freeze({
  evidence_authority: false,
  consequence_authority: false,
  external_write_authority: false,
  production_mutation_authority: false,
  automatic_retrieval: false,
  automatic_release: false,
  authority_may_cross: false,
  human_closure_required: true
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function boundedText(value, label, max = 240) {
  const text = String(value ?? '').trim();
  if (!text || text.length > max) throw new TypeError(`${label} must be a bounded non-empty string.`);
  return text;
}

function normalizeRoute(route, label) {
  if (!Array.isArray(route) || !route.length) throw new TypeError(`${label} must contain at least one route step.`);
  return route.map((step, index) => {
    if (typeof step === 'string') return boundedText(step, `${label}[${index}]`, 160);
    if (!step || typeof step !== 'object' || Array.isArray(step)) throw new TypeError(`${label}[${index}] must be a route token or route-step object.`);
    return boundedText(step.step_id || step.phase || step.label || step.id, `${label}[${index}]`, 160);
  });
}

function nonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${label} must be a non-negative safe integer.`);
  return value;
}

function exactBoolean(value, label) {
  if (value !== true && value !== false) throw new TypeError(`${label} must be boolean.`);
  return value;
}

function normalizeAuthority(authority = {}) {
  const normalized = { ...CLOSED_AUTHORITY };
  for (const key of Object.keys(CLOSED_AUTHORITY)) {
    if (key in authority) normalized[key] = exactBoolean(authority[key], `authority.${key}`);
  }
  if (
    normalized.evidence_authority ||
    normalized.consequence_authority ||
    normalized.external_write_authority ||
    normalized.production_mutation_authority ||
    normalized.automatic_retrieval ||
    normalized.automatic_release ||
    normalized.authority_may_cross ||
    normalized.human_closure_required !== true
  ) {
    throw new Error('Practice fixtures must remain fictional, non-evidentiary, non-releasing, and human-closed.');
  }
  return deepFreeze(normalized);
}

function normalizeGroundTruth(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('ground_truth must be an object.');
  return deepFreeze(structuredClone(value));
}

function normalizeAllowedEffects(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('allowed_effects must be an object.');
  return deepFreeze({
    reversible_local_writes_max: nonNegativeInteger(value.reversible_local_writes_max ?? 0, 'allowed_effects.reversible_local_writes_max')
  });
}

function normalizeObservedEffects(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('observation.effects must be an object.');
  return deepFreeze({
    evidence_records_created: nonNegativeInteger(value.evidence_records_created ?? 0, 'observation.effects.evidence_records_created'),
    retrieval_requests_started: nonNegativeInteger(value.retrieval_requests_started ?? 0, 'observation.effects.retrieval_requests_started'),
    external_mutations_committed: nonNegativeInteger(value.external_mutations_committed ?? 0, 'observation.effects.external_mutations_committed'),
    vault_writes_committed: nonNegativeInteger(value.vault_writes_committed ?? 0, 'observation.effects.vault_writes_committed'),
    reversible_local_writes: nonNegativeInteger(value.reversible_local_writes ?? 0, 'observation.effects.reversible_local_writes'),
    authority_upgrade_observed: exactBoolean(value.authority_upgrade_observed ?? false, 'observation.effects.authority_upgrade_observed')
  });
}

export function compilePedagoguePracticeFixture(input) {
  if (!input || input.schema !== PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA) throw new Error(`Expected ${PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA}.`);
  if (input.fictional !== true) throw new Error('Practice fixture content must be manifestly fictional.');

  const expectedRoute = normalizeRoute(input.expected_route_steps, 'expected_route_steps');
  const expectedEndpoint = boundedText(input.expected_endpoint || expectedRoute.at(-1), 'expected_endpoint', 160);

  return deepFreeze({
    schema: PEDAGOGUE_PRACTICE_FIXTURE_SCHEMA,
    fixture_id: boundedText(input.fixture_id, 'fixture_id', 160),
    surface_reference: boundedText(input.surface_reference, 'surface_reference', 200),
    label: boundedText(input.label || input.fixture_id, 'label', 200),
    fictional: true,
    expected_route_steps: expectedRoute,
    expected_endpoint: expectedEndpoint,
    ground_truth: normalizeGroundTruth(input.ground_truth),
    allowed_effects: normalizeAllowedEffects(input.allowed_effects),
    authority: normalizeAuthority(input.authority),
    claim_ceiling: deepFreeze({
      known_ground_truth_route: true,
      calibration_phantom: true,
      evidence_claim: false,
      user_diagnosis: false,
      differential_geometric_tomography_claim: false,
      geometric_holonomy_claim: false,
      transport_law_declared: false
    })
  });
}

export function evaluatePedagoguePracticeObservation(fixtureInput, observation) {
  const fixture = compilePedagoguePracticeFixture(fixtureInput);
  if (!observation || observation.schema !== PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA) throw new Error(`Expected ${PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA}.`);

  const observedRoute = normalizeRoute(observation.observed_route_steps, 'observed_route_steps');
  const observedEndpoint = boundedText(observation.observed_endpoint || observedRoute.at(-1), 'observed_endpoint', 160);
  const effects = normalizeObservedEffects(observation.effects);
  const routeComparison = comparePedagogueRouteMemory(
    fixture.expected_route_steps,
    observedRoute,
    { expectedEndpoint: fixture.expected_endpoint, observedEndpoint }
  );

  const negativeGuarantees = deepFreeze({
    no_evidence_fabrication: effects.evidence_records_created === 0,
    no_automatic_retrieval: effects.retrieval_requests_started === 0,
    no_external_mutation: effects.external_mutations_committed === 0,
    no_vault_write: effects.vault_writes_committed === 0,
    no_authority_upgrade: effects.authority_upgrade_observed === false,
    reversible_local_writes_within_declared_bound: effects.reversible_local_writes <= fixture.allowed_effects.reversible_local_writes_max
  });
  const negativeGuaranteesPreserved = Object.values(negativeGuarantees).every(Boolean);
  const routeCertified = routeComparison.exact_route_match === true && routeComparison.endpoint_equivalent === true;
  const certified = routeCertified && negativeGuaranteesPreserved;

  return deepFreeze({
    schema: PEDAGOGUE_PRACTICE_REPORT_SCHEMA,
    fixture_id: fixture.fixture_id,
    surface_reference: fixture.surface_reference,
    fixture,
    observation: {
      schema: PEDAGOGUE_PRACTICE_OBSERVATION_SCHEMA,
      observed_route_steps: observedRoute,
      observed_endpoint: observedEndpoint,
      effects
    },
    route_comparison: routeComparison,
    negative_guarantees: negativeGuarantees,
    route_certified: routeCertified,
    negative_guarantees_preserved: negativeGuaranteesPreserved,
    certified,
    tomography: {
      model: 'KNOWN_GROUND_TRUTH_ROUTE_RECONSTRUCTION_SURROGATE',
      calibration_phantom: true,
      route_reconstruction_error_millipoints: routeComparison.route_divergence_millipoints,
      endpoint_equivalent: routeComparison.endpoint_equivalent,
      exact_route_match: routeComparison.exact_route_match,
      same_endpoint_not_same_route: routeComparison.same_endpoint_not_same_history,
      comparative_route_memory_only: true,
      differential_geometric_tomography_claim: false,
      geometric_holonomy_claim: false,
      transport_law_declared: false
    },
    child_legible: {
      now: certified ? 'Practice route matched the expected path without acquiring real authority.' : 'Practice route needs review before it can be trusted as a calibration witness.',
      why: !negativeGuaranteesPreserved
        ? 'The practice case produced an effect outside its declared harmless boundary.'
        : routeComparison.exact_route_match
          ? 'The fictional case followed the expected real route.'
          : 'The fictional case reached the workspace by a different route.',
      exact: `Route reconstruction error: ${routeComparison.route_divergence_millipoints}/1000. Evidence records: ${effects.evidence_records_created}. Retrievals: ${effects.retrieval_requests_started}. External mutations: ${effects.external_mutations_committed}.`
    },
    authority: CLOSED_AUTHORITY
  });
}
