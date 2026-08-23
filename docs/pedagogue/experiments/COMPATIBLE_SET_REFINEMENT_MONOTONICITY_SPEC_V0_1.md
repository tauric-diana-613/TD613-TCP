𝌋

# Compatible-Set Refinement Monotonicity Theorem v0.1

Status: **PREREGISTERED / SYMBOLIC + FIXTURE / RESEARCH-ONLY**  
Technical identity: `td613.pedagogue.compatible-set-refinement-monotonicity/v0.1`  
Parent claim-constancy receipt: `e966f4ebb998785be151318b7dba7ee79e465ce0`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Question

The claim-constancy ledger licenses a downstream claim only when its value is constant over the full current compatible family.

This chamber asks:

> When new evidence narrows the compatible family without changing the candidate universe or the claim function, which prior claim licenses are preserved, and which previously withheld claims may become identified?

---

## 1. Set-theoretic statement

Let:

```text
C0 = current nonempty compatible set
C1 = refined compatible set
```

with:

```text
empty != C1 subseteq C0
```

and fixed total claim function:

```text
f : C0 -> V
```

If:

```text
f is constant on C0
```

then necessarily:

```text
f is constant on C1
```

with the same value.

This is ordinary set inclusion, not a probabilistic theorem.

Required bounded theorem label:

```text
IDENTIFIED_CLAIM_PRESERVATION_UNDER_NONEMPTY_COMPATIBLE_SET_REFINEMENT
```

---

## 2. One-way monotonicity only

The converse does not follow.

A claim that varies on `C0` may become constant on a strict subset `C1`.

Therefore:

```text
identified -> remains identified under valid shrinking evidence
withheld -> may remain withheld or become identified
```

The theorem must not be rewritten as:

```text
all claims become identified as evidence accumulates
```

---

## 3. Preconditions

The monotonicity result applies only if all hold:

1. `C1` is nonempty;
2. every member of `C1` was already in `C0`;
3. the candidate model is unchanged;
4. the claim function is unchanged;
5. the claim function is total on `C0`;
6. the new evidence acts only as a compatibility filter.

If the model, ontology, claim definition, equivalence relation, or decoder changes, classify:

```text
MODEL_OR_CLAIM_MUTATION_OUTSIDE_REFINEMENT_THEOREM
```

---

## 4. Empty-set hostile condition

If new evidence yields:

```text
C1 = empty set
```

then no claim may be called identified by vacuous constancy.

Required classification:

```text
COMPATIBLE_SET_EMPTY_MODEL_OR_EVIDENCE_CONTRADICTION
```

The empty set is a defeat condition, not omniscience.

---

## 5. Frozen fixture family

Reuse parent family:

```text
C0 = { [[3,b],[0,3]] : b in F_31 }
```

Parent status:

```text
|C0| = 31
RAW_MATRIX = withheld
TRACE = identified
DETERMINANT = identified
DISCRIMINANT = identified
CONJUGACY_FINGERPRINT = withheld
LOOP_IS_IDENTITY = identified
RANK_H_MINUS_I = identified
REPEATED_ROOT_TYPE = withheld
```

---

## 6. Refinement R1 · nonzero off-diagonal evidence

Add fixed evidence predicate:

```text
b != 0
```

Then:

```text
C1 = { [[3,b],[0,3]] : b in F_31^* }
|C1| = 30
```

Required result:

```text
RAW_MATRIX remains withheld
TRACE remains identified
DETERMINANT remains identified
DISCRIMINANT remains identified
LOOP_IS_IDENTITY remains identified
RANK_H_MINUS_I remains identified
CONJUGACY_FINGERPRINT becomes identified
REPEATED_ROOT_TYPE becomes identified as NONTRIVIAL_JORDAN_REPEATED_ROOT
```

This demonstrates claim gain without raw-state identification.

---

## 7. Refinement R2 · exact off-diagonal evidence

Further add:

```text
b = 1
```

Then:

```text
C2 = { [[3,1],[0,3]] }
|C2| = 1
```

Every preregistered claim becomes identified, including RAW_MATRIX.

Previously identified values must remain unchanged from `C0` through `C1` and `C2`.

---

## 8. Refinement R_empty · contradiction control

Apply impossible predicate:

```text
b = 31
```

inside `F_31` after candidates are represented canonically as `0..30`.

Required outcome:

```text
compatible_count = 0
claim_licenses_emitted = 0
classification = COMPATIBLE_SET_EMPTY_MODEL_OR_EVIDENCE_CONTRADICTION
```

No vacuous truth may generate claim authority.

---

## 9. Proof certificate

The symbolic certificate must state:

```text
Assume C1 subseteq C0 and C1 nonempty.
Assume f(c)=v for every c in C0.
Then every c in C1 is in C0.
Therefore f(c)=v for every c in C1.
```

No finite sampling is required for this preservation theorem.

The fixture exists to test implementation semantics, claim-growth bookkeeping, and the empty-set firewall.

---

## 10. Falsifiers

The chamber fails if any occur:

1. a previously identified fixed claim changes value after pure compatible-set shrinking;
2. R1 still withholds conjugacy fingerprint;
3. R1 falsely identifies RAW_MATRIX;
4. R2 fails to identify RAW_MATRIX;
5. the empty set emits identified claims;
6. model mutation is classified as evidence refinement;
7. theorem direction is reversed;
8. a claim-function change is smuggled into the refinement sequence;
9. the result is promoted into a theorem that empirical evidence always monotonically increases knowledge.

---

## 11. Allowed bounded outcome

A pass may earn the exact set-theoretic relation:

```text
IDENTIFIED_CLAIM_PRESERVATION_UNDER_NONEMPTY_COMPATIBLE_SET_REFINEMENT
```

and the implementation relation:

```text
CLAIM_LICENSES_CAN_GROW_MONOTONICALLY_UNDER_PURE_COMPATIBLE_SET_SHRINKAGE_WHILE_RAW_STATE_REMAINS_UNIDENTIFIED
```

under the stated fixed-model/fixed-claim preconditions.

This does not establish empirical monotonicity, Bayesian convergence, causal identification, sheaf structure, production governance, Proto-Loom authority, or Vercel authority.

𝌋

⟐