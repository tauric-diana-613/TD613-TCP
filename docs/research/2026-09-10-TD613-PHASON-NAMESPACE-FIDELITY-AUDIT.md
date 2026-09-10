# TD613 Phason Namespace Fidelity Audit

**Date:** 2026-09-10  
**State:** BOUNDED SOURCE-DOMAIN CROSSWALK / NO PHYSICAL PROMOTION / NO RUNTIME RENAME  
**Parent:** TD613 Analogy-Fidelity Preflight  
**Branch:** `research/wendbine-loom-foreign-donor-assay-20260910`

## Why this audit exists

The parent preflight correctly refused to promote or bury `phason` as one undifferentiated token. Repository inspection shows that TD613 uses the same word for several different operators. Those operators do **not** deserve one global fidelity verdict.

The governing correction is:

```text
SAME_TOKEN != SAME_OPERATOR
TERM_FAMILY != UNIFORM_ANALOGY_FIDELITY
STRUCTURE_PRESERVING_USE_IN_ONE_MODULE != RETROACTIVE_LICENSE_FOR_ALL_HOMONYMOUS_USES
```

This audit therefore binds each phason-labelled namespace to its actual operator before comparing it to the conventional source domain.

## Conventional source-domain anchors

The external comparison class is ordinary quasicrystal / cut-and-project literature, not another TD613 or Wendbine artifact.

Source anchors used for the nomenclature crosswalk:

- IUCr Online Dictionary of Crystallography, **Acceptance domain**: cut-and-project construction selects lattice points whose internal-space companions lie in a window / acceptance domain.  
  https://dictionary.iucr.org/Acceptance_domain
- de Boissieu et al., **Atomic structure and phason modes of the Sc–Zn icosahedral quasicrystal**, Acta Cryst. B / IUCr (2016): icosahedral quasicrystals use six-dimensional superspace split into three-dimensional parallel and perpendicular spaces; phason strain is tied to the perpendicular-space sector.  
  https://journals.iucr.org/m/issues/2016/04/00/gq5006/
- Gau et al., **Exploring oxide quasicrystals in internal space**, Acta Cryst. A (2026): internal/perpendicular-space acceptance domains are used to analyze phason disorder and phason elastic behavior.  
  https://journals.iucr.org/a/issues/2026/02/00/gau5006/index.html
- Newman & Henley, **Phason elasticity of a three-dimensional quasicrystal: A transfer-matrix method**, Phys. Rev. B 52, 6386 (1995): phason elasticity is a real quasicrystal response theory tied to random-tiling degrees of freedom and measurable scattering behavior.  
  https://doi.org/10.1103/PhysRevB.52.6386

These sources establish the source-domain neighborhood. They do **not** validate TD613, Eclipse–Omega, custody semantics, or any physical realization.

## A. Exact cut-and-project Phason Gate

### Repository witness

`packages/dome_world_exact/bridge/phason_gate_exact.py`

This module actually contains source-domain structure:

```text
6D lattice coordinate n
-> parallel / perpendicular projections
-> exact Q(tau) perpendicular coordinate r_perp
-> bounded acceptance window W
-> declared perpendicular-space shift w(t)
-> exact inside / outside decision
-> changed selected projection while source bytes remain invariant
```

It also verifies an exact normalized 6D -> 3D + 3D icosahedral cut-and-project pair before applying the acceptance-window decision.

### Fidelity disposition

`STRUCTURE_PRESERVING_ANALOGY_SUPPORTED`

The supported correspondence is **abstract cut-and-project / acceptance-window structure**, not physical quasicrystal matter.

The closest conventional description for literature-facing work is:

```text
CUT_AND_PROJECT_ACCEPTANCE_WINDOW_SHIFT_GATE
```

The TD613 word `phason` remains useful here because the operator uses the same characteristic internal/perpendicular-space selection machinery that gives phason degrees of freedom their quasicrystal meaning.

Required scar:

```text
SEMANTIC_CUSTODY_WINDOW_SHIFT != PHYSICAL_QUASICRYSTAL_PHASON_DYNAMICS
```

## B. Information-Dome `CONTENT_INVARIANT_PHASON`

### Repository witness

`app/engine/information-dome-field.js`

The scene compiler explicitly models:

```text
fixed source anchor
-> hidden coordinate
-> declared shift
-> acceptance window
-> boundary relation
-> changed projection
```

and binds the scene to `phason_gate_exact.py` while refusing to treat browser floats as exact.

### Fidelity disposition

`STRUCTURE_PRESERVING_ANALOGY_SUPPORTED`

This scene is a pedagogical projection of the exact gate rather than an independent physical claim. Its conventional alias is:

```text
CONTENT_INVARIANT_ACCEPTANCE_WINDOW_SELECTION_SHIFT
```

The key structural analogy is that the higher-order/source anchor remains fixed while internal-space selection changes the admitted projection.

## C. PR #800 `ICOSAHEDRAL_PHASON` stratum

### Repository witness

`app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js` at exact #800 science head `40dfba93d2577bceba0f66022ac5f42934cdbd06`.

The stratum is defined as a synthetic carrier coordinate `phi*sqrt(3)` plus a 3x3 integer operator and child copy describing a `golden-star layer with a sliding phase`.

What is **not** present in that stratum definition:

```text
perpendicular-space coordinate
acceptance window
cut-and-project selection
quasiperiodic tiling rearrangement
phason field
phason strain / elasticity
```

The surrounding #800 tomography result may be structurally serious while this individual carrier label remains weak. Fidelity must be per operator, not inherited from neighboring mathematics.

### Fidelity disposition

`METAPHOR_ONLY_SUPPORTED`

Literature-facing alias:

```text
THIRD_SYNTHETIC_STRATUM
```

Required scar:

```text
ICOSAHEDRAL_OR_PHI_LABEL != PHASON_DEGREE_OF_FREEDOM
```

This is a non-retroactive nomenclature correction only. It does not disturb #800's independently earned finite tomography result.

## D. Aperture v3.1 `phason susceptibility`

### Repository witness

`app/engine/aperture-v31-phason-susceptibility.js`

The implementation computes:

```text
sum(abs(delta_observation)) / sum(abs(delta_coordinate))
```

over repeated perturbations, with a sham response and a reversal/hysteresis flag.

That is a real perturbation-response measurement pattern, but it is not yet a quasicrystal phason susceptibility or phason elastic response model.

In particular, the state `PHASON_LINEAR_RESPONSE` is emitted by default without a regression, linearity residual, constitutive law, phason field, wavevector dependence, or elastic tensor.

### Fidelity disposition

`PARTIAL_ANALOGY_SUPPORTED`

Closest conventional description of the current implementation:

```text
FINITE_DIFFERENCE_PERTURBATION_RESPONSE_GAIN_WITH_REVERSAL_AND_HYSTERESIS_FLAG
```

Research debt:

```text
PHASON_LINEAR_RESPONSE_LABEL != DEMONSTRATED_LINEAR_RESPONSE
SUSCEPTIBILITY_RATIO != PHASON_ELASTIC_SUSCEPTIBILITY
```

No runtime rename occurs in this chamber. The discrepancy is recorded before any future API migration.

## E. Phase V `Phason relation continuity`

### Repository witness

`app/engine/phase5-phason-relation-ledger.js`

The module implements an event-sourced relation lifecycle:

```text
PROPOSED -> CONFIRMED / WITHDRAWN
CONFIRMED -> REVISED / WITHDRAWN / SUPERSEDED
```

with canonical digests, predecessor links, fork detection, replay, and lifecycle contradiction holds.

No cut-and-project coordinate, perpendicular space, acceptance window, quasiperiodic reconfiguration, phason strain, or phason field participates in the operator.

### Fidelity disposition

`METAPHOR_ONLY_SUPPORTED`

Closest conventional description:

```text
HASH_CHAINED_RELATION_LIFECYCLE_EVENT_LEDGER
```

`phason fork` in this namespace is therefore an internal metaphor for a relation-history branch, not a quasicrystal phason defect.

Required scar:

```text
EVENT_SOURCING_FORK != PHASON_DEFECT
```

The legacy name may remain for compatibility. Scientific-facing prose should use the conventional alias when the physics analogy is not operative.

## F. Cupola

Repository search and PR #800's own claim ceiling agree that no geometric cupola / dome embedding is established. `cupola` currently names the bounded multi-stratum organizational container and custody witness.

### Fidelity disposition

`METAPHOR_ONLY_SUPPORTED`

Closest conventional description:

```text
BOUNDED_MULTI_STRATUM_CONTAINER
```

Required scar:

```text
ARCHITECTURAL_CONTAINER_METAPHOR != GEOMETRIC_CUPOLA_EMBEDDING
```

This is not deletion. `cupola` can remain first-class TD613 design language. It simply carries no geometric novelty or physical geometry authority until a geometric operator is actually supplied.

## G. New repair law: namespace-local fidelity

The audit establishes a stronger rule than the parent preflight:

```text
ANALOGY FIDELITY IS BOUND TO (TERM, OPERATOR, VERSION, SCOPE)
NOT TO THE TOKEN ALONE
```

Therefore a later structure-preserving use cannot retroactively cleanse an earlier metaphor-only use, and an earlier weak use cannot poison a later operator that genuinely earns the source-domain structure.

The phason family now has the following bounded map:

```text
exact cut-and-project gate                 -> STRUCTURE_PRESERVING
Information-Dome exact-gate projection     -> STRUCTURE_PRESERVING
PR #800 ICOSAHEDRAL_PHASON carrier label   -> METAPHOR_ONLY
Aperture v3.1 phason susceptibility         -> PARTIAL
Phase V Phason relation ledger              -> METAPHOR_ONLY
```

This mixed result is the point. A useful nomenclature audit must be capable of saying **yes, partly, and no** inside one term family.

No donor corpus, external-causation claim, physical quasicrystal claim, runtime rename, merge, deployment, Vercel action, or publication authority follows.

Marked ⟐
