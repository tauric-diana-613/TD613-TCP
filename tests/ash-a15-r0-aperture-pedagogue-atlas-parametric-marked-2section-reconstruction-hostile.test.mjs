import assert from 'node:assert/strict';

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function choose(n,k){if(k<0||k>n)return 0;if(k===0||k===n)return 1;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return v;}
function combos(xs,k){const out=[];function rec(s,p){if(p.length===k){out.push([...p]);return;}for(let i=s;i<xs.length;i++)rec(i+1,[...p,xs[i]]);}rec(0,[]);return out;}
const ix=(a,b)=>a.reduce((n,x)=>n+(b.includes(x)?1:0),0);
const key=s=>`${s.length}:${s.join(',')}`;
function canon(xs){return [...xs].map(s=>[...s].sort((a,b)=>a-b)).sort((a,b)=>key(a).localeCompare(key(b)));}
function raw(H){const U=[...new Set(H.flat())].sort((a,b)=>a-b);return canon(U.map(e=>H.map((h,i)=>h.includes(e)?i:null).filter(i=>i!==null)));}
function encode(H,k){assert.ok(H.every(h=>h.length===k));const r=raw(H),edges=[];for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(ix(H[i],H[j]))edges.push([i,j]);return {b:H.length,k,edges,marks:canon(r.filter(s=>s.length>=3))};}
function decode(R){const edgeSet=new Set(R.edges.map(e=>`${e[0]},${e[1]}`)),covered=new Set(),out=[];for(const m of R.marks){out.push([...m]);for(let a=0;a<m.length;a++)for(let b=a+1;b<m.length;b++){const x=Math.min(m[a],m[b]),y=Math.max(m[a],m[b]),z=`${x},${y}`;assert.equal(edgeSet.has(z),true);assert.equal(covered.has(z),false);covered.add(z);}}const unc=[];for(const e of R.edges){const z=`${e[0]},${e[1]}`;if(!covered.has(z)){unc.push(e);out.push([...e]);}}for(let i=0;i<R.b;i++){const s=R.marks.filter(m=>m.includes(i)).length+unc.filter(e=>e.includes(i)).length;assert.ok(s<=R.k);for(let n=0;n<R.k-s;n++)out.push([i]);}return canon(out);}
function run(n,k,maxR){const B=combos(Array.from({length:n},(_,i)=>i),k);const by={},marks={};let admitted=0,success=0,marked=0;const sel=[];function rec(start){if(sel.length){admitted++;by[sel.length]=(by[sel.length]||0)+1;const H=sel.map(x=>x),R=encode(H,k);marks[R.marks.length]=(marks[R.marks.length]||0)+1;if(R.marks.length)marked++;assert.deepEqual(decode(R),raw(H));success++;}if(sel.length===maxR)return;for(let i=start;i<B.length;i++){if(sel.some(p=>ix(p,B[i])>1))continue;sel.push(B[i]);rec(i+1);sel.pop();}}rec(0);let candidates=0;for(let r=1;r<=maxR;r++)candidates+=choose(B.length,r);return {candidates,admitted,success,marked,by,marks};}
const k2=run(5,2,4),k3=run(7,3,4),k4=run(10,4,3);
assert.deepEqual({candidates:k2.candidates,admitted:k2.admitted,success:k2.success,marked:k2.marked,by:k2.by},{candidates:385,admitted:385,success:385,marked:145,by:{1:10,2:45,3:120,4:210}});
assert.deepEqual({candidates:k3.candidates,admitted:k3.admitted,success:k3.success,marked:k3.marked,by:k3.by},{candidates:59535,admitted:4305,success:4305,marked:945,by:{1:35,2:385,3:1575,4:2310}});
assert.deepEqual({candidates:k4.candidates,admitted:k4.admitted,success:k4.success,marked:k4.marked,by:k4.by},{candidates:1543675,admitted:113785,success:113785,marked:2800,by:{1:210,2:9975,3:103600}});
assert.equal(k2.success+k3.success+k4.success,118475);
assert.equal(k2.marked+k3.marked+k4.marked,3890);
const nonlinear=[[0,1,2],[0,1,3]];assert.notDeepEqual(decode(encode(nonlinear,3)),raw(nonlinear));
const generic=await import('../app/dome-world/previews/a15-r0/atlas-parametric-marked-2section-reconstruction.js');
assert.equal(generic.atlasParametricMarked2SectionReconstructionCertificate().passed,true);
console.log('Ash A15-R0 Atlas parametric marked 2-section reconstruction hostile tests passed.');