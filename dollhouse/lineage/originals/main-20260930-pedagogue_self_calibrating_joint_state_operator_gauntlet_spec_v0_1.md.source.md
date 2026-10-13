# Pedagogue Self-Calibrating Joint State–Operator Gauntlet · v0.1

**Program:** A15-R0 phase-free research field  
**Status:** AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY  
**Authority:** no stage succession, no live Ash mutation, no production deployment  
**Pedagogue posture:** hydration allowed; promotion authority closed

## 0. Research question

The known-forward relational reconstruction fixture assumes every forward operator is declared exactly. This gauntlet removes one assumption without widening into blind inversion:

> When a forward operator contains one hidden calibration parameter, can a finite observation family jointly identify the latent state and that calibration parameter—and can the same instrument recognize a state–instrument confound when the split is not identifiable?

This is a **joint state–calibration inverse problem**. It is not blind tomography, operator tomography, physical sensor calibration, system identification in a live environment, or a claim that TD613 reconstructs its own machinery.

## 1. Positive synthetic fixture

Declare latent state

```text
S* = [x,y]^T = [2,3]^T
```

and one hidden calibration parameter

```text
θ* = 2
```

The reconstructor receives three observations from the declared partially-known forward family:

```text
P1(S,θ) = x + θy
P2(S,θ) = θx + y
P3(S)   = x - y
```

so the authored oracle generates

```text
O = [8,7,-1].
```

The oracle values `[2,3,2]` remain unavailable to the inverse routine.

### 1.1 Closed-form joint inverse

For `P3 != 0`,

```text
P1 - P2 = (1 - θ) P3
```

so

```text
θ_hat = 1 - (P1 - P2) / P3.
```

When additionally `1 + θ_hat != 0`,

```text
x_hat + y_hat = (P1 + P2) / (1 + θ_hat)
x_hat - y_hat = P3
```

and therefore

```text
x_hat = ((x+y)_hat + P3)/2
y_hat = ((x+y)_hat - P3)/2.
```

The expected positive reconstruction is

```text
[x_hat,y_hat,θ_hat] = [2,3,2].
```

## 2. Local identifiability witness

The forward map

```text
G(x,y,θ) = [x+θy, θx+y, x-y]
```

has Jacobian

```text
J = [1   θ   y
     θ   1   x
     1  -1   0].
```

At the positive oracle `(x,y,θ)=(2,3,2)`, the authored expectation is

```text
rank(J)=3
det(J)=-3.
```

Full local rank is necessary for the bounded local-identifiability classification used by this fixture. It does not establish global identifiability outside the declared finite synthetic domain.

## 3. Hostile singular fixture · state–instrument confound

Predeclare a second oracle

```text
S_c = [2,2]^T
θ_c = 2
```

which generates

```text
O_c = [6,6,0].
```

When `x=y`, `P3=0` and

```text
P1=P2=(1+θ)x.
```

Distinct state–calibration pairs can therefore produce identical observations. The fixture must include at least these compatible alternatives:

```text
(x,y,θ) = (2,2,2)
(x,y,θ) = (3,3,1)
(x,y,θ) = (1,1,5)
```

all of which produce `[6,6,0]`.

At `(2,2,2)`, the authored Jacobian expectation is

```text
rank(J)=2
det(J)=0.
```

The solver is forbidden to choose an arbitrary member of this family. Required verdict:

```text
JOINT_STATE_CALIBRATION_UNIDENTIFIED
```

This is the primary hostile control.

## 4. Predeclared discriminator library

The gauntlet may expose Pedagogue to a small **predeclared candidate probe library** only after the primary confound has been recognized. The purpose is to test experimental-question selection, not to retroactively pretend the original observation family was identifying.

Candidate discriminators:

```text
C1(x,y,θ) = θx
C2(x,y,θ) = x+y
C3(x,y,θ) = P1 = x+θy
```

Against the declared compatible family above:

```text
C1 -> [4,3,5]  // separates all three
C2 -> [4,6,2]  // separates all three
C3 -> [6,6,6]  // separates none
```

Pedagogue must score a discriminator by the partition it induces over the **currently compatible family**, without consulting the oracle label. A candidate that merely repeats an already-observed direction must receive no novelty credit.

The gauntlet may classify `C1` or `C2` as a maximally discriminating next measurement, with deterministic tie-breaking declared in implementation. It must classify `C3` as redundant for this confound.

This creates a bounded transition:

```text
unidentified inverse problem
→ explicit compatible family
→ predeclared discriminating-probe search
→ proposed next observation
```

It does **not** authorize autonomous experiment execution, physical control, or production mutation.

## 5. Pedagogue learning target

Candidate reusable relation:

```text
an apparent latent-state change can be observationally exchangeable with calibration change;
joint reconstruction is warranted only where the state–instrument split is itself identifiable.
```

Companion relation:

```text
when an inverse problem remains unidentified, the next useful action may be to select a probe that maximally separates the surviving compatible family rather than to force a point estimate.
```

These remain research-refinement candidates. A single synthetic fixture cannot promote them into universal Pedagogue law.

## 6. Required hostile checks

The implementation must fail closed if any of the following occurs:

1. The positive fixture fails to recover `[2,3,2]` exactly.
2. The positive Jacobian loses full rank.
3. The singular fixture is assigned a unique state/calibration point.
4. The declared compatible alternatives fail to reproduce `[6,6,0]`.
5. The singular Jacobian is reported full rank.
6. A redundant discriminator (`C3`) is treated as informative merely because it has a distinct name.
7. Probe selection consults the hidden oracle identity rather than only the compatible family and declared candidate library.
8. The primary unidentified verdict is overwritten merely because an additional discriminator could be collected later.
9. Any claim promotes to blind tomography, operator tomography, physical calibration, live TD613 reconstruction, A16, Proto-Loom, or production authority.

## 7. Claim ceiling

```text
joint_state_calibration_fixture = SIMULATED
partially_unknown_forward_operator = true
positive_local_joint_identifiability = TESTABLE_IN_DECLARED_FIXTURE
state_instrument_confound = PREDECLARED_HOSTILE_CONTROL
adaptive_probe_suggestion = BOUNDED_PREDECLARED_LIBRARY_ONLY
blind_tomography = false
operator_tomography = false
physical_tomography = false
physical_sensor_calibration = false
live_td613_self_calibration = false
autonomous_experiment_execution = false
pedagogue_law_promoted = false
promotion_authority = false
production_mutation_authorized = false
human_closure_required = true
```

## 8. Success criteria

The gauntlet succeeds only if it can hold both statements simultaneously:

```text
POSITIVE:
state + calibration are jointly recoverable in one declared nonsingular synthetic geometry
```

and

```text
HOSTILE:
state + calibration are not separately recoverable in the declared singular geometry,
so the machine abstains and can only propose a discriminating next observation.
```

The intended epistemic lesson is not “self-calibration works.” It is:

> **self-calibration has an identifiability boundary, and the instrument must know when it has crossed it.**
