from __future__ import annotations

import importlib.util
import os
from pathlib import Path

import pytest


API_PATH = Path(__file__).resolve().parents[3] / "api" / "dome-world-engine-v07.py"
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
                "hash_execution": "browser-local",
                "raw_bytes_transmitted": False,
                "raw_bytes_returned": False,
                "memory_erasure_guaranteed": False,
            },
        },
        "credentialReference": {"credentialType": "local-possession"},
        "privacyBoundary": {"public_weather_only": True},
        "ashPosture": {"roomRoute": "private-sense-only"},
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


def test_trainer_requires_operator_token_and_signing_secret(monkeypatch):
    monkeypatch.setenv("DOME_WORLD_TRAINER_ENABLED", "1")
    monkeypatch.setenv("DOME_WORLD_OPERATOR_TOKEN", "operator-secret")
    monkeypatch.setenv("DOME_WORLD_CHECKPOINT_SECRET", "checkpoint-secret")
    payload = envelope(
        "trainer-step",
        {"action": "propose", "observations": [[1, 0, 1, 0]]},
    )

    with pytest.raises(PermissionError, match="operator token"):
        API.dispatch_post(payload, {})

    receipt = API.dispatch_post(
        payload,
        {"authorization": "Bearer operator-secret"},
    )
    assert receipt["result"]["status"] in {"CAPTURED", "CONSTRUCTION_PROPOSED", "OPEN"}
    assert "operator-secret" not in str(receipt)
    assert "checkpoint-secret" not in str(receipt)


def test_readiness_reports_client_held_storage_and_phase1_commitment(monkeypatch):
    monkeypatch.setenv("DOME_WORLD_TRAINER_ENABLED", "0")
    receipt = API.readiness_receipt()
    assert receipt["storage"] == "client-held-signed-checkpoints"
    assert receipt["aperture"]["operationalState"] == "interface_context"
    assert receipt["ashLocalCommitment"]["status"] == "phase-1-active"
    assert receipt["ashLocalCommitment"]["rawBytesAcceptedByServer"] is False
    assert receipt["ashLocalCommitment"]["metadataDigestFallback"] is False


def test_l1_local_commitment_registers_exact_digest_without_raw_bytes():
    receipt = API.dispatch_post(envelope("ash-custody-register", l1_payload()), {})["result"]
    metadata = receipt["manifest"]["artifact_metadata"]

    assert receipt["schema"] == "td613.ash.custody-receipt/v0.7"
    assert receipt["assurance_class"] == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
    assert receipt["artifact_digest_present"] is True
    assert receipt["decision"] == "artifact-registered-with-browser-local-byte-commitment"
    assert metadata["artifact_digest"].endswith("f20015ad")
    assert metadata["content_hash"] == metadata["artifact_digest"]
    assert receipt["manifest"]["privacy_boundary"]["raw_content_received_by_server"] is False
    assert "rawBytes" not in str(receipt)


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


def test_l1_rejects_digest_mismatch_and_fake_memory_erasure():
    payload = l1_payload()
    payload["artifactMetadata"]["localCommitment"]["artifact_digest"] = "sha256:" + "0" * 64
    with pytest.raises(ValueError, match="does not match"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})

    payload = l1_payload()
    payload["artifactMetadata"]["localCommitment"]["memory_erasure_guaranteed"] = True
    with pytest.raises(ValueError, match="guaranteed memory erasure"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})


def test_l0_rejects_manual_digest_promotion():
    payload = l1_payload()
    payload["artifactMetadata"]["assuranceClass"] = "L0_METADATA_ONLY"
    payload["artifactMetadata"]["localCommitment"] = None
    with pytest.raises(ValueError, match="may not carry an artifact digest"):
        API.dispatch_post(envelope("ash-custody-register", payload), {})
