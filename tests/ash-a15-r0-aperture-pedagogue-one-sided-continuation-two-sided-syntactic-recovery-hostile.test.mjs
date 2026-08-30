import assert from 'node:assert/strict';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';

const POINTS=['A','B','T','M','R'];
const INDEX=Object.fromEntries(POINTS.map((point,index)=>[point,index]));
const READOUT={A:1,B:1,T:2,M:2,R:4};
const topology=finiteTaskTopologyRigidityBirkhoffCertificate();
assert.equal(topology.passed,true);

const principal=topology.topology.principal_closures;
const leq=(x,y)=>(principal[y]||'').includes(x);
const id=row=>row.join('');

function enumerateAllMaps(){
  const out=[];
  const row=Array(5);
  function visit(k){
    if(k===5){ out.push([...row]); return; }
    for(const point of POINTS){ row[k]=point; visit(k+1); }
  }
  visit(0);
  return out;
}

const allMaps=enumerateAllMaps();
assert.equal(allMaps.length,3125);
let orderChecks=0;
const actions=[];
for(const row of allMaps){
  let ok=true;
  for(const x of POINTS){
    for(const y of POINTS){
      orderChecks+=1;
      if(leq(x,y)&&!leq(row[INDEX[x]],row[INDEX[y]])) ok=false;
    }
  }
  if(ok) actions.push(row);
}
assert.equal(orderChecks,78125);
assert.equal(actions.length,128);
const actionIds=new Set(actions.map(id));
const byId=new Map(actions.map(row=>[id(row),row]));

let compositionChecks=0;
for(const first of actions){
  for(const second of actions){
    compositionChecks+=1;
    const composite=POINTS.map((_,i)=>second[INDEX[first[i]]]);
    assert.equal(actionIds.has(id(composite)),true,'hostile: declared action set must be composition closed');
  }
}
assert.equal(compositionChecks,16384);

const expectedFibers={
  A:{A:84,B:18,T:20,M:2,R:4},
  B:{A:44,B:23,T:31,M:9,R:21},
  T:{A:36,B:10,T:36,M:10,R:36},
  M:{A:21,B:9,T:31,M:23,R:44},
  R:{A:4,B:2,T:20,M:18,R:84},
};
const expectedAlias={A:3836,B:1910,T:1980,M:1910,R:3836};
const expectedSeparated={A:4292,B:6218,T:6148,M:6218,R:4292};

let stateIndexedPairs=0;
let futureReadoutChecks=0;
let aliasFutureChecks=0;
let aliasFutureMismatches=0;
let endpointKernelMismatches=0;
const hostileFibers={};
const hostileAlias={};
const hostileSeparated={};

for(const q of POINTS){
  const coord=INDEX[q];
  const fibers=Object.fromEntries(POINTS.map(point=>[point,0]));
  for(const action of actions) fibers[action[coord]]+=1;
  hostileFibers[q]=fibers;
  let aliases=0,separated=0;
  for(let i=0;i<actions.length;i+=1){
    for(let j=i+1;j<actions.length;j+=1){
      stateIndexedPairs+=1;
      const y1=actions[i][coord],y2=actions[j][coord];
      const sameEndpoint=y1===y2;
      if(sameEndpoint) aliases+=1; else separated+=1;
      let continuationEquivalent=true;
      for(const continuation of actions){
        futureReadoutChecks+=1;
        const r1=READOUT[continuation[INDEX[y1]]];
        const r2=READOUT[continuation[INDEX[y2]]];
        if(sameEndpoint) aliasFutureChecks+=1;
        if(r1!==r2){
          continuationEquivalent=false;
          if(sameEndpoint) aliasFutureMismatches+=1;
        }
      }
      if(continuationEquivalent!==sameEndpoint) endpointKernelMismatches+=1;
    }
  }
  hostileAlias[q]=aliases;
  hostileSeparated[q]=separated;
  assert.deepEqual(fibers,expectedFibers[q]);
  assert.equal(aliases,expectedAlias[q]);
  assert.equal(separated,expectedSeparated[q]);
}

assert.equal(stateIndexedPairs,40640);
assert.equal(futureReadoutChecks,5201920);
assert.equal(aliasFutureChecks,1724416);
assert.equal(aliasFutureMismatches,0);
assert.equal(endpointKernelMismatches,0);
assert.equal(Object.values(hostileAlias).reduce((a,b)=>a+b,0),13472);
assert.equal(Object.values(hostileSeparated).reduce((a,b)=>a+b,0),27168);

// Hostile against the shortcut "same immediate Moore output = residual equivalence".
function findSeparator(leftState,rightState){
  return actions.find(action=>READOUT[action[INDEX[leftState]]]!==READOUT[action[INDEX[rightState]]]);
}
assert.equal(READOUT.A,READOUT.B);
assert.equal(READOUT.T,READOUT.M);
assert.ok(findSeparator('A','B'),'hostile: A/B share immediate output but must remain continuation-distinguishable');
assert.ok(findSeparator('T','M'),'hostile: T/M share immediate output but must remain continuation-distinguishable');

// Independently construct one access action from A to each state.
const access={};
let accessChecks=0;
for(const target of POINTS){
  let chosen=null;
  for(const action of actions){
    accessChecks+=1;
    if(chosen===null&&action[INDEX.A]===target) chosen=action;
  }
  assert.ok(chosen,`hostile: missing access action from A to ${target}`);
  access[target]=chosen;
}
assert.equal(accessChecks,640);

// Independently construct one suffix separator for each state pair.
const suffix={};
let suffixChecks=0;
for(let i=0;i<POINTS.length;i+=1){
  for(let j=i+1;j<POINTS.length;j+=1){
    const left=POINTS[i],right=POINTS[j];
    let chosen=null;
    for(const action of actions){
      suffixChecks+=1;
      if(chosen===null&&READOUT[action[INDEX[left]]]!==READOUT[action[INDEX[right]]]) chosen=action;
    }
    assert.ok(chosen,`hostile: missing suffix separator ${left}/${right}`);
    suffix[`${left}|${right}`]=chosen;
  }
}
assert.equal(suffixChecks,1280);
const statePairKey=(a,b)=>INDEX[a]<INDEX[b]?`${a}|${b}`:`${b}|${a}`;

let pairCount=0;
let coordinateChecks=0;
let contextWitnesses=0;
let contextFailures=0;
let rightAliasesAtA=0;
for(let i=0;i<actions.length;i+=1){
  for(let j=i+1;j<actions.length;j+=1){
    pairCount+=1;
    const f=actions[i],g=actions[j];
    if(f[INDEX.A]===g[INDEX.A]) rightAliasesAtA+=1;
    let q=null;
    for(const point of POINTS){
      coordinateChecks+=1;
      if(q===null&&f[INDEX[point]]!==g[INDEX[point]]) q=point;
    }
    assert.ok(q,'hostile: distinct action pair cannot agree on all five coordinates');
    const x=access[q];
    assert.equal(x[INDEX.A],q);
    const y1=f[INDEX[q]],y2=g[INDEX[q]];
    assert.notEqual(y1,y2);
    const z=suffix[statePairKey(y1,y2)];
    contextWitnesses+=1;
    if(READOUT[z[INDEX[y1]]]===READOUT[z[INDEX[y2]]]) contextFailures+=1;
  }
}
assert.equal(pairCount,8128);
assert.equal(coordinateChecks,40640);
assert.equal(contextWitnesses,8128);
assert.equal(contextFailures,0);
assert.equal(rightAliasesAtA,3836);

// Concrete strict witness: right-context alias at A, two-sided separation through B.
const identity=byId.get('ABTMR');
const collapseB=byId.get('AATMR');
assert.ok(identity&&collapseB);
assert.equal(identity[INDEX.A],collapseB[INDEX.A]);
for(const continuation of actions){
  assert.equal(
    READOUT[continuation[INDEX[identity[INDEX.A]]]],
    READOUT[continuation[INDEX[collapseB[INDEX.A]]]],
    'hostile: the strict pair must remain aliased under every right continuation from A',
  );
}
assert.notEqual(identity[INDEX.B],collapseB[INDEX.B]);
const bx=access.B;
const bz=suffix[statePairKey(identity[INDEX.B],collapseB[INDEX.B])];
assert.equal(bx[INDEX.A],'B');
assert.notEqual(READOUT[bz[INDEX[identity[INDEX.B]]]],READOUT[bz[INDEX[collapseB[INDEX.B]]]]);

// Only after the independent reconstruction, import the child certificate.
const child=await import('../app/dome-world/previews/a15-r0/one-sided-continuation-two-sided-syntactic-recovery.js');
const cert=child.oneSidedContinuationTwoSidedSyntacticRecoveryCertificate();
assert.equal(child.ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_PARENT_RECEIPT,'fa1c369abe3e628a92405aef03aeb6f9e2f76087');
assert.equal(cert.passed,true);
assert.deepEqual(cert.right_context.endpoint_fibers,hostileFibers);
assert.deepEqual(cert.right_context.endpoint_alias_pairs,{...hostileAlias,total:13472});
assert.deepEqual(cert.right_context.endpoint_separated_pairs,{...hostileSeparated,total:27168});
assert.equal(cert.right_context.readout_comparisons,futureReadoutChecks);
assert.equal(cert.right_context.alias_readout_comparisons,aliasFutureChecks);
assert.equal(cert.right_context.endpoint_kernel_mismatches,endpointKernelMismatches);
assert.equal(cert.two_sided_context.witness_checks,contextWitnesses);
assert.equal(cert.two_sided_context.witness_failures,contextFailures);
assert.equal(cert.two_sided_context.baseline_right_alias_pairs,rightAliasesAtA);
assert.equal(cert.two_sided_context.right_context_classes_at_A,5);
assert.equal(cert.two_sided_context.syntactic_action_classes,128);

console.log('Ash A15-R0 one-sided continuation / two-sided syntactic recovery independent hostile passed.');
