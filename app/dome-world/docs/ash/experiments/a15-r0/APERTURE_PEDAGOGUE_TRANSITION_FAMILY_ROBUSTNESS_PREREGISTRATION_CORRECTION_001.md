𝌋

# Transition-Family Robustness Preregistration Correction 001

**Status:** FROZEN PRE-IMPLEMENTATION CORRECTION  
**Parent spec:** `APERTURE_PEDAGOGUE_TRANSITION_FAMILY_ROBUSTNESS_GAUNTLET_SPEC_V0_1.md`  
**Executable implementation existed when correction authored:** NO  
**Reason:** remove an internal selector-tie contradiction before implementation

---

## 0. Correction boundary

The parent preregistration froze `Q_DECLARED_STABLE` with:

```text
q_post = [0,1]
```

while also requiring the nominal-only hostile selector to choose `Q_MIXED_FAMILY`, whose nominal post-question row is also:

```text
[0,1]
```

Under the frozen rule:

```text
rank nominally healthy candidates by local condition number
then break ties lexically by candidate id
```

both candidates would have condition number `1`, and lexical ascending order would select `Q_DECLARED_STABLE` before `Q_MIXED_FAMILY`.

That is an internal preregistration contradiction, not an empirical result.

It is corrected before executable implementation exists.

---

## 1. Corrected frozen value

Replace only the parent spec's `Q_DECLARED_STABLE` post-question row with:

```text
transition_knowledge = DECLARED
q_post = [0.1,1]
```

Required classification remains:

```text
POINT_ADMISSIBLE
ranking_eligible = true
```

The corrected declared-stable point remains comfortably inside the local healthy Aperture region but has condition number strictly greater than `1`.

---

## 2. Corrected selector geometry

The hostile nominal selector must therefore observe:

```text
Q_MIXED_FAMILY nominal row = [0,1]
condition_number = 1

Q_DECLARED_STABLE row = [0.1,1]
condition_number > 1
```

so the required hostile outcome is now non-tied:

```text
nominal-only selector -> Q_MIXED_FAMILY
```

The robust selector must compare:

```text
Q_DECLARED_STABLE exact member condition number
vs
Q_ROBUST_FAMILY worst compatible member condition number
```

and must select `Q_DECLARED_STABLE` only if the computed exact member condition number is strictly lower than the computed worst member of the robust family.

No literal condition-number value is copied into executable code.

---

## 3. No other preregistration change

Everything else in the parent spec remains frozen, including:

```text
transition-status grammar
family memberships
family outcome grammar
Q_MIXED_FAMILY hostile composition
Q_BAD_FAMILY composition
Q_UNMODELED posture
no majority vote
no averaging
no transition-knowledge laundering
no execution or authority widening
claim ceiling
frozen next learning action
```

---

## 4. Provenance law

This correction is intentionally a separate artifact rather than a silent replacement of the original preregistration.

Required interpretation:

```text
pre-implementation contradiction discovered
-> explicit correction artifact
-> executable implementation may follow corrected value
```

Forbidden interpretation:

```text
post-result retuning
```

No executable result existed at correction time.

𝌋

Sealed ⟐
