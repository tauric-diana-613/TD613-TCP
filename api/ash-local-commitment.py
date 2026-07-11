"""TD613 Ash Local Commitment v0.7 bounded Vercel function.

This function owns only Phase 1 custody registration and replay. It accepts
metadata plus an optional browser-generated SHA-256 commitment. Raw artifact
bytes are prohibited, and L0 metadata-only registration never synthesizes an
artifact digest.
"""

from __future__ import annotations

import hashlib
import json
import secrets
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import re

MAX_BODY_BYTES = 131_072
LOCAL_SCHEMA = "td613.ash.local-commitment/v0.7"
MANIFEST_SCHEMA = "td613.ash.custody-manifest/v0.7"
RECEIPT_SCHEMA = "td613.ash.custody-receipt/v0.7"
L0_ASSURANCE = "L0_METADATA_ONLY"
L1_ASSURANCE = "L1_BROWSER_LOCAL_ARTIFACT_DIGEST"
SUPPORTED_OPERATIONS = {"ash-custody-register", "ash-custody-replay"}
RAW_CONTENT_KEYS = {
    "text", "rawText", "content", "document", "body", "sensitiveText",
    "rawBytes", "fileBytes", "fileContent",
}
SHA256_RE = re.compile(r"^sha256:[0-9a-f]{64}$")


def _now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _stable_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def _sha256(value):
    data = value if isinstance(value, bytes) else _stable_json(value).encode("utf-8")
    return "sha256:" + hashlib.sha256(data).hexdigest()


def _copy_dict(value):
    return value if isinstance(value, dict) else {}


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
            "Ash custody accepts metadata/manifests only; raw content fields are prohibited: "
            + ", ".join(sorted(present))
        )


def _aperture_context(value):
    source = value if isinstance(value, dict) else {}
    return {
        "version": "v3.0-alpha",
        "schema": "td613-aperture/v3.0-alpha",
        "feature": "v3.0-alpha-anti-epistemicide-research-runtime",
        "observedRegime": source.get("observedRegime", "PRCS-A"),
        "operationalState": "interface_context",
        "claimAuthority": "design_signal",
    }


def _normalized_digest(value):
    if value in (None, ""):
        return None
    digest = str(value).strip().lower()
    if not SHA256_RE.fullmatch(digest):
        raise ValueError(
            "artifact digest must be sha256 followed by 64 lowercase hexadecimal characters"
        )
    return digest


def _normalize_local_commitment(artifact_metadata):
    local = _copy_dict(
        artifact_metadata.get("localCommitment")
        or artifact_metadata.get("local_commitment")
    )
    requested_assurance = str(
        artifact_metadata.get("assuranceClass")
        or artifact_metadata.get("assurance_class")
        or local.get("assurance_class")
        or L0_ASSURANCE
    ).strip()
    digest = _normalized_digest(
        artifact_metadata.get("artifactDigest")
        or artifact_metadata.get("artifact_digest")
        or artifact_metadata.get("contentHash")
        or artifact_metadata.get("content_hash")
        or local.get("artifact_digest")
    )

    if requested_assurance == L1_ASSURANCE:
        if local.get("schema") != LOCAL_SCHEMA:
            raise ValueError(f"L1 browser-local assurance requires {LOCAL_SCHEMA}")
        if local.get("assurance_class") != L1_ASSURANCE:
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
            "assurance_class": L1_ASSURANCE,
            "artifact_digest": digest,
            "execution_attestation": "client-generated-not-independently-attested",
            "local_commitment": {
                "schema": LOCAL_SCHEMA,
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

    if requested_assurance not in {L0_ASSURANCE, ""}:
        raise ValueError("unsupported Ash commitment assurance class")
    if digest is not None:
        raise ValueError("L0 metadata-only registration may not carry an artifact digest")
    return {
        "assurance_class": L0_ASSURANCE,
        "artifact_digest": None,
        "execution_attestation": "no-byte-commitment-supplied",
        "local_commitment": None,
    }


def _normalize_manifest(payload, aperture):
    _reject_raw_content(payload)
    source_environment = str(
        payload.get("sourceEnvironment")
        or payload.get("source_environment")
        or "manual"
    ).strip() or "manual"
    source_locator = _copy_dict(payload.get("sourceLocator") or payload.get("source_locator"))
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
    commitment = _normalize_local_commitment(artifact_metadata)

    artifact_id = str(
        payload.get("artifactId") or artifact_metadata.get("artifactId") or ""
    ).strip()
    if not artifact_id:
        basis = (
            {"artifact_digest": commitment["artifact_digest"]}
            if commitment["artifact_digest"]
            else {
                "source": source_environment,
                "locator": source_locator,
                "metadata": {
                    "media_type": artifact_metadata.get("mediaType")
                    or artifact_metadata.get("media_type"),
                    "byte_length": artifact_metadata.get("byteLength")
                    or artifact_metadata.get("byte_length"),
                    "last_modified_claim": artifact_metadata.get("lastModified")
                    or artifact_metadata.get("last_modified"),
                },
            }
        )
        artifact_id = "ash_artifact_" + _sha256(basis)[-16:]

    artifact_digest = commitment["artifact_digest"]
    return {
        "schema": MANIFEST_SCHEMA,
        "artifact_id": artifact_id,
        "artifact_id_basis": (
            "artifact-digest-derived" if artifact_digest else "metadata-route-derived"
        ),
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
            "byte_length": artifact_metadata.get("byteLength")
            or artifact_metadata.get("byte_length"),
            "last_modified_claim": artifact_metadata.get("lastModified")
            or artifact_metadata.get("last_modified"),
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


def _register(payload, aperture):
    manifest = _normalize_manifest(payload, aperture)
    assurance = manifest["artifact_metadata"]["assurance_class"]
    return {
        "schema": RECEIPT_SCHEMA,
        "receipt_id": "ashc_" + _sha256(manifest)[-20:],
        "created_at": _now(),
        "domeWorldVersion": "v0.5.0",
        "assurance_class": assurance,
        "artifact_digest_present": bool(
            manifest["artifact_metadata"]["artifact_digest"]
        ),
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
            if assurance == L1_ASSURANCE
            else "artifact-registered-as-metadata-only-custody-event"
        ),
        "claimCeiling": "ash-custody-receipt-not-content-custody-or-permission-proof",
        "seal": "⟐",
    }


def _replay(payload, aperture):
    _reject_raw_content(payload)
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
        "assurance_class": metadata.get("assurance_class", L0_ASSURANCE),
        "route": _copy_dict(manifest.get("ash_posture")).get("room_route"),
        "privacy_boundary": manifest.get("privacy_boundary"),
        "replay_mode": "custody-replay-without-content",
        "raw_replay_available": False,
        "decision": "replayed-custody-state-without-rehydrating-raw-content",
        "claimCeiling": "ash-custody-replay-not-fresh-execution-or-content-access",
    }


def readiness_receipt():
    return {
        "ok": True,
        "schema": "td613.ash.local-commitment-readiness/v0.7",
        "operations": sorted(SUPPORTED_OPERATIONS),
        "status": "phase-1-active",
        "assuranceClasses": [L0_ASSURANCE, L1_ASSURANCE],
        "rawBytesAcceptedByServer": False,
        "metadataDigestFallback": False,
    }


def dispatch_post(envelope, headers=None):
    if not isinstance(envelope, dict):
        raise ValueError("request body must be a JSON object")
    operation = str(envelope.get("operation", "")).strip()
    if operation not in SUPPORTED_OPERATIONS:
        raise ValueError("unsupported or missing operation")
    payload = envelope.get("payload") if isinstance(envelope.get("payload"), dict) else {}
    aperture = _aperture_context(envelope.get("apertureContext"))
    result = _register(payload, aperture) if operation == "ash-custody-register" else _replay(payload, aperture)
    return {
        "ok": True,
        "operation": operation,
        "traceId": str(envelope.get("traceId", "")).strip() or secrets.token_hex(8),
        "apertureContext": aperture,
        "result": result,
        "claimCeiling": result.get("claimCeiling"),
    }


class handler(BaseHTTPRequestHandler):
    def _headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-TD613-Ash-Commitment", "v0.7")
        self.send_header("Vary", "Origin")
        origin = self.headers.get("Origin", "")
        host = self.headers.get("Host", "")
        if origin and urlparse(origin).netloc == host:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()

    def _write(self, status, payload):
        self._headers(status)
        self.wfile.write(
            json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
        )

    def do_OPTIONS(self):
        self._headers(204)

    def do_GET(self):
        operation = parse_qs(urlparse(self.path).query).get("operation", ["readiness"])[0]
        if operation not in {"ping", "readiness"}:
            self._write(405, {"ok": False, "error": "GET supports ping/readiness only"})
            return
        payload = readiness_receipt()
        payload["operation"] = operation
        self._write(200, payload)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("request body must be between 1 and 131072 bytes")
            envelope = json.loads(self.rfile.read(length))
            self._write(200, dispatch_post(envelope))
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self._write(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write(
                500,
                {
                    "ok": False,
                    "error": "Ash local commitment operation failed",
                    "detail": str(exc),
                },
            )
