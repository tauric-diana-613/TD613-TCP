import assert from 'node:assert/strict';

const G=[0,1,2,3,4,5,6];
function comb(xs,k){const o=[];function r(s,p){if(p.length===k){o.push([...p]);return;}for(let i=s;i<xs.length;i++)r(i+1,[...p,xs[i]]);}r(0,[]);return o;}
const triples=comb(G,3);
const inter=(a,b)=>a.filter(x=>b.includes(x)).length;
const linear=H=>{for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(inter(H[i],H[j])>1)return false;return true;};
const key=s=>`${s.length}:${s.join(',')}`;
const canon=xs=>[...xs].map(x=>[...x]).sort((a,b)=>key(a).localeCompare(key(b)));
function raw(H){const U=G.filter(e=>H.some(h=>h.includes(e)));return canon(U.map(e=>H.map((h,i)=>h.includes(e)?i:null).filter(i=>i!==null)));}
function recv(H){const R=raw(H);const edges=[];for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(inter(H[i],H[j]))edges.push([i,j]);return {n:H.length,edges,marks:canon(R.filter(s=>s.length>=3))};}
function recon(R){const covered=new Set(),out=[];for(const m of R.marks){out.push(m);for(const [a,b] of comb(m,2))covered.add(`${Math.min(a,b)},${Math.max(a,b)}`);}const un=[];for(const e of R.edges)if(!covered.has(`${e[0]},${e[1]}`)){un.push(e);out.push(e);}for(let i=0;i<R.n;i++){const shared=R.marks.filter(m=>m.includes(i)).length+un.filter(e=>e.includes(i)).length;for(let q=0;q<3-shared;q++)out.push([i]);}return canon(out);}

const fam=[];const by={};for(let n=1;n<=4;n++)for(const H of comb(triples,n))if(linear(H)){fam.push(H);by[n]=(by[n]||0)+1;}
let successes=0,edges=0,marks=0,entries=0,blocks=0,pairs=0,membership=0;const markProfile={};
for(const H of fam){const a=raw(H),R=recv(H),b=recon(R);if(JSON.stringify(a)===JSON.stringify(b))successes++;edges+=R.edges.length;marks+=R.marks.length;entries+=a.length;blocks+=H.length;pairs+=H.length*(H.length-1)/2;membership+=7*H.length;markProfile[R.marks.length]=(markProfile[R.marks.length]||0)+1;}
assert.equal(fam.length,4305);assert.deepEqual(by,{1:35,2:385,3:1575,4:2310});assert.equal(successes,4305);assert.equal(blocks,14770);assert.equal(pairs,18970);assert.equal(membership,103390);assert.equal(entries,28245);assert.equal(edges,17010);assert.equal(marks,945);assert.deepEqual(markProfile,{0:3360,1:945});

const nonlinear=[[0,1,2],[0,1,3]];
assert.notDeepEqual(raw(nonlinear),recon(recv(nonlinear)));
const isolatedReceiver=JSON.stringify(recv([[0,1,2]]));
assert.equal(isolatedReceiver,JSON.stringify(recv([[0,1,2]])));

const {atlasMarked2SectionReconstructionExactnessCertificate}=await import('../app/dome-world/previews/a15-r0/atlas-marked-2section-reconstruction-exactness.js');
const child=atlasMarked2SectionReconstructionExactnessCertificate();
assert.equal(child.passed,true);assert.equal(child.census.admitted_family_count,fam.length);assert.equal(child.census.reconstruction_successes,successes);assert.equal(child.census.total_overlap_edges,edges);assert.equal(child.census.total_marked_concurrency_cliques,marks);
console.log('Ash A15-R0 Atlas marked 2-section reconstruction exactness hostile tests passed.');
