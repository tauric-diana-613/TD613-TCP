"""Single bounded Vercel function for Dome-World v0.5.0 cockpit operations.

Phase 1 Ash custody registration and replay are intentionally excluded from this
legacy engine. Those operations are owned exclusively by
``api/ash-local-commitment.py`` so direct-engine calls cannot bypass L0/L1
validation or revive metadata-derived artifact digests.
"""

from __future__ import annotations

import hashlib
import json
import os
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
from packages.dome_world_exact.ash_v06 import (  # noqa: E402
    ASH_V06_OPERATIONS,
    dispatch_ash_v06,
)

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
    "fragment",
    "candidateFragment",
}
PHASE1_CUSTODY_OPERATIONS = {
    "ash-custody-register",
    "ash-custody-replay",
}
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
            "Ash custody accepts metadata/manifests only; raw content fields are prohibited: "
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
        "delegatedOperations": {
            "ash-local-commitment-v0.7": sorted(PHASE1_CUSTODY_OPERATIONS),
        },
        "trainerEnabled": os.getenv("DOME_WORLD_TRAINER_ENABLED") == "1",
        "storage": "client-held-signed-checkpoints",
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


def _extract_manifest(receipt):
    source = receipt if isinstance(receipt, dict) else {}
    return _copy_dict(source.get("manifest")) or source


def _phason_custody_diff(payload, aperture):
    previous = _extract_manifest(payload.get("previousReceipt") or payload.get("previous") or {})
    current = _extract_manifest(payload.get("currentReceipt") or payload.get("current") or {})
    if not previous or not current:
        raise ValueError("phason-custody-diff requires previous/current custody receipts or manifests")
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
    }
    for key, (before, after) in comparisons.items():
        if before != after:
            changed_fields.append(key)
    projection_changed = bool(changed_fields)
    return {
        "status": "SEAM_DETECTED" if content_invariant and projection_changed else "OPEN",
        "schema": "td613.phason.custody-diff/v0.5",
        "aperture": aperture,
        "content_invariant": content_invariant,
        "projection_changed": projection_changed,
        "custody_changed": any(
            key in changed_fields
            for key in {"source_locator", "credential_type", "privacy_boundary"}
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
    receipts = payload.get("receipts") if isinstance(payload.get("receipts"), list) else []
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
                "receipt_id": receipt.get("receipt_id") or receipt.get("traceId"),
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
    if operation in PHASE1_CUSTODY_OPERATIONS:
        raise ValueError(
            "Phase 1 custody registration/replay is owned exclusively by "
            "api/ash-local-commitment.py"
        )
    if operation not in POST_OPERATIONS:
        raise ValueError("unsupported or missing operation")
    trace_id = str(envelope.get("traceId", "")).strip() or secrets.token_hex(8)
    payload = envelope.get("payload") if isinstance(envelope.get("payload"), dict) else {}
    aperture = _aperture_context(envelope.get("apertureContext"))

    if operation == "aperture-bridge":
        result = _bridge(payload, aperture)
    elif operation == "phason-gate":
        result = _phason(payload, aperture)
    elif operation == "ash-readiness":
        result = _ash(payload, aperture)
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
            supplied,
            f"Bearer {expected_token}",
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
            json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
        )

    def do_OPTIONS(self):
        self._headers(204)

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        operation = query.get("operation", ["readiness"])[0]
        if operation == "step2-readiness":
            operation = "readiness"
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
            self._write(
                200,
                dispatch_post(
                    envelope,
                    {key.lower(): value for key, value in self.headers.items()},
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
