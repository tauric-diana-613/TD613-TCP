# Pedagogue Identifiability-Deficit Targeting Gauntlet · v0.1

**Program:** A15-R0 phase-free research field  
**Status:** AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY  
**Authority:** no stage succession, no live Ash mutation, no production deployment  
**Pedagogue posture:** experiment-design candidate; promotion authority closed

## 0. Research question

Previous A15-R0 fixtures established two bounded facts in different synthetic contexts:

1. repeated observations along one known forward direction cannot manufacture missing operator rank;
2. a partially unknown forward operator can create a state–instrument confound whose local Jacobian has nonzero nullity.

This gauntlet asks whether those two observations admit one operational experiment-design criterion:

> Given a declared local forward model and a predeclared candidate probe library, can Pedagogue identify which candidate observations reduce the current local identifiability deficit by testing whether they augment operator/Jacobian rank against the current nullspace?

The assay is deliberately local, linearized, finite-library, and synthetic. It is not a theorem of optimal experimental design, active learning, system identification, blind tomography, operator tomography, physical sensor control, or autonomous experimentation.

## 1. Core operational criterion

Let the current local observation operator/Jacobian be `J` with parameter dimension `p`.

```text
rank(J) = r
nullity(J) = p - r
```

A candidate scalar probe `C_k` has local gradient row

```text
g_k = ∇C_k.
```

Append the row:

```text
J_k = [J; g_k].
```

Define the bounded rank-lift score

```text
Δr_k = rank(J_k) - rank(J).
```

For this finite local assay:

```text
Δr_k > 0
```

means the candidate probe removes at least one local blind direction.

A renamed/repeated probe whose gradient is already in the row span of `J` must receive

```text
Δr_k = 0.
```

The equivalent nullspace diagnostic may be recorded:

```text
g_k · n != 0
```

for at least one current null vector `n` implies sensitivity along a currently invisible local direction. Ranking authority, however, belongs first to rank lift rather than raw dot-product magnitude because the latter depends on parameter/probe scaling.

## 2. Context A · partially unknown state–instrument geometry

Reuse the previously declared self-calibration forward family:

```text
P1(x,y,θ) = x + θy
P2(x,y,θ) = θx + y
P3(x,y,θ) = x - y
```

At the hostile confounded point

```text
(x,y,θ) = (2,2,2)
```

the Jacobian is

```text
J_c = [1   2   2
       2   1   2
       1  -1   0]
```

with

```text
rank(J_c)=2
nullity(J_c)=1
det(J_c)=0.
```

A canonical integer-scaled null direction is predeclared as

```text
n_c = [2,2,-3]^T
```

because

```text
J_c n_c = 0.
```

This tangent is consistent with the exact compatible manifold for observations `[6,6,0]`:

```text
x = y = 6/(1+θ)
```

where the local tangent at `θ=2` is proportional to `[2,2,-3]`.

### 2.1 Candidate library

At `(2,2,2)`:

```text
C1 = θx       ; ∇C1 = [2,0,2]
C2 = x+y      ; ∇C2 = [1,1,0]
C3 = x+θy=P1  ; ∇C3 = [1,2,2]
```

Predeclared expectations:

```text
rank([J_c; ∇C1]) = 3
rank([J_c; ∇C2]) = 3
rank([J_c; ∇C3]) = 2
```

and

```text
∇C1 · n_c = -2
∇C2 · n_c =  4
∇C3 · n_c =  0.
```

Thus `C1` and `C2` are rank-augmenting candidates in this local geometry. `C3`, despite having a candidate label, is a repeated existing observation direction and must be classified as locally redundant.

The selector may choose `C1` by deterministic probe-id tie-break after equal rank lift. It may not call `C1` globally optimal.

## 3. Context B · known-forward repeated-direction geometry

Reuse the earlier known-forward latent-state family

```text
S=[x,y,z]^T
F12=x+y
F23=y+z
F13=x+z.
```

Begin from a deliberately redundant operator stack containing three copies of `F12`:

```text
J_0 = [1 1 0
       1 1 0
       1 1 0]
```

so

```text
rank(J_0)=1
nullity(J_0)=2.
```

Candidate gradients/rows:

```text
G_DUP = [1,1,0]  // renamed/repeated F12
G_23  = [0,1,1]  // F23
G_13  = [1,0,1]  // F13
```

Predeclared expectations from `J_0`:

```text
rank([J_0; G_DUP]) = 1
rank([J_0; G_23 ]) = 2
rank([J_0; G_13 ]) = 2.
```

A deterministic greedy selector may choose `G_13` or `G_23` by declared tie-break. After one genuinely new row is admitted, the remaining nonredundant row must lift rank from 2 to 3, while `G_DUP` must still lift rank by 0.

This context tests iterative nullity contraction rather than one-shot full recovery.

## 4. Cross-context criterion

If both contexts pass, the assay may record the bounded reusable relation candidate:

```text
when a declared local inverse problem is rank deficient,
a candidate observation is locally informative for identifiability
only insofar as it constrains a direction that the current observation operator leaves unresolved;
renaming or repeating an already-spanned observation cannot reduce nullity.
```

Stronger language remains forbidden:

```text
Pedagogue has learned optimal experiment design        = false
Pedagogue can autonomously choose real-world sensors    = false
rank lift guarantees global identifiability             = false
full local rank guarantees stable reconstruction        = false
local nullspace equals physical hidden dimension        = false
active learning theorem established                     = false
```

## 5. Hostile checks

The implementation must fail closed if:

1. `J_c` is reported full rank before a new probe.
2. The null vector fails `J_c n_c = 0`.
3. `C3` receives positive rank lift.
4. `C1` or `C2` fails to lift the confounded Jacobian to rank 3.
5. A probe is rewarded merely for a distinct label.
6. The repeated `F12` stack reports rank above 1.
7. A duplicate `F12` candidate reduces nullity.
8. The iterative known-forward selector cannot reach rank 3 after adding both independent relational rows.
9. The selector consults the hidden oracle state to rank probes.
10. The current inverse verdict is rewritten retroactively because a future probe is available.
11. Any claim promotes to autonomous experiment control, blind tomography, operator tomography, physical calibration, connection, curvature, holonomy, A16, Proto-Loom, or production authority.

## 6. Claim ceiling

```text
identifiability_deficit_targeting_fixture = SIMULATED
local_linearized_rank_criterion = true
predeclared_probe_library_only = true
state_instrument_context = SYNTHETIC
known_forward_context = SYNTHETIC
cross_context_operational_criterion = TESTABLE
optimal_experimental_design = false
active_learning_theorem = false
global_identifiability = false
stability_guarantee = false
blind_tomography = false
operator_tomography = false
physical_tomography = false
physical_sensor_control = false
autonomous_experiment_execution = false
pedagogue_law_promoted = false
promotion_authority = false
production_mutation_authorized = false
human_closure_required = true
```

## 7. Success state

The gauntlet succeeds only if Pedagogue can say all of the following at once:

```text
I can identify the local directions the current declared operator cannot distinguish.

I can distinguish a rank-augmenting candidate observation from a renamed/repeated one.

I can propose a next synthetic observation that reduces local nullity.

I cannot infer that this locally rank-augmenting probe is globally optimal, physically executable, or sufficient for stable/global reconstruction.
```

The intended research move is:

```text
unresolved inverse problem
→ expose current nullspace / rank deficit
→ evaluate predeclared candidate probes against that deficit
→ propose rank-augmenting next observation
→ preserve original insufficiency receipt
```

If validated in both declared contexts, the next Pedagogue question becomes whether this criterion survives nonlinear/noisy/local-conditioning hostile cases without being mistaken for a universal law.
