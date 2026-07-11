"""Public validation guard for TD613 Ash Local Commitment v0.7.

The internal commitment function performs normalization and receipt production.
This guard rejects contradictory L1 client boundary assertions before the
internal function can normalize them into safer values.
"""

from __future__ import annotations

import importlib.util
import json
import os
from functools import lru_cache
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

MAX_BODY_BYTES = 131_072


@lru_cache(maxsize=1)
def _commitment():
    path = os.path.join(os.path.dirname(__file__), "ash-local-commitment.py")
    spec = importlib.util.spec_from_file_location("td613_ash_local_commitment_internal", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load internal Ash commitment function")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _dict(value):
    return value if isinstance(value, dict) else {}


def validate_l1_boundary_flags(envelope):
    if not isinstance(envelope, dict):
        raise ValueError("request body must be a JSON object")
    if str(envelope.get("operation", "")).strip() != "ash-custody-register":
        return envelope

    payload = _dict(envelope.get("payload"))
    metadata = _dict(
        payload.get("artifactMetadata")
        or payload.get("artifact_metadata")
        or payload.get("metadata")
    )
    local = _dict(
        metadata.get("localCommitment")
        or metadata.get("local_commitment")
    )
    requested_assurance = str(
        metadata.get("assuranceClass")
        or metadata.get("assurance_class")
        or local.get("assurance_class")
        or ""
    ).strip()
    digest_present = bool(
        metadata.get("artifactDigest")
        or metadata.get("artifact_digest")
        or metadata.get("contentHash")
        or metadata.get("content_hash")
        or local.get("artifact_digest")
    )
    is_l1 = requested_assurance == "L1_BROWSER_LOCAL_ARTIFACT_DIGEST" or digest_present
    if not is_l1:
        return envelope

    if local.get("network_operation_performed_by_module") is not False:
        raise ValueError(
            "L1 local commitment must declare "
            "network_operation_performed_by_module=false"
        )
    if local.get("raw_bytes_persisted_by_module") is not False:
        raise ValueError(
            "L1 local commitment must declare "
            "raw_bytes_persisted_by_module=false"
        )
    return envelope


class handler(BaseHTTPRequestHandler):
    def _headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-TD613-Ash-Commitment", "v0.7-guarded")
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
        commitment = _commitment()
        operation = parse_qs(urlparse(self.path).query).get("operation", ["readiness"])[0]
        if operation not in {"ping", "readiness"}:
            self._write(405, {"ok": False, "error": "GET supports ping/readiness only"})
            return
        payload = commitment.readiness_receipt()
        payload["operation"] = operation
        payload["boundaryGuard"] = "contradictory-l1-flags-rejected"
        self._write(200, payload)

    def do_POST(self):
        commitment = _commitment()
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("request body must be between 1 and 131072 bytes")
            envelope = validate_l1_boundary_flags(json.loads(self.rfile.read(length)))
            self._write(200, commitment.dispatch_post(envelope))
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self._write(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write(
                500,
                {
                    "ok": False,
                    "error": "Ash guarded commitment operation failed",
                    "detail": str(exc),
                },
            )
