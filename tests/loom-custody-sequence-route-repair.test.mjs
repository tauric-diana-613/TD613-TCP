import assert from 'node:assert/strict';
import {
  LOOM_CUSTODY_SEQUENCE_SCHEMA,
  compileLoomCustodySequence,
  expandLoomCustodySequence,
  compareLoomCustodySequences
} from '../server/loom-custody-sequence-route.js';

const canonical = {
  task: 'Compare the selected incident record without collapsing route history into endpoint equality.',
  documents: [
    { id: 'incident', name: 'incident.txt', text: 'The selected payload is identical in both route trials.' }
  ],
  rules: [
    'Preserve source provenance separately from path provenance.',
    'Preserve custody history even when the visible endpoint matches.'
  ]
};

const sourceProvenance = {
  producer: 'HOLONOMY_LOOM',
  selected_input_binding: 'ORIGIN_SELF_ATTESTED'
};

const baseRoute = ['prepared', 'checking', 'pending', 'received', 'completed'];
const scarredRoute = ['prepared', 'checking', 'pending', 'cancelled-peer-attempt', 'received', 'completed'];

const basePathProvenance = {
  route_id: 'route-base',
  cancelled_attempts: []
};
const scarredPathProvenance = {
  route_id: 'route-scarred',
  cancelled_attempts: ['peer-attempt-cancelled-before-receipt']
};

const baseCustody = {
  posture: 'RESEARCH_ONLY',
  holder: 'ORIGIN_OPERATOR',
  release_authority: false,
  cancellation_provenance: []
};
const scarredCustody = {
  posture: 'RESEARCH_ONLY',
  holder: 'ORIGIN_OPERATOR',
  release_authority: false,
  cancellation_provenance: ['peer-attempt-cancelled-before-receipt']
};

const left = compileLoomCustodySequence(canonical, {
  profile: 'quick',
  route: baseRoute,
  endpoint: 'completed',
  sourceProvenance,
  pathProvenance: basePathProvenance,
  custodyReceipt: baseCustody
});
const right = compileLoomCustodySequence(canonical, {
  profile: 'quick',
  route: scarredRoute,
  endpoint: 'completed',
  sourceProvenance,
  pathProvenance: scarredPathProvenance,
  custodyReceipt: scarredCustody
});

assert.equal(left.schema, LOOM_CUSTODY_SEQUENCE_SCHEMA);
assert.equal(right.schema, LOOM_CUSTODY_SEQUENCE_SCHEMA);
assert.deepEqual(left.semantic, right.semantic, 'semantic target equality is expected in the hostile same-payload control');
assert.notDeepEqual(left.route_memory, right.route_memory, 'route history must remain outside the semantic quotient');
assert.notDeepEqual(left.path_provenance, right.path_provenance, 'path provenance must remain outside the semantic quotient');
assert.notDeepEqual(left.custody_receipt, right.custody_receipt, 'custody history must remain outside the semantic quotient');

const expanded = expandLoomCustodySequence(right);
assert.deepEqual(expanded.canonical, canonical, 'semantic payload must still round-trip exactly');
assert.deepEqual(expanded.route, scarredRoute, 'ordered route history must round-trip exactly');
assert.equal(expanded.endpoint, 'completed');
assert.deepEqual(expanded.source_provenance, sourceProvenance);
assert.deepEqual(expanded.path_provenance, scarredPathProvenance);
assert.deepEqual(expanded.custody_receipt, scarredCustody);

const comparison = compareLoomCustodySequences(left, right);
assert.equal(comparison.semantic_target_equal, true);
assert.equal(comparison.endpoint_equal, true);
assert.equal(comparison.route_history_equal, false);
assert.equal(comparison.source_provenance_equal, true);
assert.equal(comparison.path_provenance_equal, false);
assert.equal(comparison.custody_equal, false);
assert.equal(comparison.transport_equal, false);
assert.equal(comparison.same_target_not_same_transport, true);
assert.equal(comparison.route_comparison.same_endpoint_not_same_history, true);
assert.ok(comparison.route_comparison.route_divergence_millipoints > 0);
assert.equal(comparison.authority.target_equality_grants_transport_equality, false);
assert.equal(comparison.authority.route_history_may_be_discarded, false);
assert.equal(comparison.authority.custody_may_be_quotiented, false);

const identical = compareLoomCustodySequences(left, structuredClone(left));
assert.equal(identical.semantic_target_equal, true);
assert.equal(identical.route_history_equal, true);
assert.equal(identical.transport_equal, true);
assert.equal(identical.same_target_not_same_transport, false);

// Wrapper-comparison scar: naked semantic representatives are not transport representatives.
assert.throws(
  () => compareLoomCustodySequences(left.semantic, right),
  /custody sequence envelope/i,
  'A compact semantic representative must not be admitted as a transport/custody representative.'
);

// Malformed-representative control: custody/source/path are mandatory for this transport assay.
assert.throws(
  () => compileLoomCustodySequence(canonical, {
    profile: 'quick', route: baseRoute, endpoint: 'completed', sourceProvenance, pathProvenance: basePathProvenance
  }),
  /custody receipt.*required/i
);
assert.throws(
  () => compileLoomCustodySequence(canonical, {
    profile: 'quick', route: baseRoute, endpoint: 'completed', sourceProvenance, custodyReceipt: baseCustody
  }),
  /path provenance.*required/i
);

// Historical-path hardening scar: caller mutation after compilation must not rewrite retained history.
const mutableRoute = [...baseRoute];
const mutablePath = structuredClone(basePathProvenance);
const mutableCustody = structuredClone(baseCustody);
const hardened = compileLoomCustodySequence(canonical, {
  profile: 'deep',
  route: mutableRoute,
  endpoint: 'completed',
  sourceProvenance,
  pathProvenance: mutablePath,
  custodyReceipt: mutableCustody
});
mutableRoute.splice(3, 0, 'late-injected-step');
mutablePath.route_id = 'mutated-after-compile';
mutableCustody.release_authority = true;
assert.deepEqual(expandLoomCustodySequence(hardened).route, baseRoute);
assert.equal(hardened.path_provenance.route_id, 'route-base');
assert.equal(hardened.custody_receipt.release_authority, false);
assert.equal(Object.isFrozen(hardened.route_memory.steps), true);
assert.equal(Object.isFrozen(hardened.path_provenance), true);
assert.equal(Object.isFrozen(hardened.custody_receipt), true);

// Cancelled-concurrency provenance remains a first-class historical scar even after the same endpoint is reached.
assert.equal(right.route_memory.steps.includes('cancelled-peer-attempt'), true);
assert.deepEqual(right.path_provenance.cancelled_attempts, ['peer-attempt-cancelled-before-receipt']);
assert.deepEqual(right.custody_receipt.cancellation_provenance, ['peer-attempt-cancelled-before-receipt']);

console.log('Loom custody-preserving sequence route-to-repair preregistration passed.');
