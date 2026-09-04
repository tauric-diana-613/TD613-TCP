import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ENTROBENCH_EXTERNAL_WITNESS as W,
  ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_CERTIFICATE as C,
  ENTROBENCH_EXOGENOUS_WITNESS_PARENT,
  admitEntroBenchExogenousWitness
} from '../app/dome-world/previews/a15-r0/entrobench-exogenous-witness-admission.js';
import { WESTERN_HORIZON_EMPIRICAL_SHORE_REST_CERTIFICATE as R } from '../app/dome-world/previews/a15-r0/western-horizon-empirical-shore-rest.js';

assert.equal(ENTROBENCH_EXOGENOUS_WITNESS_PARENT,'22d8596c846322804c11fd94992f719d1f9cd9bd');
assert.equal(R.status,'OFFICIAL_RESEARCH_REST');
assert.equal(R.reopen_condition,'INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION');
assert.equal(R.exogenous_witness_acquired,false);

assert.equal(W.anthology_id,'2026.findings-acl.2089');
assert.equal(W.doi,'10.18653/v1/2026.findings-acl.2089');
assert.equal(W.code_repository,'py-qin/EntroBench');
assert.equal(W.code_head,'375d40601826e775b4bd7d790a19563b477bc5b6');
assert.equal(W.absent_from_frozen_td613_parent_search,true);
assert.equal(W.calibration.target_tpr,0.98);
assert.equal(W.observed_route_deformation.length,4);
for(const x of W.observed_route_deformation)assert.ok(x.post_tpr<x.pre_tpr,'Admitted route-deformation observations must be empirical decreases in detectability.');

assert.equal(C.status,'REOPENED_EXOGENOUS_WITNESS_ADMITTED');
assert.deepEqual(C.errors,[]);
assert.equal(C.exogenous_witness_acquired,true);
assert.equal(C.exogenous_witness_admitted,true);
assert.equal(C.materially_new_evidentiary_substrate_present,true);
assert.equal(C.empirical_provenance_deformation_observed,true);
assert.equal(C.western_research_field_reopened,true);
assert.equal(C.sequence_authority,false);
assert.equal(C.numbered_stage_authority,false);
assert.equal(C.externality_reproved_by_internal_ci,false);
assert.equal(C.external_origin_claim_from_record_alone,false);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.golden_egg_matched_return_acquired,false);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.live_loom_mutated,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const internalTheater=structuredClone(W);
internalTheater.evidence_class='INTERNAL_SELF_ATTESTED_EXTERNAL_LABEL';
assert.equal(admitEntroBenchExogenousWitness(internalTheater).status,'INADMISSIBLE');

const parentPresent=structuredClone(W);
parentPresent.absent_from_frozen_td613_parent_search=false;
assert.equal(admitEntroBenchExogenousWitness(parentPresent).status,'INADMISSIBLE');

const noEmpiricism=structuredClone(W);
noEmpiricism.observed_route_deformation=[];
assert.equal(admitEntroBenchExogenousWitness(noEmpiricism).status,'INADMISSIBLE');

const fakeNoDeformation=structuredClone(W);
fakeNoDeformation.observed_route_deformation[0].post_tpr=0.99;
assert.equal(admitEntroBenchExogenousWitness(fakeNoDeformation).status,'INADMISSIBLE');

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/REOPENED_EXOGENOUS_WITNESS_ADMITTED/);
assert.match(receipt,/EXOGENOUS_WITNESS_ADMISSION != FIVE_SURFACE_ACQUISITION/);
assert.match(receipt,/INTERNAL_CI_VALIDATES_CUSTODY != INTERNAL_CI_PROVES_EXTERIORITY/);

const expectations=JSON.parse(fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_EXPECTATIONS_V0_1.json','utf8'));
assert.equal(expectations.required_state.exogenous_witness_acquired,true);
assert.equal(expectations.required_state.golden_egg_earned,false);
assert.equal(expectations.required_state.empirical_credit_to_golden_egg,0);

console.log('A15-R0 EntroBench exogenous witness admission tests passed.');
