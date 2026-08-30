import assert from 'node:assert/strict';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';

const POINTS=['A','B','T','M','R'];
const INDEX=Object.fromEntries(POINTS.map((point,index)=>[point,index]));
const expected={
  EMPTY:[1,128],A:[5,84],B:[5,44],T:[5,36],M:[5,44],R:[5,84],AB:[19,32],AT:[10,36],AM:[10,21],AR:[10,48],BT:[19,16],BM:[24,14],BR:[10,21],TM:[19,16],TR:[10,36],MR:[19,32],ABT:[37,16],ABM:[42,8],ABR:[26,12],ATM:[26,9],ATR:[16,16],AMR:[26,12],BTM:[72,4],BTR:[26,9],BMR:[42,8],TMR:[37,16],ABTM:[98,4],ABTR:[46,4],ABMR:[64,3],ATMR:[46,4],BTMR:[98,4],ABTMR:[128,1],
};
const pointSetFromId=id=>new Set(POINTS.filter(point=>id!=='EMPTY'&&id.includes(point)));
const subsetFromMask=mask=>POINTS.filter((_,index)=>mask&(1<<index));
const subsetId=subset=>subset.join('')||'EMPTY';

function allFunctions(){
  const rows=[]; const row=Array(5);
  function walk(i){ if(i===5){rows.push([...row]);return;} for(const p of POINTS){row[i]=p;walk(i+1);} }
  walk(0); return rows;
}
function buildPartition(rows,subset){
  const groups=new Map();
  for(let i=0;i<rows.length;i+=1){
    const key=subset.map(p=>rows[i][INDEX[p]]).join('|');
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(i);
  }
  const blocks=[...groups.values()].sort((a,b)=>a[0]-b[0]);
  const label=Array(rows.length).fill(-1);
  blocks.forEach((block,k)=>block.forEach(i=>label[i]=k));
  const spectrum={}; for(const block of blocks) spectrum[block.length]=(spectrum[block.length]||0)+1;
  return {subset,blocks,label,classCount:blocks.length,maxFiber:Math.max(...blocks.map(b=>b.length)),spectrum};
}
const key=p=>p.blocks.map(block=>block.join(',')).join('|');
function refines(fine,coarse){
  return fine.blocks.every(block=>block.every(i=>coarse.label[i]===coarse.label[block[0]]));
}
function meet(left,right){
  const groups=new Map();
  for(let i=0;i<left.label.length;i+=1){
    const k=`${left.label[i]}:${right.label[i]}`;
    if(!groups.has(k)) groups.set(k,[]);
    groups.get(k).push(i);
  }
  return {blocks:[...groups.values()].sort((a,b)=>a[0]-b[0])};
}
function join(left,right){
  const n=left.label.length;
  const parent=Array.from({length:n},(_,i)=>i);
  const find=x=>{ while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];} return x; };
  const union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};
  for(const partition of [left,right]) for(const block of partition.blocks) for(let i=1;i<block.length;i+=1) union(block[0],block[i]);
  const groups=new Map();
  for(let i=0;i<n;i+=1){const r=find(i);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(i);}
  return {blocks:[...groups.values()].sort((a,b)=>a[0]-b[0])};
}
function closure(rows,partition){
  return POINTS.filter(point=>partition.blocks.every(block=>{
    const v=rows[block[0]][INDEX[point]];
    return block.every(i=>rows[i][INDEX[point]]===v);
  }));
}
function deletionAudit(partition){
  const ambiguous=partition.blocks.filter(block=>block.length>1);
  return {
    classes:partition.classCount,maxFiber:partition.maxFiber,spectrum:partition.spectrum,
    ambiguousClasses:ambiguous.length,ambiguousActions:ambiguous.reduce((s,b)=>s+b.length,0),
    collidingPairs:ambiguous.reduce((s,b)=>s+b.length*(b.length-1)/2,0),
  };
}

const topology=finiteTaskTopologyRigidityBirkhoffCertificate();
assert.equal(topology.passed,true);
const principal=topology.topology.principal_closures;
const leq=(x,y)=>pointSetFromId(principal[y]||'EMPTY').has(x);
const functions=allFunctions();
assert.equal(functions.length,3125);
let relationChecks=0;
const actions=[];
for(const row of functions){
  let ok=true;
  for(const x of POINTS) for(const y of POINTS){
    relationChecks+=1;
    if(leq(x,y)&&!leq(row[INDEX[x]],row[INDEX[y]])) ok=false;
  }
  if(ok) actions.push(row);
}
assert.equal(relationChecks,78125);
assert.equal(actions.length,128);

const partitions={};
for(let mask=0;mask<32;mask+=1){
  const subset=subsetFromMask(mask);
  partitions[subsetId(subset)]=buildPartition(actions,subset);
}
assert.equal(Object.keys(partitions).length,32);
assert.equal(new Set(Object.values(partitions).map(key)).size,32);
for(const [id,[classes,maxFiber]] of Object.entries(expected)){
  assert.equal(partitions[id].classCount,classes,`${id} class count`);
  assert.equal(partitions[id].maxFiber,maxFiber,`${id} max fiber`);
  assert.deepEqual(closure(actions,partitions[id]),partitions[id].subset,`${id} closure identity`);
}

let hasse=0,strict=0;
for(let mask=0;mask<32;mask+=1){
  const source=partitions[subsetId(subsetFromMask(mask))];
  for(let bit=0;bit<5;bit+=1){
    if(mask&(1<<bit)) continue;
    hasse+=1;
    const target=partitions[subsetId(subsetFromMask(mask|(1<<bit)))];
    if(refines(target,source)&&key(target)!==key(source)) strict+=1;
  }
}
assert.equal(hasse,80);
assert.equal(strict,80);

let pairs=0,orderPass=0,meetPass=0,joinPass=0;
for(let s=0;s<32;s+=1){
  for(let t=0;t<32;t+=1){
    pairs+=1;
    const ps=partitions[subsetId(subsetFromMask(s))];
    const pt=partitions[subsetId(subsetFromMask(t))];
    const expectedRefinement=(s&t)===t;
    if(refines(ps,pt)===expectedRefinement) orderPass+=1;
    const pu=partitions[subsetId(subsetFromMask(s|t))];
    const pi=partitions[subsetId(subsetFromMask(s&t))];
    if(key(meet(ps,pt))===key(pu)) meetPass+=1;
    if(key(join(ps,pt))===key(pi)) joinPass+=1;
  }
}
assert.equal(pairs,1024);
assert.equal(orderPass,1024);
assert.equal(meetPass,1024);
assert.equal(joinPass,1024);

const injective=Object.values(partitions).filter(p=>p.classCount===128);
assert.equal(injective.length,1);
assert.deepEqual(injective[0].subset,POINTS);
assert.equal(Object.values(partitions).filter(p=>p.subset.length<5&&p.classCount===128).length,0);

assert.deepEqual(deletionAudit(partitions.BTMR),{classes:98,maxFiber:4,spectrum:{1:76,2:18,4:4},ambiguousClasses:22,ambiguousActions:52,collidingPairs:42});
assert.deepEqual(deletionAudit(partitions.ATMR),{classes:46,maxFiber:4,spectrum:{1:6,2:19,4:21},ambiguousClasses:40,ambiguousActions:122,collidingPairs:145});
assert.deepEqual(deletionAudit(partitions.ABMR),{classes:64,maxFiber:3,spectrum:{1:16,2:32,3:16},ambiguousClasses:48,ambiguousActions:112,collidingPairs:80});
assert.deepEqual(deletionAudit(partitions.ABTR),{classes:46,maxFiber:4,spectrum:{1:6,2:19,4:21},ambiguousClasses:40,ambiguousActions:122,collidingPairs:145});
assert.deepEqual(deletionAudit(partitions.ABTM),{classes:98,maxFiber:4,spectrum:{1:76,2:18,4:4},ambiguousClasses:22,ambiguousActions:52,collidingPairs:42});

// Only after the independent finite derivation is complete may the child be consulted.
const childModule=await import('../app/dome-world/previews/a15-r0/finite-action-evaluation-boolean-fiber-descent.js');
const child=childModule.finiteActionEvaluationBooleanFiberDescentCertificate();
assert.equal(child.passed,true);
assert.equal(child.evaluation_fibers.distinct_partition_count,32);
assert.equal(child.calibration_closure.identity_closure_count,32);
assert.equal(child.boolean_lattice.strict_hasse_refinements,80);
assert.equal(child.boolean_lattice.meet_identity_passes,1024);
assert.equal(child.boolean_lattice.join_identity_passes,1024);
assert.equal(child.action_tomography.action_evaluation_rank,5);
assert.deepEqual(child.action_tomography.tri_rank_signature,[1,5,11]);

console.log('Ash A15-R0 finite action-evaluation Boolean fiber descent independent hostile passed.');
