import assert from 'node:assert/strict';

const supports=[[0],[1],[2],[0,1],[0,2],[1,2],[0,1,2]];
const pairs=[[0,1],[0,2],[1,2]];
const keepSets={NONE:[],C:['C'],W:['W'],H:['H'],CW:['C','W'],CH:['C','H'],WH:['W','H'],CWH:['C','W','H']};
const expected={
  NONE:[1,128,{128:1}],
  C:[59,8,{1:32,2:12,4:6,5:8,8:1}],
  W:[15,16,{8:14,16:1}],
  H:[2,64,{64:2}],
  CW:[127,2,{1:126,2:1}],
  CH:[80,4,{1:52,2:12,3:12,4:4}],
  WH:[16,8,{8:16}],
  CWH:[128,1,{1:128}],
};
const inverse=[
  [1,0,0,-1,-1,0,1],[0,1,0,-1,0,-1,1],[0,0,1,0,-1,-1,1],
  [0,0,0,1,0,0,-1],[0,0,0,0,1,0,-1],[0,0,0,0,0,1,-1],[0,0,0,0,0,0,1],
];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function matrix(){const A=[];for(let i=0;i<3;i++)A.push(supports.map(S=>S.includes(i)?1:0));for(const [i,j] of pairs)A.push(supports.map(S=>S.includes(i)&&S.includes(j)?1:0));A.push(supports.map(S=>S.length===3?1:0));return A;}
function det(A){const M=A.map(r=>r.map(BigInt));let sign=1n,prev=1n;for(let k=0;k<M.length-1;k++){let p=k;while(p<M.length&&M[p][k]===0n)p++;assert.ok(p<M.length);if(p!==k){[M[p],M[k]]=[M[k],M[p]];sign=-sign;}const pivot=M[k][k];for(let i=k+1;i<M.length;i++)for(let j=k+1;j<M.length;j++)M[i][j]=(M[i][j]*pivot-M[i][k]*M[k][j])/prev;prev=pivot;}return Number(sign*M[M.length-1][M.length-1]);}
function mul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));}
const I=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>i===j?1:0));
const A=matrix();
assert.equal(det(A),1);
assert.deepEqual(mul(A,inverse),I);
assert.deepEqual(mul(inverse,A),I);

function state(bits){const C=[0,1,2].map(i=>supports.reduce((s,S,j)=>s+(S.includes(i)?bits[j]:0),0));const W=pairs.map(([i,j])=>supports.reduce((s,S,k)=>s+(S.includes(i)&&S.includes(j)?bits[k]:0),0));return {bits,C,W,H:[bits[6]]};}
function sig(s,keep){const x=[];if(keep.includes('C'))x.push(s.C);if(keep.includes('W'))x.push(s.W);if(keep.includes('H'))x.push(s.H);return JSON.stringify(x);}
const states=Array.from({length:128},(_,mask)=>state(Array.from({length:7},(_,i)=>(mask>>i)&1)));
let inversionFailures=0;
for(const s of states){const y=[...s.C,...s.W,...s.H];const back=inverse.map(r=>r.reduce((z,x,i)=>z+x*y[i],0));if(!same(back,s.bits))inversionFailures++;}
assert.equal(inversionFailures,0);

const quotients={};
for(const [name,keep] of Object.entries(keepSets)){
  const groups=new Map();for(const s of states){const k=sig(s,keep);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s.bits);}
  const freq={};let max=0;for(const xs of groups.values()){freq[xs.length]=(freq[xs.length]||0)+1;max=Math.max(max,xs.length);}
  quotients[name]={classes:groups.size,max,freq,groups};
  assert.equal(groups.size,expected[name][0]);assert.equal(max,expected[name][1]);assert.deepEqual(freq,expected[name][2]);
}

const capA=[0,0,0,0,0,0,0],capB=[1,0,0,0,0,0,0];
const pairA=[0,0,1,1,0,0,0],pairB=[0,1,0,0,1,0,0];
const highA=[0,0,0,1,1,1,0],highB=[1,1,1,0,0,0,1];
assert.equal(sig(state(capA),['W','H']),sig(state(capB),['W','H']));
assert.equal(sig(state(pairA),['C','H']),sig(state(pairB),['C','H']));
assert.equal(sig(state(highA),['C','W']),sig(state(highB),['C','W']));
const cwNonSingleton=[...quotients.CW.groups.values()].filter(xs=>xs.length>1);
assert.equal(cwNonSingleton.length,1);
const got=cwNonSingleton[0].map(x=>x.join('')).sort();
assert.deepEqual(got,[highA.join(''),highB.join('')].sort());

// Only after independent reconstruction is complete may the child be imported.
const child=await import('../app/dome-world/previews/a15-r0/atlas-stratified-receiver-irreducibility.js');
const cert=child.atlasStratifiedReceiverIrreducibilityCertificate();
assert.equal(cert.passed,true);
assert.equal(cert.determinant,1);
assert.equal(cert.boolean_state_count,128);
assert.deepEqual(cert.receiver_census.CW,{classes:127,max_fiber:2,fiber_frequency:{1:126,2:1}});
assert.deepEqual(cert.receiver_census.CWH,{classes:128,max_fiber:1,fiber_frequency:{1:128}});

console.log('Ash A15-R0 Atlas stratified receiver irreducibility hostile tests passed.');