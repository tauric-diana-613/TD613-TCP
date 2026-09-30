import {
  ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA,
  atlasQuadraticRefinementExtensionDiscriminationCertificate,
} from './atlas-quadratic-refinement-extension-discrimination.js';

export const ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA='td613.dome-world.atlas-quadratic-refinement-orbit-geometry/v0.1';
export const ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_PARENT_RECEIPT='83a3eff9ceb7f29a3f4d850c36f226dacffc80d0';

const V=Object.freeze([[0,0],[1,0],[0,1],[1,1]].map(row=>Object.freeze(row)));
const V_INDEX=new Map(V.map((row,index)=>[row.join(''),index]));
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const vecId=v=>v.join('');
const add=(u,v)=>Object.freeze([u[0]^v[0],u[1]^v[1]]);
const addIndex=(i,j)=>V_INDEX.get(vecId(add(V[i],V[j])));
const qId=q=>q.join('');
function allBooleanFunctions(){
  const rows=[];
  for(let n=0;n<16;n+=1) rows.push(Object.freeze([3,2,1,0].map(shift=>(n>>shift)&1)));
  return Object.freeze(rows);
}
function allBinaryMatrices(){
  const rows=[];
  for(let n=0;n<16;n+=1){
    const b=[3,2,1,0].map(shift=>(n>>shift)&1);
    rows.push(Object.freeze([[b[0],b[1]],[b[2],b[3]]].map(row=>Object.freeze(row))));
  }
  return Object.freeze(rows);
}
const detF2=m=>((m[0][0]*m[1][1])^(m[0][1]*m[1][0]))&1;
function matVec(m,v){ return Object.freeze([(m[0][0]*v[0]^m[0][1]*v[1])&1,(m[1][0]*v[0]^m[1][1]*v[1])&1]); }
function matMul(a,b){
  return Object.freeze([[0,0],[0,0]].map((row,i)=>Object.freeze(row.map((_,j)=>((a[i][0]*b[0][j])^(a[i][1]*b[1][j]))&1))));
}
function sameMatrix(a,b){ return JSON.stringify(a)===JSON.stringify(b); }
function inverseInGL(m,gl){
  const id=[[1,0],[0,1]];
  return gl.find(candidate=>sameMatrix(matMul(m,candidate),id)&&sameMatrix(matMul(candidate,m),id))||null;
}
function transformIndex(m,index){ return V_INDEX.get(vecId(matVec(m,V[index]))); }
function pullback(q,m,gl){
  const inv=inverseInGL(m,gl);
  if(!inv) throw new Error('quadratic-refinement pullback requires invertible matrix');
  return Object.freeze(V.map((_,index)=>q[transformIndex(inv,index)]));
}

export function atlasQuadraticRefinementOrbitGeometryCertificate(){
  if(cached) return cached;

  const parent=atlasQuadraticRefinementExtensionDiscriminationCertificate();
  const targetBeta=[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]];
  const parentExact=parent.passed===true&&
    ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA==='td613.dome-world.atlas-quadratic-refinement-extension-discrimination/v0.1'&&
    JSON.stringify(parent.earned_D8?.q)===JSON.stringify([0,0,0,1])&&
    JSON.stringify(parent.quaternion_control?.q)===JSON.stringify([0,1,1,1])&&
    JSON.stringify(parent.shared_polar_form?.D_table)===JSON.stringify(targetBeta)&&
    parent.shared_polar_form?.cross_mismatches===0&&
    parent.linear_isometry_audit?.GL2F2_size===6&&parent.linear_isometry_audit?.pairing_preservers===6;
  const beta=parent.shared_polar_form.D_table;

  const functions=allBooleanFunctions();
  let candidatePolarizationChecks=0;
  const refinements=[];
  for(const q of functions){
    let good=true;
    for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
      candidatePolarizationChecks+=1;
      const lhs=q[addIndex(u,v)]^q[u]^q[v];
      if(lhs!==beta[u][v]) good=false;
    }
    if(good) refinements.push(q);
  }
  refinements.sort((a,b)=>qId(a).localeCompare(qId(b)));

  let linearityChecks=0;
  const linearFunctionals=[];
  for(const f of functions){
    let linear=f[0]===0;
    for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
      linearityChecks+=1;
      if(f[addIndex(u,v)]!==(f[u]^f[v])) linear=false;
    }
    if(linear) linearFunctionals.push(f);
  }
  linearFunctionals.sort((a,b)=>qId(a).localeCompare(qId(b)));
  const linearIds=new Set(linearFunctionals.map(qId));

  let orderedTranslationChecks=0,translationUniquenessFailures=0;
  const translationRows=[];
  for(let i=0;i<refinements.length;i+=1){
    for(let j=0;j<refinements.length;j+=1){
      orderedTranslationChecks+=1;
      const diff=Object.freeze(refinements[i].map((bit,index)=>bit^refinements[j][index]));
      const matches=linearFunctionals.filter(f=>qId(f)===qId(diff)).length;
      if(matches!==1) translationUniquenessFailures+=1;
      translationRows.push(freeze({from:i,to:j,difference:qId(diff),linear_matches:matches}));
    }
  }

  const matrices=allBinaryMatrices();
  const gl=matrices.filter(m=>detF2(m)===1);
  let betaPreservationCellChecks=0;
  const pairingPreservers=[];
  for(const m of gl){
    let preserves=true;
    for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
      betaPreservationCellChecks+=1;
      const tu=transformIndex(m,u),tv=transformIndex(m,v);
      if(beta[tu][tv]!==beta[u][v]) preserves=false;
    }
    if(preserves) pairingPreservers.push(m);
  }

  const refinementIndex=new Map(refinements.map((q,index)=>[qId(q),index]));
  const actionCount=Array.from({length:refinements.length},()=>Array(refinements.length).fill(0));
  const actionImages=Array.from({length:refinements.length},()=>new Set());
  let refinementActionChecks=0,actionEscapes=0;
  for(let source=0;source<refinements.length;source+=1){
    for(const m of pairingPreservers){
      refinementActionChecks+=1;
      const image=pullback(refinements[source],m,gl);
      const target=refinementIndex.get(qId(image));
      if(target===undefined){ actionEscapes+=1; continue; }
      actionCount[source][target]+=1;
      actionImages[source].add(target);
    }
  }

  const visited=new Set(),orbits=[];
  for(let start=0;start<refinements.length;start+=1){
    if(visited.has(start)) continue;
    const orbit=new Set([start]);
    const queue=[start];
    while(queue.length){
      const current=queue.shift();
      for(const next of actionImages[current]) if(!orbit.has(next)){ orbit.add(next); queue.push(next); }
    }
    for(const index of orbit) visited.add(index);
    orbits.push(Object.freeze([...orbit].sort((a,b)=>a-b)));
  }
  orbits.sort((a,b)=>b.length-a.length||a[0]-b[0]);
  const orbitSizes=orbits.map(orbit=>orbit.length);
  const stabilizerSizes=actionCount.map((row,index)=>row[index]);

  const symplecticBases=[];
  for(let u=1;u<4;u+=1) for(let v=1;v<4;v+=1) if(beta[u][v]===1) symplecticBases.push(Object.freeze([u,v]));
  let arfChecks=0,arfFailures=0;
  const arfValues=[];
  for(const q of refinements){
    const bits=[];
    for(const [u,v] of symplecticBases){ arfChecks+=1; bits.push(q[u]&q[v]); }
    const bit=bits[0];
    if(bits.some(value=>value!==bit)) arfFailures+=1;
    arfValues.push(bit);
  }
  const arfZeroRefinements=arfValues.filter(bit=>bit===0).length;
  const arfOneRefinements=arfValues.filter(bit=>bit===1).length;
  const orbitArfPure=orbits.every(orbit=>new Set(orbit.map(index=>arfValues[index])).size===1);
  const arfClasses=new Map();
  arfValues.forEach((bit,index)=>{ if(!arfClasses.has(bit)) arfClasses.set(bit,new Set()); arfClasses.get(bit).add(index); });
  const orbitSets=orbits.map(orbit=>JSON.stringify([...orbit].sort((a,b)=>a-b))).sort();
  const arfSets=[...arfClasses.values()].map(set=>JSON.stringify([...set].sort((a,b)=>a-b))).sort();
  const arfPartitionEqualsOrbitPartition=JSON.stringify(orbitSets)===JSON.stringify(arfSets);

  const dIndex=refinementIndex.get(qId(parent.earned_D8.q));
  const qIndex=refinementIndex.get(qId(parent.quaternion_control.q));
  const dOrbit=orbits.findIndex(orbit=>orbit.includes(dIndex));
  const qOrbit=orbits.findIndex(orbit=>orbit.includes(qIndex));
  const dQSameOrbit=dOrbit===qOrbit;

  const targetRefinements=['0001','0010','0100','0111'];
  const targetLinears=['0000','0011','0101','0110'];
  const targetAction=[[2,2,2,0],[2,2,2,0],[2,2,2,0],[0,0,0,6]];

  const exact=parentExact&&functions.length===16&&candidatePolarizationChecks===256&&refinements.length===4&&
    JSON.stringify(refinements.map(qId))===JSON.stringify(targetRefinements)&&
    linearityChecks===256&&linearFunctionals.length===4&&JSON.stringify(linearFunctionals.map(qId))===JSON.stringify(targetLinears)&&
    orderedTranslationChecks===16&&translationUniquenessFailures===0&&
    matrices.length===16&&gl.length===6&&pairingPreservers.length===6&&betaPreservationCellChecks===96&&
    refinementActionChecks===24&&actionEscapes===0&&JSON.stringify(actionCount)===JSON.stringify(targetAction)&&
    JSON.stringify(orbitSizes)===JSON.stringify([3,1])&&JSON.stringify(stabilizerSizes)===JSON.stringify([2,2,2,6])&&
    symplecticBases.length===6&&arfChecks===24&&arfFailures===0&&JSON.stringify(arfValues)===JSON.stringify([0,0,0,1])&&
    arfZeroRefinements===3&&arfOneRefinements===1&&orbitArfPure&&arfPartitionEqualsOrbitPartition&&
    dIndex===0&&qIndex===3&&!dQSameOrbit&&linearIds.size===4;

  cached=freeze({
    schema:ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA,
    parent_receipt:ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_PARENT_RECEIPT,
    parent_exact:parentExact,
    refinement_census:freeze({boolean_function_candidates:functions.length,polarization_checks:candidatePolarizationChecks,admitted:refinements.length,vectors:freeze(refinements.map(q=>freeze([...q])))}),
    affine_torsor:freeze({linearity_checks:linearityChecks,linear_functionals:linearFunctionals.length,linear_vectors:freeze(linearFunctionals.map(f=>freeze([...f]))),ordered_translation_checks:orderedTranslationChecks,translation_uniqueness_failures:translationUniquenessFailures,translation_rows:freeze(translationRows)}),
    pairing_automorphisms:freeze({binary_matrix_candidates:matrices.length,GL2F2_size:gl.length,pairing_preservers:pairingPreservers.length,beta_preservation_cell_checks:betaPreservationCellChecks}),
    action:freeze({checks:refinementActionChecks,escapes:actionEscapes,count_matrix:freeze(actionCount.map(row=>freeze(row))),orbits:freeze(orbits),orbit_sizes:freeze(orbitSizes),stabilizer_sizes:freeze(stabilizerSizes)}),
    arf:freeze({ordered_symplectic_bases:symplecticBases.length,checks:arfChecks,failures:arfFailures,bits:freeze(arfValues),zero_refinements:arfZeroRefinements,one_refinements:arfOneRefinements,orbit_pure:orbitArfPure,partition_equals_orbit_partition:arfPartitionEqualsOrbitPartition}),
    inherited_controls:freeze({D_refinement_index:dIndex,Q_refinement_index:qIndex,D_orbit:dOrbit,Q_orbit:qOrbit,D_Q_same_orbit:dQSameOrbit}),
    laws:freeze({
      complete_refinement_family_size_four:refinements.length===4,
      refinement_family_affine_Vdual_torsor:linearFunctionals.length===4&&translationUniquenessFailures===0,
      pairing_automorphism_orbit_split_three_plus_one:JSON.stringify(orbitSizes)===JSON.stringify([3,1]),
      Arf_exactly_classifies_declared_orbits:arfFailures===0&&arfPartitionEqualsOrbitPartition,
      D_and_Q_refinements_in_distinct_pairing_automorphism_orbits:!dQSameOrbit,
      universal_quadratic_form_classification_claimed:false,
      physical_symmetry_breaking_claimed:false,
    }),
    membranes:freeze([
      'QUADRATIC_REFINEMENT_ORBIT != PHYSICAL_STATE_ORBIT',
      'AFFINE_REFINEMENT_TORSOR != GAUGE_TORSOR',
      'PAIRING_AUTOMORPHISM_GROUP != PHYSICAL_SYMMETRY_GROUP',
      'ARF_ORBIT_SPLIT != ENTROPY_CLASSIFICATION',
      'ORBIT_TYPE != UNIVERSAL_EXTENSION_CLASSIFICATION',
      'D8_Q8_ORBIT_SEPARATION != PHYSICAL_SYMMETRY_IDENTIFICATION',
      'FINITE_F2_GEOMETRY != CONTINUUM_PHASE_SPACE',
      'FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_CERTIFICATE=atlasQuadraticRefinementOrbitGeometryCertificate();