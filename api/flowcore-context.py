"""Vercel boundary for TD613 Flow-Core Phase III context instrumentation."""
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

from packages.dome_world_exact.flowcore_context import (  # noqa: E402
    OPERATION,
    instrument_context,
    readiness_receipt,
)

MAX_BODY_BYTES = 131_072


def _aperture_context(value):
    source = value if isinstance(value, dict) else {}
    return {
        "version": source.get("version", "v3.0-alpha"),
        "schema": source.get("schema", "td613-aperture/v3.0-alpha"),
        "observedRegime": source.get("observedRegime", "PRCS-A"),
        "bridgePosture": "reciprocal_receipts_without_reciprocal_authority",
    }


def dispatch_post(envelope):
    if not isinstance(envelope, dict):
        raise ValueError("request body must be a JSON object")
    operation = str(envelope.get("operation", "")).strip()
    if operation != OPERATION:
        raise ValueError("unsupported or missing operation")
    payload = envelope.get("payload") if isinstance(envelope.get("payload"), dict) else {}
    aperture = _aperture_context(envelope.get("apertureContext"))
    return {
        "ok": True,
        "operation": operation,
        "traceId": str(envelope.get("traceId", "")).strip() or secrets.token_hex(8),
        "apertureContext": aperture,
        "result": instrument_context(payload, aperture),
    }


class handler(BaseHTTPRequestHandler):
    def _headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-TD613-Flow-Core", "phase-3")
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
            self._write(200, dispatch_post(json.loads(self.rfile.read(length))))
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self._write(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write(
                500,
                {
                    "ok": False,
                    "error": "Flow-Core context instrumentation failed",
                    "detail": str(exc),
                },
            )
