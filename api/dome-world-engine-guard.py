"""Public guard for the legacy Dome-World engine.

The legacy engine remains available as an internal implementation for non-custody
operations. Public custody registration and replay are rejected here and owned
exclusively by the Ash Local Commitment endpoint.
"""

from __future__ import annotations

import importlib.util
import json
import os
from functools import lru_cache
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

MAX_BODY_BYTES = 131_072
LEGACY_CUSTODY_OPERATIONS = {
    "ash-custody-register",
    "ash-custody-replay",
}


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
    if operation in LEGACY_CUSTODY_OPERATIONS:
        raise ValueError(
            "Ash custody registration/replay is owned exclusively by "
            "api/ash-local-commitment-guard.py"
        )
    return envelope


def guarded_readiness_receipt(operation="readiness"):
    payload = dict(_engine().readiness_receipt())
    payload["operations"] = [
        item
        for item in payload.get("operations", [])
        if item not in LEGACY_CUSTODY_OPERATIONS
    ]
    payload["operation"] = operation
    payload["custodyRoute"] = "isolated-local-commitment-endpoint"
    payload["delegatedCustodyOperations"] = sorted(LEGACY_CUSTODY_OPERATIONS)
    payload["metadataDigestFallbackOnPublicCustodyRoute"] = False
    return payload


class handler(BaseHTTPRequestHandler):
    def _headers(self, status=200):
        engine = _engine()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-TD613-Dome-World", engine.DOME_WORLD_VERSION)
        self.send_header("X-TD613-Custody-Route", "isolated")
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
        self._write(200, guarded_readiness_receipt(operation))

    def do_POST(self):
        engine = _engine()
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("request body must be between 1 and 131072 bytes")
            envelope = validate_envelope(json.loads(self.rfile.read(length)))
            headers = {key.lower(): value for key, value in self.headers.items()}
            self._write(200, engine.dispatch_post(envelope, headers))
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
