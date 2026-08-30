import assert from 'node:assert/strict';
import { finiteTaskTopologyRigidityBirkhoffCertificate } from '../app/dome-world/previews/a15-r0/finite-task-topology-rigidity-birkhoff-dual.js';
import { finiteTopologicalDistinguishabilityMetricAmnesiaCertificate } from '../app/dome-world/previews/a15-r0/finite-topological-distinguishability-metric-amnesia.js';

const R=['A','B','T','M','R'];
const full='ABTMR';
const parent=finiteTopologicalDistinguishabilityMetricAmnesiaCertificate();
const topoParent=finiteTaskTopologyRigidityBirkhoffCertificate();
assert.equal(parent.passed,true);
assert.equal(topoParent.passed,true);
assert.equal(parent.full_metric.metric_isometry_count,4);
assert.equal(parent.full_metric.labelled_incidence_automorphism_count,1);
const D=parent.full_metric.distance_matrix;

const key=S=>R.filter(x=>S.has(x)).join('')||'EMPTY';
const from=id=>new Set(id==='EMPTY'?[]:R.filter(x=>id.includes(x)));
const comp=S=>new Set(R.filter(x=>!S.has(x)));
const uni=(A,B)=>new Set([...A,...B]);
const inter=(A,B)=>new Set([...A].filter(x=>B.has(x)));
function combos(items,k){ const out=[]; function w(i,c){ if(c.length===k){out.push([...c]);return;} for(let j=i;j<items.length;j+=1){c.push(items[j]);w(j+1,c);c.pop();}} w(0,[]); return out; }
function perms(items){ const out=[]; function w(p,r){ if(!r.length){out.push([...p]);return;} for(let i=0;i<r.length;i+=1){p.push(r[i]);w(p,[...r.slice(0,i),...r.slice(i+1)]);p.pop();}} w([],items); return out; }
const rolePerms=perms(R);
assert.equal(rolePerms.length,120);

// Rebuild all fifteen unoriented cuts independently.
const cuts=[];
for(let n=1;n<R.length;n+=1) for(const c of combos(R,n)) if(c.includes('A')) cuts.push({id:c.join(''),S:new Set(c)});
assert.equal(cuts.length,15);
const pairs=combos(R,2).map(([a,b])=>({a,b,d:D[a][b]}));
const col=cut=>pairs.map(({a,b})=>cut.S.has(a)!==cut.S.has(b)?1:0);
const cols=cuts.map(col);

// Exact raw nonnegative-integer inversion.
const solutions=[];
function integerWalk(i,res,c){
  if(i===cuts.length){ if(res.every(v=>v===0)) solutions.push(Object.fromEntries(cuts.map((cut,j)=>[cut.id,c[j]||0]))); return; }
  let max=Infinity; for(let j=0;j<res.length;j+=1) if(cols[i][j]) max=Math.min(max,res[j]); if(!Number.isFinite(max)) max=0;
  for(let v=0;v<=max;v+=1){ const next=res.map((x,j)=>x-v*cols[i][j]); if(next.some(x=>x<0)) continue; integerWalk(i+1,next,[...c,v]); }
}
integerWalk(0,pairs.map(x=>x.d),[]);
assert.equal(solutions.length,5);
const canon=o=>JSON.stringify(Object.fromEntries(Object.keys(o).sort().map(k=>[k,o[k]])));
const expectedSolutions=[
 {A:0,AB:2,AT:1,AM:2,AR:0,ABT:1,ABM:0,ABR:0,ATM:1,ATR:1,AMR:0,ABTM:1,ABTR:0,ABMR:0,ATMR:0},
 {A:0,AB:2,AT:2,AM:2,AR:0,ABT:0,ABM:0,ABR:0,ATM:0,ATR:0,AMR:0,ABTM:2,ABTR:1,ABMR:0,ATMR:1},
 {A:1,AB:1,AT:0,AM:1,AR:0,ABT:2,ABM:1,ABR:0,ATM:2,ATR:1,AMR:0,ABTM:0,ABTR:0,ABMR:0,ATMR:0},
 {A:1,AB:1,AT:1,AM:1,AR:0,ABT:1,ABM:1,ABR:0,ATM:1,ATR:0,AMR:0,ABTM:1,ABTR:1,ABMR:0,ATMR:1},
 {A:2,AB:0,AT:0,AM:0,AR:0,ABT:2,ABM:2,ABR:0,ATM:2,ATR:0,AMR:0,ABTM:0,ABTR:1,ABMR:0,ATMR:1},
];
assert.deepEqual(new Set(solutions.map(canon)),new Set(expectedSolutions.map(canon)));

// Exact distinct-unit support inversion across all 2^15 supports.
function metricFor(mask){ const M=Object.fromEntries(R.map(a=>[a,Object.fromEntries(R.map(b=>[b,0]))])); const support=[]; for(let i=0;i<cuts.length;i+=1) if(mask&(1<<i)){ support.push(cuts[i].id); for(const a of R) for(const b of R) if(cuts[i].S.has(a)!==cuts[i].S.has(b)) M[a][b]+=1; } return {M,support}; }
const sameMetric=M=>R.every(a=>R.every(b=>M[a][b]===D[a][b]));
const binary=[];
for(let mask=0;mask<2**15;mask+=1){ const row=metricFor(mask); if(sameMetric(row.M)) binary.push(row.support); }
assert.equal(binary.length,1);
assert.deepEqual(binary[0],['A','AB','AT','AM','ABT','ABM','ATM','ABTM','ABTR','ATMR']);
const supportCuts=binary[0].map(id=>cuts.find(c=>c.id===id));

// Exhaust all 1024 orientations and all 294,912 closure operations.
function opens(bits){ return [new Set(),new Set(R),...supportCuts.map((cut,i)=>bits[i]==='0'?new Set(cut.S):comp(cut.S))]; }
function audit(O){ const K=new Set(O.map(key)); let checks=0,fail=0; for(const a of O) for(const b of O){ checks+=2; if(!K.has(key(uni(a,b)))) fail+=1; if(!K.has(key(inter(a,b)))) fail+=1; } return {ok:K.size===12&&fail===0&&K.has('EMPTY')&&K.has(full),checks,fail,keys:K}; }
function relation(O){ return Object.fromEntries(R.map(x=>[x,Object.fromEntries(R.map(y=>[y,O.every(U=>!U.has(x)||U.has(y))]))])); }
function covers(rel){ const out=[]; for(const x of R) for(const y of R){ if(x===y||!rel[x][y])continue; if(!R.some(z=>z!==x&&z!==y&&rel[x][z]&&rel[z][y]))out.push(`${x}<${y}`); } return out.sort(); }
function automorphisms(O){ const K=new Set(O.map(key)),out=[]; for(const p of rolePerms){ const map=Object.fromEntries(R.map((x,i)=>[x,p[i]])); const image=new Set(O.map(U=>key(new Set([...U].map(x=>map[x]))))); if(image.size===K.size&&[...image].every(k=>K.has(k)))out.push(map); } return out; }
function props(O){ const rel=relation(O),principal={}; for(const x of R){let m=new Set(R); for(const U of O)if(U.has(x))m=inter(m,U); principal[x]=key(m);} const K=new Set(O.map(key)),clopen=[...K].filter(id=>K.has(key(comp(from(id))))); return {T0:new Set(Object.values(principal)).size===5,T1:Object.values(principal).every(id=>from(id).size===1),connected:clopen.length===2,covers:covers(rel),autos:automorphisms(O)}; }
let closureChecks=0; const compatible=[];
for(let n=0;n<1024;n+=1){ const bits=n.toString(2).padStart(10,'0'),O=opens(bits),a=audit(O); closureChecks+=a.checks; if(a.ok)compatible.push({bits,O,a,p:props(O)}); }
assert.equal(closureChecks,294912);
assert.deepEqual(compatible.map(x=>x.bits),['0000000001','0000000010','1111111101','1111111110']);
const expectedCovers={
 '0000000001':['M<A','R<B','R<T','T<A'],
 '0000000010':['B<A','R<M','R<T','T<A'],
 '1111111101':['A<B','A<T','M<R','T<R'],
 '1111111110':['A<M','A<T','B<R','T<R'],
};
for(const row of compatible){ assert.equal(row.p.T0,true); assert.equal(row.p.T1,false); assert.equal(row.p.connected,true); assert.equal(row.p.autos.length,1); assert.deepEqual(row.p.covers,expectedCovers[row.bits]); }

// Parent topology comparison uses set semantics, not inherited identifier order.
const inherited=compatible.find(x=>x.bits==='1111111110');
const inheritedParentKeys=new Set(topoParent.topology.open_states.map(id=>key(from(id))));
assert.deepEqual(new Set(inherited.O.map(key)),inheritedParentKeys);

// Rebuild full metric isometries and the action on the four-topology fibre.
function mapName(map){ if(R.every(x=>map[x]===x))return'id'; const seen=new Set(),s=[]; for(const x of R){ if(seen.has(x)||map[x]===x)continue; const y=map[x]; if(map[y]===x){s.push(`(${x} ${y})`);seen.add(x);seen.add(y);} } return s.join(''); }
const isos=[];
for(const p of rolePerms){ const map=Object.fromEntries(R.map((x,i)=>[x,p[i]])); if(R.every(a=>R.every(b=>D[a][b]===D[map[a]][map[b]])))isos.push(map); }
assert.equal(isos.length,4);
assert.deepEqual(new Set(isos.map(mapName)),new Set(['id','(B M)','(A R)','(A R)(B M)']));
const fibre=new Map(compatible.map(row=>[[...new Set(row.O.map(key))].sort().join('|'),row.bits]));
const action=[];
for(const row of compatible)for(const map of isos){ const image=new Set(row.O.map(U=>key(new Set([...U].map(x=>map[x]))))); action.push({source:row.bits,isometry:mapName(map),target:fibre.get([...image].sort().join('|'))||null}); }
assert.equal(action.length,16);
assert.equal(action.every(x=>x.target!==null),true);
const expectedAction={id:'1111111110','(B M)':'1111111101','(A R)':'0000000010','(A R)(B M)':'0000000001'};
assert.deepEqual(Object.fromEntries(action.filter(x=>x.source==='1111111110').map(x=>[x.isometry,x.target])),expectedAction);
for(const row of compatible){ const local=action.filter(x=>x.source===row.bits); assert.equal(local.filter(x=>x.target===row.bits).length,1); assert.equal(new Set(local.map(x=>x.target)).size,4); }

// Only now import and compare the child certificate.
const { finiteMetricCutSkeletonTopologicalOrientationCertificate, compileFiniteMetricCutSkeletonTopologicalOrientationProjection }=await import('../app/dome-world/previews/a15-r0/finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js');
const child=finiteMetricCutSkeletonTopologicalOrientationCertificate();
assert.equal(child.passed,true);
assert.equal(child.raw_integer_inversion.decomposition_count,5);
assert.equal(child.distinct_unit_inversion.exact_decomposition_count,1);
assert.equal(child.orientation_fibre.compatible_topology_count,4);
assert.equal(child.metric_isometry_action.metric_isometry_count,4);
assert.equal(child.metric_isometry_action.free,true);
assert.equal(child.metric_isometry_action.transitive,true);
assert.equal(child.orientation_fibre.pairwise_union_intersection_checks,294912);
for(const scar of ['RAW_METRIC_DECOMPOSITION != UNIQUE_CUT_SKELETON','TEN_DISTINCT_UNIT_PROBE_PRIOR != METRIC_ONLY_INFORMATION','CUT_SKELETON_RECOVERY != TOPOLOGY_RECOVERY','FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY']) assert.equal(child.scars.includes(scar),true);
const projection=compileFiniteMetricCutSkeletonTopologicalOrientationProjection((await import('../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js')).AIA_RECEIVERS.ASH);
assert.equal(projection.payload.metric_only_uniqueness_claim,false);
assert.equal(projection.payload.gauge_theory_claim,false);
assert.equal(projection.authority.physical_claim,false);
assert.equal(projection.authority.continuum_claim,false);

console.log('Ash A15-R0 independent hostile metric cut-skeleton / topological-orientation assay passed.');
