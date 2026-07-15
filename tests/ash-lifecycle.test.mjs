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

function boundFixture(digestCharacter = 'd') {
  const binding = buildCustodyRoot({ caseMap: baseCase, custodyReceipt, readinessReceipt: readiness });
  const caseMap = {
    ...baseCase,
    custody_reference: binding.custody_reference,
    nodes: binding.nodes,
    case_map_digest: `sha256:${digestCharacter.repeat(64)}`
  };
  const latestTest = {
    case_id: caseMap.case_id,
    case_map_digest: caseMap.case_map_digest,
    test_id: 'test_current',
    review_state: 'OPERATOR_REVIEW_REQUIRED'
  };
  const latestDraft = {
    case_id: caseMap.case_id,
    case_map_digest: caseMap.case_map_digest,
    draft_id: 'draft_current',
    draft_digest: `sha256:${'f'.repeat(64)}`
  };
  const latestReview = {
    review_id: 'review_current',
    draft_id: latestDraft.draft_id,
    draft_digest: latestDraft.draft_digest,
    case_map_digest: caseMap.case_map_digest,
    status: 'READY_FOR_LOCAL_RELEASE_APPROVAL',
    local_export_approved: true
  };
  const latestRelease = {
    receipt_id: 'release_current',
    case_id: caseMap.case_id,
    case_map_digest: caseMap.case_map_digest,
    draft_id: latestDraft.draft_id,
    draft_digest: latestDraft.draft_digest,
    review_reference: latestReview.review_id
  };
  const latestSavePoint = {
    case_id: caseMap.case_id,
    case_map_digest: caseMap.case_map_digest,
    save_point_id: 'save_current',
    tamper_state: 'CLEAR'
  };
  return { caseMap, latestTest, latestDraft, latestReview, latestRelease, latestSavePoint };
}

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

test('lifecycle advances only through a contiguous custody-bound chain', () => {
  const arrival = deriveAshLifecycle({});
  assert.equal(arrival.state, ASH_LIFECYCLE_STATES.ARRIVAL_UNPERSISTED);
  assert.equal(workspaceGate(arrival, 'test').allowed, false);

  const observed = deriveAshLifecycle({ readinessReceipt: readiness });
  assert.equal(observed.state, ASH_LIFECYCLE_STATES.READINESS_OBSERVED);
  assert.equal(observed.next_action, 'REGISTER_CUSTODY_ROOT');

  const verified = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true });
  assert.equal(verified.state, ASH_LIFECYCLE_STATES.CUSTODY_ROOT_VERIFIED);
  assert.equal(verified.next_action, 'CREATE_CASE');

  const fixture = boundFixture();
  const bound = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: fixture.caseMap });
  assert.equal(bound.state, ASH_LIFECYCLE_STATES.CASE_BOUND);
  assert.equal(bound.gates.test, true);
  assert.equal(bound.gates.draft, false);

  const rebuild = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: fixture.caseMap, latestTest: fixture.latestTest });
  assert.equal(rebuild.state, ASH_LIFECYCLE_STATES.REBUILD_ELIGIBLE);
  assert.equal(rebuild.next_action, 'KEEP_CUSTODY_BOUND_DRAFT');
  assert.equal(rebuild.gates.draft, true);

  const reviewed = deriveAshLifecycle({
    readinessReceipt: readiness, custodyReceipt, custodyVerified: true,
    caseMap: fixture.caseMap, latestTest: fixture.latestTest,
    latestDraft: fixture.latestDraft, latestReview: fixture.latestReview
  });
  assert.equal(reviewed.state, ASH_LIFECYCLE_STATES.REBUILD_ELIGIBLE);
  assert.equal(reviewed.gates.local_release, true);
  assert.equal(reviewed.next_action, 'KEEP_RELEASE_RECEIPT');

  const released = deriveAshLifecycle({
    readinessReceipt: readiness, custodyReceipt, custodyVerified: true,
    caseMap: fixture.caseMap, latestTest: fixture.latestTest,
    latestDraft: fixture.latestDraft, latestReview: fixture.latestReview,
    latestRelease: fixture.latestRelease
  });
  assert.equal(released.state, ASH_LIFECYCLE_STATES.RELEASE_ELIGIBLE);
  assert.equal(released.gates.save, true);

  const sealed = deriveAshLifecycle({
    readinessReceipt: readiness, custodyReceipt, custodyVerified: true,
    ...fixture
  });
  assert.equal(sealed.state, ASH_LIFECYCLE_STATES.CONTINUITY_SEALED);
});

test('a pre-custody Rebuild Test becomes stale when custody changes the Case Map digest', () => {
  const fixture = boundFixture('e');
  const staleTest = { ...fixture.latestTest, test_id: 'test_before_custody', case_map_digest: baseCase.case_map_digest };
  const lifecycle = deriveAshLifecycle({ readinessReceipt: readiness, custodyReceipt, custodyVerified: true, caseMap: fixture.caseMap, latestTest: staleTest });
  assert.equal(lifecycle.state, ASH_LIFECYCLE_STATES.CASE_BOUND);
  assert.ok(lifecycle.holds.includes('CURRENT_REBUILD_TEST_ABSENT'));
  assert.equal(lifecycle.gates.local_release, false);
});

test('pre-custody draft, review, release, and save artifacts cannot jump the lifecycle', () => {
  const fixture = boundFixture('9');
  const staleDigest = baseCase.case_map_digest;
  const staleDraft = { ...fixture.latestDraft, case_map_digest: staleDigest };
  const staleReview = { ...fixture.latestReview, case_map_digest: staleDigest };
  const staleRelease = { ...fixture.latestRelease, case_map_digest: staleDigest };
  const staleSave = { ...fixture.latestSavePoint, case_map_digest: staleDigest };
  const lifecycle = deriveAshLifecycle({
    readinessReceipt: readiness,
    custodyReceipt,
    custodyVerified: true,
    caseMap: fixture.caseMap,
    latestTest: fixture.latestTest,
    latestDraft: staleDraft,
    latestReview: staleReview,
    latestRelease: staleRelease,
    latestSavePoint: staleSave
  });
  assert.equal(lifecycle.state, ASH_LIFECYCLE_STATES.REBUILD_ELIGIBLE);
  assert.equal(lifecycle.next_action, 'KEEP_CUSTODY_BOUND_DRAFT');
  assert.equal(lifecycle.references.release_receipt, null);
  assert.equal(lifecycle.references.save_point, null);
});

test('lifecycle receipts are sealed without granting identity, truth, or transport authority', async () => {
  const lifecycle = deriveAshLifecycle({ readinessReceipt: readiness });
  const receipt = await compileLifecycleReceipt(lifecycle, { observedAt: '2026-07-14T00:00:00.000Z' });
  assert.match(receipt.lifecycle_digest, /^sha256:[0-9a-f]{64}$/);
  assert.match(receipt.receipt_id, /^ash_lifecycle_/);
  assert.match(receipt.implementation_posture, /not-identity-or-truth-proof/);
  assert.ok(receipt.lifecycle.non_authority.includes('continuity is not transport'));
});
