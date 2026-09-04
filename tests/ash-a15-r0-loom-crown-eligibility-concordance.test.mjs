import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LOOM_CROWN_ELIGIBILITY_CONCORDANCE_CERTIFICATE as C,
  runLoomCrownEligibilityConcordance
} from '../app/dome-world/previews/a15-r0/loom-crown-eligibility-concordance.js';

assert.equal(C.status,'LOOM_CUSTODIAL_CROWN_ELIGIBILITY_CONCORDANCE_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.source_fixture_class,'CANONICAL_ASH_DERIVED_SYNTHETIC_LIFECYCLE_FIXTURE');
assert.equal(C.lifecycle_state,'CASE_BOUND');
assert.equal(C.canonical_ash_derived_scene_compiled,true);
assert.equal(C.canonical_flowcore_route_graph_compiled,true);
assert.ok(C.route_graph_step_count>=1);
assert.equal(C.all_declared_burden_models_evaluated,true);
assert.deepEqual(C.burden_model_ids,[
  'FIELD_COUNT_BASELINE',
  'DEPENDENCY_COUNT',
  'AIA_TRANSPORT_SURROGATE',
  'HETEROSTRATIGRAPHIC_EXTENSION'
]);
assert.equal(C.burden_model_totals_millipoints.length,4);
assert.ok(new Set(C.burden_model_totals_millipoints).size>1);
assert.equal(C.burden_model_disagreement_preserved,true);
assert.equal(C.burden_models_remain_uncrowned,true);
assert.equal(C.crowned_model,null);
assert.equal(C.crowned_score,null);
assert.equal(C.burden_interaction_evidence_still_required,true);
assert.match(C.route_graph_digest,/^sha256:[0-9a-f]{64}$/);
assert.match(C.burden_receipt_digest,/^sha256:[0-9a-f]{64}$/);
assert.match(C.concordance_digest,/^[0-9a-f]{64}$/);
assert.equal(C.loom_route_memory_reference_bound,true);
assert.notEqual(C.loom_route_memory_digests.A_SEPARATED,C.loom_route_memory_digests.C_SEPARATED);

assert.equal(C.research_custodial_crown_eligibility,true);
assert.equal(C.crown_scope,'ROUTE_MEMORY_CUSTODY_COMPATIBILITY_ONLY');
assert.equal(C.crown_authority,false);
assert.equal(C.live_loom_crowned,false);
assert.equal(C.loom_became_flowcore_burden_engine,false);
assert.equal(C.loom_context_is_measurement,false);
assert.equal(C.empirical_interaction_evidence_acquired,false);
assert.equal(C.a16_live_principal_journey_observed,false);
assert.equal(C.a16_live_route_burden_compilation_earned,false);
assert.equal(C.a16_readmission_earned,false);
assert.equal(C.a16_implementation_authority,false);
assert.equal(C.a19_whole_program_closure_earned,false);
assert.equal(C.a19_mutation_authority,false);
assert.equal(C.live_loom_mutated,false);
assert.equal(C.loom_rename_authority,false);
assert.equal(C.flowcore_public_promotion_authority,false);
assert.equal(C.empirical_supplemental_probe_repair_earned,false);
assert.equal(C.external_empirical_exteriority_witness_acquired,false);
assert.equal(C.empirical_exteriority_information_gain_measured,false);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/LOOM_CROWN_ELIGIBILITY_CONCORDANCE_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/CROWN ELIGIBILITY != CROWN AUTHORITY/);
assert.match(receipt,/CUSTODIAL ROUTE MEMORY != FLOW-CORE BURDEN ENGINE/);
assert.match(receipt,/CANONICAL FIXTURE COMPILATION != LIVE PRINCIPAL JOURNEY/);
assert.match(receipt,/BURDEN MODEL DISAGREEMENT != MODEL CROWN/);
assert.match(receipt,/LOOM COMPATIBILITY != A16 READMISSION/);
assert.match(receipt,/LOOM COMPATIBILITY != A19 CLOSURE/);

const rerun=await runLoomCrownEligibilityConcordance();
assert.equal(rerun.status,'LOOM_CUSTODIAL_CROWN_ELIGIBILITY_CONCORDANCE_EARNED');
assert.equal(rerun.concordance_digest,C.concordance_digest);

console.log('Loom crown-eligibility concordance tests passed.');
