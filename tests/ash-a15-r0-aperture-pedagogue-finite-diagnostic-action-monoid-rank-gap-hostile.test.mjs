import assert from 'node:assert/strict';
import { finitePrimeDualFixedPointRestNormalizerCertificate } from '../app/dome-world/previews/a15-r0/finite-prime-dual-fixed-point-rest-normalizer.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTaskHomotopyAmnesiaRoleTomographyCertificate } from '../app/dome-world/previews/a15-r0/finite-task-homotopy-amnesia-role-tomography.js';

const POINTS=['A','B','T','M','R'];
const INDEX=Object.fromEntries(POINTS.map((point,index)=>[point,index]));
const IDENTITY='ABTMR';
const id=row=>row.join('');
const pointSetFromId=value=>new Set(POINTS.filter(point=>value!=='EMPTY'&&value.includes(point)));

function allFunctions(){
  const out=[]; const row=Array(5);
  const walk=index=>{
    if(index===5){ out.push([...row]); return; }
    for(const value of POINTS){ row[index]=value; walk(index+1); }
  };
  walk(0); return out;
}
const compose=(left,right)=>left.map(value=>right[INDEX[value]]);
function closure(gens,rowById){
  const seen=new Set([IDENTITY]); const queue=[IDENTITY];
  for(const row of gens){ const key=id(row); if(!seen.has(key)){ seen.add(key); queue.push(key); } }
  for(let cursor=0;cursor<queue.length;cursor+=1){
    const current=rowById.get(queue[cursor]);
    for(const generator of gens){
      const next=id(compose(current,generator));
      assert.equal(rowById.has(next),true,`hostile closure escaped monoid at ${next}`);
      if(!seen.has(next)){ seen.add(next); queue.push(next); }
    }
  }
  return seen;
}
function depth(i,j,gens,obs){
  if(obs[POINTS[i]]!==obs[POINTS[j]]) return 0;
  let frontier=[[i,j]]; const seen=new Set([`${i}:${j}`]); let d=0;
  while(frontier.length){
    d+=1; const next=[];
    for(const [left,right] of frontier){
      for(const generator of gens){
        const a=INDEX[generator[left]],b=INDEX[generator[right]];
        if(obs[POINTS[a]]!==obs[POINTS[b]]) return d;
        const key=`${a}:${b}`;
        if(!seen.has(key)){ seen.add(key); next.push([a,b]); }
      }
    }
    frontier=next;
  }
  return Infinity;
}
function separates(gens,obs){
  for(let i=0;i<5;i+=1) for(let j=i+1;j<5;j+=1) if(!Number.isFinite(depth(i,j,gens,obs))) return false;
  return true;
}

const rest=finitePrimeDualFixedPointRestNormalizerCertificate();
const topology=finiteTaskTopologyRigidityBirkhoffCertificate();
const homotopy=finiteTaskHomotopyAmnesiaRoleTomographyCertificate();
assert.equal(rest.passed,true);
assert.equal(topology.passed,true);
assert.equal(homotopy.passed,true);
assert.equal(homotopy.endomorphism_census.continuous_endomorphisms,128);

const principal=topology.topology.principal_closures;
const leq=(x,y)=>pointSetFromId(principal[y]).has(x);
const observation=Object.fromEntries(POINTS.map(point=>[point,pointSetFromId(principal[point]).size]));
assert.deepEqual(observation,{A:1,B:1,T:2,M:2,R:4});

const functions=allFunctions();
assert.equal(functions.length,3125);
let relationChecks=0;
const endos=[];
for(const row of functions){
  const map=Object.fromEntries(POINTS.map((point,index)=>[point,row[index]]));
  let monotone=true;
  for(const x of POINTS) for(const y of POINTS){ relationChecks+=1; if(leq(x,y)&&!leq(map[x],map[y])) monotone=false; }
  if(monotone) endos.push(row);
}
assert.equal(relationChecks,78125);
assert.equal(endos.length,128);
const rowById=new Map(endos.map(row=>[id(row),row]));

let compositionChecks=0;
for(const left of endos) for(const right of endos){ compositionChecks+=1; assert.equal(rowById.has(id(compose(left,right))),true); }
assert.equal(compositionChecks,16384);
assert.equal(closure(endos,rowById).size,128);

const pairDepths={}; let maxDepth=0;
for(let i=0;i<5;i+=1) for(let j=i+1;j<5;j+=1){ const d=depth(i,j,endos,observation); pairDepths[`${POINTS[i]}:${POINTS[j]}`]=d; maxDepth=Math.max(maxDepth,d); }
assert.deepEqual(pairDepths,{'A:B':1,'A:T':0,'A:M':0,'A:R':0,'B:T':0,'B:M':0,'B:R':0,'T:M':1,'T:R':0,'M:R':0});
assert.equal(maxDepth,1);

const single=endos.filter(row=>separates([row],observation)).map(id);
assert.equal(single.length,37);
assert.equal(single.includes('ATATR'),true);
assert.equal(closure([rowById.get('ATATR')],rowById).size,3);

const indispensable=[];
for(const candidate of endos){
  const candidateId=id(candidate);
  const generated=closure(endos.filter(row=>id(row)!==candidateId),rowById);
  if(!generated.has(candidateId)) indispensable.push(candidateId);
}
assert.deepEqual(indispensable,['AATMR','ABAMR','ABTAR','ABTTR','ABTRR','ABRMR','ATTMR','ARTMR','TATRT']);
const baseRows=indispensable.map(key=>rowById.get(key));
const baseClosure=closure(baseRows,rowById);
assert.equal(baseClosure.size,56);
const missing=endos.filter(row=>!baseClosure.has(id(row)));
assert.equal(missing.length,72);

let bestTen=0;
for(const row of missing) bestTen=Math.max(bestTen,closure([...baseRows,row],rowById).size);
assert.equal(bestTen,101);

const completions=[];
for(let i=0;i<missing.length;i+=1){
  for(let j=i+1;j<missing.length;j+=1){
    if(closure([...baseRows,missing[i],missing[j]],rowById).size===128) completions.push([id(missing[i]),id(missing[j])]);
  }
}
assert.equal(completions.length,16);
assert.deepEqual(completions[0],['AAATM','BTBBR']);
assert.equal(closure([...baseRows,rowById.get('AAATM'),rowById.get('BTBBR')],rowById).size,128);

const fibers={A:0,B:0,T:0,M:0,R:0};
for(const row of endos) fibers[row[INDEX.A]]+=1;
assert.deepEqual(fibers,{A:84,B:18,T:20,M:2,R:4});
const identity=rowById.get('ABTMR');
const collapse=rowById.get('AATMR');
assert.equal(identity[INDEX.A],collapse[INDEX.A]);
assert.notEqual(identity[INDEX.B],collapse[INDEX.B]);

const { finiteDiagnosticActionMonoidRankGapCertificate } = await import('../app/dome-world/previews/a15-r0/finite-diagnostic-action-monoid-rank-gap.js');
const child=finiteDiagnosticActionMonoidRankGapCertificate();
assert.equal(child.passed,true);
assert.deepEqual(child.complexity_signature,{K:5,M:128,r_sep:1,r_gen_atom:11,D_univ:1,separation_generation_rank_gap:10});
assert.deepEqual(child.generation.indispensable_generator_rows,indispensable);
assert.deepEqual(child.generation.full_two_completion_pairs,completions);
assert.deepEqual(child.state_quotient.evaluation_fiber_counts_at_A,fibers);

console.log('Ash A15-R0 finite diagnostic action monoid / separation-generation rank-gap hostile reconstruction passed.');
