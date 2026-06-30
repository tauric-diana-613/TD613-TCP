# BUILD SPECIFICATION — Dome-World × Aperture × Vector-Substrate Bridge

| | |
|---|---|
| **Document** | `BUILD_SPEC.md` |
| **Component** | Exact admissibility / training kernel for the Dome-World ↔ Aperture v2.9.3 bridge |
| **Version** | 1.0 (build target for Dome-World Flow-Core **v0.4.3**, follows v0.4.2b) |
| **Status** | Local workflow object. **Repository wiring at `/dome-world` remains unauthorized until explicit approval.** Step-2 boundaries (below) hold. |
| **Owners** | Tim (runtime / bridge), Erin (lattice / tactile + math review) |
| **Upstream** | Dome-World/Flow-Core v0.4.2b (`dome_ambiance_core.js`); TD613 Aperture v2.9.3; the verified Vector-Substrate / residual-return package (L00M `f238d6b`) |

**Claim ceilings (binding on every deliverable):**
`aperture-to-flowcore-translation-not-aperture-execution` ·
`phason-gate-exact-decision-not-external-enforcement` ·
`residual-is-audit-signal-and-grade-not-proof-or-authority` ·
`dev-hidden-compatibility-workflow-not-production-custody`

---

## 1. Purpose

Replace the v0.4.2b bridge's **float-heuristic decision layer** with the **exact, auditable** decision procedures of the Vector Substrate, and add the one capability Aperture and Dome-World currently lack: a **learning step** (gated, exact dictionary growth). The substrate *informs* Aperture's witness/grade lanes; it does not override Aperture doctrine, and it does not execute Ash.

## 2. Background & problem statement

Two facts established by inspection of the shipped code:

1. **v0.4.2b decides admissibility with floats.** `normalizeApertureMetrics` returns hand-set floats in [0,1]; `computeFlowCoreWeatherFromAperture` does weighted sums → threshold buckets (`.66`/`.38`); `simulatePhasonGate` sets "severity" by *string-matching the projection name* (`includes('quarantine') → .78`). The `td613.phason-gate/v1` event *shape* is correct, but no acceptance-window membership is ever computed.

2. **Aperture v2.9.3 already declares the substrate's vocabulary as empty sockets.** Inside `Aperture_v2_9_3.html`: `APERTURE_VECTOR_SUBSTRATE_INTAKE` advertises `trace-form-metric`, `orthogonal-projection`, `projection-residual`, `operator-closure-witness`; `apertureV273GradeGateScript` declares `GRADES = [FORCED, FORCED_IN_CONTEXT, FORCED_UNDER_CONSTRAINT, CONSTRUCTION, SELECTED, OPEN]` with `gradeDrift`/`launderingRisk`; `apertureV293PhasonGate` defines "flip: content invariant; projection changes when hidden coordinate crosses `∂W_r`." These are placeholders the substrate fills exactly.

The substrate's relevant facts (verified, 69 checks; see package `f238d6b`): `captured ⟺ ‖r‖²_G = 0` over ℚ; trace-form Gram `G = MᵀM`, `det G = d_K`; gated dictionary growth adjoins exact algebraic-integer seeds; a tamper-evident witness chain records every growth.

## 3. Scope & hard stops

**In scope (this build):** exact Phason-Gate decision; exact residual capture/grow on Aperture packets; computed grade on Aperture's lattice; bounded (Northcott) growth; the integration seams into `dome_ambiance_core.js` and the Aperture witness/grade lane.

**Out of scope (Step 3 or later):** Ash *execution*, Cinders, Veils, salted-signature egress, production custody; the perception/encoder front-end (messy artifact → exact ℚ(θ) observation — flagged open, §10); a derivation of the growth threshold λ (policy layer, §10).

**Hard stops (do not violate):**
1. Bridge is **one-way**: `Aperture → Flow-Core` only. Dome-World may translate/teach/simulate; it may not override Aperture doctrine.
2. The Phason Gate is a **decision/receipt lane**, not external-system enforcement.
3. **Geometry calibrates route pressure; it does not become the instrument crown.** No single-feature capture.
4. No public navigation link to `/dome-world` until explicit approval.
5. The substrate writes only to Aperture's `mayInform` channels (`witness-status`, `grade-ceiling`, `matrix-operator-audit`), never to doctrine.

## 4. Architecture — the integration seams

```
 Aperture v2.9.3 (counter-tool)                 Dome-World / Flow-Core (this build)
 ┌───────────────────────────────┐             ┌─────────────────────────────────────────┐
 │ scan families / lanes          │  packet     │  bridge/ (exact decision layer)           │
 │  admissibility_scan ───────────┼────────────▶│  aperture_residual_bridge.py  (REAL eng.) │
 │  phason_gate_scan              │  one-way    │  vsub_aperture_training_bridge.py (ref.)  │
 │  witness_scan / grade_gate     │             │  phason_gate_exact.py  (Q(τ) window)      │
 │                                │             │            │                              │
 │ APERTURE_VECTOR_SUBSTRATE_     │◀────────────┼── mayInform: witness-status, grade-ceiling │
 │   INTAKE  (empty socket)       │  audit only │            │                              │
 └───────────────────────────────┘             │  engine/ (verified residual-learner)      │
                                                │   integral_basis · projector · loom       │
                                                │   coords_to_minpoly · invariant_factors   │
                                                │   capacity · residual_learner             │
                                                └─────────────────────────────────────────┘
```

Two seams in `dome_ambiance_core.js`:
- **Seam 1 — `simulatePhasonGate(input)`**: replace the `severity = …includes('quarantine')…` heuristic with the exact acceptance-window decision (E1).
- **Seam 2 — a new `admissibility` lane** feeding the bridge packet's observation into the residual learner (E2–E5), emitting the `td613.vsub-aperture.capture/v1` receipt.

## 5. Enhancement work items

| ID | Title | Replaces (v0.4.2b) | Reference module in this zip | Acceptance |
|---|---|---|---|---|
| **E1** | Exact Phason-Gate decision | `simulatePhasonGate` severity-by-string-match | `bridge/phason_gate_exact.py` | flip decided by exact sign over ℚ(τ); `artifact_content_changed:false`; matrices verified `B Bᵀ=I`, `c∥≈0.371748`, `c⊥≈0.601501` |
| **E2** | Exact residual capture | float `gluing_obstruction` / `projection_shift` | `bridge/aperture_residual_bridge.py` (real) + `vsub_aperture_training_bridge.py` (ref) | `captured ⟺ ‖r‖²_G = 0`; in-field packet → residual 0; no float threshold |
| **E3** | Lexicon / field growth | (none — Aperture/Dome do not learn) | `engine/residual_learner.py`, `field-growing` semantics | out-of-field packet → exactly one growth; residual returns to 0; adjoined seed minpoly emitted |
| **E4** | Computed grade gate | asserted grade in `apertureV273GradeGateScript` | grade map in both bridges | grade ∈ {FORCED, CONSTRUCTION, SELECTED, OPEN} computed from residual + snap-exactness |
| **E5** | Bounded narrowing | unbounded scan routing | `engine/capacity.py` (Northcott) | admissible set provably finite/enumerable; growth refused above degree/height bound |
| **E6** | Encoder seam (interface only) | implicit float intake | `APERTURE_VECTOR_SUBSTRATE_INTAKE` socket | **interface specified; implementation deferred** (§10). Artifact → exact ℚ(θ) coords is the open front. |

### E1 — Exact Phason-Gate decision
`previous != next` plus a name-matched severity is not an admissibility decision. Decide the flip by exact membership of the hidden custody coordinate `r⊥ = c⊥·B⊥·n + w(t)` in the room window `W_r`, with the boundary decided by exact sign over ℚ(τ) (`τ = (1+√5)/2 = φ`, the GSA field). Reference: `phason_gate_exact.py` verifies the cut-and-project geometry and emits the `td613.phason-gate/v1` event with `decision_basis: exact-sign-over-Q(tau)-no-float-threshold`. In-stack (dependency-free JS) the load-bearing primitive is `sign5(a,b)` (exact sign of `a+b√5`, ~12 lines of BigInt).

### E2 / E3 — Exact residual capture and growth
Encode an Aperture-scanned artifact as an exact observation `v` in the ambient field `K = ℚ(θ)`. `captured ⟺ ‖r‖²_G = 0` (exact). Persistent off-axis residual is *novelty*; under the gate it becomes a **new exact basis direction** (dictionary growth, not weight-fitting). Reference: `aperture_residual_bridge.py` drives the real `ResidualLearner`; the out-of-field artifact `θ²` yields residual `96`, grows the basis by `2√6` (minpoly `x²−24`), and the residual returns to 0. **These single-step decisions are expanded into a full streaming trainer — loop, gates, state, metrics, config, failure modes — in `TRAINER_SPEC.md` (reference scaffold `trainer/trainer.py`).**

### E4 — Computed grade
Map the residual outcome onto Aperture's lattice: `FORCED` = value-forced (residual 0 now); `CONSTRUCTION` = admitted by a determined exact growth; `SELECTED` = growth required a non-exact snap (policy choice); `OPEN` = persistent novelty not yet admissible. `launderingRisk` = a `SELECTED` masquerading as `FORCED` (the equivocation the ZFP audit caught).

### E5 — Bounded narrowing
`engine/capacity.py` caps degree and coefficient height (Northcott finiteness): the admissible/grade-state set is provably finite and enumerable, and growth is refused above the bound rather than blowing up. This bounds Aperture's narrowing and gives a completeness guarantee its hand-listed scan families approximate.

### E6 — Encoder seam (open)
The map *messy artifact → exact ℚ(θ) coordinate vector* is the unsolved front. This build specifies the **interface** (`observation_coords` in the packet) and the socket (`APERTURE_VECTOR_SUBSTRATE_INTAKE`); it does **not** implement the encoder. Until E6 lands, observations are supplied as exact coordinates by the caller.

## 6. Module inventory

```
domeworld-aperture-substrate-bridge/
  BUILD_SPEC.md            this document
  README.md               LLM/dev guide: extract, run, build the enhancements
  TRAINER_SPEC.md         comprehensive trainer formulation (expands E2–E4 into a streaming trainer)
  MANIFEST.md             inventory + provenance + sha256
  requirements.txt        mpmath, sympy, pytest
  verify_bridge.py        one-command gate: env + engine tests + bridge demos (exit 0 IFF green)
  engine/                 the EXACT training modules (residual-learner closure; from L00M f238d6b)
    integral_basis.py     trace-form Gram G (Newton identities, exact)        [L0 core, stdlib]
    projector.py          P = B(BᵀGB)⁻¹BᵀG, residual, residual_norm           [L0 core, stdlib]
    loom.py               number-field machinery                              [L0 core, stdlib]
    coords_to_minpoly.py  exact in-field minimal polynomial via SNF           [stdlib]
    invariant_factors.py  Smith normal form support                           [stdlib]
    capacity.py           Northcott (degree, height) capacity gate            [needs mpmath]
    residual_learner.py   observe→propose→confirm; gated dictionary growth    [stdlib]
    test_capacity.py · test_coords_to_minpoly.py · test_residual_learner.py   [34 tests]
  bridge/
    phason_gate_exact.py            E1 reference: exact ℚ(τ) cut-and-project gate   [sympy]
    vsub_aperture_training_bridge.py E2/E3/E4 reference (dependency-free of engine) [sympy]
    aperture_residual_bridge.py     E2/E3/E4 PRODUCTION wiring: drives the real engine
  trainer/                the streaming TRAINER built on the bridge (see TRAINER_SPEC.md)
    trainer.py            reference Trainer scaffold over the real ResidualLearner (fit/step/checkpoint)
    trainer_demo.py       worked training session: capture, gated growth, checkpoint/resume
  schemas/
    phason-gate.schema.json              the td613.phason-gate/v1 event (from v0.4.2b)
    vsub-aperture-capture.schema.json    the capture receipt this build emits
  fixtures/
    aperture_v293_bridge_packet.json     route-weather packet (from v0.4.2b)
    aperture_in_field_packet.json        in-field artifact → FORCED
    aperture_out_of_field_packet.json    out-of-field artifact → CONSTRUCTION (grows by 2√6)
```

## 7. Interfaces & contracts

**Engine (Python):**
```python
ResidualLearner(ambient_min_poly: list[int], seeds: list[list[int]], *, persistence_N=3,
                epsilon=Fraction(1,100), height_bound=256, degree_bound=None, budget=None,
                calibration_ok=None, witness_path=None)
  .observe(x: list[Fraction]) -> None        # feed an exact coordinate observation
  .propose() -> SeedProposal | None          # gated suggestion after persistent novelty
  .confirm(p: SeedProposal) -> dict          # the SOLE mutator; grows the forced basis
  .verify_witness() -> bool                  # tamper-evident chain check
  .state() -> dict                           # last_residual_norm (exact; 0 IFF captured), ...
```

**Receipt (`td613.vsub-aperture.capture/v1`)** — see `schemas/vsub-aperture-capture.schema.json`. Required: `schema, captured, field_grew, grade, decision_basis, claim_ceiling`. Carries `projection_residual_before/after` (exact), `forced_basis_dim [before,after]`, `adjoined_seed_minpoly`, `witness_intact`.

**In-stack JS primitive (for `dome_ambiance_core.js`):** `sign5(a,b)` returns the exact sign of `a + b√5` (BigInt); acceptance-window membership reduces to `sign5` calls after squaring, staying in ℚ(√5).

## 8. Acceptance criteria

A build is **green** iff `python3 verify_bridge.py` exits 0, which requires:

```
ENV       python ≥ 3.10 ; mpmath, sympy, pytest importable
PART A    engine tests: 34 passed
PART B    phason_gate_exact.py            geometry ALL PASS + CUSTODY PHASON FLIP
          vsub_aperture_training_bridge.py det G == disc(f) True + grades FORCED & CONSTRUCTION
          aperture_residual_bridge.py     residual_before 96 + FORCED & CONSTRUCTION + witness intact
          trainer/trainer_demo.py         growth_events 1 (x²−24) + SESSION OK: True
```

Any enhancement E1–E5 wired into `dome_ambiance_core.js` MUST keep `verify_bridge.py` green and MUST add a regression marker to PART B.

## 9. Phased delivery

| Phase | Deliverable | Gate |
|---|---|---|
| **P0 (this zip)** | Verified engine + 3 reference bridges + spec | `verify_bridge.py` green |
| **P1** | E1 wired into `simulatePhasonGate` (exact decision behind existing schema) | green + phason regression |
| **P2** | E2–E4 wired as the `admissibility` lane; receipts emitted; writes to Aperture `mayInform` only | green + capture regression + one-way hard stop preserved |
| **P3** | E5 capacity bound enforced on growth | green + Northcott refusal test |
| **P4 (deferred)** | E6 encoder; Ash execution — **requires explicit authorization** | Step-3 review |

## 10. Open issues & risks

Inherited from the Vector-Substrate paper (its own flagged limits) and mapped to where they bite:

1. **Non-maximal order.** The worked field `ℚ(√2+√3)` runs at index 8 (`det G = disc(f) = 147456 = d_K·8²`). Production custody fields must confirm the maximal-order computation or grade/discriminant arithmetic drifts.
2. **Smyth floor conditional on non-reciprocity.** The "an out-of-field artifact cannot sneak under the floor" guarantee holds for non-reciprocal seeds; **Salem-number coordinates are an open hole.**
3. **Score-as-Fisher-distance needs `1 ∈ col(B)`.** If Fisher distance becomes the admissibility metric, the constant direction must be in the basis (already enforced by `test_one_in_basis_preserved_across_growth`).
4. **Discriminant-as-information-volume is model-dependent.** If "information volume" becomes a route-pressure metric, the Gaussian variance choice is a declared policy, not a theorem.
5. **λ (growth threshold) is posited, not derived.** It is a policy layer over the exact substrate; calibrating/deriving it is named open work.
6. **E6 encoder unsolved.** *Messy artifact → exact ℚ(θ) observation* is the genuine open front; `APERTURE_VECTOR_SUBSTRATE_INTAKE` is the socket awaiting it.

## 11. Provenance

The `engine/` modules are the minimal transitive import-closure of `residual_learner.py`, extracted unmodified from the verified residual-return / Vector-Substrate package (L00M head `f238d6b`; module commits: `residual_learner` 218c02e + variance_calibration 1366d1c, `coords_to_minpoly`/`invariant_factors` c1db881, `capacity` c8fdb8a; `integral_basis`/`projector`/`loom` are the L0 exact core). Per-file sha256 in `MANIFEST.md`. The `bridge/` modules and schemas/fixtures are authored for this build. No third-party code beyond `mpmath`/`sympy`/`pytest`.

Sealed ⟐
