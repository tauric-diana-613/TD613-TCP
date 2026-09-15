import {
  expandLoomCustodySequence,
  compareLoomCustodySequences
} from './loom-custody-sequence-route.js';
import {
  PATH_GROUPOID_HOLONOMY_SCHEMA,
  HOLONOMY_SPEC_HEAD,
  LOOP_PATHS,
  runPathGroupoidDiscreteHolonomyAssay
} from '../app/dome-world/previews/a15-r0/path-groupoid-discrete-holonomy-representation.js';

export const LOOM_CUSTODY_FORMAL_TRANSPORT_BRIDGE_SCHEMA = 'td613.loom.custody-formal-transport-bridge/v0.1';

const plainObject = value => value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype;

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (plainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneValue(child)]));
  }
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

function normalized(value) {
  if (Array.isArray(value)) return value.map(normalized);
  if (plainObject(value)) {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalized(value[key])]));
  }
  return value;
}

const equal = (left, right) => JSON.stringify(normalized(left)) === JSON.stringify(normalized(right));

function requireCustodySequence(sequence) {
  try {
    expandLoomCustodySequence(sequence);
  } catch (error) {
    const wrapped = new TypeError(`custody sequence envelope is required: ${error?.message ?? 'invalid custody sequence'}`);
    wrapped.cause = error;
    throw wrapped;
  }
}

function requireFormalTransportRef(ref, assay) {
  if (!plainObject(ref)) {
    throw new TypeError('explicit formal transport reference is required');
  }
  if (ref.schema !== PATH_GROUPOID_HOLONOMY_SCHEMA) {
    throw new TypeError('formal transport reference schema does not match the canonical path-groupoid assay');
  }
  if (ref.spec_head !== HOLONOMY_SPEC_HEAD) {
    throw new TypeError('formal transport reference spec head mismatch with canonical assay');
  }
  if (ref.source_status !== 'SIMULATED') {
    throw new TypeError('formal transport reference source status must remain SIMULATED');
  }
  if (typeof ref.loop_id !== 'string' || !Object.hasOwn(assay.loops, ref.loop_id)) {
    throw new TypeError('formal transport reference loop id is not present in the canonical assay');
  }
  if (!Object.hasOwn(LOOP_PATHS, ref.loop_id)) {
    throw new TypeError('formal transport reference loop id lacks a canonical loop path');
  }
  if (!Array.isArray(ref.edge_path) || !equal(ref.edge_path, LOOP_PATHS[ref.loop_id])) {
    throw new TypeError('formal transport path must match the canonical loop edge path');
  }
}

function requireRelationBasis(basis) {
  if (!plainObject(basis)) throw new TypeError('relation basis is required');
  if (basis.evidence_class !== 'AUTHORED_FIXTURE_RELATION_ONLY') {
    throw new TypeError('relation basis evidence class must remain AUTHORED_FIXTURE_RELATION_ONLY');
  }
  if (typeof basis.relation_id !== 'string' || basis.relation_id.trim().length === 0) {
    throw new TypeError('relation basis id is required');
  }
  if (basis.empirical_mapping_observed !== false) {
    throw new TypeError('relation basis may not claim an observed empirical mapping');
  }
}

function requireBridge(binding) {
  if (!plainObject(binding) || binding.schema !== LOOM_CUSTODY_FORMAL_TRANSPORT_BRIDGE_SCHEMA) {
    throw new TypeError('custody-to-formal-transport bridge envelope is required');
  }
  requireCustodySequence(binding.custody_sequence);
  if (!plainObject(binding.formal_transport)) {
    throw new TypeError('bridge formal transport record is required');
  }
  if (!plainObject(binding.relation_basis)) {
    throw new TypeError('bridge relation basis is required');
  }
  if (!plainObject(binding.authority)) {
    throw new TypeError('bridge authority record is required');
  }
  return binding;
}

export function bindLoomCustodySequenceToFormalTransport(sequence, options = {}) {
  if (options?.inferFromCustodyRoute === true) {
    throw new TypeError('Inference from custody route is forbidden; explicit formal transport reference is required.');
  }

  requireCustodySequence(sequence);

  const assay = runPathGroupoidDiscreteHolonomyAssay();
  if (assay.schema !== PATH_GROUPOID_HOLONOMY_SCHEMA
    || assay.spec_head !== HOLONOMY_SPEC_HEAD
    || assay.source_status !== 'SIMULATED'
    || assay.findings?.assay_mechanism_validated !== true
    || assay.claims?.physical_holonomy !== false
    || assay.claims?.physical_curvature !== false) {
    throw new TypeError('canonical formal transport assay failed its bounded source/authority contract');
  }

  const formalTransportRef = options?.formalTransportRef;
  const relationBasis = options?.relationBasis;
  requireFormalTransportRef(formalTransportRef, assay);
  requireRelationBasis(relationBasis);

  const loop = assay.loops[formalTransportRef.loop_id];

  return deepFreeze({
    schema: LOOM_CUSTODY_FORMAL_TRANSPORT_BRIDGE_SCHEMA,
    custody_sequence: cloneValue(sequence),
    formal_transport: {
      schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
      spec_head: HOLONOMY_SPEC_HEAD,
      loop_id: formalTransportRef.loop_id,
      edge_path: cloneValue(LOOP_PATHS[formalTransportRef.loop_id]),
      operator: cloneValue(loop.operator),
      source_status: 'SIMULATED'
    },
    relation_basis: cloneValue(relationBasis),
    authority: {
      mapping_inferred_from_custody_route: false,
      custody_route_is_formal_transport_path: false,
      formal_transport_path_is_custody_route: false,
      bridge_grants_empirical_mapping: false,
      bridge_grants_physical_holonomy: false,
      bridge_grants_curvature: false,
      bridge_grants_external_execution: false
    }
  });
}

export function compareLoomCustodyFormalTransportBindings(left, right) {
  requireBridge(left);
  requireBridge(right);

  const custody = compareLoomCustodySequences(left.custody_sequence, right.custody_sequence);
  const formalTransportPathEqual = equal(left.formal_transport.edge_path, right.formal_transport.edge_path);
  const formalTransportOperatorEqual = equal(left.formal_transport.operator, right.formal_transport.operator);
  const formalTransportEqual = formalTransportPathEqual && formalTransportOperatorEqual;

  return deepFreeze({
    semantic_target_equal: custody.semantic_target_equal,
    custody_endpoint_equal: custody.endpoint_equal,
    custody_route_history_equal: custody.route_history_equal,
    formal_transport_path_equal: formalTransportPathEqual,
    formal_transport_operator_equal: formalTransportOperatorEqual,
    same_semantic_target_same_custody_endpoint_distinct_formal_transport:
      custody.semantic_target_equal && custody.endpoint_equal && !formalTransportEqual,
    bridge_transport_equal: custody.transport_equal && formalTransportEqual,
    authority: {
      same_endpoint_grants_same_formal_transport: false,
      custody_route_history_grants_formal_operator: false,
      formal_operator_grants_empirical_route_mapping: false
    }
  });
}
