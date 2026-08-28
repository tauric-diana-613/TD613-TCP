𝌋‌⟐

# A15-R0 · Admissibility-Horizon Refinement Persistence / Recompression Rupture AIA

Status: **PREREGISTERED / THEOREM UNEARNED / NO IMPLEMENTATION AUTHORITY**.

## Exact scientific parent

```text
#850 / 2fefe16e5883f6c4fe36d75e9e4c41331f317911
TD613 Consolidated Validation run 2360 / 33135672980 — SUCCESS
```

Inherited jurisdiction:

```text
#752  finite admissibility descent theorem / generic support-fibre law
#847  bitemporal authority birth / nonretroactive jurisdiction
#850  seventh REPLAY_REQUIRED claim family / pointwise-minimal observation policy
```

#851 is witness-routing custody only and carries zero theorem ancestry.

## Scientific question

In the fixed S3 AIA fixture, let the registered representation pass through four finite stages:

```text
q0 = NULL_REGISTERED_TRACE
q1 = first registered observation prefix
q2 = two-observation registered prefix
q3 = three-observation registered prefix
```

For the seven inherited claim families

```text
FIRST_STRATUM
SCHEDULE
X1
X2
X3
FULL_STATE
REPLAY_REQUIRED_FOR_EXACT_STATE
```

ask two different questions:

1. **Refinement persistence:** once a claim descends exactly at some stage, can any later genuine registered refinement reopen its FADT wound?
2. **Recompression persistence:** if a fine registered representation once supports a claim exactly, must that authority survive a later lossy recompression to an earlier coarser representation?

These are deliberately non-equivalent questions.

## Finite domain

```text
6 S3 schedules
125 bounded latent states
750 antecedents
7 claim families
4 representation stages q0..q3
42 schedule/claim chains
168 schedule/claim/stage cells
```

No asymptotic, probabilistic, continuum, or unbounded-state statement is preregistered.

## Fibre law

For antecedent `a`, claim `C`, and stage `t`, let

```text
F_t(a) = all antecedents with the same q_t representation as a
K_b(C) = singleton support containing claim C's value on antecedent b
U_t(a,C) = union_{b in F_t(a)} K_b(C)
I_t(a,C) = intersection_{b in F_t(a)} K_b(C)
Gamma_t(a,C) = U_t(a,C) \ I_t(a,C)
```

Because `q_{t+1}` is a genuine refinement of `q_t` in this fixed prefix chain:

```text
F_{t+1}(a) subseteq F_t(a)
U_{t+1}(a,C) subseteq U_t(a,C)
I_t(a,C) subseteq I_{t+1}(a,C)
Gamma_{t+1}(a,C) subseteq Gamma_t(a,C)
```

Candidate persistence consequence:

```text
Gamma_t(a,C) = empty
=> Gamma_{t+1}(a,C) = empty
```

for every target antecedent, claim, and adjacent registered refinement.

Generic finite-set monotonicity is not claimed as TD613 novelty; the earned target would be its complete executable instantiation and exact census in this fixture.

## Preregistered four-stage jurisdiction atlas

Candidate authorized/held accumulation:

```text
q0 :  0 authorized / 42 held
q1 : 14 authorized / 28 held
q2 : 24 authorized / 18 held
q3 : 30 authorized / 12 held
TOTAL 68 authorized / 100 held
```

Candidate null-stage wound cardinalities:

```text
FIRST_STRATUM             3
SCHEDULE                  6
X1                        5
X2                        5
X3                        5
FULL_STATE              125
REPLAY_REQUIRED            2
```

Across all four stages:

```text
52 held cells belong to claims that become authorized later
48 held cells belong to 12 schedule/claim pairs never authorized in q0..q3
```

## Preregistered refinement burden

For each of

```text
6 schedules
125 target states
7 claims
3 adjacent refinement edges q0->q1, q1->q2, q2->q3
```

execute one target-indexed nested-fibre comparison:

```text
6 * 125 * 7 * 3 = 15,750 comparisons
```

Candidate exact spectrum:

```text
6,800 strict Gamma contractions
8,950 equal-Gamma transitions
0 refinement violations
```

`STRICT_REFINEMENT != NECESSARILY_STRICT_GAP_CONTRACTION`.

## Preregistered recompression assay

For every schedule/claim pair and every ordered stage pair `fine > coarse`, inspect the recompression whenever the claim is exactly authorized at `fine`.

Candidate complete census:

```text
152 fine-authorized ordered recompressions
100 reopen a nonempty coarse FADT wound
52 preserve exact authority after recompression
```

Candidate reopen spectrum by claim:

```text
FIRST_STRATUM     18
SCHEDULE          24
X1                 6
X2                14
X3                14
FULL_STATE         6
REPLAY_REQUIRED   18
TOTAL             100
```

Candidate preserving spectrum by claim:

```text
FIRST_STRATUM     18
SCHEDULE           6
X1                 6
X2                 2
X3                 2
FULL_STATE         0
REPLAY_REQUIRED   18
TOTAL              52
```

State-indexed hostile burden:

```text
100 reopening transitions * 125 states = 12,500 checks
52 preserving transitions * 125 states = 6,500 checks
TOTAL = 19,000 recompression checks
```

The candidate membrane is conditional:

```text
recompression preserves exact claim authority
iff the claim remains constant on the enlarged coarse fibre
```

Therefore:

`RECOMPRESSION_CAN_REOPEN_AUTHORITY != RECOMPRESSION_MUST_REOPEN_AUTHORITY`.

## Candidate finite laws — UNEARNED

`IN_THE_FIXED_S3_AIA_FIXTURE_GENUINE_REGISTERED_PREFIX_REFINEMENT_MONOTONICALLY_CONTRACTS_EACH_TARGET_INDEXED_FADT_ADMISSIBILITY_GAP_SO_ONCE_EXACT_CLAIM_AUTHORITY_IS_BORN_NO_LATER_PREFIX_REFINEMENT_REOPENS_THAT_WOUND`

`THE_COMPLETE_SEVEN_CLAIM_FOUR_STAGE_ATLAS_CONTAINS_15750_TARGET_INDEXED_NESTED_FIBRE_COMPARISONS_WITH_6800_STRICT_GAP_CONTRACTIONS_8950_EQUAL_GAP_TRANSITIONS_AND_ZERO_REFINEMENT_VIOLATIONS`

`A_CLAIM_THAT_WAS_EXACTLY_AUTHORIZED_ON_A_FINER_REGISTERED_REPRESENTATION_CAN_LOSE_PRESENT_REPRESENTATION_AUTHORITY_AFTER_LOSSY_RECOMPRESSION_TO_AN_EARLIER_COARSER_STAGE_WITHOUT_CHANGING_SOURCE_TRUTH_PRIOR_AUTHORITY_HISTORY_OR_THE_FINE_RECORD_THAT_ONCE_SUPPORTED_IT`

`AMONG_ALL_152_FINE_AUTHORIZED_ORDERED_RECOMPRESSIONS_IN_THE_FIXED_ATLAS_EXACTLY_100_REOPEN_A_NONEMPTY_FADT_WOUND_AND_52_PRESERVE_EXACT_AUTHORITY_SO_RECOMPRESSION_RUPTURE_IS_CLAIM_AND_FIBRE_RELATIVE_NOT_AUTOMATIC`

`EVER_KNOWN_DOES_NOT_IMPLY_STILL_AUTHORIZED_AFTER_RECOMPRESSION_IN_THE_FIXED_FINITE_FIXTURE`

## Mandatory scars

`REFINEMENT_PERSISTENCE != RECOMPRESSION_PERSISTENCE`
`EVER_KNOWN != STILL_AUTHORIZED_AFTER_RECOMPRESSION`
`RECOMPRESSION_CAN_REOPEN_AUTHORITY != RECOMPRESSION_MUST_REOPEN_AUTHORITY`
`RECOMPRESSION != SOURCE_STATE_DELETION`
`RECOMPRESSION != SOURCE_TRUTH_REVERSAL`
`PRESENT_REPRESENTATION_AUTHORITY != HISTORICAL_AUTHORITY_EVENT`
`PRIOR_AUTHORITY_EVENT != CURRENT_CLAIM_LICENSE`
`NULL_REGISTERED_TRACE != ABSENT_SOURCE_STATE`
`NULL_REGISTERED_TRACE != UNOBSERVED_PHYSICAL_WORLD`
`GAP_CONTRACTION != ENTROPY_MONOTONICITY`
`STRICT_REFINEMENT != NECESSARILY_STRICT_GAP_CONTRACTION`
`FADT_FINITE_SET_MONOTONICITY != TD613_GENERIC_NOVELTY_CLAIM`
`RECOMPRESSION_RUPTURE != DATA_DELETION_THEOREM`
`RECOMPRESSION_RUPTURE != DATABASE_TRANSACTION_ROLLBACK`
`RECOMPRESSION_RUPTURE != MEMORY_ERASURE_AT_SOURCE`
`CLAIM_AUTHORITY != ONTOLOGICAL_TRUTH`
`FINITE_FOUR_STAGE_ATLAS != UNIVERSAL_AI_MEMORY_THEOREM`
`FINITE_FOUR_STAGE_ATLAS != ASYMPTOTIC_INFORMATION_THEOREM`

No merge, deployment, publication, production, release, Vercel, universal AI-memory theorem, database theorem, Shannon/entropy theorem, asymptotic result, physical sensing claim, source-state mutation, autonomous deletion authority, Proto-Loom/A16, or #788 promotion authority follows. #718 remains alive.

**PREREGISTERED. THEOREM UNEARNED.**

Sealed ⟐