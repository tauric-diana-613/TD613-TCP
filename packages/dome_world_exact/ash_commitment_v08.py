"""Phase 2 Ash commitment and manifest normalization."""
from __future__ import annotations

import re
import secrets

from packages.dome_world_exact.ash_canonical_json import (
    CANONICAL_JSON_PROFILE,
    MANIFEST_DIGEST_DOMAIN,
    compute_manifest_digest,
)

LOCAL_SCHEMA = "td613.ash.local-commitment/v0.7"
MANIFEST_SCHEMA = "td613.ash.custody-manifest/v0.8"
L0_ASSURANCE = "L0_METADATA_ONLY"
L1_ASSURANCE = "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
LEGACY_REPLAY_ASSURANCE = "LEGACY_UNVERIFIED_RECEIPT"
RAW_CONTENT_KEYS = {
    "text", "rawText", "content", "document", "body", "sensitiveText",
    "rawBytes", "fileBytes", "fileContent",
}
SHA256_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
DOES_NOT_ESTABLISH = [
    "possession", "authorship", "authenticity", "identity",
    "permission", "truth", "trusted-time",
]


def as_dict(value):
    return value if isinstance(value, dict) else {}


def first_present(mapping, *keys):
    for key in keys:
        if key in mapping and mapping[key] is not None:
            return mapping[key]
    return None


def reject_raw_content(payload):
    present = []

    def active(value):
        return value not in (None, "", False, [], {})

    def walk(value, path="payload"):
        if isinstance(value, dict):
            for key, child in value.items():
                child_path = f"{path}.{key}"
                if key in RAW_CONTENT_KEYS and active(child):
                    present.append(child_path)
                else:
                    walk(child, child_path)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{path}[{index}]")

    walk(payload)
    if present:
        raise ValueError(
            "Ash custody accepts metadata/manifests only; raw content fields are prohibited: "
            + ", ".join(sorted(present))
        )


def aperture_context(value):
    source = as_dict(value)
    return {
        "version": "v3.1-alpha",
        "schema": "td613-aperture/v3.1-alpha",
        "feature": "v3.1-alpha-admissibility-tomography-registry-dynamics-runtime",
        "observedRegime": source.get("observedRegime", "PRCS-A"),
        "operationalState": "interface_context",
        "claimAuthority": "design_signal",
    }


def normalized_sha256(value, label="digest"):
    if value in (None, ""):
        return None
    raw = str(value).strip()
    if raw != raw.lower() or not SHA256_RE.fullmatch(raw):
        raise ValueError(
            f"{label} must be sha256 followed by 64 lowercase hexadecimal characters"
        )
    return raw


def nonnegative_int(value, label):
    if value in (None, ""):
        return None
    if isinstance(value, bool):
        raise TypeError(f"{label} must be a non-negative integer")
    try:
        number = int(value)
    except (TypeError, ValueError) as exc:
        raise TypeError(f"{label} must be a non-negative integer") from exc
    if number < 0:
        raise ValueError(f"{label} must be a non-negative integer")
    if number > 9_007_199_254_740_991:
        raise ValueError(f"{label} exceeds the canonical safe-integer range")
    return number


def normalize_local_commitment(metadata):
    local = as_dict(metadata.get("localCommitment") or metadata.get("local_commitment"))
    explicit = first_present(metadata, "assuranceClass", "assurance_class")
    if str(explicit or "").strip() == L0_ASSURANCE and local:
        raise ValueError("L0 metadata-only registration may not carry a local commitment")

    assurances = {
        str(value).strip()
        for value in (explicit, local.get("assurance_class"))
        if value not in (None, "")
    }
    if len(assurances) > 1:
        raise ValueError("commitment assurance declarations conflict")
    assurance = next(iter(assurances), L0_ASSURANCE)

    digests = []
    for value in (
        metadata.get("artifactDigest"), metadata.get("artifact_digest"),
        metadata.get("contentHash"), metadata.get("content_hash"),
        local.get("artifact_digest"),
    ):
        digest = normalized_sha256(value, "artifact digest")
        if digest is not None:
            digests.append(digest)
    if len(set(digests)) > 1:
        raise ValueError("artifact digest declarations conflict")
    digest = next(iter(set(digests)), None)
    metadata_size = nonnegative_int(
        first_present(metadata, "byteLength", "byte_length"), "artifact byte length"
    )

    if assurance == L0_ASSURANCE:
        if digest is not None:
            raise ValueError("L0 metadata-only registration may not carry an artifact digest")
        if local:
            raise ValueError("L0 metadata-only registration may not carry a local commitment")
        return {
            "assurance_class": L0_ASSURANCE,
            "artifact_digest": None,
            "execution_attestation": "no-byte-commitment-supplied",
            "local_commitment": None,
        }
    if assurance != L1_ASSURANCE:
        raise ValueError("unsupported Ash commitment assurance class")

    required = {
        "schema": LOCAL_SCHEMA,
        "assurance_class": L1_ASSURANCE,
        "digest_algorithm": "SHA-256",
        "hash_execution": "browser-local",
        "network_operation_performed_by_module": False,
        "raw_bytes_transmitted": False,
        "raw_bytes_returned": False,
        "raw_bytes_persisted_by_module": False,
        "memory_erasure_guaranteed": False,
    }
    for field, expected in required.items():
        if local.get(field) != expected:
            if expected is False:
                raise ValueError(f"L1 local commitment must declare {field}=false")
            raise ValueError(f"L1 local commitment must declare {field}={expected}")
    if not digest:
        raise ValueError("L1 browser-local assurance requires an artifact digest")
    local_size = nonnegative_int(local.get("byte_length"), "local byte length")
    if local_size is None:
        raise ValueError("L1 local commitment requires byte_length")
    if metadata_size is not None and local_size != metadata_size:
        raise ValueError("local commitment byte length does not match artifact metadata")
    local_type = local.get("media_type")
    metadata_type = first_present(metadata, "mediaType", "media_type")
    if local_type not in (None, "") and metadata_type not in (None, ""):
        if str(local_type) != str(metadata_type):
            raise ValueError("local commitment media type does not match artifact metadata")

    return {
        "assurance_class": L1_ASSURANCE,
        "artifact_digest": digest,
        "execution_attestation": "client-generated-not-independently-attested",
        "local_commitment": {
            "schema": LOCAL_SCHEMA,
            "assurance_class": L1_ASSURANCE,
            "digest_algorithm": "SHA-256",
            "artifact_digest": digest,
            "byte_length": local_size,
            "media_type": local_type,
            "last_modified_claim": local.get("last_modified_claim"),
            "hash_input": "exact-file-picker-bytes",
            "hash_execution": "browser-local",
            "execution_attestation": "client-generated-not-independently-attested",
            "network_operation_performed_by_module": False,
            "raw_bytes_transmitted": False,
            "raw_bytes_returned": False,
            "raw_bytes_persisted_by_module": False,
            "best_effort_buffer_overwrite": bool(
                local.get("best_effort_buffer_overwrite", True)
            ),
            "memory_erasure_guaranteed": False,
            "does_not_establish": list(DOES_NOT_ESTABLISH),
        },
    }


def normalize_manifest(
    payload,
    aperture,
    *,
    migration_provenance=None,
    artifact_id_basis_override=None,
):
    reject_raw_content(payload)
    environment = str(
        payload.get("sourceEnvironment") or payload.get("source_environment") or "manual"
    ).strip() or "manual"
    locator = as_dict(payload.get("sourceLocator") or payload.get("source_locator"))
    metadata = as_dict(
        payload.get("artifactMetadata")
        or payload.get("artifact_metadata")
        or payload.get("metadata")
    )
    credential = as_dict(
        payload.get("credentialReference") or payload.get("credential_reference")
    )
    privacy = as_dict(payload.get("privacyBoundary") or payload.get("privacy_boundary"))
    posture = as_dict(payload.get("ashPosture") or payload.get("ash_posture"))
    commitment = normalize_local_commitment(metadata)

    supplied_id = str(
        payload.get("artifactId")
        or payload.get("artifact_id")
        or metadata.get("artifactId")
        or ""
    ).strip()
    artifact_id = supplied_id or f"ash_artifact_{secrets.token_hex(8)}"
    id_basis = artifact_id_basis_override or (
        "operator-supplied" if supplied_id else "receipt-local-random"
    )
    artifact_digest = commitment["artifact_digest"]

    manifest = {
        "schema": MANIFEST_SCHEMA,
        "artifact_id": artifact_id,
        "artifact_id_basis": id_basis,
        "canonicalization": {
            "profile": CANONICAL_JSON_PROFILE,
            "digest_domain": MANIFEST_DIGEST_DOMAIN,
            "encoding": "UTF-8",
            "unicode_normalization": "none",
            "number_profile": "safe-integers-only",
        },
        "source_environment": environment,
        "source_locator": {
            "label": locator.get("label"),
            "path_or_ref": locator.get("path_or_ref") or locator.get("path") or locator.get("ref"),
            "revision": locator.get("revision"),
            "commit_sha": locator.get("commit_sha") or locator.get("commitSha"),
            "blob_sha": locator.get("blob_sha") or locator.get("blobSha"),
        },
        "artifact_metadata": {
            "media_type": first_present(metadata, "mediaType", "media_type"),
            "byte_length": nonnegative_int(
                first_present(metadata, "byteLength", "byte_length"), "artifact byte length"
            ),
            "last_modified_claim": first_present(metadata, "lastModified", "last_modified"),
            "artifact_digest": artifact_digest,
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
            "public_weather_only": bool(privacy.get("public_weather_only", True)),
            "digest_visibility": "local-receipt-only",
        },
        "credential_reference": {
            "credential_type": credential.get("credentialType")
            or credential.get("credential_type")
            or "none",
            "credential_secret_recorded": False,
            "identity_proof_claimed": False,
            "permission_proof_claimed": False,
        },
        "ash_posture": {
            "room_route": posture.get("roomRoute")
            or posture.get("room_route")
            or "private-sense-only",
            "recommended_tending": posture.get("recommendedTending")
            or posture.get("recommended_tending")
            or ["ash-receipt", "safe-harbor-buffer"],
        },
        "replay": {
            "eligible": True,
            "mode": "custody-replay-without-content",
            "raw_replay_available": False,
        },
        "does_not_establish": list(DOES_NOT_ESTABLISH),
        "aperture": aperture,
    }
    if migration_provenance is not None:
        manifest["migration_provenance"] = migration_provenance
    manifest["manifest_digest"] = compute_manifest_digest(manifest)
    return manifest


def payload_from_manifest(manifest, assurance, artifact_digest, local_commitment):
    metadata = as_dict(manifest.get("artifact_metadata"))
    locator = as_dict(manifest.get("source_locator"))
    credential = as_dict(manifest.get("credential_reference"))
    posture = as_dict(manifest.get("ash_posture"))
    privacy = as_dict(manifest.get("privacy_boundary"))
    return {
        "artifactId": manifest.get("artifact_id"),
        "sourceEnvironment": manifest.get("source_environment") or "manual",
        "sourceLocator": {
            "label": locator.get("label"),
            "path_or_ref": locator.get("path_or_ref"),
            "revision": locator.get("revision"),
            "commit_sha": locator.get("commit_sha"),
            "blob_sha": locator.get("blob_sha"),
        },
        "artifactMetadata": {
            "mediaType": metadata.get("media_type"),
            "byteLength": metadata.get("byte_length"),
            "lastModified": metadata.get("last_modified_claim") or metadata.get("last_modified"),
            "artifactDigest": artifact_digest,
            "contentHash": artifact_digest,
            "hashScope": "local-browser" if artifact_digest else "unavailable",
            "assuranceClass": assurance,
            "localCommitment": local_commitment,
        },
        "credentialReference": {"credentialType": credential.get("credential_type") or "none"},
        "privacyBoundary": {"public_weather_only": bool(privacy.get("public_weather_only", True))},
        "ashPosture": {
            "roomRoute": posture.get("room_route") or "private-sense-only",
            "recommendedTending": posture.get("recommended_tending")
            or ["ash-receipt", "safe-harbor-buffer"],
        },
    }
