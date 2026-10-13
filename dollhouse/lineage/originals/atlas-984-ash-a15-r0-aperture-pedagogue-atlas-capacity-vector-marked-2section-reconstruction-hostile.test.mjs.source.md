import assert from 'node:assert/strict';

const G=[0,1,2,3,4,5,6];
function comb(xs,k){const out=[];function rec(s,p){if(p.length===k){out.push([...p]);return;}for(let i=s;i<xs.length;i++)rec(i+1,[...p,xs[i]]);}rec(0,[]);return out;}
const BLOCKS=[2,3,4].flatMap(k=>comb(G,k));
const inter=(a,b)=>a.reduce((n,x)=>n+(b.includes(x)?1:0),0);
const sk=s=>`${s.length}:${s.join(',')}`;
const canon=xs=>[...xs].map(s=>[...s].sort((a,b)=>a-b)).sort((a,b)=>sk(a).localeCompare(sk(b)));
function raw(H){const u=[...new Set(H.flat())].sort((a,b)=>a-b);return canon(u.map(e=>H.map((b,i)=>b.includes(e)?i:null).filter(i=>i!==null)));}
function lin(H){let checks=0,fail=0;for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){checks++;if(inter(H[i],H[j])>1)fail++;}return {checks,fail};}
function ek(a,b){return `${Math.min(a,b)},${Math.max(a,b)}`;}
function encode(H){const R=raw(H),edges=[];for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(inter(H[i],H[j]))edges.push([i,j]);return {capacities:H.map(b=>b.length),edges,marks:canon(R.filter(s=>s.length>=3))};}
function decode(R){const covered=new Set(),out=[];for(const m of R.marks){out.push([...m]);for(let a=0;a<m.length;a++)for(let b=a+1;b<m.length;b++)covered.add(ek(m[a],m[b]));}const residual=[];for(const e of R.edges)if(!covered.has(ek(e[0],e[1]))){residual.push(e);out.push([...e]);}for(let i=0;i<R.capacities.length;i++){const shared=R.marks.filter(m=>m.includes(i)).length+residual.filter(e=>e.includes(i)).length;const p=R.capacities[i]-shared;assert.ok(p>=0);for(let n=0;n<p;n++)out.push([i]);}return canon(out);}

let ambient=0,pairChecks=0,admitted=0,totalBlocks=0,membership=0,entries=0,edges=0,marks=0,nonuniform=0,marked=0,nonuniformMarked=0,success=0;const by={},mp={};
for(let r=1;r<=3;r++)for(const H of comb(BLOCKS,r)){
  ambient++;const L=lin(H);pairChecks+=L.checks;if(L.fail)continue;admitted++;by[r]=(by[r]||0)+1;totalBlocks+=r;membership+=7*r;
  const R=raw(H),E=encode(H),D=decode(E);entries+=R.length;edges+=E.edges.length;marks+=E.marks.length;mp[E.marks.length]=(mp[E.marks.length]||0)+1;
  const nu=new Set(H.map(b=>b.length)).size>1;if(nu)nonuniform++;if(E.marks.length){marked++;if(nu)nonuniformMarked++;}
  if(JSON.stringify(R)===JSON.stringify(D))success++;
}
const hostileCensus={ambient_candidate_families:ambient,pair_linearity_candidate_checks:pairChecks,admitted_families:admitted,admitted_by_block_count:by,total_admitted_block_occurrences:totalBlocks,raw_membership_evaluations:membership,incidence_neighborhood_entries:entries,total_overlap_edges:edges,total_concurrency_marks:marks,mark_count_profile:mp,nonuniform_admitted_families:nonuniform,marked_admitted_families:marked,nonuniform_marked_families:nonuniformMarked,roundtrip_successes:success,roundtrip_failures:admitted-success};
assert.deepEqual(hostileCensus,{ambient_candidate_families:125671,pair_linearity_candidate_checks:368550,admitted_families:27426,admitted_by_block_count:{1:91,2:2275,3:25060},total_admitted_block_occurrences:79821,raw_membership_evaluations:558747,incidence_neighborhood_entries:161287,total_overlap_edges:57820,total_concurrency_marks:2345,mark_count_profile:{0:25081,1:2345},nonuniform_admitted_families:23765,marked_admitted_families:2345,nonuniform_marked_families:2100,roundtrip_successes:27426,roundtrip_failures:0});

const A=[[0,1],[0,2,3,4],[2,5,6]],B=[[0,1,3,4],[0,2],[2,5,6]],EA=encode(A),EB=encode(B);
assert.deepEqual(EA.edges,[[0,1],[1,2]]);assert.deepEqual(EB.edges,[[0,1],[1,2]]);assert.deepEqual([...EA.capacities].sort((a,b)=>a-b),[2,3,4]);assert.deepEqual([...EB.capacities].sort((a,b)=>a-b),[2,3,4]);
function perms(xs){const out=[];function rec(p,r){if(!r.length){out.push([...p]);return;}for(let i=0;i<r.length;i++)rec([...p,r[i]],[...r.slice(0,i),...r.slice(i+1)]);}rec([],xs);return out;}
let graphIso=0,capIso=0;const setB=new Set(EB.edges.map(e=>ek(...e)));for(const p of perms([0,1,2])){let ok=true;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){const x=EA.edges.some(e=>ek(...e)===ek(i,j)),y=setB.has(ek(p[i],p[j]));if(x!==y)ok=false;}if(ok){graphIso++;if(EA.capacities.every((c,i)=>c===EB.capacities[p[i]]))capIso++;}}
assert.equal(graphIso,2);assert.equal(capIso,0);assert.notDeepEqual(raw(A),raw(B));assert.deepEqual(decode(EA),raw(A));assert.deepEqual(decode(EB),raw(B));

const {atlasCapacityVectorMarked2SectionReconstructionCertificate}=await import('../app/dome-world/previews/a15-r0/atlas-capacity-vector-marked-2section-reconstruction.js');
const child=atlasCapacityVectorMarked2SectionReconstructionCertificate();
assert.deepEqual(child.census,hostileCensus);assert.equal(child.capacity_label_control.graph_isomorphisms,2);assert.equal(child.capacity_label_control.capacity_preserving_graph_isomorphisms,0);assert.equal(child.passed,true);

console.log('Ash A15-R0 Atlas capacity-vector marked 2-section reconstruction hostile tests passed.');
