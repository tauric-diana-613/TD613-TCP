import assert from 'node:assert/strict';
import {
  ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_SCHEMA,
  ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_PARENT_RECEIPT,
  atlasGaussianBinomialPrimePower,
  atlasPrimePowerGaussianBinomialCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-prime-power-gaussian-binomial.js';

const c=atlasPrimePowerGaussianBinomialCertificate();
assert.equal(ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_SCHEMA,'td613.dome-world.atlas-prime-power-gaussian-binomial/v0.1');
assert.equal(ATLAS_PRIME_POWER_GAUSSIAN_BINOMIAL_PARENT_RECEIPT,'497517001bc7a513f24aa91c9fe8fdf55b390b4a');
assert.equal(c.parent_exact,true);
assert.equal(c.local_controls,96);
assert.equal(c.local_failures,0);
assert.equal(c.gaussian_symmetry_controls,96);
assert.equal(c.gaussian_symmetry_failures,0);
assert.equal(c.global_prime_factor_controls,640);
assert.equal(c.global_prime_factor_failures,0);
assert.deepEqual(c.profiles.d2p2,['1','3','7','15','31','63']);
assert.deepEqual(c.profiles.d3p2,['1','7','35','155','651','2667']);
assert.deepEqual(c.profiles.d7p2,['1','127','10795','788035','53743987','3548836819']);
assert.deepEqual(c.profiles.d7p3,['1','1093','896260','678468820','500777836042','366573514642546']);
assert.equal(atlasGaussianBinomialPrimePower(7,3,2),'788035');
assert.equal(c.laws.finite_grassmannian_cardinality_identity,true);
assert.equal(c.laws.canonical_grassmannian_bijection_claimed,false);
assert.equal(c.laws.input_output_duality_claimed,false);
assert.equal(c.laws.physical_prime_factorization_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas prime-power Gaussian-binomial canonical tests passed.');
