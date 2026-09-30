import {
  ATLAS_COMMUTATOR_PAIRING_GEOMETRY_SCHEMA,
  atlasCommutatorPairingGeometryCertificate,
} from './atlas-commutator-pairing-geometry.js';

export const ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA='td613.dome-world.atlas-quadratic-refinement-extension-discrimination/v0.1';
export const ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_PARENT_RECEIPT='abfc2a801127b85fea870b56d253882951cca241';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const COORDS=Object.freeze([[0,0],[1,0],[0,1],[1,1]].map(row=>Object.freeze(row)));
const COORD_INDEX=new Map(COORDS.map((row,index)=>[row.join(''),index]));
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const pairId=pair=>pair.join('');
const samePair=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const ID=state=>Object.freeze([...state]);
const A_TRANSPORT=([x,y])=>Object.freeze([x^1,y]);
const B_TRANSPORT=([x,y])=>Object.freeze([x,y^x]);
function mapOf(fn){ return Object.freeze(STATES.map(state=>Object.freeze([...fn(state)]))); }
function mapId(map){ return map.map(pairId).join('|'); }
function applyMap(map,state){ return map[INDEX.get(pairId(state))]; }
function compose(left,right){ return Object.freeze(STATES.map(state=>Object.freeze([...applyMap(right,applyMap(left,state))]))); }
function isIdentity(map){ return STATES.every((state,index)=>samePair(state,map[index])); }
function closure(generators){
  const identity=mapOf(ID);
  const byId=new Map([[mapId(identity),identity]]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of [...generators,...current]){
      for(const candidate of [compose(left,right),compose(right,left)]){
        const id=mapId(candidate);
        if(!byId.has(id)){ byId.set(id,candidate); changed=true; }
      }
    }
  }
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function inverseIn(group,map){
  for(const candidate of group) if(isIdentity(compose(map,candidate))&&isIdentity(compose(candidate,map))) return candidate;
  return null;
}
function commutator(left,right,group){
  const li=inverseIn(group,left),ri=inverseIn(group,right);
  if(!li||!ri) throw new Error('commutator requires inverses');
  return compose(compose(compose(left,right),li),ri);
}
function subgroupClosure(seed,group){
  const identity=mapOf(ID);
  const byId=new Map([[mapId(identity),identity],...seed.map(map=>[mapId(map),map])]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of current){
      const candidate=compose(left,right),id=mapId(candidate);
      if(!byId.has(id)){ byId.set(id,candidate); changed=true; }
    }
  }
  const groupIds=new Set(group.map(mapId));
  if([...byId.keys()].some(id=>!groupIds.has(id))) throw new Error('subgroup escaped group');
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function sameMapSet(left,right){
  return JSON.stringify([...left].map(mapId).sort())===JSON.stringify([...right].map(mapId).sort());
}
function dCosetMembers(map,center){ return Object.freeze(center.map(z=>compose(map,z)).sort((a,b)=>mapId(a).localeCompare(mapId(b)))); }
function dCosetId(map,center){ return dCosetMembers(map,center).map(mapId).join('::'); }

const Q_ELEMENTS=Object.freeze(['1','-1','i','-i','j','-j','k','-k']);
const Q_SET=new Set(Q_ELEMENTS);
const POS_MUL=Object.freeze({
  '1':Object.freeze({'1':[0,'1'],i:[0,'i'],j:[0,'j'],k:[0,'k']}),
  i:Object.freeze({'1':[0,'i'],i:[1,'1'],j:[0,'k'],k:[1,'j']}),
  j:Object.freeze({'1':[0,'j'],i:[1,'k'],j:[1,'1'],k:[0,'i']}),
  k:Object.freeze({'1':[0,'k'],i:[0,'j'],j:[1,'i'],k:[1,'1']}),
});
function qParse(value){ return value.startsWith('-')?[1,value.slice(1)]:[0,value]; }
function qFormat(sign,unit){ return sign?`-${unit}`:unit; }
function qMul(left,right){
  const [ls,lu]=qParse(left),[rs,ru]=qParse(right);
  const [bs,bu]=POS_MUL[lu][ru];
  return qFormat(ls^rs^bs,bu);
}
function qInverse(value){
  return Q_ELEMENTS.find(candidate=>qMul(value,candidate)==='1'&&qMul(candidate,value)==='1')||null;
}
function qCommutator(left,right){
  const li=qInverse(left),ri=qInverse(right);
  if(!li||!ri) throw new Error('Q8 commutator requires inverses');
  return qMul(qMul(qMul(left,right),li),ri);
}
function qSubgroupClosure(seed){
  const set=new Set(['1',...seed]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...set];
    for(const left of current) for(const right of current){
      const value=qMul(left,right);
      if(!set.has(value)){ set.add(value); changed=true; }
    }
  }
  return Object.freeze([...set].sort());
}
function qCosetMembers(rep,center){ return Object.freeze(center.map(z=>qMul(rep,z)).sort()); }
function qCosetId(rep,center){ return qCosetMembers(rep,center).join('::'); }
function sameStringSet(left,right){ return JSON.stringify([...left].sort())===JSON.stringify([...right].sort()); }

function quotientAddFromCosets(cosets,cosetIdOf,multiply){
  const ids=cosets.map(coset=>cosetIdOf(coset[0]));
  const index=new Map(ids.map((id,i)=>[id,i]));
  const table=Array.from({length:cosets.length},()=>Array(cosets.length).fill(null));
  let failures=0;
  for(let i=0;i<cosets.length;i+=1) for(let j=0;j<cosets.length;j+=1){
    const id=cosetIdOf(multiply(cosets[i][0],cosets[j][0]));
    const k=index.get(id);
    if(k===undefined) failures+=1;
    table[i][j]=k;
  }
  return {table,failures};
}
function binaryMatrices(){
  const rows=[];
  for(let a=0;a<2;a+=1) for(let b=0;b<2;b+=1) for(let c=0;c<2;c+=1) for(let d=0;d<2;d+=1){
    const det=((a*d)^(b*c))&1;
    rows.push(Object.freeze({matrix:Object.freeze([[a,b],[c,d]].map(row=>Object.freeze(row))),det}));
  }
  return Object.freeze(rows);
}
function applyMatrix(matrix,coord){
  const [[a,b],[c,d]]=matrix,[x,y]=coord;
  return Object.freeze([(a*x)^(b*y),(c*x)^(d*y)]);
}
function transformIndex(matrix,index){ return COORD_INDEX.get(pairId(applyMatrix(matrix,COORDS[index]))); }

export function atlasQuadraticRefinementExtensionDiscriminationCertificate(){
  if(cached) return cached;

  const parent=atlasCommutatorPairingGeometryCertificate();
  const targetBeta=[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]];
  const parentExact=parent.passed===true&&
    ATLAS_COMMUTATOR_PAIRING_GEOMETRY_SCHEMA==='td613.dome-world.atlas-commutator-pairing-geometry/v0.1'&&
    parent.transport_group?.center_equals_derived===true&&parent.quotient?.size===4&&
    parent.laws?.alternating===true&&parent.laws?.bilinear_over_F2===true&&parent.laws?.nondegenerate===true&&
    JSON.stringify(parent.pairing?.table)===JSON.stringify(targetBeta)&&
    JSON.stringify(parent.basis_matrix?.matrix)===JSON.stringify([[0,1],[1,0]]);

  // Earned D8-side reconstruction.
  const dId=mapOf(ID),dA=mapOf(A_TRANSPORT),dB=mapOf(B_TRANSPORT),dAB=compose(dA,dB);
  const dGroup=closure([dA,dB]);
  const dCommutators=[];
  for(const left of dGroup) for(const right of dGroup) dCommutators.push(commutator(left,right,dGroup));
  const dDerived=subgroupClosure(dCommutators,dGroup);
  const dCenter=[];
  for(const candidate of dGroup){
    if(dGroup.every(other=>mapId(compose(candidate,other))===mapId(compose(other,candidate)))) dCenter.push(candidate);
  }
  dCenter.sort((a,b)=>mapId(a).localeCompare(mapId(b)));
  const dNontrivialCenter=dCenter.find(map=>!isIdentity(map));
  if(!dNontrivialCenter) throw new Error('D-side unique nonidentity center element required');
  const dCenterEqualsDerived=sameMapSet(dCenter,dDerived);
  const dReps=[dId,dA,dB,dAB];
  const dCosets=Object.freeze(dReps.map(rep=>dCosetMembers(rep,dCenter)));
  const dCosetIds=dCosets.map(coset=>dCosetId(coset[0],dCenter));
  const dDistinctCosets=new Set(dCosetIds).size;
  const dAddResult=quotientAddFromCosets(dCosets,map=>dCosetId(map,dCenter),compose);
  const dCentralBit=map=>isIdentity(map)?0:(mapId(map)===mapId(dNontrivialCenter)?1:null);

  let dSquareRepresentativeEvaluations=0,dSquareOutsideCenter=0,dSquareRepresentativeDisagreements=0;
  const qD=[];
  for(const coset of dCosets){
    const bits=[];
    for(const rep of coset){
      dSquareRepresentativeEvaluations+=1;
      const bit=dCentralBit(compose(rep,rep));
      if(bit===null) dSquareOutsideCenter+=1;
      bits.push(bit);
    }
    if(bits.some(bit=>bit!==bits[0])) dSquareRepresentativeDisagreements+=1;
    qD.push(bits[0]);
  }
  let dElementSquareChecks=0,dElementSquareIdentity=0,dElementSquareNonidentity=0;
  for(const g of dGroup){
    dElementSquareChecks+=1;
    const bit=dCentralBit(compose(g,g));
    if(bit===0) dElementSquareIdentity+=1;
    if(bit===1) dElementSquareNonidentity+=1;
  }
  const betaD=Array.from({length:4},()=>Array(4).fill(null));
  let dPairingRepresentativeEvaluations=0,dPairingRepresentativeFailures=0;
  for(let i=0;i<4;i+=1) for(let j=0;j<4;j+=1){
    const bits=[];
    for(const left of dCosets[i]) for(const right of dCosets[j]){
      dPairingRepresentativeEvaluations+=1;
      bits.push(dCentralBit(commutator(left,right,dGroup)));
    }
    if(bits.some(bit=>bit!==bits[0]||bit===null)) dPairingRepresentativeFailures+=1;
    betaD[i][j]=bits[0];
  }
  let dPolarizationChecks=0,dPolarizationFailures=0;
  for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
    dPolarizationChecks+=1;
    const observed=qD[dAddResult.table[u][v]]^qD[u]^qD[v];
    if(observed!==betaD[u][v]) dPolarizationFailures+=1;
  }

  // Independent symbolic Q8 control reconstruction.
  let qClosureChecks=0,qClosureEscapes=0,qInverseChecks=0,qInverseFailures=0;
  for(const left of Q_ELEMENTS) for(const right of Q_ELEMENTS){ qClosureChecks+=1; if(!Q_SET.has(qMul(left,right))) qClosureEscapes+=1; }
  for(const value of Q_ELEMENTS){ qInverseChecks+=1; if(!qInverse(value)) qInverseFailures+=1; }
  const qCenter=[];
  let qCenterRelationChecks=0;
  for(const candidate of Q_ELEMENTS){
    let central=true;
    for(const other of Q_ELEMENTS){ qCenterRelationChecks+=1; if(qMul(candidate,other)!==qMul(other,candidate)) central=false; }
    if(central) qCenter.push(candidate);
  }
  qCenter.sort();
  let qCommutatorChecks=0;
  const qCommutatorValues=[];
  for(const left of Q_ELEMENTS) for(const right of Q_ELEMENTS){ qCommutatorChecks+=1; qCommutatorValues.push(qCommutator(left,right)); }
  const qDerived=qSubgroupClosure(qCommutatorValues);
  const qCenterEqualsDerived=sameStringSet(qCenter,qDerived);
  const qNontrivialCenter=qCenter.find(value=>value!=='1');
  if(!qNontrivialCenter) throw new Error('Q-side unique nonidentity center element required');
  const qReps=['1','i','j','k'];
  const qCosets=Object.freeze(qReps.map(rep=>qCosetMembers(rep,qCenter)));
  const qCosetIds=qCosets.map(coset=>qCosetId(coset[0],qCenter));
  const qDistinctCosets=new Set(qCosetIds).size;
  const qAddResult=quotientAddFromCosets(qCosets,value=>qCosetId(value,qCenter),qMul);
  const qCentralBit=value=>value==='1'?0:(value===qNontrivialCenter?1:null);

  let qSquareRepresentativeEvaluations=0,qSquareOutsideCenter=0,qSquareRepresentativeDisagreements=0;
  const qQ=[];
  for(const coset of qCosets){
    const bits=[];
    for(const rep of coset){
      qSquareRepresentativeEvaluations+=1;
      const bit=qCentralBit(qMul(rep,rep));
      if(bit===null) qSquareOutsideCenter+=1;
      bits.push(bit);
    }
    if(bits.some(bit=>bit!==bits[0])) qSquareRepresentativeDisagreements+=1;
    qQ.push(bits[0]);
  }
  let qElementSquareChecks=0,qElementSquareIdentity=0,qElementSquareNonidentity=0;
  for(const g of Q_ELEMENTS){
    qElementSquareChecks+=1;
    const bit=qCentralBit(qMul(g,g));
    if(bit===0) qElementSquareIdentity+=1;
    if(bit===1) qElementSquareNonidentity+=1;
  }
  const betaQ=Array.from({length:4},()=>Array(4).fill(null));
  let qPairingRepresentativeEvaluations=0,qPairingRepresentativeFailures=0;
  for(let i=0;i<4;i+=1) for(let j=0;j<4;j+=1){
    const bits=[];
    for(const left of qCosets[i]) for(const right of qCosets[j]){
      qPairingRepresentativeEvaluations+=1;
      bits.push(qCentralBit(qCommutator(left,right)));
    }
    if(bits.some(bit=>bit!==bits[0]||bit===null)) qPairingRepresentativeFailures+=1;
    betaQ[i][j]=bits[0];
  }
  let qPolarizationChecks=0,qPolarizationFailures=0;
  for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1){
    qPolarizationChecks+=1;
    const observed=qQ[qAddResult.table[u][v]]^qQ[u]^qQ[v];
    if(observed!==betaQ[u][v]) qPolarizationFailures+=1;
  }

  let crossPairingCellChecks=0,crossPairingMismatches=0,qVectorDifferences=0;
  for(let i=0;i<4;i+=1){
    if(qD[i]!==qQ[i]) qVectorDifferences+=1;
    for(let j=0;j<4;j+=1){ crossPairingCellChecks+=1; if(betaD[i][j]!==betaQ[i][j]) crossPairingMismatches+=1; }
  }

  const symplecticBases=[];
  for(let e=1;e<4;e+=1) for(let f=1;f<4;f+=1) if(betaD[e][f]===1) symplecticBases.push(Object.freeze([e,f]));
  const dArfBits=symplecticBases.map(([e,f])=>qD[e]&qD[f]);
  const qArfBits=symplecticBases.map(([e,f])=>qQ[e]&qQ[f]);
  const dArfBasisFailures=dArfBits.filter(bit=>bit!==0).length;
  const qArfBasisFailures=qArfBits.filter(bit=>bit!==1).length;

  const allMatrices=binaryMatrices();
  const gl=allMatrices.filter(row=>row.det===1);
  let glPairingPreservers=0,dQStabilizers=0,qQStabilizers=0,crossDToQIsometries=0,crossQToDIsometries=0;
  for(const row of gl){
    const m=row.matrix;
    let preservesBeta=true,preservesD=true,preservesQ=true,mapsDToQ=true,mapsQToD=true;
    for(let u=0;u<4;u+=1){
      const tu=transformIndex(m,u);
      if(qD[tu]!==qD[u]) preservesD=false;
      if(qQ[tu]!==qQ[u]) preservesQ=false;
      if(qD[tu]!==qQ[u]) mapsDToQ=false;
      if(qQ[tu]!==qD[u]) mapsQToD=false;
      for(let v=0;v<4;v+=1){
        const tv=transformIndex(m,v);
        if(betaD[tu][tv]!==betaD[u][v]) preservesBeta=false;
      }
    }
    if(preservesBeta) glPairingPreservers+=1;
    if(preservesD) dQStabilizers+=1;
    if(preservesQ) qQStabilizers+=1;
    if(mapsDToQ&&preservesBeta) crossDToQIsometries+=1;
    if(mapsQToD&&preservesBeta) crossQToDIsometries+=1;
  }

  const dZeroValues=qD.filter(bit=>bit===0).length,dOneValues=qD.filter(bit=>bit===1).length;
  const qZeroValues=qQ.filter(bit=>bit===0).length,qOneValues=qQ.filter(bit=>bit===1).length;
  const dNonzeroIsotropic=[1,2,3].filter(index=>qD[index]===0).length;
  const qNonzeroIsotropic=[1,2,3].filter(index=>qQ[index]===0).length;
  const targetAdd=[[0,1,2,3],[1,0,3,2],[2,3,0,1],[3,2,1,0]];

  const exact=parentExact&&
    dGroup.length===8&&dDerived.length===2&&dCenter.length===2&&dCenterEqualsDerived&&dDistinctCosets===4&&dCosets.every(c=>c.length===2)&&JSON.stringify(dAddResult.table)===JSON.stringify(targetAdd)&&dAddResult.failures===0&&
    dSquareRepresentativeEvaluations===8&&dSquareOutsideCenter===0&&dSquareRepresentativeDisagreements===0&&JSON.stringify(qD)===JSON.stringify([0,0,0,1])&&dZeroValues===3&&dOneValues===1&&dElementSquareChecks===8&&dElementSquareIdentity===6&&dElementSquareNonidentity===2&&
    dPairingRepresentativeEvaluations===64&&dPairingRepresentativeFailures===0&&JSON.stringify(betaD)===JSON.stringify(targetBeta)&&dPolarizationChecks===16&&dPolarizationFailures===0&&
    qClosureChecks===64&&qClosureEscapes===0&&qInverseChecks===8&&qInverseFailures===0&&qCenterRelationChecks===64&&qCenter.length===2&&qCommutatorChecks===64&&qDerived.length===2&&qCenterEqualsDerived&&qDistinctCosets===4&&qCosets.every(c=>c.length===2)&&JSON.stringify(qAddResult.table)===JSON.stringify(targetAdd)&&qAddResult.failures===0&&
    qSquareRepresentativeEvaluations===8&&qSquareOutsideCenter===0&&qSquareRepresentativeDisagreements===0&&JSON.stringify(qQ)===JSON.stringify([0,1,1,1])&&qZeroValues===1&&qOneValues===3&&qElementSquareChecks===8&&qElementSquareIdentity===2&&qElementSquareNonidentity===6&&
    qPairingRepresentativeEvaluations===64&&qPairingRepresentativeFailures===0&&JSON.stringify(betaQ)===JSON.stringify(targetBeta)&&qPolarizationChecks===16&&qPolarizationFailures===0&&
    crossPairingCellChecks===16&&crossPairingMismatches===0&&qVectorDifferences===2&&
    symplecticBases.length===6&&dArfBasisFailures===0&&qArfBasisFailures===0&&
    allMatrices.length===16&&gl.length===6&&glPairingPreservers===6&&dQStabilizers===2&&qQStabilizers===6&&crossDToQIsometries===0&&crossQToDIsometries===0&&
    dNonzeroIsotropic===2&&qNonzeroIsotropic===0;

  cached=freeze({
    schema:ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_SCHEMA,
    parent_receipt:ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_PARENT_RECEIPT,
    parent_exact:parentExact,
    earned_D8:freeze({group_size:dGroup.length,center_size:dCenter.length,derived_size:dDerived.length,center_equals_derived:dCenterEqualsDerived,quotient_size:dDistinctCosets,quotient_addition:freeze(dAddResult.table.map(row=>freeze(row))),q:freeze(qD),q_zero_values:dZeroValues,q_one_values:dOneValues,nonzero_isotropic_vectors:dNonzeroIsotropic,element_square_checks:dElementSquareChecks,element_square_identity:dElementSquareIdentity,element_square_nonidentity_center:dElementSquareNonidentity}),
    quaternion_control:freeze({group_size:Q_ELEMENTS.length,closure_checks:qClosureChecks,closure_escapes:qClosureEscapes,inverse_checks:qInverseChecks,inverse_failures:qInverseFailures,center_size:qCenter.length,derived_size:qDerived.length,center_equals_derived:qCenterEqualsDerived,quotient_size:qDistinctCosets,quotient_addition:freeze(qAddResult.table.map(row=>freeze(row))),q:freeze(qQ),q_zero_values:qZeroValues,q_one_values:qOneValues,nonzero_isotropic_vectors:qNonzeroIsotropic,element_square_checks:qElementSquareChecks,element_square_identity:qElementSquareIdentity,element_square_nonidentity_center:qElementSquareNonidentity}),
    shared_polar_form:freeze({D_table:freeze(betaD.map(row=>freeze(row))),Q_table:freeze(betaQ.map(row=>freeze(row))),cross_cell_checks:crossPairingCellChecks,cross_mismatches:crossPairingMismatches,q_vector_differences:qVectorDifferences}),
    square_well_definedness:freeze({D_representative_evaluations:dSquareRepresentativeEvaluations,D_outside_center:dSquareOutsideCenter,D_representative_disagreements:dSquareRepresentativeDisagreements,Q_representative_evaluations:qSquareRepresentativeEvaluations,Q_outside_center:qSquareOutsideCenter,Q_representative_disagreements:qSquareRepresentativeDisagreements}),
    polarization:freeze({D_checks:dPolarizationChecks,D_failures:dPolarizationFailures,Q_checks:qPolarizationChecks,Q_failures:qPolarizationFailures}),
    arf:freeze({ordered_symplectic_bases:symplecticBases.length,D_bits:freeze(dArfBits),Q_bits:freeze(qArfBits),D_bit:0,Q_bit:1,D_basis_failures:dArfBasisFailures,Q_basis_failures:qArfBasisFailures}),
    linear_isometry_audit:freeze({binary_matrix_candidates:allMatrices.length,GL2F2_size:gl.length,pairing_preservers:glPairingPreservers,D_q_stabilizer:dQStabilizers,Q_q_stabilizer:qQStabilizers,cross_D_to_Q_q_isometries:crossDToQIsometries,cross_Q_to_D_q_isometries:crossQToDIsometries}),
    laws:freeze({
      square_map_well_defined_on_D_central_quotient:dSquareOutsideCenter===0&&dSquareRepresentativeDisagreements===0,
      square_map_well_defined_on_Q_central_quotient:qSquareOutsideCenter===0&&qSquareRepresentativeDisagreements===0,
      D_q_polarizes_to_earned_pairing:dPolarizationFailures===0&&JSON.stringify(betaD)===JSON.stringify(targetBeta),
      Q_q_polarizes_to_same_pairing:qPolarizationFailures===0&&JSON.stringify(betaQ)===JSON.stringify(targetBeta),
      same_pairing_distinct_quadratic_refinements:crossPairingMismatches===0&&qVectorDifferences>0,
      opposite_Arf_bits:dArfBasisFailures===0&&qArfBasisFailures===0,
      quadratic_forms_nonisometric_under_GL2F2:crossDToQIsometries===0&&crossQToDIsometries===0,
      universal_extension_classification_claimed:false,
      physical_quadratic_or_quantum_claimed:false,
    }),
    membranes:freeze([
      'QUADRATIC_REFINEMENT != QUANTUM_STATE',
      'ARF_INVARIANT != ENTROPY',
      'SQUARE_MAP != PHYSICAL_ENERGY',
      'FINITE_F2_QUADRATIC_FORM != PHYSICAL_PHASE_SPACE',
      'PAIRING_EQUALITY != EXTENSION_EQUALITY',
      'QUADRATIC_REFINEMENT_DISCRIMINATION != UNIVERSAL_GROUP_CLASSIFICATION',
      'D8_VS_Q8_CONTROL != PHYSICAL_SYMMETRY_IDENTIFICATION',
      'Q8_SYMBOLIC_CONTROL != QUATERNIONIC_PHYSICS',
      'CENTRAL_EXTENSION_DATA != HISTORICAL_SOURCE_PROVENANCE',
      'FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_QUADRATIC_REFINEMENT_EXTENSION_DISCRIMINATION_CERTIFICATE=atlasQuadraticRefinementExtensionDiscriminationCertificate();
