import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_PARENT,
  CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_CERTIFICATE as C,
  EXTERIORITY_TWIN_WORLD_BASE as B,
  DERIVED_FROM_A_CHANNEL as D,
  SYNTHETIC_EXOGENOUS_CHANNEL_PROBE as X,
  mutualInformationBits,
  evaluateConditionalExteriorityInformationGain
} from '../app/dome-world/previews/a15-r0/conditional-exteriority-information-gain.js';
import { RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CERTIFICATE as PARENT } from '../app/dome-world/previews/a15-r0/receiver-swap-causal-admissibility.js';

assert.equal(CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_PARENT,'fb3501cec8a96e7918ed5ac88c7096577eb88056');
assert.equal(PARENT.status,'RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CRITERION_EARNED');
assert.equal(PARENT.formal_contrast_ready_for_empirical_acquisition,true);
assert.equal(PARENT.receiver_effect_observed,false);

assert.equal(B.admitted_record_origin_information_bits,0);
assert.equal(B.omega_world_not_identical_to_omega_model,true);
assert.equal(D.derived_from_admitted_record_A,true);
assert.equal(D.causal_production_independent_of_A,false);
assert.equal(X.derived_from_admitted_record_A,false);
assert.equal(X.independently_governed,true);
assert.equal(X.shares_upstream_source_with_A,false);
assert.equal(X.causal_production_independent_of_A,true);
assert.equal(X.statistical_independence_from_origin_assumed,false);
assert.equal(X.externally_measured,false);

assert.ok(Math.abs(mutualInformationBits(B.prior,D.conditional_likelihoods))<=1e-12);
assert.ok(mutualInformationBits(B.prior,X.conditional_likelihoods)>0);

assert.equal(C.status,'CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_CRITERION_EARNED');
assert.deepEqual(C.errors,[]);
assert.equal(C.conditional_information_gain_criterion_earned,true);
assert.equal(C.admitted_record_origin_information_bits,0);
assert.ok(Math.abs(C.derived_channel_conditional_information_bits)<=1e-12);
assert.ok(C.synthetic_exogenous_probe_conditional_information_bits>0);
assert.equal(C.synthetic_exogenous_probe_conditional_information_positive,true);
assert.equal(C.derived_channel_rejected_as_new_exteriority_information,true);
assert.equal(C.non_derivative_channel_topology_required,true);
assert.equal(C.source_independence_required,true);
assert.equal(C.causal_production_independence_required,true);
assert.equal(C.statistical_independence_assumed,false);
assert.equal(C.likelihood_separation_required,true);
assert.equal(C.empirical_exogenous_channel_acquired,false);
assert.equal(C.empirical_exteriority_information_gain_measured,false);
assert.equal(C.synthetic_probe_only,true);
assert.equal(C.empirical_credit_from_synthetic_probe,0);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.numbered_stage_authority,false);

const derivedLeaksOrigin=structuredClone(D);
derivedLeaksOrigin.conditional_likelihoods=[[0.7,0.3],[0.3,0.7]];
assert.equal(evaluateConditionalExteriorityInformationGain({derivedChannel:derivedLeaksOrigin}).status,'INADMISSIBLE');

const secretlyDerived=structuredClone(X);
secretlyDerived.derived_from_admitted_record_A=true;
assert.equal(evaluateConditionalExteriorityInformationGain({exogenousProbe:secretlyDerived}).status,'INADMISSIBLE');

const sharedUpstream=structuredClone(X);
sharedUpstream.shares_upstream_source_with_A=true;
assert.equal(evaluateConditionalExteriorityInformationGain({exogenousProbe:sharedUpstream}).status,'INADMISSIBLE');

const governedTogether=structuredClone(X);
governedTogether.independently_governed=false;
assert.equal(evaluateConditionalExteriorityInformationGain({exogenousProbe:governedTogether}).status,'INADMISSIBLE');

const productionDependent=structuredClone(X);
productionDependent.causal_production_independent_of_A=false;
assert.equal(evaluateConditionalExteriorityInformationGain({exogenousProbe:productionDependent}).status,'INADMISSIBLE');

const noLikelihoodSeparation=structuredClone(X);
noLikelihoodSeparation.conditional_likelihoods=[[0.5,0.5],[0.5,0.5]];
assert.equal(evaluateConditionalExteriorityInformationGain({exogenousProbe:noLikelihoodSeparation}).status,'INADMISSIBLE');

const fakeExternalMeasurement=structuredClone(X);
fakeExternalMeasurement.externally_measured=true;
assert.equal(evaluateConditionalExteriorityInformationGain({exogenousProbe:fakeExternalMeasurement}).status,'INADMISSIBLE');

const originAlreadyInA=structuredClone(B);
originAlreadyInA.admitted_record_origin_information_bits=0.1;
assert.equal(evaluateConditionalExteriorityInformationGain({base:originAlreadyInA}).status,'INADMISSIBLE');

const ontologyCollapse=structuredClone(B);
ontologyCollapse.omega_world_not_identical_to_omega_model=false;
assert.equal(evaluateConditionalExteriorityInformationGain({base:ontologyCollapse}).status,'INADMISSIBLE');

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/I\(Ω;X \| A\) > 0/);
assert.match(receipt,/SYNTHETIC_LIKELIHOOD_PROBE != EXTERNAL_WITNESS/);
assert.match(receipt,/MULTIPLE_ENDPOINTS != MULTIPLE_INDEPENDENT_SOURCES/);
assert.match(receipt,/ORIGIN_HYPOTHESIS_VARIABLE != EXTERNALITY_ONTOLOGY/);
assert.match(receipt,/CONDITIONAL_EXTERIORITY_INFORMATION_GAIN != GOLDEN_EGG_MEASUREMENT/);

const expectations=JSON.parse(fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/CONDITIONAL_EXTERIORITY_INFORMATION_GAIN_EXPECTATIONS_V0_1.json','utf8'));
assert.equal(expectations.required_state.conditional_information_gain_criterion_earned,true);
assert.equal(expectations.required_state.empirical_exogenous_channel_acquired,false);
assert.equal(expectations.required_state.empirical_exteriority_information_gain_measured,false);
assert.equal(expectations.required_state.empirical_credit_from_synthetic_probe,0);
assert.equal(expectations.required_state.golden_egg_earned,false);

await import('./ash-a15-r0-mve-x1-present-resource-feasibility.test.mjs');

console.log('A15-R0 conditional exteriority information-gain admissibility tests passed.');
