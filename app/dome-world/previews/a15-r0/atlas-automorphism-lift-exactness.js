import {
  ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA,
  atlasQuadraticRefinementOrbitGeometryCertificate,
} from './atlas-quadratic-refinement-orbit-geometry.js';

export const ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA='td613.dome-world.atlas-automorphism-lift-exactness/v0.1';
export const ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_PARENT_RECEIPT='fb4f10524d4f93c35fc4d1a48c6b86c6f5aa1487';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(v=>Object.freeze(v)));
const STATE_INDEX=new Map(STATES.map((v,i)=>[v.join(''),i]));
const V=Object.freeze([[0,0],[1,0],[0,1],[1,1]].map(v=>Object.freeze(v)));
const V_INDEX=new Map(V.map((v,i)=>[v.join(''),i]));
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const samePair=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const pairId=v=>v.join('');
const ID=state=>Object.freeze([...state]);
const A=([x,y])=>Object.freeze([x^1,y]);
const B=([x,y])=>Object.freeze([x,y^x]);
function mapOf(fn){ return Object.freeze(STATES.map(s=>Object.freeze([...fn(s)]))); }
function mapId(map){ return map.map(pairId).join('|'); }
function applyMap(map,state){ return map[STATE_INDEX.get(pairId(state))]; }
function compose(left,right){ return Object.freeze(STATES.map(s=>Object.freeze([...applyMap(right,applyMap(left,s))]))); }
function isIdentityMap(map){ return STATES.every((s,i)=>samePair(s,map[i])); }
function closureMaps(generators){
  const id=mapOf(ID),byId=new Map([[mapId(id),id]]); let changed=true;
  while(changed){ changed=false; const current=[...byId.values()];
    for(const l of current) for(const r of [...generators,...current]) for(const c of [compose(l,r),compose(r,l)]){
      const idc=mapId(c); if(!byId.has(idc)){ byId.set(idc,c); changed=true; }
    }
  }
  return Object.freeze([...byId.values()].sort((x,y)=>mapId(x).localeCompare(mapId(y))));
}

function makeStructure(elements,multiply,equal=(a,b)=>a===b){
  const n=elements.length;
  const table=Array.from({length:n},()=>Array(n).fill(-1));
  let closureChecks=0,closureEscapes=0;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    closureChecks+=1; const out=multiply(elements[i],elements[j]);
    const k=elements.findIndex(x=>equal(x,out)); table[i][j]=k; if(k<0) closureEscapes+=1;
  }
  const identity=elements.findIndex((_,i)=>elements.every((__,j)=>table[i][j]===j&&table[j][i]===j));
  const inverses=Array(n).fill(-1);
  for(let i=0;i<n;i++) inverses[i]=elements.findIndex((_,j)=>table[i][j]===identity&&table[j][i]===identity);
  return {elements,table,identity,inverses,closureChecks,closureEscapes};
}

function* permutations(values,start=0){
  if(start===values.length){ yield [...values]; return; }
  for(let i=start;i<values.length;i++){
    [values[start],values[i]]=[values[i],values[start]];
    yield* permutations(values,start+1);
    [values[start],values[i]]=[values[i],values[start]];
  }
}

function enumerateAutomorphisms(structure){
  const n=structure.elements.length,base=Array.from({length:n},(_,i)=>i);
  let candidates=0,multiplicationChecks=0; const autos=[];
  for(const p of permutations(base)){
    candidates+=1; let valid=true;
    for(let i=0;i<n;i++) for(let j=0;j<n;j++){
      multiplicationChecks+=1;
      if(p[structure.table[i][j]]!==structure.table[p[i]][p[j]]) valid=false;
    }
    if(valid) autos.push(Object.freeze([...p]));
  }
  return {candidates,multiplicationChecks,automorphisms:Object.freeze(autos)};
}
const permId=p=>p.join(',');
function innerAutomorphisms(structure){
  const unique=new Map(); let generated=0;
  for(let g=0;g<structure.elements.length;g++){
    generated+=1; const gi=structure.inverses[g];
    const p=Object.freeze(structure.elements.map((_,x)=>structure.table[structure.table[g][x]][gi]));
    unique.set(permId(p),p);
  }
  return {generated,permutations:Object.freeze([...unique.values()].sort((a,b)=>permId(a).localeCompare(permId(b))))};
}
function centerIndices(structure){
  return structure.elements.map((_,i)=>i).filter(i=>structure.elements.every((__,j)=>structure.table[i][j]===structure.table[j][i]));
}
function cosetOf(structure,g,center){ return Object.freeze(center.map(z=>structure.table[g][z]).sort((a,b)=>a-b)); }
const cosetId=c=>c.join(',');
function quotientData(structure,e1,e2){
  const center=centerIndices(structure),byId=new Map();
  for(let g=0;g<structure.elements.length;g++){ const c=cosetOf(structure,g,center); if(!byId.has(cosetId(c))) byId.set(cosetId(c),c); }
  const e0=structure.identity,e12=structure.table[e1][e2];
  const ordered=[e0,e1,e2,e12].map(g=>cosetOf(structure,g,center));
  const orderedIds=ordered.map(cosetId),indexById=new Map(orderedIds.map((id,i)=>[id,i]));
  const elementToQuotient=Array(structure.elements.length).fill(-1);
  for(let g=0;g<structure.elements.length;g++) elementToQuotient[g]=indexById.get(cosetId(cosetOf(structure,g,center))) ?? -1;
  const add=Array.from({length:4},()=>Array(4).fill(-1));
  for(let i=0;i<4;i++) for(let j=0;j<4;j++) add[i][j]=elementToQuotient[structure.table[ordered[i][0]][ordered[j][0]]];
  const nonidentityCenter=center.find(x=>x!==structure.identity);
  const q=[]; let squareRepresentativeEvaluations=0,squareRepresentativeDisagreements=0,squareOutsideCenter=0;
  for(const c of ordered){
    const bits=[]; for(const g of c){ squareRepresentativeEvaluations+=1; const sq=structure.table[g][g]; if(!center.includes(sq)) squareOutsideCenter+=1; bits.push(sq===structure.identity?0:(sq===nonidentityCenter?1:null)); }
    if(bits.some(b=>b!==bits[0])) squareRepresentativeDisagreements+=1; q.push(bits[0]);
  }
  return {center,cosets:ordered,elementToQuotient,add,q,nonidentityCenter,squareRepresentativeEvaluations,squareRepresentativeDisagreements,squareOutsideCenter,distinctCosets:byId.size};
}

function allMatrices(){
  const out=[]; for(let n=0;n<16;n++) out.push(Object.freeze([[n&1,(n>>1)&1],[(n>>2)&1,(n>>3)&1]].map(r=>Object.freeze(r)))); return Object.freeze(out);
}
function matrixId(m){ return m.flat().join(''); }
function transformIndex(m,index){ const [x,y]=V[index],out=[(m[0][0]&x)^(m[0][1]&y),(m[1][0]&x)^(m[1][1]&y)]; return V_INDEX.get(out.join('')); }
function detF2(m){ return ((m[0][0]&m[1][1])^(m[0][1]&m[1][0]))&1; }
function betaFrom(q,add){ return Object.freeze(Array.from({length:4},(_,u)=>Object.freeze(Array.from({length:4},(_,v)=>q[add[u][v]]^q[u]^q[v])))); }
function preservesBeta(m,beta){ for(let u=0;u<4;u++) for(let v=0;v<4;v++) if(beta[transformIndex(m,u)][transformIndex(m,v)]!==beta[u][v]) return false; return true; }
function preservesQ(m,q){ for(let u=0;u<4;u++) if(q[transformIndex(m,u)]!==q[u]) return false; return true; }
function inducedMatrix(auto,quotient){
  const image1=quotient.elementToQuotient[auto[quotient.cosets[1][0]]];
  const image2=quotient.elementToQuotient[auto[quotient.cosets[2][0]]];
  const c1=V[image1],c2=V[image2];
  const m=Object.freeze([[c1[0],c2[0]],[c1[1],c2[1]]].map(r=>Object.freeze(r)));
  for(let v=0;v<4;v++){
    const rep=quotient.cosets[v][0],image=quotient.elementToQuotient[auto[rep]];
    if(transformIndex(m,v)!==image) throw new Error('induced quotient action is not linear in declared coordinates');
  }
  return m;
}
function actionAudit(structure,quotient,autos,inner,orthogonal,pairingPreservers){
  const imageFibers=new Map(),kernel=[];
  const identityMatrix='1001';
  for(const auto of autos){
    const m=inducedMatrix(auto,quotient),id=matrixId(m);
    if(!imageFibers.has(id)) imageFibers.set(id,[]); imageFibers.get(id).push(auto);
    if(id===identityMatrix) kernel.push(auto);
  }
  const imageIds=new Set(imageFibers.keys()),orthIds=new Set(orthogonal.map(matrixId)),pairIds=new Set(pairingPreservers.map(matrixId));
  const imageEqualsOrthogonal=imageIds.size===orthIds.size&&[...imageIds].every(id=>orthIds.has(id));
  const innerIds=new Set(inner.map(permId)),kernelIds=new Set(kernel.map(permId));
  const kernelEqualsInner=innerIds.size===kernelIds.size&&[...innerIds].every(id=>kernelIds.has(id));
  const liftFibers=[...imageFibers.values()].map(xs=>xs.length).sort((a,b)=>a-b);
  const nonorthogonalPairingIds=[...pairIds].filter(id=>!orthIds.has(id));
  let forbiddenLifts=0; for(const id of nonorthogonalPairingIds) forbiddenLifts+=imageFibers.get(id)?.length||0;
  return {imageFibers,kernel,imageIds,orthIds,pairIds,imageEqualsOrthogonal,kernelEqualsInner,liftFibers,nonorthogonalPairingIds,forbiddenLifts};
}

function qMultiply(a,b){
  const parse=s=>{ const neg=s.startsWith('-'),basis=neg?s.slice(1):s; return {sign:neg?-1:1,basis}; };
  const pa=parse(a),pb=parse(b); let sign=pa.sign*pb.sign,basis;
  if(pa.basis==='1') basis=pb.basis;
  else if(pb.basis==='1') basis=pa.basis;
  else if(pa.basis===pb.basis){ sign*=-1; basis='1'; }
  else {
    const key=`${pa.basis}${pb.basis}`;
    const pos={ij:'k',jk:'i',ki:'j'},neg={ji:'k',kj:'i',ik:'j'};
    if(pos[key]) basis=pos[key]; else { basis=neg[key]; sign*=-1; }
  }
  return `${sign<0?'-':''}${basis}`;
}

export function atlasAutomorphismLiftExactnessCertificate(){
  if(cached) return cached;
  const parent=atlasQuadraticRefinementOrbitGeometryCertificate();
  const parentExact=parent.passed===true&&ATLAS_QUADRATIC_REFINEMENT_ORBIT_GEOMETRY_SCHEMA==='td613.dome-world.atlas-quadratic-refinement-orbit-geometry/v0.1'&&
    JSON.stringify(parent.action?.orbit_sizes)===JSON.stringify([3,1])&&JSON.stringify(parent.arf?.bits)===JSON.stringify([0,0,0,1])&&
    parent.pairing_automorphisms?.pairing_preservers===6&&parent.inherited_controls?.D_refinement_index===0&&parent.inherited_controls?.Q_refinement_index===3;

  const dMaps=closureMaps([mapOf(A),mapOf(B)]);
  const dStructure=makeStructure(dMaps,(x,y)=>compose(x,y),(x,y)=>mapId(x)===mapId(y));
  const dA=dMaps.findIndex(m=>mapId(m)===mapId(mapOf(A))),dB=dMaps.findIndex(m=>mapId(m)===mapId(mapOf(B)));
  const dQuotient=quotientData(dStructure,dA,dB),dEnum=enumerateAutomorphisms(dStructure),dInner=innerAutomorphisms(dStructure);

  const qNames=Object.freeze(['1','-1','i','-i','j','-j','k','-k']);
  const qStructure=makeStructure(qNames,qMultiply);
  const qi=qNames.indexOf('i'),qj=qNames.indexOf('j');
  const qQuotient=quotientData(qStructure,qi,qj),qEnum=enumerateAutomorphisms(qStructure),qInner=innerAutomorphisms(qStructure);

  const matrices=allMatrices(),gl=matrices.filter(m=>detF2(m)===1);
  const betaD=betaFrom(dQuotient.q,dQuotient.add),betaQ=betaFrom(qQuotient.q,qQuotient.add);
  const dPairing=gl.filter(m=>preservesBeta(m,betaD)),qPairing=gl.filter(m=>preservesBeta(m,betaQ));
  const dOrth=dPairing.filter(m=>preservesQ(m,dQuotient.q)),qOrth=qPairing.filter(m=>preservesQ(m,qQuotient.q));
  const dAction=actionAudit(dStructure,dQuotient,dEnum.automorphisms,dInner.permutations,dOrth,dPairing);
  const qAction=actionAudit(qStructure,qQuotient,qEnum.automorphisms,qInner.permutations,qOrth,qPairing);

  const targetAdd=[[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]];
  const targetBeta=[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]];
  const dFiberCounts=[...dAction.imageFibers.values()].map(x=>x.length).sort((a,b)=>a-b);
  const qFiberCounts=[...qAction.imageFibers.values()].map(x=>x.length).sort((a,b)=>a-b);
  const totalPermutationCandidates=dEnum.candidates+qEnum.candidates,totalMultiplicationChecks=dEnum.multiplicationChecks+qEnum.multiplicationChecks;

  const exact=parentExact&&
    dStructure.elements.length===8&&dStructure.closureChecks===64&&dStructure.closureEscapes===0&&dQuotient.distinctCosets===4&&JSON.stringify(dQuotient.add)===JSON.stringify(targetAdd)&&JSON.stringify(dQuotient.q)===JSON.stringify([0,0,0,1])&&
    dQuotient.squareRepresentativeEvaluations===8&&dQuotient.squareRepresentativeDisagreements===0&&dQuotient.squareOutsideCenter===0&&
    dEnum.candidates===40320&&dEnum.multiplicationChecks===2580480&&dEnum.automorphisms.length===8&&dInner.generated===8&&dInner.permutations.length===4&&
    qStructure.elements.length===8&&qStructure.closureChecks===64&&qStructure.closureEscapes===0&&qQuotient.distinctCosets===4&&JSON.stringify(qQuotient.add)===JSON.stringify(targetAdd)&&JSON.stringify(qQuotient.q)===JSON.stringify([0,1,1,1])&&
    qQuotient.squareRepresentativeEvaluations===8&&qQuotient.squareRepresentativeDisagreements===0&&qQuotient.squareOutsideCenter===0&&
    qEnum.candidates===40320&&qEnum.multiplicationChecks===2580480&&qEnum.automorphisms.length===24&&qInner.generated===8&&qInner.permutations.length===4&&
    totalPermutationCandidates===80640&&totalMultiplicationChecks===5160960&&matrices.length===16&&gl.length===6&&
    JSON.stringify(betaD)===JSON.stringify(targetBeta)&&JSON.stringify(betaQ)===JSON.stringify(targetBeta)&&dPairing.length===6&&qPairing.length===6&&dOrth.length===2&&qOrth.length===6&&
    dAction.imageIds.size===2&&dAction.kernel.length===4&&dAction.imageEqualsOrthogonal&&dAction.kernelEqualsInner&&JSON.stringify(dFiberCounts)===JSON.stringify([4,4])&&dAction.nonorthogonalPairingIds.length===4&&dAction.forbiddenLifts===0&&
    qAction.imageIds.size===6&&qAction.kernel.length===4&&qAction.imageEqualsOrthogonal&&qAction.kernelEqualsInner&&JSON.stringify(qFiberCounts)===JSON.stringify([4,4,4,4,4,4])&&qAction.nonorthogonalPairingIds.length===0&&qAction.forbiddenLifts===0;

  cached=freeze({
    schema:ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA,
    parent_receipt:ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_PARENT_RECEIPT,
    parent_exact:parentExact,
    exhaustive_census:freeze({per_group_permutation_candidates:40320,total_permutation_candidates:totalPermutationCandidates,per_group_multiplication_checks:2580480,total_multiplication_checks:totalMultiplicationChecks}),
    D:freeze({group_size:dStructure.elements.length,automorphisms:dEnum.automorphisms.length,inner_generated:dInner.generated,inner_unique:dInner.permutations.length,quotient_size:dQuotient.distinctCosets,q:freeze(dQuotient.q),pairing_automorphisms:dPairing.length,orthogonal_stabilizer:dOrth.length,quotient_action_image:dAction.imageIds.size,quotient_action_kernel:dAction.kernel.length,lift_fiber_sizes:freeze(dFiberCounts),image_equals_orthogonal:dAction.imageEqualsOrthogonal,kernel_equals_inner:dAction.kernelEqualsInner,nonquadratic_pairing_automorphisms:dAction.nonorthogonalPairingIds.length,nonquadratic_lifts:dAction.forbiddenLifts}),
    Q:freeze({group_size:qStructure.elements.length,closure_products:qStructure.closureChecks,closure_escapes:qStructure.closureEscapes,automorphisms:qEnum.automorphisms.length,inner_generated:qInner.generated,inner_unique:qInner.permutations.length,quotient_size:qQuotient.distinctCosets,q:freeze(qQuotient.q),pairing_automorphisms:qPairing.length,orthogonal_stabilizer:qOrth.length,quotient_action_image:qAction.imageIds.size,quotient_action_kernel:qAction.kernel.length,lift_fiber_sizes:freeze(qFiberCounts),image_equals_orthogonal:qAction.imageEqualsOrthogonal,kernel_equals_inner:qAction.kernelEqualsInner}),
    geometry:freeze({binary_matrix_candidates:matrices.length,GL2F2_size:gl.length,D_beta:freeze(betaD.map(r=>freeze(r))),Q_beta:freeze(betaQ.map(r=>freeze(r)))}),
    laws:freeze({D_exact_sequence:dAction.imageEqualsOrthogonal&&dAction.kernelEqualsInner,Q_exact_sequence:qAction.imageEqualsOrthogonal&&qAction.kernelEqualsInner,D_quadratic_preservation_exact_liftability_obstruction:dAction.nonorthogonalPairingIds.length===4&&dAction.forbiddenLifts===0,every_D_orthogonal_map_has_four_lifts:dFiberCounts.every(n=>n===4),every_Q_orthogonal_map_has_four_lifts:qFiberCounts.every(n=>n===4),universal_extension_lift_theorem_claimed:false,physical_symmetry_claimed:false}),
    membranes:freeze(['AUTOMORPHISM_GROUP != PHYSICAL_SYMMETRY_GROUP','QUOTIENT_ACTION != PHYSICAL_MOTION','ORTHOGONAL_STABILIZER != CONTINUUM_ORTHOGONAL_GROUP','AUTOMORPHISM_LIFT != CAUSAL_REALIZABILITY','LIFTABILITY_OBSTRUCTION != PHYSICAL_OBSTRUCTION','INNER_AUTOMORPHISM != INTERNAL_MODEL_STATE','OUTER_AUTOMORPHISM_QUOTIENT != EXTERNAL_ACTOR_CLASS','EXACT_SEQUENCE != TEMPORAL_SEQUENCE','D8_Q8_CONTROL != UNIVERSAL_EXTENSION_CLASSIFICATION','FINITE_F2_GEOMETRY != CONTINUUM_PHASE_SPACE','FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),
    passed:exact,
  });
  return cached;
}

export const ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_CERTIFICATE=atlasAutomorphismLiftExactnessCertificate();
