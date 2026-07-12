"""Public guard for the bounded Dome-World and Flow-Core API surface.

The legacy engine remains available as an internal implementation for non-custody
operations. Public custody operations are rejected here and owned exclusively by
the Ash Local Commitment endpoint. Phase III context instrumentation shares this
already-bounded function without entering the legacy engine operation registry.
"""

from __future__ import annotations

import importlib.util
import json
import os
import secrets
from functools import lru_cache
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

from packages.dome_world_exact.flowcore_context import (
    OPERATION as FLOWCORE_CONTEXT_OPERATION,
    instrument_context,
    readiness_receipt as flowcore_readiness_receipt,
)

MAX_BODY_BYTES = 131_072
DELEGATED_CUSTODY_OPERATIONS = {
    "ash-custody-register",
    "ash-custody-replay",
    "ash-custody-migrate",
}
FLOWCORE_READINESS_OPERATIONS = {"flowcore-context", "flowcore-readiness"}


@lru_cache(maxsize=1)
def _engine():
    path = os.path.join(os.path.dirname(__file__), "dome-world-engine.py")
    spec = importlib.util.spec_from_file_location("td613_dome_world_engine_internal", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load internal Dome-World engine")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_envelope(envelope):
    if not isinstance(envelope, dict):
        raise ValueError("request body must be a JSON object")
    operation = str(envelope.get("operation", "")).strip()
    if operation in DELEGATED_CUSTODY_OPERATIONS:
        raise ValueError(
            "Ash custody operations are owned exclusively by "
            "api/ash-local-commitment-guard.py"
        )
    return envelope


def _flowcore_aperture_context(value):
    source = value if isinstance(value, dict) else {}
    return {
        "version": source.get("version", "v3.0-alpha"),
        "schema": source.get("schema", "td613-aperture/v3.0-alpha"),
        "observedRegime": source.get("observedRegime", "PRCS-A"),
        "bridgePosture": "reciprocal_receipts_without_reciprocal_authority",
    }


def dispatch_guarded_post(envelope, headers=None):
    envelope = validate_envelope(envelope)
    operation = str(envelope.get("operation", "")).strip()
    if operation == FLOWCORE_CONTEXT_OPERATION:
        payload = envelope.get("payload") if isinstance(envelope.get("payload"), dict) else {}
        aperture = _flowcore_aperture_context(envelope.get("apertureContext"))
        return {
            "ok": True,
            "operation": operation,
            "traceId": str(envelope.get("traceId", "")).strip() or secrets.token_hex(8),
            "apertureContext": aperture,
            "result": instrument_context(payload, aperture),
        }
    return _engine().dispatch_post(envelope, headers or {})


def guarded_readiness_receipt(operation="readiness"):
    payload = dict(_engine().readiness_receipt())
    payload["operations"] = [
        item
        for item in payload.get("operations", [])
        if item not in DELEGATED_CUSTODY_OPERATIONS
    ]
    payload["operation"] = operation
    payload["custodyRoute"] = "isolated-local-commitment-endpoint"
    payload["delegatedCustodyOperations"] = sorted(DELEGATED_CUSTODY_OPERATIONS)
    payload["metadataDigestFallbackOnPublicCustodyRoute"] = False
    payload.setdefault("delegatedOperations", {})["flowcore-context-v0.1"] = [
        FLOWCORE_CONTEXT_OPERATION
    ]
    payload["flowCoreContextRoute"] = "shared-bounded-dome-guard"
    return payload


class handler(BaseHTTPRequestHandler):
    def _headers(self, status=200, flowcore=False):
        engine = _engine()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-TD613-Dome-World", engine.DOME_WORLD_VERSION)
        self.send_header("X-TD613-Custody-Route", "isolated")
        if flowcore:
            self.send_header("X-TD613-Flow-Core", "phase-3")
        self.send_header("Vary", "Origin")
        origin = self.headers.get("Origin", "")
        host = self.headers.get("Host", "")
        if origin and urlparse(origin).netloc == host:
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()

    def _write(self, status, payload, flowcore=False):
        self._headers(status, flowcore=flowcore)
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
        if operation in FLOWCORE_READINESS_OPERATIONS:
            payload = flowcore_readiness_receipt()
            payload["operation"] = "readiness"
            self._write(200, payload, flowcore=True)
            return
        if operation not in {"ping", "readiness"}:
            self._write(405, {"ok": False, "error": "GET supports ping/readiness only"})
            return
        self._write(200, guarded_readiness_receipt(operation))

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("request body must be between 1 and 131072 bytes")
            envelope = json.loads(self.rfile.read(length))
            headers = {key.lower(): value for key, value in self.headers.items()}
            flowcore = str(envelope.get("operation", "")).strip() == FLOWCORE_CONTEXT_OPERATION
            self._write(200, dispatch_guarded_post(envelope, headers), flowcore=flowcore)
        except PermissionError as exc:
            self._write(403, {"ok": False, "error": str(exc)})
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self._write(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write(
                500,
                {
                    "ok": False,
                    "error": "dome-world guarded operation failed",
                    "detail": str(exc),
                },
            )
