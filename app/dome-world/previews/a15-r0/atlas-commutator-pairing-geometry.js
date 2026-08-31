import {
  ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_SCHEMA,
  atlasCentralCommutatorDepthCollapseCertificate,
} from './atlas-central-commutator-depth-collapse.js';

export const ATLAS_COMMUTATOR_PAIRING_GEOMETRY_SCHEMA='td613.dome-world.atlas-commutator-pairing-geometry/v0.1';
export const ATLAS_COMMUTATOR_PAIRING_GEOMETRY_PARENT_RECEIPT='5fc0678c440e81b393663b39d4659ebc6eeb5e29';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
const INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
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
  const leftInv=inverseIn(group,left),rightInv=inverseIn(group,right);
  if(!leftInv||!rightInv) throw new Error('commutator requires invertible maps');
  return compose(compose(compose(left,right),leftInv),rightInv);
}
function subgroupClosure(seed,group){
  const identity=mapOf(ID);
  const byId=new Map([[mapId(identity),identity],...seed.map(map=>[mapId(map),map])]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of current){
      const candidate=compose(left,right);
      const id=mapId(candidate);
      if(!byId.has(id)){ byId.set(id,candidate); changed=true; }
    }
  }
  const groupIds=new Set(group.map(mapId));
  if([...byId.keys()].some(id=>!groupIds.has(id))) throw new Error('subgroup escaped transport group');
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function cosetMembers(map,center){
  return Object.freeze(center.map(z=>compose(map,z)).sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function cosetId(map,center){ return cosetMembers(map,center).map(mapId).join('::'); }
function sameSet(left,right){
  const a=[...left].map(mapId).sort(),b=[...right].map(mapId).sort();
  return JSON.stringify(a)===JSON.stringify(b);
}
function rankF2(matrix){
  const rows=matrix.map(row=>row.map(value=>value&1));
  let rank=0;
  for(let col=0;col<(rows[0]?.length||0)&&rank<rows.length;col+=1){
    const pivot=rows.findIndex((row,index)=>index>=rank&&row[col]===1);
    if(pivot<0) continue;
    [rows[rank],rows[pivot]]=[rows[pivot],rows[rank]];
    for(let i=0;i<rows.length;i+=1) if(i!==rank&&rows[i][col]===1) for(let j=col;j<rows[i].length;j+=1) rows[i][j]^=rows[rank][j];
    rank+=1;
  }
  return rank;
}

export function atlasCommutatorPairingGeometryCertificate(){
  if(cached) return cached;

  const parent=atlasCentralCommutatorDepthCollapseCertificate();
  const parentExact=parent.passed===true&&
    ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_SCHEMA==='td613.dome-world.atlas-central-commutator-depth-collapse/v0.1'&&
    parent.center?.size===2&&parent.center?.equals_derived_subgroup===true&&
    JSON.stringify(parent.lower_central?.sizes)===JSON.stringify([8,2,1])&&
    parent.lower_central?.nilpotency_class===2;

  const idMap=mapOf(ID),aMap=mapOf(A_TRANSPORT),bMap=mapOf(B_TRANSPORT),abMap=compose(aMap,bMap);
  const group=closure([aMap,bMap]);

  let commutatorChecks=0;
  const commutatorValues=new Map();
  for(const left of group) for(const right of group){
    commutatorChecks+=1;
    const value=commutator(left,right,group);
    commutatorValues.set(mapId(value),value);
  }
  const derived=subgroupClosure([...commutatorValues.values()],group);

  let centerRelationChecks=0;
  const center=[];
  for(const candidate of group){
    let central=true;
    for(const other of group){
      centerRelationChecks+=1;
      if(mapId(compose(candidate,other))!==mapId(compose(other,candidate))) central=false;
    }
    if(central) center.push(candidate);
  }
  center.sort((a,b)=>mapId(a).localeCompare(mapId(b)));
  const centerEqualsDerived=sameSet(center,derived);
  const nonidentityCenter=center.find(map=>!isIdentity(map));
  if(!nonidentityCenter) throw new Error('pairing target requires a unique nonidentity center element');

  const byCosetId=new Map();
  for(const map of group){
    const id=cosetId(map,center);
    if(!byCosetId.has(id)) byCosetId.set(id,cosetMembers(map,center));
  }
  const rawCosets=[...byCosetId.values()];
  const identityCosetId=cosetId(idMap,center),aCosetId=cosetId(aMap,center),bCosetId=cosetId(bMap,center),abCosetId=cosetId(abMap,center);
  const orderedIds=[identityCosetId,aCosetId,bCosetId,abCosetId];
  const orderedDistinct=new Set(orderedIds).size===4;
  const cosets=Object.freeze(orderedIds.map(id=>byCosetId.get(id)));
  const quotientLabels=Object.freeze(['0','e1','e2','e1+e2']);
  const cosetIndex=new Map(orderedIds.map((id,index)=>[id,index]));

  const quotientAdd=Array.from({length:4},()=>Array(4).fill(null));
  let quotientClosureFailures=0;
  for(let i=0;i<4;i+=1) for(let j=0;j<4;j+=1){
    const product=compose(cosets[i][0],cosets[j][0]);
    const index=cosetIndex.get(cosetId(product,center));
    if(index===undefined) quotientClosureFailures+=1;
    quotientAdd[i][j]=index;
  }

  const centralBit=map=>isIdentity(map)?0:(mapId(map)===mapId(nonidentityCenter)?1:null);
  let representativeIndependenceChecks=0,representativeIndependenceFailures=0;
  const table=Array.from({length:4},()=>Array(4).fill(null));
  for(let i=0;i<4;i+=1){
    for(let j=0;j<4;j+=1){
      const bits=[];
      for(const left of cosets[i]) for(const right of cosets[j]){
        representativeIndependenceChecks+=1;
        const bit=centralBit(commutator(left,right,group));
        bits.push(bit);
      }
      const expected=bits[0];
      if(bits.some(bit=>bit!==expected||bit===null)) representativeIndependenceFailures+=1;
      table[i][j]=expected;
    }
  }

  const flat=table.flat();
  const pairingZeros=flat.filter(value=>value===0).length;
  const pairingOnes=flat.filter(value=>value===1).length;
  let alternatingChecks=0,alternatingFailures=0;
  for(let v=0;v<4;v+=1){ alternatingChecks+=1; if(table[v][v]!==0) alternatingFailures+=1; }

  let firstSlotBilinearityChecks=0,firstSlotBilinearityFailures=0;
  let secondSlotBilinearityChecks=0,secondSlotBilinearityFailures=0;
  for(let u=0;u<4;u+=1) for(let v=0;v<4;v+=1) for(let w=0;w<4;w+=1){
    firstSlotBilinearityChecks+=1;
    if(table[quotientAdd[u][v]][w]!==((table[u][w]^table[v][w])&1)) firstSlotBilinearityFailures+=1;
    secondSlotBilinearityChecks+=1;
    if(table[u][quotientAdd[v][w]]!==((table[u][v]^table[u][w])&1)) secondSlotBilinearityFailures+=1;
  }

  let symmetryChecks=0,symmetryFailures=0;
  for(let i=0;i<4;i+=1) for(let j=0;j<4;j+=1){ symmetryChecks+=1; if(table[i][j]!==table[j][i]) symmetryFailures+=1; }

  const radical=[];
  const rowOneCounts=[];
  for(let i=0;i<4;i+=1){
    const ones=table[i].filter(value=>value===1).length;
    rowOneCounts.push(ones);
    if(ones===0) radical.push(i);
  }
  const nonzeroVectorsWithPartner=[1,2,3].filter(index=>rowOneCounts[index]>0).length;

  const basisMatrix=Object.freeze([[table[1][1],table[1][2]],[table[2][1],table[2][2]]].map(row=>Object.freeze(row)));
  const basisRank=rankF2(basisMatrix);
  const basisDet=((basisMatrix[0][0]*basisMatrix[1][1])^(basisMatrix[0][1]*basisMatrix[1][0]))&1;
  const targetTable=[[0,0,0,0],[0,0,1,1],[0,1,0,1],[0,1,1,0]];

  const exact=parentExact&&group.length===8&&commutatorChecks===64&&derived.length===2&&centerRelationChecks===64&&center.length===2&&centerEqualsDerived&&
    byCosetId.size===4&&orderedDistinct&&cosets.every(coset=>coset?.length===2)&&quotientClosureFailures===0&&
    representativeIndependenceChecks===64&&representativeIndependenceFailures===0&&JSON.stringify(table)===JSON.stringify(targetTable)&&pairingZeros===10&&pairingOnes===6&&
    alternatingChecks===4&&alternatingFailures===0&&
    firstSlotBilinearityChecks===64&&firstSlotBilinearityFailures===0&&secondSlotBilinearityChecks===64&&secondSlotBilinearityFailures===0&&
    symmetryChecks===16&&symmetryFailures===0&&radical.length===1&&radical[0]===0&&nonzeroVectorsWithPartner===3&&JSON.stringify(rowOneCounts)===JSON.stringify([0,2,2,2])&&
    JSON.stringify(basisMatrix)===JSON.stringify([[0,1],[1,0]])&&basisRank===2&&basisDet===1;

  cached=freeze({
    schema:ATLAS_COMMUTATOR_PAIRING_GEOMETRY_SCHEMA,
    parent_receipt:ATLAS_COMMUTATOR_PAIRING_GEOMETRY_PARENT_RECEIPT,
    parent_exact:parentExact,
    transport_group:freeze({size:group.length,commutator_checks:commutatorChecks,derived_subgroup_size:derived.length,center_relation_checks:centerRelationChecks,center_size:center.length,center_equals_derived:centerEqualsDerived}),
    quotient:freeze({size:byCosetId.size,class_sizes:freeze(cosets.map(coset=>coset.length)),labels:quotientLabels,addition_table:freeze(quotientAdd.map(row=>freeze(row))),closure_failures:quotientClosureFailures,basis:freeze(['e1=A Z','e2=B Z'])}),
    pairing:freeze({table:freeze(table.map(row=>freeze(row))),zero_values:pairingZeros,one_values:pairingOnes,representative_independence_checks:representativeIndependenceChecks,representative_independence_failures:representativeIndependenceFailures}),
    laws:freeze({
      well_defined_on_central_quotient:representativeIndependenceFailures===0,
      alternating:alternatingFailures===0,
      bilinear_over_F2:firstSlotBilinearityFailures===0&&secondSlotBilinearityFailures===0,
      symmetric_in_characteristic_two:symmetryFailures===0,
      nondegenerate:radical.length===1&&radical[0]===0,
      full_central_extension_reconstruction_claimed:false,
      physical_symplectic_claimed:false,
    }),
    audits:freeze({alternating_checks:alternatingChecks,alternating_failures:alternatingFailures,first_slot_bilinearity_checks:firstSlotBilinearityChecks,first_slot_bilinearity_failures:firstSlotBilinearityFailures,second_slot_bilinearity_checks:secondSlotBilinearityChecks,second_slot_bilinearity_failures:secondSlotBilinearityFailures,symmetry_checks:symmetryChecks,symmetry_failures:symmetryFailures,radical:freeze(radical),row_one_counts:freeze(rowOneCounts),nonzero_vectors_with_nontrivial_partner:nonzeroVectorsWithPartner}),
    basis_matrix:freeze({matrix:basisMatrix,rank_F2:basisRank,det_F2:basisDet}),
    membranes:freeze([
      'COMMUTATOR_PAIRING != PHYSICAL_SYMPLECTIC_FORM',
      'FINITE_F2_GEOMETRY != CONTINUUM_PHASE_SPACE',
      'PAIRING_GEOMETRY != FULL_CENTRAL_EXTENSION_CLASS',
      'NONDEGENERATE_PAIRING != UNIQUE_D8_RECONSTRUCTION',
      'D8_AND_Q8_CAN_SHARE_THE_SAME_COMMUTATOR_PAIRING',
      'REPRESENTATIVE_INDEPENDENCE != SOURCE_INDEPENDENCE',
      'FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_COMMUTATOR_PAIRING_GEOMETRY_CERTIFICATE=atlasCommutatorPairingGeometryCertificate();
