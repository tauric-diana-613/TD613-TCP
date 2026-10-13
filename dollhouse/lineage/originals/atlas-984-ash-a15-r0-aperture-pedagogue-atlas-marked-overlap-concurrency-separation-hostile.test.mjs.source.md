import assert from 'node:assert/strict';

const E=[0,1,2,3,4,5,6,7];
const A=[[0,4,5],[0,2,3],[0,1,6],[3,5,6],[2,4,7]];
const B=[[4,5,7],[2,6,7],[1,3,4],[0,1,7],[0,3,5]];
const key=h=>[...h].sort((a,b)=>a-b).join('');
function permutations(xs){const out=[];function r(p,s){if(!s.length){out.push([...p]);return;}for(let i=0;i<s.length;i++)r([...p,s[i]],[...s.slice(0,i),...s.slice(i+1)]);}r([],xs);return out;}
function incidence(H){return E.map(e=>H.filter(h=>h.includes(e)).length);}
function overlap(H){const adj=Array.from({length:5},()=>Array(5).fill(0));for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)if(H[i].some(v=>H[j].includes(v)))adj[i][j]=adj[j][i]=1;const degree=adj.map(row=>row.reduce((x,y)=>x+y,0));return {adj,degree};}
function graphIsos(G,H){const out=[];for(const p of permutations([0,1,2,3,4])){let ok=true;for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)if(G.adj[i][j]!==H.adj[p[i]][p[j]])ok=false;if(ok)out.push(p);}return out;}
function mark(H,d,G){const e=E.filter(x=>d[x]===3);assert.equal(e.length,1);const support=H.map((h,i)=>h.includes(e[0])?i:-1).filter(i=>i>=0);const lambda=support.map(i=>G.degree[i]).sort((x,y)=>y-x);return {support,lambda,kappa:lambda.reduce((x,y)=>x+y,0)};}

for(const H of [A,B])for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)assert.ok(H[i].filter(v=>H[j].includes(v)).length<=1);
const dA=incidence(A),dB=incidence(B);assert.deepEqual([...dA].sort((x,y)=>y-x),[3,2,2,2,2,2,1,1]);assert.deepEqual([...dB].sort((x,y)=>y-x),[3,2,2,2,2,2,1,1]);
const gA=overlap(A),gB=overlap(B);assert.deepEqual([...gA.degree].sort((x,y)=>y-x),[4,4,3,3,2]);assert.deepEqual([...gB.degree].sort((x,y)=>y-x),[4,4,3,3,2]);
const isos=graphIsos(gA,gB);assert.equal(isos.length,4);
const mA=mark(A,dA,gA),mB=mark(B,dB,gB);assert.deepEqual(mA.lambda,[4,4,3]);assert.deepEqual(mB.lambda,[4,4,2]);assert.equal(mA.kappa,11);assert.equal(mB.kappa,10);
const targetMark=new Set(mB.support);let marked=0;for(const p of isos){const mapped=new Set(mA.support.map(i=>p[i]));if([...mapped].every(x=>targetMark.has(x)))marked++;}assert.equal(marked,0);
const target=new Set(B.map(key));let comparisons=0,matches=0;for(const p of permutations(E)){let ok=true;for(const h of A){comparisons++;if(!target.has(key(h.map(v=>p[v]))))ok=false;}if(ok)matches++;}assert.equal(comparisons,201600);assert.equal(matches,0);

const {atlasMarkedOverlapConcurrencySeparationCertificate}=await import('../app/dome-world/previews/a15-r0/atlas-marked-overlap-concurrency-separation.js');
const c=atlasMarkedOverlapConcurrencySeparationCertificate();assert.equal(c.passed,true);assert.equal(c.overlap_graph_isomorphisms,4);assert.equal(c.mark_preserving_overlap_graph_isomorphisms,0);
console.log('Ash A15-R0 Atlas marked-overlap concurrency separation hostile tests passed.');