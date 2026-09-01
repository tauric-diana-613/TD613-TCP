import {
  ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_SCHEMA,
  atlasWeighted2SectionMobiusReconstructionCertificate,
} from './atlas-weighted-2section-mobius-reconstruction.js';

export const ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_SCHEMA='td613.dome-world.atlas-stratified-receiver-irreducibility/v0.1';
export const ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_PARENT_RECEIPT='d96a694cafa86d439a47073a581cad1bcc71a8c2';

const SUPPORTS=Object.freeze([[0],[1],[2],[0,1],[0,2],[1,2],[0,1,2]].map(x=>Object.freeze(x)));
const PAIRS=Object.freeze([[0,1],[0,2],[1,2]].map(x=>Object.freeze(x)));
const STRATA=Object.freeze(['C','W','H']);
const RECEIVERS=Object.freeze([
  ['NONE',[]],['C',['C']],['W',['W']],['H',['H']],
  ['CW',['C','W']],['CH',['C','H']],['WH',['W','H']],['CWH',['C','W','H']],
].map(([k,v])=>Object.freeze([k,Object.freeze(v)])));
let cached=null;

function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const contains=(S,i)=>S.includes(i);
function transformMatrix(){
  const rows=[];
  for(let i=0;i<3;i++)rows.push(SUPPORTS.map(S=>contains(S,i)?1:0));
  for(const [i,j] of PAIRS)rows.push(SUPPORTS.map(S=>contains(S,i)&&contains(S,j)?1:0));
  rows.push(SUPPORTS.map(S=>S.length>=3?1:0));
  return rows;
}
function detBareiss(A){
  const M=A.map(r=>r.map(BigInt));let sign=1n,prev=1n;const n=M.length;
  for(let k=0;k<n-1;k++){
    let p=k;while(p<n&&M[p][k]===0n)p++;if(p===n)return 0;
    if(p!==k){[M[p],M[k]]=[M[k],M[p]];sign=-sign;}
    const pivot=M[k][k];
    for(let i=k+1;i<n;i++)for(let j=k+1;j<n;j++)M[i][j]=(M[i][j]*pivot-M[i][k]*M[k][j])/prev;
    for(let i=k+1;i<n;i++)M[i][k]=0n;
    prev=pivot;
  }
  return Number(sign*M[n-1][n-1]);
}
function matMul(A,B){
  return A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));
}
function identity(n){return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));}
const INVERSE=Object.freeze([
  [1,0,0,-1,-1,0,1],
  [0,1,0,-1,0,-1,1],
  [0,0,1,0,-1,-1,1],
  [0,0,0,1,0,0,-1],
  [0,0,0,0,1,0,-1],
  [0,0,0,0,0,1,-1],
  [0,0,0,0,0,0,1],
].map(r=>Object.freeze(r)));
function applyMatrix(A,v){return A.map(r=>r.reduce((s,x,i)=>s+x*v[i],0));}
function derive(bits){
  const C=Object.freeze(Array.from({length:3},(_,i)=>SUPPORTS.reduce((s,S,j)=>s+(S.includes(i)?bits[j]:0),0)));
  const W=Object.freeze(PAIRS.map(([i,j])=>SUPPORTS.reduce((s,S,k)=>s+(S.includes(i)&&S.includes(j)?bits[k]:0),0)));
  const H=Object.freeze([bits[6]]);
  return freeze({bits:Object.freeze([...bits]),C,W,H});
}
function signature(state,keep){
  const out=[];
  if(keep.includes('C'))out.push(state.C);
  if(keep.includes('W'))out.push(state.W);
  if(keep.includes('H'))out.push(state.H);
  return JSON.stringify(out);
}
function quotient(states,keep){
  const groups=new Map();
  for(const s of states){const k=signature(s,keep);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s.bits);}
  const frequency={};let max=0;
  for(const xs of groups.values()){max=Math.max(max,xs.length);frequency[xs.length]=(frequency[xs.length]||0)+1;}
  const fibers=[...groups.values()].filter(xs=>xs.length>1).map(xs=>xs.map(x=>[...x]).sort((a,b)=>a.join('').localeCompare(b.join(''))));
  return freeze({classes:groups.size,max_fiber:max,fiber_frequency:freeze(frequency),non_singleton_fibers:freeze(fibers)});
}
function stateFromBits(bits){return derive(bits);}
function receiverEqual(a,b,keep){return signature(stateFromBits(a),keep)===signature(stateFromBits(b),keep);}

export function atlasStratifiedReceiverIrreducibilityCertificate(){
  if(cached)return cached;
  const parent=atlasWeighted2SectionMobiusReconstructionCertificate();
  const parentExact=parent.passed===true&&ATLAS_WEIGHTED_2SECTION_MOBIUS_RECONSTRUCTION_SCHEMA==='td613.dome-world.atlas-weighted-2section-mobius-reconstruction/v0.1';

  const M=transformMatrix(),det=detBareiss(M),I=identity(7);
  const left=matMul(INVERSE,M),right=matMul(M,INVERSE);
  const matrixExact=det===1&&same(left,I)&&same(right,I);

  const states=[];let inverse_failures=0;
  for(let mask=0;mask<128;mask++){
    const bits=Array.from({length:7},(_,i)=>(mask>>i)&1),s=derive(bits);states.push(s);
    const y=[...s.C,...s.W,...s.H],back=applyMatrix(INVERSE,y);
    if(!same(back,bits))inverse_failures++;
  }

  const receiver_census={};
  for(const [name,keep] of RECEIVERS){const q=quotient(states,keep);receiver_census[name]=freeze({classes:q.classes,max_fiber:q.max_fiber,fiber_frequency:q.fiber_frequency});}

  const capA=[0,0,0,0,0,0,0],capB=[1,0,0,0,0,0,0];
  const pairA=[0,0,1,1,0,0,0],pairB=[0,1,0,0,1,0,0];
  const highA=[0,0,0,1,1,1,0],highB=[1,1,1,0,0,0,1];
  const cw=quotient(states,['C','W']);
  const uniqueCW=cw.non_singleton_fibers.length===1?cw.non_singleton_fibers[0]:[];
  const expectedUnique=[highA,highB].map(x=>[...x]).sort((a,b)=>a.join('').localeCompare(b.join('')));
  const omission=freeze({
    capacity_removed_collision:receiverEqual(capA,capB,['W','H'])&&!same(capA,capB),
    pair_weight_removed_collision:receiverEqual(pairA,pairB,['C','H'])&&!same(pairA,pairB),
    high_support_removed_collision:receiverEqual(highA,highB,['C','W'])&&!same(highA,highB),
    cw_unique_non_singleton_fiber_count:cw.non_singleton_fibers.length,
    cw_unique_collision_exact:same(uniqueCW,expectedUnique),
  });

  const expected=freeze({
    NONE:{classes:1,max_fiber:128,fiber_frequency:{128:1}},
    C:{classes:59,max_fiber:8,fiber_frequency:{1:32,2:12,4:6,5:8,8:1}},
    W:{classes:15,max_fiber:16,fiber_frequency:{8:14,16:1}},
    H:{classes:2,max_fiber:64,fiber_frequency:{64:2}},
    CW:{classes:127,max_fiber:2,fiber_frequency:{1:126,2:1}},
    CH:{classes:80,max_fiber:4,fiber_frequency:{1:52,2:12,3:12,4:4}},
    WH:{classes:16,max_fiber:8,fiber_frequency:{8:16}},
    CWH:{classes:128,max_fiber:1,fiber_frequency:{1:128}},
  });
  const exact=parentExact&&matrixExact&&inverse_failures===0&&states.length===128&&same(receiver_census,expected)&&same(omission,{capacity_removed_collision:true,pair_weight_removed_collision:true,high_support_removed_collision:true,cw_unique_non_singleton_fiber_count:1,cw_unique_collision_exact:true});

  cached=freeze({
    schema:ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_SCHEMA,
    parent_receipt:ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_PARENT_RECEIPT,
    parent_exact:parentExact,
    support_order:SUPPORTS,
    transform_matrix:freeze(M.map(r=>freeze(r))),
    inverse_matrix:INVERSE,
    determinant:det,
    left_inverse_exact:same(left,I),
    right_inverse_exact:same(right,I),
    boolean_state_count:states.length,
    inverse_failures,
    receiver_census:freeze(receiver_census),
    omission_controls:omission,
    laws:freeze({
      full_receiver_unimodular:matrixExact,
      full_receiver_injective_on_boolean_cube:receiver_census.CWH.classes===128,
      each_single_stratum_deletion_noninjective:receiver_census.CW.classes<128&&receiver_census.CH.classes<128&&receiver_census.WH.classes<128,
      each_stratum_indispensable_for_universal_exact_reconstruction:omission.capacity_removed_collision&&omission.pair_weight_removed_collision&&omission.high_support_removed_collision,
      bitwise_minimal_encoding_claimed:false,
      shannon_lower_bound_claimed:false,
      universal_optimal_compression_claimed:false,
      physical_sensor_necessity_claimed:false,
    }),
    membranes:freeze([
      'STRATUM_INDISPENSABILITY != BITWISE_MINIMAL_ENCODING',
      'UNIMODULAR_THREE_BLOCK_TRANSFORM != UNIVERSAL_OPTIMAL_COMPRESSION',
      'FINITE_BOOLEAN_CUBE_CENSUS != SHANNON_LOWER_BOUND',
      'COORDINATE_NECESSITY != PHYSICAL_SENSOR_NECESSITY',
      'SUPPORT_RECONSTRUCTION != HISTORICAL_SOURCE_IDENTITY',
      'MOBIUS_INVERSION != CAUSAL_INVERSION',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_CERTIFICATE=atlasStratifiedReceiverIrreducibilityCertificate();
