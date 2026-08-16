import { canonicalJson } from '../dome-world/ash/canonical-json.js';

export const PEDAGOGUE_ROUTE_MEMORY_SCHEMA = 'td613.flowcore.pedagogue-route-memory/v0.1';
export const PEDAGOGUE_ROUTE_COMPARISON_SCHEMA = 'td613.flowcore.pedagogue-route-comparison/v0.1';

function boundedToken(value, label) {
  const text = String(value ?? '').trim();
  if (!text || text.length > 160) throw new TypeError(`${label} must be a bounded non-empty route token.`);
  return text;
}

function stepToken(step, index) {
  if (typeof step === 'string') return boundedToken(step, `route[${index}]`);
  if (!step || typeof step !== 'object' || Array.isArray(step)) throw new TypeError(`route[${index}] must be a string or route-step object.`);
  return boundedToken(step.step_id || step.phase || step.label || step.id, `route[${index}]`);
}

function normalizeRoute(route, label) {
  if (!Array.isArray(route) || !route.length) throw new TypeError(`${label} must contain at least one route step.`);
  return route.map(stepToken);
}

function levenshtein(left, right) {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let col = 0; col < cols; col += 1) matrix[0][col] = col;
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitution = matrix[row - 1][col - 1] + (left[row - 1] === right[col - 1] ? 0 : 1);
      const deletion = matrix[row - 1][col] + 1;
      const insertion = matrix[row][col - 1] + 1;
      matrix[row][col] = Math.min(substitution, deletion, insertion);
    }
  }
  return matrix[left.length][right.length];
}

function commonPrefixLength(left, right) {
  const limit = Math.min(left.length, right.length);
  let count = 0;
  while (count < limit && left[count] === right[count]) count += 1;
  return count;
}

function commonSuffixLength(left, right, prefixLength) {
  const limit = Math.min(left.length, right.length) - prefixLength;
  let count = 0;
  while (count < limit && left[left.length - 1 - count] === right[right.length - 1 - count]) count += 1;
  return count;
}

export function compilePedagogueRouteMemory(route, { endpoint = null } = {}) {
  const steps = normalizeRoute(route, 'route');
  const declaredEndpoint = boundedToken(endpoint || steps.at(-1), 'endpoint');
  return Object.freeze({
    schema: PEDAGOGUE_ROUTE_MEMORY_SCHEMA,
    steps: Object.freeze([...steps]),
    endpoint: declaredEndpoint,
    step_count: steps.length,
    route_projection: canonicalJson({ steps, endpoint: declaredEndpoint }),
    user_level_score: null,
    diagnostic_claim: null,
    authority: Object.freeze({
      endpoint_equivalence_grants_authority: false,
      automatic_redesign: false,
      automatic_release: false,
      human_closure_required: true
    })
  });
}

export function comparePedagogueRouteMemory(expectedRoute, observedRoute, {
  expectedEndpoint = null,
  observedEndpoint = null
} = {}) {
  const expected = compilePedagogueRouteMemory(expectedRoute, { endpoint: expectedEndpoint });
  const observed = compilePedagogueRouteMemory(observedRoute, { endpoint: observedEndpoint });
  const exactHistoryMatch = expected.route_projection === observed.route_projection;
  const endpointEquivalent = expected.endpoint === observed.endpoint;
  const prefix = commonPrefixLength(expected.steps, observed.steps);
  const suffix = commonSuffixLength(expected.steps, observed.steps, prefix);
  const editDistance = levenshtein(expected.steps, observed.steps);
  const divergence = [];
  const max = Math.max(expected.steps.length, observed.steps.length);
  for (let index = 0; index < max; index += 1) {
    if (expected.steps[index] !== observed.steps[index]) {
      divergence.push(Object.freeze({
        index,
        expected: expected.steps[index] || null,
        observed: observed.steps[index] || null
      }));
    }
  }
  const posture = exactHistoryMatch
    ? 'EXACT_ROUTE_MEMORY'
    : endpointEquivalent
      ? 'NON_EQUIVALENT_HISTORY_SAME_ENDPOINT'
      : 'NON_EQUIVALENT_HISTORY_DIFFERENT_ENDPOINT';
  return Object.freeze({
    schema: PEDAGOGUE_ROUTE_COMPARISON_SCHEMA,
    expected,
    observed,
    endpoint_equivalent: endpointEquivalent,
    exact_route_match: exactHistoryMatch,
    same_endpoint_not_same_history: endpointEquivalent && !exactHistoryMatch,
    edit_distance_steps: editDistance,
    common_prefix_steps: prefix,
    common_suffix_steps: suffix,
    first_divergence_index: divergence.length ? divergence[0].index : null,
    deltas: Object.freeze(divergence),
    route_holonomy_posture: posture,
    child_legible: Object.freeze({
      now: exactHistoryMatch ? 'The route arrived by the expected path.' : 'The route arrived by a different path.',
      why: endpointEquivalent && !exactHistoryMatch
        ? 'The destination matches, but the path still matters.'
        : endpointEquivalent
          ? 'The destination and path both match.'
          : 'The destination and the path differ.',
      exact: divergence.length
        ? `First route difference: step ${divergence[0].index + 1}.`
        : 'No route difference was observed.'
    }),
    authority: Object.freeze({
      same_endpoint_grants_authority: false,
      route_history_may_be_discarded: false,
      automatic_redesign: false,
      automatic_release: false,
      human_closure_required: true
    })
  });
}
