# README — Dome-World × Aperture × Vector-Substrate Bridge (LLM build guide)

**You are picking up a self-contained, verified bridge package.** It contains the *exact* training
engine from the Vector-Substrate / residual-return system (the real, unmodified modules), three
runnable bridge demos, JSON schemas, fixtures, a one-command verification gate, and a full build
specification (`BUILD_SPEC.md`). Your job: **extract it, install three dependencies, run one command,
confirm `ALL GREEN`, then build the enhancements in `BUILD_SPEC.md` §5 (E1–E6)** by wiring the
exact decisions into the Dome-World / Flow-Core bridge.

The discipline of this stack: *every admissibility decision is exact (`Fraction`/`int`), backed by a
test you can run; floats are quarantined to display only.* Nothing here needs the internet.

---

## STEP 0 — Read these first (in order)

1. `BUILD_SPEC.md` — the build target. Read **§3 (scope & hard stops)**, **§5 (the E1–E6 work items)**,
   and **§10 (open issues)** before changing anything. The hard stops are binding.
2. `TRAINER_SPEC.md` — if you are building a **trainer** (the streaming loop on top of the bridge), this
   is your spec: the loop, the gates, state/checkpoint, config, metrics, failure modes, open items.
3. `MANIFEST.md` — file inventory, provenance (commit hashes), and the suite counts you must reproduce.
4. This README.

Do not skip §3 of the build spec. The bridge is **one-way** (`Aperture → Flow-Core`), the substrate
**informs** Aperture's witness/grade lane rather than overriding doctrine, and **Ash execution is out
of scope** until explicitly authorized.

---

## STEP 1 — Run everything in one go

```sh
cd domeworld-aperture-substrate-bridge
pip install -r requirements.txt
python3 verify_bridge.py
```

A successful run ends with:

```
  ALL GREEN. Exact training engine + bridges run end-to-end.
```

`verify_bridge.py` exits `0` iff everything is green, so it doubles as a CI gate. **A genuine failure
names the step that failed — investigate it, do not hand-wave it.**

---

## STEP 2 — The package, file by file

| Path | What it is | What it establishes |
|---|---|---|
| `verify_bridge.py` | orchestrator | env + engine tests + bridge demos; exit 0 IFF green |
| `engine/` | the **real** residual-learner closure (from L00M `f238d6b`) | the exact training modules, runnable and tested |
| `engine/test_*.py` | the engine's own tests | `34 passed` |
| `bridge/phason_gate_exact.py` | E1 reference: exact ℚ(τ) cut-and-project gate | verifies the matrices; decides a custody flip exactly |
| `bridge/vsub_aperture_training_bridge.py` | E2–E4 reference (no engine import; sympy only) | capture/grow over ℚ from an Aperture packet; `det G = disc(f)` |
| `bridge/aperture_residual_bridge.py` | E2–E4 **production wiring** (drives the real engine) | real `ResidualLearner` captures FORCED / grows CONSTRUCTION |
| `trainer/trainer.py` | reference **Trainer** scaffold (streaming loop on the bridge) | `fit`/`step`/`checkpoint`/`resume` + metrics over the real engine |
| `trainer/trainer_demo.py` | a worked training session | capture, no-grow-on-transient, growth-on-persistent, resume |
| `schemas/` | the event + capture-receipt JSON Schemas | the contracts the bridge emits |
| `fixtures/` | Aperture scan packets (in-field, out-of-field, route-weather) | inputs the demos consume |

The two `bridge/*training*` files are intentionally redundant: the **sympy reference** shows the
decision with zero engine dependencies (read it to understand the math); the **real-engine bridge**
shows the production seam (copy its `sys.path`→`engine/` import pattern when you wire E2–E5).

---

## STEP 3 — Numbers to confirm

```
ENV       python ≥ 3.10 ; mpmath, sympy, pytest importable
PART A    engine tests                         34 passed
PART B    phason_gate_exact.py                 geometry ALL PASS + CUSTODY PHASON FLIP
          vsub_aperture_training_bridge.py     det G == disc(f) True ; grades FORCED & CONSTRUCTION
          aperture_residual_bridge.py          residual_before 96 ; FORCED & CONSTRUCTION ; witness intact
```

The recurring `96` is not arbitrary: it is the exact residual norm of `2√6` against `span{1,θ}` in
`K = ℚ(√2+√3)`, a worked value from the Vector-Substrate paper. The out-of-field artifact grows the
forced basis by exactly `2√6` (minpoly `x²−24`).

---

## STEP 4 — How to build the enhancements (E1–E6)

Each enhancement wires an exact decision into the Dome-World bridge (`dome_ambiance_core.js`) or feeds
Aperture's witness/grade lane. Build them **in order**; after each, `verify_bridge.py` must stay green
and you must add a regression marker to PART B of the orchestrator.

### E1 — Exact Phason-Gate decision (Seam 1)
**Replace** in `dome_ambiance_core.js`: `simulatePhasonGate`'s `severity = …includes('quarantine')…`.
**With**: an exact acceptance-window decision. Port the algorithm in `bridge/phason_gate_exact.py`
(verify matrices `B Bᵀ=I`, `c∥≈0.371748`, `c⊥≈0.601501`; decide membership of `r⊥ = c⊥·B⊥·n + w(t)`
in `W_r`). In dependency-free JS the load-bearing primitive is `sign5(a,b)` (exact sign of `a+b√5`,
BigInt); window membership reduces to `sign5` calls after squaring, staying in ℚ(√5). Keep the emitted
event conformant to `schemas/phason-gate.schema.json`. **Marker:** `decision_basis` =
`exact-sign-over-Q(tau)-no-float-threshold`.

### E2 — Exact residual capture (Seam 2)
**Replace**: float `gluing_obstruction` / `projection_shift` in `normalizeApertureMetrics`.
**With**: the measured residual norm. Add an `admissibility` lane that takes the packet's
`observation_coords` and computes `captured ⟺ ‖r‖²_G = 0`. Production path: import the engine exactly
as `bridge/aperture_residual_bridge.py` does (`sys.path.insert(0, engine/)`; `from residual_learner
import ResidualLearner`). **Marker:** in-field packet → `projection_residual_before: "0"`,
`captured: true`.

### E3 — Lexicon / field growth
**Add** (no v0.4.2b equivalent): on persistent off-axis residual, call `propose()`/`confirm()` to grow
the forced basis. **Marker:** out-of-field packet → `field_grew: true`, `forced_basis_dim: [2,3]`,
`adjoined_seed_minpoly: [1,0,-24]`, `projection_residual_after: "0"`.

### E4 — Computed grade gate
**Replace**: the asserted grade in Aperture's `apertureV273GradeGateScript`.
**With**: the grade map in either bridge (`FORCED` / `CONSTRUCTION` / `SELECTED` / `OPEN` from the exact
residual + snap-exactness). Emit `td613.vsub-aperture.capture/v1` (see
`schemas/vsub-aperture-capture.schema.json`). Write the grade to Aperture's `mayInform: grade-ceiling`
channel **only** — never to doctrine. **Marker:** receipt `grade` is one of the four values, computed.

### E5 — Bounded narrowing (Northcott)
**Add**: enforce `engine/capacity.py`'s degree/height budget on growth so the admissible set stays
finite/enumerable and growth is **refused** (not crashed) above the bound. **Marker:** a regression that
feeds a beyond-budget seed and asserts refusal.

### E6 — Encoder seam (interface only — DO NOT implement without authorization)
The map *messy artifact → exact ℚ(θ) `observation_coords`* is the open front (`BUILD_SPEC.md` §10.6).
Implement only the **interface** (the `observation_coords` field + the `APERTURE_VECTOR_SUBSTRATE_INTAKE`
socket). Until E6 lands, the caller supplies exact coordinates. Do not fabricate an encoder that snaps
floats silently — that breaks the exactness guarantee.

**Wiring checklist for each of E1–E5:** (1) change only the named seam; (2) keep all claim ceilings on
outputs; (3) respect the one-way hard stop (write to Aperture only via `mayInform`); (4) add a PART-B
marker to `verify_bridge.py`; (5) re-run `verify_bridge.py` → green.

---

## STEP 5 — Honest scope (frame your work correctly)

- This is a **verification-grade exact admissibility/training kernel**, not a general learner and not an
  LLM. "Captured" / "zero residual" are **local technical terms** (exact membership over ℚ), never a
  cognitive claim. `residual` is an **audit signal and grade**, not proof or authority.
- The bridge **translates**; it does not execute Aperture and does not run Ash. Geometry **calibrates**
  route pressure; it does not become the instrument crown.
- The open fronts are real and named: the **encoder** (E6), a **derivation of λ**, and the
  Salem-number / non-maximal-order caveats in `BUILD_SPEC.md` §10. Do not paper over them.

---

## Environment notes / troubleshooting

- **Python 3.10+.** `pip install -r requirements.txt` installs `mpmath` (engine: `capacity.py`),
  `sympy` (bridges), `pytest` (engine tests + `verify_bridge.py` Part A).
- The `engine/` core (`integral_basis`, `projector`, `loom`, `coords_to_minpoly`, `invariant_factors`,
  `residual_learner`) is **pure stdlib**; only `capacity.py` needs `mpmath`, and only `bridge/*` needs
  `sympy`.
- **No network needed.** If `verify_bridge.py` reports a missing dependency, run the `pip install` line
  and re-run.
- To run a single demo directly: `python3 bridge/aperture_residual_bridge.py`. To run only the engine
  tests: `cd engine && python3 -m pytest -q`.

Sealed ⟐
