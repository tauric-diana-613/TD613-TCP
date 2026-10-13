import {
  ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_SCHEMA,
  atlasHnfOutputBasisClassificationCertificate,
} from './atlas-hnf-output-basis-classification.js';

export const ATLAS_HNF_ORBIT_CENSUS_SCHEMA='td613.dome-world.atlas-hnf-orbit-census/v0.1';
export const ATLAS_HNF_ORBIT_CENSUS_PARENT_RECEIPT='445f84887306be89cf2167f66fe26c3162daff18';

let cached=null;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const gcd=(a,b)=>{a=BigInt(a);b=BigInt(b);while(b!==0n)[a,b]=[b,a%b];return a<0n?-a:a;};

function orderedFactorTuples(d,N){
  N=BigInt(N);
  if(!Number.isInteger(d)||d<1||N<1n)throw new Error('requires d>=1 and N>=1');
  const out=[];
  function rec(pos,rem,prefix){
    if(pos===d-1){out.push([...prefix,rem]);return;}
    for(let h=1n;h<=rem;h++)if(rem%h===0n)rec(pos+1,rem/h,[...prefix,h]);
  }
  rec(0,N,[]);
  return out;
}
function tupleWeight(tuple){return tuple.reduce((w,h,i)=>w*(h**BigInt(i)),1n);}

export function atlasHnfOrbitCount(d,N){
  return orderedFactorTuples(d,N).reduce((s,t)=>s+tupleWeight(t),0n).toString();
}

function localCoefficient(d,p,k){
  p=BigInt(p);
  let coeff=Array(k+1).fill(0n);coeff[0]=1n;
  for(let j=0;j<d;j++){
    const q=p**BigInt(j),next=Array(k+1).fill(0n);
    for(let a=0;a<=k;a++)if(coeff[a]!==0n){
      let power=1n;
      for(let r=0;a+r<=k;r++){next[a+r]+=coeff[a]*power;power*=q;}
    }
    coeff=next;
  }
  return coeff[k];
}
function profile(d,maxN){return Array.from({length:maxN},(_,i)=>atlasHnfOrbitCount(d,i+1));}

export function atlasHnfOrbitCensusCertificate(){
  if(cached)return cached;
  const parent=atlasHnfOutputBasisClassificationCertificate();
  const parentExact=parent.passed===true&&ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_SCHEMA==='td613.dome-world.atlas-hnf-output-basis-classification/v0.1';
  const expected={
    1:['1','1','1','1','1','1','1','1'],
    2:['1','3','4','7','6','12','8','15'],
    3:['1','7','13','35','31','91','57','155'],
    7:['1','127','1093','10795','19531','138811','137257','788035'],
  };
  const profiles={};let profileFailures=0;
  for(const d of [1,2,3,7]){
    profiles[d]=freeze(profile(d,8));
    if(JSON.stringify(profiles[d])!==JSON.stringify(expected[d]))profileFailures++;
  }

  const pairs=[];for(let m=1;m<=12;m++)for(let n=m;n<=12;n++)if(gcd(BigInt(m),BigInt(n))===1n)pairs.push([m,n]);
  let multiplicativityControls=0,multiplicativityFailures=0;
  for(let d=1;d<=5;d++)for(const [m,n] of pairs){
    multiplicativityControls++;
    const lhs=BigInt(atlasHnfOrbitCount(d,m*n));
    const rhs=BigInt(atlasHnfOrbitCount(d,m))*BigInt(atlasHnfOrbitCount(d,n));
    if(lhs!==rhs)multiplicativityFailures++;
  }

  let localControls=0,localFailures=0;
  for(const p of [2,3,5])for(let d=1;d<=5;d++)for(let k=0;k<=4;k++){
    localControls++;
    const lhs=BigInt(atlasHnfOrbitCount(d,BigInt(p)**BigInt(k)));
    const rhs=localCoefficient(d,p,k);
    if(lhs!==rhs)localFailures++;
  }
  const nonComplete=atlasHnfOrbitCount(2,4)==='7'&&BigInt(atlasHnfOrbitCount(2,2))**2n===9n;
  const exact=parentExact&&profileFailures===0&&pairs.length===46&&multiplicativityControls===230&&multiplicativityFailures===0&&localControls===75&&localFailures===0&&nonComplete;
  cached=freeze({
    schema:ATLAS_HNF_ORBIT_CENSUS_SCHEMA,
    parent_receipt:ATLAS_HNF_ORBIT_CENSUS_PARENT_RECEIPT,
    parent_exact:parentExact,
    profiles:freeze(profiles),
    profile_failures:profileFailures,
    coprime_pairs_per_dimension:pairs.length,
    multiplicativity_controls:multiplicativityControls,
    multiplicativity_failures:multiplicativityFailures,
    prime_power_controls:localControls,
    prime_power_failures:localFailures,
    non_complete_multiplicativity_control:freeze({a_2_4:'7',a_2_2_squared:'9',passed:nonComplete}),
    laws:freeze({
      orbit_count_formula:'a_d(N)=sum_{h_1...h_d=N} h_2 h_3^2 ... h_d^(d-1)',
      dirichlet_convolution:'a_d = 1 * id * id^2 * ... * id^(d-1)',
      multiplicative:true,
      completely_multiplicative:false,
      formal_dirichlet_series:'product_{j=0}^{d-1} zeta(s-j)',
      local_prime_power_series:'product_{j=0}^{d-1} (1-p^j t)^(-1)',
      raw_receiver_count_claimed:false,
      analytic_continuation_claimed:false,
      shannon_claimed:false,
    }),
    membranes:freeze([
      'HNF_ORBIT_COUNT != RAW_RECEIVER_COUNT',
      'MULTIPLICATIVE != COMPLETELY_MULTIPLICATIVE',
      'FORMAL_DIRICHLET_FACTOR != ANALYTIC_CONTINUATION_CLAIM',
      'SUBLATTICE_INDEX != SHANNON_INFORMATION',
      'OUTPUT_BASIS_ORBIT_CENSUS != INPUT_SUPPORT_RELABELING_CENSUS',
      'ARITHMETIC_CENSUS != PHYSICAL_SENSOR_MULTIPLICITY',
      'METALLURGICAL_REFINEMENT_METAPHOR != ARITHMETIC_PROOF',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_HNF_ORBIT_CENSUS_CERTIFICATE=atlasHnfOrbitCensusCertificate();
