import assert from 'node:assert/strict';
import { atlasSchubertMobiusRecursive } from '../app/dome-world/previews/a15-r0/atlas-schubert-mobius-incidence.js';
import { atlasSchubertClosureContains } from '../app/dome-world/previews/a15-r0/atlas-schubert-closure-poset.js';
import { atlasSchubertCellDimension } from '../app/dome-world/previews/a15-r0/atlas-schubert-graded-cell-decomposition.js';

const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const key=e=>e.join(',');
const pairKey=(lower,upper)=>`${key(lower)}|${key(upper)}`;

function compositions(k,d){
  const out=[];
  function rec(j,rem,prefix){if(j===d-1){out.push([...prefix,rem]);return;}for(let x=0;x<=rem;x++)rec(j+1,rem-x,[...prefix,x]);}
  rec(0,k,[]);return out;
}
function compFromWord(word){
  const out=[];let run=0;
  for(const b of word){if(b===1)run++;else{out.push(run);run=0;}}
  out.push(run);return out;
}
function independentPaths(m,k){
  const out=[];
  function rec(x,y,path){
    if(x===m&&y===k){out.push([...path]);return;}
    if(x<m)rec(x+1,y,[...path,'E']);
    if(y<k)rec(x,y+1,[...path,'N']);
    if(x<m&&y<k)rec(x+1,y+1,[...path,'D']);
  }
  rec(0,0,[]);return out;
}
function independentDecode(path){
  const lower=[],marks=[];
  for(const step of path){
    if(step==='E')lower.push(0);
    else if(step==='N')lower.push(1);
    else{marks.push(lower.length);lower.push(1,0);}
  }
  const upper=[...lower];for(const p of marks){upper[p]=0;upper[p+1]=1;}
  return {lower,upper,marks};
}
function independentRecurrence(maxM,maxK){
  const table=Array.from({length:maxM+1},()=>Array(maxK+1));
  const add=(a,b,c)=>{const n=Math.max(a.length,b.length,c.length+1),out=Array(n).fill(0);for(let i=0;i<a.length;i++)out[i]+=a[i];for(let i=0;i<b.length;i++)out[i]+=b[i];for(let i=0;i<c.length;i++)out[i+1]+=c[i];return out;};
  for(let m=0;m<=maxM;m++)for(let k=0;k<=maxK;k++)table[m][k]=m===0||k===0?[1]:add(table[m-1][k],table[m][k-1],table[m-1][k-1]);
  return table;
}

const aggregate=Array(6).fill(0),dp=independentRecurrence(6,5);
let pathsTotal=0,nonzeroSeen=0,positive=0,negative=0,supportMembershipFailures=0,signFailures=0,rankFailures=0,duplicateFailures=0,recurrenceFailures=0,signedCellFailures=0;

for(let d=1;d<=7;d++)for(let k=0;k<=5;k++){
  const m=d-1,paths=independentPaths(m,k),pairs=new Set(),hist=Array(Math.min(m,k)+1).fill(0),labels=compositions(k,d);
  let cellPositive=0,cellNegative=0;
  for(const path of paths){
    pathsTotal++;
    const {lower:lowerWord,upper:upperWord,marks}=independentDecode(path),lower=compFromWord(lowerWord),upper=compFromWord(upperWord),mu=atlasSchubertMobiusRecursive(upper,lower),gap=atlasSchubertCellDimension(upper,k)-atlasSchubertCellDimension(lower,k),sign=marks.length%2===0?1:-1;
    const pk=pairKey(lower,upper);if(pairs.has(pk))duplicateFailures++;pairs.add(pk);
    if(mu===0)supportMembershipFailures++;
    if(mu!==sign)signFailures++;
    if(gap!==marks.length)rankFailures++;
    hist[marks.length]++;aggregate[marks.length]++;
    if(sign===1){positive++;cellPositive++;}else{negative++;cellNegative++;}
  }
  nonzeroSeen+=pairs.size;

  let parentNonzero=0;
  for(const upper of labels)for(const lower of labels){
    if(!atlasSchubertClosureContains(upper,lower))continue;
    const mu=atlasSchubertMobiusRecursive(upper,lower),present=pairs.has(pairKey(lower,upper));
    if(mu!==0)parentNonzero++;
    if((mu!==0)!==present)supportMembershipFailures++;
  }

  assert.equal(parentNonzero,pairs.size,`independent path support size mismatch at d=${d},k=${k}`);
  assert.deepEqual(dp[m][k],hist,`independent recurrence mismatch at d=${d},k=${k}`);
  if(!same(dp[m][k],hist))recurrenceFailures++;
  if(cellPositive-cellNegative!==1)signedCellFailures++;
}

assert.equal(pathsTotal,9912);
assert.equal(nonzeroSeen,9912);
assert.equal(positive,4977);
assert.equal(negative,4935);
assert.equal(positive-negative,42);
assert.deepEqual(aggregate,[1715,3829,3101,1099,161,7]);
assert.equal(aggregate[0],1715);
assert.equal(aggregate[1],3829);
assert.equal(aggregate.slice(2).reduce((a,b)=>a+b,0),4368);
assert.equal(supportMembershipFailures,0);
assert.equal(signFailures,0);
assert.equal(rankFailures,0);
assert.equal(duplicateFailures,0);
assert.equal(recurrenceFailures,0);
assert.equal(signedCellFailures,0);

// Hostile local controls independent of the canonical encoder.
assert.deepEqual(independentPaths(2,2).reduce((h,p)=>{const s=p.filter(x=>x==='D').length;h[s]=(h[s]??0)+1;return h;},[]),[6,6,1]);
assert.deepEqual(independentDecode(['N','E']),{lower:[1,0],upper:[1,0],marks:[]});
assert.deepEqual(independentDecode(['D']),{lower:[1,0],upper:[0,1],marks:[0]});
assert.equal(atlasSchubertMobiusRecursive([0,1],[1,0]),-1);
assert.equal(atlasSchubertMobiusRecursive([0,1,1],[1,1,0]),1);
assert.equal(atlasSchubertMobiusRecursive([0,2,0],[2,0,0]),0);

console.log('Ash A15-R0 Atlas Schubert Möbius-Delannoy independent hostile witness passed.');
