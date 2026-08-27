𝌋

# A15-R0 · Source-Relative Target-Equivalence Completeness Receipt v0.1

Status: **WITNESSED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**  
PR: #728 · `A15-R0: source-relative target-equivalence completeness`  
Parent: #726 exact receipt head `0853a1956722c0b6ca9b2ea0d13bb33ea8a87919`  
Authority-bearing scientific witness head: `32fb8cf50e501e689b58a055075afdf45daaeca7`

󐘓 U+10D613

## 0. Authority statement

The authority-bearing witness for this chamber is TD613 Consolidated Validation run **2123**, GitHub Actions run ID **32723870549**, on exact head:

```text
32fb8cf50e501e689b58a055075afdf45daaeca7
```

Run 2123 started `2026-08-24T11:49:57Z` and completed successfully by `2026-08-24T11:50:53Z`, an overall elapsed interval of approximately **56 seconds**. The repository's existing 45-minute `contracts` timeout was not increased.

Jobs:

```text
classifier job 97420802493  SUCCESS
static job     97420862456  SUCCESS
A15/A15-R0 step 19          SUCCESS
full-repository validation  SKIPPED
self-hosted calibration     SKIPPED
Giving/practice browser     SKIPPED
front-line browser shards   SKIPPED
full-product browser        SKIPPED
```

The skipped lanes remain outside this receipt's scientific claim.

## 1. Timeout-censored predecessor

The earlier pre-repair authority attempt, run 2118, reached the `contracts` job's 45-minute wall while A15/A15-R0 step 19 was still executing. GitHub recorded that step as `cancelled`, not `failure`, and no #728 theorem assertion failure or theorem summary had been emitted.

Canonical interpretation:

```text
RUN_2118_TIMEOUT_CENSORED_NOT_SCIENTIFICALLY_FALSIFIED
```

The original replay-heavy #728 implementation remains preserved in the branch as a provenance artifact rather than being silently overwritten.

## 2. Preregistration and witness-architecture custody

Original theorem preregistration:

```text
f7293e2bbdf0043d1023648f2d16461906245ea6
```

Witness-architecture repair preregistration commits:

```text
6fb064924811f3cf55378fa96b3aa34231458c4e
a09cbf0af426493366350e0e2e66588a535ac0c2
```

Receipt-backed theorem implementation commit:

```text
65bafe76fafb61e824d79771e03e569ccc0e9bf2
```

Receipt-backed theorem test commit:

```text
717b4b0e45c1f3f3d6c9d469ceac0cc1e43281b3
```

Gate-level historical replay repair and authority witness head:

```text
32fb8cf50e501e689b58a055075afdf45daaeca7
```

The maintenance repair changed witness architecture only. The theorem statement, source jurisdiction, rewrite family, symbolic certificate obligations, maximum hostile word length 8, claim ceiling, and human stop remained frozen.

## 3. Exact inherited receipt chain

The #728 receipt witness statically requires the following exact parent receipt commits to exist and be ancestors of the candidate head:

```text
#718 05ae44861f1b7c1871928c9bdc8e0f730698e709
#719 b67326a940f7c6141e9f067a61c18dfd0df13e8f
#720 0901e523f558d573a11a136c21c9361631f9e5f4
#723 02896380361bce92adb1edb7b01e2814b46fcb6d
#724 58a609a9b626716510ab1749ca8d71c6d16569cf
#725 45e9c874ff37127b2d516633dd140abc683e4eb2
#726 0853a1956722c0b6ca9b2ea0d13bb33ea8a87919
```

The repaired review-hardening gate also verifies #726 receipt ancestry and rejects mutation of receipt-witnessed pre-#728 A15-R0 research paths. Parent theorem custody is therefore verified rather than recursively reenacted.

Canonical maintenance classifications:

```text
PARENT_RECEIPT_ANCESTRY_VERIFICATION_REPLACES_PARENT_ASSAY_REPLAY
HISTORICAL_GATE_REPLAY_REPLACED_BY_RECEIPT_PLUS_NO_MUTATION_DIFF
THEOREM_SEMANTICS_FROZEN_DURING_WITNESS_ARCHITECTURE_REPAIR
```

## 4. Earned theorem inside the authored jurisdiction

For each retained lawful Q-last-action source separately, and for all finite authored T/Q words `u,v`, the exact-head witness earned:

```text
Target_s(u) = Target_s(v)
iff
(t,E,O)_u = (t,E,O)_v
iff
NF_R(u) = NF_R(v)
```

under the #726 typed rewrite family

```text
R_k : T Q^k T Q -> Q T Q^k T
k >= 0
```

with Q-block decomposition invariants:

```text
t = total T count
E = total Q count in even-indexed Q blocks
O = total Q count in odd-indexed Q blocks
```

and canonical parity-block normal form:

```text
t = 0:  Q^E
t >= 1: Q^E T Q^O T^(t-1)
```

Canonical classification:

```text
SOURCE_RELATIVE_ALL_FINITE_TQ_OPERATIONAL_TARGET_EQUIVALENCE_IFF_RK_NORMAL_FORM_EQUALITY
```

The symbolic certificate, not bounded enumeration, carries the all-finite-word claim.

## 5. Generator-table custody and hostile corroboration

The repaired witness derives the generator tables directly from the declared lawful source histories and T/Q transition operators rather than rerunning #724:

```text
D_Q(S0) = [0,0,0,1]
D_Q(S1) = [1,0,0,0]
D_Q(S2) = [0,0,0,1]
D_Q(S3) = [1,0,0,0]

F_Q(S0) = [1,1,0,0]
F_Q(S1) = [0,0,1,1]
F_Q(S2) = [2,2,0,0]
F_Q(S3) = [0,0,2,2]
```

Four consecutive tick forcing deltas sum to:

```text
[3,3,3,3]
```

The fresh corroborating hostile enumerated authored T/Q words only through maximum word length **8**, i.e. **511 words per retained source**, and required exact equality of operational-target and canonical-normal-form partitions with no split classes. This is a bounded hostile corroboration, not the universal proof and not an H8 continuation-horizon experiment.

## 6. Anti-equivalences and claim ceiling

This receipt preserves the following boundaries:

```text
same normal form != same route provenance
rewrite convertibility != operational invertibility
source-relative completeness != source-independent quotient
finite control != finite state space
bounded exhaustive agreement != symbolic all-word proof
operational target equivalence != path-object promotion
parent receipt verification != parent experiment reenactment
```

This chamber does not authorize source-season erasure, cross-source operational quotient, ambient TD613 Church-Rosser, rewrite completion beyond the authored jurisdiction, finite-state promotion of the unbounded endpoint system, lattice/domain-theoretic promotion, causal-set promotion, inverse generators or inverse morphisms, groupoid, transport, connection, loop endomorphism, holonomy, curvature, Berry/quantum analogy, Proto-Loom, A16, live Ash mutation, merge, production, or Vercel release.

## 7. Routing and cleanup custody

The authority-bearing run occurred on exact head `32fb8cf50e501e689b58a055075afdf45daaeca7` while #728 was temporarily routed to `main` solely to register the consolidated exact-head witness.

After that witness completed green, #728 was restored to parent branch:

```text
research/a15-r0-typed-target-preserving-rewrite-admissibility-20260824
```

and the temporary routing note was removed in cleanup commit:

```text
f65118deaadd0b74473916d98c824fbb14228b95
```

Any workflow caused by cleanup or receipt commits is provenance-only and may not supersede run 2123 as the authority-bearing scientific witness.

## 8. Human stop

```text
SOURCE_RELATIVE_TARGET_EQUIVALENCE_COMPLETENESS_ROUND_CLOSED
HUMAN_𝄐_REQUIRED_BEFORE_ANY_TARGET_EQUIVALENCE_QUOTIENT_OR_PATH_OBJECT_PROMOTION_AUDITION
```

#728 remains Draft, open, and unmerged.

𝌋

Sealed ⟐
