from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
API_PATH = ROOT / "api" / "dome-world-engine-guard.py"
SPEC = importlib.util.spec_from_file_location("td613_flowcore_shared_guard", API_PATH)
API = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(API)


def envelope(payload, operation="flowcore-context-instrument"):
    return {
        "operation": operation,
        "traceId": "phase3-api-test",
        "apertureContext": {
            "version": "v3.0-alpha",
            "schema": "td613-aperture/v3.0-alpha",
            "observedRegime": "PRCS-A",
        },
        "payload": payload,
    }


def complete_payload():
    return {
        "diagnosticReceipt": {"receipt_id": "apdiag_api_fixture"},
        "measurements": [
            {"name": "omissionPressure", "value": 0.2, "sensor_id": "derived-formula", "source_status": "DERIVED", "transformation_history": ["fixture -> metric"]},
            {"name": "coherence", "value": 0.75, "sensor_id": "derived-formula", "source_status": "DERIVED", "transformation_history": ["fixture -> metric"]},
            {"name": "divergence", "value": 0.3, "sensor_id": "derived-formula", "source_status": "DERIVED", "transformation_history": ["fixture -> metric"]},
        ],
    }


def test_api_dispatch_returns_phase3_receipt():
    response = API.dispatch_guarded_post(envelope(complete_payload()))
    assert response["ok"] is True
    assert response["traceId"] == "phase3-api-test"
    assert response["result"]["schema"] == "td613.flowcore.context-receipt/v0.1"
    assert response["result"]["status"] == "OPEN"
    assert response["result"]["diagnostic_receipt_reference"] == "apdiag_api_fixture"
    assert response["result"]["artifact_reference"] is None
    assert response["result"]["bridge_integration_status"] == "PHASE_4_DEFERRED"


def test_api_rejects_unknown_operation():
    with pytest.raises(ValueError, match="unsupported"):
        API.dispatch_guarded_post(envelope({}, operation="not-a-real-operation"))


def test_api_rejects_artifact_digest():
    payload = complete_payload()
    payload["artifact_digest"] = "sha256:not-allowed"
    with pytest.raises(ValueError, match="artifact-blind"):
        API.dispatch_guarded_post(envelope(payload))


def test_api_rejects_artifact_material_anywhere_in_envelope():
    request = envelope(complete_payload())
    request["apertureContext"]["artifact_digest"] = "sha256:not-allowed"
    with pytest.raises(ValueError, match="envelope.apertureContext.artifact_digest"):
        API.dispatch_guarded_post(request)


def test_api_readiness_exposes_no_ash_or_prediction_authority():
    receipt = API.flowcore_readiness_receipt()
    assert receipt["status"] == "phase-3-active"
    assert receipt["automaticAshAction"] is False
    assert receipt["predictionAuthorized"] is False
    assert receipt["bridgeIntegrationStatus"] == "PHASE_4_DEFERRED"


def test_shared_guard_keeps_unrelated_dome_operations_available():
    response = API.dispatch_guarded_post(
        envelope({"contentHash": "", "projection": {}}, operation="phason-gate")
    )
    assert response["ok"] is True
    assert response["operation"] == "phason-gate"
