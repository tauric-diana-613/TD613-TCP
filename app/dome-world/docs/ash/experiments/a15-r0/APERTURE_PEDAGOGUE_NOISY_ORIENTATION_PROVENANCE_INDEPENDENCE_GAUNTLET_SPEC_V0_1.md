# A15-R0 · Aperture × Pedagogue Noisy Orientation + Provenance Independence Gauntlet v0.1

Status: **PREREGISTERED / PRE-IMPLEMENTATION / SYNTHETIC / NON-PROMOTIONAL**  
Parent witness: `td613.a15-r0.aperture-pedagogue-minimal-decision-custody-state/v0.1`  
Authority: A2 derivational research only  
Installed Aperture mutation: forbidden  
Pedagogue promotion authority: forbidden  
Production / Vercel authority: forbidden

## 0. Question

The parent decision/custody fixture established a local separation:

- signed current orientation was enough to choose between two exact repair families across the authored outer states;
- route provenance carried equal decision separation when clean;
- route-label corruption broke the route selector while leaving the current orientation selector intact;
- near the sign boundary, both repair questions became admissible, so extra state detail retained custody value without adding local decision value.

Two trust assumptions remain untested.

### Decision-side trust seam

The parent selector received exact sign. This gauntlet replaces exact sign with:

```text
orientation estimate y_hat
+ declared absolute error bound b
```

and asks whether a sign decision is allowed only when the entire declared interval stays on one side of zero.

### Custody-side trust seam

The parent fixture preserved route provenance but did not test whether multiple custody witnesses were genuinely independent. This gauntlet introduces declared synthetic source roots and asks whether duplicate descendants can amplify one source or outvote a contradictory independent root.

These are parallel hostile controls. No theorem connects orientation uncertainty to provenance independence.

## 1. Inherited outer state family

Reuse the parent outer magnitudes:

```text
m in {0.0008, 0.0010, 0.0012}
s in {+1, -1}
true responsive row = [1, s*m]
```

Inherited repair questions remain fixed:

```text
Q_PLUS_REPAIR
Q_MINUS_REPAIR
```

Required true-state consequence remains:

```text
positive outer state -> Q_PLUS_REPAIR closes; Q_MINUS_REPAIR remains PROPOSE
negative outer state -> Q_MINUS_REPAIR closes; Q_PLUS_REPAIR remains PROPOSE
```

No repair matrix may be retuned for noise.

## 2. Declared orientation observation model

For each true signed coordinate `y`:

```text
y_hat = y + eta
```

The observer supplies a declared symmetric absolute bound:

```text
|eta| <= b
```

The decision layer must use the interval:

```text
I = [y_hat - b, y_hat + b]
```

### 2.1 Frozen sign-certification rule

```text
if lower(I) > 0:
  CERTIFIED_POSITIVE -> Q_PLUS_REPAIR

else if upper(I) < 0:
  CERTIFIED_NEGATIVE -> Q_MINUS_REPAIR

else:
  ORIENTATION_UNRESOLVED -> ABSTAIN_ORIENTATION_UNRESOLVED
```

The inequalities are strict. Touching zero is unresolved.

Point-estimate sign alone may not override an interval crossing zero.

## 3. Frozen valid-noise outer grid

Use:

```text
b = 0.0002
eta in {-0.0002, 0, +0.0002}
```

for every one of the six outer states.

Total outer noisy observations:

```text
6 states * 3 eta values = 18 cases
```

Preregistered result:

```text
all 18 declared intervals remain strictly on the true side of zero
all 18 certified signs equal the synthetic true sign
all 18 selected repair questions close
orientation abstentions = 0 / 18
wrong-sign certifications = 0 / 18
```

This supports only the bounded statement that the interval rule preserves the parent repair distinction under this declared valid-noise envelope.

## 4. Frozen near-zero ambiguity controls

Use the parent decision-equivalence neighborhood:

```text
y in {
  -0.0002,
  -0.0001,
   0,
  +0.0001,
  +0.0002
}
y_hat = y
b = 0.0002
```

Because the interval touches or crosses zero in every case, required orientation posture is:

```text
ORIENTATION_UNRESOLVED
ABSTAIN_ORIENTATION_UNRESOLVED
```

for all five cases.

Separately re-audit both inherited repair questions on the true state. Expected:

```text
Q_PLUS_REPAIR -> ASK_NOTHING
Q_MINUS_REPAIR -> ASK_NOTHING
```

for all five cases under the inherited parent thresholds.

Therefore:

```text
orientation uncertainty != decision catastrophe
```

inside this authored decision-equivalence band. The selector may abstain while custody records that both candidate repairs are locally admissible.

## 5. Underdeclared-noise falsifier

Create one deliberately invalid observation contract:

```text
true y = +0.0008
y_hat = -0.0001
declared b = 0.00005
actual |eta| = 0.0009 > declared b
```

The interval rule, if it trusted the false bound alone, would certify a negative sign and choose `Q_MINUS_REPAIR`, which must fail to close the true positive state.

Because synthetic truth is available in this gauntlet, the receipt must classify:

```text
DECLARED_NOISE_BOUND_FALSIFIED_BY_SYNTHETIC_TRUTH
```

and must **not** count the case as evidence that the certified-sign rule is valid under its declared assumptions.

Required anti-equivalence:

```text
wrong action under falsified noise bound != failure of rule under valid noise bound
```

No real deployment may assume access to synthetic truth.

## 6. Custody witness schema

Each synthetic route-provenance witness contains:

```text
witness_id
source_root_id
route_value
derivation_kind
```

Allowed derivation kinds:

```text
PRIMARY
COPY_OF_ROOT
INDEPENDENT_SYNTHETIC_ROOT
```

Independence in this gauntlet is **declared synthetic independence only**. Different `source_root_id` values are not a real-world proof of independence.

## 7. Frozen independence classifier

The classifier must first group all records by `source_root_id`.

### 7.1 Same-root duplicates

Multiple agreeing records from one root count as:

```text
unique_root_count = 1
independent_support_count = 1
status = SINGLE_ROOT_DUPLICATES_DO_NOT_AMPLIFY
```

Raw record count may exceed one but may not be used as independent evidence count.

### 7.2 Multi-root agreement

Two or more distinct declared roots agreeing on one route value produce:

```text
status = MULTI_ROOT_AGREEMENT_IN_BOUNDED_SYNTHETIC_FIXTURE
```

The receipt may report the distinct-root count but may not promote declared synthetic roots into real-world independence.

### 7.3 Multi-root conflict

If distinct roots disagree on route value:

```text
status = PROVENANCE_CONFLICT_HOLD
resolved_route = null
```

No majority vote is allowed.

### 7.4 Same-root internal conflict

If records sharing one source root disagree with each other:

```text
status = SOURCE_ROOT_INTERNAL_CONFLICT_HOLD
resolved_route = null
```

This takes precedence over apparent agreement elsewhere.

## 8. Frozen provenance fixtures

### P1 · duplicate non-amplification

```text
W1: root R1, Q_A, PRIMARY
W2: root R1, Q_A, COPY_OF_ROOT
```

Required:

```text
raw records = 2
unique roots = 1
independent support = 1
status = SINGLE_ROOT_DUPLICATES_DO_NOT_AMPLIFY
resolved route = Q_A
```

### P2 · declared multi-root agreement

```text
W1: root R1, Q_A, PRIMARY
W3: root R2, Q_A, INDEPENDENT_SYNTHETIC_ROOT
```

Required:

```text
unique roots = 2
status = MULTI_ROOT_AGREEMENT_IN_BOUNDED_SYNTHETIC_FIXTURE
resolved route = Q_A
```

### P3 · independent-root conflict

```text
W1: root R1, Q_A, PRIMARY
W4: root R2, Q_B, INDEPENDENT_SYNTHETIC_ROOT
```

Required:

```text
status = PROVENANCE_CONFLICT_HOLD
resolved route = null
```

### P4 · duplicate-majority laundering falsifier

```text
W_BAD_1: root RBAD, Q_B, PRIMARY
W_BAD_2: root RBAD, Q_B, COPY_OF_ROOT
W_GOOD:  root RGOOD, Q_A, INDEPENDENT_SYNTHETIC_ROOT
```

Raw record majority says `Q_B` by `2:1`, but distinct roots conflict `1:1`.

Required:

```text
status = PROVENANCE_CONFLICT_HOLD
resolved route = null
duplicate_majority_vote_used = false
```

### P5 · same-root internal conflict

```text
W5A: root R5, Q_A, PRIMARY
W5B: root R5, Q_B, COPY_OF_ROOT
```

Required:

```text
status = SOURCE_ROOT_INTERNAL_CONFLICT_HOLD
resolved route = null
```

## 9. Decision / custody non-interference law

The orientation decision assay and provenance classifier must remain distinct.

Required:

```text
orientation classifier may not rewrite route_value
provenance classifier may not infer route_value from orientation geometry
custody conflict may not be silently repaired by current sign
current sign may not be overwritten to match route provenance
```

When provenance is conflicting but orientation is certified, the receipt may report both facts side by side:

```text
orientation decision = locally actionable in synthetic decision fixture
provenance custody = HOLD
```

It may not collapse them into one confidence score.

## 10. Success criterion

Pass only if:

1. all 18 valid-noise outer cases have correct certified sign and close under the selected inherited repair;
2. all five near-zero cases abstain on orientation;
3. both repairs remain admissible for all five near-zero true states;
4. the underdeclared-noise falsifier is detected from synthetic truth and excluded from valid-bound support;
5. P1 refuses duplicate amplification;
6. P2 records bounded declared multi-root agreement;
7. P3 holds on cross-root conflict;
8. P4 refuses raw-record majority laundering;
9. P5 holds on same-root internal conflict;
10. orientation and provenance outputs remain separate typed objects;
11. no selector or classifier automatically executes an experiment, repairs custody, or transfers authority;
12. installed Aperture remains unchanged.

Allowed bounded statement:

> **In this synthetic fixture, interval-certified signed orientation preserves the parent repair distinction across an 18-case declared valid-noise envelope and abstains across a five-case zero-crossing neighborhood. A falsified noise-bound control demonstrates that the guarantee depends on the declared observation model. Separately, custody witnesses grouped by declared source root prevent duplicate amplification and hold rather than majority-vote through conflicting provenance. The decision coordinate and custody record therefore remain separable under these authored hostile controls.**

## 11. Anti-equivalences

```text
point estimate sign != certified sign
noise bound declared != noise bound true
orientation unresolved != forced choice
orientation unresolved != decision catastrophe in an equivalence band
wrong action under falsified bound != valid-bound rule failure
record count != independent support count
different source_root_id != proven real-world independence
duplicate agreement != independent corroboration
majority records != provenance resolution
current geometry != authority to rewrite custody
custody conflict != orientation uncertainty
decision state != custody state
confidence scalar != typed decision plus typed custody
counterfactual repair replay != autonomous execution
```

## 12. Claim ceiling

No measurement-error theorem, statistical calibration theorem, robust-control theorem, sufficient-statistic theorem, Markov/POMDP theorem, active learning, reinforcement learning, optimal experimental design, causal intervention theorem, real-world provenance independence claim, consensus theorem, connection, curvature, Berry structure, geometric phase, holonomy, physical sensor feedback, physical/blind/operator tomography, TD613-general AIA theorem, Proto-Loom, autonomous execution, production authority, or Vercel authority.

## 13. Frozen next learning action

If witnessed:

```text
TEST_JOINT_DECISION_AND_CUSTODY_HOLD_COMPOSITION_WHEN_ORIENTATION_IS_UNRESOLVED_PROVENANCE_IS_CONFLICTING_OR_BOTH_WITHOUT_MAJORITY_VOTING_CONFIDENCE_SCALAR_COLLAPSE_AUTONOMOUS_ESCALATION_ACTIVE_LEARNING_OR_HOLONOMY_PROMOTION
```

The next assay must test composition of typed holds rather than invent a universal confidence score.

---

Preregistration boundary: **frozen before executable implementation.**
