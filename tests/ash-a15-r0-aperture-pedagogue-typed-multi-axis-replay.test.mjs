import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_SCHEMA,
  composeTypedMultiAxisReplayReceipt,
  refuseScalarReplayCollapse,
  runAperturePedagogueTypedMultiAxisReplayGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-typed-multi-axis-replay.js';
import { APERTURE_V32_REPLAY_STABILITY } from '../app/engine/aperture-v32-typed-epistemic-deficit.js';

const receipt = runAperturePedagogueTypedMultiAxisReplayGauntlet();
assert.equal(receipt.schema, APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.deepEqual(receipt.isolation_controls.measurement_only.changed_axes, ['measurement_model']);
assert.deepEqual(receipt.isolation_controls.decision_only.changed_axes, ['decision_specification']);
assert.deepEqual(receipt.isolation_controls.route_only.changed_axes, ['route_provenance']);
assert.equal(receipt.isolation_controls.route_only.same_endpoint_different_route, true);
assert.equal(receipt.baseline.axis_aggregation, 'FORBIDDEN');
assert.equal(receipt.no_scalar_crown, true);
assert.equal(Object.hasOwn(receipt.baseline, 'confidence'), false);
assert.equal(Object.hasOwn(receipt.baseline, 'combined_confidence'), false);
assert.equal(receipt.scalar_collapse_control.status, 'REFUSE_MULTI_AXIS_REPLAY_SCALAR_COLLAPSE');
assert.equal(receipt.scalar_collapse_control.scalar_value, null);
assert.ok(receipt.anti_equivalences.includes('route provenance != confidence'));
assert.ok(receipt.anti_equivalences.includes('annotation composition != scalar aggregation'));
assert.equal(receipt.related_unresolved_pr_evidence.pr_number, 677);
assert.equal(receipt.related_unresolved_pr_evidence.hypothesis_status_mutated, false);
assert.equal(receipt.sibling_pr_684_posture.pr_number, 684);
assert.equal(receipt.sibling_pr_684_posture.mutated, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.automatic_execution, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.standalone_aperture_ui_mutated, false);
assert.equal(receipt.sibling_pr_677_mutated, false);
assert.equal(receipt.sibling_pr_684_mutated, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
for (const claim of Object.values(receipt.claims)) assert.equal(claim, false);

const baseline = composeTypedMultiAxisReplayReceipt();
assert.throws(() => composeTypedMultiAxisReplayReceipt({ measurement_side:'CENTER' }), /LOWER or UPPER/);
assert.throws(() => composeTypedMultiAxisReplayReceipt({ route_index:999 }), /unavailable/);
assert.equal(refuseScalarReplayCollapse(baseline, 'confidence').scalar_value, null);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TYPED_MULTI_AXIS_REPLAY_COMPOSITION_SPEC_V0_1.md', 'utf8');
assert.match(spec, /measurement uncertainty\s*!=\s*decision contingency\s*!=\s*route provenance/);
assert.match(spec, /multi-axis replay receipt != scalar confidence/);
assert.match(spec, /route provenance != confidence/);
assert.match(spec, /STAGE_PR_677_AS_NEXT_HOSTILE_PHASE/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  measurement_only_changed_axes:receipt.isolation_controls.measurement_only.changed_axes,
  decision_only_changed_axes:receipt.isolation_controls.decision_only.changed_axes,
  route_only_changed_axes:receipt.isolation_controls.route_only.changed_axes,
  same_endpoint_different_route:receipt.isolation_controls.route_only.same_endpoint_different_route,
  scalar_collapse_status:receipt.scalar_collapse_control.status,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
