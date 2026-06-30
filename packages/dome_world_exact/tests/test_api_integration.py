from __future__ import annotations

import importlib.util
import os
from pathlib import Path

import pytest


API_PATH = Path(__file__).resolve().parents[3] / "api" / "dome-world-engine.py"
SPEC = importlib.util.spec_from_file_location("dome_world_engine_api", API_PATH)
API = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(API)


def envelope(operation, payload):
    return {
        "operation": operation,
        "traceId": "test-trace",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": payload,
    }


def test_modeled_weather_never_claims_exact_capture():
    receipt = API.dispatch_post(
        envelope("aperture-bridge", {
            "metrics": {"omissionPressure": 0.2, "coherence": 0.8, "divergence": 0.4}
        }),
        {},
    )
    assert receipt["result"]["weather"]["modeled"] is True
    assert receipt["result"]["decision"] == "route-weather-modeled-without-exact-gate-entry"


def test_ash_rejects_raw_content_fields():
    with pytest.raises(ValueError, match="metadata only"):
        API.dispatch_post(envelope("ash-readiness", {"rawText": "private"}), {})


def test_trainer_is_dark_without_explicit_environment_gate(monkeypatch):
    monkeypatch.delenv("DOME_WORLD_TRAINER_ENABLED", raising=False)
    with pytest.raises(PermissionError, match="disabled"):
        API.dispatch_post(
            envelope("trainer-step", {"action": "propose", "observations": [[1, 0, 1, 0]]}),
            {},
        )


def test_readiness_reports_client_held_storage(monkeypatch):
    monkeypatch.setenv("DOME_WORLD_TRAINER_ENABLED", "0")
    receipt = API.readiness_receipt()
    assert receipt["storage"] == "client-held-signed-checkpoints"
    assert receipt["aperture"]["operationalState"] == "interface_context"
