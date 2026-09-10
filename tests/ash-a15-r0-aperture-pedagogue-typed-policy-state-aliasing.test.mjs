import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TYPED_POLICY_STATE_ALIASING_SCHEMA,
  Q_PLUS_REPAIR,
  Q_MINUS_REPAIR,
  applyRepairToRoute,
  verifyAliasedScalarPolicyState,
  replayClassOnlyAction,
  replayRouteCustodyComparator,
  runTypedPolicyStateAliasingGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-typed-policy-state-aliasing.js';

const EPSILON = 0.001;
const TOLERANCE = 1e-10;
const plus = [1,EPSILON];
const minus = [1,-EPSILON];
const mul = (m,v) => [m[0][0]*v[0]+m[0][1]*v[1],m[1][0]*v[0]+m[1][1]*v[1]];
const dist = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
assert.ok(dist(mul(Q_PLUS_REPAIR,plus),[0,1]) <= TOLERANCE);
assert.ok(dist(mul(Q_PLUS_REPAIR,minus),[1,0]) <= TOLERANCE);
assert.ok(dist(mul(Q_MINUS_REPAIR,plus),[1,0]) <= TOLERANCE);
assert.ok(dist(mul(Q_MINUS_REPAIR,minus),[0,1]) <= TOLERANCE);

const alias = verifyAliasedScalarPolicyState();
assert.equal(alias.scalar_signature_matched,true);
assert.equal(alias.signed_rows_differ,true);
assert.equal(alias.signed_orientation_in_scalar_signature,false);
assert.equal(alias.signature_a.deficit_class,'NUMERICAL_STABILITY_DEFICIT');
assert.equal(alias.signature_b.deficit_class,'NUMERICAL_STABILITY_DEFICIT');
assert.equal(alias.signature_a.disposition,'PROPOSE');
assert.equal(alias.signature_b.disposition,'PROPOSE');
assert.equal(alias.signature_a.rank,2);
assert.equal(alias.signature_b.rank,2);
assert.ok(Math.abs(alias.signature_a.sigma_min-alias.signature_b.sigma_min) <= 1e-12);
assert.ok(Math.abs(alias.signature_a.sigma_max-alias.signature_b.sigma_max) <= 1e-12);
assert.ok(Math.abs(alias.signature_a.condition_number-alias.signature_b.condition_number) <= 1e-9);

const plusOnly = replayClassOnlyAction('Q_PLUS_REPAIR');
const minusOnly = replayClassOnlyAction('Q_MINUS_REPAIR');
const askNothing = replayClassOnlyAction('ASK_NOTHING');
const abstain = replayClassOnlyAction('ABSTAIN_POLICY_STATE_UNDECLARED');
assert.equal(plusOnly.closure_count,1);
assert.equal(minusOnly.closure_count,1);
assert.equal(askNothing.closure_count,0);
assert.equal(abstain.closure_count,0);
for (const item of [plusOnly,minusOnly,askNothing,abstain]) {
  assert.equal(item.same_action_applied_to_both,true);
  assert.equal(item.branch_identity_consulted,false);
  assert.equal(item.signed_orientation_consulted,false);
  assert.equal(item.future_outcomes_consulted,false);
  assert.equal(item.consequence_losses_consulted,false);
}
assert.throws(() => replayClassOnlyAction('Q_SECRET_THIRD_REPAIR'),/preregistered action family/);

const routeA = replayRouteCustodyComparator('Q_A');
const routeB = replayRouteCustodyComparator('Q_B');
assert.equal(routeA.class_only_action,'Q_PLUS_REPAIR');
assert.equal(routeB.class_only_action,'Q_MINUS_REPAIR');
assert.equal(routeA.closure,true);
assert.equal(routeB.closure,true);
assert.equal(routeA.question_count,2);
assert.equal(routeB.question_count,2);
assert.equal(routeA.future_outcomes_consulted,false);
assert.equal(routeB.consequence_losses_consulted,false);
const unknown = replayRouteCustodyComparator('Q_UNKNOWN_ROUTE');
assert.equal(unknown.policy_status,'ABSTAIN_ROUTE_STATE_UNDECLARED');
assert.equal(unknown.repair_applied,false);
assert.equal(unknown.question_count,0);

assert.equal(applyRepairToRoute('Q_A','Q_PLUS_REPAIR').terminal_audit.aperture.disposition,'ASK_NOTHING');
assert.equal(applyRepairToRoute('Q_B','Q_PLUS_REPAIR').terminal_audit.aperture.deficit_class,'STRUCTURAL_RANK_DEFICIT');
assert.equal(applyRepairToRoute('Q_A','Q_MINUS_REPAIR').terminal_audit.aperture.deficit_class,'STRUCTURAL_RANK_DEFICIT');
assert.equal(applyRepairToRoute('Q_B','Q_MINUS_REPAIR').terminal_audit.aperture.disposition,'ASK_NOTHING');

const receipt = runTypedPolicyStateAliasingGauntlet();
assert.equal(receipt.schema,TYPED_POLICY_STATE_ALIASING_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.class_only_max_closure_count,1);
assert.equal(receipt.route_custody_comparator.closure_count,2);
assert.equal(receipt.matched_max_question_budget,2);
assert.equal(receipt.consequence_ledger_post_terminal_reaudit,true);
assert.equal(receipt.gauntlet_status,'DEFICIT_CLASS_POLICY_STATE_ALIASING_WITNESSED_IN_BOUNDED_SYNTHETIC_TWO_BRANCH_FIXTURE');
assert.ok(receipt.anti_equivalences.includes('same deficit class != same future-repair requirement'));
assert.ok(receipt.anti_equivalences.includes('route provenance useful here != route provenance uniquely necessary'));
assert.match(receipt.next_learning_action,/MINIMAL_DISAMBIGUATING_POLICY_STATE/);
assert.equal(receipt.claims.sufficient_policy_state,false);
assert.equal(receipt.claims.route_provenance_optimality,false);
assert.equal(receipt.claims.active_learning_policy,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TYPED_POLICY_STATE_ALIASING_GAUNTLET_SPEC_V0_1.md',
  'utf8'
);
assert.match(spec,/same scalar Aperture geometry != same oriented observation state/);
assert.match(spec,/DEFICIT_CLASS_POLICY_STATE_ALIASING_WITNESSED/);
assert.match(spec,/TEST_MINIMAL_DISAMBIGUATING_POLICY_STATE/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  scalar_signature_matched:receipt.alias_witness.scalar_signature_matched,
  signed_rows_differ:receipt.alias_witness.signed_rows_differ,
  class_only_max_closure:receipt.class_only_max_closure_count,
  route_custody_closure:receipt.route_custody_comparator.closure_count,
  gauntlet_status:receipt.gauntlet_status,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
