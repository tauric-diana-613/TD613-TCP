import {
  ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_SCHEMA,
  atlasStratifiedReceiverIrreducibilityCertificate,
} from './atlas-stratified-receiver-irreducibility.js';

export const ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_SCHEMA='td613.dome-world.atlas-minimal-additive-receiver-rank/v0.1';
export const ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_PARENT_RECEIPT='c880a89346fd18a11a8c9476529e77816e12d14a';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const popcount=x=>{let c=0;while(x){c+=x&1;x>>>=1;}return c;};
const contains=(sup,sub)=>(sup&sub)===sub;

function supports(n){
  const xs=[];for(let m=1;m<(1<<n);m++)xs.push(m);
  xs.sort((a,b)=>popcount(a)-popcount(b)||a-b);
  return xs;
}
function transformMatrix(n){
  const ss=supports(n);
  return ss.map((S,i)=>ss.map((T,j)=>popcount(S)<=2?(contains(T,S)?1:0):(i===j?1:0)));
}
function isUnitUpperTriangular(A){
  for(let i=0;i<A.length;i++){
    if(A[i][i]!==1)return false;
    for(let j=0;j<i;j++)if(A[i][j]!==0)return false;
  }
  return true;
}
function detBareiss(A){
  if(A.length===0)return 1n;
  const M=A.map(r=>r.map(BigInt));let sign=1n,prev=1n,n=M.length;
  for(let k=0;k<n-1;k++){
    let p=k;while(p<n&&M[p][k]===0n)p++;if(p===n)return 0n;
    if(p!==k){[M[p],M[k]]=[M[k],M[p]];sign=-sign;}
    const pivot=M[k][k];
    for(let i=k+1;i<n;i++)for(let j=k+1;j<n;j++)M[i][j]=(M[i][j]*pivot-M[i][k]*M[k][j])/prev;
    for(let i=k+1;i<n;i++)M[i][k]=0n;
    prev=pivot;
  }
  return sign*M[n-1][n-1];
}

const abs=x=>x<0n?-x:x;
function gcd(a,b){a=abs(a);b=abs(b);while(b){[a,b]=[b,a%b];}return a;}
function lcm(a,b){if(a===0n||b===0n)return 0n;return abs(a/gcd(a,b)*b);}
function Q(n,d=1n){
  n=BigInt(n);d=BigInt(d);if(d===0n)throw new Error('zero denominator');
  if(d<0n){n=-n;d=-d;}const g=gcd(n,d)||1n;return {n:n/g,d:d/g};
}
const qadd=(a,b)=>Q(a.n*b.d+b.n*a.d,a.d*b.d);
const qsub=(a,b)=>Q(a.n*b.d-b.n*a.d,a.d*b.d);
const qmul=(a,b)=>Q(a.n*b.n,a.d*b.d);
const qdiv=(a,b)=>{if(b.n===0n)throw new Error('divide by zero');return Q(a.n*b.d,a.d*b.n);};
const qneg=a=>Q(-a.n,a.d);
const qzero=a=>a.n===0n;
function rationalKernel(matrix){
  const rows=matrix.length;
  const cols=rows?matrix[0].length:0;
  if(cols===0)throw new Error('matrix must have at least one column');
  if(matrix.some(r=>r.length!==cols))throw new Error('ragged matrix');
  const R=matrix.map(r=>r.map(x=>Q(BigInt(x))));
  const pivots=[];let r=0;
  for(let c=0;c<cols&&r<rows;c++){
    let p=r;while(p<rows&&qzero(R[p][c]))p++;if(p===rows)continue;
    if(p!==r)[R[p],R[r]]=[R[r],R[p]];
    const pv=R[r][c];for(let j=c;j<cols;j++)R[r][j]=qdiv(R[r][j],pv);
    for(let i=0;i<rows;i++)if(i!==r&&!qzero(R[i][c])){
      const f=R[i][c];for(let j=c;j<cols;j++)R[i][j]=qsub(R[i][j],qmul(f,R[r][j]));
    }
    pivots.push(c);r++;
  }
  const pivotSet=new Set(pivots);const free=[];for(let c=0;c<cols;c++)if(!pivotSet.has(c))free.push(c);
  if(free.length===0)return null;
  const f=free[0],v=Array.from({length:cols},()=>Q(0n));v[f]=Q(1n);
  for(let i=pivots.length-1;i>=0;i--)v[pivots[i]]=qneg(R[i][f]);
  let scale=1n;for(const x of v)scale=lcm(scale,x.d);
  let z=v.map(x=>x.n*(scale/x.d));
  let g=0n;for(const x of z)g=gcd(g,x);if(g>1n)z=z.map(x=>x/g);
  if(z.every(x=>x===0n))throw new Error('zero kernel witness');
  return z;
}
function apply(matrix,v){return matrix.map(r=>r.reduce((s,x,j)=>s+BigInt(x)*v[j],0n));}
function sameBig(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}

export function atlasAdditiveCompressionCollision(matrix){
  const rows=matrix.length,cols=rows?matrix[0].length:0;
  if(cols===0||rows>=cols)return freeze({valid:false,reason:'requires m<d',rows,cols});
  const z=rationalKernel(matrix);if(!z)return freeze({valid:false,reason:'no kernel witness',rows,cols});
  const plus=z.map(x=>x>0n?x:0n),minus=z.map(x=>x<0n?-x:0n);
  const yp=apply(matrix,plus),ym=apply(matrix,minus);
  const distinct=!sameBig(plus,minus),equal=sameBig(yp,ym);
  return freeze({
    valid:distinct&&equal,
    rows,cols,
    kernel:z.map(String),
    positive:plus.map(String),
    negative:minus.map(String),
    positive_readout:yp.map(String),
    negative_readout:ym.map(String),
  });
}

function cantorPair(a,b){a=BigInt(a);b=BigInt(b);const s=a+b;return s*(s+1n)/2n+b;}
export function atlasCantorTupleCode(values){
  let out=0n;for(const v of values)out=cantorPair(out,BigInt(v));return out.toString();
}
function generatedMatrix(rows,variant,cols=7){
  return Array.from({length:rows},(_,i)=>Array.from({length:cols},(_,j)=>(((i+1)*(j+2)+(variant+1)*(j+1)*(j+1))%7)-3));
}
function deletionProjection(drop,d=7){
  const rows=[];for(let i=0;i<d;i++)if(i!==drop)rows.push(Array.from({length:d},(_,j)=>i===j?1:0));return rows;
}

export function atlasMinimalAdditiveReceiverRankCertificate(){
  if(cached)return cached;
  const parent=atlasStratifiedReceiverIrreducibilityCertificate();
  const parentExact=parent.passed===true&&ATLAS_STRATIFIED_RECEIVER_IRREDUCIBILITY_SCHEMA==='td613.dome-world.atlas-stratified-receiver-irreducibility/v0.1';
  const profiles={};let transformFailures=0;
  for(let n=1;n<=5;n++){
    const A=transformMatrix(n),d=(1<<n)-1,C=n,W=n*(n-1)/2,H=d-C-W;
    const unit=isUnitUpperTriangular(A),det=detBareiss(A);
    if(A.length!==d||A.some(r=>r.length!==d)||!unit||det!==1n)transformFailures++;
    profiles[n]=freeze({dimension:d,capacity_channels:C,pair_channels:W,high_channels:H,determinant:Number(det),unit_upper_triangular:unit});
  }
  let hostileMatrices=0,hostileFailures=0;
  for(let m=1;m<=6;m++)for(let v=0;v<7;v++){
    hostileMatrices++;if(!atlasAdditiveCompressionCollision(generatedMatrix(m,v)).valid)hostileFailures++;
  }
  let deletionFailures=0;for(let drop=0;drop<7;drop++)if(!atlasAdditiveCompressionCollision(deletionProjection(drop)).valid)deletionFailures++;
  const scalarCodes=new Set();for(let mask=0;mask<128;mask++)scalarCodes.add(atlasCantorTupleCode(Array.from({length:7},(_,i)=>(mask>>i)&1)));
  const expected={
    1:{dimension:1,capacity_channels:1,pair_channels:0,high_channels:0,determinant:1},
    2:{dimension:3,capacity_channels:2,pair_channels:1,high_channels:0,determinant:1},
    3:{dimension:7,capacity_channels:3,pair_channels:3,high_channels:1,determinant:1},
    4:{dimension:15,capacity_channels:4,pair_channels:6,high_channels:5,determinant:1},
    5:{dimension:31,capacity_channels:5,pair_channels:10,high_channels:16,determinant:1},
  };
  const profileValues=Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,{dimension:v.dimension,capacity_channels:v.capacity_channels,pair_channels:v.pair_channels,high_channels:v.high_channels,determinant:v.determinant}]));
  const exact=parentExact&&JSON.stringify(profileValues)===JSON.stringify(expected)&&transformFailures===0&&hostileMatrices===42&&hostileFailures===0&&deletionFailures===0&&scalarCodes.size===128;
  cached=freeze({
    schema:ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_SCHEMA,
    parent_receipt:ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_PARENT_RECEIPT,
    parent_exact:parentExact,
    profiles:freeze(profiles),
    transform_failures:transformFailures,
    hostile_generated_matrices:hostileMatrices,
    hostile_collision_failures:hostileFailures,
    coordinate_deletion_controls:7,
    coordinate_deletion_failures:deletionFailures,
    nonlinear_scalar_control:{boolean_states:128,unique_codes:scalarCodes.size,injective_on_boolean_cube:scalarCodes.size===128},
    laws:freeze({
      support_dimension_formula:'d_n = 2^n - 1',
      full_receiver_is_unimodular_change_of_integer_basis:true,
      additive_integer_receiver_below_dimension_has_kernel_collision:true,
      minimal_additive_scalar_rank_formula:'r_add(n) = 2^n - 1',
      minimal_bit_length_claimed:false,
      shannon_lower_bound_claimed:false,
      arbitrary_nonlinear_coordinate_lower_bound_claimed:false,
      nonlinear_one_scalar_injection_control_present:true,
      physical_sensor_minimality_claimed:false,
    }),
    membranes:freeze([
      'MINIMAL_ADDITIVE_SCALAR_RANK != MINIMAL_BIT_LENGTH',
      'MINIMAL_ADDITIVE_SCALAR_RANK != SHANNON_LOWER_BOUND',
      'INTEGER_LINEAR_LOWER_BOUND != ARBITRARY_NONLINEAR_CODING_LOWER_BOUND',
      'UNIMODULAR_RECEIVER != UNIVERSAL_OPTIMAL_COMPRESSION',
      'CANTOR_PAIRING_CONTROL != PRACTICAL_COMPRESSION_SCHEME',
      'SUPPORT_MULTIPLICITY_MODULE != HISTORICAL_SOURCE_IDENTITY',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_MINIMAL_ADDITIVE_RECEIVER_RANK_CERTIFICATE=atlasMinimalAdditiveReceiverRankCertificate();
