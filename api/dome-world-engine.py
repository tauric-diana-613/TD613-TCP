"""Single bounded Vercel function for Dome-World v0.4.3 operations."""

from __future__ import annotations

import json
import os
import secrets
import sys
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

MAX_BODY_BYTES = 131_072
POST_OPERATIONS = {
    "aperture-bridge",
    "phason-gate",
    "ash-readiness",
    "exact-capture",
    "exact-closure",
    "trainer-step",
}


def _aperture_context(value):
    source = value if isinstance(value, dict) else {}
    return {
        "version": APERTURE_VERSION,
        "schema": APERTURE_SCHEMA,
        "feature": "v2.9.4-sigma-dynamical-instrument",
        "doctrine": "td613.aperture.doctrine-kernel/v2.9.4",
        "bridge": "td613.aperture.dome-flowcore-bridge/v2.9.4",
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
        "schema": "td613.aperture.dome-flowcore-route-weather/v2.9.4",
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
    forbidden = {"text", "rawText", "content", "document", "body", "sensitiveText"}
    present = sorted(key for key in forbidden if payload.get(key))
    if present:
        raise ValueError("Ash readiness accepts metadata only; raw content fields are prohibited")
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


def dispatch_post(envelope, headers):
    if not isinstance(envelope, dict):
        raise ValueError("request body must be a JSON object")
    operation = str(envelope.get("operation", "")).strip()
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
    elif operation == "exact-capture":
        result = exact_capture(payload)
    elif operation == "exact-closure":
        result = exact_closure(payload)
    else:
        if os.getenv("DOME_WORLD_TRAINER_ENABLED") != "1":
            raise PermissionError("trainer is disabled")
        expected_token = os.getenv("DOME_WORLD_OPERATOR_TOKEN", "")
        supplied = str(headers.get("authorization", ""))
        if not expected_token or not secrets.compare_digest(supplied, f"Bearer {expected_token}"):
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
        "claimCeiling": result.get("claimCeiling", CLAIM_CEILING),
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
        self.wfile.write(json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8"))

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
            self._write(200, dispatch_post(envelope, {key.lower(): value for key, value in self.headers.items()}))
        except PermissionError as exc:
            self._write(403, {"ok": False, "error": str(exc)})
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self._write(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write(500, {"ok": False, "error": "dome-world operation failed", "detail": str(exc)})
