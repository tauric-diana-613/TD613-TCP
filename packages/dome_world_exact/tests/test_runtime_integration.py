from __future__ import annotations

import copy

import pytest

from packages.dome_world_exact.runtime import (
    exact_capture,
    exact_closure,
    information_threshold_receipt,
    trainer_confirm,
    trainer_propose,
)


SECRET = "integration-test-secret"


def test_float_coordinates_are_rejected_at_public_boundary():
    with pytest.raises(TypeError):
        exact_capture({"observation_coords": [1, 0.5, 0, 0]})


def test_missing_encoder_preserves_open_observation():
    receipt = exact_capture({"artifact_id": "unencoded-1", "active_lane": "intake"})
    assert receipt["status"] == "ENCODER_REQUIRED"
    assert receipt["observation"]["artifactId"] == "unencoded-1"


def test_proposal_and_confirmation_are_separate_signed_operations():
    proposal = trainer_propose({
        "observations": [
            {"observation_coords": [1, 0, 1, 0]},
            {"observation_coords": [1, 0, 1, 0]},
            {"observation_coords": [1, 0, 1, 0]},
        ]
    }, SECRET)
    assert proposal["status"] == "CONSTRUCTION_PROPOSED"
    assert "checkpoint" not in proposal

    confirmed = trainer_confirm({"proposalToken": proposal["proposalToken"]}, SECRET)
    assert confirmed["status"] == "CAPTURED"
    assert confirmed["checkpoint"]["payload"]["witness_len"] == 1


def test_tampered_proposal_is_rejected():
    result = trainer_propose({
        "observations": [[1, 0, 1, 0], [1, 0, 1, 0], [1, 0, 1, 0]]
    }, SECRET)
    token = copy.deepcopy(result["proposalToken"])
    token["payload"]["proposal"]["coords"][2] = "2"
    with pytest.raises(ValueError, match="authentication"):
        trainer_confirm({"proposalToken": token}, SECRET)


def test_emission_profile_is_opt_in_and_c_is_free():
    idle = exact_closure({"matrix": [[1, 0], [0, 1]]})
    assert idle["status"] == "OPEN"

    result = exact_closure({
        "profile": "emission-gap",
        "c": "3/5",
        "matrix": [[1, 0], [0, 1]],
    })
    assert result["status"] == "FORCED"
    assert result["observation"]["c"] == "3/5"
    assert result["observation"]["lambda"] == "6/5"
    assert result["observation"]["costFloor"] == "6/5*log(phi)"


def test_information_threshold_accepts_rational_lambda_from_free_c():
    receipt = information_threshold_receipt({
        "profile": "emission-gap",
        "c": "3/5",
        "min_poly": [1, 0, -1, -1],
        "residual_norm": "1000",
        "ambient_degree": 4,
        "one_in_basis": True,
    })
    assert receipt["lambda"] == "6/5"
    assert receipt["decision"] in {"GROW", "STOP", "REJECT"}
