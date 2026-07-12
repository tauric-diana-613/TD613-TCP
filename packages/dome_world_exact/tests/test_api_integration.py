from __future__ import annotations

import importlib.util
from copy import deepcopy
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[3]
API_PATH = ROOT / "api" / "ash-local-commitment.py"
SPEC = importlib.util.spec_from_file_location("ash_local_commitment_api", API_PATH)
API = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(API)

DIGEST = "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"


def envelope(operation, payload):
    return {
        "operation": operation,
        "traceId": "test-trace",
        "apertureContext": {"observedRegime": "PRCS-A"},
        "payload": payload,
    }


def l1_payload(label="abc fixture"):
    return {
        "artifactId": "operator-stable-test-id",
        "sourceEnvironment": "local_file",
        "sourceLocator": {"label": label, "path_or_ref": "local path withheld"},
        "artifactMetadata": {
            "mediaType": "text/plain",
            "byteLength": 3,
            "lastModified": 613,
            "artifactDigest": DIGEST,
            "contentHash": DIGEST,
            "hashScope": "local-browser",
            "assuranceClass": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
            "localCommitment": {
                "schema": "td613.ash.local-commitment/v0.7",
                "assurance_class": "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
                "digest_algorithm": "SHA-256",
                "artifact_digest": DIGEST,
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


def l0_payload(label="metadata fixture"):
    payload = l1_payload(label)
    payload["artifactMetadata"] = {
        "mediaType": "text/plain",
        "byteLength": 3,
        "lastModified": 613,
        "assuranceClass": "L0_METADATA_ONLY",
        "artifactDigest": None,
        "contentHash": None,
        "hashScope": "unavailable",
        "localCommitment": None,
    }
    return payload


def register(payload):
    return API.dispatch_post(envelope("ash-custody-register", payload), {})["result"]


def test_phase2_operations_and_readiness():
    assert API.SUPPORTED_OPERATIONS == {
        "ash-custody-register",
        "ash-custody-replay",
        "ash-custody-migrate",
    }
    receipt = API.readiness_receipt()
    assert receipt["schema"] == "td613.ash.canonical-digest-readiness/v0.8"
    assert receipt["status"] == "phase-2-active"
    assert receipt["canonicalJsonProfile"] == "td613.ash.canonical-json/v0.1"
    assert receipt["digestSpine"] == [
        "artifact_digest",
        "manifest_digest",
        "receipt_digest",
    ]
    assert receipt["rawBytesAcceptedByServer"] is False
    assert receipt["metadataDigestFallback"] is False
    assert receipt["universalStableDigestPublishedByDefault"] is False


def test_l1_registration_separates_artifact_manifest_and_receipt_digests():
    receipt = register(l1_payload())
    manifest = receipt["manifest"]
    metadata = manifest["artifact_metadata"]

    assert receipt["schema"] == "td613.ash.custody-receipt/v0.8"
    assert manifest["schema"] == "td613.ash.custody-manifest/v0.8"
    assert metadata["artifact_digest"] == DIGEST
    assert "content_hash" not in metadata
    assert manifest["manifest_digest"] == receipt["manifest_digest"]
    assert receipt["receipt_digest"].startswith("sha256:")
    assert receipt["receipt_id"] == "ashc_" + receipt["receipt_digest"][-20:]
    assert receipt["public_surface"]["artifact_digest_exported"] is False
    assert receipt["public_surface"]["manifest_digest_exported"] is False
    assert receipt["public_surface"]["receipt_digest_exported"] is False
    assert receipt["export_boundary"]["universal_stable_digest_allowed"] is False
    assert "claimCeiling" not in receipt
    assert "trusted-time" in receipt["does_not_establish"]


def test_metadata_change_preserves_artifact_digest_but_changes_manifest_and_receipt():
    first = register(l1_payload("first label"))
    second = register(l1_payload("second label"))

    assert (
        first["manifest"]["artifact_metadata"]["artifact_digest"]
        == second["manifest"]["artifact_metadata"]["artifact_digest"]
    )
    assert first["manifest_digest"] != second["manifest_digest"]
    assert first["receipt_digest"] != second["receipt_digest"]


def test_receipt_envelope_change_changes_receipt_digest_without_changing_manifest_digest():
    receipt = register(l1_payload())
    changed = deepcopy(receipt)
    changed["created_at"] = "2040-01-01T00:00:00Z"
    changed.pop("receipt_digest")
    changed.pop("receipt_id")
    changed["receipt_digest"] = API.compute_receipt_digest(changed)

    assert changed["manifest_digest"] == receipt["manifest_digest"]
    assert changed["receipt_digest"] != receipt["receipt_digest"]


def test_l0_registration_has_manifest_and_receipt_digests_without_artifact_digest():
    receipt = register(l0_payload())
    metadata = receipt["manifest"]["artifact_metadata"]

    assert receipt["assurance_class"] == "L0_METADATA_ONLY"
    assert receipt["artifact_digest_present"] is False
    assert metadata["artifact_digest"] is None
    assert metadata["digest_algorithm"] is None
    assert receipt["manifest_digest"].startswith("sha256:")
    assert receipt["receipt_digest"].startswith("sha256:")
    assert receipt["manifest"]["artifact_id_basis"] == "operator-supplied"


def test_random_artifact_id_never_derives_from_artifact_digest():
    payload = l1_payload()
    payload.pop("artifactId")
    receipt = register(payload)
    assert receipt["manifest"]["artifact_id_basis"] == "receipt-local-random"
    assert DIGEST[-16:] not in receipt["manifest"]["artifact_id"]


def test_l1_boundary_regressions_remain_closed():
    payload = l1_payload()
    payload["artifactMetadata"]["localCommitment"]["artifact_digest"] = "sha256:" + "0" * 64
    with pytest.raises(ValueError, match="conflict|does not match"):
        register(payload)

    for key in [
        "network_operation_performed_by_module",
        "raw_bytes_transmitted",
        "raw_bytes_returned",
        "raw_bytes_persisted_by_module",
        "memory_erasure_guaranteed",
    ]:
        payload = l1_payload()
        payload["artifactMetadata"]["localCommitment"][key] = True
        with pytest.raises(ValueError):
            register(payload)

    with pytest.raises(ValueError, match="metadata/manifests only"):
        register({"rawText": "private"})


def test_v08_replay_verifies_both_canonical_digests():
    receipt = register(l1_payload())
    replay = API.dispatch_post(
        envelope("ash-custody-replay", {"receipt": receipt}),
        {},
    )["result"]
    assert replay["validation_status"] == "V0_8_DIGEST_SPINE_VERIFIED"
    assert replay["artifact_digest"] == DIGEST
    assert replay["manifest_digest"] == receipt["manifest_digest"]
    assert replay["receipt_digest"] == receipt["receipt_digest"]
    assert replay["raw_replay_available"] is False


def test_v08_replay_rejects_tampered_manifest_or_receipt():
    receipt = register(l1_payload())
    tampered_manifest = deepcopy(receipt)
    tampered_manifest["manifest"]["source_locator"]["label"] = "tampered"
    with pytest.raises(ValueError, match="manifest digest"):
        API.dispatch_post(envelope("ash-custody-replay", {"receipt": tampered_manifest}), {})

    tampered_receipt = deepcopy(receipt)
    tampered_receipt["created_at"] = "2040-01-01T00:00:00Z"
    with pytest.raises(ValueError, match="receipt digest"):
        API.dispatch_post(envelope("ash-custody-replay", {"receipt": tampered_receipt}), {})


def test_v05_migration_quarantines_legacy_content_hash_and_targets_l0():
    legacy = {
        "schema": "td613.ash.custody-manifest/v0.5",
        "artifact_id": "legacy",
        "source_environment": "manual",
        "source_locator": {"label": "legacy fixture"},
        "artifact_metadata": {
            "media_type": "text/plain",
            "byte_length": 3,
            "content_hash": "sha256:" + "a" * 64,
            "hash_scope": "metadata-or-local-browser",
        },
        "credential_reference": {"credential_type": "none"},
        "privacy_boundary": {"server_custody": False},
        "ash_posture": {"room_route": "private-sense-only"},
    }
    migration = API.dispatch_post(
        envelope("ash-custody-migrate", {"manifest": legacy}),
        {},
    )["result"]
    receipt = migration["migrated_receipt"]
    provenance = receipt["manifest"]["migration_provenance"]

    assert migration["status"] == "MIGRATED"
    assert migration["target_assurance_class"] == "L0_METADATA_ONLY"
    assert receipt["manifest"]["artifact_metadata"]["artifact_digest"] is None
    assert provenance["legacy_content_hash_reference"] == "sha256:" + "a" * 64
    assert provenance["legacy_content_hash_promoted_to_artifact_digest"] is False
    assert receipt["manifest_digest"].startswith("sha256:")
    assert receipt["receipt_digest"].startswith("sha256:")


def test_v07_l1_migration_preserves_digest_only_after_boundary_validation():
    source = register(l1_payload())
    legacy_v07 = deepcopy(source["manifest"])
    legacy_v07["schema"] = "td613.ash.custody-manifest/v0.7"
    legacy_v07.pop("manifest_digest")
    legacy_v07.pop("canonicalization")
    legacy_v07["artifact_metadata"]["content_hash"] = DIGEST

    migration = API.dispatch_post(
        envelope("ash-custody-migrate", {"manifest": legacy_v07}),
        {},
    )["result"]
    receipt = migration["migrated_receipt"]
    assert migration["target_assurance_class"] == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    assert receipt["manifest"]["artifact_metadata"]["artifact_digest"] == DIGEST
    assert (
        receipt["manifest"]["migration_provenance"][
            "artifact_digest_preserved_after_validation"
        ]
        is True
    )


def test_legacy_replay_never_promotes_v05_hash_to_artifact_digest():
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
    replay = API.dispatch_post(
        envelope("ash-custody-replay", {"manifest": legacy}),
        {},
    )["result"]
    assert replay["assurance_class"] == "LEGACY_UNVERIFIED_RECEIPT"
    assert replay["artifact_digest"] is None
    assert replay["migration_available"] is True
