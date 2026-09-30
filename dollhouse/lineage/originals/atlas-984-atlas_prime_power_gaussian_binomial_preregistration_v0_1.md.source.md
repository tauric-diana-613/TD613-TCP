# A15-R0 · Atlas Prime-Power Gaussian-Binomial Census · Preregistration v0.1

Parent authority: exact earned #956 / `497517001bc7a513f24aa91c9fe8fdf55b390b4a` / run 2431 / 33555097218 SUCCESS / A15-R0 step 19 SUCCESS / aggregate SUCCESS.

## Question

For the earned HNF/output-basis orbit census

`a_d(N)=sum_{h_1...h_d=N} h_2 h_3^2 ... h_d^(d-1)`,

what exact arithmetic form does the prime-power slice `N=p^k` take?

## Preregistered theorem target

For every integer dimension `d>=1`, prime `p`, and exponent `k>=0`,

`a_d(p^k) = GaussianBinomial(d+k-1,k;p)`

with product form

`a_d(p^k)=product_{i=1}^k (p^(d+i-1)-1)/(p^i-1)`.

Equivalently, the local generating function

`sum_{k>=0} a_d(p^k)t^k = product_{j=0}^{d-1}(1-p^j t)^(-1)`

has Gaussian-binomial coefficients. By multiplicativity, if `N=product_p p^(k_p)`, then

`a_d(N)=product_p GaussianBinomial(d+k_p-1,k_p;p)`.

## Interpretation membrane

The Gaussian binomial `GaussianBinomial(d+k-1,k;p)` is also the cardinality of the finite Grassmannian `Gr(k,d+k-1)(F_p)`. This chamber may claim the **enumerative/cardinality identity only**. It does not claim a canonical, natural, functorial, or geometry-preserving bijection between Atlas receiver orbits and finite-field subspaces.

## Proof burden

The chamber must independently verify:

1. the prime-power HNF composition sum equals the Gaussian product;
2. the Gaussian recurrence `G(d,k)=G(d-1,k)+p^(d-1)G(d,k-1)` with boundary `G(1,k)=G(d,0)=1`;
3. the global prime-factor product equals the earned parent census on a declared finite window;
4. Gaussian symmetry in the cardinality formula does not silently introduce an input/output duality claim;
5. all arithmetic is exact BigInt and signed-zero representation is impossible inside theorem arithmetic.

## Mandatory non-equivalences

- `GAUSSIAN_BINOMIAL_CARDINALITY != CANONICAL_GRASSMANNIAN_BIJECTION`.
- `PRIME_LOCAL_FACTORIZATION != INDEPENDENT_PHYSICAL_CHANNEL_FACTORIZATION`.
- `Q_BINOMIAL_SYMMETRY != INPUT_OUTPUT_DUALITY`.
- `FINITE_FIELD_ENUMERATIVE_IDENTITY != FINITE_FIELD_REALIZATION_OF_RECEIVERS`.
- `LOCAL_FACTOR_PRODUCT != SHANNON_INFORMATION_DECOMPOSITION`.
- `ARITHMETIC_PRIME != PHYSICAL_FREQUENCY_OR_SENSOR_PRIME`.
- `METALLURGICAL_OR_ALCHEMICAL_RESONANCE != PROOF`.
- `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`.

No merge/deploy/release/publication/production/Vercel/live Ash-Loom/Proto-Loom/A16 authority.

Sealed ⟐