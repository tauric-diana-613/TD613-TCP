"""Phase 1 Ash Local Commitment adapter for the Dome-World API.

This wrapper preserves the existing Dome-World operation surface while replacing
Ash custody registration with v0.7 commitment-aware normalization. It does not
accept raw artifact bytes and it never synthesizes an artifact digest from
metadata.
"""

from __future__ import annotations

import importlib.util
import re
from pathlib import Path

_BASE_PATH = Path(__file__).with_name("dome-world-engine.py")
_SPEC = importlib.util.spec_from_file_location("td613_dome_world_engine_v05", _BASE_PATH)
_BASE = importlib.util.module_from_spec(_SPEC)
assert _SPEC and _SPEC.loader
_SPEC.loader.exec_module(_BASE)

_LOCAL_SCHEMA = "td613.ash.local-commitment/v0.7"
_MANIFEST_SCHEMA = "td613.ash.custody-manifest/v0.7"
_RECEIPT_SCHEMA = "td613.ash.custody-receipt/v0.7"
_L0 = "L0_METADATA_ONLY"
_L1 = "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
_SHA256_RE = re.compile(r"^sha256:[0-9a-f]{64}$")


def _copy_dict(value):
    return value if isinstance(value, dict) else {}


def _normalized_digest(value):
    if value in (None, ""):
        return None
    digest = str(value).strip().lower()
    if not _SHA256_RE.fullmatch(digest):
        raise ValueError("artifact digest must be sha256 followed by 64 lowercase hexadecimal characters")
    return digest


def _normalize_local_commitment(artifact_metadata):
    local = _copy_dict(artifact_metadata.get("localCommitment") or artifact_metadata.get("local_commitment"))
    requested_assurance = str(
        artifact_metadata.get("assuranceClass")
        or artifact_metadata.get("assurance_class")
        or local.get("assurance_class")
        or _L0
    ).strip()
    digest = _normalized_digest(
        artifact_metadata.get("artifactDigest")
        or artifact_metadata.get("artifact_digest")
        or artifact_metadata.get("contentHash")
        or artifact_metadata.get("content_hash")
        or local.get("artifact_digest")
    )

    if requested_assurance == _L1:
        if local.get("schema") != _LOCAL_SCHEMA:
            raise ValueError("L1 browser-local assurance requires td613.ash.local-commitment/v0.7")
        if local.get("assurance_class") != _L1:
            raise ValueError("local commitment assurance class does not match L1")
        local_digest = _normalized_digest(local.get("artifact_digest"))
        if not digest or local_digest != digest:
            raise ValueError("local commitment digest does not match artifact metadata")
        if local.get("hash_execution") != "browser-local":
            raise ValueError("L1 local commitment must declare browser-local hash execution")
        if local.get("raw_bytes_transmitted") is not False:
            raise ValueError("L1 local commitment must declare raw_bytes_transmitted=false")
        if local.get("raw_bytes_returned") is not False:
            raise ValueError("L1 local commitment must declare raw_bytes_returned=false")
        if local.get("memory_erasure_guaranteed") is not False:
            raise ValueError("L1 local commitment may not claim guaranteed memory erasure")
        local_size = local.get("byte_length")
        metadata_size = artifact_metadata.get("byteLength") or artifact_metadata.get("byte_length")
        if local_size is not None and metadata_size is not None and int(local_size) != int(metadata_size):
            raise ValueError("local commitment byte length does not match artifact metadata")
        return {
            "assurance_class": _L1,
            "artifact_digest": digest,
            "execution_attestation": "client-generated-not-independently-attested",
            "local_commitment": {
                "schema": _LOCAL_SCHEMA,
                "digest_algorithm": "SHA-256",
                "artifact_digest": digest,
                "byte_length": local.get("byte_length"),
                "media_type": local.get("media_type"),
                "last_modified_claim": local.get("last_modified_claim"),
                "hash_execution": "browser-local",
                "network_operation_performed_by_module": False,
                "raw_bytes_transmitted": False,
                "raw_bytes_returned": False,
                "raw_bytes_persisted_by_module": False,
                "memory_erasure_guaranteed": False,
            },
        }

    if requested_assurance not in {_L0, ""}:
        raise ValueError("unsupported Ash commitment assurance class")
    if digest is not None:
        raise ValueError("L0 metadata-only registration may not carry an artifact digest")
    return {
        "assurance_class": _L0,
        "artifact_digest": None,
        "execution_attestation": "no-byte-commitment-supplied",
        "local_commitment": None,
    }


def _normalize_manifest_v07(payload, aperture):
    _BASE._reject_raw_content(payload)
    source_environment = str(payload.get("sourceEnvironment") or payload.get("source_environment") or "manual").strip() or "manual"
    source_locator = _copy_dict(payload.get("sourceLocator") or payload.get("source_locator"))
    artifact_metadata = _copy_dict(payload.get("artifactMetadata") or payload.get("artifact_metadata") or payload.get("metadata"))
    credential_reference = _copy_dict(payload.get("credentialReference") or payload.get("credential_reference"))
    privacy_boundary = _copy_dict(payload.get("privacyBoundary") or payload.get("privacy_boundary"))
    ash_posture = _copy_dict(payload.get("ashPosture") or payload.get("ash_posture"))
    commitment = _normalize_local_commitment(artifact_metadata)

    artifact_id = str(payload.get("artifactId") or artifact_metadata.get("artifactId") or "").strip()
    if not artifact_id:
        basis = (
            {"artifact_digest": commitment["artifact_digest"]}
            if commitment["artifact_digest"]
            else {"source": source_environment, "locator": source_locator, "metadata": {
                "media_type": artifact_metadata.get("mediaType") or artifact_metadata.get("media_type"),
                "byte_length": artifact_metadata.get("byteLength") or artifact_metadata.get("byte_length"),
                "last_modified": artifact_metadata.get("lastModified") or artifact_metadata.get("last_modified"),
            }}
        )
        artifact_id = "ash_artifact_" + _BASE._sha256(basis)[-16:]

    artifact_digest = commitment["artifact_digest"]
    manifest = {
        "schema": _MANIFEST_SCHEMA,
        "artifact_id": artifact_id,
        "artifact_id_basis": "artifact-digest-derived" if artifact_digest else "metadata-route-derived",
        "source_environment": source_environment,
        "source_locator": {
            "label": source_locator.get("label"),
            "path_or_ref": source_locator.get("path_or_ref") or source_locator.get("path") or source_locator.get("ref"),
            "revision": source_locator.get("revision"),
            "commit_sha": source_locator.get("commit_sha") or source_locator.get("commitSha"),
            "blob_sha": source_locator.get("blob_sha") or source_locator.get("blobSha"),
        },
        "artifact_metadata": {
            "media_type": artifact_metadata.get("mediaType") or artifact_metadata.get("media_type"),
            "byte_length": artifact_metadata.get("byteLength") or artifact_metadata.get("byte_length"),
            "last_modified_claim": artifact_metadata.get("lastModified") or artifact_metadata.get("last_modified"),
            "artifact_digest": artifact_digest,
            "content_hash": artifact_digest,
            "digest_algorithm": "SHA-256" if artifact_digest else None,
            "hash_scope": "local-browser" if artifact_digest else "unavailable",
            "assurance_class": commitment["assurance_class"],
            "execution_attestation": commitment["execution_attestation"],
        },
        "local_commitment": commitment["local_commitment"],
        "privacy_boundary": {
            "raw_content_exported": False,
            "raw_content_retained": False,
            "raw_content_received_by_server": False,
            "server_custody": False,
            "public_weather_only": bool(privacy_boundary.get("public_weather_only", True)),
        },
        "credential_reference": {
            "credential_type": credential_reference.get("credentialType") or credential_reference.get("credential_type") or "none",
            "credential_secret_recorded": False,
            "identity_proof_claimed": False,
            "permission_proof_claimed": False,
        },
        "ash_posture": {
            "room_route": ash_posture.get("roomRoute") or ash_posture.get("room_route") or "private-sense-only",
            "claim_ceiling": "ash-readiness-preview-not-sensitive-intake",
            "recommended_tending": ash_posture.get("recommendedTending") or ash_posture.get("recommended_tending") or ["ash-receipt", "safe-harbor-buffer"],
        },
        "replay": {
            "eligible": True,
            "mode": "custody-replay-without-content",
            "raw_replay_available": False,
        },
        "aperture": aperture,
    }
    return manifest


def _ash_custody_register_v07(payload, aperture):
    manifest = _normalize_manifest_v07(payload, aperture)
    assurance = manifest["artifact_metadata"]["assurance_class"]
    receipt = {
        "schema": _RECEIPT_SCHEMA,
        "receipt_id": "ashc_" + _BASE._sha256(manifest)[-20:],
        "created_at": _BASE._now(),
        "domeWorldVersion": _BASE.DOME_WORLD_VERSION,
        "assurance_class": assurance,
        "artifact_digest_present": bool(manifest["artifact_metadata"]["artifact_digest"]),
        "manifest": manifest,
        "public_surface": {
            "content_exported": False,
            "text_preview": None,
            "quantized_weather_only": True,
            "visual_signature": "salted-heterostratigraphic-overlay",
        },
        "export_boundary": {
            "status": "receipt-only",
            "raw_content_allowed": False,
            "summary_before_custody": False,
            "arrival_as_consent": False,
        },
        "anti_extraction_defaults": {
            "local_hold": True,
            "no_content_export": True,
            "public_weather_only": True,
            "receipt_not_proof": True,
            "beauty_not_verification": True,
        },
        "decision": (
            "artifact-registered-with-browser-local-byte-commitment"
            if assurance == _L1
            else "artifact-registered-as-metadata-only-custody-event"
        ),
        "claimCeiling": "ash-custody-receipt-not-content-custody-or-permission-proof",
        "seal": "⟐",
    }
    return receipt


def _ash_custody_replay_v07(payload, aperture):
    _BASE._reject_raw_content(payload)
    receipt = _copy_dict(payload.get("receipt"))
    manifest = _copy_dict(payload.get("manifest")) or _copy_dict(receipt.get("manifest"))
    if not manifest:
        raise ValueError("ash-custody-replay requires a custody receipt or manifest")
    metadata = _copy_dict(manifest.get("artifact_metadata"))
    return {
        "status": "OPEN",
        "schema": "td613.ash.custody-replay/v0.7",
        "aperture": aperture,
        "receipt_id": receipt.get("receipt_id"),
        "artifact_id": manifest.get("artifact_id"),
        "source_environment": manifest.get("source_environment"),
        "artifact_digest": metadata.get("artifact_digest"),
        "assurance_class": metadata.get("assurance_class", _L0),
        "route": _copy_dict(manifest.get("ash_posture")).get("room_route"),
        "privacy_boundary": manifest.get("privacy_boundary"),
        "replay_mode": "custody-replay-without-content",
        "raw_replay_available": False,
        "decision": "replayed-custody-state-without-rehydrating-raw-content",
        "claimCeiling": "ash-custody-replay-not-fresh-execution-or-content-access",
    }


_BASE_READINESS = _BASE.readiness_receipt


def readiness_receipt():
    receipt = _BASE_READINESS()
    receipt["ashLocalCommitment"] = {
        "schema": _LOCAL_SCHEMA,
        "status": "phase-1-active",
        "assuranceClasses": [_L0, _L1],
        "rawBytesAcceptedByServer": False,
        "metadataDigestFallback": False,
    }
    return receipt


_BASE._normalize_manifest = _normalize_manifest_v07
_BASE._ash_custody_register = _ash_custody_register_v07
_BASE._ash_custody_replay = _ash_custody_replay_v07
_BASE.readiness_receipt = readiness_receipt

# Vercel discovers this class. Its methods execute inside the base module, whose
# registration and readiness globals are patched above.
handler = _BASE.handler

# Test and local tooling entry points.
dispatch_post = _BASE.dispatch_post
POST_OPERATIONS = _BASE.POST_OPERATIONS
RAW_CONTENT_KEYS = _BASE.RAW_CONTENT_KEYS
