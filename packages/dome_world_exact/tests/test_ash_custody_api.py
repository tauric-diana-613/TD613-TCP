from __future__ import annotations

import importlib.util
from copy import deepcopy
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[3]
ENGINE_PATH = ROOT / "api" / "dome-world-engine.py"
COMMITMENT_PATH = ROOT / "api" / "ash-local-commitment.py"


def load(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


ENGINE = load(ENGINE_PATH, "dome_world_engine_api_ash")
COMMITMENT = load(COMMITMENT_PATH, "ash_local_commitment_api_for_engine_tests")


def envelope(operation, payload):
    return {
        "operation": operation,
        "traceId": "ash-test-trace",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": payload,
    }


def l1_payload():
    digest = "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    return {
        "sourceEnvironment": "local_file",
        "sourceLocator": {"label": "Synthetic local custody memo", "path_or_ref": "local path withheld"},
        "artifactMetadata": {
            "mediaType": "text/plain",
            "byteLength": 3,
            "artifactDigest": digest,
            "contentHash": digest,
            "assuranceClass": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
            "localCommitment": {
                "schema": "td613.ash.local-commitment/v0.7",
                "assurance_class": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
                "digest_algorithm": "SHA-256",
                "artifact_digest": digest,
                "byte_length": 3,
                "media_type": "text/plain",
                "last_modified_claim": 613,
                "hash_input": "exact-file-picker-bytes",
                "hash_execution": "browser-local",
                "network_operation_performed_by_module": False,
                "raw_bytes_transmitted": False,
                "raw_bytes_returned": False,
                "raw_bytes_persisted_by_module": False,
                "best_effort_buffer_overwrite": True,
                "memory_erasure_guaranteed": False,
            },
        },
        "credentialReference": {"credentialType": "local-possession"},
        "privacyBoundary": {"public_weather_only": True},
        "ashPosture": {"roomRoute": "private-sense-only", "recommendedTending": ["private-hold", "ash-receipt"]},
    }


def registered_receipt(payload=None):
    response = COMMITMENT.dispatch_post(envelope("ash-custody-register", payload or l1_payload()), {})
    assert response["ok"] is True
    return response["result"]


def test_legacy_engine_cannot_bypass_v08_custody_operations():
    delegated = {
        "ash-custody-register",
        "ash-custody-replay",
        "ash-custody-migrate",
    }
    assert delegated.isdisjoint(ENGINE.POST_OPERATIONS)
    for operation in delegated:
        with pytest.raises(ValueError, match="owned exclusively"):
            ENGINE.dispatch_post(envelope(operation, {}), {})

    readiness = ENGINE.readiness_receipt()
    assert delegated.isdisjoint(readiness["operations"])
    assert set(readiness["delegatedOperations"]["ash-local-commitment-v0.8"]) == delegated


def test_v08_registration_and_replay_use_commitment_endpoint():
    receipt = registered_receipt()
    assert receipt["schema"] == "td613.ash.custody-receipt/v0.8"
    assert receipt["manifest"]["schema"] == "td613.ash.custody-manifest/v0.8"
    assert receipt["public_surface"]["content_exported"] is False
    assert receipt["export_boundary"]["raw_content_allowed"] is False
    assert receipt["anti_extraction_defaults"]["receipt_not_proof"] is True
    assert "claimCeiling" not in receipt

    replay = COMMITMENT.dispatch_post(envelope("ash-custody-replay", {"receipt": receipt}), {})["result"]
    assert replay["schema"] == "td613.ash.custody-replay/v0.8"
    assert replay["raw_replay_available"] is False
    assert replay["artifact_digest"] == receipt["manifest"]["artifact_metadata"]["artifact_digest"]


@pytest.mark.parametrize("raw_key", ["text", "rawText", "content", "document"])
def test_v08_registration_rejects_raw_content_keys(raw_key):
    payload = l1_payload()
    payload[raw_key] = "private raw content must not cross Ash custody registration"
    with pytest.raises(ValueError, match="raw content fields are prohibited"):
        COMMITMENT.dispatch_post(envelope("ash-custody-register", payload), {})


def test_cinder_plaintext_aliases_are_rejected_by_legacy_engine_until_phase6():
    for key in ("fragment", "candidateFragment"):
        with pytest.raises(ValueError, match="raw content fields are prohibited"):
            ENGINE.dispatch_post(
                envelope(
                    "ash-cinder",
                    {
                        "receipt": {"receipt_id": "ashc_test"},
                        key: "plaintext fragment",
                        "operatorApproved": True,
                    },
                ),
                {},
            )


def test_phason_diff_accepts_v08_digest_and_detects_projection_change():
    previous = registered_receipt()
    changed = deepcopy(l1_payload())
    changed["sourceLocator"]["path_or_ref"] = "repo reference shifted"
    changed["credentialReference"]["credentialType"] = "repo-commit-reference"
    changed["privacyBoundary"]["public_weather_only"] = False
    changed["ashPosture"]["roomRoute"] = "safe-harbor-buffer"
    current = registered_receipt(changed)

    response = ENGINE.dispatch_post(
        envelope("phason-custody-diff", {"previousReceipt": previous, "currentReceipt": current}),
        {},
    )
    diff = response["result"]
    assert diff["schema"] == "td613.phason.custody-diff/v0.5"
    assert diff["content_invariant"] is True
    assert diff["projection_changed"] is True
    assert diff["status"] == "SEAM_DETECTED"


def test_receipt_index_keeps_v07_receipt_as_reference_not_custody_owner():
    receipt = registered_receipt()
    response = ENGINE.dispatch_post(envelope("receipt-index", {"receipts": [receipt]}), {})
    index = response["result"]
    assert index["schema"] == "td613.dome.receipt-index/v0.5"
    assert index["decision"] == "indexed-cross-station-receipts-without-taking-custody"
    assert index["receipts"][0]["export"] == "compact-reference-only"
    assert "custody_owner" not in index
    assert all("owner" not in row for row in index["receipts"])
