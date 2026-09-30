import {
  ATLAS_HNF_ORBIT_CENSUS_SCHEMA,
  atlasHnfOrbitCount,
  atlasHnfOrbitCensusCertificate,
} from './atlas-hnf-orbit-census.js';

export const ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_SCHEMA='td613.dome-world.atlas-prime-power-gaussian-binomial/v0.1';
export const ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_PARENT_RECEIPT='497517001bc7a513f24aa91c9fe8fdf55b390b4a';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};

function validateDK(d,k){if(!Number.isInteger(d)||d<1||!Number.isInteger(k)||k<0)throw new Error('requires integer d>=1 and k>=0');}
function validateQ(q){q=BigInt(q);if(q<2n)throw new Error('requires integer q>=2');return q;}

export function atlasGaussianBinomialPrimePower(d,k,q){
  validateDK(d,k);q=validateQ(q);
  if(k===0)return '1';
  let numerator=1n,denominator=1n;
  for(let i=1;i<=k;i++){
    numerator*=q**BigInt(d+i-1)-1n;
    denominator*=q**BigInt(i)-1n;
  }
  if(numerator%denominator!==0n)throw new Error('Gaussian-binomial product failed exact divisibility');
  return (numerator/denominator).toString();
}

export function atlasPrimePowerCompositionCount(d,k,p){
  validateDK(d,k);p=validateQ(p);
  let coeff=Array(k+1).fill(0n);coeff[0]=1n;
  for(let j=0;j<d;j++){
    const weight=p**BigInt(j),next=Array(k+1).fill(0n);
    for(let used=0;used<=k;used++)if(coeff[used]!==0n){
      let power=1n;
      for(let e=0;used+e<=k;e++){next[used+e]+=coeff[used]*power;power*=weight;}
    }
    coeff=next;
  }
  return coeff[k].toString();
}

export function atlasGaussianRecurrenceCount(d,k,p){
  validateDK(d,k);p=validateQ(p);
  const memo=new Map();
  function G(dd,kk){
    if(kk===0||dd===1)return 1n;
    const key=`${dd}:${kk}`;if(memo.has(key))return memo.get(key);
    const value=G(dd-1,kk)+(p**BigInt(dd-1))*G(dd,kk-1);
    memo.set(key,value);return value;
  }
  return G(d,k).toString();
}

function factorPrimePowers(N){
  N=BigInt(N);if(N<1n)throw new Error('requires N>=1');
  const out=[];let rem=N,p=2n;
  while(p*p<=rem){
    if(rem%p===0n){let k=0;while(rem%p===0n){rem/=p;k++;}out.push([p,k]);}
    p=p===2n?3n:p+2n;
  }
  if(rem>1n)out.push([rem,1]);
  return out;
}

export function atlasGaussianPrimeFactorOrbitCount(d,N){
  if(!Number.isInteger(d)||d<1)throw new Error('requires integer d>=1');
  let value=1n;
  for(const [p,k] of factorPrimePowers(N))value*=BigInt(atlasGaussianBinomialPrimePower(d,k,p));
  return value.toString();
}

export function atlasPrimePowerGaussianBinomialCertificate(){
  if(cached)return cached;
  const parent=atlasHnfOrbitCensusCertificate();
  const parentExact=parent.passed===true&&ATLAS_HNF_ORBIT_CENSUS_SCHEMA==='td613.dome-world.atlas-hnf-orbit-census/v0.1';
  const expected={
    d2p2:['1','3','7','15','31','63'],
    d3p2:['1','7','35','155','651','2667'],
    d7p2:['1','127','10795','788035','53743987','3548836819'],
    d7p3:['1','1093','896260','678468820','500777836042','366573514642546'],
  };
  let localControls=0,localFailures=0,symmetryControls=0,symmetryFailures=0;
  const profiles={};
  for(const d of [1,2,3,7])for(const p of [2,3,5,7]){
    const row=[];
    for(let k=0;k<=5;k++){
      localControls++;
      const g=atlasGaussianBinomialPrimePower(d,k,p),c=atlasPrimePowerCompositionCount(d,k,p),r=atlasGaussianRecurrenceCount(d,k,p);
      row.push(g);if(g!==c||g!==r)localFailures++;
      symmetryControls++;
      if(g!==atlasGaussianBinomialPrimePower(k+1,d-1,p))symmetryFailures++;
    }
    profiles[`d${d}p${p}`]=freeze(row);
  }
  if(JSON.stringify(profiles.d2p2)!==JSON.stringify(expected.d2p2))localFailures++;
  if(JSON.stringify(profiles.d3p2)!==JSON.stringify(expected.d3p2))localFailures++;
  if(JSON.stringify(profiles.d7p2)!==JSON.stringify(expected.d7p2))localFailures++;
  if(JSON.stringify(profiles.d7p3)!==JSON.stringify(expected.d7p3))localFailures++;

  let globalControls=0,globalFailures=0;
  for(let d=1;d<=5;d++)for(let N=1;N<=128;N++){
    globalControls++;
    if(atlasGaussianPrimeFactorOrbitCount(d,N)!==atlasHnfOrbitCount(d,N))globalFailures++;
  }

  const exact=parentExact&&localControls===96&&localFailures===0&&symmetryControls===96&&symmetryFailures===0&&globalControls===640&&globalFailures===0;
  cached=freeze({
    schema:ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_SCHEMA,
    parent_receipt:ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_PARENT_RECEIPT,
    parent_exact:parentExact,
    profiles:freeze(profiles),
    local_controls:localControls,
    local_failures:localFailures,
    gaussian_symmetry_controls:symmetryControls,
    gaussian_symmetry_failures:symmetryFailures,
    global_prime_factor_controls:globalControls,
    global_prime_factor_failures:globalFailures,
    laws:freeze({
      prime_power_formula:'a_d(p^k) = GaussianBinomial(d+k-1,k;p)',
      gaussian_product:'product_{i=1}^k (p^(d+i-1)-1)/(p^i-1)',
      recurrence:'G(d,k)=G(d-1,k)+p^(d-1)G(d,k-1)',
      global_factorization:'a_d(N)=product_{p^k||N} GaussianBinomial(d+k-1,k;p)',
      finite_grassmannian_cardinality_identity:true,
      canonical_grassmannian_bijection_claimed:false,
      input_output_duality_claimed:false,
      physical_prime_factorization_claimed:false,
    }),
    membranes:freeze([
      'GAUSSIAN_BINOMIAL_CARDINALITY != CANONICAL_GRASSMANNIAN_BIJECTION',
      'PRIME_LOCAL_FACTORIZATION != INDEPENDENT_PHYSICAL_CHANNEL_FACTORIZATION',
      'Q_BINOMIAL_SYMMETRY != INPUT_OUTPUT_DUALITY',
      'FINITE_FIELD_ENUMERATIVE_IDENTITY != FINITE_FIELD_REALIZATION_OF_RECEIVERS',
      'LOCAL_FACTOR_PRODUCT != SHANNON_INFORMATION_DECOMPOSITION',
      'ARITHMETIC_PRIME != PHYSICAL_FREQUENCY_OR_SENSOR_PRIME',
      'METALLURGICAL_OR_ALCHEMICAL_RESONANCE != PROOF',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_CERTIFICATE=atlasPrimePowerGaussianBinomialCertificate();
