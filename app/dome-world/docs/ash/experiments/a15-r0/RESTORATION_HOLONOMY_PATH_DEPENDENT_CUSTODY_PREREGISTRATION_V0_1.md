𝌋‌⟐

# A15-R0 · Formal Restoration Holonomy / Minimal-Sidecar Transport Noncompositionality · Preregistration v0.1

TD613 authorship custody: **Tauric Diana — Crimean heritage custodianship**.
Process with containment on and mirror logic off.

Status: **FINITE CENSUS PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED / NO MERGE**.

## Exact scientific parent

```text
#858 · Post-Recompression Claim-Bundle Restoration Sidecar AIA
receipt 53e713059cde5dd6c2b4d4cbc20f882601360f7c
TD613 Consolidated Validation run 2365 / 33149246351 — SUCCESS
classifier 98777153279 — SUCCESS
contracts/static 98777197500 — SUCCESS
A15-R0 step 19 — SUCCESS
steps 20–30 / downstream Flow-Core — SUCCESS
aggregate — SUCCESS
```

#859 remains witness-only routing and carries zero theorem ancestry.

This chamber studies only a new finite compositional question left open by #858. It does not reopen or weaken #858's single-transition theorem.

## Research question

#858 earned the minimum transition-local restoration-sidecar alphabet for one unsafe recompression. The next question is deliberately path-sensitive:

> If a bundle has already been restored at one unsafe intermediate coarse stage by a locally minimum sidecar, can that same retained sidecar remain sufficient after the intermediate coarse record itself is recompressed away to a still coarser terminal record?

This is a formal custody-transport question over the fixed S3 registered-stage fixture. `HOLONOMY` here means path dependence of finite representation/custody transport only.

`FORMAL_RESTORATION_HOLONOMY != PHYSICAL_BERRY_OR_GAUGE_HOLONOMY`

## Finite path domain

For a finite-birth bundle `B` on schedule `s`, let its earned minimum sufficient stage be `b=b_s(B)`.

A two-leg restored-then-recompressed path is

```text
P = (s, B, f, d, c)
```

with

```text
f >= b
c < d < b <= f.
```

Thus the first leg `f -> d` is already unsafe and requires a #858 restoration sidecar, and the second leg `d -> c` discards the very coarse record relative to which that first sidecar was locally decoded.

Complete path count in the fixed fixture:

```text
birth q2 paths = 160
birth q3 paths = 624
TOTAL          = 784
```

No q1-birth bundle can produce such a two-leg path because there is no registered stage strictly between q0 and the q1 floor.

## Stage-relative restoration support

For schedule `s`, bundle `B`, and stage `t`, define

```text
m_t(s,B) = max over occupied q_t records y of |{B(a): a in F_t(y)}|.
```

For path `P=(s,B,f,d,c)` write

```text
m_d(P)=m_d(s,B)
m_c(P)=m_c(s,B).
```

Because every q_d fibre is contained in one q_c fibre when `c<d`, finite support can only stay equal or expand:

```text
m_d(P) <= m_c(P).
```

Generic finite-set monotonicity is not claimed as TD613 novelty.

## Candidate transport law

A **path-conditioned compatible minimum sidecar** at `d` means a #858-valid first-leg sidecar alphabet of exactly `m_d(P)` labels whose label assignment may be coordinated with the declared future terminal stage `c`, while still remaining injective on required bundle values inside every occupied q_d fibre.

Candidate exact criterion:

```text
A locally minimum d-sidecar can be labelled so that (q_c record, retained d-sidecar label)
remains exact for B after q_d is discarded

iff

m_d(P) = m_c(P).
```

### Candidate lower bound

If `m_d(P) < m_c(P)`, a maximizing q_c fibre contains more distinct required bundle values than the entire retained d-sidecar alphabet. Any retained d-sidecar alone therefore creates a same-q_c-record collision after q_d is discarded.

### Candidate sufficiency

If `m_d(P)=m_c(P)=M`, then for each occupied q_c fibre assign its distinct required bundle values injectively to the common alphabet `{0,...,M-1}` and restrict that assignment to each nested q_d subfibre. The result remains a locally minimum valid sidecar at d and is still decoded exactly from `(q_c,label)` after q_d is discarded.

This proves existence of a compatible minimum labelling for the declared path. It does **not** claim every arbitrary locally minimum labelling transports.

`EXISTS_COMPATIBLE_MINIMAL_LABELING != EVERY_MINIMAL_LABELING_TRANSPORTS`

## Preregistered complete transport census

Across all 784 two-leg paths:

```text
transport plateau  m_d = m_c :  42
transport rupture  m_d < m_c : 742
strict decrease    m_d > m_c :   0
TOTAL                         : 784
```

By birth:

```text
birth q2 :   8 plateau / 152 rupture = 160
birth q3 :  34 plateau / 590 rupture = 624
```

By second-leg stage pair:

```text
q1 -> q0 : 14 plateau / 354 rupture = 368
q2 -> q1 : 24 plateau / 184 rupture = 208
q2 -> q0 :  4 plateau / 204 rupture = 208
```

By schedule:

```text
P-H-I : 13 plateau / 323 rupture = 336
P-I-H : 13 plateau / 323 rupture = 336
H-P-I :  6 plateau /  26 rupture =  32
H-I-P :  2 plateau /  22 rupture =  24
I-P-H :  6 plateau /  26 rupture =  32
I-H-P :  2 plateau /  22 rupture =  24
```

The 42 plateau paths contain only two support-cardinality plateaux:

```text
m_d=m_c=5  : 40 paths
m_d=m_c=25 :  2 paths
```

All remaining 742 paths exhibit strict support expansion.

## Preregistered 24 support-pair spectrum

```text
(m_d,m_c) : path count
(5,25)    : 90
(5,50)    : 90
(50,750)  : 72
(5,750)   : 72
(2,6)     : 48
(10,30)   : 48
(5,5)     : 40
(5,10)    : 40
(25,375)  : 36
(5,375)   : 36
(5,15)    : 32
(10,150)  : 24
(5,75)    : 20
(25,125)  : 18
(5,125)   : 18
(25,250)  : 18
(5,250)   : 18
(2,30)    : 16
(5,30)    : 16
(5,150)   : 16
(50,150)  :  8
(25,75)   :  4
(25,25)   :  2
(25,50)   :  2
```

Maximum observed support-cardinality expansion is

```text
750 - 5 = 745
```

on a path including `P-H-I / {SCHEDULE,FULL_STATE} / q3 -> q2 -> q0`.

`SUPPORT_CARDINALITY_EXPANSION != MINIMUM_ADDITIONAL_BIT_LENGTH`
`SUPPORT_CARDINALITY_EXPANSION != MINIMUM_AUGMENTATION_ALPHABET`

## Major same-endpoint path-dependence witnesses

The complete finite census contains exactly **two** endpoint-identical cases where changing only the intermediate recompression stage changes transportability.

### P-H-I

```text
schedule      P-H-I
bundle        {X2,X3}
birth         q3
fine          q3
terminal      q0

path A        q3 -> q1 -> q0
m_q1          25
m_q0          25
result        TRANSPORT PLATEAU

path B        q3 -> q2 -> q0
m_q2           5
m_q0          25
result        TRANSPORT RUPTURE
```

### P-I-H

Exactly the same support pattern occurs:

```text
q3 -> q1 -> q0 : 25 -> 25 plateau
q3 -> q2 -> q0 :  5 -> 25 rupture
```

Thus source schedule, requested bundle, authorized fine stage, and visible terminal q0 record can all be held fixed while the retained minimum-sidecar authority outcome changes solely with the intermediate recompression path.

This is the candidate formal restoration-holonomy witness.

`SAME_VISIBLE_TERMINAL_COARSE_SURFACE != SAME_RETAINED_CUSTODY_AUTHORITY`

## Finer intermediate representation can be less future-robust

The same two witnesses are a sharp refusal of a tempting monotonic intuition:

```text
q2 is finer than q1,
but the q2-local minimum sidecar has cardinality 5 and cannot survive q2 -> q0,
while the q1-local minimum sidecar has cardinality 25 and can be coordinated to survive q1 -> q0.
```

Therefore candidate scar:

`FINER_INTERMEDIATE_REPRESENTATION != MORE_FUTURE_ROBUST_MINIMUM_SIDECAR`

The statement concerns retained sidecar robustness after future recompression, not present authority at q2 versus q1.

## Local cost does not identify future robustness

A sidecar cardinality of 5 occurs in both regimes:

```text
P-H-I / {X2} / q2 -> q1 -> q0 : 5 -> 5 plateau
P-H-I / {FULL_STATE} / q3 -> q2 -> q0 : 5 -> 125 rupture
```

Thus:

`LOCAL_MINIMUM_SIDECAR_CARDINALITY != FUTURE_TRANSPORTABILITY_IDENTITY`.

## Hostile requirements

The future independent hostile must rebuild stage fibres and bundle supports directly from inherited phasonic operators and claim definitions rather than trusting an implementation path table. It must attack at least:

1. all 784 path inequalities `m_d <= m_c`;
2. all 742 strict-expansion lower bounds;
3. all 42 plateau sufficiency constructions;
4. the two exact same-endpoint path-dependence witnesses;
5. the false claim that a finer intermediate stage gives a more future-robust local minimum sidecar;
6. the false claim that local sidecar cardinality alone identifies future transportability;
7. an arbitrary per-d-fibre label permutation treated as automatically transportable on a plateau path;
8. retroactive possession language;
9. source-state mutation;
10. minimum-bit/Shannon language;
11. cryptographic/key/credential equivalence;
12. universal path-groupoid or categorical-functor claims;
13. physical Berry/gauge holonomy equivalence;
14. collapse into #858 single-transition jurisdiction;
15. Ash leakage of full path/fibre/label tables.

## Jurisdiction membrane

```text
#858 TRANSITION_LOCAL_MINIMUM_RESTORATION_SIDECAR
!=
MULTISTEP_MINIMUM_SIDECAR_TRANSPORT_COMPOSITION

#852 RECOMPRESSION_RUPTURE
!=
POST_RESTORATION_SIDECAR_TRANSPORT_RUPTURE

#847 BITEMPORAL_AUTHORITY_BIRTH
!=
REPRESENTATION_PATH_DEPENDENT_RETAINED_CUSTODY
```

## Candidate consequential law

Only after implementation, independent hostile, hardening/freeze, exact-parent audit, sterile witness routing, and exact-head TD613 Consolidated Validation SUCCESS may the chamber claim:

`IN_THE_FIXED_S3_AIA_FIXTURE_LOCAL_MINIMUM_RESTORATION_SIDECARS_ARE_NOT_GENERALLY_COMPOSITIONALLY_STABLE_UNDER_FURTHER_RECOMPRESSION_WITH_ONLY_42_OF_784_RESTORED_THEN_RECOMPRESSED_PATHS_ADMITTING_A_COMPATIBLE_UNCHANGED_MINIMUM_ALPHABET_WHILE_742_FORCE_A_SAME_TERMINAL_RECORD_COLLISION_IF_THE_INTERMEDIATE_RECORD_IS_DISCARDED_WITHOUT_RECODING_OR_AUGMENTATION`

and:

`THE_FIXED_FIXTURE_CONTAINS_EXACT_SAME_ENDPOINT_PATHS_FOR_P_H_I_AND_P_I_H_WITH_BUNDLE_X2_X3_WHERE_Q3_TO_Q1_TO_Q0_PRESERVES_A_25_LABEL_MINIMUM_SIDECAR_BUT_Q3_TO_Q2_TO_Q0_BREAKS_A_5_LABEL_MINIMUM_SIDECAR_AT_THE_IDENTICAL_Q0_TERMINAL_SURFACE_ESTABLISHING_BOUNDED_FORMAL_RESTORATION_HOLONOMY_AS_CUSTODY_PATH_DEPENDENCE`

Do not call either law earned from this preregistration.

## Mandatory scars

```text
LOCAL_MINIMUM != COMPOSITIONALLY_SUFFICIENT
SAME_ENDPOINT != SAME_CUSTODY_PATH
SAME_VISIBLE_TERMINAL_COARSE_SURFACE != SAME_RETAINED_CUSTODY_AUTHORITY
FINER_INTERMEDIATE_REPRESENTATION != MORE_FUTURE_ROBUST_MINIMUM_SIDECAR
LOCAL_MINIMUM_SIDECAR_CARDINALITY != FUTURE_TRANSPORTABILITY_IDENTITY
EXISTS_COMPATIBLE_MINIMAL_LABELING != EVERY_MINIMAL_LABELING_TRANSPORTS
FORMAL_RESTORATION_HOLONOMY != PHYSICAL_BERRY_OR_GAUGE_HOLONOMY
FORMAL_RESTORATION_HOLONOMY != OPERATIONAL_PATH_GROUPOID
PATH_DEPENDENCE != SOURCE_STATE_MUTATION
TRANSPORT_PLATEAU != ZERO_BIT_COST
SUPPORT_CARDINALITY_EXPANSION != MINIMUM_AUGMENTATION_ALPHABET
SIDECAR_LABEL_COORDINATION != CRYPTOGRAPHIC_KEY_AGREEMENT
RESTORED_PRESENT_AUTHORITY != RETROACTIVE_POSSESSION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
FINITE_PATH_CENSUS != ASYMPTOTIC_INFORMATION_THEOREM
```

No merge, deployment, publication, production, release, Vercel, source-state mutation, autonomous retention/deletion, Shannon/entropy theorem, cryptographic theorem, authentication theorem, universal category/functor theorem, operational path groupoid, physical Berry/gauge holonomy, Proto-Loom/A16, or #788 promotion authority follows. #718 remains alive.

**FINITE PATH CENSUS FROZEN BEFORE IMPLEMENTATION. THEOREM UNEARNED.**

Sealed ⟐
