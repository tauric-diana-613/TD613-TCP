# TRAINER SPECIFICATION — building a trainer on the Vector-Substrate bridge

| | |
|---|---|
| **Document** | `TRAINER_SPEC.md` (comprehensive expansion of `BUILD_SPEC.md` §5 E2–E4) |
| **Audience** | Tim & Erin — formulating their **own** trainer on top of the single-step training bridge |
| **Reference scaffold** | `trainer/trainer.py` (runnable, wraps the real engine) + `trainer/trainer_demo.py` |
| **Engine** | `engine/residual_learner.py` (verified; L00M `f238d6b`) |
| **Status** | Local workflow object. Repository wiring + Ash execution remain **out of scope / unauthorized** (see `BUILD_SPEC.md` §3). |

**Claim ceilings (binding):**
`residual-is-audit-signal-and-grade-not-proof-or-authority` ·
`trainer-audit-record-not-cognition-proof` ·
`aperture-to-flowcore-translation-not-aperture-execution` ·
`dev-hidden-compatibility-workflow-not-production-custody`

---

## 0. How to read this

`BUILD_SPEC.md` defines the **single-step** capture/grow decision (E2–E4). This document expands that
into a **streaming trainer**: the loop, the gates, the state model, the metrics, the configuration
surface, the failure modes, and the open research items — everything needed to build a production
trainer rather than a one-shot demo. Every claim here is backed by code you can run:
`python3 trainer/trainer_demo.py` and `python3 verify_bridge.py` (PART B includes the trainer).

---

## 1. What "training" means here — and what it is NOT

This trainer does **not** fit a dense float parameter vector by gradient descent. It grows a small,
**exact** dictionary (the *forced basis* `B`) by reading residuals. The contrast is the whole point:

| | Standard ML trainer | This substrate trainer |
|---|---|---|
| **Model** | dense float weight tensor | the forced basis `B` (columns = exact algebraic-integer seed coords in `K`) |
| **Update** | gradient step on a loss | gated **adjoin a new exact basis column** (or nothing) |
| **"Learned"** | loss below threshold (fuzzy) | **captured**: `‖r‖²_G = 0` over ℚ (exact membership) |
| **Novelty** | larger gradient | persistent off-axis residual whose direction holds |
| **Decision** | float threshold | exact sign over ℚ; **no float crosses any decision boundary** |
| **Capacity** | unbounded params | **Northcott-bounded** (finite, enumerable admissible set) |
| **Forgetting** | catastrophic, implicit | growth is monotone + audited; nothing silently overwritten |
| **Audit** | weights opaque | tamper-evident **witness chain** of every growth |

"Captured" / "learned" / "zero residual" are **local technical terms** (exact membership in the current
basis), never a cognitive claim. The trainer's output is an **audit record and grade**, not proof,
authority, or cognition.

## 2. The training object & its invariants

- **Ambient field `K = ℚ(θ)`** — fixed for the run, given by the monic-integer minimal polynomial of `θ`.
  The demo uses `K = ℚ(√2+√3)`, `f = x⁴ − 10x² + 1`. Totally-real ⇒ the trace-form Gram `G` is positive
  definite ⇒ projection is always well posed (no nonzero seed is isotropic).
- **The model = the forced basis `B`** — a set of coordinate vectors in `K` spanning the currently
  *admissible* subspace (what custody/knowledge currently captures).
- **Observations = exact coordinate vectors in `K`** (`Fraction`/`int`). Floats are refused at intake.
- **Capture predicate** — `captured(v) ⟺ ‖r‖²_G = 0` where `r = v − P v`, `P = B(BᵀGB)⁻¹BᵀG` (the
  `G`-orthogonal projector). Exact.
- **Witness chain** — every confirmed growth appends a hash-linked record; `verify_witness()` proves the
  training history is untampered.

**Invariant (do not break):** no float ever participates in a capture, growth, grade, or capacity
decision. Floats are display-only.

## 3. Architecture

```
  artifact stream
        │
        ▼
  ┌───────────┐   exact coords v ∈ K
  │  Encoder  │ ───────────────────────────────►  (E6 seam — YOU own this)
  └───────────┘
        │
        ▼
  ┌───────────┐  observe(v): update streak + exact Welford centroid (_mean, _M2, _n_acc)
  │ Observer  │
  └───────────┘
        │ captured?  ── yes ──►  grade FORCED, emit receipt
        │ no
        ▼
  ┌──────────────── propose() gates (ALL must pass to grow) ────────────────┐
  │  Persistence   _streak ≥ persistence_N      (residual DIRECTION holds)  │
  │  Calibration   calibration_ok()             (residual MAGNITUDE settled)│
  │  Capacity      Northcott Budget admissible  (degree/height in budget)   │
  └─────────────────────────────────────────────────────────────────────────┘
        │ all pass
        ▼
  confirm(proposal)  ── adjoin exact seed column to B ──►  grade CONSTRUCTION (or SELECTED if snapped)
        │
        ├──► Witness Ledger (append hash-linked record)
        ├──► Checkpointer (state = seed_coords)
        └──► Metrics / Observability (capture rate, growth events, grade dist, drift)
```

## 4. The training protocol (the algorithm)

The reference `Trainer.step` / `Trainer.fit` implement exactly this:

```
step(artifact):
    v ← encode(artifact)                 # exact coords (E6 seam)
    observe(v)                           # streak + Welford accumulator update
    if captured(v):                      # ‖r‖²_G == 0
        grade ← FORCED ; return receipt
    proposal ← propose()                 # None unless persistence ∧ calibration ∧ capacity all pass
    if proposal is not None:
        confirm(proposal)                # SOLE mutator: adjoin exact seed column
        grade ← CONSTRUCTION | SELECTED  # by snap-exactness
    else:
        grade ← OPEN                     # novelty not (yet) admissible
    return receipt

fit(stream): for artifact in stream: step(artifact); return report()
```

- **Online by default.** Each observation is processed as it arrives; growth happens mid-stream.
- **Batch / epochs / replay** are *policy on top*: re-feeding a buffered stream is legitimate (the
  capture/grow decision is deterministic and order-sensitive only through the streak). Replaying a
  settled stream changes nothing once captured (idempotent on captured inputs).
- **Determinism.** Given the same stream and config, the trainer is fully reproducible (exact arithmetic,
  deterministic content-hash seed identities).

## 5. The growth decision in detail

Growth requires **three independent gates**, all exact:

| Gate | Tests | Mechanism | Failure |
|---|---|---|---|
| **Persistence** | the residual **direction** has held for `N` consecutive ticks | `_streak ≥ persistence_N` | a direction change resets `_streak ← 1` (a blip never grows) |
| **Calibration** | the residual **magnitude** has settled (opt-in) | `variance_calibration`: `Σ M2_i ≤ max_rel_spread · n · Σ mean_i²` | an aligned-but-volatile stream persists yet stays uncalibrated |
| **Capacity** | the candidate seed is Northcott-admissible | `Budget(degree_max, height_max)`; `capacity_decision → {GROW, STOP, REJECT}` | beyond budget ⇒ `REJECT` (refuse, do not crash) |

**Snap-exactness → grade.** When the residual centroid *is* an algebraic integer, the adjoined seed is
`snap = "exact"` → grade `CONSTRUCTION`. When it must be rounded (`nearest_integer_fallback`,
ties-to-even, re-validated), `snap ≠ "exact"` → grade `SELECTED` (a policy choice entered the loop).

In the demo, the off-axis `θ²` produces residual centroid `2√6` (an algebraic integer, minpoly
`x²−24`), so it snaps `exact` and grows as `CONSTRUCTION`.

## 6. The data contract & the encoder (E6 — the open front)

**Packet shape** (mirrors `fixtures/aperture_*_packet.json`):
```json
{ "artifact_id": "...", "active_lane": "phason_gate_scan", "observation_coords": [a0, a1, a2, a3] }
```
`observation_coords` is the **exact** coordinate vector of the artifact in the power basis of `K`.

**The encoder seam.** The map *messy artifact → exact `observation_coords`* is **unsolved and is yours**
(`BUILD_SPEC.md` §10.6). The reference `Trainer.encode` is a stub: it accepts supplied coords or an
`encoder=` callable and **raises** otherwise. **Rule: never silently snap floats into coords** — that
destroys the exactness invariant. If a real encoder must approximate, route the approximation through the
engine's `nearest_integer_fallback` (which re-validates over ℚ and records `snap ≠ "exact"` → grade
`SELECTED`), so the approximation is *visible in the grade*, not hidden.

**Single column vs field extension.** If the new direction lives inside the *same* `K`, growth is a new
basis column (this kit). If it requires a *larger* field (a genuinely new algebraic generator), that is a
**field extension**, not a basis column — see §12.

## 7. Configuration surface

Every knob (`TrainerConfig` → `ResidualLearner`), what it controls, default, and tuning guidance:

| Knob | Controls | Default | Tuning / failure mode |
|---|---|---|---|
| `ambient_min_poly` | the field `K` | — | totally-real ⇒ `G` PD (safe). Non-real embeddings can make `G` indefinite ⇒ projector edge cases. |
| `seeds` | initial forced basis `B0` | — | must be `G`-independent (else `BᵀGB` singular → constructor raises). |
| `persistence_N` | direction-stability ticks before growth | `3` | ↑ = more conservative (noise-robust, slower to learn); ↓ = eager (may grow on coincidences). |
| `epsilon` | capture tolerance band | `1/100` | exact; keep at exact-zero capture unless modelling measurement slack. |
| `height_bound` | coeff-height cap on adjoined seeds | `256` | the Northcott height cap; bounds model complexity. |
| `degree_bound` | degree cap | `None` (ambient) | caps how large an adjoined seed's minpoly may be. |
| `budget` | explicit `Budget(degree_max,height_max)` | derived | the principled replacement for hard caps; sets the finite admissible set. |
| `use_variance_calibration` | enable the magnitude gate | `False` | enable for noisy streams; blocks growth until magnitude settles. |
| `warm_up` | min ticks before calibration can pass | `persistence_N` | ↑ requires longer settling. |
| `max_rel_spread` | allowed spread / centroid magnitude | `1/4` | ↓ = stricter settling requirement. |
| `witness_path` | on-disk tamper-evident log | `None` | set for persistent audit across runs. |

## 8. State, checkpointing & resume

**The forced basis *is* the model.** `Trainer.checkpoint()` returns the ambient minpoly + `seed_coords`
(the exact basis columns) + the witness head/length. `Trainer.resume(config, checkpoint)` reconstructs a
trainer from the saved `seed_coords` — the learned state survives the round-trip (the demo proves it:
the resumed trainer captures the previously-learned `θ²`). The witness chain is the **training log**;
`verify_witness()` proves it is untampered. For cross-process persistence set `witness_path`.

## 9. Calibration & the variance gate (deep)

Persistence and calibration test **different things** and are both exact:

- **Persistence** = *direction* stability (`_streak`): the off-axis residual keeps pointing the same way.
- **Calibration** = *magnitude* stability (`variance_calibration` over the exact Welford `_M2`): the
  centroid has both **warmed up** (`_n_acc ≥ warm_up`) and **settled**
  (`Σ_i M2_i ≤ max_rel_spread · n · Σ_i mean_i²`).

Consequence: an **aligned-but-volatile** stream *persists* (direction holds) yet stays *uncalibrated*
(magnitude jittery) — so it will not grow on a settling transient. Enable calibration
(`use_variance_calibration=True`) when the artifact stream is noisy; leave it off for clean exact streams.

## 10. Capacity & termination

The admissible set `{ monic-integer m : deg(m) ≤ D_max, height(m) ≤ H_max }` is **finite** (Northcott),
at most `Σ_{d≤D_max} (2·H_max+1)^d`. So the model's capacity is **provably bounded** and the trainer
**terminates growth**. `capacity_decision` returns:

- `STOP` — residual defect at/below the floor (captured, or noise that averages out);
- `REJECT` — candidate seed beyond the Northcott budget (**refuse** — do not crash, do not grow);
- `GROW` — a real defect *and* a Northcott-admissible seed.

**Caveat (inherited open issue):** the positive-minimum-residual guarantee (a real out-of-field artifact
can't sneak under the floor) holds for **non-reciprocal** seeds; **Salem/reciprocal** coordinates are an
open hole (`is_reciprocal` flags them). Treat reciprocal candidates with extra review.

## 11. The grade gate

Grades are **computed** on Aperture's lattice, not asserted:

| Grade | Meaning | Trigger |
|---|---|---|
| `FORCED` | value-forced; already admissible | `captured` (residual 0 now) |
| `CONSTRUCTION` | admitted by a determined exact growth | grew, `snap == "exact"` |
| `SELECTED` | growth required a non-exact snap (policy entered) | grew, `snap ≠ "exact"` |
| `OPEN` | novelty not (yet) admissible | not captured, no growth |

`gradeDrift` (Aperture's term) = movement of the dominant grade over the stream; `launderingRisk` = a
`SELECTED` masquerading as `FORCED` (the value-forced/model-forced equivocation the ZFP audit caught).
Write grades **only** to Aperture's `mayInform` channels (`grade-ceiling`, `witness-status`) — never to
doctrine (the one-way hard stop).

## 12. Field extension (advanced — beyond this kit)

When an artifact's new direction requires a **larger field** (a new algebraic generator, not a vector in
the current `K`), growth is a **field extension**, handled by modules *named but not bundled here*:
`field_growing_learner.py` (drives growth from the measured out-of-field residual) and
`compositum_nondisjoint.py` (builds the **true compositum**, not the tensor — verified
`test_p2c_witness_grows_true_compositum_not_tensor`, e.g. `m_θ = x⁴−22x²+25`). `capacity_decision`
already accepts `effective_degree=` so the *same* gate governs compositum growth disjointness-independent.
**To extend the trainer to cross-field learning, add these two modules from the full Vector-Substrate
package and route `Trainer` growth through them when the residual escapes `K`.**

## 13. Metrics & observability

`Trainer.report()` emits: `observations`, `capture_rate`, `growth_events`, `adjoined_minpolys`,
`final_basis_dim`, `grade_distribution`, `witness_intact`. Recommended additional series to log per step
(all present in the per-step receipt): the **residual trajectory** (`projection_residual_before` — the
novelty signal over time), the **basis-dim trajectory**, and the **streak**.

**What good training looks like:** capture rate rises as the basis grows; growth events are few and each
adjoins an exact (`CONSTRUCTION`) seed; witness intact. **Red flags:** runaway growth (every observation
grows) ⇒ a broken encoder feeding garbage directions, or `persistence_N` too low; never-growing on
genuine novelty ⇒ `persistence_N` too high or calibration blocking; a rising `SELECTED` share ⇒ the
encoder is approximating too much.

The demo's actual numbers (reproduce with `trainer/trainer_demo.py`):
`observations 10 · capture_rate 5/10 · growth_events 1 · adjoined_minpolys [[1,0,-24]] ·
grade_distribution {FORCED:5, OPEN:4, CONSTRUCTION:1} · witness_intact true`.

## 14. Evaluation & acceptance

A trainer build is **green** iff `python3 verify_bridge.py` exits 0 (PART B now includes
`trainer/trainer_demo.py`, checking for `CONSTRUCTION`, `"growth_events": 1`, and `SESSION OK: True`).
Any change to the trainer MUST keep this green and SHOULD add a regression marker. Minimum acceptance for
a new trainer: (1) in-field stream → all `FORCED`, zero growth; (2) a persistent novel direction → exactly
one `CONSTRUCTION` growth with the expected minpoly; (3) checkpoint→resume preserves capture; (4)
`verify_witness()` true throughout.

## 15. Trainer API (reference)

```python
@dataclass
class TrainerConfig:
    ambient_min_poly: list[int]; seeds: list[list[int]]
    persistence_N: int = 3; epsilon: Fraction = Fraction(1,100)
    height_bound: int = 256; degree_bound: int | None = None; budget: Budget | None = None
    use_variance_calibration: bool = False; warm_up: int | None = None
    max_rel_spread: Fraction = Fraction(1,4); witness_path: str | None = None

class Trainer:
    def __init__(self, config: TrainerConfig, encoder: Callable[[Any], list] | None = None)
    def encode(self, artifact) -> list[Fraction]      # E6 seam (stub: never snap floats)
    def step(self, artifact) -> dict                  # one observe + gated growth; returns a capture receipt
    def fit(self, stream) -> dict                     # iterate a stream; returns the trainer report
    def checkpoint(self) -> dict                      # {ambient_min_poly, seed_coords, witness_head, ...}
    @classmethod
    def resume(cls, config, checkpoint) -> "Trainer"  # reconstruct from saved seed_coords (the model)
    def report(self) -> dict                          # metrics
```

Receipt schema: `schemas/vsub-aperture-capture.schema.json` (`td613.vsub-aperture.capture/v1`).
Report/checkpoint schemas: `td613.vsub-aperture.trainer-report/v1`, `td613.vsub-aperture.checkpoint/v1`.

## 16. Integration with Aperture / Dome-World

- **Inputs** arrive as Aperture scan packets on the substrate-resonant lanes (`admissibility_scan`,
  `phason_gate_scan`, `witness_scan`, `grade_gate_scan`).
- **Outputs** are capture receipts + the trainer report; the trainer writes grades/witness status to
  Aperture's `APERTURE_VECTOR_SUBSTRATE_INTAKE` via `mayInform` **only**.
- **Hard stops (binding):** the bridge is **one-way** (`Aperture → Flow-Core`); the trainer **informs**,
  never overrides Aperture doctrine; geometry **calibrates** route pressure, it does not become the
  instrument crown; **no Ash execution** here.

## 17. Failure modes & anti-patterns

1. **Float leakage** — any float in a capture/growth/grade/capacity decision. Forbidden.
2. **Silent snapping** — coercing a float artifact into integer coords without recording `snap ≠ exact`.
   Hides a `SELECTED` as a `FORCED`. Forbidden.
3. **Unbounded growth** — disabling the Northcott budget. The finiteness guarantee is the safety rail.
4. **Capture-as-cognition** — reading "captured/learned" as understanding. They are exact membership.
5. **Doctrine override** — writing anything but `mayInform` back to Aperture. Violates the one-way stop.

## 18. Open research items

- **E6 encoder** — *messy artifact → exact ℚ(θ) coords*. The genuine open front; unsolved.
- **λ (growth threshold)** — posited, not derived; a policy layer (`capacity_decision(lam=…)`).
- **Salem / reciprocal coordinates** — the Smyth-floor guarantee is conditional on non-reciprocity.
- **Maximal order** — the demo field runs at index 8 (`det G = disc = 147456 = d_K·8²`); production
  custody fields should confirm the maximal-order computation.
- **Cross-field learning** — wire `field_growing_learner` + `compositum_nondisjoint` (§12).
- **Forgetting / pruning** — growth is currently monotone; a principled, audited *pruning* (basis
  reduction) is unspecified.
- **Perception-loop separation** — the trainer adapts the **model** only; it must never touch a
  perception/dynamical engine's state (the engine enforces this guardrail).

## 19. Worked example (annotated)

`trainer/trainer_demo.py` over `K = ℚ(√2+√3)`, `B0 = span{1,θ}`, `persistence_N = 3`:

```
 #  artifact          grade         resid_before   dim  streak  grew
 1  in_field_1        FORCED                   0     2       0          # 3+2θ ∈ span{1,θ} → captured
 3  noise_a           OPEN                    96     2       1          # θ² off-axis, novelty appears
 4  noise_b           OPEN                  96/5     2       1          # θ³ — DIFFERENT direction, streak resets
 5  noise_c           OPEN                    96     2       1          # back to θ² direction
 6  novel_theta2_0    OPEN                    96     2       2          # θ² persists…
 7  novel_theta2_1    CONSTRUCTION            96     3       0   YES    # streak hit 3 → grow by 2√6 (x²−24)
 8  novel_theta2_2    FORCED                   0     3       0          # θ² now admissible
10  post_growth_check FORCED                   0     3       0          # learned
```

Read it as: novelty must hold its **direction** for `persistence_N` ticks (steps 5→6→7) before it becomes
a new exact basis direction; a direction change (step 4) resets the count; once grown, the direction is
captured forever (and survives checkpoint→resume).

## 20. Provenance & claim ceilings

`engine/*` are unmodified from the verified Vector-Substrate package (L00M `f238d6b`). `trainer/*`,
`bridge/aperture_residual_bridge.py`, schemas, and fixtures are authored for this build.
`bridge/phason_gate_exact.py`, `bridge/vsub_aperture_training_bridge.py` are the reference bridges.
No third-party code beyond `mpmath` / `sympy` / `pytest`. All outputs carry their claim ceilings; the
trainer is an **audit record and grade engine**, not a cognition, proof, or authority engine.

Sealed ⟐
