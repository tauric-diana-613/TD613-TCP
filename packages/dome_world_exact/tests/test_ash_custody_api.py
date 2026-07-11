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

VALID_DIGEST = "sha256:" + ("a" * 64)


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
            "artifactDigest": VALID_DIGEST,
            "commitmentAssurance": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
            "hashScope": "local-browser",
            "localCommitment": {
                "schema": "td613.ash.local-commitment/v0.7",
                "assurance_class": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
                "digest_algorithm": "SHA-256",
                "artifact_digest": VALID_DIGEST,
                "byte_length": 613,
                "media_type": "text/plain",
                "last_modified_claim": 613,
                "hash_input": "exact-file-picker-bytes",
                "hash_execution": "browser-local",
                "execution_attestation": "client-generated-not-independently-attested",
                "network_operation_performed_by_module": False,
                "raw_bytes_returned": False,
                "raw_bytes_persisted_by_module": False,
                "best_effort_buffer_overwrite": True,
                "memory_erasure_guaranteed": False,
            },
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


def l0_manifest_payload():
    payload = base_manifest_payload()
    payload["artifactMetadata"] = {
        "mediaType": "text/plain",
        "byteLength": 613,
        "artifactDigest": None,
        "commitmentAssurance": "L0_METADATA_ONLY",
        "hashScope": "unavailable",
        "localCommitment": None,
    }
    return payload


def registered_receipt(payload=None):
    response = dispatch("ash-custody-register", payload or base_manifest_payload())
    assert response["ok"] is True
    return response["result"]


def test_ash_custody_register_returns_l1_metadata_only_receipt():
    response = dispatch("ash-custody-register", base_manifest_payload())

    assert response["ok"] is True
    receipt = response["result"]
    metadata = receipt["manifest"]["artifact_metadata"]

    assert receipt["schema"] == "td613.ash.custody-receipt/v0.5"
    assert receipt["manifest"]["schema"] == "td613.ash.custody-manifest/v0.5"
    assert receipt["assurance_class"] == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    assert metadata["artifact_digest"] == VALID_DIGEST
    assert metadata["content_hash"] == VALID_DIGEST
    assert metadata["commitment_assurance"] == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    assert metadata["hash_scope"] == "local-browser"
    assert metadata["local_commitment"]["raw_bytes_returned"] is False
    assert metadata["local_commitment"]["raw_bytes_persisted_by_module"] is False
    assert metadata["local_commitment"]["memory_erasure_guaranteed"] is False
    assert receipt["decision"] == "artifact-registered-with-browser-local-byte-commitment"

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


def test_l0_registration_never_manufactures_an_artifact_digest():
    receipt = registered_receipt(l0_manifest_payload())
    metadata = receipt["manifest"]["artifact_metadata"]

    assert receipt["assurance_class"] == "L0_METADATA_ONLY"
    assert metadata["artifact_digest"] is None
    assert metadata["content_hash"] is None
    assert metadata["local_commitment"] is None
    assert metadata["hash_scope"] == "unavailable"
    assert receipt["decision"] == "artifact-registered-as-metadata-only-custody-event"


@pytest.mark.parametrize(
    "digest",
    [
        "sha256:manual-placeholder",
        "sha256:synthetic-local-613",
        "sha256:" + ("A" * 64),
        "md5:" + ("a" * 32),
        "sha256:" + ("a" * 63),
    ],
)
def test_l1_registration_rejects_malformed_artifact_digest(digest):
    payload = base_manifest_payload()
    payload["artifactMetadata"]["artifactDigest"] = digest
    payload["artifactMetadata"]["localCommitment"]["artifact_digest"] = digest

    with pytest.raises(ValueError, match="L1 artifact digest"):
        dispatch("ash-custody-register", payload)


def test_l1_registration_rejects_local_commitment_digest_mismatch():
    payload = base_manifest_payload()
    payload["artifactMetadata"]["localCommitment"]["artifact_digest"] = (
        "sha256:" + ("b" * 64)
    )

    with pytest.raises(ValueError, match="does not match"):
        dispatch("ash-custody-register", payload)


def test_l1_assurance_requires_digest():
    payload = l0_manifest_payload()
    payload["artifactMetadata"]["commitmentAssurance"] = (
        "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    )

    with pytest.raises(ValueError, match="requires a valid artifact digest"):
        dispatch("ash-custody-register", payload)


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
    assert replay["artifact_digest"] == VALID_DIGEST
    assert replay["commitment_assurance"] == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    assert replay["raw_replay_available"] is False
    assert replay["decision"] == "replayed-custody-state-without-rehydrating-raw-content"
    assert replay["claimCeiling"] == "ash-custody-replay-not-fresh-execution-or-content-access"


def test_phason_custody_diff_detects_content_invariant_projection_change():
    previous = registered_receipt()
    changed_payload = deepcopy(base_manifest_payload())
    changed_payload["sourceLocator"]["path_or_ref"] = "repo reference shifted"
    changed_payload["credentialReference"]["credentialType"] = "repo-access"
    changed_payload["privacyBoundary"]["public_weather_only"] = False
    changed_payload["ashPosture"]["roomRoute"] = "safe-harbor-buffer"
    current = registered_receipt(changed_payload)

    response = dispatch(
        "phason-custody-diff",
        {"previousReceipt": previous, "currentReceipt": current},
    )

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


def test_readiness_declares_no_metadata_digest_fallback():
    readiness = API.readiness_receipt()
    local = readiness["ashLocalCommitment"]

    assert local["schema"] == "td613.ash.local-commitment/v0.7"
    assert local["metadataDigestFallback"] is False
    assert local["rawBytesAccepted"] is False
