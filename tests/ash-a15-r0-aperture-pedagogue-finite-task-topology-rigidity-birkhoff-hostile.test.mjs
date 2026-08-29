import assert from 'node:assert/strict';
import {
  finiteCustodyTaskDependencyPosetCertificate,
} from '../app/dome-world/previews/a15-r0/finite-custody-task-dependency-poset.js';

const TASKS=['B','R','T','A','M'];
const expectedParent='d76ab8a3166916ebed1d189eee01343233ee3cfd';
const parent=finiteCustodyTaskDependencyPosetCertificate();
assert.equal(parent.passed,true);
assert.equal(parent.domain.tasks,5);
assert.equal(parent.domain.task_subsets,32);
assert.equal(parent.closed_set_lattice.closed_state_count,12);

const subsetOf=(a,b)=>[...a].every(value=>b.has(value));
const setEqual=(a,b)=>a.size===b.size&&subsetOf(a,b);
const intersection=(a,b)=>new Set([...a].filter(value=>b.has(value)));
const orderedSet=values=>new Set(TASKS.filter(task=>values.has(task)));
const setId=values=>TASKS.filter(task=>values.has(task)).join('')||'EMPTY';
const idSet=id=>new Set(id==='EMPTY'?[]:TASKS.filter(task=>id.includes(task)));
const complement=set=>new Set(TASKS.filter(task=>!set.has(task)));
const familyKey=set=>[...set].sort().join('|');
function allSubsets(items){
  const out=[];
  function walk(i,current){
    if(i===items.length){ out.push(new Set(current)); return; }
    walk(i+1,current); current.push(items[i]); walk(i+1,current); current.pop();
  }
  walk(0,[]); return out;
}
function permutations(items){
  const out=[];
  function walk(prefix,remaining){
    if(!remaining.length){ out.push([...prefix]); return; }
    for(let i=0;i<remaining.length;i+=1){
      prefix.push(remaining[i]); walk(prefix,[...remaining.slice(0,i),...remaining.slice(i+1)]); prefix.pop();
    }
  }
  walk([],items); return out;
}
function covers(sets){
  const out=[];
  for(const x of sets) for(const y of sets){
    if(setEqual(x,y)||!subsetOf(x,y)) continue;
    if(!sets.some(z=>!setEqual(z,x)&&!setEqual(z,y)&&subsetOf(x,z)&&subsetOf(z,y))) out.push([setId(x),setId(y)]);
  }
  return out;
}
function pointCovers(relation){
  const out=[];
  for(const x of TASKS) for(const y of TASKS){
    if(x===y||!relation(x,y)) continue;
    if(!TASKS.some(z=>z!==x&&z!==y&&relation(x,z)&&relation(z,y))) out.push([x,y]);
  }
  return out;
}
const pairSet=pairs=>new Set(pairs.map(pair=>pair.join('<')));

// Rebuild the topology from the earned parent subset table only.
const table=parent.subset_table;
const tableIds=Object.keys(table);
assert.equal(tableIds.length,32);
const closedIds=[...new Set(tableIds.map(id=>table[id].closure))];
const closedSets=closedIds.map(idSet);
const closedFamily=new Set(closedIds);
assert.equal(closedIds.length,12);
assert.deepEqual(closedFamily,new Set(['EMPTY','B','A','BA','TA','AM','BTA','BAM','TAM','BRTA','BTAM','BRTAM']));

const openSets=closedSets.map(set=>orderedSet(complement(set)));
const openIds=[...new Set(openSets.map(setId))];
const openFamily=new Set(openIds);
assert.equal(openIds.length,12);
const clopen=closedIds.filter(id=>openFamily.has(id));
assert.deepEqual(new Set(clopen),new Set(['EMPTY','BRTAM']));

for(const x of closedSets) for(const y of closedSets){
  assert.equal(closedFamily.has(setId(orderedSet(intersection(x,y)))),true);
  assert.equal(closedFamily.has(setId(orderedSet(new Set([...x,...y])))),true);
}
for(const x of openSets) for(const y of openSets){
  assert.equal(openFamily.has(setId(orderedSet(intersection(x,y)))),true);
  assert.equal(openFamily.has(setId(orderedSet(new Set([...x,...y])))),true);
}

const principal={};
const minimalOpen={};
const fingerprints={};
for(const task of TASKS){
  principal[task]=table[task].closure;
  const opens=openSets.filter(open=>open.has(task));
  let minimum=new Set(TASKS);
  for(const open of opens) minimum=intersection(minimum,open);
  minimalOpen[task]=setId(orderedSet(minimum));
  fingerprints[task]=[idSet(principal[task]).size,minimum.size];
}
assert.deepEqual(principal,{B:'B',R:'BRTA',T:'TA',A:'A',M:'AM'});
assert.deepEqual(minimalOpen,{B:'BR',R:'R',T:'RT',A:'RTAM',M:'M'});
assert.deepEqual(fingerprints,{B:[1,2],R:[4,1],T:[2,2],A:[1,4],M:[2,1]});
assert.equal(new Set(Object.values(fingerprints).map(pair=>pair.join(','))).size,5);
assert.equal(new Set(Object.values(principal)).size,5,'T0 must survive independent reconstruction');
assert.equal(Object.values(principal).every(id=>idSet(id).size===1),false,'the topology is not T1');
assert.equal(clopen.length,2,'only trivial clopens survive, so the finite task topology is connected');

// Rebuild the finite distributive lattice and Birkhoff dual.
const latticeCovers=covers(closedSets);
assert.equal(latticeCovers.length,18);
const lower=Object.fromEntries(closedIds.map(id=>[id,0]));
const upper=Object.fromEntries(closedIds.map(id=>[id,0]));
for(const [lo,hi] of latticeCovers){ upper[lo]+=1; lower[hi]+=1; }
const joinIrreducibles=closedIds.filter(id=>id!=='EMPTY'&&lower[id]===1);
const meetIrreducibles=closedIds.filter(id=>id!=='BRTAM'&&upper[id]===1);
assert.deepEqual(new Set(joinIrreducibles),new Set(['B','A','TA','AM','BRTA']));
assert.deepEqual(new Set(meetIrreducibles),new Set(['B','BAM','TAM','BRTA','BTAM']));
assert.deepEqual(pairSet(covers(joinIrreducibles.map(idSet))),new Set(['B<BRTA','A<TA','A<AM','TA<BRTA']));

const joinCandidates=allSubsets(joinIrreducibles);
assert.equal(joinCandidates.length,32);
const downsets=[];
for(const candidate of joinCandidates){
  let valid=true;
  for(const hi of candidate) for(const lo of joinIrreducibles){
    if(subsetOf(idSet(lo),idSet(hi))&&!candidate.has(lo)) valid=false;
  }
  if(valid) downsets.push(candidate);
}
assert.equal(downsets.length,12);
const downsetKeys=new Set(downsets.map(familyKey));
const imageKeys=new Set();
const ranks={};
for(const state of closedSets){
  const image=new Set(joinIrreducibles.filter(j=>subsetOf(idSet(j),state)));
  imageKeys.add(familyKey(image));
  ranks[image.size]=(ranks[image.size]||0)+1;
}
assert.equal(imageKeys.size,12);
assert.deepEqual(imageKeys,downsetKeys);
assert.deepEqual(ranks,{'0':1,'1':2,'2':3,'3':3,'4':2,'5':1});

// Rebuild the specialization order independently.
const leq=(x,y)=>idSet(principal[y]).has(x);
const specializationCovers=pointCovers(leq);
assert.deepEqual(pairSet(specializationCovers),new Set(['B<R','A<T','A<M','T<R']));
const maxima=TASKS.filter(x=>!TASKS.some(y=>y!==x&&leq(x,y)));
const minima=TASKS.filter(x=>!TASKS.some(y=>y!==x&&leq(y,x)));
assert.deepEqual(new Set(maxima),new Set(['R','M']));
assert.deepEqual(new Set(minima),new Set(['A','B']));
assert.deepEqual(parent.generator.minimal_full_generators,['RM']);
assert.equal(setId(new Set(maxima)),parent.generator.minimal_full_generators[0]);

// Exhaust every point relabeling. Preserve every survivor if rigidity fails.
const perms=permutations(TASKS);
assert.equal(perms.length,120);
const survivors=[];
let relationCells=0,familyImages=0;
for(const perm of perms){
  const map=Object.fromEntries(TASKS.map((task,i)=>[task,perm[i]]));
  let relationOK=true;
  for(const x of TASKS) for(const y of TASKS){
    relationCells+=1;
    if(leq(x,y)!==leq(map[x],map[y])) relationOK=false;
  }
  let familyOK=true;
  for(const state of closedSets){
    familyImages+=1;
    const image=orderedSet(new Set([...state].map(task=>map[task])));
    if(!closedFamily.has(setId(image))) familyOK=false;
  }
  if(relationOK&&familyOK) survivors.push(map);
}
assert.equal(relationCells,3000);
assert.equal(familyImages,1440);
assert.equal(survivors.length,1);
assert.deepEqual(survivors[0],{B:'B',R:'R',T:'T',A:'A',M:'M'});

// Only now consult the child certificate.
const {
  finiteTaskTopologyRigidityBirkhoffCertificate,
  compileFiniteTaskTopologyRigidityBirkhoffProjection,
}=await import('../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js');
const child=finiteTaskTopologyRigidityBirkhoffCertificate();
assert.equal(child.parent_receipt,expectedParent);
assert.equal(child.passed,true);
assert.equal(child.rigidity.preserving_automorphism_count,survivors.length);
assert.equal(child.rigidity.nonidentity_preserving_count,0);
assert.equal(child.lattice_dual.birkhoff_exact,true);
assert.deepEqual(new Set(child.specialization_order.maximal_points),new Set(maxima));
assert.equal(child.specialization_order.generator_equals_maximal_points,true);

for(const scar of [
  'FINITE_TASK_TOPOLOGY != MODEL_STATE_TOPOLOGY',
  'FINITE_TASK_TOPOLOGY != PHYSICAL_SPACE',
  'SPECIALIZATION_ORDER != SCIENTIFIC_ANCESTRY',
  'SPECIALIZATION_ORDER != CAUSAL_ORDER',
  'MAXIMAL_SPECIALIZATION_POINT != CAUSAL_ROOT',
  'TOPOLOGICAL_RIGIDITY != SEMANTIC_NAME_RECOVERY_FROM_NOTHING',
  'BIRKHOFF_REPRESENTATION != CATEGORY_OR_FUNCTOR_THEOREM',
  'AUTOMORPHISM_TRIVIALITY != UNIVERSAL_TASK_IDENTIFIABILITY',
]) assert.equal(child.scars.includes(scar),true,`missing hostile membrane ${scar}`);

const ash=compileFiniteTaskTopologyRigidityBirkhoffProjection('ASH');
assert.equal(ash.payload.semantic_task_names_inherited,true);
assert.equal(ash.payload.model_state_topology_claim,false);
assert.equal(ash.payload.physical_topology_claim,false);
assert.equal(ash.authority.physical_claim,false);
assert.equal(ash.authority.continuum_claim,false);
assert.equal(ash.authority.source_state_transform,false);

console.log('Ash A15-R0 finite task topology rigidity / Birkhoff dual independent hostile passed.');
