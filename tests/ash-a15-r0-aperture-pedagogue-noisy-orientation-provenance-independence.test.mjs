import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  NOISY_ORIENTATION_PROVENANCE_INDEPENDENCE_SCHEMA,
  certifyOrientationSign,
  buildValidNoiseOuterCases,
  buildNearZeroAmbiguityControls,
  buildUnderdeclaredNoiseFalsifier,
  classifyProvenanceIndependence,
  buildProvenanceFixtures,
  runNoisyOrientationProvenanceIndependenceGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-noisy-orientation-provenance-independence.js';

assert.equal(certifyOrientationSign({y_hat:0.001,bound:0.0002}).orientation_status,'CERTIFIED_POSITIVE');
assert.equal(certifyOrientationSign({y_hat:-0.001,bound:0.0002}).orientation_status,'CERTIFIED_NEGATIVE');
assert.equal(certifyOrientationSign({y_hat:0.0002,bound:0.0002}).orientation_status,'ORIENTATION_UNRESOLVED');
assert.equal(certifyOrientationSign({y_hat:-0.0002,bound:0.0002}).orientation_status,'ORIENTATION_UNRESOLVED');
assert.throws(() => certifyOrientationSign({y_hat:0,bound:-1}), /non-negative/);
assert.throws(() => certifyOrientationSign({y_hat:Number.NaN,bound:0.1}), /finite/);

const outer=buildValidNoiseOuterCases();
assert.equal(outer.length,18);
assert.equal(outer.filter(item=>item.certification.orientation_status==='ORIENTATION_UNRESOLVED').length,0);
assert.equal(outer.filter(item=>!item.correct_sign_certification).length,0);
assert.equal(outer.filter(item=>!item.closure).length,0);
assert.ok(outer.every(item=>item.declared_bound_holds===true));
assert.ok(outer.every(item=>item.eligible_for_valid_bound_support===true));

const nearZero=buildNearZeroAmbiguityControls();
assert.equal(nearZero.length,5);
assert.ok(nearZero.every(item=>item.certification.orientation_status==='ORIENTATION_UNRESOLVED'));
assert.ok(nearZero.every(item=>item.certification.disposition==='ABSTAIN_ORIENTATION_UNRESOLVED'));
assert.ok(nearZero.every(item=>item.both_repairs_admissible===true));
assert.ok(nearZero.every(item=>item.plus_repair.terminal_audit.aperture.disposition==='ASK_NOTHING'));
assert.ok(nearZero.every(item=>item.minus_repair.terminal_audit.aperture.disposition==='ASK_NOTHING'));

const falsifier=buildUnderdeclaredNoiseFalsifier();
assert.equal(falsifier.true_y,0.0008);
assert.equal(falsifier.y_hat,-0.0001);
assert.ok(Math.abs(falsifier.actual_eta - (-0.0009)) < 1e-15);
assert.equal(falsifier.declared_bound_holds,false);
assert.equal(falsifier.bound_status,'DECLARED_NOISE_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH');
assert.equal(falsifier.eligible_for_valid_bound_support,false);
assert.equal(falsifier.certification.orientation_status,'CERTIFIED_NEGATIVE');
assert.equal(falsifier.selected_repair_replay.action,'Q_MINUS_REPAIR');
assert.equal(falsifier.closure,false);

const fixtures=buildProvenanceFixtures();
assert.equal(fixtures.P1.raw_record_count,2);
assert.equal(fixtures.P1.unique_root_count,1);
assert.equal(fixtures.P1.independent_support_count,1);
assert.equal(fixtures.P1.status,'SINGLE_ROOT_DUPLICATES_DO_NOT_AMPLIFY');
assert.equal(fixtures.P1.resolved_route,'Q_A');

assert.equal(fixtures.P2.unique_root_count,2);
assert.equal(fixtures.P2.independent_support_count,2);
assert.equal(fixtures.P2.status,'MULTI_ROOT_AGREEMENT_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(fixtures.P2.resolved_route,'Q_A');

assert.equal(fixtures.P3.status,'PROVENANCE_CONFLICT_HOLD');
assert.equal(fixtures.P3.resolved_route,null);
assert.equal(fixtures.P3.duplicate_majority_vote_used,false);

assert.deepEqual(fixtures.P4.raw_route_counts,{Q_B:2,Q_A:1});
assert.equal(fixtures.P4.unique_root_count,2);
assert.equal(fixtures.P4.status,'PROVENANCE_CONFLICT_HOLD');
assert.equal(fixtures.P4.resolved_route,null);
assert.equal(fixtures.P4.duplicate_majority_vote_used,false);

assert.equal(fixtures.P5.status,'SOURCE_ROOT_INTERNAL_CONFLICT_HOLD');
assert.equal(fixtures.P5.resolved_route,null);

assert.throws(() => classifyProvenanceIndependence([]), /non-empty array/);
assert.throws(() => classifyProvenanceIndependence([
  {witness_id:'X',source_root_id:'R',route_value:'Q_A',derivation_kind:'UNDECLARED'}
]), /preregistered/);

const receipt=runNoisyOrientationProvenanceIndependenceGauntlet();
assert.equal(receipt.schema,NOISY_ORIENTATION_PROVENANCE_INDEPENDENCE_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.valid_noise_envelope.case_count,18);
assert.equal(receipt.valid_noise_envelope.certified_correct_count,18);
assert.equal(receipt.valid_noise_envelope.closure_count,18);
assert.equal(receipt.valid_noise_envelope.abstention_count,0);
assert.equal(receipt.valid_noise_envelope.wrong_sign_certification_count,0);
assert.equal(receipt.near_zero_ambiguity_controls.abstention_count,5);
assert.equal(receipt.near_zero_ambiguity_controls.both_repairs_admissible_count,5);
assert.equal(receipt.underdeclared_noise_falsifier.bound_status,'DECLARED_NOISE_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH');
assert.equal(receipt.decision_custody_non_interference.orientation_decision_locally_actionable,true);
assert.equal(receipt.decision_custody_non_interference.provenance_custody_status,'PROVENANCE_CONFLICT_HOLD');
assert.equal(receipt.decision_custody_non_interference.combined_confidence_scalar,null);
assert.equal(receipt.decision_custody_non_interference.custody_rewritten_by_orientation,false);
assert.equal(receipt.decision_custody_non_interference.orientation_rewritten_by_custody,false);
assert.equal(receipt.gauntlet_status,'NOISY_DECISION_COORDINATE_AND_PROVENANCE_INDEPENDENCE_BOUNDARY_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate,/interval-certified signed orientation/);
assert.match(receipt.bounded_refinement_candidate,/duplicate amplification/);
assert.match(receipt.bounded_refinement_candidate,/decision and custody remain distinct/);
assert.equal(receipt.claims.real_world_provenance_independence,false);
assert.equal(receipt.claims.active_learning,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.physical_tomography,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);
assert.match(receipt.next_learning_action,/TEST_JOINT_DECISION_AND_CUSTODY_HOLD_COMPOSITION/);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_NOISY_ORIENTATION_PROVENANCE_INDEPENDENCE_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/Preregistration boundary: \*\*frozen before executable implementation\.\*\*/);
assert.match(spec,/all 18 certified signs equal the synthetic true sign/);
assert.match(spec,/all five cases/);
assert.match(spec,/DECLARED_NOISE_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH/);
assert.match(spec,/duplicate_majority_vote_used = false/);
assert.match(spec,/decision state != custody state/);
assert.match(spec,/TEST_JOINT_DECISION_AND_CUSTODY_HOLD_COMPOSITION/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  valid_noise_cases:receipt.valid_noise_envelope.case_count,
  valid_noise_closures:receipt.valid_noise_envelope.closure_count,
  near_zero_abstentions:receipt.near_zero_ambiguity_controls.abstention_count,
  near_zero_both_repairs_admissible:receipt.near_zero_ambiguity_controls.both_repairs_admissible_count,
  underdeclared_bound_status:receipt.underdeclared_noise_falsifier.bound_status,
  provenance_statuses:{
    P1:receipt.provenance_fixtures.P1.status,
    P2:receipt.provenance_fixtures.P2.status,
    P3:receipt.provenance_fixtures.P3.status,
    P4:receipt.provenance_fixtures.P4.status,
    P5:receipt.provenance_fixtures.P5.status
  },
  non_interference:{
    orientation_actionable:receipt.decision_custody_non_interference.orientation_decision_locally_actionable,
    provenance_status:receipt.decision_custody_non_interference.provenance_custody_status,
    combined_confidence_scalar:receipt.decision_custody_non_interference.combined_confidence_scalar
  },
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
