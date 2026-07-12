from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

from packages.dome_world_exact.reciprocal_bridge import (
    BRIDGE_CONTRACT_SCHEMA,
    CONTEXT_RECEIPT_SCHEMA,
    LEGACY_MIGRATION_SCHEMA,
    contextualize_diagnostic,
    migrate_vnext_receipt,
    readiness_receipt,
    validate_diagnostic_receipt,
)

ROOT = Path(__file__).resolve().parents[3]
GUARD_PATH = ROOT / "api" / "dome-world-engine-guard.py"
SPEC = importlib.util.spec_from_file_location("td613_phase4_guard", GUARD_PATH)
GUARD = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(GUARD)


def diagnostic(metrics=None, route="REQUESTED_SYNTHESIS"):
    return {
        "schema": "td613.aperture.diagnostic-receipt/v3.0-alpha",
        "receipt_id": "apdiag_0123456789abcdef0123",
        "instrument": "TD613 Aperture",
        "version": "v3.0-alpha",
        "firmwareSchema": "td613-aperture/v3.0-alpha",
        "posture": "recommendation-not-command",
        "taskIntent": {
            "primary_route": route,
            "runtime_materiality": "BACKGROUND",
            "automatic_redirect": False,
        },
        "source": {"status": "DERIVED"},
        "runtime": {"materiality": "BACKGROUND"},
        "produced": {
            "context_request": {
                "metrics": metrics
                if metrics is not None
                else {
                    "omissionPressure": 0.2,
                    "coherence": 0.75,
                    "divergence": 0.3,
                    "namingSensitivity": 0.4,
                    "rupturePressure": 0.1,
                }
            }
        },
    }


def test_valid_diagnostic_returns_phase4_active_v01_context():
    result = contextualize_diagnostic(diagnostic(), {"observedRegime": "PRCS-A"})
    assert result["schema"] == CONTEXT_RECEIPT_SCHEMA
    assert result["status"] == "OPEN"
    assert result["context_posture"] == "CONTEXT_READY"
    assert result["bridge_integration_status"] == "PHASE_4_ACTIVE"
    assert result["bridge_contract"] == BRIDGE_CONTRACT_SCHEMA
    assert result["diagnostic_receipt_reference"] == "apdiag_0123456789abcdef0123"
    assert result["artifact_reference"] is None
    assert result["artifact_blind"] is True
    assert result["reciprocal_authority"] is False
    assert result["automatic_ash_action"] is False
    assert result["prediction_authorized"] is False
    assert {item["sensor_id"] for item in result["measurements"]} == {
        "aperture-diagnostic-receipt"
    }


def test_missing_required_metric_preserves_abstention_without_default():
    metrics = {"omissionPressure": 0.2, "divergence": 0.3}
    result = contextualize_diagnostic(diagnostic(metrics))
    assert result["status"] == "ABSTAIN"
    assert result["context_posture"] == "ABSTAIN_INSUFFICIENT_CONTEXT"
    assert result["modeled_weather"] is None
    assert result["weather"] is None
    assert "required metric absent: coherence" in result["missingness"]


def test_out_of_range_metric_is_not_clamped():
    metrics = {"omissionPressure": 0.2, "coherence": 0.75, "divergence": 1.2}
    result = contextualize_diagnostic(diagnostic(metrics))
    assert result["status"] == "ABSTAIN"
    divergence = next(item for item in result["measurements"] if item["name"] == "divergence")
    assert divergence["value"] is None
    assert "weather metric outside [0,1]" in divergence["missingness"]


def test_artifact_and_authority_injection_are_rejected():
    with pytest.raises(ValueError, match="artifact-blind"):
        validate_diagnostic_receipt({**diagnostic(), "artifact_digest": "sha256:no"})
    with pytest.raises(ValueError, match="execution or authority"):
        validate_diagnostic_receipt({**diagnostic(), "automatic_ash_action": True})


def test_guard_routes_legacy_alias_to_phase4_module():
    envelope = {
        "operation": "aperture-bridge",
        "traceId": "phase4-test",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": {"diagnosticReceipt": diagnostic()},
    }
    response = GUARD.dispatch_guarded_post(envelope)
    assert response["ok"] is True
    assert response["operation"] == "aperture-bridge-contextualize"
    assert response["result"]["schema"] == CONTEXT_RECEIPT_SCHEMA
    assert response["result"]["bridge_integration_status"] == "PHASE_4_ACTIVE"


def test_vnext_migration_remains_explicitly_non_native():
    migrated = migrate_vnext_receipt(
        {
            "schema": "td613.flowcore.context-receipt/vNext",
            "source_status": "DERIVED",
            "artifact_reference": None,
            "diagnostic_receipt_reference": "apdiag_legacy",
        }
    )
    assert migrated["schema"] == LEGACY_MIGRATION_SCHEMA
    assert migrated["native_v01"] is False
    assert migrated["migration_status"] == "LEGACY_PROVISIONAL_NORMALIZED"
    assert migrated["bridge_integration_status"] == "LEGACY_PHASE_4_MIGRATION"


def test_phase4_readiness_preserves_hard_boundaries():
    receipt = readiness_receipt()
    assert receipt["contextReceiptSchema"] == CONTEXT_RECEIPT_SCHEMA
    assert receipt["reciprocalAuthority"] is False
    assert receipt["artifactRelation"] is False
    assert receipt["automaticAshAction"] is False
    assert receipt["predictionAuthorized"] is False
    assert receipt["newServerlessFunction"] if "newServerlessFunction" in receipt else True
