from __future__ import annotations

import pytest

from packages.dome_world_exact.flowcore_context import (
    CONTEXT_RECEIPT_SCHEMA,
    OPERATION,
    SENSOR_REGISTRY,
    instrument_context,
    readiness_receipt,
)


def measurement(name, value, sensor="derived-formula", status="DERIVED", transforms=None):
    return {
        "name": name,
        "value": value,
        "sensor_id": sensor,
        "source_status": status,
        "transformation_history": transforms or ["fixture input -> bounded metric"],
    }


def complete_payload(sensor="derived-formula", status="DERIVED"):
    return {
        "diagnosticReceipt": {"receipt_id": "apdiag_phase3_fixture"},
        "measurements": [
            measurement("omissionPressure", 0.2, sensor, status),
            measurement("coherence", 0.75, sensor, status),
            measurement("divergence", 0.3, sensor, status),
            measurement("namingSensitivity", 0.4, sensor, status),
            measurement("rupturePressure", 0.1, sensor, status),
        ],
    }


def test_readiness_declares_phase3_jurisdiction():
    receipt = readiness_receipt()
    assert receipt["status"] == "phase-3-active"
    assert receipt["operations"] == [OPERATION]
    assert receipt["artifactBlind"] is True
    assert receipt["privateByDefault"] is True
    assert receipt["automaticAshAction"] is False
    assert receipt["predictionAuthorized"] is False
    assert receipt["bridgeIntegrationStatus"] == "PHASE_4_DEFERRED"


def test_complete_derived_context_returns_bounded_weather():
    receipt = instrument_context(complete_payload(), {"version": "v3.0-alpha"})
    assert receipt["schema"] == CONTEXT_RECEIPT_SCHEMA
    assert receipt["status"] == "OPEN"
    assert receipt["context_posture"] == "CONTEXT_READY"
    assert receipt["source_status"] == "DERIVED"
    assert receipt["sensor_id"] == "flowcore-context-instrument"
    assert receipt["authority_class"] == "A2_DERIVATIONAL"
    assert receipt["artifact_reference"] is None
    assert receipt["artifact_blind"] is True
    assert receipt["diagnostic_receipt_reference"] == "apdiag_phase3_fixture"
    assert receipt["modeled_weather"]["routePressure"] == 0.2125
    assert receipt["recommendation_not_command"] is True
    assert receipt["automatic_ash_action"] is False
    assert receipt["prediction_authorized"] is False
    assert receipt["privacy"]["visibility"] == "PRIVATE_LOCAL_DEFAULT"
    assert all(item["source_status"] for item in receipt["measurements"])
    assert all(item["sensor_id"] for item in receipt["measurements"])


def test_unknown_sensor_routes_to_unresolved_and_abstains():
    receipt = instrument_context(complete_payload(sensor="mystery-sensor", status="OBSERVED"))
    assert receipt["status"] == "ABSTAIN"
    assert receipt["context_posture"] == "ABSTAIN_INSUFFICIENT_CONTEXT"
    assert receipt["source_status"] == "UNRESOLVED"
    assert receipt["modeled_weather"] is None
    assert all(item["sensor_id"] == "unknown" for item in receipt["measurements"])
    assert all(item["source_status"] == "UNRESOLVED" for item in receipt["measurements"])


def test_simulated_sensor_cannot_present_as_observed():
    receipt = instrument_context(complete_payload(sensor="simulated-fixture", status="OBSERVED"))
    assert receipt["status"] == "ABSTAIN"
    assert any(
        "cannot claim OBSERVED" in missing
        for item in receipt["measurements"]
        for missing in item["missingness"]
    )


def test_declared_simulation_remains_simulated():
    receipt = instrument_context(complete_payload(sensor="simulated-fixture", status="SIMULATED"))
    assert receipt["status"] == "OPEN"
    assert set(receipt["input_source_statuses"]) == {"SIMULATED"}
    assert all(item["source_status"] == "SIMULATED" for item in receipt["measurements"])
    assert receipt["source_status"] == "DERIVED"


def test_missing_required_metric_forces_abstention():
    payload = complete_payload()
    payload["measurements"] = [item for item in payload["measurements"] if item["name"] != "coherence"]
    receipt = instrument_context(payload)
    assert receipt["status"] == "ABSTAIN"
    assert "required metric absent: coherence" in receipt["missingness"]
    assert receipt["recommendation"] == "collect-or-repair-context-before-translation"


def test_derived_measurement_without_transformation_forces_abstention():
    payload = complete_payload()
    payload["measurements"][0]["transformation_history"] = []
    receipt = instrument_context(payload)
    assert receipt["status"] == "ABSTAIN"
    assert any(
        "derived value lacks transformation history" in item["missingness"]
        for item in receipt["measurements"]
    )


def test_benign_latency_does_not_promote_suppression_or_surveillance():
    payload = complete_payload()
    payload["conditions"] = [{"kind": "latency", "detail": "450 ms response"}]
    receipt = instrument_context(payload)
    assert receipt["status"] == "OPEN"
    assert receipt["benign_controls"][0]["kind"] == "LATENCY"
    assert "network, queue, compute, or rendering latency" in receipt["alternatives"]
    assert "external surveillance" in receipt["cannot_establish"]
    assert "algorithmic suppression" in receipt["cannot_establish"]
    assert "suppression" not in receipt["decision"]


@pytest.mark.parametrize(
    "payload",
    [
        {"artifact_digest": "sha256:abc"},
        {"nested": {"contentHash": "sha256:def"}},
        {"artifactReference": "ash-route-123"},
        {"rawBytes": "AAAA"},
    ],
)
def test_artifact_material_is_rejected(payload):
    with pytest.raises(ValueError, match="artifact-blind|artifact reference"):
        instrument_context(payload)


def test_legacy_metrics_are_normalized_without_observed_promotion():
    receipt = instrument_context(
        {
            "metrics": {"omissionPressure": 0.2, "coherence": 0.75, "divergence": 0.3},
            "source_status": "DERIVED",
            "sensor_id": "derived-formula",
            "transformation_history": ["legacy metric map -> Phase III measurement list"],
        }
    )
    assert receipt["status"] == "OPEN"
    assert len(receipt["measurements"]) == 3
    assert all(item["source_status"] == "DERIVED" for item in receipt["measurements"])


def test_registry_has_exact_high_risk_sensor_postures():
    assert SENSOR_REGISTRY["simulated-fixture"]["allowed_source_statuses"] == ["SIMULATED"]
    assert SENSOR_REGISTRY["derived-formula"]["allowed_source_statuses"] == ["DERIVED"]
    assert SENSOR_REGISTRY["unknown"]["allowed_source_statuses"] == ["UNRESOLVED"]
