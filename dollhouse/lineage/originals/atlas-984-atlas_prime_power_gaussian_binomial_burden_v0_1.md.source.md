# A15-R0 · Atlas Prime-Power Gaussian-Binomial Census · Burden v0.1

Exact parent authority: #956 / `497517001bc7a513f24aa91c9fe8fdf55b390b4a`.

## Algebraic derivation

At prime-power index `p^k`, every HNF diagonal has the form

`h_j=p^(e_j)`, with `e_1+...+e_d=k`.

The earned HNF residue freedom contributes

`h_2 h_3^2 ... h_d^(d-1)=p^(e_2+2e_3+...+(d-1)e_d)`.

Therefore

`a_d(p^k)=sum_{e_1+...+e_d=k} p^(sum_{j=1}^d (j-1)e_j)`.

This is the complete homogeneous symmetric polynomial `h_k(1,p,...,p^(d-1))`; its generating function is

`product_{j=0}^{d-1}(1-p^j t)^(-1)`.

The finite q-binomial theorem gives

`a_d(p^k)=[d+k-1 choose k]_p=product_{i=1}^k (p^(d+i-1)-1)/(p^i-1)`.

The chamber must verify this identity executablely rather than merely naming the q-binomial theorem.

## Exact executable burden

- 96 preregistered local controls: `d in {1,2,3,7}`, `p in {2,3,5,7}`, `k=0..5`.
- Every local control compares three routes: composition sum, Gaussian product, recurrence.
- 84 hostile composition controls: `d=1..4`, `p in {2,3,5}`, `k=0..6`.
- 640 global controls: `d=1..5`, `N=1..128`; prime-factor Gaussian product must equal the earned parent `a_d(N)`.
- Gaussian symmetry must hold numerically while the certificate explicitly refuses to infer input/output duality or a receiver-subspace bijection.
- Product divisions must be exact in BigInt.
- No floating point arithmetic may participate in theorem equality.

## Anchor values

`d=2,p=2,k=0..5: 1,3,7,15,31,63`.

`d=3,p=2,k=0..5: 1,7,35,155,651,2667`.

`d=7,p=2,k=0..5: 1,127,10795,788035,53743987,3548836819`.

`d=7,p=3,k=0..5: 1,1093,896260,678468820,500777836042,366573514642546`.

## Bounded candidate 𝄐

`FOR_EVERY_D_AT_LEAST_ONE_PRIME_P_AND_K_AT_LEAST_ZERO_THE_EARNED_HNF_OUTPUT_BASIS_ORBIT_COUNT_AT_INDEX_P_TO_THE_K_EQUALS_THE_GAUSSIAN_BINOMIAL_D_PLUS_K_MINUS_ONE_CHOOSE_K_BASE_P; CONSEQUENTLY_THE_GLOBAL_INDEX_N_COUNT_IS_THE_PRODUCT_OF_THESE_PRIME_LOCAL_GAUSSIAN_FACTORS. THE_EQUALITY_WITH_FINITE_GRASSMANNIAN_CARDINALITY_IS_ENUMERATIVE_ONLY_AND_CLAIMS_NO_CANONICAL_BIJECTION.`

No merge/deploy/release/publication/production/Vercel/live authority.

Sealed ⟐