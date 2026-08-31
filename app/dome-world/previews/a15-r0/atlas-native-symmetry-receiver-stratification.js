import {
  ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA,
  atlasAutomorphismLiftExactnessCertificate,
} from './atlas-automorphism-lift-exactness.js';
import {
  ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA,
  atlasQuadraticRefinementOrbitGeometryCertificate,
} from './atlas-quadratic-refinement-orbit-geometry.js';

export const ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_SCHEMA='td613.dome-world.atlas-native-symmetry-receiver-stratification/v0.1';
export const ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_PARENT_RECEIPT='568dbf7ff91c47361a7de9502e17a2d90063093e';

const V=Object.freeze([[0,0],[1,0],[0,1],[1,1]].map(v=>Object.freeze(v)));
const V_INDEX=new Map(V.map((v,i)=>[v.join(''),i]));
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const qId=q=>q.join('');
const add=(u,v)=>Object.freeze([u[0]^v[0],u[1]^v[1]]);
const addIndex=(i,j)=>V_INDEX.get(add(V[i],V[j]).join(''));

function allBooleanFunctions(){
  const out=[];
  for(let n=0;n<16;n+=1) out.push(Object.freeze([3,2,1,0].map(shift=>(n>>shift)&1)));
  return Object.freeze(out);
}
function allMatrices(){
  const out=[];
  for(let n=0;n<16;n+=1) out.push(Object.freeze([[n&1,(n>>1)&1],[(n>>2)&1,(n>>3)&1]].map(row=>Object.freeze(row))));
  return Object.freeze(out);
}
function matrixId(m){ return m.flat().join(''); }
function detF2(m){ return ((m[0][0]&m[1][1])^(m[0][1]&m[1][0]))&1; }
function transformIndex(m,index){
  const [x,y]=V[index];
  const out=[(m[0][0]&x)^(m[0][1]&y),(m[1][0]&x)^(m[1][1]&y)];
  return V_INDEX.get(out.join(''));
}
function inverseMatrix(m,gl){
  for(const candidate of gl){
    let ok=true;
    for(let i=0;i<4;i++) if(transformIndex(candidate,transformIndex(m,i))!==i){ ok=false; break; }
    if(ok) return candidate;
  }
  throw new Error('missing inverse in GL(2,2)');
}
function preservesBeta(m,beta){
  for(let u=0;u<4;u++) for(let v=0;v<4;v++) if(beta[transformIndex(m,u)][transformIndex(m,v)]!==beta[u][v]) return false;
  return true;
}
function preservesQ(m,q){
  for(let u=0;u<4;u++) if(q[transformIndex(m,u)]!==q[u]) return false;
  return true;
}
function pullback(q,m,gl){
  const inv=inverseMatrix(m,gl);
  return Object.freeze(V.map((_,i)=>q[transformIndex(inv,i)]));
}
function actionAudit(refinements,group,gl){
  const index=new Map(refinements.map((q,i)=>[qId(q),i]));
  const count=Array.from({length:refinements.length},()=>Array(refinements.length).fill(0));
  const imageSets=Array.from({length:refinements.length},()=>new Set());
  const signatures=[];
  let checks=0,escapes=0;
  for(const m of group){
    const permutation=[];
    for(let source=0;source<refinements.length;source+=1){
      checks+=1;
      const image=pullback(refinements[source],m,gl),target=index.get(qId(image));
      if(target===undefined){ escapes+=1; permutation.push(-1); continue; }
      count[source][target]+=1;
      imageSets[source].add(target);
      permutation.push(target);
    }
    signatures.push(Object.freeze(permutation));
  }
  const visited=new Set(),orbits=[];
  for(let start=0;start<refinements.length;start+=1){
    if(visited.has(start)) continue;
    const orbit=new Set([start]),queue=[start];
    while(queue.length){
      const current=queue.shift();
      for(const next of imageSets[current]) if(!orbit.has(next)){ orbit.add(next); queue.push(next); }
    }
    for(const i of orbit) visited.add(i);
    orbits.push(Object.freeze([...orbit].sort((a,b)=>a-b)));
  }
  orbits.sort((a,b)=>b.length-a.length||a[0]-b[0]);
  const stabilizers=count.map((row,i)=>row[i]);
  let signaturePairChecks=0,signatureCollisions=0;
  for(let i=0;i<signatures.length;i++) for(let j=i+1;j<signatures.length;j++){
    signaturePairChecks+=1;
    if(JSON.stringify(signatures[i])===JSON.stringify(signatures[j])) signatureCollisions+=1;
  }
  return {
    checks,escapes,count,orbits,orbitSizes:orbits.map(o=>o.length),stabilizers,signatures,
    distinctSignatures:new Set(signatures.map(s=>JSON.stringify(s))).size,
    signaturePairChecks,signatureCollisions,
  };
}
function setPartitionIds(parts){ return parts.map(part=>JSON.stringify([...part].sort((a,b)=>a-b))).sort(); }

export function atlasNativeSymmetryReceiverStratificationCertificate(){
  if(cached) return cached;
  const parent=atlasAutomorphismLiftExactnessCertificate();
  const orbitParent=atlasQuadraticRefinementOrbitGeometryCertificate();
  const parentExact=parent.passed===true&&
    ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA==='td613.dome-world.atlas-automorphism-lift-exactness/v0.1'&&
    parent.D?.automorphisms===8&&parent.Q?.automorphisms===24&&
    parent.D?.quotient_action_image===2&&parent.Q?.quotient_action_image===6&&
    parent.D?.kernel_equals_inner===true&&parent.Q?.kernel_equals_inner===true&&
    JSON.stringify(parent.D?.lift_fiber_sizes)===JSON.stringify([4,4])&&
    JSON.stringify(parent.Q?.lift_fiber_sizes)===JSON.stringify([4,4,4,4,4,4])&&
    orbitParent.passed===true&&ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA==='td613.dome-world.atlas-quadratic-refinement-orbit-geometry/v0.1';

  const beta=parent.geometry.D_beta;
  const functions=allBooleanFunctions();
  let polarizationChecks=0;
  const refinements=[];
  for(const q of functions){
    let ok=true;
    for(let u=0;u<4;u++) for(let v=0;v<4;v++){
      polarizationChecks+=1;
      if((q[addIndex(u,v)]^q[u]^q[v])!==beta[u][v]) ok=false;
    }
    if(ok) refinements.push(q);
  }
  const refinementIndex=new Map(refinements.map((q,i)=>[qId(q),i]));
  const dIndex=refinementIndex.get(qId(parent.D.q)),qIndex=refinementIndex.get(qId(parent.Q.q));

  const matrices=allMatrices(),gl=matrices.filter(m=>detF2(m)===1),pairing=gl.filter(m=>preservesBeta(m,beta));
  const dNative=pairing.filter(m=>preservesQ(m,parent.D.q));
  const qNative=pairing.filter(m=>preservesQ(m,parent.Q.q));
  const dAction=actionAudit(refinements,dNative,gl),qAction=actionAudit(refinements,qNative,gl);

  const symplecticBases=[];
  for(let u=1;u<4;u++) for(let v=1;v<4;v++) if(beta[u][v]===1) symplecticBases.push(Object.freeze([u,v]));
  let arfChecks=0,arfFailures=0;
  const arfBits=[];
  for(const q of refinements){
    const bits=[];
    for(const [u,v] of symplecticBases){ arfChecks+=1; bits.push(q[u]&q[v]); }
    if(bits.some(bit=>bit!==bits[0])) arfFailures+=1;
    arfBits.push(bits[0]);
  }
  const arfClasses=new Map();
  arfBits.forEach((bit,i)=>{ if(!arfClasses.has(bit)) arfClasses.set(bit,new Set()); arfClasses.get(bit).add(i); });
  const arfPartition=setPartitionIds([...arfClasses.values()]);
  const dOrbitPartition=setPartitionIds(dAction.orbits),qOrbitPartition=setPartitionIds(qAction.orbits);
  const dArfEquals=JSON.stringify(arfPartition)===JSON.stringify(dOrbitPartition);
  const qArfEquals=JSON.stringify(arfPartition)===JSON.stringify(qOrbitPartition);
  const arfZero=new Set(arfBits.map((bit,i)=>bit===0?i:null).filter(i=>i!==null));
  const dArfZeroOrbitCount=dAction.orbits.filter(orbit=>orbit.some(i=>arfZero.has(i))).length;
  const qArfZeroOrbitCount=qAction.orbits.filter(orbit=>orbit.some(i=>arfZero.has(i))).length;

  const dDistinguishedFixed=dNative.filter(m=>qId(pullback(refinements[dIndex],m,gl))===qId(refinements[dIndex])).length;
  const qDistinguishedFixed=qNative.filter(m=>qId(pullback(refinements[qIndex],m,gl))===qId(refinements[qIndex])).length;

  const targetRefinements=['0001','0010','0100','0111'];
  const targetD=[[2,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,2]];
  const targetQ=[[2,2,2,0],[2,2,2,0],[2,2,2,0],[0,0,0,6]];
  const exact=parentExact&&functions.length===16&&polarizationChecks===256&&refinements.length===4&&
    JSON.stringify(refinements.map(qId))===JSON.stringify(targetRefinements)&&dIndex===0&&qIndex===3&&
    matrices.length===16&&gl.length===6&&pairing.length===6&&dNative.length===2&&qNative.length===6&&
    dAction.checks===8&&dAction.escapes===0&&JSON.stringify(dAction.count)===JSON.stringify(targetD)&&
    JSON.stringify(dAction.orbitSizes)===JSON.stringify([2,1,1])&&JSON.stringify(dAction.stabilizers)===JSON.stringify([2,1,1,2])&&
    dAction.distinctSignatures===2&&dAction.signaturePairChecks===1&&dAction.signatureCollisions===0&&
    qAction.checks===24&&qAction.escapes===0&&JSON.stringify(qAction.count)===JSON.stringify(targetQ)&&
    JSON.stringify(qAction.orbitSizes)===JSON.stringify([3,1])&&JSON.stringify(qAction.stabilizers)===JSON.stringify([2,2,2,6])&&
    qAction.distinctSignatures===6&&qAction.signaturePairChecks===15&&qAction.signatureCollisions===0&&
    symplecticBases.length===6&&arfChecks===24&&arfFailures===0&&JSON.stringify(arfBits)===JSON.stringify([0,0,0,1])&&
    !dArfEquals&&qArfEquals&&dArfZeroOrbitCount===2&&qArfZeroOrbitCount===1&&
    dDistinguishedFixed===2&&qDistinguishedFixed===6&&
    JSON.stringify(orbitParent.action?.orbit_sizes)===JSON.stringify([3,1]);

  cached=freeze({
    schema:ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_SCHEMA,
    parent_receipt:ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_PARENT_RECEIPT,
    parent_exact:parentExact,
    refinement_reconstruction:freeze({boolean_function_candidates:functions.length,polarization_checks:polarizationChecks,admitted:refinements.length,vectors:freeze(refinements.map(q=>freeze([...q])))}),
    geometry:freeze({binary_matrix_candidates:matrices.length,GL2F2_size:gl.length,pairing_automorphisms:pairing.length,ambient_pairing_orbit_sizes:freeze([...orbitParent.action.orbit_sizes])}),
    arf:freeze({ordered_symplectic_bases:symplecticBases.length,checks:arfChecks,failures:arfFailures,bits:freeze(arfBits)}),
    D:freeze({automorphisms:parent.D.automorphisms,native_outer_size:dNative.length,action_checks:dAction.checks,action_count_matrix:freeze(dAction.count.map(r=>freeze(r))),orbits:freeze(dAction.orbits),orbit_sizes:freeze(dAction.orbitSizes),stabilizer_sizes:freeze(dAction.stabilizers),family_action_signatures:dAction.distinctSignatures,signature_pair_checks:dAction.signaturePairChecks,signature_collisions:dAction.signatureCollisions,arf_partition_equals_native_orbits:dArfEquals,arf_zero_native_orbits:dArfZeroOrbitCount,distinguished_refinement_fixed:dDistinguishedFixed,lift_fiber_sizes:freeze([...parent.D.lift_fiber_sizes]),receiver_class_counts:freeze([parent.D.automorphisms,dNative.length,1])}),
    Q:freeze({automorphisms:parent.Q.automorphisms,native_outer_size:qNative.length,action_checks:qAction.checks,action_count_matrix:freeze(qAction.count.map(r=>freeze(r))),orbits:freeze(qAction.orbits),orbit_sizes:freeze(qAction.orbitSizes),stabilizer_sizes:freeze(qAction.stabilizers),family_action_signatures:qAction.distinctSignatures,signature_pair_checks:qAction.signaturePairChecks,signature_collisions:qAction.signatureCollisions,arf_partition_equals_native_orbits:qArfEquals,arf_zero_native_orbits:qArfZeroOrbitCount,distinguished_refinement_fixed:qDistinguishedFixed,lift_fiber_sizes:freeze([...parent.Q.lift_fiber_sizes]),receiver_class_counts:freeze([parent.Q.automorphisms,qNative.length,1])}),
    laws:freeze({
      invariant_completeness_is_admitted_symmetry_relative:!dArfEquals&&qArfEquals,
      D_Arf_zero_splits_under_native_liftable_symmetry:dArfZeroOrbitCount===2,
      Q_Arf_partition_exactly_native_orbits:qArfEquals,
      complete_refinement_family_faithful_for_D_outer_action:dAction.distinctSignatures===dNative.length,
      complete_refinement_family_faithful_for_Q_outer_action:qAction.distinctSignatures===qNative.length,
      distinguished_native_refinement_collapses_outer_action_D:dDistinguishedFixed===dNative.length,
      distinguished_native_refinement_collapses_outer_action_Q:qDistinguishedFixed===qNative.length,
      universal_invariant_completeness_claimed:false,
      physical_symmetry_claimed:false,
    }),
    membranes:freeze([
      'NATIVE_SYMMETRY_RECEIVER != PHYSICAL_SYMMETRY_GROUP',
      'OUTER_AUTOMORPHISM != EXTERNAL_ACTOR',
      'ARF_CLASSIFICATION_COMPLETENESS != UNIVERSAL_INVARIANT_COMPLETENESS',
      'REFINEMENT_ORBIT != PHYSICAL_STATE_ORBIT',
      'FAITHFUL_REFINEMENT_ACTION != CAUSAL_REALIZABILITY',
      'DISTINGUISHED_Q_INVARIANCE != TOTAL_INFORMATION_ERASURE',
      'AUTOMORPHISM_RECEIVER_CLASS != SOURCE_PROVENANCE_CLASS',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_CERTIFICATE=atlasNativeSymmetryReceiverStratificationCertificate();