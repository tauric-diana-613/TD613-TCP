# Ash Keep A15-R0 · Moss Lantern ML1 + ML2 Assay Spec v0.1

Status: **AUTHORED / PRE-IMPLEMENTATION / RESEARCH-ONLY / NON-RUNTIME / HUMAN-GATED**  
Sequence authority: **FALSE**  
Promotion authority: **FALSE**  
Production mutation: **NONE**  
Live Ash binding: **NONE**  
Proto-Loom implementation: **NONE**  
Transport law: **NOT DECLARED**  
Geometric holonomy claim: **NOT MADE**

## 0. Why this assay follows the literature second pass

Moss Lantern v0.1 already shows that a controlled route substitution can survive endpoint equivalence:

```text
same endpoint
!= same route history
```

The Pedagogue literature second pass adds three constraints before a stronger tomography claim is allowed:

1. visibility is not identifiability;
2. multiple probes are not automatically independent information;
3. quasiperiodic/incommensurate structure must be compared with both periodic and generic aperiodic controls before any phi-specific anti-aliasing claim.

Therefore the next executable pass combines only:

```text
ML1 · reference identifiability / anti-aliasing
+
minimum ML2 · probe-dependence control
```

Temporal-order tomography, registry-shift perturbation, transformed representation, and transport geometry remain separate later assays.

## 1. Fixed Moss Lantern object

Canonical practice fixture:

```text
tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json
```

Declared route remains unchanged:

```text
open-practice-case
→ custody-hold
→ projection-observe
→ rest
→ return
```

Expected endpoint remains:

```text
returned-practice-capsule
```

The ML1 + ML2 assay does **not** mutate route content. Its latent variable is only the position/offset of a synthetic reference registry relative to the fixed known-ground-truth object.

## 2. Finite synthetic reference family

All reference conditions use:

```text
reference length = 30 slots
one-count = 12
binary density = 12 / 30
same alphabet
same latent registry-offset family
same observation budget
same decoder
same noise model
```

### P · periodic control

A five-slot motif with exactly two marked positions is repeated across the 30-slot ring.

Purpose:

```text
create deliberate finite translational aliasing
```

### Q · finite phi / irrational-rotation reference

The 30 registry slots are ranked by the fractional orbit of an irrational rotation using phi; the same 12/30 marked-slot density is retained.

This is a **finite irrational-rotation reference surrogate**. It is not a proof that the finite fixture is a physical quasicrystal.

Purpose:

```text
test whether structured nonclosure breaks periodic aliases
```

### A · deterministic non-phi aperiodic control

A deterministic index hash ranks the same 30 slots; the same 12/30 density is retained.

Purpose:

```text
test whether any Q > P gain is specific to phi
or merely a benefit of breaking short periodic repetition
```

If A equals or exceeds Q, the allowed conclusion narrows to generic nonrepetition / anti-aliasing inside the fixture.

### C · periodic/quasiperiodic crossover control

A bounded number of periodic marked slots are exchanged with Q-only marked slots while total density remains fixed.

Purpose:

```text
prevent periodic versus quasiperiodic from becoming a forced binary ontology
```

The crossover is a finite synthetic interpolation/control, not a material phase.

## 3. Latent state and forward observation

Latent state:

```text
S_j = registry_offset j
j ∈ {0, ..., 29}
```

For reference condition R and probe offset p:

```text
O(R, j, p) = R[(j + p) mod 30]
```

The route labels and endpoint remain constant for every j.

The inverse question is:

```text
observed reference symbols
→ candidate registry offsets
```

Identifiability is measured by candidate-set ambiguity, not visual complexity.

## 4. Matched probe families

### Independent-position map

Nine distinct reference offsets are observed:

```text
[0, 1, 2, 4, 7, 11, 16, 23, 27]
```

Each receives two readings:

```text
observation budget = 18
```

### Redundant/dependence control

Nine probe labels are retained but their reference positions collapse onto only five unique offsets:

```text
[0, 0, 1, 1, 2, 2, 4, 4, 7]
```

Each again receives two readings:

```text
observation budget = 18
```

This deliberately separates:

```text
number of readings
from
number of distinct interrogated directions
```

It is a minimum dependence/redundancy control. It does not estimate a full covariance operator or PID decomposition.

## 5. Noise and replay

Default synthetic noise:

```text
seed = 613
binary substitution probability = 0.10
trials per latent registry state = 48
repeats per probe label = 2
```

No `Math.random()` is permitted.

Decoder:

```text
minimum Hamming mismatch over all 30 declared registry offsets
```

Ties remain ambiguous rather than being broken in favor of the authored ground truth.

## 6. Metrics

Each reference / probe-map condition reports:

```text
exact unique registry recovery rate
mean candidate-set size
maximum candidate-set size
noisy exact registry recovery rate
ambiguous decode rate
wrong-unique decode rate
unique probe-position count
observation budget
```

These are finite synthetic reconstruction metrics only.

## 7. Decision law

### H_NONREPETITION_REDUCES_REFERENCE_ALIASING

Bounded synthetic support requires, at minimum:

```text
Q ambiguity < P ambiguity
Q noisy exact recovery > P noisy exact recovery
A ambiguity < P ambiguity
A noisy exact recovery > P noisy exact recovery
reference density matched
independent probes outperform redundant probes on Q and A
```

### H_PHI_SPECIFIC_ANTI_ALIASING_ADVANTAGE

Phi-specific support requires Q to beat the generic aperiodic control under the same matched metrics.

If:

```text
A >= Q
```

then the result must be reported as:

```text
phi-specific advantage NOT SUPPORTED in this fixture
```

while a narrower generic nonrepetition result may still survive.

### Live architecture ceiling

Regardless of the synthetic result:

```text
H_TD613_PHI_ANTI_ALIASING = OPEN_UNMEASURED
H_TD613_TRIPLE_IDENTIFIABILITY_SYNERGY = OPEN_UNMEASURED
```

## 8. Observation aperture

The receipt must bind the result to:

```text
source:
  Moss Lantern fictional practice capsule only

instrument:
  Pedagogue research hydration
  Moss Lantern reference-identifiability assay

conditions:
  P periodic
  Q finite phi irrational-rotation
  A deterministic aperiodic control
  C crossover
  independent probe map
  redundant probe control

route content mutation:
  false

live Ash runtime:
  false

raw source transport:
  false
```

The assay may therefore state only what was or was not identifiable inside this finite synthetic aperture.

## 9. Explicit nonclaims

A passing ML1 + ML2 fixture does not establish:

- phi optimality;
- quasiperiodic optimality;
- a physical quasicrystal;
- physical phasons;
- D3 geometry;
- TD613 triple synergy;
- live-Ash tomography;
- Berry curvature or Berry phase;
- quantum metric;
- connection or curvature;
- holonomy;
- quantum behavior;
- physical inverse design;
- A16 admission;
- Proto-Loom;
- production deployment authority.

## 10. UI and deployment posture

```text
Moss Lantern dedicated UI = NOT REQUIRED
Ash UI mutation = NONE
Holonomy Loom UI mutation = NONE
TD613.com deployment = HELD
```

The fixture remains a laboratorial calibration object. Human-facing surface work is deferred until a recurring operator task is demonstrated that cannot be served by the existing Ash custody surface or a later earned Loom interpretation surface.
