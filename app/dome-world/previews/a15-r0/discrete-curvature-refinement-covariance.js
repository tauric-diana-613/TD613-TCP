export const DISCRETE_CURVATURE_REFINEMENT_SCHEMA='td613.ash.discrete-curvature-refinement-covariance/v0.1';
export const REFINEMENT_SPEC_HEAD='b6eb938fc5abc03feaca994d9bd715635a66069e';
export const MESH_LEVELS=Object.freeze([1,2,3,4]);
export const REFINEMENT_PAIRS=Object.freeze([[1,2],[1,3],[2,4]].map(pair=>Object.freeze(pair)));

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
function gcd(a,b){
  a=Math.abs(a); b=Math.abs(b);
  while(b!==0){ const t=a%b; a=b; b=t; }
  return a||1;
}
export function Q(n,d=1){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d===0) throw new TypeError('Q requires safe integer numerator and nonzero denominator');
  if(d<0){ n=-n; d=-d; }
  const g=gcd(n,d);
  return freeze({n:n/g,d:d/g});
}
const qAdd=(a,b)=>Q(a.n*b.d+b.n*a.d,a.d*b.d);
const qSub=(a,b)=>Q(a.n*b.d-b.n*a.d,a.d*b.d);
const qMul=(a,b)=>Q(a.n*b.n,a.d*b.d);
const qDiv=(a,b)=>Q(a.n*b.d,a.d*b.n);
const qNeg=a=>Q(-a.n,a.d);
const qEq=(a,b)=>a.n===b.n&&a.d===b.d;
export const qString=q=>q.d===1?String(q.n):`${q.n}/${q.d}`;
const ZERO=Q(0), ONE=Q(1);

function qSum(values){ return values.reduce((sum,value)=>qAdd(sum,value),ZERO); }
function qAverageWeighted(values,weights){
  const totalWeight=qSum(weights);
  const numerator=qSum(values.map((value,index)=>qMul(value,weights[index])));
  return qDiv(numerator,totalWeight);
}

function shear(a){ return freeze([[ONE,a],[ZERO,ONE]]); }
function shearParameter(matrix){
  if(!qEq(matrix[0][0],ONE)||!qEq(matrix[1][0],ZERO)||!qEq(matrix[1][1],ONE)) throw new Error('outside rational shear subgroup');
  return matrix[0][1];
}
function matrixMultiply(left,right){
  return freeze(left.map(row=>right[0].map((_,column)=>qSum(row.map((value,index)=>qMul(value,right[index][column]))))));
}
function determinant2(matrix){ return qSub(qMul(matrix[0][0],matrix[1][1]),qMul(matrix[0][1],matrix[1][0])); }
function inverseShear(matrix){ return shear(qNeg(shearParameter(matrix))); }
function matrixEqual(a,b){ return a.every((row,i)=>row.every((value,j)=>qEq(value,b[i][j]))); }
function matrixVector(matrix){ return freeze([matrix[0][0],matrix[0][1],matrix[1][0],matrix[1][1]]); }
function vectorMatrix(v){ return freeze([[v[0],v[1]],[v[2],v[3]]]); }
function observe(vector,row){ return qSum(row.map((coefficient,index)=>qMul(Q(coefficient),vector[index]))); }
function reconstructPrimary(observations){
  const [t11,t12,t21,sum]=observations;
  return vectorMatrix([t11,t12,t21,qSub(qSub(qSub(sum,t11),t12),t21)]);
}
function serializeMatrix(matrix){ return freeze(matrix.map(row=>freeze(row.map(qString)))); }

const PRIMARY_ROWS=Object.freeze([[1,0,0,0],[0,1,0,0],[0,0,1,0],[1,1,1,1]].map(row=>Object.freeze(row)));
const LEGACY_ROW=Object.freeze([2,4,1,2]);
const GUARD_ROW=Object.freeze([0,0,0,1]);

function vertex(i,j,n){ return freeze({i,j,n}); }
function vertexId(v){ return `(${v.i}/${v.n},${v.j}/${v.n})`; }
function edgeId(source,target){ return `${vertexId(source)}->${vertexId(target)}`; }
function adjacent(source,target){ return source.n===target.n && Math.abs(target.i-source.i)+Math.abs(target.j-source.j)===1; }

function edgeBase(source,target,kind){
  if(!adjacent(source,target)) throw new Error('edge endpoints must be adjacent on same mesh');
  const n=source.n;
  const di=target.i-source.i, dj=target.j-source.j;
  if(dj!==0) return ZERO;
  let right;
  if(kind==='constant') right=Q(2*source.j,n*n);
  else if(kind==='variable') right=Q(2*source.j*source.j,n*n*n);
  else if(kind==='flat') right=Q(7,n);
  else if(kind==='bad') right=Q(2*source.j,n);
  else throw new Error(`unknown field kind ${kind}`);
  return di===1 ? right : qNeg(right);
}
function phi(v){
  const {i,j,n}=v;
  return Q(3*i*n-2*j*n+i*j,n*n);
}
function edgeShear(source,target,kind,gauge=false){
  let a=edgeBase(source,target,kind);
  if(gauge) a=qAdd(a,qSub(phi(target),phi(source)));
  return a;
}

function reconstructEdge(source,target,kind,gauge=false){
  const oracle=shear(edgeShear(source,target,kind,gauge));
  const reverseOracle=shear(edgeShear(target,source,kind,gauge));
  const vector=matrixVector(oracle);
  const primary=PRIMARY_ROWS.map(row=>observe(vector,row));
  const reconstructed=reconstructPrimary(primary);
  const reverseVector=matrixVector(reverseOracle);
  const reversePrimary=PRIMARY_ROWS.map(row=>observe(reverseVector,row));
  const reverseReconstructed=reconstructPrimary(reversePrimary);
  const legacyObserved=observe(vector,LEGACY_ROW);
  const legacyPredicted=observe(matrixVector(reconstructed),LEGACY_ROW);
  const guardObserved=observe(vector,GUARD_ROW);
  const guardPredicted=observe(matrixVector(reconstructed),GUARD_ROW);
  const pass=matrixEqual(reconstructed,oracle)&&qEq(determinant2(reconstructed),ONE)&&matrixEqual(reverseReconstructed,inverseShear(reconstructed))&&qEq(legacyObserved,legacyPredicted)&&qEq(guardObserved,guardPredicted);
  return freeze({
    edge_id:edgeId(source,target),
    source_vertex:vertexId(source),
    target_vertex:vertexId(target),
    primary_observations:freeze(primary.map(qString)),
    reconstructed_matrix:serializeMatrix(reconstructed),
    determinant:qString(determinant2(reconstructed)),
    reverse_reconstructed_matrix:serializeMatrix(reverseReconstructed),
    orientation_inverse_consistent:matrixEqual(reverseReconstructed,inverseShear(reconstructed)),
    legacy_heldout_observed:qString(legacyObserved),
    legacy_heldout_predicted:qString(legacyPredicted),
    legacy_heldout_residual:qString(qSub(legacyPredicted,legacyObserved)),
    guard_heldout_observed:qString(guardObserved),
    guard_heldout_predicted:qString(guardPredicted),
    guard_heldout_residual:qString(qSub(guardPredicted,guardObserved)),
    validated:pass,
    _matrix:reconstructed
  });
}

function pathTransport(path,kind,gauge=false){
  let transport=shear(ZERO);
  const receipts=[];
  for(let index=0;index<path.length-1;index+=1){
    const receipt=reconstructEdge(path[index],path[index+1],kind,gauge);
    receipts.push(receipt);
    transport=matrixMultiply(receipt._matrix,transport);
  }
  return freeze({transport,receipts:freeze(receipts)});
}

function cellPath(i,j,n){ return freeze([vertex(i,j,n),vertex(i+1,j,n),vertex(i+1,j+1,n),vertex(i,j+1,n),vertex(i,j,n)]); }
function macroPath(n){
  const path=[vertex(0,0,n)];
  for(let i=1;i<=n;i+=1) path.push(vertex(i,0,n));
  for(let j=1;j<=n;j+=1) path.push(vertex(n,j,n));
  for(let i=1;i<=n;i+=1) path.push(vertex(n-i,n,n));
  for(let j=1;j<=n;j+=1) path.push(vertex(0,n-j,n));
  return freeze(path);
}

function cellReceipt(i,j,n,kind,gauge=false){
  const composed=pathTransport(cellPath(i,j,n),kind,gauge);
  const faceShear=shearParameter(composed.transport);
  const area=Q(1,n*n);
  const density=qDiv(faceShear,area);
  return freeze({
    cell_id:`n${n}:(${i},${j})`,
    i,j,n,
    area:qString(area),
    face_shear:qString(faceShear),
    face_density:qString(density),
    all_edges_validated:composed.receipts.every(receipt=>receipt.validated),
    edge_receipts:composed.receipts,
    _shear:faceShear,
    _area:area,
    _density:density
  });
}

function meshReceipt(n,kind,gauge=false){
  const cells=[];
  for(let i=0;i<n;i+=1) for(let j=0;j<n;j+=1) cells.push(cellReceipt(i,j,n,kind,gauge));
  const macro=pathTransport(macroPath(n),kind,gauge);
  const macroShear=shearParameter(macro.transport);
  const faceSum=qSum(cells.map(cell=>cell._shear));
  return freeze({
    n,
    vertex_count:(n+1)*(n+1),
    cell_count:n*n,
    cell_area:qString(Q(1,n*n)),
    all_edges_tomographically_validated:cells.every(cell=>cell.all_edges_validated)&&macro.receipts.every(receipt=>receipt.validated),
    cell_face_shears:freeze(cells.map(cell=>freeze({cell_id:cell.cell_id,value:cell.face_shear}))),
    cell_face_densities:freeze(cells.map(cell=>freeze({cell_id:cell.cell_id,value:cell.face_density}))),
    sum_cell_face_shears:qString(faceSum),
    macro_loop_shear:qString(macroShear),
    macro_equals_face_sum:qEq(macroShear,faceSum),
    cells:freeze(cells),
    _macro:macroShear
  });
}

function refinementReceipts(parentN,childN,kind,gauge=false){
  if(childN%parentN!==0) throw new Error('child mesh must be integer refinement of parent mesh');
  const factor=childN/parentN;
  const parent=meshReceipt(parentN,kind,gauge);
  const child=meshReceipt(childN,kind,gauge);
  const receipts=[];
  for(let i=0;i<parentN;i+=1){
    for(let j=0;j<parentN;j+=1){
      const parentCell=parent.cells.find(cell=>cell.i===i&&cell.j===j);
      const childCells=child.cells.filter(cell=>cell.i>=i*factor&&cell.i<(i+1)*factor&&cell.j>=j*factor&&cell.j<(j+1)*factor);
      const childShearSum=qSum(childCells.map(cell=>cell._shear));
      const childAreaSum=qSum(childCells.map(cell=>cell._area));
      const weightedDensity=qAverageWeighted(childCells.map(cell=>cell._density),childCells.map(cell=>cell._area));
      receipts.push(freeze({
        parent_n:parentN,
        child_n:childN,
        factor,
        parent_cell_id:parentCell.cell_id,
        parent_face_shear:parentCell.face_shear,
        child_face_ids:freeze(childCells.map(cell=>cell.cell_id)),
        sum_child_face_shears:qString(childShearSum),
        parent_area:parentCell.area,
        sum_child_areas:qString(childAreaSum),
        parent_density:parentCell.face_density,
        child_area_weighted_density:qString(weightedDensity),
        integrated_defect_covariant:qEq(parentCell._shear,childShearSum),
        area_covariant:qEq(parentCell._area,childAreaSum),
        density_covariant:qEq(parentCell._density,weightedDensity)
      }));
    }
  }
  return freeze(receipts);
}

function publicMesh(mesh){
  return freeze({
    n:mesh.n,vertex_count:mesh.vertex_count,cell_count:mesh.cell_count,cell_area:mesh.cell_area,
    all_edges_tomographically_validated:mesh.all_edges_tomographically_validated,
    cell_face_shears:mesh.cell_face_shears,cell_face_densities:mesh.cell_face_densities,
    sum_cell_face_shears:mesh.sum_cell_face_shears,macro_loop_shear:mesh.macro_loop_shear,macro_equals_face_sum:mesh.macro_equals_face_sum
  });
}

function family(kind,gauge=false){ return freeze(MESH_LEVELS.map(n=>meshReceipt(n,kind,gauge))); }
function refinements(kind,gauge=false){ return freeze(REFINEMENT_PAIRS.flatMap(([parent,child])=>refinementReceipts(parent,child,kind,gauge))); }
function allRefinementPass(receipts){ return receipts.every(r=>r.integrated_defect_covariant&&r.area_covariant&&r.density_covariant); }

export function runDiscreteCurvatureRefinementCovarianceAssay(){
  const constant=family('constant');
  const variable=family('variable');
  const flat=family('flat');
  const bad=family('bad');
  const constantRef=refinements('constant');
  const variableRef=refinements('variable');
  const flatRef=refinements('flat');
  const badRef=refinements('bad');

  const constantGauge=family('constant',true);
  const variableGauge=family('variable',true);
  const flatGauge=family('flat',true);
  const badGauge=family('bad',true);
  const constantGaugeRef=refinements('constant',true);
  const variableGaugeRef=refinements('variable',true);
  const flatGaugeRef=refinements('flat',true);
  const badGaugeRef=refinements('bad',true);

  const allEdgesPass=[constant,variable,flat,bad,constantGauge,variableGauge,flatGauge,badGauge].every(meshes=>meshes.every(mesh=>mesh.all_edges_tomographically_validated));
  const constantPass=constant.every(mesh=>mesh.macro_loop_shear==='-2'&&mesh.macro_equals_face_sum&&mesh.cell_face_densities.every(item=>item.value==='-2'))&&allRefinementPass(constantRef);
  const variablePass=variable.every(mesh=>mesh.macro_loop_shear==='-2'&&mesh.macro_equals_face_sum)&&allRefinementPass(variableRef);
  const flatPass=flat.every(mesh=>mesh.macro_loop_shear==='0'&&mesh.macro_equals_face_sum&&mesh.cell_face_shears.every(item=>item.value==='0'))&&allRefinementPass(flatRef);
  const badExpected=bad.every(mesh=>mesh.macro_loop_shear===String(-2*mesh.n)&&mesh.cell_face_densities.every(item=>item.value===String(-2*mesh.n)));
  const badRefinementFails=badRef.some(r=>!r.integrated_defect_covariant||!r.density_covariant);

  const gaugeLoopPass=[
    [constant,constantGauge],[variable,variableGauge],[flat,flatGauge],[bad,badGauge]
  ].every(([base,gauged])=>base.every((mesh,index)=>mesh.macro_loop_shear===gauged[index].macro_loop_shear&&JSON.stringify(mesh.cell_face_shears)===JSON.stringify(gauged[index].cell_face_shears)));
  const gaugeRefinementPass=allRefinementPass(constantGaugeRef)&&allRefinementPass(variableGaugeRef)&&allRefinementPass(flatGaugeRef);
  const badGaugeStillFails=badGaugeRef.some(r=>!r.integrated_defect_covariant||!r.density_covariant);
  const pass=allEdgesPass&&constantPass&&variablePass&&flatPass&&badExpected&&badRefinementFails&&gaugeLoopPass&&gaugeRefinementPass&&badGaugeStillFails;

  return freeze({
    schema:DISCRETE_CURVATURE_REFINEMENT_SCHEMA,
    spec_head:REFINEMENT_SPEC_HEAD,
    arithmetic_domain:'EXACT_REDUCED_RATIONALS',
    mesh_levels:MESH_LEVELS,
    refinement_pairs:REFINEMENT_PAIRS,
    covariant_constant_density:freeze({ meshes:freeze(constant.map(publicMesh)), refinements:constantRef }),
    covariant_variable_field:freeze({ meshes:freeze(variable.map(publicMesh)), refinements:variableRef }),
    flat_control:freeze({ meshes:freeze(flat.map(publicMesh)), refinements:flatRef }),
    hostile_mis_scaled_control:freeze({ meshes:freeze(bad.map(publicMesh)), refinements:badRef, classification:badRefinementFails?'MIS_SCALED_EDGE_TRANSPORT_REJECTS_REFINEMENT_COVARIANCE':'HOSTILE_REFINEMENT_CONTROL_FAILED' }),
    gauge_clone:freeze({
      constant_meshes:freeze(constantGauge.map(publicMesh)), variable_meshes:freeze(variableGauge.map(publicMesh)), flat_meshes:freeze(flatGauge.map(publicMesh)), bad_meshes:freeze(badGauge.map(publicMesh)),
      constant_refinements:constantGaugeRef,variable_refinements:variableGaugeRef,flat_refinements:flatGaugeRef,bad_refinements:badGaugeRef,
      admitted_loop_defects_preserved:gaugeLoopPass,
      admitted_refinement_relations_preserved:gaugeRefinementPass,
      hostile_scaling_failure_not_rescued_by_gauge:badGaugeStillFails
    }),
    findings:freeze({
      all_edges_exactly_tomographed_and_validated:allEdgesPass,
      constant_density_refinement_covariant:constantPass,
      variable_field_refinement_covariant:variablePass,
      flat_control_refinement_covariant:flatPass,
      hostile_mis_scaled_control_rejected:badExpected&&badRefinementFails,
      gauge_covariance_and_refinement_covariance_are_separate_obligations:gaugeLoopPass&&gaugeRefinementPass&&badGaugeStillFails,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass?'DISCRETE_FACE_CURVATURE_REFINEMENT_COVARIANCE_SURVIVES_ACROSS_AUTHORED_EXACT_RATIONAL_MESH_FAMILY':'DISCRETE_CURVATURE_REFINEMENT_COVARIANCE_ASSAY_FAILED',
    continuum_firewall:freeze({finite_mesh_family_only:true,mesh_levels_tested:MESH_LEVELS,limit_n_to_infinity_tested:false,convergence_rate_estimated:false,continuum_object_identified:false,physical_scale_identified:false}),
    claims:freeze({refinement_covariance_candidate:pass,continuum_connection:false,continuum_curvature:false,physical_curvature:false,td613_general_curvature:false,proto_loom:false,production_authority:false,vercel_authority:false}),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
