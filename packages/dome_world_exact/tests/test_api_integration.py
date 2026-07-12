from __future__ import annotations

import importlib.util
from copy import deepcopy
from pathlib import Path

import pytest


API_PATH = Path(__file__).resolve().parents[3] / "api" / "ash-local-commitment.py"
SPEC = importlib.util.spec_from_file_location("ash_local_commitment_api", API_PATH)
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


def l1_payload():
    digest = "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    return {
        "sourceEnvironment": "local_file",
        "sourceLocator": {"label": "abc fixture", "path_or_ref": "local path withheld"},
        "artifactMetadata": {
            "mediaType": "text/plain",
            "byteLength": 3,
            "lastModified": 613,
            "artifactDigest": digest,
            "contentHash": digest,
            "hashScope": "local-browser",
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
        "ashPosture": {"roomRoute": "private-sense-only"},
    }


def test_only_phase1_custody_operations_are_exposed():
    assert API.SUPPORTED_OPERATIONS == {"ash-custody-register", "ash-custody-replay"}
    with pytest.raises(ValueError, match="unsupported"):
        API.dispatch_post(envelope("aperture-bridge", {}), {})


def test_ash_rejects_raw_content_fields():
    with pytest.raises(ValueError, match="metadata/manifests only"):
        API.dispatch_post(envelope("ash-custody-register", {"rawText": "private"}), {})


def test_readiness_reports_phase1_commitment_boundary_without_new_claim_ceiling():
    receipt = API.readiness_receipt()
    assert receipt["schema"] == "td613.ash.local-commitment-readiness/v0.7"
    assert receipt["status"] == "phase-1-active"
    assert receipt["rawBytesAcceptedByServer"] is False
    assert receipt["metadataDigestFallback"] is False
    assert receipt["boundaryVocabularyPolicy"] == "no-new-mechanism-legacy-frozen"
    assert receipt["assuranceClasses"] == [
        "L0_METADATA_ONLY",
        "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
    ]


def test_l1_local_commitment_registers_exact_digest_without_raw_bytes():
    response = API.dispatch_post(envelope("ash-custody-register", l1_payload()), {})
    receipt = response["result"]
    metadata = receipt["manifest"]["artifact_metadata"]

    assert receipt["schema"] == "td613.ash.custody-receipt/v0.7"
    assert receipt["assurance_class"] == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    assert receipt["artifact_digest_present"] is True
    assert receipt["decision"] == "artifact-registered-with-browser-local-byte-commitment"
    assert metadata["artifact_digest"].endswith("f20015ad")
    assert metadata["content_hash"] == metadata["artifact_digest"]
    assert receipt["manifest"]["privacy_boundary"]["raw_content_received_by_server"] is False
    assert "rawBytes" not in str(receipt)
    assert "claimCeiling" not in receipt
    assert "claim_ceiling" not in receipt["manifest"]["ash_posture"]
    assert "trusted-time" in receipt["does_not_establish"]


def test_l0_registration_never_synthesizes_metadata_digest():
    payload = l1_payload()
    payload["artifactMetadata"] = {
        "mediaType": "text/plain",
        "byteLength": 3,
        "assuranceClass": "L0_METADATA_ONLY",
        "artifactDigest": None,
        "contentHash": None,
        "hashScope": "unavailable",
        "localCommitment": None,
    }
    receipt = API.dispatch_post(envelope("ash-custody-register", payload), {})["result"]
    metadata = receipt["manifest"]["artifact_metadata"]

    assert receipt["assurance_class"] == "L0_METADATA_ONLY"
    assert receipt["artifact_digest_present"] is False
    assert metadata["artifact_digest"] is None
    assert metadata["content_hash"] is None
    assert metadata["digest_algorithm"] is None
    assert receipt["manifest"]["artifact_id_basis"] == "metadata-route-derived"


def test_l1_rejects_digest_mismatch_and_false_boundary_assertions():
    payload = l1_payload()
    payload["artifactMetadata"]["localCommitment"]["artifact_digest"] = "sha256:" + "0" * 64
    with pytest.raises(ValueError, match="conflict|does not match"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})

    for key, expected in [
        ("network_operation_performed_by_module", False),
        ("raw_bytes_transmitted", False),
        ("raw_bytes_returned", False),
        ("raw_bytes_persisted_by_module", False),
        ("memory_erasure_guaranteed", False),
    ]:
        payload = l1_payload()
        payload["artifactMetadata"]["localCommitment"][key] = not expected
        with pytest.raises(ValueError):
            API.dispatch_post(envelope("ash-custody-register", payload), {})


def test_conflicting_aliases_and_uppercase_digest_are_rejected():
    payload = l1_payload()
    payload["artifactMetadata"]["contentHash"] = "sha256:" + "0" * 64
    with pytest.raises(ValueError, match="declarations conflict"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})

    payload = l1_payload()
    upper = payload["artifactMetadata"]["artifactDigest"].upper()
    payload["artifactMetadata"]["artifactDigest"] = upper
    payload["artifactMetadata"]["contentHash"] = upper
    payload["artifactMetadata"]["localCommitment"]["artifact_digest"] = upper
    with pytest.raises(ValueError, match="lowercase"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})


def test_l0_rejects_manual_digest_promotion_and_local_commitment():
    payload = l1_payload()
    payload["artifactMetadata"]["assuranceClass"] = "L0_METADATA_ONLY"
    payload["artifactMetadata"]["localCommitment"] = None
    with pytest.raises(ValueError, match="may not carry an artifact digest"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})

    payload = l1_payload()
    payload["artifactMetadata"]["assuranceClass"] = "L0_METADATA_ONLY"
    payload["artifactMetadata"]["artifactDigest"] = None
    payload["artifactMetadata"]["contentHash"] = None
    with pytest.raises(ValueError, match="may not carry a local commitment"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})


def test_replay_preserves_v07_digest_without_rehydrating_content():
    receipt = API.dispatch_post(envelope("ash-custody-register", l1_payload()), {})["result"]
    replay = API.dispatch_post(envelope("ash-custody-replay", {"receipt": receipt}), {})["result"]
    assert replay["artifact_digest"] == receipt["manifest"]["artifact_metadata"]["artifact_digest"]
    assert replay["assurance_class"] == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    assert replay["raw_replay_available"] is False
    assert replay["replay_mode"] == "custody-replay-without-content"
    assert "claimCeiling" not in replay


def test_legacy_replay_does_not_promote_metadata_hash_to_v07_digest():
    legacy = {
        "schema": "td613.ash.custody-manifest/v0.5",
        "artifact_id": "legacy",
        "artifact_metadata": {
            "content_hash": "sha256:" + "a" * 64,
            "hash_scope": "metadata-or-local-browser",
        },
        "ash_posture": {"room_route": "private-sense-only"},
        "privacy_boundary": {"server_custody": False},
    }
    replay = API.dispatch_post(envelope("ash-custody-replay", {"manifest": legacy}), {})["result"]
    assert replay["assurance_class"] == "LEGACY_UNVERIFIED_RECEIPT"
    assert replay["artifact_digest"] is None
    assert replay["raw_replay_available"] is False
