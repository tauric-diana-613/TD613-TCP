import assert from 'node:assert/strict';
import {
  atlasGaussianBinomialPrimePower,
  atlasGaussianPrimeFactorOrbitCount,
  atlasPrimePowerGaussianBinomialCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-prime-power-gaussian-binomial.js';
import {atlasHnfOrbitCount} from '../app/dome-world/previews/a15-r0/atlas-hnf-orbit-census.js';

function bruteExponentCompositions(d,k,p){
  p=BigInt(p);let total=0n,states=0;
  function rec(j,remaining,weighted){
    if(j===d-1){total+=weighted*(p**(BigInt(j)*BigInt(remaining)));states++;return;}
    for(let e=0;e<=remaining;e++)rec(j+1,remaining-e,weighted*(p**(BigInt(j)*BigInt(e))));
  }
  rec(0,k,1n);return {total,states};
}

let compositionControls=0,totalCompositionStates=0,compositionFailures=0;
for(let d=1;d<=4;d++)for(const p of [2,3,5])for(let k=0;k<=6;k++){
  compositionControls++;
  const brute=bruteExponentCompositions(d,k,p);totalCompositionStates+=brute.states;
  const gaussian=BigInt(atlasGaussianBinomialPrimePower(d,k,p));
  if(brute.total!==gaussian)compositionFailures++;
}
assert.equal(compositionControls,84);
assert.equal(compositionFailures,0);
assert.ok(totalCompositionStates>84);

let globalControls=0,globalFailures=0;
for(let d=1;d<=4;d++)for(let N=1;N<=96;N++){
  globalControls++;
  if(atlasGaussianPrimeFactorOrbitCount(d,N)!==atlasHnfOrbitCount(d,N))globalFailures++;
}
assert.equal(globalControls,384);
assert.equal(globalFailures,0);

let symmetryControls=0;
for(const p of [2,3,5,7])for(let d=1;d<=7;d++)for(let k=0;k<=6;k++){
  symmetryControls++;
  assert.equal(atlasGaussianBinomialPrimePower(d,k,p),atlasGaussianBinomialPrimePower(k+1,d-1,p));
}
assert.equal(symmetryControls,196);

// Same cardinality statement must not be promoted into an unearned structural identification.
const cert=atlasPrimePowerGaussianBinomialCertificate();
for(const scar of [
  'GAUSSIAN_BINOMIAL_CARDINALITY != CANONICAL_GRASSMANNIAN_BIJECTION',
  'PRIME_LOCAL_FACTORIZATION != INDEPENDENT_PHYSICAL_CHANNEL_FACTORIZATION',
  'Q_BINOMIAL_SYMMETRY != INPUT_OUTPUT_DUALITY',
  'FINITE_FIELD_ENUMERATIVE_IDENTITY != FINITE_FIELD_REALIZATION_OF_RECEIVERS',
  'LOCAL_FACTOR_PRODUCT != SHANNON_INFORMATION_DECOMPOSITION',
  'ARITHMETIC_PRIME != PHYSICAL_FREQUENCY_OR_SENSOR_PRIME',
  'METALLURGICAL_OR_ALCHEMICAL_RESONANCE != PROOF',
])assert.equal(cert.membranes.includes(scar),true,`missing membrane: ${scar}`);
assert.equal(cert.laws.canonical_grassmannian_bijection_claimed,false);
assert.equal(cert.passed,true);

console.log(`Ash A15-R0 Atlas prime-power Gaussian-binomial hostile tests passed (${totalCompositionStates} brute exponent compositions).`);
