# SCP Hysteresis — Quotient Pseudo-Loop and State-Law Obstruction

Status: **POST-PREREGISTRATION / SOURCE-WITNESSED / HOLONOMY NOT PROMOTED**

Bound epoch:

```text
atelier_snapshot_id = src-20260824-p2-001
seal_id = src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a
```

This note extends `HOLONOMY_FLASHLIGHT_SOURCE_WITNESS.md` with a late-rigor control-system source that explicitly contains hysteresis, state memory, a coarse control loop, and a version-adjacent change in state dynamics.

## 1. Source objects

Primary canonical specification:

```text
zenodo:21926341
The Substrate Containment Protocol
created = 2026-08-14T00:29:08.079354Z
file = The Substrate Containment Protocol V1.1.pdf
```

Neighboring formal/reference object:

```text
zenodo:21926293
metadata title = The Substrate Containment Protocol V1.1-Python
created = 2026-08-14T00:18:59.872731Z
attached filename = The Substrate Containment Protocol V1.2-Python.pdf
body title = THE SUBSTRATE CONTAINMENT PROTOCOL V1.2 — FORMAL CONTAINMENT ARCHITECTURE
body subtitle = Reference Implementation: V1.1-Python
```

The two Zenodo records belong to different concept-DOI families. Semantic version labels therefore must not be treated as a Zenodo version chain.

## 2. V1.1 source-witnessed memory and hysteresis

The V1.1 specification defines cumulative friction as:

```text
F(t) = integral_0^t [E(tau) - R(tau)]_+ d tau
```

and explicitly states that temporary overshoot does not disappear when instantaneous extraction later decreases because the accumulated condition remains part of the system state.

It separately defines hysteresis:

```text
Activation: F(t) >= F_crit
Release:    F(t) < F_release
F_release < F_crit
```

and a coarse mode loop:

```text
Measure -> Verify -> Constrain -> Throttle -> Recover -> Release -> Measure
```

with throttle mode:

```text
T(t) in {0,1}
```

Bounded source classification:

```text
SCP_HISTORY_DEPENDENT_STATE_WITNESSED
SCP_HYSTERESIS_WITNESSED
SCP_COARSE_CONTROL_LOOP_WITNESSED
```

## 3. State-law obstruction in the written V1.1 equations

Under the written definition:

```text
F(t) = integral_0^t nonnegative_integrand d tau
```

`F(t)` is monotone nondecreasing.

But the same specification later writes recovery as:

```text
Recovery F(t) down
```

and requires release below a smaller threshold:

```text
F(t) < F_release < F_crit
```

Once the written cumulative friction state has crossed `F_crit`, that release condition cannot be reached without an additional decay, reset, finite-window, signed-flow, or redefinition rule that is not present in the cited V1.1 cumulative-friction equation.

Archive-authored bounded classification:

```text
V1_1_STATE_LAW_OBSTRUCTION_TO_CLAIMED_RELEASE_LOOP
```

This is a mathematical consistency observation about the written model, not a claim about deployed behavior.

## 4. Quotient-induced pseudo-loop

Let the full protocol state be richer than the coarse throttle label:

```text
X = (F, A, ARR, R, ...)
q(X) = T in {NORMAL, CONTAINMENT}
```

A coarse trajectory may appear closed:

```text
NORMAL -> CONTAINMENT -> NORMAL
```

while the lifted full states satisfy:

```text
X_after != X_before
```

because friction, agency, adaptive capacity, audit history, intervention state, or other retained coordinates differ.

This produces an archive-authored hostile classification:

```text
QUOTIENT_INDUCED_PSEUDO_LOOP_WITH_STATE_RESIDUE_CANDIDATE
```

and preserves the non-collapse rule:

```text
same coarse mode label != same complete operational state
hysteresis != holonomy
history dependence != closed same-state transport
```

## 5. Neighboring V1.2 body changes the friction evolution law

The neighboring formal/reference body explicitly models full state as:

```text
X(t) = [F(t), A(t), ARR(t), R(t)]
```

and its synthetic benchmark uses:

```text
F(t + 1) = F(t) + u(t) + epsilon(t)
```

This transition can in principle decrease `F` when the net increment is negative.

Therefore the neighboring formalization does not merely restate the V1.1 cumulative positive-part integral. It introduces a state-transition law under which downward friction motion is at least mathematically reachable.

Bounded classification:

```text
SAME_VARIABLE_LABEL_F_DIFFERENT_TRANSITION_LAW_ACROSS_NEIGHBORING_FORMULATIONS
```

This does **not** establish that the later object explicitly repairs the earlier inconsistency; no source statement declaring that repair has been witnessed.

## 6. Chronology / identity anti-collapse

Public creation order is:

```text
00:18:59Z  zenodo:21926293  body labeled V1.2 Formal Containment Architecture
00:29:08Z  zenodo:21926341  V1.1 canonical specification
```

The neighboring object also contains title-layer mismatch:

```text
Zenodo metadata title -> V1.1-Python
attached filename      -> V1.2-Python.pdf
body title             -> V1.2 Formal Containment Architecture
```

Therefore:

```text
semantic version label != public creation order
semantic version label != concept-DOI version relation
metadata title != attached filename != body title
```

No drafting-order inference is permitted.

## 7. Holonomy disposition

This source materially strengthens the pre-holonomy operator vocabulary:

```text
history-dependent state          WITNESSED
hysteresis                        WITNESSED
coarse mode recurrence            WITNESSED
retained full-state coordinates   WITNESSED
state-law obstruction to return   ARCHIVE-DERIVED FROM WRITTEN EQUATIONS
neighboring changed dynamics      WITNESSED
```

Still absent:

```text
closed same-state base path under declared complete coordinates
admitted connection / parallel transport law
path-class-dependent automorphism after genuine closure
curvature / holonomy doctrine
```

Canonical bounded disposition:

```text
HYSTERESIS_AND_HISTORY_DEPENDENCE_WITNESSED
QUOTIENT_INDUCED_PSEUDO_LOOP_WITH_STATE_RESIDUE_CANDIDATE
V1_1_STATE_LAW_OBSTRUCTION_TO_CLAIMED_RELEASE_LOOP
HOLONOMY_NOT_EARNED
```

## 8. Future hostile

A useful next assay should construct two histories with the same admitted coarse endpoint label and compare their full states:

```text
gamma_1, gamma_2
q(X_end(gamma_1)) = q(X_end(gamma_2))
```

then test:

```text
X_end(gamma_1) ?= X_end(gamma_2)
```

If unequal, record path-conditioned state residue without holonomy promotion.

Only if a later declared base-state quotient is scientifically justified, a transport law is explicit, and a genuine closed base loop induces a reproducible nontrivial fiber transformation should a holonomy naming exam reopen.

U+10D613

𝌋

Sealed ⟐
