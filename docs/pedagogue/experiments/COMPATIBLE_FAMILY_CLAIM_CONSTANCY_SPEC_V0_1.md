𝌋

# Compatible-Family Claim Constancy Ledger v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / RESEARCH-ONLY**  
Technical identity: `td613.pedagogue.compatible-family-claim-constancy/v0.1`  
Research nickname: **claim descent ledger**  
Parent gauge-quotient receipt: `bbe5b2daee1a2e018299a4adb223cd42ce479057`  
Production mutation: **NONE**  
Vercel authority: **NONE**

---

## 0. Naming firewall

`claim descent` is a software/research nickname only.

This chamber does **not** establish:

```text
sheaf descent
stack descent
categorical descent
functorial semantics
Grothendieck topology
```

No such mathematical structure may be inferred from the nickname.

---

## 1. Question

The parent assay demonstrated that a raw holonomy matrix can remain unidentified while its GL(2,F31) conjugacy class is constant across the complete compatible family.

This chamber generalizes the bookkeeping question:

> Given a finite complete compatible family and a preregistered library of downstream observables, which claims remain exactly constant across every candidate still admitted by the evidence?

The instrument does not select a preferred candidate.

It evaluates claims over the entire identified set.

---

## 2. Core rule

For compatible family:

```text
C = {c1,...,ck}
```

and preregistered observable:

```text
f : C -> V
```

freeze the exact image:

```text
f(C) = {f(c) : c in C}
```

Then:

```text
claim_identified(f,C) iff |f(C)| = 1
```

If:

```text
|f(C)| > 1
```

freeze an explicit counterexample pair:

```text
(ci,cj)
```

with:

```text
f(ci) != f(cj)
```

Required governance rule candidate:

```text
ADMIT_ONLY_DOWNSTREAM_CLAIMS_CONSTANT_OVER_THE_FULL_CURRENT_COMPATIBLE_FAMILY
```

This is a research candidate rule, not production governance.

---

## 3. Totality obligation

A claim function may receive `IDENTIFIED` status only if it is defined for **every** candidate in the compatible family.

If any candidate is outside the function's declared domain:

```text
CLAIM_DOMAIN_INCOMPLETE_OVER_COMPATIBLE_FAMILY
```

The instrument may not silently discard inconvenient candidates.

---

## 4. Frozen compatible families

Reuse the exact matched-nullspace families from the parent assay.

### Family Q1

```text
C_Q1 = { [[2,b],[0,5]] : b in F_31 }
```

Expected raw posture:

```text
|C_Q1| = 31
raw representative unidentified
```

### Family Q2

```text
C_Q2 = { [[3,b],[0,3]] : b in F_31 }
```

Expected raw posture:

```text
|C_Q2| = 31
raw representative unidentified
```

No candidates may be removed after claim values are observed.

---

## 5. Preregistered claim library

The library is frozen before execution.

For each matrix `H`, evaluate:

### RAW_MATRIX

```text
H itself
```

### TRACE

```text
tr(H) mod 31
```

### DETERMINANT

```text
det(H) mod 31
```

### DISCRIMINANT

```text
tr(H)^2 - 4 det(H) mod 31
```

### CONJUGACY_FINGERPRINT

Use the frozen parent gauge-blind GL(2,F31) fingerprint including repeated-root shifted rank when required.

### LOOP_IS_IDENTITY

```text
H == I
```

### RANK_H_MINUS_I

```text
rank(H-I)
```

### REPEATED_ROOT_TYPE

Use parent classifier output:

```text
SCALAR_REPEATED_ROOT
NONTRIVIAL_JORDAN_REPEATED_ROOT
NOT_REPEATED_ROOT
```

`null` from an implementation may not be allowed to create accidental equality with another semantic class; nonrepeated matrices must be normalized explicitly to `NOT_REPEATED_ROOT`.

---

## 6. Required Q1 pattern

The implementation must compute the image of every preregistered claim over all 31 members.

Expected scientific pattern:

```text
RAW_MATRIX                 -> NOT IDENTIFIED
TRACE                      -> IDENTIFIED
DETERMINANT                -> IDENTIFIED
DISCRIMINANT               -> IDENTIFIED
CONJUGACY_FINGERPRINT      -> IDENTIFIED
LOOP_IS_IDENTITY           -> IDENTIFIED
RANK_H_MINUS_I             -> IDENTIFIED
REPEATED_ROOT_TYPE         -> IDENTIFIED as NOT_REPEATED_ROOT
```

No expected constant value may be hard-coded into the claim verdict.

---

## 7. Required Q2 pattern

Expected pattern:

```text
RAW_MATRIX                 -> NOT IDENTIFIED
TRACE                      -> IDENTIFIED
DETERMINANT                -> IDENTIFIED
DISCRIMINANT               -> IDENTIFIED
CONJUGACY_FINGERPRINT      -> NOT IDENTIFIED
LOOP_IS_IDENTITY           -> IDENTIFIED
RANK_H_MINUS_I             -> IDENTIFIED
REPEATED_ROOT_TYPE         -> NOT IDENTIFIED
```

The hostile family therefore must demonstrate:

```text
coarser claims can remain identified
while a finer quotient claim remains unidentified
```

---

## 8. Counterexample receipts

Every withheld claim must freeze:

```text
claim_id
left_candidate_index
right_candidate_index
left_value
right_value
```

The witness pair must come from the complete compatible family.

A nonconstant verdict without a concrete witness pair is inadmissible.

---

## 9. No monotonicity laundering

The ledger may observe that one claim is coarser than another in these fixtures.

It may not infer a universal implication such as:

```text
trace identified -> conjugacy identified
```

or:

```text
conjugacy identified -> raw matrix identified
```

Each claim must be evaluated independently over the compatible family.

---

## 10. Falsifiers

The chamber fails if any occur:

1. the compatible family is not complete;
2. a candidate is removed after evaluating claims;
3. a claim receives IDENTIFIED status while undefined for any candidate;
4. a nonconstant claim lacks an explicit counterexample pair;
5. Q1 raw matrices collapse to a single representative;
6. Q1 conjugacy fingerprint varies;
7. Q2 conjugacy fingerprint fails to vary;
8. Q2 trace/determinant/discriminant unexpectedly vary;
9. semantic `NOT_REPEATED_ROOT` is conflated with missing data;
10. the software nickname `claim descent` is promoted into sheaf/categorical structure;
11. one finite-family result is promoted into a universal epistemology theorem.

---

## 11. Allowed bounded outcome

A full pass may earn:

```text
DOWNSTREAM_CLAIM_IDENTIFIABILITY_CAN_BE_STRICTLY_COARSER_THAN_RAW_STATE_IDENTIFIABILITY_IN_AUTHORED_FINITE_COMPATIBLE_FAMILIES
```

and may strengthen the research-rule candidate:

```text
WITHHOLD_ONLY_DOWNSTREAM_CLAIMS_THAT_VARY_ACROSS_THE_FULL_CURRENT_COMPATIBLE_FAMILY
```

This remains set-valued inverse-problem bookkeeping in exact synthetic finite families.

No physical ontology, universal admissibility theorem, sheaf structure, Proto-Loom authority, production authority, or Vercel authority follows.

𝌋

⟐