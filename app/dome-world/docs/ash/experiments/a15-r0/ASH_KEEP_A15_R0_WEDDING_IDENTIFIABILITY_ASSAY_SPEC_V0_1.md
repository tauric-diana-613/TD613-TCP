𝌋‌

# Ash Keep A15-R0 Wedding Identifiability Assay Specification v0.1

**Namespace:** U+10D613 — Tauric Diana 613  
**Program:** Ash Keep A15-R0 phase-free research frontier  
**Status:** AUTHORED / NONCANONICAL / SYNTHETIC ASSAY SPEC / NO PRODUCTION AUTHORITY  
**Sequence authority:** false  
**Next stage:** null  
**A16 admission:** false  
**Proto-Loom implementation:** false  
**Holonomy / Berry / quantum claim:** false

## 0. Purpose

This specification admits one executable synthetic positive-control assay for the question opened in the identifiability / tomography frontier docket:

> Can an instrument distinguish genuine cross-probe relational identifiability from mere observation-count gain?

It does **not** test the physical or production TD613 `D3 + phi + M` architecture. It validates only whether the assay machinery can detect a deliberately constructed three-probe dependency, reject a redundant negative control, and lose the gain when cross-probe relations are destroyed while marginal probe distributions are preserved.

Therefore:

```text
positive synthetic fixture passes
!= TD613 triple synergy established
!= quasiperiodic anti-aliasing established
!= emergent measurement capacity established
!= curvature / holonomy / quantum geometry
```

## 1. Declared latent family

Use the finite state family

```text
S(a,b,t),  a,b,t in Z3
```

for exactly 27 latent states.

No coordinate is assigned physical meaning.

The three abstract probe families are named only by epistemic role:

```text
D = reference probe
Q = structured-nonclosure probe
M = relational probe
```

For the positive-control fixture define the forward map:

```text
D(S) = a
Q(S) = b
M(S) = (t - a - b) mod 3
```

so that:

```text
t = (D + Q + M) mod 3
```

Each individual probe remains marginally balanced over `Z3`. Any single or pair leaves multiple materially distinct latent states admissible; the intact triple uniquely identifies the declared state in the noiseless fixture.

This construction is a deliberately engineered three-way relational code. Its success is a calibration of the assay, not evidence that the live TD613 architecture possesses the same relation.

## 2. Matched observation budget

Every comparison receives the same raw observation budget `B = 12`.

Allocate repetitions evenly across active probe families:

```text
single: 12
pair:   6 + 6
triple: 4 + 4 + 4
```

The comparison set is:

```text
D
Q
M
D+Q
D+M
Q+M
D+Q+M
relationship-shuffled(D+Q+M)
```

The assay must report both exact/noiseless ambiguity and a seeded categorical-noise reconstruction trial.

## 3. Relationship-shuffled hostile control

Construct a deterministic permutation of the `M` outputs across latent-state identities while preserving the complete marginal `M` histogram.

The shuffled control must preserve:

```text
state count
probe count
observation budget
noise model
D marginal
Q marginal
M marginal
reconstruction algorithm
```

while destroying the authored cross-state alignment between `D`, `Q`, `M`, and the true latent identity.

If the intact triple and shuffled triple perform equivalently, the declared relation has not demonstrated relational identifiability gain.

## 4. Redundant negative control

Use the same 27 latent states and matched budgets, but replace the relational probe with:

```text
M_redundant(S) = a
```

The hidden coordinate `t` is then unrecoverable from the declared observations.

The assay must refuse to label this triple as an identifiability gain merely because three probe channels are present.

## 5. Reconstruction metrics

### 5.1 Exact candidate ambiguity

For each latent state and condition, compute the set of states consistent with the observed active-probe signature.

Report at minimum:

```text
exact_unique_recovery_rate
mean_candidate_set_size
maximum_candidate_set_size
```

### 5.2 Noisy reconstruction

Use a deterministic seeded categorical substitution model over `Z3` with declared noise rate and trial count.

Decode using the same fixed candidate family and minimum mismatch over the repeated matched-budget observations.

Ties are ambiguity, not success.

Report:

```text
noisy_exact_recovery_rate
ambiguous_decode_rate
wrong_unique_decode_rate
```

No learned model, optimizer, or hidden state is permitted in v0.1.

## 6. Admission test

The assay machinery passes its own positive/negative-control calibration only if all are true:

```text
positive intact triple exact recovery > best positive pair
positive intact triple noisy recovery > best positive pair
positive intact triple noisy recovery > relationship-shuffled triple
relationship shuffle preserves all declared probe marginals
redundant negative-control triple does not outperform its best pair
promotion_authority = false
```

This condition may validate the **assay mechanism** only.

It must not mutate `H_TRIPLE_IDENTIFIABILITY_SYNERGY` from `OPEN_UNMEASURED` for the lab-authored TD613 architecture.

## 7. Claim ceiling

The highest admissible finding from v0.1 is:

> A finite deterministic synthetic assay can distinguish an authored three-probe relational identifiability dependency from matched single/pair baselines, a marginal-preserving relationship shuffle, and a redundant triple negative control under the declared decoder and noise model.

Forbidden promotions include:

```text
TD613 triple synergy proven
phi anti-aliasing proven
physical moire equivalence
partial-information-decomposition theorem
emergence theorem
latent geometry established
curvature
connection
holonomy
Berry phase / Berry curvature
quantum computation
materials realization
A16 authority
Proto-Loom authority
Golden Egg authority
```

## 8. Required receipt fields

The executable result must expose:

```text
schema
source_status = SIMULATED
fixture_class = DECLARED_SYNTHETIC_POSITIVE_AND_NEGATIVE_CONTROLS
authority_class = A2_DERIVATIONAL
state_count
probe_alphabet
observation_budget
noise_model
conditions
positive_control
negative_control
relationship_shuffle_marginals_preserved
assay_mechanism_validated
hypothesis_status = OPEN_UNMEASURED
promotion_authority = false
production_mutated = false
external_transmission = false
claim_ceiling
```

## 9. Exit law

Implementation may proceed only inside the existing A15-R0 research branch and test estate.

```text
assay implementation = permitted after this spec
production binding = forbidden
A16 admission = forbidden
research-stage succession = forbidden
browser witness requirement = none unless a browser surface is added
```

This assay is deliberately small enough to fail cheaply.

Sealed ⟐