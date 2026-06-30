"""Bounded runtime facade for the exact Dome-World substrate.

This module is stateless. Checkpoints and proposals are client-held, signed
objects; no observation is silently discarded and no proposal mutates the
basis until an explicit confirmation call.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import sys
from fractions import Fraction
from typing import Any

import sympy as sp

_HERE = os.path.dirname(os.path.abspath(__file__))
for _path in (os.path.join(_HERE, "engine"), os.path.join(_HERE, "trainer")):
    if _path not in sys.path:
        sys.path.insert(0, _path)

from capacity import Budget, capacity_decision  # noqa: E402
from residual_learner import ResidualLearner, SeedProposal  # noqa: E402

from .emission_closure import validate_closure
from .release import APERTURE_SCHEMA, APERTURE_VERSION, DOME_WORLD_VERSION
from .trainer.trainer import exact_fraction

AMBIENT_MIN_POLY = [1, 0, -10, 0, 1]
DEFAULT_SEEDS = [[1, 0, 0, 0], [0, 1, 0, 0]]
CLAIM_CEILING = (
    "exact residual and closure receipts are bounded audit evidence, "
    "not identity, authorship, legal, release, or universal authority"
)


def _json_safe(value: Any) -> Any:
    if isinstance(value, Fraction):
        return str(value)
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    if isinstance(value, float):
        return value
    return value


def _canonical_bytes(value: Any) -> bytes:
    return json.dumps(
        _json_safe(value), sort_keys=True, separators=(",", ":"), ensure_ascii=True
    ).encode("utf-8")


def _digest(value: Any) -> str:
    return hashlib.sha256(_canonical_bytes(value)).hexdigest()


def sign_client_state(payload: dict, secret: str) -> dict:
    if not secret:
        raise ValueError("checkpoint signing secret is required")
    signature = hmac.new(secret.encode("utf-8"), _canonical_bytes(payload), hashlib.sha256).hexdigest()
    return {"payload": _json_safe(payload), "signature": signature}


def verify_client_state(token: dict, secret: str, expected_kind: str) -> dict:
    if not isinstance(token, dict) or not isinstance(token.get("payload"), dict):
        raise ValueError("signed client state is malformed")
    payload = token["payload"]
    supplied = token.get("signature", "")
    expected = hmac.new(secret.encode("utf-8"), _canonical_bytes(payload), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(str(supplied), expected):
        raise ValueError("signed client state failed authentication")
    if payload.get("kind") != expected_kind:
        raise ValueError(f"expected signed {expected_kind} state")
    return payload


def _exact_vector(value: Any, degree: int = 4) -> list[Fraction]:
    if not isinstance(value, (list, tuple)):
        raise TypeError("observation_coords must be an array")
    if len(value) != degree:
        raise ValueError(f"observation_coords must contain {degree} coordinates")
    return [exact_fraction(item) for item in value]


def _exact_int_list(value: Any, label: str) -> list[int]:
    if not isinstance(value, list) or not value:
        raise ValueError(f"{label} must be a non-empty integer array")
    result = []
    for item in value:
        if isinstance(item, bool) or isinstance(item, float):
            raise TypeError(f"{label} accepts exact integers only")
        parsed = exact_fraction(item)
        if parsed.denominator != 1:
            raise ValueError(f"{label} accepts exact integers only")
        result.append(int(parsed))
    return result


def _basis_from_payload(payload: dict) -> tuple[list[int], list[list[Fraction]]]:
    ambient = _exact_int_list(payload.get("ambient_min_poly", AMBIENT_MIN_POLY), "ambient_min_poly")
    degree = len(ambient) - 1
    raw_seeds = payload.get("seeds", DEFAULT_SEEDS)
    if not isinstance(raw_seeds, list) or not raw_seeds:
        raise ValueError("seeds must be a non-empty array")
    return ambient, [_exact_vector(seed, degree) for seed in raw_seeds]


def _learner(payload: dict) -> ResidualLearner:
    ambient, seeds = _basis_from_payload(payload)
    persistence = int(payload.get("persistence_N", 3))
    if persistence < 1 or persistence > 64:
        raise ValueError("persistence_N must be between 1 and 64")
    epsilon = exact_fraction(payload.get("epsilon", "1/100"))
    degree_max = int(payload.get("degree_max", 64))
    height_max = int(payload.get("height_max", 256))
    return ResidualLearner(
        ambient,
        seeds,
        persistence_N=persistence,
        epsilon=epsilon,
        budget=Budget(degree_max=degree_max, height_max=height_max),
    )


def _observation_receipt(payload: dict, learner: ResidualLearner) -> dict:
    state = learner.state()
    captured = bool(state["captured"])
    verdict = getattr(learner, "_last_verdict", None)
    status = "CAPTURED" if captured else "OPEN"
    if verdict is not None and verdict.decision == "REJECT":
        status = "REJECTED_CAPACITY"
    return {
        "schema": "td613.dome-world.exact-receipt/v0.4.3",
        "status": status,
        "observation": {
            "artifactId": payload.get("artifact_id"),
            "activeLane": payload.get("active_lane"),
            "coordinates": _json_safe(state["last_residual"]),
        },
        "decision": "captured-in-forced-basis" if captured else "preserved-open-residual",
        "reasons": [
            "exact trace-form residual equals zero"
            if captured
            else "exact trace-form residual remains outside the current forced basis"
        ],
        "residualNorm": str(state["last_residual_norm"]),
        "basisDimension": state["num_seeds"],
        "promotionRequirements": (
            []
            if captured
            else ["persistent exact residual", "capacity-admissible proposal", "explicit confirmation"]
        ),
        "witnessDigest": _digest({
            "residual": str(state["last_residual_norm"]),
            "basis": state["seed_coords"],
            "artifact": payload.get("artifact_id"),
        }),
        "claimCeiling": CLAIM_CEILING,
    }


def exact_capture(payload: dict) -> dict:
    """Observe one exact coordinate vector without mutating the basis."""
    if "observation_coords" not in payload:
        return {
            "schema": "td613.dome-world.exact-receipt/v0.4.3",
            "status": "ENCODER_REQUIRED",
            "observation": {
                "artifactId": payload.get("artifact_id"),
                "activeLane": payload.get("active_lane"),
            },
            "decision": "observation-preserved-without-coordinate-invention",
            "reasons": ["no exact observation_coords were supplied"],
            "promotionRequirements": ["authorized exact encoder or explicit rational coordinates"],
            "witnessDigest": _digest(payload),
            "claimCeiling": CLAIM_CEILING,
        }
    learner = _learner(payload)
    learner.observe(_exact_vector(payload["observation_coords"], learner.degree))
    return _observation_receipt(payload, learner)


def _proposal_payload(learner: ResidualLearner, proposal: SeedProposal, parent_hash: str) -> dict:
    return {
        "kind": "trainer-proposal",
        "schema": "td613.dome-world.trainer-proposal/v0.4.3",
        "ambient_min_poly": learner.state()["ambient_min_poly"],
        "parent_hash": parent_hash,
        "basis": learner.state()["seed_coords"],
        "proposal": {
            "min_poly": proposal.min_poly,
            "coords": proposal.coords,
            "centroid": proposal.centroid,
            "streak": proposal.streak,
            "snap": proposal.snap,
            "reason": proposal.reason,
        },
    }


def trainer_propose(payload: dict, secret: str) -> dict:
    """Read a bounded observation stream and return a signed, non-mutating proposal."""
    observations = payload.get("observations")
    if not isinstance(observations, list) or not observations:
        raise ValueError("observations must be a non-empty array")
    if len(observations) > 64:
        raise ValueError("at most 64 observations are accepted per proposal")
    learner = _learner(payload)
    preserved = []
    for index, observation in enumerate(observations):
        coords = observation.get("observation_coords") if isinstance(observation, dict) else observation
        if coords is None:
            preserved.append({"index": index, "status": "ENCODER_REQUIRED"})
            continue
        learner.observe(_exact_vector(coords, learner.degree))
        state = learner.state()
        preserved.append({
            "index": index,
            "status": "CAPTURED" if state["captured"] else "OPEN",
            "residualNorm": str(state["last_residual_norm"]),
        })
    proposal = learner.propose()
    state = learner.state()
    parent = {
        "ambient_min_poly": state["ambient_min_poly"],
        "basis": state["seed_coords"],
        "witness_head": state["witness_head"],
    }
    parent_hash = _digest(parent)
    if proposal is None:
        last_verdict = getattr(learner, "_last_verdict", None)
        status = "REJECTED_CAPACITY" if last_verdict and last_verdict.decision == "REJECT" else "OPEN"
        return {
            "schema": "td613.dome-world.trainer-step/v0.4.3",
            "status": status,
            "observation": preserved,
            "decision": "no-basis-mutation",
            "reasons": [
                last_verdict.reason
                if last_verdict is not None
                else "persistence, calibration, or exact-encoder requirements are not yet satisfied"
            ],
            "promotionRequirements": ["additional exact observations or revised declared capacity"],
            "witnessDigest": parent_hash,
            "claimCeiling": CLAIM_CEILING,
        }
    signed = sign_client_state(_proposal_payload(learner, proposal, parent_hash), secret)
    return {
        "schema": "td613.dome-world.trainer-step/v0.4.3",
        "status": "CONSTRUCTION_PROPOSED",
        "observation": preserved,
        "decision": "proposal-issued-without-basis-mutation",
        "reasons": ["persistent exact residual produced a capacity-admissible seed proposal"],
        "proposalToken": signed,
        "promotionRequirements": ["explicit operator confirmation", "authenticated proposal token"],
        "witnessDigest": _digest(signed),
        "claimCeiling": CLAIM_CEILING,
    }


def trainer_confirm(payload: dict, secret: str) -> dict:
    """Confirm an authenticated proposal and return a signed client-held checkpoint."""
    proposal_state = verify_client_state(payload.get("proposalToken"), secret, "trainer-proposal")
    current_parent = _digest({
        "ambient_min_poly": proposal_state["ambient_min_poly"],
        "basis": proposal_state["basis"],
        "witness_head": "genesis",
    })
    if not hmac.compare_digest(proposal_state["parent_hash"], current_parent):
        raise ValueError("proposal parent hash failed verification")
    learner = ResidualLearner(proposal_state["ambient_min_poly"], proposal_state["basis"])
    raw = proposal_state["proposal"]
    proposal = SeedProposal(
        min_poly=_exact_int_list(raw["min_poly"], "proposal.min_poly"),
        coords=_exact_vector(raw["coords"], learner.degree),
        centroid=_exact_vector(raw["centroid"], learner.degree),
        streak=int(raw["streak"]),
        centroid_norm=0.0,
        snap=str(raw["snap"]),
        reason=str(raw["reason"]),
    )
    witness = learner.confirm(proposal)
    state = learner.state()
    checkpoint_payload = {
        "kind": "trainer-checkpoint",
        "schema": "td613.dome-world.trainer-checkpoint/v0.4.3",
        "ambient_min_poly": state["ambient_min_poly"],
        "basis": state["seed_coords"],
        "parent_hash": proposal_state["parent_hash"],
        "witness_head": state["witness_head"],
        "witness_len": state["witness_len"],
    }
    checkpoint = sign_client_state(checkpoint_payload, secret)
    return {
        "schema": "td613.dome-world.trainer-step/v0.4.3",
        "status": "CAPTURED",
        "observation": {"proposal": _json_safe(raw)},
        "decision": "basis-growth-confirmed",
        "reasons": ["operator-confirmed exact seed passed algebraic-integer validation"],
        "checkpoint": checkpoint,
        "promotionRequirements": [],
        "witnessDigest": witness["hash"],
        "claimCeiling": CLAIM_CEILING,
    }


def exact_closure(payload: dict) -> dict:
    """Run the emission-gap guard only when the caller explicitly opts in."""
    profile = payload.get("profile")
    if profile != "emission-gap":
        return {
            "schema": "td613.dome-world.exact-closure/v0.4.3",
            "status": "OPEN",
            "observation": {"profile": profile},
            "decision": "general-residual-learning-unchanged",
            "reasons": ["emission closure is opt-in and was not selected"],
            "promotionRequirements": ["select profile=emission-gap and provide explicit rational c"],
            "witnessDigest": _digest(payload),
            "claimCeiling": CLAIM_CEILING,
        }
    if "c" not in payload:
        raise ValueError("the emission profile requires an explicit rational c")
    c_value = exact_fraction(payload["c"])
    if c_value <= 0:
        raise ValueError("c must be a positive exact rational")
    matrix_value = payload.get("matrix")
    if not isinstance(matrix_value, list) or not matrix_value:
        raise ValueError("matrix must be a non-empty square integer matrix")
    rows = [_exact_int_list(row, "matrix row") for row in matrix_value]
    if any(len(row) != len(rows) for row in rows):
        raise ValueError("matrix must be square")
    result = validate_closure(sp.Matrix(rows))
    lambda_value = 2 * c_value
    return {
        "schema": "td613.dome-world.exact-closure/v0.4.3",
        "status": result["verdict"],
        "observation": {
            "profile": "emission-gap",
            "c": str(c_value),
            "lambda": str(lambda_value),
            "costFloor": f"{lambda_value}*log(phi)",
            "salemFactors": result["salemFactors"],
        },
        "decision": "emission-closure-guard-evaluated",
        "reasons": ["exact reciprocal-factor and Q(sqrt(5)) boundary tests completed"],
        "promotionRequirements": [],
        "witnessDigest": _digest(result),
        "claimCeiling": CLAIM_CEILING,
    }


def information_threshold_receipt(payload: dict) -> dict:
    """Exercise the opt-in, free-c information threshold without changing default learning."""
    if payload.get("profile") != "emission-gap":
        raise ValueError("information threshold requires profile=emission-gap")
    c_value = exact_fraction(payload.get("c"))
    verdict = capacity_decision(
        _exact_int_list(payload["min_poly"], "min_poly"),
        exact_fraction(payload["residual_norm"]),
        Budget(int(payload.get("degree_max", 64)), int(payload.get("height_max", 256))),
        info_threshold=True,
        ambient_degree=int(payload["ambient_degree"]),
        one_in_basis=bool(payload.get("one_in_basis")),
        lam=2 * c_value,
    )
    return {
        "status": {"GROW": "CAPTURED", "REJECT": "REJECTED_CAPACITY", "STOP": "OPEN"}[verdict.decision],
        "decision": verdict.decision,
        "lambda": str(2 * c_value),
        "reason": verdict.reason,
        "claimCeiling": CLAIM_CEILING,
    }
