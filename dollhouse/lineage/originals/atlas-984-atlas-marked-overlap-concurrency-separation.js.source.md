import {
  ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_SCHEMA,
  atlasMarginalRelationalIncidenceSeparationCertificate,
} from './atlas-marginal-relational-incidence-separation.js';

export const ATLAS_MARKED_OVERLAP_CONCURRENCY_SEPARATION_SCHEMA='td613.dome-world.atlas-marked-overlap-concurrency-separation/v0.1';
export const ATLAS_MARKED_OVERLAP_CONCURRENCY_SEPARATION_PARENT_RECEIPT='c22a588897aa27f55970480218f952697967df80';

const E=Object.freeze([0,1,2,3,4,5,6,7]);
const HA=Object.freeze([[0,4,5],[0,2,3],[0,1,6],[3,5,6],[2,4,7]].map(x=>Object.freeze(x)));
const HB=Object.freeze([[4,5,7],[2,6,7],[1,3,4],[0,1,7],[0,3,5]].map(x=>Object.freeze(x)));
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const maskOf=h=>h.reduce((m,v)=>m|(1<<v),0);
const keyH=h=>[...h].sort((a,b)=>a-b).join('');
function add(map,a,b,c=1){ const k=`${a},${b}`; map[k]=(map[k]||0)+c; if(map[k]===0) delete map[k]; }
function choose(n,k){ if(k<0||k>n)return 0; if(k===0||k===n)return 1; let v=1; for(let i=1;i<=k;i++)v=v*(n-k+i)/i; return v; }

function rankTable(H){
  const circuits=new Set(H.map(maskOf));
  return Object.freeze(Array.from({length:256},(_,m)=>{ const k=popcount(m); if(k<3)return k; if(k===3&&circuits.has(m))return 2; return 3; }));
}
function auditRank(rank){
  let boundChecks=0,boundFailures=0,monoCandidates=0,monoPremises=0,monoFailures=0,subPairs=0,subFailures=0;
  for(let m=0;m<256;m++){ boundChecks++; if(rank[m]<0||rank[m]>Math.min(3,popcount(m)))boundFailures++; }
  for(let a=0;a<256;a++)for(let b=0;b<256;b++){
    monoCandidates++;
    if((a&~b)===0){ monoPremises++; if(rank[a]>rank[b])monoFailures++; }
    subPairs++; if(rank[a]+rank[b]<rank[a|b]+rank[a&b])subFailures++;
  }
  return freeze({bound_checks:boundChecks,bound_failures:boundFailures,monotonicity_candidate_pairs:monoCandidates,monotonicity_premises:monoPremises,monotonicity_failures:monoFailures,submodularity_pairs:subPairs,submodularity_failures:subFailures,normalization_failures:rank[0]===0?0:1});
}
function pairIntersectionAudit(H){ let pairs=0,failures=0; for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){ pairs++; const s=H[i].filter(v=>H[j].includes(v)).length; if(s>1)failures++; } return freeze({pairs,failures}); }
function rankGenerating(rank){ const out={}; const rE=rank[255]; for(let m=0;m<256;m++)add(out,rE-rank[m],popcount(m)-rank[m],1); return freeze(Object.fromEntries(Object.entries(out).sort())); }
function tutteFromR(R){ const out={}; for(const [k,c] of Object.entries(R)){ const [a,b]=k.split(',').map(Number); for(let i=0;i<=a;i++)for(let j=0;j<=b;j++)add(out,i,j,c*choose(a,i)*choose(b,j)*((-1)**((a-i)+(b-j)))); } return freeze(Object.fromEntries(Object.entries(out).sort())); }
function incidence(H){ const labeled=E.map(e=>H.reduce((s,h)=>s+(h.includes(e)?1:0),0)); return freeze({labeled:freeze(labeled),sorted:freeze([...labeled].sort((a,b)=>b-a))}); }
function overlap(H){
  const adj=Array.from({length:H.length},()=>Array(H.length).fill(0)); let edges=0;
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++) if(H[i].some(v=>H[j].includes(v))){adj[i][j]=adj[j][i]=1;edges++;}
  const degrees=adj.map(r=>r.reduce((a,b)=>a+b,0));
  return freeze({adj:freeze(adj.map(r=>freeze(r))),edges,degrees:freeze(degrees),degree_profile:freeze([...degrees].sort((a,b)=>b-a))});
}
function permutations(xs){ const out=[]; function rec(pre,rest){ if(!rest.length){out.push(Object.freeze([...pre]));return;} for(let i=0;i<rest.length;i++)rec([...pre,rest[i]],[...rest.slice(0,i),...rest.slice(i+1)]); } rec([],xs); return Object.freeze(out); }
const P5=permutations([0,1,2,3,4]);
const P8=permutations(E);
function graphCode(G,p){ let s=''; for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)s+=String(G.adj[p[i]][p[j]]); return s; }
function canonicalGraphCode(G){ let best=null; for(const p of P5){ const s=graphCode(G,p); if(best===null||s<best)best=s; } return best; }
function overlapIsomorphisms(GA,GB){
  const maps=[];
  for(const p of P5){ let ok=true; for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)if(GA.adj[i][j]!==GB.adj[p[i]][p[j]])ok=false; if(ok)maps.push(p); }
  return Object.freeze(maps);
}
function concurrencyMark(H,inc,G){
  const ground=E.filter(e=>inc.labeled[e]===3);
  const support=ground.length===1?H.map((h,i)=>h.includes(ground[0])?i:null).filter(i=>i!==null):[];
  const lambda=[...support.map(i=>G.degrees[i])].sort((a,b)=>b-a);
  return freeze({degree_three_ground_elements:freeze(ground),support:freeze(support),lambda:freeze(lambda),kappa:lambda.reduce((a,b)=>a+b,0)});
}
function markPreservingCount(maps,markA,markB){ const B=new Set(markB.support); let n=0; for(const p of maps){ const mapped=new Set(markA.support.map(i=>p[i])); if(mapped.size===B.size&&[...mapped].every(x=>B.has(x)))n++; } return n; }
function crossGroundSearch(HA,HB){
  const target=new Set(HB.map(keyH)); let comparisons=0,matches=0;
  for(const p of P8){ let ok=true; for(const h of HA){ comparisons++; const mapped=keyH(h.map(v=>p[v])); if(!target.has(mapped))ok=false; } if(ok)matches++; }
  return freeze({permutations:P8.length,mapped_circuit_hyperplane_membership_comparisons:comparisons,match_count:matches});
}
function classCount(xs){return new Set(xs.map(x=>JSON.stringify(x))).size;}
function analyze(H){ const rank=rankTable(H); const rankAudit=auditRank(rank); const pairAudit=pairIntersectionAudit(H); const R=rankGenerating(rank); const T=tutteFromR(R); const inc=incidence(H); const G=overlap(H); const mark=concurrencyMark(H,inc,G); return freeze({rank,rank_audit:rankAudit,pair_intersection_audit:pairAudit,R,T,incidence:inc,overlap:G,mark}); }

export function atlasMarkedOverlapConcurrencySeparationCertificate(){
  if(cached)return cached;
  const parent=atlasMarginalRelationalIncidenceSeparationCertificate();
  const parentExact=parent.passed===true&&ATLAS_MARGINAL_RELATIONAL_INCIDENCE_SEPARATION_SCHEMA==='td613.dome-world.atlas-marginal-relational-incidence-separation/v0.1';
  const A=analyze(HA),B=analyze(HB);
  const graphMaps=overlapIsomorphisms(A.overlap,B.overlap);
  const markPreserving=markPreservingCount(graphMaps,A.mark,B.mark);
  const groundSearch=crossGroundSearch(HA,HB);
  const expectedR={'0,0':51,'0,1':70,'0,2':56,'0,3':28,'0,4':8,'0,5':1,'1,0':28,'1,1':5,'2,0':8,'3,0':1};
  const expectedT={'0,1':10,'0,2':10,'0,3':6,'0,4':3,'0,5':1,'1,0':10,'1,1':5,'2,0':5,'3,0':1};
  const commonGraphCode=canonicalGraphCode(A.overlap);
  const receiverCounts=freeze({
    tutte:classCount([A.T,B.T]),
    tutte_plus_marginal:classCount([[A.T,A.incidence.sorted],[B.T,B.incidence.sorted]]),
    tutte_plus_marginal_plus_overlap_graph:classCount([[A.T,A.incidence.sorted,commonGraphCode],[B.T,B.incidence.sorted,canonicalGraphCode(B.overlap)]]),
    marked_lambda:classCount([[A.T,A.incidence.sorted,commonGraphCode,A.mark.lambda],[B.T,B.incidence.sorted,canonicalGraphCode(B.overlap),B.mark.lambda]]),
    marked_kappa:classCount([[A.T,A.incidence.sorted,commonGraphCode,A.mark.kappa],[B.T,B.incidence.sorted,canonicalGraphCode(B.overlap),B.mark.kappa]]),
  });
  const failures=A.rank_audit.normalization_failures+A.rank_audit.bound_failures+A.rank_audit.monotonicity_failures+A.rank_audit.submodularity_failures+B.rank_audit.normalization_failures+B.rank_audit.bound_failures+B.rank_audit.monotonicity_failures+B.rank_audit.submodularity_failures+A.pair_intersection_audit.failures+B.pair_intersection_audit.failures;
  const exact=parentExact&&failures===0&&same(A.R,expectedR)&&same(B.R,expectedR)&&same(A.T,expectedT)&&same(B.T,expectedT)&&same(A.incidence.sorted,[3,2,2,2,2,2,1,1])&&same(B.incidence.sorted,[3,2,2,2,2,2,1,1])&&A.overlap.edges===8&&B.overlap.edges===8&&same(A.overlap.degree_profile,[4,4,3,3,2])&&same(B.overlap.degree_profile,[4,4,3,3,2])&&canonicalGraphCode(A.overlap)===canonicalGraphCode(B.overlap)&&graphMaps.length===4&&same(A.mark.lambda,[4,4,3])&&A.mark.kappa===11&&same(B.mark.lambda,[4,4,2])&&B.mark.kappa===10&&markPreserving===0&&groundSearch.permutations===40320&&groundSearch.mapped_circuit_hyperplane_membership_comparisons===201600&&groundSearch.match_count===0&&same(receiverCounts,{tutte:1,tutte_plus_marginal:1,tutte_plus_marginal_plus_overlap_graph:1,marked_lambda:2,marked_kappa:2});
  cached=freeze({schema:ATLAS_MARKED_OVERLAP_CONCURRENCY_SEPARATION_SCHEMA,parent_receipt:ATLAS_MARKED_OVERLAP_CONCURRENCY_SEPARATION_PARENT_RECEIPT,parent_exact:parentExact,A,B,common_rank_generating:freeze(expectedR),common_tutte:freeze(expectedT),overlap_graph_isomorphisms:graphMaps.length,mark_preserving_overlap_graph_isomorphisms:markPreserving,ground_isomorphism_search:groundSearch,receiver_class_counts:receiverCounts,aggregate_burden:freeze({rank_entries:512,rank_bound_checks:512,monotonicity_candidate_pairs:131072,submodularity_pairs:131072,overlap_graph_permutations:120,ground_relabelings:40320,ground_membership_comparisons:201600}),laws:freeze({same_tutte:same(A.T,B.T),same_complete_marginal_degree_multiset:same(A.incidence.sorted,B.incidence.sorted),same_abstract_overlap_graph:canonicalGraphCode(A.overlap)===canonicalGraphCode(B.overlap),concurrency_mark_separates:!same(A.mark.lambda,B.mark.lambda),kappa_separates:A.mark.kappa!==B.mark.kappa,no_overlap_graph_isomorphism_preserves_mark:markPreserving===0,ground_nonisomorphic:groundSearch.match_count===0,complete_matroid_classifier_claimed:false,physical_network_claimed:false,causal_concurrency_claimed:false}),membranes:freeze(['MARKED_OVERLAP_GRAPH != PHYSICAL_NETWORK','CONCURRENCY_MARK != CAUSAL_CONCURRENCY','KAPPA_SEPARATES_DECLARED_PAIR != UNIVERSAL_CLASSIFIER','SAME_ABSTRACT_OVERLAP_GRAPH != SAME_MATROID','HIGHER_ORDER_RELATIONAL_REPAIR != COMPLETE_MATROID_INVARIANT','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE']),passed:exact});
  return cached;
}

export const ATLAS_MARKED_OVERLAP_CONCURRENCY_SEPARATION_CERTIFICATE=atlasMarkedOverlapConcurrencySeparationCertificate();