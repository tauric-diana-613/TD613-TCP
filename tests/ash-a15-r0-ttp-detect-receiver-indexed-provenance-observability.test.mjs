import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TTP_DETECT_EXTERNAL_WITNESS as W,
  TTP_DETECT_RECEIVER_INDEXED_PROVENANCE_CERTIFICATE as C,
  TTP_DETECT_RECEIVER_INDEXED_PARENT,
  evaluateTtpDetectReceiverIndexedProvenance
} from '../app/dome-world/previews/a15-r0/ttp-detect-receiver-indexed-provenance-observability.js';
import { ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_CERTIFICATE as E } from '../app/dome-world/previews/a15-r0/entrobench-exogenous-witness-admission.js';
import { AGENTMARK_HETEROSTRATIGRAPHIC_PROVENANCE_CERTIFICATE as A } from '../app/dome-world/previews/a15-r0/agentmark-heterostratigraphic-provenance-carrier-separation.js';

assert.equal(TTP_DETECT_RECEIVER_INDEXED_PARENT,'32cd280fa0de84ff830cae3c768e53da2cc482aa');
assert.equal(E.status,'REOPENED_EXOGENOUS_WITNESS_ADMITTED');
assert.equal(E.empirical_provenance_deformation_observed,true);
assert.equal(A.status,'HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION_EARNED');
assert.equal(A.provenance_observability_heterostratigraphic,true);

assert.equal(W.anthology_id,'2026.findings-acl.990');
assert.equal(W.doi,'10.18653/v1/2026.findings-acl.990');
assert.equal(W.receiver_role,'TRUSTED_THIRD_PARTY_AUDITOR');
assert.equal(W.access_profile.watermark_secret_key,false);
assert.equal(W.access_profile.watermark_mechanism,false);
assert.equal(W.access_profile.provider_internal_model_states,false);
assert.equal(W.access_profile.provider_scheme_specific_detector,false);
assert.equal(W.access_profile.observable_output_behavior,true);
assert.equal(W.observer_apparatus.relative_hypothesis_testing,true);
assert.equal(W.observer_apparatus.benign_threshold_calibration,true);
assert.equal(W.empirical_scope.watermark_families.length,7);
assert.equal(W.empirical_scope.unigram_min_reported_auc,0.999);
assert.equal(W.empirical_scope.symmark_reported_f1,1.000);
assert.equal(W.empirical_scope.symmark_reported_auc,1.000);
assert.equal(W.empirical_scope.sweet_average_auc_drop_vs_kgw_percent,0.38);
assert.equal(W.empirical_scope.kgw_average_auc_under_reported_attacks,0.980);
assert.equal(W.direct_same_artifact_multi_receiver_causal_contrast,false);

assert.equal(C.status,'RECEIVER_INDEXED_PROVENANCE_OBSERVABILITY_EARNED');
assert.deepEqual(C.errors,[]);
assert.equal(C.route_axis_antecedent_admitted,true);
assert.equal(C.carrier_axis_antecedent_admitted,true);
assert.equal(C.receiver_axis_admitted,true);
assert.equal(C.injection_authority_decoupled_from_detection_observability,true);
assert.equal(C.keyless_black_box_third_party_detection_observed,true);
assert.equal(C.receiver_side_observer_apparatus_empirically_productive,true);
assert.equal(C.provenance_observability_artifact_only_scalar_proxy,false);
assert.equal(C.provenance_observability_injector_privilege_required,false);
assert.equal(C.same_artifact_multi_receiver_direct_causal_contrast_observed,false);
assert.equal(C.tri_axial_route_carrier_receiver_support,'BOUNDED_CROSS_STUDY_COMPARATIVE');
assert.equal(C.tri_axial_same_episode_coobservation,false);
assert.equal(C.tri_axial_factorized_independence_earned,false);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.golden_egg_matched_return_acquired,false);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.numbered_stage_authority,false);
assert.equal(C.live_loom_mutated,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const keyLeak=structuredClone(W);
keyLeak.access_profile.watermark_secret_key=true;
assert.equal(evaluateTtpDetectReceiverIndexedProvenance(keyLeak).status,'INADMISSIBLE');

const whiteBox=structuredClone(W);
whiteBox.access_profile.provider_internal_model_states=true;
assert.equal(evaluateTtpDetectReceiverIndexedProvenance(whiteBox).status,'INADMISSIBLE');

const providerDetector=structuredClone(W);
providerDetector.access_profile.provider_scheme_specific_detector=true;
assert.equal(evaluateTtpDetectReceiverIndexedProvenance(providerDetector).status,'INADMISSIBLE');

const noRelativeTest=structuredClone(W);
noRelativeTest.observer_apparatus.relative_hypothesis_testing=false;
assert.equal(evaluateTtpDetectReceiverIndexedProvenance(noRelativeTest).status,'INADMISSIBLE');

const fakeReceiverAblation=structuredClone(W);
fakeReceiverAblation.direct_same_artifact_multi_receiver_causal_contrast=true;
assert.equal(evaluateTtpDetectReceiverIndexedProvenance(fakeReceiverAblation).status,'INADMISSIBLE');

const fakeAuc=structuredClone(W);
fakeAuc.empirical_scope.unigram_min_reported_auc=0.998;
assert.equal(evaluateTtpDetectReceiverIndexedProvenance(fakeAuc).status,'INADMISSIBLE');

const wrongPaper=structuredClone(W);
wrongPaper.anthology_id='2026.findings-acl.000';
assert.equal(evaluateTtpDetectReceiverIndexedProvenance(wrongPaper).status,'INADMISSIBLE');

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/TTP_DETECT_RECEIVER_INDEXED_PROVENANCE_OBSERVABILITY_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/RECEIVER_SIDE_OBSERVABILITY != SAME_ARTIFACT_RECEIVER_CAUSAL_ABLATION/);
assert.match(receipt,/ENTROBENCH_AGENTMARK_TTP_CROSS_STUDY_BRAID != SAME_EPISODE_TRIAXIAL_COOBSERVATION/);
assert.match(receipt,/EXTERNAL_EMPIRICAL_RECEIVER_WITNESS != GOLDEN_EGG_MEASUREMENT/);

const expectations=JSON.parse(fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/TTP_DETECT_RECEIVER_INDEXED_PROVENANCE_OBSERVABILITY_EXPECTATIONS_V0_1.json','utf8'));
assert.equal(expectations.required_state.receiver_axis_admitted,true);
assert.equal(expectations.required_state.tri_axial_same_episode_coobservation,false);
assert.equal(expectations.required_state.tri_axial_factorized_independence_earned,false);
assert.equal(expectations.required_state.golden_egg_earned,false);
assert.equal(expectations.required_state.empirical_credit_to_golden_egg,0);

console.log('A15-R0 TTP-Detect receiver-indexed provenance observability tests passed.');
