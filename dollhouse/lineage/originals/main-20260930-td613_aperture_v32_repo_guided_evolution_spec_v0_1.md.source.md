# TD613 Aperture v3.2-alpha · Repo-Guided Evolution Specification v0.1

Status: **AUTHORED / STANDALONE-CANDIDATE / REPO-INSTALL HELD / HUMAN-GATED**

Proposed instrument identity: `TD613 Aperture v3.2-alpha`

Proposed schema: `td613-aperture/v3.2-alpha`

Proposed feature identity: `v3.2-alpha-typed-epistemic-deficit-and-stability-aware-widening-runtime`

This specification governs the standalone v3.2-alpha candidate to be authored from the current canonical v3.1-alpha standalone. It does **not** install v3.2 repo-wide, update `app/aperture/release.json`, promote the repository identity, deploy TD613.com, or authorize Vercel.

## 0. Why v3.2 exists now

The repository has advanced beyond the standalone v3.1 surface in a specific way.

v3.1 already earned and installed a distributed observatory architecture:

```text
Ash        controlled-source and experiment custody
Flow-Core  artifact-blind per-snapshot context
Aperture   reconstruction, signed residue, abstention, replay
Phason     registry-transition continuity
Dome-World full experiment laboratory
Human      approval, promotion, derivative review, closure
```

The current release manifest reports v3.1 observatory and Phase IV/V production demonstrations while the phase-free A15-R0 research frontier has since added bounded synthetic work on:

```text
identifiability deficit targeting
joint state–instrument reconstruction
conditioning-aware widening
covariance-aware / whitened widening
correlated-noise geometry
typed experiment-design state
```

Therefore the regression risk is not that v3.1 lacks another reconstruction engine. The risk is that the **standalone instrument still knows how to report reconstruction/abstention but does not compactly express what kind of insufficiency exists before widening or whether another question is warranted at all.**

v3.2 closes that gap without moving the full research laboratory out of Dome-World.

## 1. Governing objective

v3.2 adds a compact **Typed Epistemic Deficit + Question-Need Audit** to the standalone Aperture.

The bounded grammar is:

```text
current declared reconstruction state
→ type the admitted deficit
→ choose the admissible question criterion for that deficit
→ preserve stability / uncertainty geometry
→ PROPOSE | ABSTAIN | REJECT | ASK NOTHING
```

The standalone does not choose a physical sensor, execute an observation, run an autonomous experiment, or optimize a universal utility function.

## 2. Pedagogue × Aperture companion contract

The repository now houses both root shortcuts:

```text
PEDAGOGUE.md
APERTURE.md
```

Their relationship is complementary rather than hierarchical:

```text
Pedagogue
  consequence / route / learning / falsifier / candidate-question grammar

Aperture
  observation / identifiability / reconstruction / stability / uncertainty / abstention / replay audit
```

Default joint route:

```text
Pedagogue proposes or reframes
→ Aperture audits the admitted reconstruction and uncertainty geometry
→ Dome-World hosts any warranted assay
→ human closure remains required
```

No runtime import from Pedagogue into standalone Aperture is required for v3.2. The pairing is an agentic routing contract and receipt relationship, not a merger of sovereign engines.

## 3. New typed deficit classes

The compact v3.2 audit recognizes the bounded classes already witnessed in A15-R0:

### `INVALID_NOISE_GEOMETRY`

A required uncertainty model is declared invalid.

Disposition:

```text
REJECT
```

No hidden jitter, clamping, diagonal substitution, or silent repair.

### `NOISE_GEOMETRY_INCOMPLETE`

Disposition-relevant uncertainty geometry is missing or unresolved.

Disposition:

```text
ABSTAIN
```

Missing reliability is not neutral reliability.

### `STRUCTURAL_RANK_DEFICIT`

```text
current_rank < latent_dimension
```

Disposition:

```text
PROPOSE
```

Admissible Pedagogue question criterion:

```text
seek a predeclared observation that contracts the current nullspace;
then audit conditioning / uncertainty before treating it as useful.
```

### `NUMERICAL_STABILITY_DEFICIT`

```text
current_rank = latent_dimension
AND
(sigma_min < declared_sigma_min_floor
 OR condition_number > declared_condition_ceiling)
```

Disposition:

```text
PROPOSE
```

Admissible Pedagogue question criterion:

```text
seek a predeclared observation that improves reconstruction stability;
positive rank lift is not required because rank is already full.
```

### `NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT`

```text
current_rank = latent_dimension
sigma_min >= declared_sigma_min_floor
condition_number <= declared_condition_ceiling
```

Disposition:

```text
ASK NOTHING
```

Candidate availability does not manufacture a research need.

## 4. No scalar crown

v3.2 must not collapse deficit typing into one score.

Hard anti-equivalences:

```text
rank deficit != stability deficit
visibility != identifiability
full rank != sufficient stability
rank_lift = 0 != useless observation
operator diversity != uncertainty diversity
same marginal variances != same joint uncertainty geometry
missing noise geometry != neutral noise geometry
invalid covariance != approximately valid covariance
available candidate != needed question
proposal != execution
widening != validation
```

## 5. Standalone surface change

v3.1's compact Admissibility Tomography drawer remains intact and inherited.

Immediately beside/below it, add one compact v3.2 drawer:

```text
EPISTEMIC DEFICIT · v3.2
Question-design posture
```

Minimum visible fields:

```text
deficit class
rank / latent dimension
sigma_min
condition number
uncertainty geometry posture
disposition
classification replay stability
```

Operator-declared inputs:

```text
latent dimension
current rank
sigma_min
condition number
uncertainty status
declared sigma_min floor
declared condition-number ceiling
```

The drawer compiles a local derived receipt and may expose a Pedagogue cue. It does not select an actual candidate probe.

Required replay-stability readout:

```text
HELD / NOT YET WITNESSED
```

This preserves the next A15-R0 experiment rather than pretending threshold stability has already been earned.

## 6. New machine-readable contract

Add:

```text
apertureV32TypedEpistemicDeficitContract
schema: td613.aperture.v32-typed-epistemic-deficit/v0.1
```

The contract must include:

- inherited v3.1 tomography jurisdiction;
- typed deficit classes and dispositions;
- Pedagogue companion routing;
- no-scalar-crown law;
- classification replay-stability posture = HELD_NOT_YET_WITNESSED;
- automatic execution = false;
- promotion authority = false;
- production mutation = false;
- human closure required = true.

Add a v3.2 scan-grammar extension for:

```text
typed_epistemic_deficit_scan
conditioning_and_stability_audit
uncertainty_geometry_audit
question_design_posture
classification_replay_stability_hold
```

Patch Bay may expose a PURE/contract-style experiment-design-state audit port. It may not execute the proposed observation.

## 7. Pedagogue research inheritance

v3.2 consumes **stripped transferable relations**, not paper ontology.

The current 2026 research corpus materially supports the following methodological inheritance:

```text
temporal order may belong to the reconstructed process state
visibility != identifiability
multiple probe labels != independent information
representation choice can change conditioning
structured nonclosure may carry a registry coordinate
latent structure may become clearer under an equivalence-controlled transform
ordered-path dependence alone remains below connection/curvature/holonomy
inverse design requires target → candidate → independent verification
```

These remain research-refinement candidates. No quantum, moiré-material, phason, Berry, holonomy, or physical inverse-design ontology transfers into Aperture by analogy.

## 8. Version / lineage law

Current standalone identity becomes:

```text
TD613 Aperture v3.2-alpha
td613-aperture/v3.2-alpha
```

Inherited module contracts keep their own lineage where appropriate:

```text
v3.1 Admissibility Tomography remains a v3.1 inherited contract
v3.0 Anti-Epistemicide remains inherited
v2.9.5 Dromological kernel remains inherited
v2.9.4 foundation/Grade Gate/Witness lineage remains inherited
```

Do not globally relabel every historical contract as v3.2.

One final v3.2 identity synchronizer may harden the standalone against inherited version writers, but it must be idempotent and must not create an uncontrolled animation loop.

## 9. Patch Bay / agent routing

A v3.2 agent encountering one of the following should instinctively consider the new audit:

```text
underdetermined
rank deficient
identifiability
ill-conditioned
unstable inverse
covariance
correlated noise
missing reliability
should we widen
need another measurement
next question
abstain
replay stability
```

Typed task intent continues to outrank lexical fallback.

The output is a routing/diagnostic receipt only.

## 10. Scope and non-claims

A passing v3.2 standalone self-test may establish only that the local typed-deficit compiler behaves according to its declared deterministic rules.

It may not establish:

```text
optimal experimental design
active-learning optimality
Fisher-information optimality
information geometry
physical sensor design
physical sensor calibration
physical tomography
blind tomography
operator tomography
live TD613 latent-state reconstruction
autonomous Aperture widening
autonomous experiment execution
connection
curvature
holonomy
Berry structure
quantum behavior
Proto-Loom
production authority
release authority
```

## 11. Codex repo-wide installation lane

The standalone v3.2 candidate is expected to return through the existing bidirectional lane:

```bash
npm run aperture:stage -- <Aperture_v3_2-alpha.html>
npm run aperture:compare
```

After explicit review, Codex may install repo-wide through the existing promotion/sync architecture.

The repo-wide installation should then update, in the order appropriate to current lane contracts:

```text
v3.2 compatibility / release identity
new v3.2 contract + pure compiler module
standalone tool body
Dome lab companion readout where warranted
release.json / release.js / generated release mirrors
fixtures and release sync
tests
standalone parity/export
```

Do not rewrite v3.1 engine modules merely to change their filenames. Prefer additive v3.2 compatibility and deficit-audit modules unless a specific v3.1 defect requires migration.

## 12. Required repo-wide tests after Codex installation

At minimum add/extend tests proving:

```text
v3.2 identity is singular and does not flicker back to v3.1
v3.1 tomography contracts remain readable as inherited lineage
STRUCTURAL_RANK_DEFICIT -> PROPOSE
NUMERICAL_STABILITY_DEFICIT -> PROPOSE without requiring rank lift
NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT -> ASK NOTHING
NOISE_GEOMETRY_INCOMPLETE -> ABSTAIN
INVALID_NOISE_GEOMETRY -> REJECT
missing uncertainty is never silently defaulted
invalid uncertainty is never silently repaired
no scalar crown exists
question-design receipt executes no observation
Pedagogue companion routing transfers no authority
classification replay stability remains HELD until separately witnessed
mobile / reduced-motion / standalone parity remain intact
v3.0/v3.1 receipt compatibility remains intact
```

## 13. Held next experiment

v3.2 explicitly preserves but does not execute:

```text
TEST_REPLAY_STABILITY_OF_TYPED_EXPERIMENT_DESIGN_STATE
UNDER_SMALL_THRESHOLD_AND_NOISE_MODEL_PERTURBATIONS
BEFORE_ANY_OPTIMAL_DESIGN_OR_INFORMATION_GEOMETRY_PROMOTION
```

The instrument must be able to say that its own ignorance classification has not yet been stability-tested.

## 14. Constitutional close

v3.2 should feel like Aperture learned a new form of restraint, not like it acquired a larger crown.

The sophisticated move is not another visualization.

It is this:

```text
before widening,
classify why the current reconstruction is insufficient;

before proposing,
check whether a question is actually needed;

before trusting a question,
keep uncertainty geometry visible;

before promoting the classification,
remember that the classification itself still needs replay-stability testing.
```

Human closure remains required.
