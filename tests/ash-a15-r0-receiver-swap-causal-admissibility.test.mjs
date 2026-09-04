import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  RECEIVER_SWAP_PREREGISTERED_PAIR as P,
  RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CERTIFICATE as C,
  RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_PARENT,
  evaluateReceiverSwapCausalAdmissibility
} from '../app/dome-world/previews/a15-r0/receiver-swap-causal-admissibility.js';
import { TTP_DETECT_RECEIVER_INDEXED_PROVENANCE_CERTIFICATE as T } from '../app/dome-world/previews/a15-r0/ttp-detect-receiver-indexed-provenance-observability.js';

assert.equal(RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_PARENT,'066965424365eb0d76b6cbf2fe0f940cb744b498');
assert.equal(T.status,'RECEIVER_INDEXED_PROVENANCE_OBSERVABILITY_EARNED');
assert.equal(T.receiver_axis_admitted,true);
assert.equal(T.same_artifact_multi_receiver_direct_causal_contrast_observed,false);

assert.equal(P.measurement_values_present_at_freeze,false);
assert.equal(P.allowed_difference,'RECEIVER_APPARATUS_ONLY');
assert.equal(P.synthetic_design_fixture,true);
assert.equal(P.externally_measured,false);
assert.equal(P.empirical_receiver_outcomes,null);
assert.equal(P.receivers.length,2);
assert.notEqual(P.receivers[0].apparatus_id,P.receivers[1].apparatus_id);

assert.equal(C.status,'RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_CRITERION_EARNED');
assert.deepEqual(C.errors,[]);
assert.equal(C.receiver_swap_design_admissible,true);
assert.equal(C.shared_artifact_digest_fixed,true);
assert.equal(C.shared_route_digest_fixed,true);
assert.equal(C.shared_carrier_id_fixed,true);
assert.equal(C.shared_provenance_state_fixed,true);
assert.equal(C.shared_source_custody_fixed,true);
assert.equal(C.shared_observation_window_fixed,true);
assert.equal(C.distinct_receiver_apparatus_required,true);
assert.equal(C.single_allowed_difference_receiver_apparatus,true);
assert.equal(C.formal_contrast_ready_for_empirical_acquisition,true);
assert.equal(C.receiver_effect_observed,false);
assert.equal(C.receiver_effect_empirically_estimated,false);
assert.equal(C.same_artifact_receiver_causal_ablation_acquired,false);
assert.equal(C.synthetic_design_fixture,true);
assert.equal(C.externally_measured,false);
assert.equal(C.empirical_credit_from_formal_design,0);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.numbered_stage_authority,false);
assert.equal(C.live_loom_mutated,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const prefilled=structuredClone(P);
prefilled.measurement_values_present_at_freeze=true;
assert.equal(evaluateReceiverSwapCausalAdmissibility(prefilled).status,'INADMISSIBLE');

const outcomeLeak=structuredClone(P);
outcomeLeak.empirical_receiver_outcomes={rho_0:0.9,rho_1:0.1};
assert.equal(evaluateReceiverSwapCausalAdmissibility(outcomeLeak).status,'INADMISSIBLE');

const fakeExternal=structuredClone(P);
fakeExternal.externally_measured=true;
assert.equal(evaluateReceiverSwapCausalAdmissibility(fakeExternal).status,'INADMISSIBLE');

const sameReceiver=structuredClone(P);
sameReceiver.receivers[1].apparatus_id=sameReceiver.receivers[0].apparatus_id;
assert.equal(evaluateReceiverSwapCausalAdmissibility(sameReceiver).status,'INADMISSIBLE');

const widenedDifference=structuredClone(P);
widenedDifference.allowed_difference='RECEIVER_AND_ROUTE';
assert.equal(evaluateReceiverSwapCausalAdmissibility(widenedDifference).status,'INADMISSIBLE');

const missingRoute=structuredClone(P);
missingRoute.shared.route_digest='';
assert.equal(evaluateReceiverSwapCausalAdmissibility(missingRoute).status,'INADMISSIBLE');

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/RECEIVER_SWAP_DESIGN != RECEIVER_EFFECT_OBSERVED/);
assert.match(receipt,/FORMAL_ADMISSIBILITY != EMPIRICAL_CAUSALITY/);
assert.match(receipt,/RECEIVER_SWAP_CONTRACT != GOLDEN_EGG_MEASUREMENT/);
assert.match(receipt,/TO TEST THE WINDOW, KEEP THE THREAD AND THE JOURNEY STILL/);

const expectations=JSON.parse(fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/RECEIVER_SWAP_CAUSAL_ADMISSIBILITY_EXPECTATIONS_V0_1.json','utf8'));
assert.equal(expectations.required_state.receiver_swap_design_admissible,true);
assert.equal(expectations.required_state.receiver_effect_observed,false);
assert.equal(expectations.required_state.same_artifact_receiver_causal_ablation_acquired,false);
assert.equal(expectations.required_state.formal_contrast_ready_for_empirical_acquisition,true);
assert.equal(expectations.required_state.golden_egg_earned,false);
assert.equal(expectations.required_state.empirical_credit_to_golden_egg,0);

console.log('A15-R0 receiver-swap causal admissibility tests passed.');
