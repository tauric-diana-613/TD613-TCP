# A15-R0 · Atlas Stratified Receiver Irreducibility · Preregistration v0.1

Parent authority: exact earned #946 / `d96a694cafa86d439a47073a581cad1bcc71a8c2` / TD613 Consolidated Validation run 2425 / 33534480656 SUCCESS / A15-R0 step 19 SUCCESS.

## Question

The earned #946 receiver reconstructs every nonempty incidence-support multiplicity from three retained strata:

- `C`: block capacities `c_i`;
- `W`: weighted pair intersections `w_ij`;
- `H`: exact support multiplicities `mu(S)` for every `|S|>=3`.

Are those three strata merely sufficient, or is each individually indispensable for universal exact reconstruction?

## Three-block algebraic control

Order the nonempty support multiplicities as

`mu=(mu_1,mu_2,mu_3,mu_12,mu_13,mu_23,mu_123)`.

Order the receiver as

`Phi(mu)=(c_1,c_2,c_3,w_12,w_13,w_23,mu_123)`.

The preregistered transform matrix is

```text
1 0 0 1 1 0 1
0 1 0 1 0 1 1
0 0 1 0 1 1 1
0 0 0 1 0 0 1
0 0 0 0 1 0 1
0 0 0 0 0 1 1
0 0 0 0 0 0 1
```

Expected determinant: `1`.

Expected integer inverse:

```text
1 0 0 -1 -1  0  1
0 1 0 -1  0 -1  1
0 0 1  0 -1 -1  1
0 0 0  1  0  0 -1
0 0 0  0  1  0 -1
0 0 0  0  0  1 -1
0 0 0  0  0  0  1
```

Thus the full three-stratum transform is expected to be unimodular over the integer support lattice.

## Complete Boolean support cube

Exhaust every `mu in {0,1}^7`: exactly 128 labeled incidence-support states.

For every subset of retained strata from `{C,W,H}`, partition the 128 states by receiver signature.

Preregistered quotient census:

```text
receiver  classes  max_fiber  fiber-size frequency
∅           1        128       {128:1}
C          59          8       {1:32,2:12,4:6,5:8,8:1}
W          15         16       {8:14,16:1}
H           2         64       {64:2}
C+W       127          2       {1:126,2:1}
C+H        80          4       {1:52,2:12,3:12,4:4}
W+H        16          8       {8:16}
C+W+H     128          1       {1:128}
```

## Exact omission witnesses

Capacity omission (`W+H` collision):

```text
A = [0,0,0,0,0,0,0]
B = [1,0,0,0,0,0,0]
```

Pair-weight omission (`C+H` collision):

```text
A = [0,0,1,1,0,0,0]   # mu_3=1, mu_12=1
B = [0,1,0,0,1,0,0]   # mu_2=1, mu_13=1
```

High-support omission (`C+W` unique collision):

```text
A = [0,0,0,1,1,1,0]   # three pair-only elements
B = [1,1,1,0,0,0,1]   # one triple element + three private elements
```

The last pair must be the unique non-singleton fiber under `C+W` over the Boolean cube.

## Candidate bounded 𝄐

`THE_EARNED_WEIGHTED_MOBIUS_RECEIVER_HAS_THREE_JOINTLY_SUFFICIENT_AND_INDIVIDUALLY_INDISPENSABLE_INFORMATION_STRATA: ON_THREE_LABELED_BLOCKS_THE_C_W_H_TRANSFORM_IS_UNIMODULAR_WITH_DETERMINANT_ONE, AND_ON_THE_COMPLETE_128_STATE_BOOLEAN_SUPPORT_CUBE_THE_FULL_RECEIVER_IS_INJECTIVE_WHILE_EVERY_ONE_STRATUM_DELETION_HAS_A_NONTRIVIAL_COLLISION; THEREFORE_CAPACITIES_PAIR_WEIGHTS_AND_HIGH_SUPPORT_MULTIPLICITIES_CANNOT_BE_DROPPED_FROM_THE_GENERAL_RECEIVER_WHILE_PRESERVING_UNIVERSAL_EXACT_RECONSTRUCTION.`

## Mandatory membranes

- `STRATUM_INDISPENSABILITY != BITWISE_MINIMAL_ENCODING`.
- `UNIMODULAR_THREE_BLOCK_TRANSFORM != UNIVERSAL_OPTIMAL_COMPRESSION`.
- `FINITE_BOOLEAN_CUBE_CENSUS != SHANNON_LOWER_BOUND`.
- `COORDINATE_NECESSITY != PHYSICAL_SENSOR_NECESSITY`.
- `LABELED_BLOCK_STRATA != SECURITY_PERMISSION_LAYERS`.
- `SUPPORT_RECONSTRUCTION != HISTORICAL_SOURCE_IDENTITY`.
- `MOBIUS_INVERSION != CAUSAL_INVERSION`.
- `ATLAS_REGISTRATION != LIVE_RUNTIME_STATE`.
- `A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION`.
- `SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`.

No merge/deploy/release/publication/production/Vercel authority.

Sealed ⟐