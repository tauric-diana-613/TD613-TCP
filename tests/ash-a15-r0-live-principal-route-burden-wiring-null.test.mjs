import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_CERTIFICATE as C,
  runLivePrincipalRouteBurdenWiringNull
} from '../app/dome-world/previews/a15-r0/live-principal-route-burden-wiring-null.js';

assert.equal(C.status, 'LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_LOCALIZED');
assert.equal(C.rest_symbol, '𝄐');
assert.equal(C.source_class, 'CURRENT_REPOSITORY_LIVE_OWNER_CALL_GRAPH_AUDIT');
assert.equal(C.canonical_live_scene_action_render_chain_owned, true);
assert.deepEqual(C.canonical_live_chain_functions, [
  'compileAshCustodyPedagogueScene',
  'compileAshLiveActionPlan',
  'compileAshLiveActionReceipt',
  'compileAshLiveRenderReceipt'
]);
assert.equal(C.principal_surface_ledger_present, true);
assert.equal(C.separate_route_burden_observatory_has_full_chain, true);
assert.deepEqual(C.route_burden_function_set, [
  'compileRouteGraph',
  'computeDeclaredBurden',
  'compareBurdenModels',
  'compileBurdenReceipt'
]);
assert.deepEqual(C.live_aia_route_burden_function_references, []);
assert.deepEqual(C.observatory_route_burden_function_references, [
  'compileRouteGraph',
  'computeDeclaredBurden',
  'compareBurdenModels',
  'compileBurdenReceipt'
]);
assert.equal(C.direct_live_route_burden_wiring_observed, false);
assert.equal(C.direct_live_observatory_coupling_observed, false);
assert.equal(C.a16_handoff_live_route_burden_debt_preserved, true);
assert.equal(C.operator_review_required_before_a16, true);
assert.equal(C.operator_review_recorded, false);
assert.equal(C.operator_review_gate_state, 'OPEN');
assert.equal(C.pre_a16_wiring_debt_localized, true);
assert.equal(C.crown_eligibility_preserved, true);
assert.equal(C.crown_authority, false);
assert.equal(C.live_loom_crowned, false);
assert.equal(C.a16_live_principal_journey_observed, false);
assert.equal(C.a16_live_route_burden_compilation_earned, false);
assert.equal(C.a16_readmission_earned, false);
assert.equal(C.a16_implementation_authority, false);
assert.equal(C.a16_product_mutation_authority, false);
assert.equal(C.a19_whole_program_closure_earned, false);
assert.equal(C.empirical_interaction_evidence_acquired, false);
assert.deepEqual(C.exact_golden_egg_surfaces_added, []);
assert.equal(C.empirical_credit_to_golden_egg, 0);
assert.equal(C.golden_egg_earned, false);
assert.equal(C.sequence_authority, false);
assert.equal(C.merge_authority, false);
assert.equal(C.production_authority, false);
assert.equal(C.deployment_authority, false);
assert.equal(C.publication_authority, false);
assert.match(C.wiring_null_digest, /^[0-9a-f]{64}$/);

const receipt = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/LIVE_PRINCIPAL_ROUTE_BURDEN_WIRING_NULL_RECEIPT_V0_1.md',
  'utf8'
);
assert.match(receipt, /SYNTHETIC CONCORDANCE != LIVE WIRING/);
assert.match(receipt, /SEPARATE OBSERVATORY != PRINCIPAL JOURNEY COMPILATION/);
assert.match(receipt, /WIRING NULL LOCALIZATION != A16 REPAIR/);
assert.match(receipt, /OPERATOR REVIEW GATE != STATIC AUDIT/);
assert.match(receipt, /CROWN ELIGIBILITY != CROWN AUTHORITY/);

const rerun = runLivePrincipalRouteBurdenWiringNull();
assert.equal(rerun.status, C.status);
assert.equal(rerun.wiring_null_digest, C.wiring_null_digest);

console.log('Live principal route-burden wiring-null tests passed.');
