import test from 'node:test';
import assert from 'node:assert/strict';
import { runOpenSetHolonomyProbeDesignAssay } from '../app/dome-world/previews/a15-r0/open-set-holonomy-probe-design.js';

test('matched alias and diverse schedules preserve the same three-scalar budget',()=>{
  const result=runOpenSetHolonomyProbeDesignAssay();
  assert.equal(result.schedules.alias.observation_count,3);
  assert.equal(result.schedules.diverse.observation_count,3);
  assert.equal(result.schedules.alias.rank,2);
  assert.equal(result.schedules.diverse.rank,3);
});

test('out-of-family oracle aliases H1 under blind schedule and rejection is not earned',()=>{
  const result=runOpenSetHolonomyProbeDesignAssay();
  const alias=result.cases.alias;
  assert.deepEqual(alias.observed_signature,[3,5,8]);
  assert.deepEqual(alias.surviving_candidate_set,['H1']);
  assert.equal(alias.open_set_rejection_earned,false);
  assert.equal(alias.classification,'OPEN_SET_REJECTION_NOT_EARNED_ALIAS');
  assert.equal(alias.oracle_truth_in_candidate_family,false);
  assert.equal(alias.oracle_truth_exposed_to_decoder,false);
  assert.equal(alias.oracle_override_applied,false);
  assert.equal(alias.unconditional_truth_identification,false);
});

test('same out-of-family oracle earns rejection under diverse schedule',()=>{
  const result=runOpenSetHolonomyProbeDesignAssay();
  const diverse=result.cases.diverse;
  assert.deepEqual(diverse.observed_signature,[3,5,2]);
  assert.deepEqual(diverse.surviving_candidate_set,[]);
  assert.equal(diverse.open_set_rejection_earned,true);
  assert.equal(diverse.classification,'OPEN_SET_REJECTION_EARNED_BY_DECLARED_PROJECTION_CRITERION');
  assert.equal(diverse.outside_operator_identified_by_name,false);
});

test('admitted H1 control survives diverse exact-signature criterion',()=>{
  const result=runOpenSetHolonomyProbeDesignAssay();
  const control=result.cases.control;
  assert.deepEqual(control.surviving_candidate_set,['H1']);
  assert.equal(control.open_set_rejection_earned,false);
  assert.equal(control.classification,'ADMITTED_H1_CONTROL_SURVIVES_EXACT_SIGNATURE_CRITERION');
  assert.equal(control.failure_to_reject_is_universal_validation,false);
});

test('bounded verdict makes model adequacy projection dependent without universal promotion',()=>{
  const result=runOpenSetHolonomyProbeDesignAssay();
  assert.equal(result.findings.assay_mechanism_validated,true);
  assert.equal(result.findings.open_set_model_adequacy_is_projection_dependent,true);
  assert.equal(result.bounded_answer,'OPEN_SET_MODEL_ADEQUACY_IS_PROJECTION_DEPENDENT_IN_AUTHORED_FINITE_LOOP_FIXTURE');
  assert.equal(result.claims.exact_finite_open_set_projection_geometry,true);
  assert.equal(result.claims.unknown_operator_identified,false);
  assert.equal(result.claims.universal_open_set_recognition,false);
  assert.equal(result.claims.universal_probe_optimality,false);
  assert.equal(result.claims.physical_holonomy,false);
  assert.equal(result.claims.physical_curvature,false);
  assert.equal(result.claims.proto_loom,false);
  assert.equal(result.claims.production_authority,false);
  assert.equal(result.claims.vercel_authority,false);
});
