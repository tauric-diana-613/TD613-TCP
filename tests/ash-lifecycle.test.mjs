import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ASH_LIFECYCLE_STATES,
  buildCustodyRoot,
  compileLifecycleReceipt,
  compileReadinessReceipt,
  deriveAshLifecycle,
  workspaceGate
} from '../app/engine/ash-lifecycle.js';

const readiness = await compileReadinessReceipt({
  observedAt: '2026-07-14T00:00:00.000Z',
  sourceSurface: 'test-threshold',
  artifactClass: 'archive-fragment',
  arrivalAcknowledged: true,
  boundaryAcknowledged: true,
  custodyAcknowledged: true
});

const custodyReceipt = {
  schema: 'td613.ash.custody-receipt/v0.8',
  receipt_id: 'ash_receipt_test_root',
  manifest_digest: `sha256:${'a'.repeat(64)}`,
  receipt_digest: `sha256:${'b'.repeat(64)}`,
  manifest: { source_locator: { label: 'Archive fragment root' } }
};

const baseCase = {
  case_id: 'case_test_lifecycle',
  case_map_digest: `sha256:${'c'.repeat(64)}`,
  custody_reference: null,
  rooms: [{ id: 'room_primary', label: 'Primary', color: '#76ead4' }],
  nodes: [{
    id: 'node_existing', type: 'claim', label: 'Existing claim', room_id: 'room_primary', source_status: 'SUPPLIED', confidence_posture: 'OPEN', disclosure_state: 'LOCAL', chronology_index: 0
  }]
};

test('Quick Scan readiness rejects raw content and preserves the no-custody boundary', async () => {
  await assert.rejects(() => compileReadinessReceipt({ text: 'raw sensitive content' }), /rejects raw content/i);
  assert.equal(readiness.raw_content_accepted, false);
  assert.equal(readiness.raw_content_persisted, false);
  assert.equal(readiness.transport_performed, false);
  assert.equal(readiness.readiness_is_custody, false);
  assert.equal(readiness.state, ASH_LIFECYCLE_STATES.READINESS_OBSERVED);
  assert.match(readiness.readiness_digest, /^sha256:[0-9a-f]{64}$/);
});

test('custody root binding is idempotent and moves the root into the Case Map topology', () => {
  const first = buildCustodyRoot({ caseMap: baseCase, custodyReceipt, readinessReceipt: readiness });
  assert.equal(first.custody_reference, custodyReceipt.receipt_id);
  assert.equal(first.nodes[0].type, 'artifact');
  assert.equal(first.nodes[0].custody_reference, custodyReceipt.receipt_id);
  assert.equal(first.nodes[0].chronology_index, 0);
  assert.equal(first.nodes[1].chronology_index, 1);
  assert.equal(first.observation.raw_content_imported, false);

  const reboundCase = { ...baseCase, custody_reference: first.custody_reference, nodes: first.nodes };
  const second = buildCustodyRoot({ caseMap: reboundCase, custodyReceipt, readinessReceipt: readiness });
  assert.equal(second.nodes.length, first.nodes.length);
  assert.equal(second.root_node.id, first.root_node.id);
});

test('lifecycle gates distinguish readiness, verified custody, case binding, rebuild, release, and continuity', () => {
  const arrival = deriveAshLifecycle({});
  assert.equal(arrival.state, ASH_LIFECYCLE_STATES.ARRIVAL_UNPERSISTED);
  assert.equal(workspaceGate(arrival, 'test').allowed, false);

  const observed = deriveAshLifecycle({ readinessReceipt: readiness });
  assert.equal(observed.state, ASH_LIFECYCLE_STATES.READINESS_OBSERVED);
  assert.equal(observed.next_action, 'REGISTER_CUSTODY_ROOT');

  const verified = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true });
  assert.equal(verified.state, ASH_LIFECYCLE_STATES.CUSTODY_ROOT_VERIFIED);
  assert.equal(verified.next_action, 'CREATE_CASE');

  const binding = buildCustodyRoot({ caseMap: baseCase, custodyReceipt, readinessReceipt: readiness });
  const boundCase = {
    ...baseCase,
    custody_reference: binding.custody_reference,
    nodes: binding.nodes,
    case_map_digest: `sha256:${'d'.repeat(64)}`
  };
  const bound = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: boundCase });
  assert.equal(bound.state, ASH_LIFECYCLE_STATES.CASE_BOUND);
  assert.equal(bound.gates.test, true);
  assert.equal(bound.gates.local_release, false);

  const latestTest = {
    case_id: boundCase.case_id,
    case_map_digest: boundCase.case_map_digest,
    test_id: 'test_current',
    review_state: 'REVIEW_REQUIRED'
  };
  const rebuild = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: boundCase, latestTest });
  assert.equal(rebuild.state, ASH_LIFECYCLE_STATES.REBUILD_ELIGIBLE);

  const latestReview = { status: 'READY_FOR_LOCAL_RELEASE_APPROVAL', local_export_approved: true };
  const release = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: boundCase, latestTest, latestReview });
  assert.equal(release.state, ASH_LIFECYCLE_STATES.RELEASE_ELIGIBLE);
  assert.equal(release.gates.local_release, true);

  const latestSavePoint = {
    case_id: boundCase.case_id,
    case_map_digest: boundCase.case_map_digest,
    save_point_id: 'save_current',
    tamper_state: 'CLEAR'
  };
  const sealed = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: boundCase, latestTest, latestReview, latestSavePoint });
  assert.equal(sealed.state, ASH_LIFECYCLE_STATES.CONTINUITY_SEALED);
});

test('a pre-custody Rebuild Test becomes stale when custody changes the Case Map digest', () => {
  const binding = buildCustodyRoot({ caseMap: baseCase, custodyReceipt, readinessReceipt: readiness });
  const boundCase = {
    ...baseCase,
    custody_reference: binding.custody_reference,
    nodes: binding.nodes,
    case_map_digest: `sha256:${'e'.repeat(64)}`
  };
  const staleTest = {
    case_id: boundCase.case_id,
    case_map_digest: baseCase.case_map_digest,
    test_id: 'test_before_custody',
    review_state: 'REVIEW_REQUIRED'
  };
  const lifecycle = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: boundCase, latestTest: staleTest });
  assert.equal(lifecycle.state, ASH_LIFECYCLE_STATES.CASE_BOUND);
  assert.ok(lifecycle.holds.includes('CURRENT_REBUILD_TEST_ABSENT'));
  assert.equal(lifecycle.gates.local_release, false);
});

test('lifecycle receipts are sealed without granting identity, truth, or transport authority', async () => {
  const lifecycle = deriveAshLifecycle({ readinessReceipt: readiness });
  const receipt = await compileLifecycleReceipt(lifecycle, { observedAt: '2026-07-14T00:00:00.000Z' });
  assert.match(receipt.lifecycle_digest, /^sha256:[0-9a-f]{64}$/);
  assert.match(receipt.receipt_id, /^ash_lifecycle_/);
  assert.match(receipt.implementation_posture, /not-identity-or-truth-proof/);
  assert.ok(receipt.lifecycle.non_authority.includes('continuity is not transport'));
});
