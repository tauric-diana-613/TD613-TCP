import assert from 'node:assert/strict';
import {
  compileLoomCustodySequence,
  compareLoomCustodySequences
} from '../server/loom-custody-sequence-route.js';
import {
  HOLONOMY_SPEC_HEAD,
  LOOP_PATHS,
  PATH_GROUPOID_HOLONOMY_SCHEMA,
  runPathGroupoidDiscreteHolonomyAssay
} from '../app/dome-world/previews/a15-r0/path-groupoid-discrete-holonomy-representation.js';
import {
  LOOM_CUSTODY_FORMAL_TRANSPORT_BRIDGE_SCHEMA,
  bindLoomCustodySequenceToFormalTransport,
  compareLoomCustodyFormalTransportBindings
} from '../server/loom-custody-formal-transport-bridge.js';

const canonical = {
  task: 'Bind custody-preserving operational history to an already-earned formal transport object without inferring one from the other.',
  documents: [
    {
      id: 'route-record',
      name: 'route-record.txt',
      text: 'The visible semantic payload may agree while custody route history and formal transport path remain distinct typed surfaces.'
    }
  ],
  rules: [
    'Custody route memory is not a mathematical transport path.',
    'A formal transport reference must be explicit and source-bound.',
    'No physical, curvature, or empirical mapping authority follows from a repository-local bridge.'
  ]
};

const sourceProvenance = {
  producer: 'HOLONOMY_LOOM',
  selected_input_binding: 'ORIGIN_SELF_ATTESTED'
};

const baseRoute = ['prepared', 'checking', 'pending', 'received', 'completed'];
const scarredRoute = ['prepared', 'checking', 'pending', 'cancelled-peer-attempt', 'received', 'completed'];

const base = compileLoomCustodySequence(canonical, {
  profile: 'quick',
  route: baseRoute,
  endpoint: 'completed',
  sourceProvenance,
  pathProvenance: {
    route_id: 'operational-route-base',
    cancelled_attempts: []
  },
  custodyReceipt: {
    posture: 'RESEARCH_ONLY',
    holder: 'ORIGIN_OPERATOR',
    release_authority: false,
    cancellation_provenance: []
  }
});

const scarred = compileLoomCustodySequence(canonical, {
  profile: 'quick',
  route: scarredRoute,
  endpoint: 'completed',
  sourceProvenance,
  pathProvenance: {
    route_id: 'operational-route-scarred',
    cancelled_attempts: ['peer-attempt-cancelled-before-receipt']
  },
  custodyReceipt: {
    posture: 'RESEARCH_ONLY',
    holder: 'ORIGIN_OPERATOR',
    release_authority: false,
    cancellation_provenance: ['peer-attempt-cancelled-before-receipt']
  }
});

const custodyComparison = compareLoomCustodySequences(base, scarred);
assert.equal(custodyComparison.semantic_target_equal, true);
assert.equal(custodyComparison.endpoint_equal, true);
assert.equal(custodyComparison.route_history_equal, false);
assert.equal(custodyComparison.transport_equal, false);

const formalAssay = runPathGroupoidDiscreteHolonomyAssay();
assert.equal(formalAssay.schema, PATH_GROUPOID_HOLONOMY_SCHEMA);
assert.equal(formalAssay.spec_head, HOLONOMY_SPEC_HEAD);
assert.equal(formalAssay.source_status, 'SIMULATED');
assert.equal(formalAssay.findings.assay_mechanism_validated, true);
assert.equal(formalAssay.claims.physical_holonomy, false);
assert.equal(formalAssay.claims.physical_curvature, false);

const baseBinding = bindLoomCustodySequenceToFormalTransport(base, {
  formalTransportRef: {
    schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
    spec_head: HOLONOMY_SPEC_HEAD,
    loop_id: 'gamma1',
    edge_path: [...LOOP_PATHS.gamma1],
    source_status: 'SIMULATED'
  },
  relationBasis: {
    evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
    relation_id: 'custody-base-to-gamma1',
    empirical_mapping_observed: false
  }
});

const scarredBinding = bindLoomCustodySequenceToFormalTransport(scarred, {
  formalTransportRef: {
    schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
    spec_head: HOLONOMY_SPEC_HEAD,
    loop_id: 'gamma2',
    edge_path: [...LOOP_PATHS.gamma2],
    source_status: 'SIMULATED'
  },
  relationBasis: {
    evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
    relation_id: 'custody-scarred-to-gamma2',
    empirical_mapping_observed: false
  }
});

assert.equal(baseBinding.schema, LOOM_CUSTODY_FORMAL_TRANSPORT_BRIDGE_SCHEMA);
assert.equal(scarredBinding.schema, LOOM_CUSTODY_FORMAL_TRANSPORT_BRIDGE_SCHEMA);
assert.deepEqual(baseBinding.custody_sequence.route_memory.steps, baseRoute);
assert.deepEqual(scarredBinding.custody_sequence.route_memory.steps, scarredRoute);
assert.deepEqual(baseBinding.formal_transport.edge_path, LOOP_PATHS.gamma1);
assert.deepEqual(scarredBinding.formal_transport.edge_path, LOOP_PATHS.gamma2);
assert.deepEqual(baseBinding.formal_transport.operator, formalAssay.loops.gamma1.operator);
assert.deepEqual(scarredBinding.formal_transport.operator, formalAssay.loops.gamma2.operator);
assert.notDeepEqual(baseBinding.formal_transport.operator, scarredBinding.formal_transport.operator);

for (const binding of [baseBinding, scarredBinding]) {
  assert.equal(binding.relation_basis.evidence_class, 'AUTHORED_FIXTURE_RELATION_ONLY');
  assert.equal(binding.relation_basis.empirical_mapping_observed, false);
  assert.equal(binding.authority.mapping_inferred_from_custody_route, false);
  assert.equal(binding.authority.custody_route_is_formal_transport_path, false);
  assert.equal(binding.authority.formal_transport_path_is_custody_route, false);
  assert.equal(binding.authority.bridge_grants_empirical_mapping, false);
  assert.equal(binding.authority.bridge_grants_physical_holonomy, false);
  assert.equal(binding.authority.bridge_grants_curvature, false);
  assert.equal(binding.authority.bridge_grants_external_execution, false);
  assert.equal(binding.formal_transport.source_status, 'SIMULATED');
}

const comparison = compareLoomCustodyFormalTransportBindings(baseBinding, scarredBinding);
assert.equal(comparison.semantic_target_equal, true);
assert.equal(comparison.custody_endpoint_equal, true);
assert.equal(comparison.custody_route_history_equal, false);
assert.equal(comparison.formal_transport_path_equal, false);
assert.equal(comparison.formal_transport_operator_equal, false);
assert.equal(comparison.same_semantic_target_same_custody_endpoint_distinct_formal_transport, true);
assert.equal(comparison.bridge_transport_equal, false);
assert.equal(comparison.authority.same_endpoint_grants_same_formal_transport, false);
assert.equal(comparison.authority.custody_route_history_grants_formal_operator, false);
assert.equal(comparison.authority.formal_operator_grants_empirical_route_mapping, false);

// The exact same custody sequence may be explicitly related to a different formal loop,
// proving that operational route memory and formal transport path are separate typed coordinates.
const baseToGamma2 = bindLoomCustodySequenceToFormalTransport(base, {
  formalTransportRef: {
    schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
    spec_head: HOLONOMY_SPEC_HEAD,
    loop_id: 'gamma2',
    edge_path: [...LOOP_PATHS.gamma2],
    source_status: 'SIMULATED'
  },
  relationBasis: {
    evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
    relation_id: 'same-custody-different-explicit-formal-ref',
    empirical_mapping_observed: false
  }
});
const sameCustodyDifferentFormal = compareLoomCustodyFormalTransportBindings(baseBinding, baseToGamma2);
assert.equal(sameCustodyDifferentFormal.custody_route_history_equal, true);
assert.equal(sameCustodyDifferentFormal.formal_transport_path_equal, false);
assert.equal(sameCustodyDifferentFormal.formal_transport_operator_equal, false);
assert.equal(sameCustodyDifferentFormal.bridge_transport_equal, false);

// Hostile control: the bridge must never infer a formal operator from custody-route tokens.
const coincidentalEdgeTokens = compileLoomCustodySequence(canonical, {
  profile: 'deep',
  route: ['AB', 'BC', 'CA'],
  endpoint: 'CA',
  sourceProvenance,
  pathProvenance: { route_id: 'coincidental-edge-token-route', cancelled_attempts: [] },
  custodyReceipt: {
    posture: 'RESEARCH_ONLY',
    holder: 'ORIGIN_OPERATOR',
    release_authority: false,
    cancellation_provenance: []
  }
});
assert.throws(
  () => bindLoomCustodySequenceToFormalTransport(coincidentalEdgeTokens, {
    inferFromCustodyRoute: true,
    relationBasis: {
      evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
      relation_id: 'forbidden-route-token-inference',
      empirical_mapping_observed: false
    }
  }),
  /explicit formal transport reference.*required|infer.*custody route.*forbidden/i
);

// Hostile control: loop identity and ordered edge path must bind to the canonical formal assay.
assert.throws(
  () => bindLoomCustodySequenceToFormalTransport(base, {
    formalTransportRef: {
      schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
      spec_head: HOLONOMY_SPEC_HEAD,
      loop_id: 'gamma1',
      edge_path: [...LOOP_PATHS.gamma2],
      source_status: 'SIMULATED'
    },
    relationBasis: {
      evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
      relation_id: 'mismatched-path',
      empirical_mapping_observed: false
    }
  }),
  /formal transport path.*canonical loop|edge path.*mismatch/i
);

assert.throws(
  () => bindLoomCustodySequenceToFormalTransport(base, {
    formalTransportRef: {
      schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
      spec_head: 'wrong-spec-head',
      loop_id: 'gamma1',
      edge_path: [...LOOP_PATHS.gamma1],
      source_status: 'SIMULATED'
    },
    relationBasis: {
      evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
      relation_id: 'wrong-spec',
      empirical_mapping_observed: false
    }
  }),
  /spec head.*mismatch|formal transport reference.*canonical/i
);

assert.throws(
  () => bindLoomCustodySequenceToFormalTransport(base.semantic, {
    formalTransportRef: {
      schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
      spec_head: HOLONOMY_SPEC_HEAD,
      loop_id: 'gamma1',
      edge_path: [...LOOP_PATHS.gamma1],
      source_status: 'SIMULATED'
    },
    relationBasis: {
      evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
      relation_id: 'naked-semantic-wrapper',
      empirical_mapping_observed: false
    }
  }),
  /custody sequence envelope/i
);

// Historical hardening: caller mutation after bridge compilation cannot rewrite either side.
const mutableFormalPath = [...LOOP_PATHS.gamma1];
const mutableBasis = {
  evidence_class: 'AUTHORED_FIXTURE_RELATION_ONLY',
  relation_id: 'mutation-hardening',
  empirical_mapping_observed: false
};
const hardened = bindLoomCustodySequenceToFormalTransport(base, {
  formalTransportRef: {
    schema: PATH_GROUPOID_HOLONOMY_SCHEMA,
    spec_head: HOLONOMY_SPEC_HEAD,
    loop_id: 'gamma1',
    edge_path: mutableFormalPath,
    source_status: 'SIMULATED'
  },
  relationBasis: mutableBasis
});
mutableFormalPath[0] = 'DA';
mutableBasis.relation_id = 'mutated-after-bind';
mutableBasis.empirical_mapping_observed = true;
assert.deepEqual(hardened.formal_transport.edge_path, LOOP_PATHS.gamma1);
assert.equal(hardened.relation_basis.relation_id, 'mutation-hardening');
assert.equal(hardened.relation_basis.empirical_mapping_observed, false);
assert.equal(Object.isFrozen(hardened.formal_transport.edge_path), true);
assert.equal(Object.isFrozen(hardened.relation_basis), true);
assert.equal(Object.isFrozen(hardened.custody_sequence), true);

console.log('Loom custody-to-formal-transport bridge preregistration passed.');
