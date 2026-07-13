from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
API_PATH = ROOT / "api" / "dome-world-engine-guard.py"
SPEC = importlib.util.spec_from_file_location("dome_world_reciprocal_api", API_PATH)
API = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(API)


def diagnostic():
    return {
        "schema": "td613.aperture.diagnostic-receipt/v3.0-alpha",
        "receipt_id": "apdiag_0123456789abcdef0123",
        "instrument": "TD613 Aperture",
        "version": "v3.0-alpha",
        "firmwareSchema": "td613-aperture/v3.0-alpha",
        "posture": "recommendation-not-command",
        "taskIntent": {
            "primary_route": "REQUESTED_SYNTHESIS",
            "runtime_materiality": "BACKGROUND",
            "automatic_redirect": False,
        },
        "source": {"status": "DERIVED"},
        "runtime": {"materiality": "BACKGROUND"},
        "produced": {
            "context_request": {
                "metrics": {
                    "omissionPressure": 0.2,
                    "coherence": 0.75,
                    "divergence": 0.3,
                    "namingSensitivity": 0.4,
                    "rupturePressure": 0.1,
                }
            }
        },
    }


def test_bridge_returns_auditable_flowcore_v01_context_receipt():
    envelope = {
        "operation": "aperture-bridge",
        "traceId": "round-trip-test",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": {"diagnosticReceipt": diagnostic()},
    }

    response = API.dispatch_guarded_post(envelope)
    result = response["result"]

    assert response["operation"] == "aperture-bridge-contextualize"
    assert result["schema"] == "td613.flowcore.context-receipt/v0.1"
    assert result["source_status"] == "DERIVED"
    assert result["sensor_id"] == "flowcore-context-instrument"
    assert result["authority_class"] == "A2_DERIVATIONAL"
    assert result["artifact_reference"] is None
    assert result["artifact_blind"] is True
    assert result["diagnostic_receipt_reference"] == "apdiag_0123456789abcdef0123"
    assert result["modeled_weather"]["modeled"] is True
    assert result["weather"] == result["modeled_weather"]
    assert result["transformation_history"]
    assert result["missingness"] == []
    assert result["uncertainty"]["class"] == "measurement-and-transformation-bounded"
    assert result["recommendation_not_command"] is True
    assert result["automatic_ash_action"] is False
    assert result["prediction_authorized"] is False
    assert result["reciprocal_authority"] is False
    assert result["bridge_integration_status"] == "PHASE_4_ACTIVE"
    assert result["bridge_contract"] == "td613.phase4.reciprocal-bridge/v0.1"


def test_bridge_readiness_declares_v01_reciprocal_receipt_posture():
    readiness = API.phase4_readiness_receipt()
    assert readiness["status"] == "phase-4-active"
    assert readiness["bridgeContract"] == "td613.phase4.reciprocal-bridge/v0.1"
    assert readiness["diagnosticReceiptSchema"] == (
        "td613.aperture.diagnostic-receipt/v3.0-alpha"
    )
    assert readiness["contextReceiptSchema"] == "td613.flowcore.context-receipt/v0.1"
    assert readiness["roundTripReceiptSchema"] == (
        "td613.aperture.round-trip-receipt/v3.0-alpha"
    )
    assert readiness["reciprocalReceipts"] is True
    assert readiness["reciprocalAuthority"] is False
    assert readiness["automaticAshAction"] is False
    assert readiness["predictionAuthorized"] is False
    assert readiness["operatorClosureRequired"] is True
