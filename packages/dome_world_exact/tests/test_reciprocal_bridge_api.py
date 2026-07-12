from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
API_PATH = ROOT / "api" / "dome-world-engine.py"
SPEC = importlib.util.spec_from_file_location("dome_world_reciprocal_api", API_PATH)
API = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(API)


def test_bridge_returns_auditable_flowcore_context_receipt():
    envelope = {
        "operation": "aperture-bridge",
        "traceId": "round-trip-test",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": {
            "metrics": {
                "omissionPressure": 0.2,
                "coherence": 0.75,
                "divergence": 0.3,
                "namingSensitivity": 0.4,
                "rupturePressure": 0.1,
            },
            "diagnosticReceipt": {"receipt_id": "apdiag_fixture"},
        },
    }

    result = API.dispatch_post(envelope, {})["result"]

    assert result["schema"] == "td613.flowcore.context-receipt/vNext"
    assert result["source_status"] == "DERIVED"
    assert result["sensor_id"] == "derived-formula"
    assert result["authority_class"] == "A2_DERIVATIONAL"
    assert result["artifact_reference"] is None
    assert result["diagnostic_receipt_reference"] == "apdiag_fixture"
    assert result["modeled_weather"]["modeled"] is True
    assert result["weather"] == result["modeled_weather"]
    assert result["transformation_history"]
    assert result["missingness"]
    assert result["uncertainty"]["class"] == "model-and-input-bounded"
    assert result["recommendation_not_command"] is True
    assert result["decision"] == "context-receipt-returned-for-aperture-audit"
    assert result["claimCeiling"] == (
        "reciprocal-receipt-not-reciprocal-authority-or-aperture-execution"
    )


def test_bridge_readiness_declares_reciprocal_receipt_posture():
    aperture = API.readiness_receipt()["aperture"]

    assert aperture["bridge"] == (
        "td613.aperture.reciprocal-receipt-bridge/v3.0-alpha"
    )
    assert aperture["diagnosticReceiptSchema"] == (
        "td613.aperture.diagnostic-receipt/v3.0-alpha"
    )
    assert aperture["contextReceiptSchema"] == "td613.flowcore.context-receipt/vNext"
    assert aperture["roundTripReceiptSchema"] == (
        "td613.aperture.round-trip-receipt/v3.0-alpha"
    )
    assert aperture["bridgePosture"] == (
        "reciprocal_receipts_without_reciprocal_authority"
    )
