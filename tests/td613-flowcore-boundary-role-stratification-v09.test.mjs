import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  compileFlowcoreContextSeries,
  verifyFlowcoreContextSeries
} from '../app/engine/flowcore-context-series.js';
import { flowReceipt } from './helpers/phase5-fixtures.mjs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-15-flowcore-boundary-role-stratification-v09.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-15-FLOWCORE-BOUNDARY-ROLE-STRATIFICATION-V0_9.md';
const assay = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

const experimentId = 'atx_flowcore_stagecollapse_v09';
const createdAt = '2026-09-15T00:00:00.000Z';

function openReceipt(id, route = 'REQUESTED_SYNTHESIS') {
  return {
    ...flowReceipt(route),
    receipt_id: id,
    source_status: 'DERIVED',
    missingness: []
  };
}

function abstainReceipt(id, missingness = 'coherence missing') {
  return {
    ...flowReceipt(),
    receipt_id: id,
    status: 'ABSTAIN',
    context_posture: 'ABSTAIN_INSUFFICIENT_CONTEXT',
    source_status: 'UNRESOLVED',
    missingness: [missingness]
  };
}

const sharedSnapshotA = 'atsnap_shared_a_v09';
const sharedSnapshotB = 'atsnap_shared_b_v09';

const historyA = await compileFlowcoreContextSeries({
  experimentId,
  seriesId: 'flowseries_history_a_v09',
  createdAt,
  snapshots: [
    { snapshot_id: sharedSnapshotA, context_receipt: openReceipt('flowctx_history_a_open') },
    { snapshot_id: sharedSnapshotB, context_receipt: abstainReceipt('flowctx_history_a_abstain') }
  ]
});

const historyB = await compileFlowcoreContextSeries({
  experimentId,
  seriesId: 'flowseries_history_b_v09',
  createdAt,
  snapshots: [
    { snapshot_id: sharedSnapshotA, context_receipt: abstainReceipt('flowctx_history_b_abstain') },
    { snapshot_id: sharedSnapshotB, context_receipt: openReceipt('flowctx_history_b_open') }
  ]
});

const aggregate = series => ({
  status: series.status,
  snapshot_count: series.snapshot_count,
  abstention_count: series.abstention_count,
  missing_snapshot_count: series.missing_snapshot_count
});

assert.deepEqual(aggregate(historyA), {
  status: 'PARTIAL',
  snapshot_count: 2,
  abstention_count: 1,
  missing_snapshot_count: 1
});
assert.deepEqual(aggregate(historyB), aggregate(historyA), 'Distinct histories must collapse to the same declared aggregate terminal posture.');
assert.deepEqual(
  historyA.entries.map(entry => entry.snapshot_id),
  historyB.entries.map(entry => entry.snapshot_id),
  'Hostile histories must hold snapshot identity and ordering fixed.'
);
assert.notDeepEqual(
  historyA.entries.map(entry => entry.status),
  historyB.entries.map(entry => entry.status),
  'Stage-local entry sequence must distinguish terminally equivalent aggregate histories.'
);
assert.equal(historyA.entries.find(entry => entry.status === 'ABSTAIN').snapshot_id, sharedSnapshotB);
assert.equal(historyB.entries.find(entry => entry.status === 'ABSTAIN').snapshot_id, sharedSnapshotA);

// Authority/type-safety boundary: invalid authority and artifact posture are rejected
// before an admitted series object can be constructed.
await assert.rejects(
  compileFlowcoreContextSeries({
    experimentId,
    snapshots: [{
      snapshot_id: 'atsnap_forbidden_artifact',
      context_receipt: { ...openReceipt('flowctx_forbidden_artifact'), artifact_reference: 'ashc_forbidden' }
    }]
  }),
  /artifact-blind/
);
await assert.rejects(
  compileFlowcoreContextSeries({
    experimentId,
    snapshots: [{
      snapshot_id: 'atsnap_forbidden_action',
      context_receipt: { ...openReceipt('flowctx_forbidden_action'), automatic_ash_action: true }
    }]
  }),
  /exceeds Flow-Core authority/
);

// Projection-loss hostile control: task-intent route differs upstream but is not part
// of the declared artifact-blind context-series entry surface. Holding every admitted
// output coordinate fixed therefore produces identical compiled series objects.
const routeA = openReceipt('flowctx_projection_same', 'REQUESTED_SYNTHESIS');
const routeB = openReceipt('flowctx_projection_same', 'LEGAL_SYNTHESIS');
assert.notEqual(routeA.task_intent_route, routeB.task_intent_route);
const projectedA = await compileFlowcoreContextSeries({
  experimentId,
  seriesId: 'flowseries_projection_same',
  createdAt,
  snapshots: [{ snapshot_id: 'atsnap_projection_same', context_receipt: routeA }]
});
const projectedB = await compileFlowcoreContextSeries({
  experimentId,
  seriesId: 'flowseries_projection_same',
  createdAt,
  snapshots: [{ snapshot_id: 'atsnap_projection_same', context_receipt: routeB }]
});
assert.deepEqual(projectedA, projectedB, 'A non-projected upstream field may differ while the admitted series remains identical.');
assert.equal('task_intent_route' in projectedA.entries[0], false);
assert.equal(projectedA.entries[0].artifact_reference, null);

// Integrity boundary: canonical verification catches admitted-object mutation, but
// this test grants no truth/externality credit to digest success.
assert.equal(await verifyFlowcoreContextSeries(historyA), true);
const tampered = structuredClone(historyA);
tampered.entries[1].missingness = [];
assert.equal(await verifyFlowcoreContextSeries(tampered), false);

assert.equal(assay.schema, 'td613.flowcore-boundary-role-stratification/v0.9');
assert.equal(assay.counts.boundaries_examined, 4);
assert.equal(assay.counts.boundaries_retained, 4);
assert.equal(assay.counts.scientific_epistemic_operators_promoted, 0);
assert.equal(assay.same_terminal_histories.aggregate_terminal_distinguishes_history, false);
assert.equal(assay.same_terminal_histories.entry_sequence_distinguishes_history, true);
assert.equal(assay.same_terminal_histories.bounded_conclusion, 'TERMINAL_AGGREGATE_EQUIVALENCE != DIAGNOSTIC_LOCALIZATION_EQUIVALENCE');

const roleByBoundary = Object.fromEntries(assay.boundary_scorecard.map(row => [row.boundary, row]));
assert.deepEqual(roleByBoundary.RECEIPT_ADMISSIBILITY_AUTHORITY_VALIDATION.role_credit, ['GOVERNANCE_TYPE_SAFETY']);
assert.ok(roleByBoundary.ARTIFACT_BLIND_PER_SNAPSHOT_ENTRY_PROJECTION.role_credit.includes('DATA_MINIMIZATION'));
assert.deepEqual(roleByBoundary.PER_SNAPSHOT_ENTRIES_TO_AGGREGATE_SERIES_STATUS.role_credit, ['DIAGNOSTIC_LOCALIZATION']);
assert.ok(roleByBoundary.CANONICAL_SERIES_DIGEST_AND_VERIFICATION.role_credit.includes('INTEGRITY_WITNESS'));
assert.ok(assay.boundary_scorecard.every(row => row.scientific_epistemic_operator === false));

for (const law of [
  'SAME_AGGREGATE_STATUS != SAME_CONTEXT_HISTORY',
  'TERMINAL_AGGREGATE_EQUIVALENCE != DIAGNOSTIC_LOCALIZATION_EQUIVALENCE',
  'AUTHORITY_GUARD != EPISTEMIC_INFERENCE',
  'TYPE_SAFETY_VALUE != SCIENTIFIC_OPERATOR_STATUS',
  'NOT_PROJECTED != NOT_PRESENT_UPSTREAM',
  'PROJECTION_LOSS != PROOF_OF_SOURCE_ABSENCE',
  'DIGEST_VERIFIED != EMPIRICALLY_TRUE',
  'INTEGRITY_WITNESS != EXTERNALITY_WITNESS',
  'BOUNDARY_RETENTION != SCIENTIFIC_OPERATOR_PROMOTION',
  'BOUNDARY_VALUE_MUST_BE_ROLE_TYPED'
]) assert.ok(assay.laws.includes(law), `Receipt must preserve law: ${law}`);

assert.equal(assay.authority.scientific_promotion, false);
assert.equal(assay.authority.deployed_llm_architecture_inference, false);
assert.equal(assay.authority.externality_inference, false);
assert.equal(assay.authority.deployment, false);
assert.equal(assay.authority.vercel, false);
assert.match(operation, /BOUNDARY_RETENTION != SCIENTIFIC_OPERATOR_PROMOTION/);
assert.match(operation, /BOUNDARY_VALUE_MUST_BE_ROLE_TYPED/);
assert.match(operation, /DIGEST_VERIFIED != EMPIRICALLY_TRUE/);

console.log('TD613 Flow-Core boundary-role stratification assay v0.9 passed.');
