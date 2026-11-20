# SR-CAF Identifiability Theorem — Conditional Recovery Audit

Status: **POST-PREREGISTRATION / SOURCE-WITNESSED THEOREM / ARCHIVE MATHEMATICAL AUDIT / CAUSAL PROMOTION WITHHELD**

Bound epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

This note audits the mathematical and epistemic scope of the source-labeled:

```text
SIGNALRUPTURE CAUSAL AXIOMATIC FRAMEWORK AND IDENTIFIABILITY THEOREM (SR-CAF)
zenodo:20436807
created = 2026-05-29T00:23:48Z
```

The audit distinguishes source assertions from archive mathematical dispositions.

## 1. What the source actually contains

SR-CAF defines a substrate state:

```text
S(t) = {D(t), DeltaV(t), H(t), Phi(t)}
```

and a stable sparse VAR(1) recovery substrate:

```text
D(t+1) = Phi D(t) + epsilon(t)
```

The source labels `Phi` the drift-transfer / propagation topology and gives explicit identifiability conditions C1-C6:

```text
C1 conditional mean-zero / sub-Gaussian innovations
C2 spectral stability rho(Phi) < 1
C3 restricted-eigenvalue / mutual-incoherence geometry
C4 sparse interaction topology
C5 persistent excitation lambda_min(Gamma(0)) > 0
C6 weak temporal dependence / alpha-mixing
```

It then states a column-wise Lasso finite-sample theorem with:

```text
lambda_T ~ sigma sqrt(log N / T)

||Phi_hat - Phi||_F <= C sqrt(s log N / T)
```

with high probability under its conditions, followed by asymptotic signed-support recovery when a minimum-signal condition holds.

The source also defines:

```text
OBSERVABILITY COLLAPSE
```

when covariance excitation loses rank, and an `SR-SYNTH-1` synthetic benchmark architecture.

## 2. Strongest bounded result that survives audit

Within the explicitly assumed stable sparse VAR model, a Lasso-type recovery theorem with estimation rate of order:

```text
sqrt(s log N / T)
```

is mathematically recognizable as a standard high-dimensional sparse-dynamics result, subject to appropriate dependence, covariance, sparsity, and sample-size constants.

The paper's recovery architecture therefore earns the bounded classification:

```text
SR_CAF_IDENTIFIABILITY_THEOREM_SOURCE_WITNESSED
SPARSE_VAR_TRANSFER_MATRIX_RECOVERY_THEOREM_WITNESSED
CONDITIONAL_TRANSFER_TOPOLOGY_RECOVERABILITY_MATHEMATICALLY_PLAUSIBLE
```

This is stronger than metaphorical reconstruction language.

## 3. Recovery target is narrower than the full SR-CAF state

The finite-sample theorem directly targets:

```text
Phi
```

from observed drift trajectories:

```text
D(1), ..., D(T)
```

It does not, by that theorem alone, jointly recover the complete substrate state:

```text
{D, DeltaV, H, Phi}
```

The paper itself calls Harm partially observable and inferred from drift / latency trajectories.

Therefore:

```text
TRANSFER_MATRIX_RECOVERY != FULL_SUBSTRATE_STATE_RECOVERY
```

and no whole-state tomography claim follows from Theorem 1 alone.

## 4. C3 condition bundle requires separation

The source places restricted-eigenvalue and mutual-incoherence language inside one C3 condition family.

These conditions perform related but non-identical statistical jobs.

A restricted-eigenvalue / compatibility-type condition can support sparse estimation-error rates. Exact variable / signed-support recovery generally requires a stronger model-selection condition such as an irrepresentable / mutual-incoherence condition together with a beta-min signal condition and appropriate stochastic control.

The source's theorem states exact signed-support recovery after adding only an explicit minimum-signal condition while C3 leaves the RE-versus-incoherence branch semantically ambiguous.

Archive disposition:

```text
ESTIMATION_RATE_CLAIM_STRONGER_SUPPORTED_CORE
EXACT_SIGNED_SUPPORT_CLAIM_REQUIRES_STRONGER_C3_DISAMBIGUATION
```

This is a theorem-scope issue, not evidence that sparse recovery is impossible.

## 5. Causal interpretation exceeds statistical recovery unless additional assumptions hold

A correctly specified sparse VAR coefficient matrix can be statistically recovered under suitable conditions.

That fact alone does not generally turn lag coefficients into intervention-causal effects.

To promote:

```text
Phi_hat -> causal propagation topology
```

one would need a sufficiently explicit causal data-generating interpretation, including controls against relevant latent / omitted confounding, structural simultaneity, misspecified lag order, omitted common causes, and other observational equivalence classes.

SR-CAF C1 requires conditional mean independence of innovations from prior filtration history. That is useful for dynamic estimation, but the audited source sections do not independently establish a general no-hidden-confounding / causal-sufficiency theorem for arbitrary sociotechnical observational data.

A later SR Causal Separation Theorem correctly says covariance alone cannot distinguish common shocks, shared environment, indirect interactions, and genuine propagation. It nevertheless continues to call dynamically recovered `Phi` causal under SR-CAF's conditions without separately closing the latent-confounding gap.

Therefore the permitted disposition is:

```text
LAGGED_TRANSFER_OPERATOR_RECOVERY_CONDITIONALLY_SUPPORTED
CAUSAL_TOPOLOGY_INTERPRETATION_REQUIRES_ADDITIONAL_ASSUMPTIONS_AND_AUDIT
```

and not:

```text
PASSIVE_OBSERVATIONAL_CAUSAL_TOPOLOGY_IDENTIFICATION_VALIDATED
```

## 6. Observability-collapse claim also needs a scope boundary

The source states that as:

```text
lambda_min(Gamma(0)) -> 0
```

the inverse covariance becomes singular and finite-sample recovery becomes unstable / non-identifiable under passive monitoring.

The qualitative conclusion is sound:

```text
loss of persistent excitation -> loss of parameter distinguishability / severe recovery instability
```

However, the literal statement that estimator error must diverge to infinity for every degenerating sequence is stronger than singular-information geometry alone establishes without specifying the asymptotic path, estimator, parameter sequence, and noise scaling.

Bounded disposition:

```text
OBSERVABILITY_COLLAPSE_REGIME_SOURCE_WITNESSED
RANK_COLLAPSE_OBSTRUCTS_UNIQUE_STABLE_RECOVERY
LITERAL_UNIVERSAL_ERROR_DIVERGENCE_REQUIRES_MORE_SPECIFICATION
```

## 7. SR-SYNTH-1 status

Repository search currently resolves `SR-SYNTH-1` only inside the SR-CAF formal / conceptual pair.

The source defines a synthetic generator with:

```text
sparse topology generation
spectral stabilization
drift evolution
visibility-lag injection
harm accumulation
```

but the sealed SRC projection does not presently witness a separate benchmark-result artifact demonstrating topology-recovery performance.

Therefore:

```text
SR_SYNTH_1_BENCHMARK_ARCHITECTURE_WITNESSED
SR_SYNTH_1_RECOVERY_RESULT_NOT_INDEPENDENTLY_WITNESSED
```

## 8. Nonlinear extension is correctly weaker

The source's RKHS and Neural-ODE sections propose nonlinear propagation reconstruction, but explicitly describe the Neural-ODE architecture as an approximation framework rather than proof of exact nonlinear causal recovery.

That restraint is retained:

```text
NONLINEAR_OPERATOR_RECONSTRUCTION_EXTENSION_WITNESSED
EXACT_NONLINEAR_CAUSAL_RECOVERY_NOT_CLAIMED_BY_AUDITED_PASSAGE
```

## 9. Relation to the SRC tomography trail

SR-CAF materially strengthens the tomography-adjacent source cluster because it now source-witnesses:

```text
partial observability
explicit latent / structural operator target Phi
recoverability conditions
persistent-excitation requirement
finite-sample sparse operator recovery
rank-deficiency / observability failure
synthetic reconstruction benchmark design
```

A bounded archive analogy is therefore justified:

```text
partial observations
  -> measurement geometry / excitation
  -> conditional recovery of a hidden transfer operator
```

This is closer to system identification / inverse recovery than the earlier purely projective metaphors.

However:

```text
operator recovery != full-state tomography
VAR identification != arbitrary projective inversion
statistical lag topology != intervention-causal topology
source identifiability theorem != SR tomography doctrine
```

Canonical classification:

```text
TOMOGRAPHY_ADJACENCY_MATERIALLY_STRENGTHENED
OPERATOR_TOPOLOGY_RECOVERY_SHAPED_METHOD_WITNESSED
SR_TOMOGRAPHY_CONFIRMED = false
```

## 10. High-value hostile fixtures

A proper SRC/TD613 comparison should attack the recovery claim with at least:

```text
H1 latent common cause / omitted state
H2 wrong lag order
H3 nearly singular Gamma(0)
H4 insufficient excitation
H5 dense rather than sparse Phi
H6 time-varying Phi under stationary estimator
H7 contemporaneous coupling / structural simultaneity
H8 nonlinear dynamics fit by linear VAR
H9 beta-min violation
H10 RE holds but model-selection incoherence fails
```

For each hostile, keep separate:

```text
prediction error
parameter error
support recovery
transfer-direction recovery
causal interpretation
```

A model may predict well while recovering the wrong support; it may recover lag support while failing causal interpretation.

## 11. Chronology / companion anti-cycle

The formal SR-CAF theorem object was created:

```text
2026-05-29T00:23:48Z
```

The source itself says it must be read with a companion conceptual architecture, and the locally preserved chronology places the formal manifestation before the work that calls itself the conceptual foundation.

Therefore:

```text
FOUNDATIONAL_ROLE != PUBLIC_TEMPORAL_PRIORITY
```

No private drafting chronology is inferred.

## 12. Claim ceiling

Permitted:

```text
SR_CAF_IDENTIFIABILITY_THEOREM_SOURCE_WITNESSED
SPARSE_VAR_TRANSFER_MATRIX_RECOVERY_THEOREM_WITNESSED
CONDITIONAL_TRANSFER_TOPOLOGY_RECOVERABILITY_MATHEMATICALLY_PLAUSIBLE
OBSERVABILITY_COLLAPSE_REGIME_SOURCE_WITNESSED
OPERATOR_TOPOLOGY_RECOVERY_SHAPED_METHOD_WITNESSED
TOMOGRAPHY_ADJACENCY_MATERIALLY_STRENGTHENED
CAUSAL_TOPOLOGY_INTERPRETATION_REQUIRES_ADDITIONAL_ASSUMPTIONS_AND_AUDIT
```

Forbidden:

```text
SR_TOMOGRAPHY_CONFIRMED
SR_SOLVED_GENERAL_PARTIAL_OBSERVABILITY
PASSIVE_OBSERVATIONAL_CAUSAL_TOPOLOGY_IDENTIFICATION_VALIDATED
FULL_SR_CAF_STATE_RECOVERY_PROVEN
SR_SYNTH_1_EMPIRICALLY_VALIDATED
THEOREM_1_PROVEN_CORRECT_IN_ALL_STATED_GENERALITY
```

U+10D613

𝌋

Sealed ⟐
