import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_TYPED_NON_AMPLIFICATION_HOSTILE_SCHEMA,
  declaredDerivationalClosure,
  evaluateDeclaredDerivationalClosure,
  evaluateStrictInputBoundNonAmplification,
  runPedagogueTypedNonAmplificationHostileGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-typed-non-amplification-hostile.js';

const primitiveEvidence = [
  { evidence_id:'A', warrants:['MEASUREMENT:A'] },
  { evidence_id:'B', warrants:['MEASUREMENT:B'] }
];
const declaredRule = {
  rule_id:'TEST_DECLARED_DERIVATION',
  requires:['MEASUREMENT:A', 'MEASUREMENT:B'],
  produces:'IDENTIFIABILITY:C',
  predeclared:true,
  admissible:true,
  replayable:true
};

const closure = declaredDerivationalClosure({ evidence:primitiveEvidence, rules:[declaredRule] });
assert.deepEqual(closure.primitive_warrants, ['MEASUREMENT:A', 'MEASUREMENT:B']);
assert.deepEqual(closure.closure_warrants, ['IDENTIFIABILITY:C', 'MEASUREMENT:A', 'MEASUREMENT:B']);
assert.deepEqual(closure.derivations_used, ['TEST_DECLARED_DERIVATION']);
assert.equal(closure.scalar_aggregation_used, false);

const strictDerived = evaluateStrictInputBoundNonAmplification({
  evidence:primitiveEvidence,
  requested_warrant:'IDENTIFIABILITY:C'
});
assert.equal(strictDerived.status, 'REFUSE_STRICT_INPUT_BOUND_WARRANT_WIDENING');

const closureDerived = evaluateDeclaredDerivationalClosure({
  evidence:primitiveEvidence,
  rules:[declaredRule],
  requested_warrant:'IDENTIFIABILITY:C'
});
assert.equal(closureDerived.status, 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY');
assert.deepEqual(closureDerived.derivations_used, ['TEST_DECLARED_DERIVATION']);

const explicit = evaluateDeclaredDerivationalClosure({
  evidence:primitiveEvidence,
  rules:[],
  requested_warrant:'MEASUREMENT:A'
});
assert.equal(explicit.status, 'PERMIT_EXPLICITLY_SUPPORTED_AUTHORITY');

const unsupported = evaluateDeclaredDerivationalClosure({
  evidence:primitiveEvidence,
  rules:[declaredRule],
  requested_warrant:'DECISION:HUMAN_PREFERENCE'
});
assert.equal(unsupported.status, 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE');

const gatedOut = evaluateDeclaredDerivationalClosure({
  evidence:primitiveEvidence,
  rules:[{ ...declaredRule, rule_id:'NOT_PREDECLARED', predeclared:false }],
  requested_warrant:'IDENTIFIABILITY:C'
});
assert.equal(gatedOut.status, 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE');

const renamed = evaluateDeclaredDerivationalClosure({
  evidence:[
    { evidence_id:'RENAMED_B', warrants:['MEASUREMENT:B'] },
    { evidence_id:'RENAMED_A', warrants:['MEASUREMENT:A'] }
  ],
  rules:[declaredRule],
  requested_warrant:'IDENTIFIABILITY:C'
});
assert.deepEqual(renamed.closure_warrants, closureDerived.closure_warrants);
assert.equal(renamed.status, closureDerived.status);

const receipt = runPedagogueTypedNonAmplificationHostileGauntlet();
assert.equal(receipt.schema, PEDAGOGUE_TYPED_NON_AMPLIFICATION_HOSTILE_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.strict_candidate.status_before_execution, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(receipt.strict_candidate.presumption_of_survival, false);
assert.equal(
  receipt.strict_candidate.verdict,
  'STRICT_TYPED_NON_AMPLIFICATION_FALSIFIED_BY_LAWFUL_DERIVATIONAL_GAIN'
);
assert.equal(receipt.strict_non_amplification_falsified, true);
assert.ok([
  'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_SURVIVES_BOUNDED_HOSTILE_FAMILY',
  'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_FALSIFIED'
].includes(receipt.closure_candidate.verdict));
assert.equal(receipt.primary_verdict, receipt.closure_candidate.verdict);
assert.equal(receipt.closure_candidate.promoted, false);
assert.equal(receipt.candidate_formalism_status, 'ATTACK_ONLY_NOT_PROMOTED');

const hostile = receipt.hostile_receipts;
assert.equal(hostile.lawful_derivational_gain_wedding.mechanism_valid, true);
assert.equal(hostile.lawful_derivational_gain_wedding.best_pair_exact_recovery_rate, 0);
assert.equal(hostile.lawful_derivational_gain_wedding.intact_triple_exact_recovery_rate, 1);
assert.equal(hostile.lawful_derivational_gain_wedding.strict_disposition.status, 'REFUSE_STRICT_INPUT_BOUND_WARRANT_WIDENING');
assert.equal(hostile.unsupported_representation_strengthening.status, 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE');

const constitutional = hostile.constitutional_controls;
assert.equal(constitutional.exact_tie_status, 'NO_UNIQUE_SELECTION_DECISION_LOSS_TIE');
assert.deepEqual(constitutional.exact_tie_candidate_set, ['P_DIAG', 'P_ORTH']);
assert.equal(constitutional.lexicographic_probe_id_tie_break_used, false);
assert.equal(constitutional.undeclared_loss_status, 'NO_SELECTION_UNDECLARED_DECISION_LOSS');
assert.equal(constitutional.conflicting_loss_status, 'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE');
assert.equal(constitutional.missing_aggregation_status, 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE');
assert.equal(constitutional.unsupported_aggregation_status, 'REFUSE_UNSUPPORTED_OR_MISSING_AGGREGATION_RULE');
assert.equal(constitutional.posthoc_status, 'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY');
assert.equal(constitutional.incomplete_uncertainty_status, 'ABSTAIN_NOISE_GEOMETRY_INCOMPLETE');
assert.equal(constitutional.invalid_uncertainty_status, 'REJECT_INVALID_NOISE_GEOMETRY');

assert.ok(hostile.scalar_collapse_refusals.every(item =>
  item.status === 'REFUSE_TYPED_MULTI_AXIS_SCALAR_COLLAPSE'
  && item.scalar_value === null
  && item.scalar_aggregation_used === false
));
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.intersection_program_status, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.H2_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3_status, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.aperture_v32_replay_stability, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.pedagogue_engine_mutation, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.deployment_authority, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.human_closure_required, true);

const defeatConditions = [];
if (hostile.lawful_derivational_gain_wedding.closure_disposition.status !== 'PERMIT_DECLARED_DERIVATIONAL_AUTHORITY') defeatConditions.push('LAWFUL_DERIVATION_REFUSED');
if (hostile.unsupported_representation_strengthening.status !== 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE') defeatConditions.push('UNSUPPORTED_STRENGTHENING_ADMITTED');
if (hostile.decision_only_CE_D1.measurement_only_launder.status !== 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE') defeatConditions.push('DECISION_AUTHORITY_LAUNDERED_FROM_MEASUREMENT_ONLY');
if (hostile.route_only_CE_P1.endpoint_only.status !== 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE') defeatConditions.push('ROUTE_AUTHORITY_LAUNDERED_FROM_ENDPOINT');
if (!hostile.cross_axis_laundering.every(item => item.disposition.status === 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE')) defeatConditions.push('CROSS_AXIS_LAUNDERING_ADMITTED');
if (!hostile.equivalent_reencoding.closure_invariant || !hostile.equivalent_reencoding.disposition_invariant) defeatConditions.push('REENCODING_CHANGED_AUTHORITY');
if (hostile.null_control.status !== 'PERMIT_EXPLICITLY_SUPPORTED_AUTHORITY') defeatConditions.push('NULL_CONTROL_OVERREFUSED');

if (receipt.primary_verdict === 'DECLARED_DERIVATIONAL_CLOSURE_CANDIDATE_SURVIVES_BOUNDED_HOSTILE_FAMILY') {
  assert.equal(receipt.strong_falsifier_passed, true);
  assert.deepEqual(defeatConditions, []);
} else {
  assert.equal(receipt.strong_falsifier_passed, false);
  assert.ok(defeatConditions.length > 0, 'A falsified closure candidate must expose at least one preregistered defeat condition.');
}

const spec = fs.readFileSync('docs/pedagogue/TYPED_NON_AMPLIFICATION_DERIVATIONAL_CLOSURE_HOSTILE_ASSAY_V0_1.md', 'utf8');
assert.match(spec, /Two candidate readings frozen before execution/i);
assert.match(spec, /lawful-derivation blade · Wedding/i);
assert.match(spec, /Cross-axis authority laundering/i);
assert.match(spec, /No definition repair is allowed after observing the result/i);
assert.match(spec, /APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED/);

const fixture = JSON.parse(fs.readFileSync('docs/pedagogue/typed-non-amplification-derivational-closure-hostile-assay-v0.1.json', 'utf8'));
assert.equal(fixture.status, 'AUTHORED_PRE_EXECUTION_HOSTILE_RESEARCH_ONLY_HUMAN_GATED');
assert.equal(fixture.candidates.C0_strict_input_bound.status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(fixture.candidates.C1_declared_derivational_closure.status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.equal(fixture.closure_contract.scalar_aggregation_authorized, false);
assert.equal(fixture.authority_membrane.intersection_program_opened, false);
assert.equal(fixture.authority_membrane.promotion_authority, undefined);
assert.equal(fixture.authority_membrane.deployment_authority, false);
assert.equal(fixture.held_programs.H2_APERTURE_BEFORE_ABSENCE, 'HELD_NOT_TESTED_HERE');
assert.equal(fixture.held_programs.H3_ROLE_BEFORE_REPETITION, 'HELD_NOT_TESTED_HERE');

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  strict_candidate_verdict:receipt.strict_candidate.verdict,
  closure_candidate_verdict:receipt.closure_candidate.verdict,
  lawful_derivational_gain:{
    best_pair_exact_recovery_rate:hostile.lawful_derivational_gain_wedding.best_pair_exact_recovery_rate,
    intact_triple_exact_recovery_rate:hostile.lawful_derivational_gain_wedding.intact_triple_exact_recovery_rate,
    strict_disposition:hostile.lawful_derivational_gain_wedding.strict_disposition.status,
    closure_disposition:hostile.lawful_derivational_gain_wedding.closure_disposition.status
  },
  unsupported_strengthening:hostile.unsupported_representation_strengthening.status,
  decision_only:[hostile.decision_only_CE_D1.inherited_before_selection, hostile.decision_only_CE_D1.inherited_after_selection],
  measurement_only:[hostile.measurement_only_boundary.inherited_before_selection, hostile.measurement_only_boundary.inherited_after_selection],
  route_endpoint_only:hostile.route_only_CE_P1.endpoint_only.status,
  cross_axis_laundering_refused:hostile.cross_axis_laundering.every(item => item.disposition.status === 'REFUSE_AUTHORITY_OUTSIDE_DECLARED_CLOSURE'),
  reencoding_invariant:hostile.equivalent_reencoding.closure_invariant && hostile.equivalent_reencoding.disposition_invariant,
  exact_tie_status:constitutional.exact_tie_status,
  scalar_aggregation_used:receipt.scalar_aggregation_used,
  defeat_conditions_triggered:defeatConditions,
  intersections:receipt.intersection_program_status,
  H2:receipt.H2_status,
  H3:receipt.H3_status,
  promotion_authority:receipt.promotion_authority
}, null, 2));
