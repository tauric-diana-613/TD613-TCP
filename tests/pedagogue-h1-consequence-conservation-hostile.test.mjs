import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_H1_CONSEQUENCE_CONSERVATION_HOSTILE_SCHEMA,
  refuseTypedScalarCollapse,
  runPedagogueH1ConsequenceConservationHostileGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-h1-consequence-conservation-hostile.js';

const receipt = runPedagogueH1ConsequenceConservationHostileGauntlet();
assert.equal(receipt.schema, PEDAGOGUE_H1_CONSEQUENCE_CONSERVATION_HOSTILE_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.primary_verdict, 'GENERIC_H1_FALSIFIED');
assert.equal(receipt.verdict_scope, 'BOUNDED_SYNTHETIC_UNTYPED_CONSEQUENCE_CONSERVATION_FORM');

assert.equal(receipt.corpse_findings.measurement_axis_changes_can_leave_consequence_invariant, true);
assert.equal(receipt.corpse_findings.CE_M1_measurement_only_selection_change, true);
assert.equal(receipt.corpse_findings.CE_D1_decision_only_selection_change, true);
assert.equal(receipt.corpse_findings.CE_P1_same_endpoint_different_route_process_state, true);

assert.ok(receipt.required_typed_rescues.includes('H1_REQUIRES_MEASUREMENT_DOMAIN'));
assert.ok(receipt.required_typed_rescues.includes('H1_REQUIRES_DECISION_DECLARATION'));
assert.ok(receipt.required_typed_rescues.includes('H1_REQUIRES_ROUTE_TERM'));
assert.equal(receipt.candidate_typed_rescue.status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(receipt.candidate_typed_rescue.presumption_of_survival, false);

const single = receipt.single_axis_receipts;
assert.equal(single.same_route_negative_control.route_provenance_changed, false);
assert.equal(single.same_route_negative_control.process_witness_equal, true);
assert.ok(single.A1_measurement_stable_interior.every(item => item.selected_probe_id === 'P_ORTH'));
assert.equal(single.A2_measurement_boundary.before.selected_probe_id, 'P_ORTH');
assert.equal(single.A2_measurement_boundary.after.selected_probe_id, 'P_DIAG');
assert.equal(single.A2_measurement_boundary.before.all_candidates_admissible, true);
assert.equal(single.A2_measurement_boundary.after.all_candidates_admissible, true);
assert.equal(single.A3_uncertainty_controls.incomplete.hostile_disposition, 'ABSTAIN_NOISE_GEOMETRY_INCOMPLETE');
assert.equal(single.A3_uncertainty_controls.invalid.hostile_disposition, 'REJECT_INVALID_NOISE_GEOMETRY');
assert.equal(single.B1_decision_only_CE_D1.before.selected_probe_id, 'P_ORTH');
assert.equal(single.B1_decision_only_CE_D1.after.selected_probe_id, 'P_DIAG');
assert.equal(single.B2_posthoc_refusal.status, 'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY');
assert.equal(single.B3_undeclared_loss_refusal.status, 'NO_SELECTION_UNDECLARED_DECISION_LOSS');
assert.equal(single.B3_conflicting_loss_refusal.status, 'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE');
assert.equal(single.B3_missing_aggregation_refusal.status, 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE');
assert.equal(single.B3_unsupported_aggregation_refusal.status, 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE');
assert.equal(single.B4_exact_tie_ambiguity.status, 'NO_UNIQUE_SELECTION_DECISION_LOSS_TIE');
assert.equal(single.B4_exact_tie_ambiguity.selected_probe_id, null);
assert.deepEqual(single.B4_exact_tie_ambiguity.candidate_set, ['P_DIAG', 'P_ORTH']);
assert.equal(single.B4_exact_tie_ambiguity.lexicographic_probe_id_tie_break_used, false);
assert.equal(single.C1_route_only_CE_P1.endpoint_equal, true);
assert.equal(single.C1_route_only_CE_P1.operation_multiset_equal, true);
assert.equal(single.C1_route_only_CE_P1.route_provenance_changed, true);
assert.equal(single.C1_route_only_CE_P1.operation_order_changed, true);
assert.equal(single.C1_route_only_CE_P1.process_witness_changed, true);
assert.ok(single.scalar_collapse_refusals.every(item => item.scalar_value === null));
assert.equal(refuseTypedScalarCollapse('confidence').status, 'REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE');
assert.throws(() => refuseTypedScalarCollapse('fake_score'), /Unknown scalar-collapse request/);

assert.equal(receipt.negative_control_status, 'ALL_PREDECLARED_SINGLE_AXIS_CONTROLS_PASSED');
assert.equal(receipt.intersection_program_status, 'HELD_PENDING_HUMAN_REVIEW_OF_SINGLE_AXIS_CORPSE');
assert.equal(receipt.H2_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.automatic_execution, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.pedagogue_engine_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.deployment_authority, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.human_closure_required, true);
assert.match(receipt.next_learning_action, /ATTACK_TYPED_NON_AMPLIFICATION_RESCUE/);

const spec = fs.readFileSync('docs/pedagogue/H1_CONSEQUENCE_CONSERVATION_TYPED_MULTI_AXIS_HOSTILE_ASSAY_V0_1.md', 'utf8');
assert.match(spec, /smallest admissible specimen that kills the generic form/i);
assert.match(spec, /CE-D1/);
assert.match(spec, /CE-P1/);
assert.match(spec, /REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE/);
assert.match(spec, /Candidate rescue — attack only, not doctrine/i);
assert.match(spec, /no presumption of survival/i);

const fixture = JSON.parse(fs.readFileSync('docs/pedagogue/h1-consequence-conservation-typed-multi-axis-hostile-assay-v0.1.json', 'utf8'));
assert.equal(fixture.status, 'AUTHORED_PRE_EXECUTION_HOSTILE_RESEARCH_ONLY_HUMAN_GATED');
assert.equal(fixture.target.status_before_execution, 'HIGH_SPECULATION_HELD');
assert.equal(fixture.target.promotion_authority, false);
assert.equal(fixture.held_siblings.H2_APERTURE_BEFORE_ABSENCE, 'HELD_NOT_TESTED_HERE');
assert.equal(fixture.held_siblings.H3_ROLE_BEFORE_REPETITION, 'HELD_NOT_TESTED_HERE');
assert.equal(fixture.scalar_aggregation.authorized, false);
assert.equal(fixture.intersection_program.execution_status, 'HELD_UNTIL_SINGLE_AXIS_RECEIPTS_ARE_INTELLIGIBLE');

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  primary_verdict: receipt.primary_verdict,
  verdict_scope: receipt.verdict_scope,
  stable_interior_selection: [...new Set(single.A1_measurement_stable_interior.map(item => item.selected_probe_id))],
  measurement_boundary: [single.A2_measurement_boundary.before.selected_probe_id, single.A2_measurement_boundary.after.selected_probe_id],
  decision_boundary: [single.B1_decision_only_CE_D1.before.selected_probe_id, single.B1_decision_only_CE_D1.after.selected_probe_id],
  exact_tie_status: single.B4_exact_tie_ambiguity.status,
  exact_tie_candidate_set: single.B4_exact_tie_ambiguity.candidate_set,
  route_same_endpoint: single.C1_route_only_CE_P1.endpoint_equal,
  route_process_witness_changed: single.C1_route_only_CE_P1.process_witness_changed,
  required_typed_rescues: receipt.required_typed_rescues,
  candidate_typed_rescue_status: receipt.candidate_typed_rescue.status,
  intersections: receipt.intersection_program_status,
  promotion_authority: receipt.promotion_authority
}, null, 2));
