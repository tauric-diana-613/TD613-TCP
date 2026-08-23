import test from 'node:test';
import assert from 'node:assert/strict';
import {
  POSITIVE_RECTANGLES,
  shear,
  determinant2,
  constantPositiveEdge,
  flatEdge,
  variableEdge,
  compileFaceReceipt,
  compileRectangleReceipt,
  runDiscreteFaceCurvatureTomographyAssay
} from '../app/dome-world/previews/a15-r0/discrete-face-curvature-tomography.js';

test('integer shear subgroup preserves exact determinant-one composition grammar',()=>{
  assert.deepEqual(shear(2),[[1,2],[0,1]]);
  assert.equal(determinant2(shear(2)),1);
  assert.deepEqual(constantPositiveEdge([0,3],[1,3]),[[1,6],[0,1]]);
  assert.deepEqual(constantPositiveEdge([1,3],[0,3]),[[1,-6],[0,1]]);
});

test('positive unit face reconstructs exact minus-two defect from edgewise tomography',()=>{
  const face=compileFaceReceipt(4,7,constantPositiveEdge,{expectedDensity:-2});
  assert.equal(face.all_edges_validated,true);
  assert.deepEqual(face.loop_matrix,[[1,-2],[0,1]]);
  assert.equal(face.shear_parameter,-2);
  assert.equal(face.curvature_shear_density,-2);
  assert.equal(face.expected_density_match,true);
  for(const edge of face.edge_receipts){
    assert.equal(edge.determinant,1);
    assert.equal(edge.orientation_inverse_consistent,true);
    assert.equal(edge.legacy_heldout_residual,0);
    assert.equal(edge.guard_heldout_residual,0);
  }
});

test('positive rectangle family scales loop defect with declared lattice area',()=>{
  const expected={R1:-2,R2:-4,R3:-4,R4:-8};
  for(const rect of POSITIVE_RECTANGLES){
    const receipt=compileRectangleReceipt(rect,constantPositiveEdge,{expectedDensity:-2});
    assert.equal(receipt.rectangle_shear,expected[rect.id]);
    assert.equal(receipt.rectangle_shear,-2*receipt.declared_area);
    assert.equal(receipt.curvature_shear_density,-2);
    assert.equal(receipt.stokes_consistent,true);
    assert.equal(receipt.sum_unit_face_shears,receipt.rectangle_shear);
    assert.equal(receipt.unit_face_receipts.every(face=>face.shear_parameter===-2),true);
  }
});

test('flat control has nonidentity local edges but zero face and rectangle defects',()=>{
  const rect=compileRectangleReceipt(POSITIVE_RECTANGLES[3],flatEdge,{expectedDensity:0});
  assert.equal(rect.boundary_edge_receipts.some(edge=>edge.reconstructed_matrix[0][1]!==0),true);
  assert.equal(rect.rectangle_shear,0);
  assert.equal(rect.curvature_shear_density,0);
  assert.equal(rect.unit_face_receipts.every(face=>face.shear_parameter===0),true);
  assert.equal(rect.stokes_consistent,true);
});

test('variable control preserves face summation while rejecting constant-density inference',()=>{
  const expected={R1:{shear:-2,density:-2},R2:{shear:-32,density:-16},R3:{shear:-36,density:-18},R4:{shear:-48,density:-12}};
  for(const rect of POSITIVE_RECTANGLES){
    const receipt=compileRectangleReceipt(rect,variableEdge);
    assert.equal(receipt.rectangle_shear,expected[rect.id].shear);
    assert.equal(receipt.curvature_shear_density,expected[rect.id].density);
    assert.equal(receipt.stokes_consistent,true);
    assert.equal(receipt.sum_unit_face_shears,receipt.rectangle_shear);
    for(const face of receipt.unit_face_receipts){
      assert.equal(face.shear_parameter,-4*face.lower_left[1]-2);
    }
  }
});

test('gauge transform preserves positive, flat, and variable closed-loop defects',()=>{
  const result=runDiscreteFaceCurvatureTomographyAssay();
  assert.equal(result.gauge_clone.positive_family_pass,true);
  assert.equal(result.gauge_clone.flat_family_pass,true);
  assert.equal(result.gauge_clone.variable_family_pass,true);
  for(const [original,gauged] of [
    [result.positive_constant_density.rectangles,result.gauge_clone.positive_rectangles],
    [result.flat_nontrivial_edge_control.rectangles,result.gauge_clone.flat_rectangles],
    [result.variable_face_field_control.rectangles,result.gauge_clone.variable_rectangles]
  ]){
    original.forEach((rect,index)=>{
      assert.equal(gauged[index].rectangle_shear,rect.rectangle_shear);
      assert.deepEqual(gauged[index].unit_face_receipts.map(face=>face.shear_parameter),rect.unit_face_receipts.map(face=>face.shear_parameter));
    });
  }
});

test('full assay preserves claim ceiling and continuum firewall',()=>{
  const result=runDiscreteFaceCurvatureTomographyAssay();
  assert.equal(result.findings.assay_mechanism_validated,true);
  assert.equal(result.findings.edgewise_tomography_and_orientation_validation_pass,true);
  assert.equal(result.findings.positive_unit_face_defect_is_constant_minus_two,true);
  assert.equal(result.findings.larger_loop_defect_equals_sum_of_enclosed_face_defects,true);
  assert.equal(result.findings.nontrivial_local_edge_transport_can_coexist_with_zero_face_defect,true);
  assert.equal(result.findings.variable_connection_yields_nonconstant_face_field,true);
  assert.equal(result.findings.gauge_transformation_preserves_closed_loop_face_and_rectangle_defects_across_all_three_field_families,true);
  assert.equal(result.bounded_answer,'DISCRETE_FACE_CURVATURE_TOMOGRAPHY_CANDIDATE_SURVIVES_IN_AUTHORED_INTEGER_SHEAR_LATTICE');
  assert.equal(result.continuum_firewall.mesh_refinement_tested,false);
  assert.equal(result.continuum_firewall.continuum_connection,false);
  assert.equal(result.continuum_firewall.continuum_curvature,false);
  assert.equal(result.claims.discrete_face_curvature_candidate,true);
  assert.equal(result.claims.physical_curvature,false);
  assert.equal(result.claims.riemannian_curvature,false);
  assert.equal(result.claims.berry_curvature,false);
  assert.equal(result.claims.spacetime_curvature,false);
  assert.equal(result.claims.td613_general_curvature,false);
  assert.equal(result.claims.proto_loom,false);
  assert.equal(result.claims.production_authority,false);
  assert.equal(result.claims.vercel_authority,false);
});
