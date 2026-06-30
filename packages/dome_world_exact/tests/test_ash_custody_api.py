from __future__ import annotations

import importlib.util
from copy import deepcopy
from pathlib import Path

import pytest


API_PATH = Path(__file__).resolve().parents[3] / "api" / "dome-world-engine.py"
SPEC = importlib.util.spec_from_file_location("dome_world_engine_api_ash", API_PATH)
API = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(API)


def envelope(operation, payload):
    return {
        "operation": operation,
        "traceId": "ash-test-trace",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": payload,
    }


def dispatch(operation, payload):
    return API.dispatch_post(envelope(operation, payload), {})


def base_manifest_payload():
    return {
        "sourceEnvironment": "local_file",
        "sourceLocator": {
            "label": "Synthetic local custody memo",
            "path_or_ref": "local path withheld",
        },
        "artifactMetadata": {
            "mediaType": "text/plain",
            "byteLength": 613,
            "contentHash": "sha256:synthetic-local-613",
            "hashScope": "local-browser",
        },
        "credentialReference": {
            "credentialType": "local-possession",
        },
        "privacyBoundary": {
            "public_weather_only": True,
        },
        "ashPosture": {
            "roomRoute": "private-sense-only",
            "recommendedTending": ["private-hold", "ash-receipt"],
        },
    }


def registered_receipt(payload=None):
    response = dispatch("ash-custody-register", payload or base_manifest_payload())
    assert response["ok"] is True
    return response["result"]


def test_ash_custody_register_returns_metadata_only_receipt():
    response = dispatch("ash-custody-register", base_manifest_payload())

    assert response["ok"] is True
    receipt = response["result"]
    assert receipt["schema"] == "td613.ash.custody-receipt/v0.5"
    assert receipt["manifest"]["schema"] == "td613.ash.custody-manifest/v0.5"
    assert receipt["public_surface"]["content_exported"] is False
    assert receipt["public_surface"]["text_preview"] is None
    assert receipt["public_surface"]["quantized_weather_only"] is True
    assert receipt["export_boundary"]["raw_content_allowed"] is False
    assert receipt["export_boundary"]["summary_before_custody"] is False
    assert receipt["export_boundary"]["arrival_as_consent"] is False
    assert receipt["anti_extraction_defaults"]["local_hold"] is True
    assert receipt["anti_extraction_defaults"]["no_content_export"] is True
    assert receipt["anti_extraction_defaults"]["public_weather_only"] is True
    assert receipt["anti_extraction_defaults"]["receipt_not_proof"] is True
    assert receipt["anti_extraction_defaults"]["beauty_not_verification"] is True
    assert receipt["claimCeiling"] == "ash-custody-receipt-not-content-custody-or-permission-proof"


@pytest.mark.parametrize("raw_key", ["text", "rawText", "content", "document"])
def test_ash_custody_register_rejects_raw_content_keys(raw_key):
    payload = base_manifest_payload()
    payload[raw_key] = "private raw content must not cross Ash custody registration"

    with pytest.raises(ValueError, match="raw content fields are prohibited"):
        dispatch("ash-custody-register", payload)


def test_ash_custody_replay_never_rehydrates_raw_content():
    receipt = registered_receipt()
    response = dispatch("ash-custody-replay", {"receipt": receipt})

    assert response["ok"] is True
    replay = response["result"]
    assert replay["schema"] == "td613.ash.custody-replay/v0.5"
    assert replay["raw_replay_available"] is False
    assert replay["decision"] == "replayed-custody-state-without-rehydrating-raw-content"
    assert replay["claimCeiling"] == "ash-custody-replay-not-fresh-execution-or-content-access"


def test_phason_custody_diff_detects_content_invariant_projection_change():
    previous = registered_receipt()
    changed_payload = deepcopy(base_manifest_payload())
    changed_payload["sourceLocator"]["path_or_ref"] = "repo reference shifted"
    changed_payload["credentialReference"]["credentialType"] = "repo-commit-reference"
    changed_payload["privacyBoundary"]["public_weather_only"] = False
    changed_payload["ashPosture"]["roomRoute"] = "safe-harbor-buffer"
    changed_payload["artifactMetadata"]["contentHash"] = previous["manifest"]["artifact_metadata"]["content_hash"]
    current = registered_receipt(changed_payload)

    response = dispatch("phason-custody-diff", {"previousReceipt": previous, "currentReceipt": current})

    assert response["ok"] is True
    diff = response["result"]
    assert diff["schema"] == "td613.phason.custody-diff/v0.5"
    assert diff["content_invariant"] is True
    assert diff["projection_changed"] is True
    assert diff["status"] == "SEAM_DETECTED"
    assert diff["claimCeiling"] == "phason-custody-diff-not-external-enforcement-or-permission-proof"


def test_receipt_index_compacts_without_claiming_custody_ownership():
    receipt = registered_receipt()
    response = dispatch("receipt-index", {"receipts": [receipt]})

    assert response["ok"] is True
    index = response["result"]
    assert index["schema"] == "td613.dome.receipt-index/v0.5"
    assert index["decision"] == "indexed-cross-station-receipts-without-taking-custody"
    assert index["claimCeiling"] == "receipt-index-not-custody-owner-or-universal-authority"
    assert index["receipts"][0]["export"] == "compact-reference-only"
    assert "custody_owner" not in index
    assert all("owner" not in row for row in index["receipts"])
