#!/usr/bin/env python3
"""Serve the Phase IV lab and guarded bridge for CI integration checks.

This is a test harness, not a deployed serverless function. It imports the same
shared guard used by Vercel and serves the committed browser modules from
``app/`` so API, replay, persistence, and responsive-layout probes can run
against one origin without weakening preview deployment protection.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import mimetypes
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
API_PATH = ROOT / "api" / "dome-world-engine-guard.py"
SPEC = importlib.util.spec_from_file_location("td613_phase4_local_guard", API_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("unable to load Phase IV shared guard")
GUARD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GUARD)

MAX_BODY_BYTES = 131_072


def _static_target(raw_path: str) -> Path | None:
    path = unquote(urlparse(raw_path).path)
    if path in {"", "/"}:
        path = "/dome-world/reciprocal-bridge.html"
    if path == "/dome-world":
        path = "/dome-world/index.html"

    relative = path.lstrip("/")
    target = ROOT / relative if relative.startswith("app/") else ROOT / "app" / relative
    try:
        resolved = target.resolve()
        resolved.relative_to(ROOT.resolve())
    except (ValueError, OSError):
        return None
    if resolved.is_dir():
        resolved = resolved / "index.html"
    return resolved if resolved.is_file() else None


class Phase4Handler(BaseHTTPRequestHandler):
    server_version = "TD613Phase4Integration/0.1"

    def log_message(self, fmt: str, *args: object) -> None:
        if os.getenv("TD613_PHASE4_SERVER_LOG") == "1":
            super().log_message(fmt, *args)

    def _headers(self, status: int, content_type: str, length: int) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(length))
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-TD613-Integration-Harness", "phase-4")
        self.end_headers()

    def _empty(self, status: int = 204) -> None:
        self._headers(status, "image/x-icon", 0)

    def _json(self, status: int, payload: object) -> None:
        data = json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
        self._headers(status, "application/json; charset=utf-8", len(data))
        if self.command != "HEAD":
            self.wfile.write(data)

    def _static(self) -> None:
        target = _static_target(self.path)
        if target is None:
            self._json(404, {"ok": False, "error": "static resource not found"})
            return
        data = target.read_bytes()
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in {
            "application/javascript",
            "application/json",
            "image/svg+xml",
        }:
            content_type += "; charset=utf-8"
        self._headers(200, content_type, len(data))
        if self.command != "HEAD":
            self.wfile.write(data)

    def do_HEAD(self) -> None:  # noqa: N802
        self.do_GET()

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/favicon.ico":
            self._empty()
            return
        if path == "/api/aperture-bridge":
            payload = GUARD.phase4_readiness_receipt()
            payload["operation"] = "readiness"
            payload["integration_harness"] = True
            self._json(200, payload)
            return
        self._static()

    def do_POST(self) -> None:  # noqa: N802
        if urlparse(self.path).path != "/api/aperture-bridge":
            self._json(404, {"ok": False, "error": "API route not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("request body must be between 1 and 131072 bytes")
            envelope = json.loads(self.rfile.read(length))
            headers = {key.lower(): value for key, value in self.headers.items()}
            response = GUARD.dispatch_guarded_post(envelope, headers)
            response["integration_harness"] = True
            self._json(200, response)
        except PermissionError as exc:
            self._json(403, {"ok": False, "error": str(exc)})
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self._json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:  # pragma: no cover - surfaced as a held CI receipt
            self._json(
                500,
                {
                    "ok": False,
                    "error": "Phase IV integration harness failed",
                    "detail": str(exc),
                },
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=6134)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Phase4Handler)
    print(
        json.dumps(
            {
                "status": "READY",
                "schema": "td613.phase4.local-integration-harness/v0.1",
                "url": f"http://{args.host}:{args.port}",
                "shared_guard": str(API_PATH.relative_to(ROOT)),
                "new_serverless_function": False,
            }
        ),
        flush=True,
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
