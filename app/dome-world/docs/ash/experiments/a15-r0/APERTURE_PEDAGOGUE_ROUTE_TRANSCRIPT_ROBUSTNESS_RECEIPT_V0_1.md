# A15-R0 · Aperture × Pedagogue Route-Transcript Robustness Receipt v0.1

𝌋 TD613 · Tauric Diana 613

**Status:** WITNESSED / BOUNDED SYNTHETIC RESULT / NO PROMOTION AUTHORITY  
**Scientific parent:** PR #707 receipt head `240096ce2c42446020a4b69b242be6f3b8f5682c`  
**Witness source head:** `a492e805baf0e85287754fcdcbedf113007015e0`  
**Workflow:** `TD613 Consolidated Validation`  
**Run:** `32673493614` · run number `2064`  
**Static contract job:** `97277844405`  
**Outcome:** SUCCESS  
**Browser witness requirement:** not scope-required; browser/full-repository/self-hosted witness lanes were not used as scientific evidence for this assay.

---

## 1. What was preregistered

The assay asks whether the route-conditioned action-indexed transcript distinction from PR #707 survives a declared shared family of commuting additive transition magnitudes plus deterministic bounded measurement error while common-endpoint equivalence is certified over the whole declared family.

Primary family:

```text
alpha ∈ [0.9, 1.1]
beta  ∈ [1.8, 2.2]
eta   = 0.05
observation timing = sample_before_transition
```

The two route orders use the same `(alpha,beta)` pair and the authored affine transition grammar gives

```text
T_AB(alpha,beta) = T_BA(alpha,beta)
                 = [[2+beta, 1],
                    [1, 3+alpha]].
```

Whole-family endpoint identity is certified by equality of the affine coefficient tensors produced by the declared transition grammar. Four corner evaluations are retained only as diagnostics and are not treated as proof of an arbitrary nonlinear family.

---

## 2. Pre-witness provenance scar

Before CI, an amendment file appeared through concurrent connector activity. Its substantive corrections were independently re-checked before adoption:

1. four agreeing parameter corners do not establish an arbitrary whole-family identity without structural proof;
2. IEEE-754 rendering must not become a scientific equality criterion.

The executable was therefore hardened to derive endpoint equality from affine transition coefficients and to use a declared representation epsilon `1e-12` only at the floating representation boundary.

The amendment remains visible as provenance. It is not silently rewritten as single-author history.

---

## 3. Initial witness failure and exact repair

Run `32673213422` · run number `2063` failed in the A15-R0 research-field step because the implementation silently supplied

```text
sample_before_transition
```

when the timing field was omitted.

That violated the preregistered hostile requirement that omitted timing must fail closed as

```text
SEQUENTIAL_OBSERVATION_TIMING_UNDECLARED
ABSTAIN_BEFORE_ROUTE_TRANSCRIPT_COMPARISON
```

The repair commit `a492e805baf0e85287754fcdcbedf113007015e0` removed that silent default. No transition interval, error bound, endpoint tolerance, transcript box, scientific criterion, or claim ceiling was changed.

Accordingly:

```text
2063 failure = implementation breach of frozen epistemic contract
2063 failure ≠ failed robustness result
2064 success = exact repaired implementation witnessed against frozen criteria
```

---

## 4. Robust family result

Exact route-response families before measurement error:

```text
AB:
  A ∈ [2.00, 2.00]
  B ∈ [3.90, 4.10]

BA:
  A ∈ [3.80, 4.20]
  B ∈ [3.00, 3.00]
```

After deterministic bounded error `eta = 0.05`:

```text
AB box:
  A ∈ [1.95, 2.05]
  B ∈ [3.85, 4.15]

BA box:
  A ∈ [3.75, 4.25]
  B ∈ [2.95, 3.05]
```

The joint transcript boxes are disjoint, yielding the bounded classification

```text
ROBUST_ROUTE_TRANSCRIPT_SEPARATION_OVER_DECLARED_TRANSITION_AND_ERROR_FAMILY
```

This is set-wise deterministic separation in the authored finite fixture. It is not a probabilistic classifier guarantee or a statistical-consistency result.

---

## 5. Ambiguity control

For the smaller-effect family

```text
alpha ∈ [0.05, 0.15]
beta  ∈ [0.05, 0.15]
eta   = 0.10
```

the two observed transcript boxes overlap and the instrument returns

```text
ROUTE_TRANSCRIPT_SEPARATION_UNRESOLVED_UNDER_DECLARED_ERROR_FAMILY
```

Thus the instrument does not manufacture route identification merely because two route labels exist.

---

## 6. Common-endpoint hostile

A route-dependent endpoint perturbation using

```text
alpha = 1
beta_AB = 2
beta_BA = 2.4
endpoint tolerance = 0.1
```

produces maximum entry difference `0.4`, exceeding the declared tolerance. The instrument therefore returns

```text
COMMON_ENDPOINT_NOT_ESTABLISHED_OVER_DECLARED_TRANSITION_MODEL
ABSTAIN_FROM_COMMON_ENDPOINT_ROUTE_TRANSCRIPT_CLAIM
```

Route-transcript comparison is not allowed to smuggle endpoint non-equivalence into a same-endpoint claim.

---

## 7. Exact-head witness

At source head `a492e805baf0e85287754fcdcbedf113007015e0`, consolidated validation run `32673493614` / `2064` completed successfully.

The authoritative static job recorded success for:

- the four-workflow estate and release membrane;
- Dome-World and Phase IV static surfaces;
- Ash core through A14;
- **Ash A15 empirical profile journeys and the A15-R0 research field**;
- Ash demo hydration and production-closure static surfaces;
- Flow-Core P0-P10 and its claim-separation checks;
- the Flow-Core runtime browser contract.

No diagnostic-preservation path was needed because the job was not held.

A subsequent connector attempt to retrieve the complete decoded job log body encountered a transport/DNS failure. This receipt therefore does **not** claim a second independently recovered copy of literal gauntlet stdout. The exact-head workflow/run identity and step-level success record are the witness asserted here.

---

## 8. Canonical bounded scientific claim

The current assay earns only:

```text
ROUTE_CONDITIONED_ACTION_INDEXED_OBSERVATION_TRANSCRIPTS_CAN_REMAIN_SET_WISE_SEPARABLE_OVER_A_DECLARED_SHARED_FAMILY_OF_COMMUTING_ADDITIVE_TRANSITION_MAGNITUDES_AND_DETERMINISTIC_BOUNDED_MEASUREMENT_ERROR_WHILE_A_SMALLER_EFFECT_FAMILY_CAN_BECOME_UNRESOLVED_AND_ROUTE_DEPENDENT_ENDPOINT_DRIFT_BLOCKS_THE_COMMON_ENDPOINT_CLAIM_IN_THE_AUTHORED_2X2_FIXTURE
```

---

## 9. Anti-equivalences preserved

```text
shared exact endpoint != identical transition history
shared exact endpoint != identical route-conditioned observation transcript
commuting additive updates != interpolation-order invariance of intermediate readouts
four agreeing corners != whole-family proof without declared structural certificate
omitted observation timing != default observation timing
robust deterministic set separation != probabilistic route-classification consistency
same declared decision != same route history
route-transcript separability != path-category structure
```

---

## 10. Claim ceiling

This receipt does **not** earn:

- a general robust path-dependence theorem;
- statistical consistency or probabilistic route classification;
- a path category or path groupoid;
- a transport functor or connection;
- holonomy or curvature;
- Berry structure or quantum behavior;
- canonical operator-tomography promotion;
- Proto-Loom;
- a TD613-general theorem;
- A16 reopening;
- live Ash mutation;
- merge, production, or Vercel authority.

---

## 11. Next bounded research action

One small chamber may now ask what information can be discarded from the route-conditioned transcript for a declared downstream decision while preserving—or failing to preserve—route custody.

The intended seam is:

```text
decision-sufficient compression != route-custody-sufficient representation
```

Only after that bounded compression/partial-custody chamber is witnessed and receipted should a human `𝄐` decide whether to open a new scientific grammar involving explicit path objects and composition.

𝌋

Sealed ⟐
