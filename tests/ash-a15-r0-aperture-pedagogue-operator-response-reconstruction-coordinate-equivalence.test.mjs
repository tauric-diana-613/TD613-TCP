import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  OPERATOR_RESPONSE_RECONSTRUCTION_SCHEMA,
  measurementRow,
  measurementMatrix,
  scalarResponse,
  responseTable,
  matrixRank,
  determinant,
  solveAffineResponseFamily,
  validateReconstructionInput,
  reconstructOperatorFromResponses,
  heldoutResponseOverAffineFamily,
  transformProbe,
  transformProbeFamily,
  conjugateOperator,
  auditCoordinateEquivalentReconstructions,
  buildOperatorResponseReconstructionFixture,
  runOperatorResponseReconstructionGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-operator-response-reconstruction-coordinate-equivalence.js';

const approx=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t,`actual=${a} expected=${b}`);
const approxVec=(a,b,t=1e-9)=>{assert.equal(a.length,b.length);a.forEach((v,i)=>approx(v,b[i],t));};
const approxMat=(a,b,t=1e-9)=>{assert.equal(a.length,b.length);a.forEach((r,i)=>approxVec(r,b[i],t));};

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_OPERATOR_RESPONSE_RECONSTRUCTION_COORDINATE_EQUIVALENCE_GAUNTLET_SPEC_V0_1.md','utf8');
const impl=fs.readFileSync('app/dome-world/previews/a15-r0/aperture-pedagogue-operator-response-reconstruction-coordinate-equivalence.js','utf8');

assert.equal(OPERATOR_RESPONSE_RECONSTRUCTION_SCHEMA,'td613.a15-r0.aperture-pedagogue-operator-response-reconstruction-coordinate-equivalence/v0.1');
for(const phrase of [
  'three matching scalar responses != full operator identification',
  'raw matrix representative != coordinate-invariant scalar response law',
  'declared known coordinate transformation != gauge-blind inference theorem',
  'conjugating the matrix alone != changing coordinates',
  'naming criteria satisfied != canonical terminology promotion',
  'operator-response reconstruction != path transport'
]) assert.ok(spec.includes(phrase),`spec missing ${phrase}`);
assert.match(spec,/rank\(A\) = 4/);
assert.match(spec,/det\(A\) = -2/);
assert.match(spec,/BOUNDED_FINITE_OPERATOR_TOMOGRAPHY_NAMING_CRITERIA_SATISFIED_IN_AUTHORED_2X2_BILINEAR_RESPONSE_FIXTURE/);
assert.match(spec,/PAUSE_AT_HUMAN_NAMING_AND_PROGRAM_PROMOTION_SEAM/);
assert.doesNotMatch(spec,/Canonical use of the term `operator tomography`:\s*AUTHORIZED/);

const fixture=buildOperatorResponseReconstructionFixture();
const probes=fixture.training_probes;
assert.deepEqual(fixture.training_responses,[3,4,3,-2]);
assert.deepEqual(measurementRow(probes[0]),[1,1,0,0]);
assert.deepEqual(measurementRow(probes[1]),[0,0,1,1]);
assert.deepEqual(measurementRow(probes[2]),[1,0,1,0]);
assert.deepEqual(measurementRow(probes[3]),[0,1,0,-1]);
const A=measurementMatrix(probes);
assert.deepEqual(A,[[1,1,0,0],[0,0,1,1],[1,0,1,0],[0,1,0,-1]]);
assert.equal(matrixRank(A),4);
approx(determinant(A),-2);
approxVec(responseTable(fixture.synthetic_truth.T_star,probes),fixture.training_responses);

const ps3=probes.slice(0,3),z3=fixture.training_responses.slice(0,3),A3=A.slice(0,3);
assert.equal(matrixRank(A3),3);
const fam3=solveAffineResponseFamily(ps3,z3);
assert.equal(fam3.status,'AFFINE_COMPATIBLE_OPERATOR_FAMILY');
assert.equal(fam3.rank,3);
assert.equal(fam3.nullity,1);
assert.equal(fam3.nullspace_basis.length,1);
const n=[1,-1,-1,1];
for(const row of A3) approx(row.reduce((s,v,i)=>s+v*n[i],0),0);
approxVec(responseTable(fixture.synthetic_truth.T_alt,ps3),[3,4,3]);
approx(scalarResponse(fixture.synthetic_truth.T_alt,probes[3]),-4);
approx(scalarResponse(fixture.synthetic_truth.T_star,probes[3]),-2);

const holdRow=measurementRow(fixture.heldout_probe);
assert.deepEqual(holdRow,[2,4,-1,-2]);
assert.equal(matrixRank([...A3,holdRow]),4);
approx(scalarResponse(fixture.synthetic_truth.T_star,fixture.heldout_probe),1);
approx(scalarResponse(fixture.synthetic_truth.T_alt,fixture.heldout_probe),-2);
const holdBefore=heldoutResponseOverAffineFamily(fam3,fixture.heldout_probe);
assert.equal(holdBefore.status,'HELDOUT_RESPONSE_UNIDENTIFIED_OVER_CURRENT_COMPATIBLE_OPERATOR_FAMILY');
assert.equal(holdBefore.response_unbounded,true);
assert.ok(holdBefore.nullspace_response_directions.some(v=>Math.abs(v)>1e-9));

const canonical=reconstructOperatorFromResponses({probes:structuredClone(probes),responses:structuredClone(fixture.training_responses)});
assert.equal(canonical.status,'FULL_FINITE_OPERATOR_RESPONSE_RECONSTRUCTION_IN_DECLARED_COORDINATES');
approxMat(canonical.operator,[[2,1],[1,3]]);
approxVec(responseTable(canonical.operator,probes),fixture.training_responses);
approx(scalarResponse(canonical.operator,fixture.heldout_probe),1);

for(const forbidden of ['T_star','T_alt','synthetic_oracle','expected_operator','heldout_response','open_set_response','G','target_clone_matrix']){
  assert.throws(()=>validateReconstructionInput({probes:structuredClone(probes),responses:structuredClone(fixture.training_responses),[forbidden]:'forbidden'}),/REJECT_ORACLE_LEAKAGE_IN_OPERATOR_RESPONSE_RECONSTRUCTION/);
}

const G=fixture.declared_coordinate_transform;
assert.deepEqual(G,[[1,1],[0,1]]);
const Tprime=conjugateOperator(fixture.synthetic_truth.T_star,G);
approxMat(Tprime,[[3,1],[1,2]]);
const transformed=transformProbeFamily(probes,G);
assert.deepEqual(transformed,[
  {probe_id:"M1'",r:[1,-1],x:[2,1]},
  {probe_id:"M2'",r:[0,1],x:[2,1]},
  {probe_id:"M3'",r:[1,0],x:[1,0]},
  {probe_id:"M4'",r:[1,-2],x:[1,1]}
]);
const Aprime=measurementMatrix(transformed);
assert.deepEqual(Aprime,[[2,1,-2,-1],[0,0,2,1],[1,0,0,0],[1,1,-2,-2]]);
assert.equal(matrixRank(Aprime),4);
approx(determinant(Aprime),-2);
approxVec(responseTable(Tprime,transformed),fixture.training_responses);

const cloneRecon=reconstructOperatorFromResponses({probes:structuredClone(transformed),responses:structuredClone(fixture.training_responses)});
approxMat(cloneRecon.operator,[[3,1],[1,2]]);
const coordAudit=auditCoordinateEquivalentReconstructions({canonical_operator:canonical.operator,clone_operator:cloneRecon.operator,G});
assert.equal(coordAudit.coordinate_relation_holds,true);
assert.equal(coordAudit.status,'DECLARED_COORDINATE_EQUIVALENCE_AUDIT_PASS');

const transformedHold=transformProbe(fixture.heldout_probe,G);
assert.deepEqual(transformedHold,{probe_id:"HOLDOUT'",r:[2,-3],x:[3,2]});
approx(scalarResponse(cloneRecon.operator,transformedHold),1);

const result=runOperatorResponseReconstructionGauntlet();
assert.equal(result.schema,OPERATOR_RESPONSE_RECONSTRUCTION_SCHEMA);
assert.equal(result.canonical_design.rank,4);
approx(result.canonical_design.determinant,-2);
assert.equal(result.incomplete_family.rank,3);
assert.equal(result.incomplete_family.nullity,1);
approxVec(result.incomplete_family.null_vector_residual,[0,0,0]);
approxVec(result.incomplete_family.alt_first_three_responses,[3,4,3]);
approx(result.incomplete_family.alt_fourth_response,-4);
approx(result.incomplete_family.truth_fourth_response,-2);
approx(result.incomplete_family.heldout_truth_response,1);
approx(result.incomplete_family.heldout_alt_response,-2);
assert.equal(result.incomplete_family.heldout_audit.status,'HELDOUT_RESPONSE_UNIDENTIFIED_OVER_CURRENT_COMPATIBLE_OPERATOR_FAMILY');
approxMat(result.canonical_reconstruction.operator,[[2,1],[1,3]]);
approx(result.canonical_reconstruction.heldout_prediction,1);
assert.equal(result.canonical_reconstruction.heldout_status,'HELDOUT_RESPONSE_COMPLETED_FROM_RECONSTRUCTED_OPERATOR');
assert.equal(result.coordinate_clone.rank,4);
approx(result.coordinate_clone.determinant,-2);
approxMat(result.coordinate_clone.reconstruction.operator,[[3,1],[1,2]]);
assert.equal(result.coordinate_clone.coordinate_audit.coordinate_relation_holds,true);
approx(result.coordinate_clone.transformed_heldout_prediction,1);
assert.deepEqual(result.partial_coordinate_hostiles.transformed_operator_and_inputs_stale_readouts,[7,4,4,1]);
assert.deepEqual(result.partial_coordinate_hostiles.transformed_operator_and_readouts_stale_inputs,[1,3,3,-3]);
assert.deepEqual(result.partial_coordinate_hostiles.transformed_operator_only,[4,3,4,-1]);
assert.equal(result.partial_coordinate_hostiles.all_rejected,true);
assert.equal(result.partial_coordinate_hostiles.status,'REJECT_PARTIAL_COORDINATE_TRANSFORMATION');
assert.equal(result.open_set.training_table_matches,true);
approx(result.open_set.heldout_prediction,1);
approx(result.open_set.heldout_observation,2);
assert.equal(result.open_set.status,'DECLARED_LINEAR_OPERATOR_RESPONSE_MODEL_DEFEATED_BY_HELDOUT_RESPONSE');
assert.equal(result.open_set.preserve_contradiction_as_evidence,true);
assert.equal(result.open_set.silent_model_class_upgrade,false);
assert.equal(result.leakage_hostiles.reconstruction_oracle_leak_rejected,true);
assert.equal(result.leakage_hostiles.clone_direct_conjugation_shortcut_rejected,true);
assert.equal(result.naming_criteria_satisfied,true);
assert.ok(Object.values(result.naming_criteria).every(Boolean));
assert.equal(result.naming_candidate_token,'BOUNDED_FINITE_OPERATOR_TOMOGRAPHY_NAMING_CRITERIA_SATISFIED_IN_AUTHORED_2X2_BILINEAR_RESPONSE_FIXTURE');
assert.equal(result.canonical_operator_tomography_promotion_authority,false);
assert.equal(result.operator_tomography_general_theorem_earned,false);
assert.equal(result.blind_tomography_earned,false);
assert.equal(result.physical_tomography_earned,false);
assert.equal(result.path_category_earned,false);
assert.equal(result.path_transport_earned,false);
assert.equal(result.holonomy_earned,false);
assert.equal(result.a16_reopened,false);
assert.equal(result.live_ash_mutation,false);
assert.equal(result.production_authority,false);
assert.equal(result.vercel_authority,false);
assert.equal(result.fixture_immutable,true);

assert.match(impl,/canonical_operator_tomography_promotion_authority:false/);
assert.match(impl,/path_transport_earned:false/);
assert.match(impl,/holonomy_earned:false/);

console.log(JSON.stringify({
  schema:result.schema,
  canonical_rank:result.canonical_design.rank,
  canonical_determinant:result.canonical_design.determinant,
  incomplete_nullity:result.incomplete_family.nullity,
  heldout_before:result.incomplete_family.heldout_audit.status,
  heldout_after:result.canonical_reconstruction.heldout_prediction,
  clone_operator:result.coordinate_clone.reconstruction.operator,
  partial_coordinate_hostiles_rejected:result.partial_coordinate_hostiles.all_rejected,
  open_set_status:result.open_set.status,
  naming_criteria_satisfied:result.naming_criteria_satisfied,
  naming_candidate_token:result.naming_candidate_token,
  canonical_promotion_authority:result.canonical_operator_tomography_promotion_authority
},null,2));
