import assert from 'node:assert/strict';

const E=[0,1,2,3,4,5,6,7],ALL=255;
const TAIL=[7,25,42,196],CYCLE=[7,25,98,168];
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const subseteq=(a,b)=>(a&~b)===0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function rankTable(Hs){ const H=new Set(Hs); return Array.from({length:256},(_,m)=>{ const k=popcount(m); if(k<3)return k; if(k===3&&H.has(m))return 2; return 3; }); }
function audit(rank){ let bounds=0,bf=0,mc=0,mp=0,mf=0,sp=0,sf=0; for(let m=0;m<256;m++){bounds++;if(rank[m]<0||rank[m]>Math.min(3,popcount(m)))bf++;} for(let a=0;a<256;a++)for(let b=0;b<256;b++){mc++;if(subseteq(a,b)){mp++;if(rank[a]>rank[b])mf++;}sp++;if(rank[a]+rank[b]<rank[a|b]+rank[a&b])sf++;} return {rank_bound_checks:bounds,rank_bound_failures:bf,monotonicity_candidate_pairs:mc,monotonicity_inclusion_premises:mp,monotonicity_failures:mf,submodularity_pairs:sp,submodularity_failures:sf}; }
function circuits(rank){const out=[];for(let m=1;m<256;m++){if(rank[m]===popcount(m))continue;let min=true;for(const e of E)if((m>>e)&1){const s=m&~(1<<e);if(rank[s]<popcount(s))min=false;}if(min)out.push(m);}return out;}
function hyperplanes(rank){const out=[];for(let m=0;m<256;m++){if(rank[m]!==2)continue;let max=true;for(const e of E)if(((m>>e)&1)===0&&rank[m|(1<<e)]===2)max=false;if(max)out.push(m);}return out;}
function ch(rank){const C=new Set(circuits(rank));return hyperplanes(rank).filter(m=>C.has(m)).sort((a,b)=>a-b);}
function add(map,a,b,c=1){const k=`${a},${b}`;map[k]=(map[k]||0)+c;if(map[k]===0)delete map[k];}
function R(rank){const out={};for(let m=0;m<256;m++)add(out,rank[ALL]-rank[m],popcount(m)-rank[m]);return Object.fromEntries(Object.entries(out).sort());}
function choose(n,k){if(k<0||k>n)return 0;if(k===0||k===n)return 1;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v;}
function T(r){const out={};for(const [key,c]of Object.entries(r)){const[a,b]=key.split(',').map(Number);for(let i=0;i<=a;i++)for(let j=0;j<=b;j++)add(out,i,j,c*choose(a,i)*choose(b,j)*((-1)**((a-i)+(b-j))));}return Object.fromEntries(Object.entries(out).sort());}
function degrees(Hs){return E.map(e=>Hs.reduce((s,h)=>s+(((h>>e)&1)?1:0),0));}
function sorted(xs){return [...xs].sort((a,b)=>b-a);}
function graph(Hs){const d=Array(4).fill(0);let edges=0;for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if((Hs[i]&Hs[j])!==0){edges++;d[i]++;d[j]++;}return{edge_count:edges,degree_profile:sorted(d),max_degree:Math.max(...d)};}
function perms(xs){const out=[];function rec(p,r){if(!r.length){out.push([...p]);return;}for(let i=0;i<r.length;i++)rec([...p,r[i]],[...r.slice(0,i),...r.slice(i+1)]);}rec([],xs);return out;}
function pmask(mask,p){let out=0;for(const e of E)if((mask>>e)&1)out|=1<<p[e];return out;}
function search(left,right){const target=new Set(right);let checks=0,matches=0;for(const p of perms(E)){let ok=true;for(const h of left){checks++;if(!target.has(pmask(h,p)))ok=false;}if(ok)matches++;}return{relabelings:40320,checks,matches};}

const tailRank=rankTable(TAIL),cycleRank=rankTable(CYCLE),aTail=audit(tailRank),aCycle=audit(cycleRank);
assert.deepEqual(aTail,{rank_bound_checks:256,rank_bound_failures:0,monotonicity_candidate_pairs:65536,monotonicity_inclusion_premises:6561,monotonicity_failures:0,submodularity_pairs:65536,submodularity_failures:0});
assert.deepEqual(aCycle,aTail);
const tailCH=ch(tailRank),cycleCH=ch(cycleRank);assert.deepEqual(tailCH,TAIL);assert.deepEqual(cycleCH,CYCLE);
const expectedR={'0,0':52,'0,1':70,'0,2':56,'0,3':28,'0,4':8,'0,5':1,'1,0':28,'1,1':4,'2,0':8,'3,0':1};
const expectedT={'0,1':11,'0,2':10,'0,3':6,'0,4':3,'0,5':1,'1,0':11,'1,1':4,'2,0':5,'3,0':1};
assert.deepEqual(R(tailRank),expectedR);assert.deepEqual(R(cycleRank),expectedR);assert.deepEqual(T(expectedR),expectedT);
const dt=degrees(tailCH),dc=degrees(cycleCH);assert.deepEqual(sorted(dt),[2,2,2,2,1,1,1,1]);assert.deepEqual(sorted(dc),[2,2,2,2,1,1,1,1]);
const moments=Array.from({length:8},(_,i)=>4*(2**(i+1))+4);assert.deepEqual(moments,[12,20,36,68,132,260,516,1028]);for(let k=1;k<=8;k++){assert.equal(dt.reduce((s,d)=>s+d**k,0),moments[k-1]);assert.equal(dc.reduce((s,d)=>s+d**k,0),moments[k-1]);}
const gt=graph(tailCH),gc=graph(cycleCH);assert.deepEqual(gt,{edge_count:4,degree_profile:[3,2,2,1],max_degree:3});assert.deepEqual(gc,{edge_count:4,degree_profile:[2,2,2,2],max_degree:2});assert.equal((moments[1]-moments[0])/2,4);
const cross=search(tailCH,cycleCH);assert.deepEqual(cross,{relabelings:40320,checks:161280,matches:0});
const expectedClassCounts={tutte:1,tutte_plus_degree_multiset:1,tutte_plus_all_one_point_power_sum_moments:1,tutte_plus_degree_multiset_plus_total_overlap:1,tutte_plus_degree_multiset_plus_max_overlap_degree:2};

const mod=await import(`../app/dome-world/previews/a15-r0/atlas-marginal-relational-incidence-separation.js?hostile=${Date.now()}`);
const c=mod.atlasMarginalRelationalIncidenceSeparationCertificate();
assert.equal(c.passed,true);assert.deepEqual(c.common_rank_generating,expectedR);assert.deepEqual(c.common_tutte,expectedT);assert.deepEqual(c.M_tail.element_degree_multiset,[2,2,2,2,1,1,1,1]);assert.deepEqual(c.M_cycle.element_degree_multiset,[2,2,2,2,1,1,1,1]);assert.deepEqual(c.M_tail.overlap_graph, {...c.M_tail.overlap_graph, pair_checks:6, edge_count:4, degree_profile:[3,2,2,1], max_degree:3});assert.deepEqual(c.M_cycle.overlap_graph,{...c.M_cycle.overlap_graph,pair_checks:6,edge_count:4,degree_profile:[2,2,2,2],max_degree:2});assert.deepEqual(c.receiver_class_counts,expectedClassCounts);assert.equal(c.cross_isomorphism.match_count,0);
console.log('Ash A15-R0 Atlas marginal-relational incidence hostile tests passed.');