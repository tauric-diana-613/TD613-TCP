"""Phase 2 Ash receipt construction, replay verification, and migration."""
from __future__ import annotations

from datetime import datetime, timezone

from packages.dome_world_exact.ash_canonical_json import (
    CANONICAL_JSON_PROFILE,
    RECEIPT_DIGEST_DOMAIN,
    compute_manifest_digest,
    compute_receipt_digest,
)
from packages.dome_world_exact.ash_commitment_v08 import (
    DOES_NOT_ESTABLISH,
    L0_ASSURANCE,
    L1_ASSURANCE,
    LEGACY_REPLAY_ASSURANCE,
    MANIFEST_SCHEMA,
    as_dict,
    normalize_local_commitment,
    normalize_manifest,
    normalized_sha256,
    payload_from_manifest,
    reject_raw_content,
)

RECEIPT_SCHEMA = "td613.ash.custody-receipt/v0.8"
REPLAY_SCHEMA = "td613.ash.custody-replay/v0.8"
MIGRATION_SCHEMA = "td613.ash.custody-migration/v0.8"
SUPPORTED_OPERATIONS = {
    "ash-custody-register",
    "ash-custody-replay",
    "ash-custody-migrate",
}


def _now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def build_receipt(manifest, decision, *, created_at=None, migration=None):
    receipt = {
        "schema": RECEIPT_SCHEMA,
        "receipt_id_basis": "receipt-digest-prefix",
        "created_at": created_at or _now(),
        "domeWorldVersion": "v0.5.0",
        "canonicalization": {
            "profile": CANONICAL_JSON_PROFILE,
            "digest_domain": RECEIPT_DIGEST_DOMAIN,
            "encoding": "UTF-8",
            "unicode_normalization": "none",
            "number_profile": "safe-integers-only",
        },
        "assurance_class": manifest["artifact_metadata"]["assurance_class"],
        "artifact_digest_present": bool(manifest["artifact_metadata"]["artifact_digest"]),
        "manifest_digest": manifest["manifest_digest"],
        "manifest": manifest,
        "public_surface": {
            "content_exported": False,
            "text_preview": None,
            "quantized_weather_only": True,
            "visual_signature": "salted-heterostratigraphic-overlay",
            "artifact_digest_exported": False,
            "manifest_digest_exported": False,
            "receipt_digest_exported": False,
            "digest_visibility": "local-receipt-only",
        },
        "export_boundary": {
            "status": "receipt-only",
            "raw_content_allowed": False,
            "summary_before_custody": False,
            "arrival_as_consent": False,
            "universal_stable_digest_allowed": False,
        },
        "anti_extraction_defaults": {
            "local_hold": True,
            "no_content_export": True,
            "public_weather_only": True,
            "receipt_not_proof": True,
            "beauty_not_verification": True,
        },
        "decision": decision,
        "does_not_establish": list(DOES_NOT_ESTABLISH),
        "seal": "⟐",
    }
    if migration is not None:
        receipt["migration"] = migration
    receipt["receipt_digest"] = compute_receipt_digest(receipt)
    receipt["receipt_id"] = "ashc_" + receipt["receipt_digest"][-20:]
    return receipt


def register(payload, aperture):
    manifest = normalize_manifest(payload, aperture)
    decision = (
        "artifact-registered-with-browser-local-byte-commitment"
        if manifest["artifact_metadata"]["assurance_class"] == L1_ASSURANCE
        else "artifact-registered-as-metadata-only-custody-event"
    )
    return build_receipt(manifest, decision)


def verify_v08_receipt(receipt, manifest):
    expected_manifest = compute_manifest_digest(manifest)
    if normalized_sha256(manifest.get("manifest_digest"), "manifest digest") != expected_manifest:
        raise ValueError("manifest digest verification failed")
    if not receipt:
        return expected_manifest, None
    if normalized_sha256(receipt.get("manifest_digest"), "receipt manifest digest") != expected_manifest:
        raise ValueError("receipt manifest digest does not match embedded manifest")
    expected_receipt = compute_receipt_digest(receipt)
    if normalized_sha256(receipt.get("receipt_digest"), "receipt digest") != expected_receipt:
        raise ValueError("receipt digest verification failed")
    if receipt.get("receipt_id") != "ashc_" + expected_receipt[-20:]:
        raise ValueError("receipt id does not match receipt digest prefix")
    return expected_manifest, expected_receipt


def replay(payload, aperture):
    reject_raw_content(payload)
    receipt = as_dict(payload.get("receipt"))
    manifest = as_dict(payload.get("manifest")) or as_dict(receipt.get("manifest"))
    if not manifest:
        raise ValueError("ash-custody-replay requires a custody receipt or manifest")

    schema = manifest.get("schema")
    metadata = as_dict(manifest.get("artifact_metadata"))
    manifest_digest = receipt_digest = None
    migration_available = schema in {
        "td613.ash.custody-manifest/v0.5",
        "td613.ash.custody-manifest/v0.7",
    }
    if schema == MANIFEST_SCHEMA:
        manifest_digest, receipt_digest = verify_v08_receipt(receipt, manifest)
        assurance = metadata.get("assurance_class")
        artifact_digest = normalized_sha256(metadata.get("artifact_digest"), "artifact digest")
        if assurance == L1_ASSURANCE:
            replay_metadata = dict(metadata)
            replay_metadata["local_commitment"] = manifest.get("local_commitment")
            artifact_digest = normalize_local_commitment(replay_metadata)["artifact_digest"]
        elif assurance == L0_ASSURANCE:
            if artifact_digest is not None or manifest.get("local_commitment"):
                raise ValueError("v0.8 L0 replay carries an artifact commitment")
        else:
            raise ValueError("unsupported v0.8 assurance class")
        validation_status = "V0_8_DIGEST_SPINE_VERIFIED"
        legacy_reference = None
    elif schema == "td613.ash.custody-manifest/v0.7":
        replay_metadata = dict(metadata)
        replay_metadata["local_commitment"] = manifest.get("local_commitment")
        commitment = normalize_local_commitment(replay_metadata)
        artifact_digest = commitment["artifact_digest"]
        assurance = commitment["assurance_class"]
        validation_status = "V0_7_VALIDATED_DIGEST_SPINE_ABSENT"
        legacy_reference = metadata.get("content_hash")
    elif schema == "td613.ash.custody-manifest/v0.5":
        artifact_digest = None
        assurance = LEGACY_REPLAY_ASSURANCE
        validation_status = "LEGACY_REPLAY_NOT_REVALIDATED_AS_L1"
        legacy_reference = metadata.get("content_hash")
    else:
        raise ValueError("unsupported custody manifest schema")

    return {
        "status": "OPEN",
        "schema": REPLAY_SCHEMA,
        "aperture": aperture,
        "receipt_id": receipt.get("receipt_id"),
        "artifact_id": manifest.get("artifact_id"),
        "source_manifest_schema": schema,
        "artifact_digest": artifact_digest,
        "manifest_digest": manifest_digest,
        "receipt_digest": receipt_digest,
        "legacy_content_hash_reference": legacy_reference,
        "assurance_class": assurance,
        "validation_status": validation_status,
        "migration_available": migration_available,
        "route": as_dict(manifest.get("ash_posture")).get("room_route"),
        "privacy_boundary": manifest.get("privacy_boundary"),
        "replay_mode": "custody-replay-without-content",
        "raw_replay_available": False,
        "decision": "replayed-custody-state-without-rehydrating-raw-content",
        "does_not_establish": list(DOES_NOT_ESTABLISH),
    }


def migrate(payload, aperture):
    reject_raw_content(payload)
    source_receipt = as_dict(payload.get("receipt"))
    source_manifest = as_dict(payload.get("manifest")) or as_dict(source_receipt.get("manifest"))
    if not source_manifest:
        raise ValueError("ash-custody-migrate requires a custody receipt or manifest")

    source_schema = source_manifest.get("schema")
    if source_schema == MANIFEST_SCHEMA:
        verify_v08_receipt(source_receipt, source_manifest)
        return {
            "status": "CURRENT",
            "schema": MIGRATION_SCHEMA,
            "migration_performed": False,
            "source_manifest_schema": source_schema,
            "target_manifest_schema": MANIFEST_SCHEMA,
            "migrated_receipt": source_receipt or None,
            "decision": "source-already-uses-canonical-digest-spine",
            "does_not_establish": list(DOES_NOT_ESTABLISH),
        }

    metadata = as_dict(source_manifest.get("artifact_metadata"))
    legacy_hash = metadata.get("content_hash")
    if source_schema == "td613.ash.custody-manifest/v0.7":
        replay_metadata = dict(metadata)
        replay_metadata["local_commitment"] = source_manifest.get("local_commitment")
        commitment = normalize_local_commitment(replay_metadata)
        source_assurance = commitment["assurance_class"]
        artifact_digest = commitment["artifact_digest"]
        local_commitment = commitment["local_commitment"]
        rule = "v0.7-assurance-validated-before-v0.8-digest-spine"
    elif source_schema == "td613.ash.custody-manifest/v0.5":
        source_assurance = LEGACY_REPLAY_ASSURANCE
        artifact_digest = local_commitment = None
        rule = "v0.5-content-hash-quarantined-and-migrated-as-l0"
    else:
        raise ValueError("unsupported custody manifest schema for migration")

    target_assurance = L1_ASSURANCE if artifact_digest else L0_ASSURANCE
    provenance = {
        "source_manifest_schema": source_schema,
        "source_receipt_schema": source_receipt.get("schema"),
        "source_receipt_id": source_receipt.get("receipt_id"),
        "source_assurance_class": source_assurance,
        "target_assurance_class": target_assurance,
        "legacy_content_hash_reference": legacy_hash,
        "artifact_digest_preserved_after_validation": bool(artifact_digest),
        "legacy_content_hash_promoted_to_artifact_digest": False,
        "migration_rule": rule,
    }
    migrated_manifest = normalize_manifest(
        payload_from_manifest(
            source_manifest, target_assurance, artifact_digest, local_commitment
        ),
        aperture,
        migration_provenance=provenance,
        artifact_id_basis_override="migrated-legacy-id",
    )
    decision = (
        "v0.7-manifest-migrated-with-validated-assurance"
        if source_schema.endswith("/v0.7")
        else "legacy-manifest-migrated-without-byte-promotion"
    )
    migrated_receipt = build_receipt(migrated_manifest, decision, migration=provenance)
    return {
        "status": "MIGRATED",
        "schema": MIGRATION_SCHEMA,
        "migration_performed": True,
        "source_manifest_schema": source_schema,
        "target_manifest_schema": MANIFEST_SCHEMA,
        "source_assurance_class": source_assurance,
        "target_assurance_class": target_assurance,
        "migrated_receipt": migrated_receipt,
        "decision": decision,
        "does_not_establish": list(DOES_NOT_ESTABLISH),
    }


def readiness_receipt():
    return {
        "ok": True,
        "schema": "td613.ash.canonical-digest-readiness/v0.8",
        "operations": sorted(SUPPORTED_OPERATIONS),
        "status": "phase-2-active",
        "assuranceClasses": [L0_ASSURANCE, L1_ASSURANCE],
        "canonicalJsonProfile": CANONICAL_JSON_PROFILE,
        "digestDomains": {
            "manifest": "td613.ash.manifest-digest/v0.1",
            "receipt": RECEIPT_DIGEST_DOMAIN,
        },
        "digestSpine": ["artifact_digest", "manifest_digest", "receipt_digest"],
        "migrationSources": [
            "td613.ash.custody-manifest/v0.5",
            "td613.ash.custody-manifest/v0.7",
        ],
        "rawBytesAcceptedByServer": False,
        "metadataDigestFallback": False,
        "universalStableDigestPublishedByDefault": False,
        "boundaryVocabularyPolicy": "no-new-mechanism-legacy-frozen",
    }


def dispatch_operation(operation, payload, aperture):
    if operation == "ash-custody-register":
        return register(payload, aperture)
    if operation == "ash-custody-replay":
        return replay(payload, aperture)
    if operation == "ash-custody-migrate":
        return migrate(payload, aperture)
    raise ValueError("unsupported or missing operation")
