import assert from 'node:assert/strict';
import {
  atlasAdditiveCompressionCollision,
  atlasCantorTupleCode,
  atlasMinimalAdditiveReceiverRankCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-minimal-additive-receiver-rank.js';

// Independently generate the preregistered 42 lower-dimensional integer receivers.
function matrix(rows,variant,cols=7){
  return Array.from({length:rows},(_,i)=>Array.from({length:cols},(_,j)=>(((i+1)*(j+2)+(variant+1)*(j+1)*(j+1))%7)-3));
}
function apply(A,v){return A.map(r=>r.reduce((s,x,j)=>s+BigInt(x)*BigInt(v[j]),0n));}
let generated=0;
for(let m=1;m<=6;m++)for(let variant=0;variant<7;variant++){
  generated++;
  const A=matrix(m,variant),w=atlasAdditiveCompressionCollision(A);
  assert.equal(w.valid,true,`missing collision for m=${m}, variant=${variant}`);
  assert.notDeepEqual(w.positive,w.negative);
  assert.deepEqual(apply(A,w.positive).map(String),apply(A,w.negative).map(String));
  assert.deepEqual(w.positive_readout,w.negative_readout);
}
assert.equal(generated,42);

// Every one-coordinate deletion from the seven-dimensional raw support basis is noninjective.
for(let drop=0;drop<7;drop++){
  const A=[];
  for(let i=0;i<7;i++)if(i!==drop)A.push(Array.from({length:7},(_,j)=>i===j?1:0));
  const w=atlasAdditiveCompressionCollision(A);
  assert.equal(w.valid,true,`deletion ${drop} unexpectedly injective`);
  assert.notDeepEqual(w.positive,w.negative);
  assert.deepEqual(apply(A,w.positive).map(String),apply(A,w.negative).map(String));
}

// The lower bound is additive-only. A recursive nonlinear Cantor code fits the entire N_0^7 carrier into one scalar.
const codes=new Set();
for(let mask=0;mask<128;mask++){
  const bits=Array.from({length:7},(_,i)=>(mask>>i)&1);
  codes.add(atlasCantorTupleCode(bits));
}
assert.equal(codes.size,128,'nonlinear one-scalar scope control must stay injective on the complete Boolean cube');

// Ragged/invalid and non-compressive matrices are refused rather than laundered into a theorem witness.
assert.equal(atlasAdditiveCompressionCollision([[1,0],[0,1]]).valid,false);
assert.equal(atlasAdditiveCompressionCollision([]).valid,false);

const c=atlasMinimalAdditiveReceiverRankCertificate();
for(const scar of [
  'MINIMAL_ADDITIVE_SCALAR_RANK != MINIMAL_BIT_LENGTH',
  'MINIMAL_ADDITIVE_SCALAR_RANK != SHANNON_LOWER_BOUND',
  'INTEGER_LINEAR_LOWER_BOUND != ARBITRARY_NONLINEAR_CODING_LOWER_BOUND',
  'UNIMODULAR_RECEIVER != UNIVERSAL_OPTIMAL_COMPRESSION',
  'CANTOR_PAIRING_CONTROL != PRACTICAL_COMPRESSION_SCHEME',
])assert.equal(c.membranes.includes(scar),true,`missing membrane: ${scar}`);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas minimal additive receiver rank hostile tests passed.');