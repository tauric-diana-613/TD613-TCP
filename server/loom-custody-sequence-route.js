import {
  compileLoomPlatformEnvelope,
  expandLoomPlatformEnvelope
} from './loom-platform-semantic-compiler.js';

export const LOOM_CUSTODY_SEQUENCE_SCHEMA = 'td613.loom.platform-custody-sequence/v0.1';

const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype;
const nonemptyText = (value, max = 240) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (plainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneValue(child)]));
  return value;
}

function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const frozenClone = value => deepFreeze(cloneValue(value));

function requireRoute(route, endpoint) {
  if (!Array.isArray(route) || route.length === 0 || Object.keys(route).length !== route.length
    || !route.every(step => nonemptyText(step, 120))) {
    throw new TypeError('ordered route history is required');
  }
  if (!nonemptyText(endpoint, 120)) throw new TypeError('route endpoint is required');
  if (route.at(-1) !== endpoint) throw new TypeError('route endpoint must equal the final ordered route step');
}

function requireRecord(value, label) {
  if (!plainObject(value)) throw new TypeError(`${label} is required`);
}

function requireCustodySequence(sequence) {
  if (!plainObject(sequence) || sequence.schema !== LOOM_CUSTODY_SEQUENCE_SCHEMA) {
    throw new TypeError('custody sequence envelope is required');
  }
  if (!plainObject(sequence.semantic) || !plainObject(sequence.route_memory)) {
    throw new TypeError('custody sequence envelope is malformed');
  }
  requireRoute(sequence.route_memory.steps, sequence.route_memory.endpoint);
  requireRecord(sequence.source_provenance, 'source provenance');
  requireRecord(sequence.path_provenance, 'path provenance');
  requireRecord(sequence.custody_receipt, 'custody receipt');
  // Delegates semantic validation to the already-earned reversible compiler.
  expandLoomPlatformEnvelope(sequence.semantic);
  return sequence;
}

export function compileLoomCustodySequence(canonical, options = {}) {
  const {
    profile,
    route,
    endpoint,
    sourceProvenance,
    pathProvenance,
    custodyReceipt
  } = options;
  requireRoute(route, endpoint);
  requireRecord(sourceProvenance, 'source provenance');
  requireRecord(pathProvenance, 'path provenance');
  requireRecord(custodyReceipt, 'custody receipt');
  const semantic = compileLoomPlatformEnvelope(canonical, { profile });
  return deepFreeze({
    schema: LOOM_CUSTODY_SEQUENCE_SCHEMA,
    semantic: cloneValue(semantic),
    route_memory: { endpoint, steps: cloneValue(route) },
    source_provenance: cloneValue(sourceProvenance),
    path_provenance: cloneValue(pathProvenance),
    custody_receipt: cloneValue(custodyReceipt)
  });
}

export function expandLoomCustodySequence(sequence) {
  requireCustodySequence(sequence);
  return {
    canonical: expandLoomPlatformEnvelope(sequence.semantic),
    route: cloneValue(sequence.route_memory.steps),
    endpoint: sequence.route_memory.endpoint,
    source_provenance: cloneValue(sequence.source_provenance),
    path_provenance: cloneValue(sequence.path_provenance),
    custody_receipt: cloneValue(sequence.custody_receipt)
  };
}

function normalized(value) {
  if (Array.isArray(value)) return value.map(normalized);
  if (plainObject(value)) {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalized(value[key])]));
  }
  return value;
}

const equal = (left, right) => JSON.stringify(normalized(left)) === JSON.stringify(normalized(right));

function lcsLength(left, right) {
  let previous = new Array(right.length + 1).fill(0);
  for (const leftValue of left) {
    const current = new Array(right.length + 1).fill(0);
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = leftValue === right[column - 1]
        ? previous[column - 1] + 1
        : Math.max(previous[column], current[column - 1]);
    }
    previous = current;
  }
  return previous[right.length];
}

function routeDivergenceMillipoints(left, right) {
  const shared = lcsLength(left, right);
  const edits = left.length + right.length - (2 * shared);
  const denominator = Math.max(1, left.length + right.length);
  return Math.round((edits / denominator) * 1000);
}

export function compareLoomCustodySequences(left, right) {
  requireCustodySequence(left);
  requireCustodySequence(right);
  const leftExpanded = expandLoomCustodySequence(left);
  const rightExpanded = expandLoomCustodySequence(right);
  const semanticTargetEqual = equal(leftExpanded.canonical, rightExpanded.canonical);
  const endpointEqual = leftExpanded.endpoint === rightExpanded.endpoint;
  const routeHistoryEqual = equal(leftExpanded.route, rightExpanded.route);
  const sourceProvenanceEqual = equal(leftExpanded.source_provenance, rightExpanded.source_provenance);
  const pathProvenanceEqual = equal(leftExpanded.path_provenance, rightExpanded.path_provenance);
  const custodyEqual = equal(leftExpanded.custody_receipt, rightExpanded.custody_receipt);
  const transportEqual = semanticTargetEqual && endpointEqual && routeHistoryEqual
    && sourceProvenanceEqual && pathProvenanceEqual && custodyEqual;
  return deepFreeze({
    semantic_target_equal: semanticTargetEqual,
    endpoint_equal: endpointEqual,
    route_history_equal: routeHistoryEqual,
    source_provenance_equal: sourceProvenanceEqual,
    path_provenance_equal: pathProvenanceEqual,
    custody_equal: custodyEqual,
    transport_equal: transportEqual,
    same_target_not_same_transport: semanticTargetEqual && endpointEqual && !transportEqual,
    route_comparison: {
      same_endpoint_not_same_history: endpointEqual && !routeHistoryEqual,
      route_divergence_millipoints: routeDivergenceMillipoints(leftExpanded.route, rightExpanded.route),
      metric_authority: 'ordered-route divergence surrogate; not geometric holonomy'
    },
    authority: {
      target_equality_grants_transport_equality: false,
      route_history_may_be_discarded: false,
      custody_may_be_quotiented: false
    }
  });
}
