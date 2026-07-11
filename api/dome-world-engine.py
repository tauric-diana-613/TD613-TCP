"""Single bounded Vercel function for Dome-World v0.5.0 cockpit operations."""

from __future__ import annotations

import hashlib
import json
import os
import re
import secrets
import sys
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from packages.dome_world_exact.runtime import (  # noqa: E402
    APERTURE_SCHEMA,
    APERTURE_VERSION,
    CLAIM_CEILING,
    DOME_WORLD_VERSION,
    exact_capture,
    exact_closure,
    trainer_confirm,
    trainer_propose,
)
from packages.dome_world_exact.ash_v06 import ASH_V06_OPERATIONS, dispatch_ash_v06  # noqa: E402

MAX_BODY_BYTES = 131_072
RAW_CONTENT_KEYS = {
    "text",
    "rawText",
    "content",
    "document",
    "body",
    "sensitiveText",
    "rawBytes",
    "fileBytes",
    "fileContent",
}
SHA256_DIGEST_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
L0_METADATA_ONLY = "L0_METADATA_ONLY"
L1_BROWSER_LOCAL_ARTIFACT_DIGEST = "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
LOCAL_COMMITMENT_SCHEMA = "td613.ash.local-commitment/v0.7"

ASH_V06_OPERATION_NAMES = {
    "ash-leak-challenge",
    "ash-veil",
    "ash-cinder",
    "ash-compare",
    "ash-recall",
    "ash-grade-gate",
    "ash-hcc-adapter",
    "ash-projection-simulate",
}
POST_OPERATIONS = {
    "aperture-bridge",
    "phason-gate",
    "ash-readiness",
    "ash-custody-register",
    "ash-custody-replay",
    "phason-custody-diff",
    "receipt-index",
    "exact-capture",
    "exact-closure",
    "trainer-step",
} | ASH_V06_OPERATION_NAMES

if ASH_V06_OPERATION_NAMES != ASH_V06_OPERATIONS:
    raise RuntimeError("Ash v0.6 operation registry drift")


def _now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _stable_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def _sha256(value):
    data = value if isinstance(value, bytes) else _stable_json(value).encode("utf-8")
    return "sha256:" + hashlib.sha256(data).hexdigest()


def _reject_raw_content(payload):
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
            "Ash custody accepts metadata only (manifests/receipts); raw content fields are prohibited: "
            + ", ".join(sorted(present))
        )


def _copy_dict(value):
    return value if isinstance(value, dict) else {}


def _aperture_context(value):
    source = value if isinstance(value, dict) else {}
    return {
        "version": APERTURE_VERSION,
        "schema": APERTURE_SCHEMA,
        "feature": "v3.0-alpha-anti-epistemicide-research-runtime",
        "doctrine": "td613.aperture.doctrine-kernel/v2.9.4",
        "bridge": "td613.aperture.dome-flowcore-bridge/v3.0-alpha",
        "observedRegime": source.get("observedRegime", "PRCS-A"),
        "operationalState": "interface_context",
        "claimAuthority": "design_signal",
    }


def readiness_receipt():
    return {
        "ok": True,
        "schema": "td613.dome-world.readiness/v0.4.3",
        "domeWorldVersion": DOME_WORLD_VERSION,
        "aperture": _aperture_context({}),
        "operations": sorted(POST_OPERATIONS),
        "trainerEnabled": os.getenv("DOME_WORLD_TRAINER_ENABLED") == "1",
        "storage": "client-held-signed-checkpoints",
        "ashLocalCommitment": {
            "schema": LOCAL_COMMITMENT_SCHEMA,
            "acceptedAssuranceClasses": [
                L0_METADATA_ONLY,
                L1_BROWSER_LOCAL_ARTIFACT_DIGEST,
            ],
            "metadataDigestFallback": False,
            "rawBytesAccepted": False,
        },
        "claimCeiling": CLAIM_CEILING,
    }


def _bridge(payload, aperture):
    metrics = payload.get("metrics") if isinstance(payload.get("metrics"), dict) else {}

    def bounded(name, default=0.0):
        try:
            return max(0.0, min(1.0, float(metrics.get(name, default))))
        except (TypeError, ValueError):
            return default

    omission = bounded("omissionPressure")
    coherence = bounded("coherence", 0.5)
    divergence = bounded("divergence")
    return {
        "status": "OPEN",
        "schema": "td613.aperture.dome-flowcore-route-weather/v3.0-alpha",
        "aperture": aperture,
        "weather": {
            "occlusion": omission,
            "coherence": coherence,
            "routePressure": round((omission + divergence + (1 - coherence)) / 3, 6),
            "modeled": True,
        },
        "decision": "route-weather-modeled-without-exact-gate-entry",
        "reasons": ["float weather metrics remain outside the exact substrate"],
        "claimCeiling": "aperture-to-flowcore-translation-not-aperture-execution",
    }


def _phason(payload, aperture):
    content_hash = str(payload.get("contentHash", "")).strip()
    projection = payload.get("projection") if isinstance(payload.get("projection"), dict) else {}
    return {
        "status": "OPEN",
        "schema": "td613.dome-world.phason-gate/v0.4.3",
        "aperture": aperture,
        "observation": {
            "contentHash": content_hash or None,
            "contentChanged": False,
            "projection": projection,
        },
        "decision": "projection-simulation-only",
        "reasons": ["content custody is unchanged; only the declared projection was modeled"],
        "claimCeiling": "phason-gate-simulation-not-external-enforcement",
    }


def _ash(payload, aperture):
    _reject_raw_content(payload)
    metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
    return {
        "status": "OPEN",
        "schema": "td613.dome-world.ash-readiness/v0.4.3",
        "aperture": aperture,
        "observation": {
            "artifactId": metadata.get("artifactId"),
            "mediaType": metadata.get("mediaType"),
            "byteLength": metadata.get("byteLength"),
            "rawSensitiveTextAccepted": False,
        },
        "decision": "readiness-posture-only",
        "reasons": ["production sensitive intake and server custody are not enabled"],
        "claimCeiling": "ash-readiness-preview-not-sensitive-intake",
    }


def _normalized_commitment(artifact_metadata):
    local_commitment = _copy_dict(
        artifact_metadata.get("localCommitment")
        or artifact_metadata.get("local_commitment")
    )

    digest_value = (
        artifact_metadata.get("artifactDigest")
        or artifact_metadata.get("artifact_digest")
        or artifact_metadata.get("contentHash")
        or artifact_metadata.get("content_hash")
    )
    raw_artifact_digest = str(digest_value).strip() if digest_value else None
    artifact_digest = raw_artifact_digest.lower() if raw_artifact_digest else None

    supplied_assurance = str(
        artifact_metadata.get("commitmentAssurance")
        or artifact_metadata.get("commitment_assurance")
        or local_commitment.get("assurance_class")
        or ""
    ).strip()

    if artifact_digest:
        if raw_artifact_digest != artifact_digest or not SHA256_DIGEST_RE.fullmatch(artifact_digest):
            raise ValueError(
                "L1 artifact digest must match sha256 followed by 64 lowercase hexadecimal characters"
            )
        assurance = supplied_assurance or L1_BROWSER_LOCAL_ARTIFACT_DIGEST
        if assurance != L1_BROWSER_LOCAL_ARTIFACT_DIGEST:
            raise ValueError(
                "artifact digest requires L1_BROWSER_LOCAL_ARTIFACT_DIGEST assurance"
            )
    else:
        assurance = supplied_assurance or L0_METADATA_ONLY
        if assurance != L0_METADATA_ONLY:
            raise ValueError(
                "L1_BROWSER_LOCAL_ARTIFACT_DIGEST requires a valid artifact digest"
            )

    byte_length = (
        artifact_metadata.get("byteLength")
        if artifact_metadata.get("byteLength") is not None
        else artifact_metadata.get("byte_length")
    )
    if byte_length is not None:
        if isinstance(byte_length, bool):
            raise TypeError("artifact byte length must be a non-negative integer")
        try:
            byte_length = int(byte_length)
        except (TypeError, ValueError) as exc:
            raise TypeError("artifact byte length must be a non-negative integer") from exc
        if byte_length < 0:
            raise ValueError("artifact byte length must be a non-negative integer")

    sanitized_local = None
    if local_commitment:
        schema = str(local_commitment.get("schema") or "")
        if schema != LOCAL_COMMITMENT_SCHEMA:
            raise ValueError(
                f"local commitment schema must be {LOCAL_COMMITMENT_SCHEMA}"
            )
        local_digest = str(local_commitment.get("artifact_digest") or "").lower()
        if local_digest != artifact_digest:
            raise ValueError(
                "local commitment artifact digest does not match artifact metadata"
            )
        local_length = local_commitment.get("byte_length")
        if local_length is not None and byte_length is not None and int(local_length) != byte_length:
            raise ValueError(
                "local commitment byte length does not match artifact metadata"
            )
        if local_commitment.get("raw_bytes_returned") not in (False, None):
            raise ValueError("local commitment may not claim raw bytes were returned")
        if local_commitment.get("raw_bytes_persisted_by_module") not in (False, None):
            raise ValueError("local commitment may not claim raw bytes were persisted")

        sanitized_local = {
            "schema": LOCAL_COMMITMENT_SCHEMA,
            "assurance_class": L1_BROWSER_LOCAL_ARTIFACT_DIGEST,
            "digest_algorithm": "SHA-256",
            "artifact_digest": artifact_digest,
            "byte_length": byte_length,
            "media_type": local_commitment.get("media_type"),
            "last_modified_claim": local_commitment.get("last_modified_claim"),
            "hash_input": "exact-file-picker-bytes",
            "hash_execution": "browser-local",
            "execution_attestation": "client-generated-not-independently-attested",
            "network_operation_performed_by_module": False,
            "raw_bytes_returned": False,
            "raw_bytes_persisted_by_module": False,
            "best_effort_buffer_overwrite": bool(
                local_commitment.get("best_effort_buffer_overwrite", True)
            ),
            "memory_erasure_guaranteed": False,
            "does_not_establish": [
                "possession",
                "authorship",
                "authenticity",
                "identity",
                "truth",
                "trusted-time",
            ],
        }

    return {
        "artifact_digest": artifact_digest,
        "content_hash": artifact_digest,
        "commitment_assurance": assurance,
        "hash_scope": "local-browser" if artifact_digest else "unavailable",
        "byte_length": byte_length,
        "local_commitment": sanitized_local,
    }


def _normalize_manifest(payload, aperture):
    _reject_raw_content(payload)
    source_environment = str(
        payload.get("sourceEnvironment")
        or payload.get("source_environment")
        or "manual"
    ).strip() or "manual"
    source_locator = _copy_dict(
        payload.get("sourceLocator") or payload.get("source_locator")
    )
    artifact_metadata = _copy_dict(
        payload.get("artifactMetadata")
        or payload.get("artifact_metadata")
        or payload.get("metadata")
    )
    credential_reference = _copy_dict(
        payload.get("credentialReference") or payload.get("credential_reference")
    )
    privacy_boundary = _copy_dict(
        payload.get("privacyBoundary") or payload.get("privacy_boundary")
    )
    ash_posture = _copy_dict(payload.get("ashPosture") or payload.get("ash_posture"))
    commitment = _normalized_commitment(artifact_metadata)

    artifact_id = str(
        payload.get("artifactId") or artifact_metadata.get("artifactId") or ""
    ).strip()
    if not artifact_id:
        artifact_id = "ash_artifact_" + _sha256(
            {
                "source": source_environment,
                "locator": source_locator,
                "metadata": {
                    "media_type": artifact_metadata.get("mediaType")
                    or artifact_metadata.get("media_type"),
                    "byte_length": commitment["byte_length"],
                    "last_modified": artifact_metadata.get("lastModified")
                    or artifact_metadata.get("last_modified"),
                    "commitment_assurance": commitment["commitment_assurance"],
                },
            }
        )[-16:]

    manifest = {
        "schema": "td613.ash.custody-manifest/v0.5",
        "artifact_id": artifact_id,
        "source_environment": source_environment,
        "source_locator": {
            "label": source_locator.get("label"),
            "path_or_ref": source_locator.get("path_or_ref")
            or source_locator.get("path")
            or source_locator.get("ref"),
            "revision": source_locator.get("revision"),
            "commit_sha": source_locator.get("commit_sha")
            or source_locator.get("commitSha"),
            "blob_sha": source_locator.get("blob_sha")
            or source_locator.get("blobSha"),
        },
        "artifact_metadata": {
            "media_type": artifact_metadata.get("mediaType")
            or artifact_metadata.get("media_type"),
            "byte_length": commitment["byte_length"],
            "last_modified": artifact_metadata.get("lastModified")
            if artifact_metadata.get("lastModified") is not None
            else artifact_metadata.get("last_modified"),
            "artifact_digest": commitment["artifact_digest"],
            "content_hash": commitment["content_hash"],
            "commitment_assurance": commitment["commitment_assurance"],
            "hash_scope": commitment["hash_scope"],
            "local_commitment": commitment["local_commitment"],
        },
        "privacy_boundary": {
            "raw_content_exported": False,
            "raw_content_retained": False,
            "server_custody": False,
            "public_weather_only": bool(
                privacy_boundary.get("public_weather_only", True)
            ),
        },
        "credential_reference": {
            "credential_type": credential_reference.get("credentialType")
            or credential_reference.get("credential_type")
            or "none",
            "credential_secret_recorded": False,
            "identity_proof_claimed": False,
            "permission_proof_claimed": False,
        },
        "ash_posture": {
            "room_route": ash_posture.get("roomRoute")
            or ash_posture.get("room_route")
            or "private-sense-only",
            "claim_ceiling": "ash-readiness-preview-not-sensitive-intake",
            "recommended_tending": ash_posture.get("recommendedTending")
            or ash_posture.get("recommended_tending")
            or ["ash-receipt", "safe-harbor-buffer"],
        },
        "replay": {
            "eligible": True,
            "mode": "custody-replay-without-content",
            "raw_replay_available": False,
        },
        "aperture": aperture,
    }
    return manifest


def _ash_custody_register(payload, aperture):
    manifest = _normalize_manifest(payload, aperture)
    assurance = _copy_dict(manifest.get("artifact_metadata")).get(
        "commitment_assurance", L0_METADATA_ONLY
    )
    receipt = {
        "schema": "td613.ash.custody-receipt/v0.5",
        "receipt_id": "ashc_" + _sha256(manifest)[-20:],
        "created_at": _now(),
        "domeWorldVersion": DOME_WORLD_VERSION,
        "assurance_class": assurance,
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
            if assurance == L1_BROWSER_LOCAL_ARTIFACT_DIGEST
            else "artifact-registered-as-metadata-only-custody-event"
        ),
        "claimCeiling": "ash-custody-receipt-not-content-custody-or-permission-proof",
        "seal": "⟐",
    }
    return receipt


def _ash_custody_replay(payload, aperture):
    _reject_raw_content(payload)
    receipt = _copy_dict(payload.get("receipt"))
    manifest = _copy_dict(payload.get("manifest")) or _copy_dict(
        receipt.get("manifest")
    )
    if not manifest:
        raise ValueError("ash-custody-replay requires a custody receipt or manifest")
    artifact_metadata = _copy_dict(manifest.get("artifact_metadata"))
    return {
        "status": "OPEN",
        "schema": "td613.ash.custody-replay/v0.5",
        "aperture": aperture,
        "receipt_id": receipt.get("receipt_id"),
        "artifact_id": manifest.get("artifact_id"),
        "source_environment": manifest.get("source_environment"),
        "artifact_digest": artifact_metadata.get("artifact_digest")
        or artifact_metadata.get("content_hash"),
        "content_hash": artifact_metadata.get("content_hash"),
        "commitment_assurance": artifact_metadata.get(
            "commitment_assurance", L0_METADATA_ONLY
        ),
        "route": _copy_dict(manifest.get("ash_posture")).get("room_route"),
        "privacy_boundary": manifest.get("privacy_boundary"),
        "replay_mode": "custody-replay-without-content",
        "raw_replay_available": False,
        "decision": "replayed-custody-state-without-rehydrating-raw-content",
        "claimCeiling": "ash-custody-replay-not-fresh-execution-or-content-access",
    }


def _extract_manifest(receipt):
    source = receipt if isinstance(receipt, dict) else {}
    return _copy_dict(source.get("manifest")) or source


def _phason_custody_diff(payload, aperture):
    previous = _extract_manifest(
        payload.get("previousReceipt") or payload.get("previous") or {}
    )
    current = _extract_manifest(
        payload.get("currentReceipt") or payload.get("current") or {}
    )
    if not previous or not current:
        raise ValueError(
            "phason-custody-diff requires previous/current custody receipts or manifests"
        )
    prev_meta = _copy_dict(previous.get("artifact_metadata"))
    curr_meta = _copy_dict(current.get("artifact_metadata"))
    prev_privacy = _copy_dict(previous.get("privacy_boundary"))
    curr_privacy = _copy_dict(current.get("privacy_boundary"))
    prev_cred = _copy_dict(previous.get("credential_reference"))
    curr_cred = _copy_dict(current.get("credential_reference"))
    prev_posture = _copy_dict(previous.get("ash_posture"))
    curr_posture = _copy_dict(current.get("ash_posture"))

    prev_digest = prev_meta.get("artifact_digest") or prev_meta.get("content_hash")
    curr_digest = curr_meta.get("artifact_digest") or curr_meta.get("content_hash")
    content_invariant = bool(prev_digest and prev_digest == curr_digest)
    changed_fields = []
    comparisons = {
        "source_environment": (
            previous.get("source_environment"),
            current.get("source_environment"),
        ),
        "source_locator": (
            previous.get("source_locator"),
            current.get("source_locator"),
        ),
        "credential_type": (
            prev_cred.get("credential_type"),
            curr_cred.get("credential_type"),
        ),
        "room_route": (
            prev_posture.get("room_route"),
            curr_posture.get("room_route"),
        ),
        "privacy_boundary": (prev_privacy, curr_privacy),
        "claim_ceiling": (
            prev_posture.get("claim_ceiling"),
            curr_posture.get("claim_ceiling"),
        ),
        "commitment_assurance": (
            prev_meta.get("commitment_assurance"),
            curr_meta.get("commitment_assurance"),
        ),
    }
    for key, (before, after) in comparisons.items():
        if before != after:
            changed_fields.append(key)
    projection_changed = bool(changed_fields)
    return {
        "status": (
            "SEAM_DETECTED"
            if content_invariant and projection_changed
            else "OPEN"
        ),
        "schema": "td613.phason.custody-diff/v0.5",
        "aperture": aperture,
        "content_invariant": content_invariant,
        "projection_changed": projection_changed,
        "custody_changed": any(
            key in changed_fields
            for key in {
                "source_locator",
                "credential_type",
                "privacy_boundary",
            }
        ),
        "changed_fields": changed_fields,
        "previous_artifact_id": previous.get("artifact_id"),
        "current_artifact_id": current.get("artifact_id"),
        "decision": (
            "content-invariant-custody-variable-projection-event"
            if content_invariant and projection_changed
            else "custody-diff-recorded-without-external-enforcement"
        ),
        "claimCeiling": "phason-custody-diff-not-external-enforcement-or-permission-proof",
    }


def _receipt_index(payload, aperture):
    _reject_raw_content(payload)
    receipts = (
        payload.get("receipts")
        if isinstance(payload.get("receipts"), list)
        else []
    )
    rows = []
    for receipt in receipts[:50]:
        if not isinstance(receipt, dict):
            continue
        schema = str(receipt.get("schema", "unknown"))
        station = (
            "ash"
            if ".ash." in schema
            else "phason"
            if ".phason." in schema
            else "substrate"
            if "exact" in schema
            else "aperture"
            if "aperture" in schema
            else "world"
        )
        rows.append(
            {
                "receipt_id": receipt.get("receipt_id")
                or receipt.get("traceId"),
                "schema": schema,
                "station": station,
                "claimCeiling": receipt.get("claimCeiling")
                or receipt.get("claim_ceiling"),
                "export": "compact-reference-only",
            }
        )
    return {
        "status": "OPEN",
        "schema": "td613.dome.receipt-index/v0.5",
        "aperture": aperture,
        "count": len(rows),
        "receipts": rows,
        "decision": "indexed-cross-station-receipts-without-taking-custody",
        "claimCeiling": "receipt-index-not-custody-owner-or-universal-authority",
    }


def dispatch_post(envelope, headers):
    if not isinstance(envelope, dict):
        raise ValueError("request body must be a JSON object")
    operation = str(envelope.get("operation", "")).strip()
    if operation not in POST_OPERATIONS:
        raise ValueError("unsupported or missing operation")
    trace_id = str(envelope.get("traceId", "")).strip() or secrets.token_hex(8)
    payload = (
        envelope.get("payload")
        if isinstance(envelope.get("payload"), dict)
        else {}
    )
    aperture = _aperture_context(envelope.get("apertureContext"))

    if operation == "aperture-bridge":
        result = _bridge(payload, aperture)
    elif operation == "phason-gate":
        result = _phason(payload, aperture)
    elif operation == "ash-readiness":
        result = _ash(payload, aperture)
    elif operation == "ash-custody-register":
        result = _ash_custody_register(payload, aperture)
    elif operation == "ash-custody-replay":
        result = _ash_custody_replay(payload, aperture)
    elif operation == "phason-custody-diff":
        result = _phason_custody_diff(payload, aperture)
    elif operation == "receipt-index":
        result = _receipt_index(payload, aperture)
    elif operation in ASH_V06_OPERATIONS:
        result = dispatch_ash_v06(
            operation,
            payload,
            aperture,
            _reject_raw_content,
            _sha256,
            _now,
        )
    elif operation == "exact-capture":
        result = exact_capture(payload)
    elif operation == "exact-closure":
        result = exact_closure(payload)
    else:
        if os.getenv("DOME_WORLD_TRAINER_ENABLED") != "1":
            raise PermissionError("trainer is disabled")
        expected_token = os.getenv("DOME_WORLD_OPERATOR_TOKEN", "")
        supplied = str(headers.get("authorization", ""))
        if not expected_token or not secrets.compare_digest(
            supplied, f"Bearer {expected_token}"
        ):
            raise PermissionError("trainer operator token is invalid")
        signing_secret = os.getenv("DOME_WORLD_CHECKPOINT_SECRET", "")
        if not signing_secret:
            raise RuntimeError("checkpoint signing secret is not configured")
        action = str(payload.get("action", "propose"))
        result = (
            trainer_confirm(payload, signing_secret)
            if action == "confirm"
            else trainer_propose(payload, signing_secret)
        )

    return {
        "ok": True,
        "operation": operation,
        "traceId": trace_id,
        "apertureContext": aperture,
        "result": result,
        "claimCeiling": result.get(
            "claimCeiling",
            result.get("claim_ceiling", CLAIM_CEILING),
        ),
    }


class handler(BaseHTTPRequestHandler):
    def _headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-TD613-Dome-World", DOME_WORLD_VERSION)
        self.send_header("Vary", "Origin")
        origin = self.headers.get("Origin", "")
        host = self.headers.get("Host", "")
        if origin and urlparse(origin).netloc == host:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()

    def _write(self, status, payload):
        self._headers(status)
        self.wfile.write(
            json.dumps(
                payload,
                separators=(",", ":"),
                ensure_ascii=True,
            ).encode("utf-8")
        )

    def do_OPTIONS(self):
        self._headers(204)

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        operation = query.get("operation", ["readiness"])[0]
        if operation == "step2-readiness":
            operation = "readiness"
        if operation not in {"ping", "readiness"}:
            self._write(
                405,
                {"ok": False, "error": "GET supports ping/readiness only"},
            )
            return
        payload = readiness_receipt()
        payload["operation"] = operation
        self._write(200, payload)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError(
                    "request body must be between 1 and 131072 bytes"
                )
            envelope = json.loads(self.rfile.read(length))
            self._write(
                200,
                dispatch_post(
                    envelope,
                    {
                        key.lower(): value
                        for key, value in self.headers.items()
                    },
                ),
            )
        except PermissionError as exc:
            self._write(403, {"ok": False, "error": str(exc)})
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self._write(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write(
                500,
                {
                    "ok": False,
                    "error": "dome-world operation failed",
                    "detail": str(exc),
                },
            )
