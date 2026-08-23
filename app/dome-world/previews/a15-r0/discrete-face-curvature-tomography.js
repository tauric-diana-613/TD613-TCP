export const DISCRETE_FACE_CURVATURE_SCHEMA = 'td613.ash.discrete-face-curvature-tomography/v0.1';
export const CURVATURE_SPEC_HEAD = 'f32ae5400ec09c18836478bfb1c31b9a0b4f5b53';

export const KAPPA = 2;
export const POSITIVE_RECTANGLES = Object.freeze([
  Object.freeze({ id:'R1', x0:0, y0:0, w:1, h:1 }),
  Object.freeze({ id:'R2', x0:2, y0:3, w:1, h:2 }),
  Object.freeze({ id:'R3', x0:1, y0:4, w:2, h:1 }),
  Object.freeze({ id:'R4', x0:3, y0:2, w:2, h:2 })
]);

const PRIMARY_PROBES = Object.freeze([
  Object.freeze({ probe_id:'P1', row:Object.freeze([1,0,0,0]) }),
  Object.freeze({ probe_id:'P2', row:Object.freeze([0,1,0,0]) }),
  Object.freeze({ probe_id:'P3', row:Object.freeze([0,0,1,0]) }),
  Object.freeze({ probe_id:'P4', row:Object.freeze([1,1,1,1]) })
]);
const LEGACY_HOLD = Object.freeze({ probe_id:'P_HOLD_LEGACY', row:Object.freeze([2,4,1,2]) });
const GUARD_HOLD = Object.freeze({ probe_id:'P_HOLD_GUARD', row:Object.freeze([0,0,0,1]) });

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function matrixEqual(left,right) { return JSON.stringify(left) === JSON.stringify(right); }
function vertexId([x,y]) { return `(${x},${y})`; }
function edgeId(source,target) { return `${vertexId(source)}->${vertexId(target)}`; }

export function shear(a) {
  if (!Number.isInteger(a)) throw new TypeError('shear parameter must be an integer');
  return freeze([[1,a],[0,1]]);
}

export function shearParameter(matrix) {
  if (!matrixEqual([[matrix[0][0],0],[matrix[1][0],matrix[1][1]]],[[1,0],[0,1]])) {
    throw new Error('matrix is outside the authored unipotent upper-shear subgroup');
  }
  return matrix[0][1];
}

export function matrixMultiply(left,right) {
  return freeze(left.map((row) => right[0].map((_,column) =>
    row.reduce((sum,value,index) => sum + value * right[index][column],0)
  )));
}

export function determinant2(matrix) {
  return matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0];
}

export function inverseShear(matrix) {
  return shear(-shearParameter(matrix));
}

function observeVector(vector,row) {
  return row.reduce((sum,value,index) => sum + value * vector[index],0);
}

function matrixVector(matrix) {
  return freeze([matrix[0][0],matrix[0][1],matrix[1][0],matrix[1][1]]);
}

function vectorMatrix(vector) {
  return freeze([[vector[0],vector[1]],[vector[2],vector[3]]]);
}

function reconstructPrimary(observations) {
  const [t11,t12,t21,sum] = observations;
  return vectorMatrix([t11,t12,t21,sum-t11-t12-t21]);
}

export function constantPositiveEdge(source,target) {
  const [x0,y0]=source;
  const [x1,y1]=target;
  const dx=x1-x0, dy=y1-y0;
  if (Math.abs(dx)+Math.abs(dy)!==1) throw new Error('edge must connect adjacent lattice vertices');
  if (dy===0) return dx===1 ? shear(KAPPA*y0) : shear(-KAPPA*y0);
  return shear(0);
}

export function flatEdge(source,target) {
  const [x0,y0]=source;
  const [x1,y1]=target;
  const dx=x1-x0, dy=y1-y0;
  if (Math.abs(dx)+Math.abs(dy)!==1) throw new Error('edge must connect adjacent lattice vertices');
  if (dy===0) return dx===1 ? shear(7) : shear(-7);
  return shear(0);
}

export function variableEdge(source,target) {
  const [x0,y0]=source;
  const [x1,y1]=target;
  const dx=x1-x0, dy=y1-y0;
  if (Math.abs(dx)+Math.abs(dy)!==1) throw new Error('edge must connect adjacent lattice vertices');
  if (dy===0) {
    const a=2*y0*y0;
    return dx===1 ? shear(a) : shear(-a);
  }
  return shear(0);
}

export function phi([x,y]) { return 3*x-2*y+x*y; }
export function gaugeTransformEdge(matrix,source,target) {
  return matrixMultiply(shear(phi(target)),matrixMultiply(matrix,shear(-phi(source))));
}

export function reconstructEdgeReceipt(source,target,oracle,reverseOracle) {
  const vector=matrixVector(oracle);
  const observations=PRIMARY_PROBES.map(probe => observeVector(vector,probe.row));
  const reconstructed=reconstructPrimary(observations);
  const reconstructedVector=matrixVector(reconstructed);
  const legacyObserved=observeVector(vector,LEGACY_HOLD.row);
  const legacyPredicted=observeVector(reconstructedVector,LEGACY_HOLD.row);
  const guardObserved=observeVector(vector,GUARD_HOLD.row);
  const guardPredicted=observeVector(reconstructedVector,GUARD_HOLD.row);
  const reverseReconstructed=reverseOracle ? reconstructPrimary(PRIMARY_PROBES.map(probe => observeVector(matrixVector(reverseOracle),probe.row))) : null;
  return freeze({
    edge_id:edgeId(source,target),
    source_vertex:freeze([...source]),
    target_vertex:freeze([...target]),
    primary_scalar_observations:freeze(observations),
    reconstructed_matrix:reconstructed,
    oracle_match:matrixEqual(reconstructed,oracle),
    determinant:determinant2(reconstructed),
    reverse_edge_id:reverseOracle ? edgeId(target,source) : null,
    reverse_reconstructed_matrix:reverseReconstructed,
    orientation_inverse_consistent:reverseReconstructed ? matrixEqual(reverseReconstructed,inverseShear(reconstructed)) : null,
    legacy_heldout_observed:legacyObserved,
    legacy_heldout_predicted:legacyPredicted,
    legacy_heldout_residual:legacyPredicted-legacyObserved,
    guard_heldout_observed:guardObserved,
    guard_heldout_predicted:guardPredicted,
    guard_heldout_residual:guardPredicted-guardObserved
  });
}

function edgeReceiptFor(source,target,edgeFunction,gauge=false) {
  const oracleBase=edgeFunction(source,target);
  const reverseBase=edgeFunction(target,source);
  const oracle=gauge ? gaugeTransformEdge(oracleBase,source,target) : oracleBase;
  const reverse=gauge ? gaugeTransformEdge(reverseBase,target,source) : reverseBase;
  return reconstructEdgeReceipt(source,target,oracle,reverse);
}

function pathEdges(path) {
  return path.slice(0,-1).map((source,index) => freeze({ source, target:path[index+1] }));
}

function composePath(path,edgeFunction,gauge=false) {
  let transport=shear(0);
  const receipts=[];
  for (const {source,target} of pathEdges(path)) {
    const receipt=edgeReceiptFor(source,target,edgeFunction,gauge);
    receipts.push(receipt);
    transport=matrixMultiply(receipt.reconstructed_matrix,transport);
  }
  return freeze({ transport, edge_receipts:freeze(receipts) });
}

function facePath(x,y) {
  return freeze([[x,y],[x+1,y],[x+1,y+1],[x,y+1],[x,y]]);
}

function rectanglePath({x0,y0,w,h}) {
  const path=[[x0,y0]];
  for(let i=1;i<=w;i+=1) path.push([x0+i,y0]);
  for(let j=1;j<=h;j+=1) path.push([x0+w,y0+j]);
  for(let i=1;i<=w;i+=1) path.push([x0+w-i,y0+h]);
  for(let j=1;j<=h;j+=1) path.push([x0,y0+h-j]);
  return freeze(path);
}

function edgeReceiptsPass(receipts) {
  return receipts.every(receipt =>
    receipt.oracle_match &&
    receipt.determinant===1 &&
    receipt.orientation_inverse_consistent===true &&
    receipt.legacy_heldout_residual===0 &&
    receipt.guard_heldout_residual===0
  );
}

export function compileFaceReceipt(x,y,edgeFunction,{gauge=false,expectedDensity=null}={}) {
  const path=facePath(x,y);
  const composed=composePath(path,edgeFunction,gauge);
  const loop=composed.transport;
  const parameter=shearParameter(loop);
  return freeze({
    face_id:`F(${x},${y})`,
    lower_left:freeze([x,y]),
    ordered_boundary_edges:freeze(pathEdges(path).map(({source,target})=>edgeId(source,target))),
    edge_receipts:composed.edge_receipts,
    all_edges_validated:edgeReceiptsPass(composed.edge_receipts),
    loop_matrix:loop,
    shear_parameter:parameter,
    declared_area:1,
    curvature_shear_density:parameter,
    expected_density:expectedDensity,
    expected_density_match:expectedDensity===null ? null : parameter===expectedDensity
  });
}

function enclosedFaces(rectangle) {
  const out=[];
  for(let x=rectangle.x0;x<rectangle.x0+rectangle.w;x+=1) {
    for(let y=rectangle.y0;y<rectangle.y0+rectangle.h;y+=1) out.push([x,y]);
  }
  return freeze(out);
}

export function compileRectangleReceipt(rectangle,edgeFunction,{gauge=false,expectedDensity=null}={}) {
  const path=rectanglePath(rectangle);
  const composed=composePath(path,edgeFunction,gauge);
  const loop=composed.transport;
  const parameter=shearParameter(loop);
  const faces=enclosedFaces(rectangle).map(([x,y])=>compileFaceReceipt(x,y,edgeFunction,{gauge,expectedDensity}));
  const faceSum=faces.reduce((sum,face)=>sum+face.shear_parameter,0);
  const area=rectangle.w*rectangle.h;
  return freeze({
    rectangle_id:rectangle.id,
    lower_left:freeze([rectangle.x0,rectangle.y0]),
    width:rectangle.w,
    height:rectangle.h,
    declared_area:area,
    ordered_boundary_edges:freeze(pathEdges(path).map(({source,target})=>edgeId(source,target))),
    boundary_edge_receipts:composed.edge_receipts,
    all_boundary_edges_validated:edgeReceiptsPass(composed.edge_receipts),
    loop_matrix:loop,
    rectangle_shear:parameter,
    curvature_shear_density:parameter/area,
    enclosed_unit_faces:freeze(faces.map(face=>face.face_id)),
    unit_face_receipts:freeze(faces),
    sum_unit_face_shears:faceSum,
    stokes_consistent:parameter===faceSum,
    expected_density:expectedDensity,
    expected_density_match:expectedDensity===null ? null : parameter/area===expectedDensity
  });
}

function compileFamily(rectangles,edgeFunction,options={}) {
  return freeze(rectangles.map(rectangle=>compileRectangleReceipt(rectangle,edgeFunction,options)));
}

export function runDiscreteFaceCurvatureTomographyAssay() {
  const positive=compileFamily(POSITIVE_RECTANGLES,constantPositiveEdge,{expectedDensity:-2});
  const flat=compileFamily(POSITIVE_RECTANGLES,flatEdge,{expectedDensity:0});
  const variable=compileFamily(POSITIVE_RECTANGLES,variableEdge);
  const gaugePositive=compileFamily(POSITIVE_RECTANGLES,constantPositiveEdge,{gauge:true,expectedDensity:-2});

  const positivePass=positive.every(rect =>
    rect.all_boundary_edges_validated &&
    rect.unit_face_receipts.every(face=>face.all_edges_validated && face.shear_parameter===-2) &&
    rect.rectangle_shear===-2*rect.declared_area &&
    rect.curvature_shear_density===-2 &&
    rect.stokes_consistent
  );
  const flatPass=flat.every(rect =>
    rect.all_boundary_edges_validated &&
    rect.rectangle_shear===0 &&
    rect.unit_face_receipts.every(face=>face.shear_parameter===0) &&
    rect.stokes_consistent
  );
  const variablePass=variable.every(rect => {
    const expectedFaceShears=rect.unit_face_receipts.map(face => -4*face.lower_left[1]-2);
    const observed=rect.unit_face_receipts.map(face=>face.shear_parameter);
    return JSON.stringify(expectedFaceShears)===JSON.stringify(observed) && rect.stokes_consistent;
  });
  const variableDistinctDensities=new Set(variable.flatMap(rect=>rect.unit_face_receipts.map(face=>face.curvature_shear_density))).size>1;
  const gaugePass=gaugePositive.every((rect,index) =>
    rect.all_boundary_edges_validated &&
    rect.rectangle_shear===positive[index].rectangle_shear &&
    JSON.stringify(rect.unit_face_receipts.map(face=>face.shear_parameter))===JSON.stringify(positive[index].unit_face_receipts.map(face=>face.shear_parameter)) &&
    rect.stokes_consistent
  );
  const flatHasNontrivialLocalEdges=flat.some(rect => rect.boundary_edge_receipts.some(edge => shearParameter(edge.reconstructed_matrix)!==0));
  const pass=positivePass&&flatPass&&variablePass&&variableDistinctDensities&&gaugePass&&flatHasNontrivialLocalEdges;

  return freeze({
    schema:DISCRETE_FACE_CURVATURE_SCHEMA,
    spec_head:CURVATURE_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'EXACT_INTEGERS',
    declared_2_cell_complex:freeze({
      base:'FINITE_SUBSETS_OF_Z2_SQUARE_LATTICE',
      unit_face_area:1,
      face_shape:'UNIT_SQUARE',
      continuum_structure_declared:false
    }),
    transport_subgroup:'INTEGER_UNIPOTENT_UPPER_SHEARS',
    positive_constant_density:freeze({ kappa:KAPPA, rectangles:positive }),
    flat_nontrivial_edge_control:freeze({ horizontal_shear:7, rectangles:flat, nontrivial_local_edges_present:flatHasNontrivialLocalEdges }),
    variable_face_field_control:freeze({ horizontal_rule:'S(2*y^2)', rectangles:variable, distinct_face_density_count:new Set(variable.flatMap(rect=>rect.unit_face_receipts.map(face=>face.curvature_shear_density))).size }),
    gauge_clone:freeze({ phi:'3*x - 2*y + x*y', rectangles:gaugePositive }),
    findings:freeze({
      edgewise_tomography_and_orientation_validation_pass:positive.every(rect=>rect.all_boundary_edges_validated&&rect.unit_face_receipts.every(face=>face.all_edges_validated)),
      positive_unit_face_defect_is_constant_minus_two:positivePass,
      larger_loop_defect_equals_sum_of_enclosed_face_defects:positive.every(rect=>rect.stokes_consistent)&&variable.every(rect=>rect.stokes_consistent),
      nontrivial_local_edge_transport_can_coexist_with_zero_face_defect:flatPass&&flatHasNontrivialLocalEdges,
      variable_connection_yields_nonconstant_face_field:variablePass&&variableDistinctDensities,
      gauge_transformation_preserves_closed_loop_face_and_rectangle_defects:gaugePass,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'DISCRETE_FACE_CURVATURE_TOMOGRAPHY_CANDIDATE_SURVIVES_IN_AUTHORED_INTEGER_SHEAR_LATTICE'
      : 'DISCRETE_FACE_CURVATURE_TOMOGRAPHY_CANDIDATE_FAILED',
    continuum_firewall:freeze({
      mesh_refinement_tested:false,
      shrinking_physical_loop_limit:false,
      continuum_connection:false,
      continuum_curvature:false
    }),
    claims:freeze({
      discrete_face_curvature_candidate:pass,
      physical_curvature:false,
      riemannian_curvature:false,
      berry_curvature:false,
      spacetime_curvature:false,
      td613_general_curvature:false,
      manifold_ontology:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
