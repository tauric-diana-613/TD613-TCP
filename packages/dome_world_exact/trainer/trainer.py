#!/usr/bin/env python3
"""
trainer.py -- REFERENCE TRAINER scaffold for the vector-substrate training bridge.

This is the streaming loop Tim & Erin asked to build on top of the single-step bridge
(bridge/vsub_aperture_training_bridge.py and bridge/aperture_residual_bridge.py).
It wraps the REAL, verified ResidualLearner (../engine) and turns "one observe/grow step"
into a full training session over a stream of Aperture scan packets, with metrics,
checkpoint/resume, and a clearly-marked encoder seam (E6) that the team owns.

It is a SCAFFOLD, not a finished product: the parts you extend are marked `# E6` (the
artifact->exact-coords encoder) and `# POLICY` (calibration / capacity tuning). Everything
the substrate decides is EXACT (Fraction/int); no float crosses any decision boundary.

Run the companion `trainer_demo.py` for a worked session. See TRAINER_SPEC.md for the
full specification this implements.
"""
from __future__ import annotations
import os, sys
from dataclasses import dataclass, field, replace
from fractions import Fraction
from typing import Any, Callable, Iterable, List, Optional

# --- import the shipped, verified engine (../engine) -------------------------------------------
_HERE = os.path.dirname(os.path.abspath(__file__))
_ENGINE = os.path.normpath(os.path.join(_HERE, "..", "engine"))
if _ENGINE not in sys.path:
    sys.path.insert(0, _ENGINE)
from residual_learner import ResidualLearner, SeedProposal, variance_calibration  # noqa: E402
from capacity import Budget                                                        # noqa: E402

GRADES = ("FORCED", "CONSTRUCTION", "SELECTED", "OPEN")


def exact_fraction(value: Any) -> Fraction:
    """Parse an exact boundary value without rationalizing binary floats."""
    if isinstance(value, bool) or isinstance(value, float):
        raise TypeError("exact coordinates accept integers or rational strings, not bool/float")
    if isinstance(value, Fraction):
        return value
    if isinstance(value, int):
        return Fraction(value)
    if isinstance(value, str):
        raw = value.strip()
        if not raw or any(ch in raw.lower() for ch in (".", "e")):
            raise ValueError(f"invalid rational string: {value!r}")
        try:
            return Fraction(raw)
        except (ValueError, ZeroDivisionError) as exc:
            raise ValueError(f"invalid rational string: {value!r}") from exc
    raise TypeError(f"unsupported exact coordinate type: {type(value).__name__}")


def grade_of(captured: bool, grew: bool, snap: str) -> str:
    """Computed grade on Aperture's lattice (E4). Exact inputs only."""
    if captured:                  return "FORCED"        # value-forced: already in the admissible span
    if grew and snap == "exact":  return "CONSTRUCTION"  # admitted by a determined (exact) growth
    if grew:                      return "SELECTED"       # growth needed a non-exact snap (a policy choice)
    return "OPEN"                                         # persistent/transient novelty, not yet admissible


@dataclass
class TrainerConfig:
    """Every knob the substrate trainer exposes. Defaults reproduce the engine's shipped behaviour."""
    ambient_min_poly: List[int]                 # monic-integer minpoly of theta (the ambient field K)
    seeds: List[List[int]]                      # initial forced basis B (coordinate vectors in K)
    persistence_N: int = 3                      # ticks the residual DIRECTION must hold before growth
    epsilon: Fraction = Fraction(1, 100)        # capture tolerance band (exact; default exact-zero capture)
    height_bound: int = 256                     # Northcott coefficient-height cap on adjoined seeds
    degree_bound: Optional[int] = None          # optional degree cap (None -> ambient degree)
    budget: Optional[Budget] = None             # explicit Northcott Budget(degree_max, height_max)
    # POLICY: calibration gate -- require the residual MAGNITUDE to settle, not just its direction
    use_variance_calibration: bool = False
    warm_up: Optional[int] = None               # min accumulated ticks before calibration can pass
    max_rel_spread: Fraction = Fraction(1, 4)   # allowed sample spread / centroid magnitude
    witness_path: Optional[str] = None          # optional on-disk tamper-evident witness log


class Trainer:
    """A streaming trainer over the exact vector substrate. Training == gated dictionary growth."""

    def __init__(self, config: TrainerConfig, encoder: Optional[Callable[[Any], List]] = None):
        self.cfg = config
        self._encoder = encoder
        self.learner = ResidualLearner(
            config.ambient_min_poly, config.seeds,
            persistence_N=config.persistence_N, epsilon=config.epsilon,
            height_bound=config.height_bound, degree_bound=config.degree_bound,
            budget=config.budget, witness_path=config.witness_path,
        )
        if config.use_variance_calibration:                    # install the exact magnitude gate
            self.learner._calibration_ok = variance_calibration(
                self.learner, warm_up=config.warm_up, max_rel_spread=config.max_rel_spread)
        self.history: List[dict] = []
        self.growth_events: List[dict] = []
        self._seen = 0
        self._captured = 0

    # ---- E6 ENCODER SEAM (the open front -- the team owns this) ----------------------------------
    def encode(self, artifact: Any) -> List[Fraction]:
        """artifact -> EXACT coordinate vector in K. Reference stub: accept coords, never snap floats."""
        if self._encoder is not None:
            return [exact_fraction(c) for c in self._encoder(artifact)]
        if isinstance(artifact, dict) and "observation_coords" in artifact:
            return [exact_fraction(c) for c in artifact["observation_coords"]]
        if isinstance(artifact, (list, tuple)):
            return [exact_fraction(c) for c in artifact]
        raise NotImplementedError(
            "E6 encoder not provided. Supply `observation_coords` or pass an encoder=. The "
            "messy-artifact -> exact-Q(theta)-coords map is the open front (TRAINER_SPEC / BUILD_SPEC E6). "
            "Do NOT silently snap floats: that breaks the exactness invariant.")

    # ---- one training step: observe, then GATED growth (persistence + calibration + capacity) -----
    def step(self, artifact: Any) -> dict:
        coords = self.encode(artifact)
        dim_before = self.learner.state()["num_seeds"]
        self.learner.observe(coords)
        st = self.learner.state()
        captured = st["captured"]
        residual_before = st["last_residual_norm"]

        grew = False
        snap = "n/a"
        minpoly: Optional[List[int]] = None
        if not captured:
            proposal: Optional[SeedProposal] = self.learner.propose()   # None unless gates pass
            if proposal is not None:
                self.learner.confirm(proposal)                          # the SOLE mutator
                grew = True
                snap = proposal.snap
                minpoly = list(proposal.min_poly)
                self.growth_events.append({"minpoly": minpoly, "snap": snap, "streak": proposal.streak})

        st2 = self.learner.state()
        self._seen += 1
        if captured:
            self._captured += 1
        rec = {
            "schema": "td613.vsub-aperture.capture/v1",
            "artifact_id": artifact.get("artifact_id") if isinstance(artifact, dict) else None,
            "active_lane": artifact.get("active_lane") if isinstance(artifact, dict) else None,
            "captured": bool(captured),
            "projection_residual_before": str(residual_before),     # novelty signal; 0 IFF already captured
            "projection_residual_after": str(st2["last_residual_norm"]),
            "field_grew": grew,
            "forced_basis_dim": [dim_before, st2["num_seeds"]],
            "adjoined_seed_minpoly": minpoly,
            "grade": grade_of(captured, grew, snap),
            "streak": st2["streak"],
            "decision_basis": "exact-residual-over-Q-no-float-threshold (real engine)",
            "claim_ceiling": "residual-is-audit-signal-and-grade-not-proof-or-authority",
        }
        self.history.append(rec)
        return rec

    def fit(self, stream: Iterable[Any]) -> dict:
        for artifact in stream:
            self.step(artifact)
        return self.report()

    # ---- state / checkpoint / resume : the forced basis IS the model ------------------------------
    def checkpoint(self) -> dict:
        st = self.learner.state()
        return {
            "schema": "td613.vsub-aperture.checkpoint/v1",
            "ambient_min_poly": st["ambient_min_poly"],
            "seed_coords": st["seed_coords"],          # the model = the forced-basis columns (exact)
            "witness_head": st["witness_head"],
            "witness_len": st["witness_len"],
        }

    @classmethod
    def resume(cls, config: TrainerConfig, checkpoint: dict, *,
               expected_parent_hash: Optional[str] = None) -> "Trainer":
        """Resume a structurally validated checkpoint.

        Network callers must additionally authenticate the checkpoint before
        calling this method; runtime.py supplies the HMAC boundary.
        """
        if checkpoint.get("schema") != "td613.vsub-aperture.checkpoint/v1":
            raise ValueError("unsupported checkpoint schema")
        if checkpoint.get("ambient_min_poly") != config.ambient_min_poly:
            raise ValueError("checkpoint ambient field does not match trainer configuration")
        if not isinstance(checkpoint.get("seed_coords"), list) or not checkpoint["seed_coords"]:
            raise ValueError("checkpoint seed basis is missing")
        if expected_parent_hash is not None and checkpoint.get("parent_hash") != expected_parent_hash:
            raise ValueError("checkpoint parent hash does not match")
        for seed in checkpoint["seed_coords"]:
            for coordinate in seed:
                exact_fraction(coordinate)
        cfg = replace(config, seeds=checkpoint["seed_coords"])
        return cls(cfg)

    # ---- observability ----------------------------------------------------------------------------
    def report(self) -> dict:
        grade_dist: dict = {}
        for r in self.history:
            grade_dist[r["grade"]] = grade_dist.get(r["grade"], 0) + 1
        return {
            "schema": "td613.vsub-aperture.trainer-report/v1",
            "observations": self._seen,
            "capture_rate": f"{self._captured}/{self._seen}",
            "growth_events": len(self.growth_events),
            "adjoined_minpolys": [g["minpoly"] for g in self.growth_events],
            "final_basis_dim": self.learner.state()["num_seeds"],
            "grade_distribution": grade_dist,
            "witness_intact": bool(self.learner.verify_witness()),   # tamper-evident training log
            "claim_ceiling": "trainer-audit-record-not-cognition-proof",
        }
