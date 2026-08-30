# A15-R0 · Finite Orientation-Fibre Transport-Opacity / Witness-Erasure Robustness — Execution Burden v0.1

Status: **FROZEN BEFORE THEOREM CODE**.

Exact earned parent: `faef60c732e057fe6c678fe4cc7ae7318192f694`.

## Canonical execution burden

The successor must consume the earned #884 witness rows and the earned #882 finite action without mutating either source.

For each witness class with `n<=20`, encode selected families as unsigned integer masks. For each nonidentity transport `g`, precompute a witness-separation mask

`D_g = { i : witness_i(g tau*) != witness_i(tau*) }`.

Then for selected mask `W`:

- `g in S_W` iff `(W & D_g)==0`;
- `mu_tr(W)=min_{g!=id} popcount(W & D_g)`;
- exact origin identification iff every nonidentity `g` is separated.

The implementation must still perform the preregistered **direct exact-erasure census**. Bit masks are an execution representation only; they may not replace direct deletion checks with the candidate criterion being tested.

Expected direct deletion burden for `e=0..4`:

```text
specialization comparability (n=20):
  1,048,576
  10,485,760
  49,807,360
  149,422,080
  317,521,920
  total 528,285,696

principal-open identity (n=5): 242 total
principal-open size     (n=5): 242 total
cut orientation        (n=10): 46,464 total

all classes: 528,332,644 exact deletion cases
```

These counts equal `C(n,e) 2^(n-e)` summed over e and are execution-ledger counts, not probabilistic weights.

## Direct-erasure algorithm requirement

For each selected family `W` and each `e<=min(4,|W|)`:

1. enumerate every e-element subset of the selected witness indices;
2. remove exactly those witnesses;
3. recompute whether all three nonidentity transports are excluded;
4. accumulate the exact deletion-case count;
5. record family survival only if every exact-e deletion survives;
6. compare that direct result against `mu_tr(W)>=e+1`;
7. any mismatch is a theorem RED.

The code may use specialized loops for e=0,1,2,3,4 and 32-bit masks to control runtime. It may not probabilistically sample deletion families.

## Residual transport vs setwise stabilizer burden

For every selected family:

1. derive residual topology cell `F_W` from inherited witness values;
2. derive `S_W={g:g tau* in F_W}` from the parent action;
3. independently derive `Stab_G(F_W)={g:gF_W=F_W}`;
4. compare exact element sets, not only cardinalities;
5. preserve at least one explicit counterexample when unequal.

The preregistered machine expectation is 576 unequal families in the comparability class and zero in the other three classes. A different executed count is a scientific RED, not an invitation to edit the expectation after theorem code.

## Independent hostile burden

Before importing the child certificate, the hostile must independently:

- reconstruct the four earned #882 compatible topologies and all 16 action rows from the #882 parent certificate;
- reconstruct all four #884 witness classes from earned #884 rows;
- rebuild the three nonidentity separation masks;
- enumerate all selected witness families independently;
- recompute exact-family counts, `mu_tr` spectra, robust-family counts from separation multiplicity, minimum-width ladders, and residual-transport/setwise-stabilizer difference counts;
- verify the direct deletion-case ledger combinatorially as `C(n,e)2^(n-e)`;
- only then import the child certificate and compare the full frozen summary.

The hostile does not need to repeat all 528,332,644 direct deletion operations; independence comes from reconstructing the finite action/witness algebra and deriving the robustness summary before child import. The canonical implementation bears the complete direct-erasure burden.

## Hardening / custody burden

The final hardening commit must prove:

- exact parent receipt is an ancestor of the scientific head;
- at least seven scientific successor commits exist after the parent;
- exactly seven live successor paths are changed: preregistration, expectations, burden, implementation, canonical contract, hostile contract, rolling hardening;
- no inherited A15-R0 theorem-source path is mutated;
- canonical and hostile contracts are imported by rolling A15-R0 hardening;
- witness-routing PRs remain zero-authority and MUST NOT MERGE.

## Mandatory membranes

`DIRECT_ERASURE_CENSUS != STOCHASTIC_NOISE_MODEL`

`TRANSPORT_OPACITY != PHYSICAL_OCCLUSION`

`RESIDUAL_TRANSPORT_SET != SETWISE_STABILIZER`

`TRANSPORT_SEPARATING_RANK != ACTION_GENERATING_RANK`

`WITNESS_ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY`

`FINITE_HAMMING_COUNT != SHANNON_CAPACITY`

`METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS`

No merge, deployment, publication, production, release, Vercel, physical gauge theory, channel-capacity theorem, or source-state mutation follows.

Sealed ⟐