import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';

const POINTS=['A','B','T','M','R'];
const parent=finiteTaskTopologyRigidityBirkhoffCertificate();
assert.equal(parent.passed,true);
assert.equal(parent.parent_receipt,'d76ab8a3166916ebed1d189eee01343233ee3cfd');
assert.equal(parent.rigidity.preserving_automorphism_count,1);
assert.equal(parent.rigidity.nonidentity_preserving_count,0);

const fromId=id=>new Set(POINTS.filter(point=>id!=='EMPTY'&&id.includes(point)));
const id=set=>POINTS.filter(point=>set.has(point)).join('')||'EMPTY';
const leq=(x,y)=>fromId(parent.topology.principal_closures[y]).has(x);
const opens=parent.topology.open_states.map(fromId);
const openFamily=new Set(opens.map(id));
const canonical=value=>JSON.stringify(value);
const partitionKey=groups=>groups.map(group=>[...group].sort().join('')).sort().join('|');
function partition(keyFn){
  const groups=new Map();
  for(const point of POINTS){ const key=canonical(keyFn(point)); if(!groups.has(key)) groups.set(key,[]); groups.get(key).push(point); }
  return [...groups.values()];
}

// Local role apertures independently reconstructed from parent topology.
const closureSize=Object.fromEntries(POINTS.map(point=>[point,fromId(parent.topology.principal_closures[point]).size]));
const openSize=Object.fromEntries(POINTS.map(point=>[point,fromId(parent.topology.minimal_open_neighborhoods[point]).size]));
assert.deepEqual(closureSize,{A:1,B:1,T:2,M:2,R:4});
assert.deepEqual(openSize,{A:4,B:2,T:2,M:1,R:1});
const closurePartition=partition(point=>closureSize[point]);
const openPartition=partition(point=>openSize[point]);
const jointPartition=partition(point=>[closureSize[point],openSize[point]]);
assert.equal(partitionKey(closurePartition),partitionKey([['A','B'],['T','M'],['R']]));
assert.equal(partitionKey(openPartition),partitionKey([['R','M'],['B','T'],['A']]));
assert.equal(jointPartition.length,5);

// Exhaust all 3,125 self-functions and classify by two independent criteria.
const functions=[];
function enumerate(prefix=[]){
  if(prefix.length===POINTS.length){ functions.push([...prefix]); return; }
  for(const point of POINTS){ prefix.push(point); enumerate(prefix); prefix.pop(); }
}
enumerate();
assert.equal(functions.length,3125);
const continuous=[];
let classificationAgreement=0,classificationMismatch=0;
for(const row of functions){
  const map=Object.fromEntries(POINTS.map((point,index)=>[point,row[index]]));
  let monotone=true;
  for(const x of POINTS) for(const y of POINTS) if(leq(x,y)&&!leq(map[x],map[y])) monotone=false;
  let topological=true;
  for(const open of opens){
    const pre=new Set(POINTS.filter(point=>open.has(map[point])));
    if(!openFamily.has(id(pre))) topological=false;
  }
  if(monotone===topological) classificationAgreement+=1; else classificationMismatch+=1;
  if(topological) continuous.push({row,map,imageSize:new Set(row).size,idempotent:POINTS.every((point,index)=>map[map[point]]===row[index])});
}
assert.equal(classificationAgreement,3125);
assert.equal(classificationMismatch,0);
assert.equal(continuous.length,128);
const imageSpectrum={}; const idemSpectrum={}; let idem=0;
for(const f of continuous){
  imageSpectrum[f.imageSize]=(imageSpectrum[f.imageSize]||0)+1;
  if(f.idempotent){ idem+=1; idemSpectrum[f.imageSize]=(idemSpectrum[f.imageSize]||0)+1; }
}
assert.deepEqual(imageSpectrum,{'1':5,'2':50,'3':60,'4':12,'5':1});
assert.equal(idem,61);
assert.deepEqual(idemSpectrum,{'1':5,'2':26,'3':21,'4':8,'5':1});
const bijective=continuous.filter(f=>f.imageSize===5);
assert.equal(bijective.length,1);
assert.deepEqual(bijective[0].row,POINTS);

// Build the full pointwise-comparability graph independently.
const adjacency=Array.from({length:continuous.length},()=>new Set());
const mapLeq=(f,g)=>POINTS.every(point=>leq(f.map[point],g.map[point]));
let edges=0;
for(let i=0;i<continuous.length;i+=1) for(let j=i+1;j<continuous.length;j+=1){
  if(mapLeq(continuous[i],continuous[j])||mapLeq(continuous[j],continuous[i])){ adjacency[i].add(j); adjacency[j].add(i); edges+=1; }
}
assert.equal(edges,1528);
function bfs(start){
  const d=Array(continuous.length).fill(-1); d[start]=0; const q=[start];
  for(let k=0;k<q.length;k+=1) for(const v of adjacency[q[k]]) if(d[v]<0){ d[v]=d[q[k]]+1; q.push(v); }
  return d;
}
const distSpectrum={}; let diameter=0;
for(let i=0;i<continuous.length;i+=1){
  const d=bfs(i); assert.equal(d.every(value=>value>=0),true,'hostile found disconnected map graph');
  for(let j=i+1;j<d.length;j+=1){ distSpectrum[d[j]]=(distSpectrum[d[j]]||0)+1; diameter=Math.max(diameter,d[j]); }
}
assert.equal(diameter,3);
assert.deepEqual(distSpectrum,{'1':1528,'2':5435,'3':1165});
const identityIndex=continuous.findIndex(f=>f.row.every((value,index)=>value===POINTS[index]));
const identityDistances=bfs(identityIndex);
const identitySpectrum={}; identityDistances.forEach(value=>identitySpectrum[value]=(identitySpectrum[value]||0)+1);
assert.deepEqual(identitySpectrum,{'0':1,'1':6,'2':49,'3':72});
const constDistances={};
for(const point of POINTS){ const idx=continuous.findIndex(f=>f.row.every(value=>value===point)); constDistances[point]=identityDistances[idx]; }
assert.deepEqual(constDistances,{A:2,B:3,T:3,M:3,R:2});

// Independent dynamic beat-point recursion.
function beatWitness(S,p){
  const upper=POINTS.filter(q=>S.has(q)&&q!==p&&leq(p,q));
  const lower=POINTS.filter(q=>S.has(q)&&q!==p&&leq(q,p));
  const up=upper.find(candidate=>upper.every(q=>leq(candidate,q)))||null;
  const down=lower.find(candidate=>lower.every(q=>leq(q,candidate)))||null;
  return {point:p,up,down,isBeat:Boolean(up||down)};
}
const initial=POINTS.map(point=>beatWitness(new Set(POINTS),point)).filter(w=>w.isBeat);
assert.deepEqual(new Set(initial.map(w=>w.point)),new Set(['B','T','M']));
assert.equal(initial.find(w=>w.point==='B').up,'R');
assert.equal(initial.find(w=>w.point==='T').up,'R');
assert.equal(initial.find(w=>w.point==='T').down,'A');
assert.equal(initial.find(w=>w.point==='M').down,'A');
const sequences=[]; const reachable=new Set();
function collapse(S,path=[]){
  reachable.add(id(S));
  if(S.size===1){ sequences.push({path:[...path],terminal:[...S][0]}); return; }
  for(const point of POINTS){
    if(!S.has(point)) continue;
    const witness=beatWitness(S,point);
    if(!witness.isBeat) continue;
    const next=new Set(S); next.delete(point); collapse(next,[...path,point]);
  }
}
collapse(new Set(POINTS));
assert.equal(sequences.length,36);
assert.equal(reachable.size,19);
const terminal={}; for(const row of sequences) terminal[row.terminal]=(terminal[row.terminal]||0)+1;
assert.deepEqual(terminal,{R:12,A:12,M:3,T:6,B:3});
assert.equal(new Set(sequences.map(row=>row.terminal)).size,5);
const bySize={}; for(const key of reachable){ const size=fromId(key).size; bySize[size]=(bySize[size]||0)+1; }
assert.deepEqual(bySize,{'1':5,'2':5,'3':5,'4':3,'5':1});

// Independent strict-chain complexes and F2 boundary ranks.
function chains(S,length){
  const out=[];
  function walk(prefix){
    if(prefix.length===length){ out.push([...prefix]); return; }
    for(const point of POINTS){
      if(!S.has(point)||prefix.includes(point)) continue;
      if(prefix.length&&(!leq(prefix.at(-1),point)||prefix.at(-1)===point)) continue;
      prefix.push(point); walk(prefix); prefix.pop();
    }
  }
  walk([]); return out;
}
function rankF2(matrix){
  if(!matrix.length||!matrix[0]?.length) return 0;
  const a=matrix.map(row=>row.map(v=>v&1)); let rank=0;
  for(let col=0;col<a[0].length&&rank<a.length;col+=1){
    let pivot=-1; for(let row=rank;row<a.length;row+=1) if(a[row][col]){ pivot=row; break; }
    if(pivot<0) continue;
    [a[rank],a[pivot]]=[a[pivot],a[rank]];
    for(let row=0;row<a.length;row+=1) if(row!==rank&&a[row][col]) for(let c=col;c<a[0].length;c+=1) a[row][c]^=a[rank][c];
    rank+=1;
  }
  return rank;
}
function complex(S){
  const sim={};
  for(let n=1;n<=S.size;n+=1){ const list=chains(S,n); if(list.length) sim[n-1]=list; }
  const max=Math.max(...Object.keys(sim).map(Number)); const ranks={};
  for(let dim=1;dim<=max;dim+=1){
    const low=sim[dim-1]||[],high=sim[dim]||[],index=new Map(low.map((s,i)=>[canonical(s),i]));
    const matrix=Array.from({length:low.length},()=>Array(high.length).fill(0));
    for(let col=0;col<high.length;col+=1) for(let cut=0;cut<high[col].length;cut+=1){
      const face=[...high[col].slice(0,cut),...high[col].slice(cut+1)]; matrix[index.get(canonical(face))][col]^=1;
    }
    ranks[dim]=rankF2(matrix);
  }
  const f=[],b=[];
  for(let dim=0;dim<=max;dim+=1){ const n=(sim[dim]||[]).length; f.push(n); b.push(n-(ranks[dim]||0)-(ranks[dim+1]||0)); }
  while(f.length<3) f.push(0); while(b.length<3) b.push(0);
  return {f:f.slice(0,3),betti:b.slice(0,3),chi:f.slice(0,3).reduce((sum,n,dim)=>sum+(dim%2? -n:n),0)};
}
const full=complex(new Set(POINTS));
assert.deepEqual(full,{f:[5,5,1],betti:[1,0,0],chi:1});
const deletion={};
for(const point of POINTS){ const S=new Set(POINTS); S.delete(point); deletion[point]=complex(S); }
assert.deepEqual(Object.fromEntries(POINTS.map(p=>[p,deletion[p].f])),{A:[4,2,0],B:[4,4,1],T:[4,3,0],M:[4,4,1],R:[4,2,0]});
assert.deepEqual(Object.fromEntries(POINTS.map(p=>[p,deletion[p].betti])),{A:[2,0,0],B:[1,0,0],T:[1,0,0],M:[1,0,0],R:[2,0,0]});
const fPartition=partition(point=>deletion[point].f);
const bettiPartition=partition(point=>deletion[point].betti);
const beatPartition=partition(point=>terminal[point]);
assert.equal(partitionKey(fPartition),partitionKey([['A','R'],['B','M'],['T']]));
assert.equal(partitionKey(bettiPartition),partitionKey([['A','R'],['B','T','M']]));
assert.equal(partitionKey(beatPartition),partitionKey(fPartition));
assert.deepEqual([jointPartition.length,fPartition.length,bettiPartition.length,1],[5,3,2,1]);

// Only now consult the child certificate.
const {
  finiteTaskHomotopyAmnesiaRoleTomographyCertificate,
  compileFiniteTaskHomotopyAmnesiaRoleTomographyProjection,
}=await import('../app/dome-world/previews/a15-r0/finite-task-homotopy-amnesia-role-tomography.js');
const child=finiteTaskHomotopyAmnesiaRoleTomographyCertificate();
assert.equal(child.parent_receipt,'7c4cef95d4f704f05615d663e252d5a53775bdbe');
assert.equal(child.passed,true);
assert.equal(child.endomorphism_census.continuous_endomorphisms,continuous.length);
assert.equal(child.map_comparability_graph.edges,edges);
assert.equal(child.map_comparability_graph.components,1);
assert.equal(child.beat_collapse.complete_sequences,sequences.length);
assert.deepEqual(child.aperture_ladder.role_class_counts,[5,3,2,1]);

for(const scar of [
  'TASK_TOPOLOGY_RIGIDITY != HOMOTOPY_RIGIDITY',
  'AUTOMORPHISM_RIGIDITY != HOMOTOPY_IDENTITY_RIGIDITY',
  'HOMOTOPY_EQUIVALENCE != TASK_ROLE_IDENTITY',
  'BEAT_COLLAPSE_TERMINAL_POINT != STRUCTURAL_ROLE_IDENTITY',
  'SIMPLICIAL_HOMOLOGY != INFORMATION_CONTENT',
  'ROLE_DISTINGUISHABILITY_LADDER != SHANNON_INFORMATION_LADDER',
  'FINITE_ROLE_TOMOGRAPHY != NATURAL_LANGUAGE_SEMANTIC_RECONSTRUCTION',
]) assert.equal(child.scars.includes(scar),true,`missing hostile membrane ${scar}`);

const ash=compileFiniteTaskHomotopyAmnesiaRoleTomographyProjection(AIA_RECEIVERS.ASH);
assert.equal(ash.payload.semantic_task_names_inherited,true);
assert.equal(ash.payload.natural_language_semantics_claim,false);
assert.equal(ash.payload.physical_topology_claim,false);
assert.equal(ash.authority.physical_claim,false);
assert.equal(ash.authority.continuum_claim,false);
assert.equal(ash.authority.source_state_transform,false);

console.log('Ash A15-R0 finite task homotopy-amnesia / role-tomography independent hostile passed.');
