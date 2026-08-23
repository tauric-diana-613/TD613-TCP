import test from 'node:test';
import assert from 'node:assert/strict';
import { runDiscreteCurvatureRefinementCovarianceAssay } from '../app/dome-world/previews/a15-r0/discrete-curvature-refinement-covariance.js';

test('constant-density meshes preserve exact macro defect and density at n=1,2,3,4',()=>{
  const result=runDiscreteCurvatureRefinementCovarianceAssay();
  for(const mesh of result.covariant_constant_density.meshes){
    assert.equal(mesh.macro_loop_shear,'-2');
    assert.equal(mesh.sum_cell_face_shears,'-2');
    assert.equal(mesh.macro_equals_face_sum,true);
    assert.equal(mesh.cell_face_densities.every(item=>item.value==='-2'),true);
    assert.equal(mesh.all_edges_tomographically_validated,true);
  }
});

test('constant and variable parent-child blocks preserve integrated defect, area, and weighted density',()=>{
  const result=runDiscreteCurvatureRefinementCovarianceAssay();
  for(const family of [result.covariant_constant_density.refinements,result.covariant_variable_field.refinements,result.flat_control.refinements]){
    for(const receipt of family){
      assert.equal(receipt.integrated_defect_covariant,true);
      assert.equal(receipt.area_covariant,true);
      assert.equal(receipt.density_covariant,true);
    }
  }
  assert.equal(result.covariant_variable_field.meshes.every(mesh=>mesh.macro_loop_shear==='-2'),true);
});

test('flat control retains nonidentity edge transport but zero loop defect across refinement',()=>{
  const result=runDiscreteCurvatureRefinementCovarianceAssay();
  assert.equal(result.flat_control.meshes.every(mesh=>mesh.macro_loop_shear==='0'),true);
  assert.equal(result.flat_control.meshes.every(mesh=>mesh.cell_face_shears.every(item=>item.value==='0')),true);
});

test('mis-scaled control is reconstructible and gauge-covariant but refinement-inconsistent',()=>{
  const result=runDiscreteCurvatureRefinementCovarianceAssay();
  assert.deepEqual(result.hostile_mis_scaled_control.meshes.map(mesh=>mesh.macro_loop_shear),['-2','-4','-6','-8']);
  assert.equal(result.hostile_mis_scaled_control.refinements.some(item=>!item.integrated_defect_covariant||!item.density_covariant),true);
  assert.equal(result.hostile_mis_scaled_control.classification,'MIS_SCALED_EDGE_TRANSPORT_REJECTS_REFINEMENT_COVARIANCE');
  assert.equal(result.gauge_clone.hostile_scaling_failure_not_rescued_by_gauge,true);
});

test('gauge covariance preserves admitted loop defects and refinement relations without rescuing bad scaling',()=>{
  const result=runDiscreteCurvatureRefinementCovarianceAssay();
  assert.equal(result.gauge_clone.admitted_loop_defects_preserved,true);
  assert.equal(result.gauge_clone.admitted_refinement_relations_preserved,true);
  assert.equal(result.findings.gauge_covariance_and_refinement_covariance_are_separate_obligations,true);
});

test('bounded verdict earns finite refinement covariance only',()=>{
  const result=runDiscreteCurvatureRefinementCovarianceAssay();
  assert.equal(result.findings.assay_mechanism_validated,true);
  assert.equal(result.findings.all_edges_exactly_tomographed_and_validated,true);
  assert.equal(result.findings.constant_density_refinement_covariant,true);
  assert.equal(result.findings.variable_field_refinement_covariant,true);
  assert.equal(result.findings.hostile_mis_scaled_control_rejected,true);
  assert.equal(result.bounded_answer,'DISCRETE_FACE_CURVATURE_REFINEMENT_COVARIANCE_SURVIVES_ACROSS_AUTHORED_EXACT_RATIONAL_MESH_FAMILY');
  assert.equal(result.continuum_firewall.finite_mesh_family_only,true);
  assert.equal(result.continuum_firewall.limit_n_to_infinity_tested,false);
  assert.equal(result.continuum_firewall.continuum_object_identified,false);
  assert.equal(result.continuum_firewall.physical_scale_identified,false);
  assert.equal(result.claims.refinement_covariance_candidate,true);
  assert.equal(result.claims.continuum_connection,false);
  assert.equal(result.claims.continuum_curvature,false);
  assert.equal(result.claims.physical_curvature,false);
  assert.equal(result.claims.proto_loom,false);
  assert.equal(result.claims.production_authority,false);
  assert.equal(result.claims.vercel_authority,false);
});
