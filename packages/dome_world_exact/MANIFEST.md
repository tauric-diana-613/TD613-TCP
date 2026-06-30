# MANIFEST — Dome-World × Aperture × Vector-Substrate Bridge (+ Trainer Kit)

One-command verification: `python3 verify_bridge.py` (exits 0 IFF green).

## Suite counts to reproduce
```
ENV     python ≥ 3.10 ; mpmath, sympy, pytest importable
PART A  engine tests                       34 passed
PART B  phason_gate_exact.py               geometry ALL PASS + CUSTODY PHASON FLIP
        vsub_aperture_training_bridge.py   det G == disc(f) True ; FORCED & CONSTRUCTION
        aperture_residual_bridge.py        residual_before 96 ; FORCED & CONSTRUCTION ; witness intact
        trainer/trainer_demo.py            growth_events 1 (x^2-24) ; SESSION OK: True
```

## Documents
- `BUILD_SPEC.md` — build/packaging spec (E1–E6 work items, interfaces, phased delivery, open issues).
- `TRAINER_SPEC.md` — comprehensive trainer formulation (expands E2–E4: loop, gates, state, metrics,
  config, failure modes, open research items). Reference scaffold: `trainer/trainer.py`.
- `README.md` — LLM/dev guide.

## Provenance
- `engine/*` — minimal transitive import-closure of `residual_learner.py`, extracted **unmodified**
  from the verified Vector-Substrate / residual-return package, L00M head `f238d6b`
  (`residual_learner` 218c02e + variance_calibration 1366d1c; `coords_to_minpoly`/`invariant_factors`
  c1db881; `capacity` c8fdb8a; `integral_basis`/`projector`/`loom` = L0 exact core).
- `bridge/phason_gate_exact.py`, `bridge/vsub_aperture_training_bridge.py` — reference bridges (exact ℚ(τ)/ℚ(θ)).
- `bridge/aperture_residual_bridge.py`, `trainer/*`, `verify_bridge.py`, `TRAINER_SPEC.md`,
  `schemas/vsub-aperture-capture.schema.json`, `fixtures/aperture_{in,out_of}_field_packet.json` — authored for this build.
- `schemas/phason-gate.schema.json`, `fixtures/aperture_v293_bridge_packet.json` — from Dome-World v0.4.2b.
- No third-party code beyond `mpmath` / `sympy` / `pytest`.

## Integrity
Per-file sha256 in `SHA256SUMS`. Verify with `sha256sum -c SHA256SUMS`.

## File inventory
```
BUILD_SPEC.md
README.md
TRAINER_SPEC.md
bridge/aperture_residual_bridge.py
bridge/phason_gate_exact.py
bridge/vsub_aperture_training_bridge.py
engine/capacity.py
engine/coords_to_minpoly.py
engine/integral_basis.py
engine/invariant_factors.py
engine/loom.py
engine/projector.py
engine/residual_learner.py
engine/test_capacity.py
engine/test_coords_to_minpoly.py
engine/test_residual_learner.py
fixtures/aperture_in_field_packet.json
fixtures/aperture_out_of_field_packet.json
fixtures/aperture_v293_bridge_packet.json
requirements.txt
schemas/phason-gate.schema.json
schemas/vsub-aperture-capture.schema.json
trainer/trainer.py
trainer/trainer_demo.py
verify_bridge.py
```

Sealed ⟐
