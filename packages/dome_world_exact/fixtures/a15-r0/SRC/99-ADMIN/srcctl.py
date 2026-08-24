#!/usr/bin/env python3
"""SRC Phase 2 custody runner.

The portable source of truth is append-only JSONL plus content-addressed bytes.
SQLite/WAL is only the resumable work journal.  No command executes a captured
document.  ``--dry-run`` is deliberately read-only and network-free.
"""
from __future__ import annotations

import argparse
import contextlib
import csv
import dataclasses
import datetime as dt
import hashlib
import html
import json
import os
import random
import re
import shutil
import sqlite3
import ssl
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable, Iterator
from xml.etree import ElementTree as ET


RUNNER_VERSION = "srcctl/2.0.1"
SCHEMA_VERSION = 1
TERMINAL_STATES = {
    "VERIFIED_CAPTURE", "ALREADY_CURRENT", "PARTIAL", "AUTH_REQUIRED",
    "RATE_LIMITED", "UNAVAILABLE", "RIGHTS_BLOCKED", "RETRYABLE_FAILURE", "UNKNOWN",
}
TRANSIENT_STATES = {"PLANNED", "FETCHING", "STAGED", "BLOB_COMMITTED"}
PLATFORMS = ("zenodo", "academia", "substack", "medium", "doi")
REDACT_HEADERS = {"authorization", "cookie", "set-cookie", "proxy-authorization", "x-api-key"}
SAFE_HEADERS = {
    "content-type", "content-length", "etag", "last-modified", "location", "retry-after",
    "x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset", "date", "cache-control",
}
USER_AGENT = "SRC-Preservation-Atelier/2.0 (+research preservation; no access-control bypass)"
BACKOFF_SECONDS = (5, 15, 45, 120, 300)


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def compact_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig") as stream:
        for line_no, line in enumerate(stream, 1):
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except Exception as exc:
                raise ValueError(f"invalid JSONL {path}:{line_no}: {exc}") from exc
    return rows


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    atomic_write(path, payload.encode("utf-8"))


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = "".join(compact_json(row) + "\n" for row in rows).encode("utf-8")
    atomic_write(path, payload)


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp_name, path)
    finally:
        with contextlib.suppress(FileNotFoundError):
            os.unlink(tmp_name)


def safe_name(value: str, limit: int = 96) -> str:
    value = html.unescape(value)
    value = re.sub(r"[^A-Za-z0-9._-]+", "-", value).strip("-.")
    return (value or "artifact")[:limit]


def stable_id(prefix: str, *parts: Any) -> str:
    raw = "\x1f".join(str(p) for p in parts)
    return f"{prefix}:{hashlib.sha256(raw.encode('utf-8')).hexdigest()[:24]}"


def classify_http_error(status: int) -> str:
    if status in (401, 403):
        return "AUTH_REQUIRED"
    if status == 404 or status == 410:
        return "UNAVAILABLE"
    if status == 429:
        return "RATE_LIMITED"
    if status >= 500:
        return "RETRYABLE_FAILURE"
    return "PARTIAL"


@dataclasses.dataclass(frozen=True)
class Target:
    target_id: str
    platform: str
    source_id: str
    url: str
    title: str
    publication_date: str | None
    expected_bytes: int | None
    expected_checksum: str | None
    media_kind: str
    rights_state: str
    rights_evidence: dict[str, Any]
    parent_entity_id: str | None = None


class State:
    def __init__(self, root: Path, read_only: bool = False):
        self.root = root
        self.db_path = root / "07-ARCHIVE-LEDGER" / "phase2" / "state.sqlite3"
        if read_only:
            uri = f"file:{self.db_path.as_posix()}?mode=ro"
            self.db = sqlite3.connect(uri, uri=True)
        else:
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            self.db = sqlite3.connect(self.db_path)
            self.db.execute("PRAGMA journal_mode=WAL")
            self.db.execute("PRAGMA synchronous=FULL")
            self.init()
        self.db.row_factory = sqlite3.Row

    def init(self) -> None:
        self.db.executescript(
            """
            CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS targets(
              target_id TEXT PRIMARY KEY, platform TEXT NOT NULL, source_id TEXT NOT NULL,
              url TEXT NOT NULL, title TEXT NOT NULL, publication_date TEXT,
              expected_bytes INTEGER, expected_checksum TEXT, media_kind TEXT NOT NULL,
              rights_state TEXT NOT NULL, rights_evidence_json TEXT NOT NULL,
              parent_entity_id TEXT, state TEXT NOT NULL DEFAULT 'PLANNED', attempts INTEGER NOT NULL DEFAULT 0,
              last_error TEXT, capture_id TEXT, updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS journal(
              sequence INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, target_id TEXT,
              operation TEXT NOT NULL, before_state TEXT, after_state TEXT, detail_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS captures(
              capture_id TEXT PRIMARY KEY, target_id TEXT NOT NULL, blob_id TEXT NOT NULL,
              captured_at TEXT NOT NULL, request_url TEXT NOT NULL, final_url TEXT NOT NULL,
              status_code INTEGER NOT NULL, headers_json TEXT NOT NULL, redirects_json TEXT NOT NULL,
              retry_json TEXT NOT NULL, byte_length INTEGER NOT NULL, media_type TEXT,
              contextual_sha256 TEXT NOT NULL, FOREIGN KEY(target_id) REFERENCES targets(target_id)
            );
            CREATE TABLE IF NOT EXISTS blobs(
              blob_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL UNIQUE, byte_length INTEGER NOT NULL,
              local_path TEXT NOT NULL, promoted_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS derivatives(
              derivative_id TEXT PRIMARY KEY, capture_id TEXT NOT NULL, parent_blob_sha256 TEXT NOT NULL,
              tool TEXT NOT NULL, parameters_json TEXT NOT NULL, output_sha256 TEXT NOT NULL,
              local_path TEXT NOT NULL, locator_map_path TEXT, confidence TEXT NOT NULL,
              failures_json TEXT NOT NULL, created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS rights_decisions(
              decision_id TEXT PRIMARY KEY, target_id TEXT NOT NULL, decision TEXT NOT NULL,
              evidence_json TEXT NOT NULL, decided_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS target_reasons(
              target_id TEXT NOT NULL, priority INTEGER NOT NULL, reason TEXT NOT NULL,
              source_target_id TEXT NOT NULL, PRIMARY KEY(target_id,priority,reason,source_target_id)
            );
            CREATE TABLE IF NOT EXISTS unresolved_priority_objects(
              source_target_id TEXT NOT NULL, priority INTEGER NOT NULL, reason TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'OPEN_UNRESOLVED', PRIMARY KEY(source_target_id,priority,reason)
            );
            """
        )
        self.db.execute("INSERT OR REPLACE INTO meta(key,value) VALUES('schema_version',?)", (str(SCHEMA_VERSION),))
        self.db.commit()

    def journal(self, target_id: str | None, operation: str, before: str | None, after: str | None, detail: dict[str, Any]) -> None:
        self.db.execute(
            "INSERT INTO journal(at,target_id,operation,before_state,after_state,detail_json) VALUES(?,?,?,?,?,?)",
            (utc_now(), target_id, operation, before, after, compact_json(detail)),
        )
        self.db.commit()

    def transition(self, target_id: str, state: str, *, error: str | None = None, capture_id: str | None = None) -> None:
        if state not in TERMINAL_STATES | TRANSIENT_STATES:
            raise ValueError(f"invalid state {state}")
        row = self.db.execute("SELECT state FROM targets WHERE target_id=?", (target_id,)).fetchone()
        before = row[0] if row else None
        self.journal(target_id, "STATE_TRANSITION_PREPARE", before, state, {"error": error})
        self.db.execute(
            "UPDATE targets SET state=?,last_error=?,capture_id=COALESCE(?,capture_id),updated_at=? WHERE target_id=?",
            (state, error, capture_id, utc_now(), target_id),
        )
        self.db.commit()
        self.journal(target_id, "STATE_TRANSITION_COMMIT", before, state, {"capture_id": capture_id})

    def recover_incomplete(self) -> dict[str, int]:
        """Type interrupted states without inventing a completed capture."""
        counts: Counter[str] = Counter()
        for row in self.db.execute("SELECT target_id,state FROM targets WHERE state IN ('FETCHING','STAGED','BLOB_COMMITTED')").fetchall():
            reason = {
                "FETCHING": "INTERRUPTED_DURING_TRANSFER",
                "STAGED": "INTERRUPTED_AFTER_PARTIAL_OR_COMPLETE_STAGING",
                "BLOB_COMMITTED": "ORPHAN_BLOB_BEFORE_LEDGER_PROMOTION",
            }[row["state"]]
            self.transition(row["target_id"], "RETRYABLE_FAILURE", error=reason)
            counts[reason] += 1
        return dict(counts)


class HostPacer:
    def __init__(self):
        self.last: dict[str, float] = {}
        self.zenodo_metadata_last: float | None = None

    def wait(self, url: str) -> None:
        host = urllib.parse.urlparse(url).netloc.lower()
        interval = 2.0
        is_zenodo = "zenodo.org" in host
        is_zenodo_metadata = is_zenodo and bool(re.search(r"/api/records/\d+/?$", urllib.parse.urlparse(url).path))
        if is_zenodo:
            interval = 1.02  # <= 58.8 total guest requests/minute
        prior = self.last.get(host)
        if prior is not None:
            delay = interval - (time.monotonic() - prior)
            if delay > 0:
                time.sleep(delay)
        if is_zenodo_metadata and self.zenodo_metadata_last is not None:
            metadata_delay = 2.41 - (time.monotonic() - self.zenodo_metadata_last)
            if metadata_delay > 0:
                time.sleep(metadata_delay)  # <= 24.9 metadata requests/minute
        self.last[host] = time.monotonic()
        if is_zenodo_metadata:
            self.zenodo_metadata_last = self.last[host]


def load_targets(root: Path) -> list[Target]:
    targets: list[Target] = []
    for row in jsonl(root / "01-MANIFESTS" / "candidate-corpus.jsonl"):
        license_id = str(row.get("license") or "").lower()
        public_ok = row.get("access_right") == "open" and license_id == "cc-by-4.0"
        source_id = str(row["source_record_id"])
        targets.append(Target(
            target_id=f"zenodo:{source_id}:metadata", platform="zenodo", source_id=source_id,
            url=f"https://zenodo.org/api/records/{source_id}", title=row["title"],
            publication_date=row.get("publication_date"), expected_bytes=None, expected_checksum=None,
            media_kind="json", rights_state="PUBLIC_ALLOWED",
            rights_evidence={"basis": "public record metadata", "record_url": row.get("record_url")},
            parent_entity_id=row.get("vault_id"),
        ))
        for index, file in enumerate(row.get("files") or []):
            targets.append(Target(
                target_id=f"zenodo:{source_id}:file:{index}", platform="zenodo", source_id=source_id,
                url=file["download_url"], title=file.get("source_name") or row["title"],
                publication_date=row.get("publication_date"), expected_bytes=file.get("bytes"),
                expected_checksum=file.get("source_checksum"), media_kind=Path(file.get("source_name", "")).suffix.lower().lstrip(".") or "binary",
                rights_state="PUBLIC_ALLOWED" if public_ok else "REVIEW_REQUIRED",
                rights_evidence={"access_right": row.get("access_right"), "license": row.get("license"), "record_url": row.get("record_url")},
                parent_entity_id=row.get("vault_id"),
            ))
        if row.get("doi_url"):
            targets.append(Target(
                target_id=f"doi:zenodo:{source_id}", platform="doi", source_id=str(row.get("doi") or source_id),
                url=row["doi_url"], title=row["title"], publication_date=row.get("publication_date"),
                expected_bytes=None, expected_checksum=None, media_kind="resolver",
                rights_state="PUBLIC_ALLOWED", rights_evidence={"basis": "resolver metadata only"}, parent_entity_id=row.get("vault_id"),
            ))
    specs = (
        ("academia", root / "01-MANIFESTS" / "platforms" / "academia.jsonl"),
        ("substack", root / "01-MANIFESTS" / "platforms" / "substack.jsonl"),
        ("medium", root / "01-MANIFESTS" / "platforms" / "medium.jsonl"),
    )
    for platform, path in specs:
        for row in jsonl(path):
            source_id = str(row["platform_item_id"])
            targets.append(Target(
                target_id=f"{platform}:{source_id}:page", platform=platform, source_id=source_id,
                url=row["url"], title=row.get("title") or source_id,
                publication_date=row.get("published_at") or row.get("published_label"), expected_bytes=None,
                expected_checksum=None, media_kind="html", rights_state="PRIVATE_ONLY",
                rights_evidence={"basis": "public availability is not redistribution permission", "source_url": row["url"]},
                parent_entity_id=f"{platform}:{source_id}",
            ))
    return sorted(targets, key=lambda t: (PLATFORMS.index(t.platform), t.source_id, t.target_id))


def command_preflight(args: argparse.Namespace) -> int:
    root = args.root
    source_bytes = sum((file.get("bytes") or 0) for row in jsonl(root / "01-MANIFESTS" / "candidate-corpus.jsonl") for file in (row.get("files") or []))
    free = shutil.disk_usage(root).free
    required = source_bytes * 3
    result = {
        "runner": RUNNER_VERSION, "at": utc_now(), "root": str(root),
        "python": sys.version, "source_bytes_expected": source_bytes,
        "free_bytes": free, "required_free_bytes": required,
        "disk_gate": "PASS" if free >= required else "FAIL",
        "phase15_validator_present": (root / "99-ADMIN" / "validate-phase15-epistemic-contracts.py").is_file(),
        "baseline_counts": {
            "zenodo": len(jsonl(root / "01-MANIFESTS" / "candidate-corpus.jsonl")),
            "academia": len(jsonl(root / "01-MANIFESTS" / "platforms" / "academia.jsonl")),
            "substack": len(jsonl(root / "01-MANIFESTS" / "platforms" / "substack.jsonl")),
            "medium": len(jsonl(root / "01-MANIFESTS" / "platforms" / "medium.jsonl")),
        },
        "dry_run": args.dry_run,
    }
    print(json.dumps(result, indent=2))
    if not args.dry_run:
        write_json(root / "04-RECEIPTS" / "phase2" / "preflight.json", result)
    return 0 if result["disk_gate"] == "PASS" else 2


def command_plan(args: argparse.Namespace) -> int:
    targets = load_targets(args.root)
    counts = Counter(target.platform for target in targets)
    rights = Counter(target.rights_state for target in targets)
    print(json.dumps({"targets": len(targets), "by_platform": counts, "by_rights": rights, "dry_run": args.dry_run}, indent=2, default=dict))
    if args.dry_run:
        return 0
    state = State(args.root)
    for target in targets:
        state.db.execute(
            """INSERT INTO targets(target_id,platform,source_id,url,title,publication_date,expected_bytes,expected_checksum,media_kind,rights_state,rights_evidence_json,parent_entity_id,state,updated_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(target_id) DO UPDATE SET url=excluded.url,title=excluded.title,expected_bytes=excluded.expected_bytes,
               expected_checksum=excluded.expected_checksum,rights_state=excluded.rights_state,rights_evidence_json=excluded.rights_evidence_json,updated_at=excluded.updated_at""",
            (target.target_id, target.platform, target.source_id, target.url, target.title, target.publication_date,
             target.expected_bytes, target.expected_checksum, target.media_kind, target.rights_state,
             compact_json(target.rights_evidence), target.parent_entity_id, "PLANNED", utc_now()),
        )
        decision_id = stable_id("rights", target.target_id, target.rights_state)
        state.db.execute(
            "INSERT OR IGNORE INTO rights_decisions(decision_id,target_id,decision,evidence_json,decided_at) VALUES(?,?,?,?,?)",
            (decision_id, target.target_id, target.rights_state, compact_json(target.rights_evidence), utc_now()),
        )
    by_zenodo_source: dict[str, list[str]] = defaultdict(list)
    for target in targets:
        if target.platform == "zenodo":
            by_zenodo_source[target.source_id].append(target.target_id)
    priorities = jsonl(args.root / "04-RECEIPTS" / "assays" / "2026-08-24-phase15-authority-recompilation" / "phase-2-acquisition-priorities.jsonl")
    for item in priorities:
        priority = int(item["priority"])
        reason = item.get("reason") or item.get("why") or item.get("acquisition_objective") or "priority target"
        source_targets = item.get("target_ids") or item.get("manifestation_ids") or []
        for source_target_id in source_targets:
            match = re.fullmatch(r"zenodo:(\d+)", source_target_id)
            if match:
                for target_id in by_zenodo_source.get(match.group(1), []):
                    state.db.execute("INSERT OR IGNORE INTO target_reasons(target_id,priority,reason,source_target_id) VALUES(?,?,?,?)", (target_id, priority, reason, source_target_id))
            else:
                state.db.execute("INSERT OR IGNORE INTO unresolved_priority_objects(source_target_id,priority,reason) VALUES(?,?,?)", (source_target_id, priority, reason))
    state.db.commit()
    state.journal(None, "PLAN_SEALED", None, None, {"targets": len(targets), "counts": dict(counts), "rights": dict(rights)})
    return 0


def snapshot_paths(root: Path) -> list[Path]:
    return [
        root / "01-MANIFESTS" / "candidate-corpus.jsonl",
        root / "01-MANIFESTS" / "platforms" / "academia.jsonl",
        root / "01-MANIFESTS" / "platforms" / "substack.jsonl",
        root / "01-MANIFESTS" / "platforms" / "medium.jsonl",
        root / "01-MANIFESTS" / "cross-surface-manifestations.jsonl",
        root / "04-RECEIPTS" / "assays" / "2026-08-24-phase15-authority-recompilation" / "phase-2-acquisition-priorities.jsonl",
    ]


def command_snapshot(args: argparse.Namespace) -> int:
    files = [p for p in snapshot_paths(args.root) if p.exists()]
    receipt = [{"path": p.relative_to(args.root).as_posix(), "bytes": p.stat().st_size, "sha256": sha256_file(p)} for p in files]
    result = {"snapshot_id": args.snapshot_id or dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ"), "at": utc_now(), "files": receipt, "dry_run": args.dry_run}
    print(json.dumps(result, indent=2))
    if args.dry_run:
        return 0
    out = args.root / "01-MANIFESTS" / "snapshots" / result["snapshot_id"]
    out.mkdir(parents=True, exist_ok=False)
    for path in files:
        target = out / path.relative_to(args.root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
    write_json(out / "snapshot-receipt.json", result)
    state = State(args.root)
    state.db.execute("INSERT OR REPLACE INTO meta(key,value) VALUES('atelier_snapshot_id',?)", (result["snapshot_id"],))
    state.db.commit()
    state.journal(None, "ATELIER_SNAPSHOT_SELECTED", None, result["snapshot_id"], {"snapshot_path": out.relative_to(args.root).as_posix()})
    return 0


def sanitized_headers(message: Any) -> dict[str, str]:
    result: dict[str, str] = {}
    for key, value in message.items():
        lower = key.lower()
        if lower in SAFE_HEADERS and lower not in REDACT_HEADERS:
            result[lower] = str(value)
    return result


class TrackingRedirect(urllib.request.HTTPRedirectHandler):
    def __init__(self):
        super().__init__()
        self.chain: list[dict[str, Any]] = []

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        self.chain.append({"status": code, "from": req.full_url, "to": newurl})
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url: str, pacer: HostPacer, max_attempts: int = 6, method: str = "GET") -> tuple[int, str, dict[str, str], list[dict[str, Any]], list[dict[str, Any]], bytes]:
    retries: list[dict[str, Any]] = []
    for attempt in range(max_attempts):
        pacer.wait(url)
        redirect = TrackingRedirect()
        opener = urllib.request.build_opener(redirect)
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"}, method=method)
        try:
            with opener.open(request, timeout=90) as response:
                body = response.read() if method != "HEAD" else b""
                return response.status, response.geturl(), sanitized_headers(response.headers), redirect.chain, retries, body
        except urllib.error.HTTPError as exc:
            status = int(exc.code)
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            retries.append({"at": utc_now(), "attempt": attempt + 1, "status": status, "retry_after": retry_after})
            if status not in (429, 500, 502, 503, 504) or attempt + 1 >= max_attempts:
                body = exc.read() if hasattr(exc, "read") else b""
                return status, exc.geturl(), sanitized_headers(exc.headers or {}), redirect.chain, retries, body
            try:
                delay = float(retry_after) if retry_after else BACKOFF_SECONDS[min(attempt, len(BACKOFF_SECONDS) - 1)]
            except ValueError:
                delay = BACKOFF_SECONDS[min(attempt, len(BACKOFF_SECONDS) - 1)]
            time.sleep(delay + random.random())
        except (urllib.error.URLError, TimeoutError, ssl.SSLError) as exc:
            retries.append({"at": utc_now(), "attempt": attempt + 1, "error": type(exc).__name__, "detail": str(exc)[:500]})
            if attempt + 1 >= max_attempts:
                raise
            time.sleep(BACKOFF_SECONDS[min(attempt, len(BACKOFF_SECONDS) - 1)] + random.random())
    raise RuntimeError("unreachable")


def checksum_matches(spec: str | None, body: bytes) -> bool:
    if not spec:
        return True
    try:
        algorithm, expected = spec.split(":", 1)
        actual = hashlib.new(algorithm, body).hexdigest()
        return actual.lower() == expected.lower()
    except Exception:
        return False


def promote_capture(state: State, row: sqlite3.Row, status: int, final_url: str, headers: dict[str, str], redirects: list[dict[str, Any]], retries: list[dict[str, Any]], body: bytes) -> tuple[str, str]:
    target_id = row["target_id"]
    digest = sha256_bytes(body)
    blob_id = f"sha256:{digest}"
    suffix = ".html" if row["media_kind"] in ("html", "resolver") else ("." + safe_name(row["media_kind"], 12))
    blob_rel = Path("02-ORIGINALS") / "blobs" / digest[:2] / (digest + suffix)
    blob_path = state.root / blob_rel
    staging = state.root / "02-ORIGINALS" / ".staging" / (safe_name(target_id) + ".part")
    state.journal(target_id, "STAGE_PREPARE", row["state"], "STAGED", {"bytes": len(body), "sha256": digest})
    atomic_write(staging, body)
    if sha256_file(staging) != digest:
        raise IOError("staging checksum mismatch")
    state.transition(target_id, "STAGED")
    state.journal(target_id, "BLOB_PROMOTION_PREPARE", "STAGED", "BLOB_COMMITTED", {"blob_id": blob_id, "path": blob_rel.as_posix()})
    blob_path.parent.mkdir(parents=True, exist_ok=True)
    if blob_path.exists():
        if sha256_file(blob_path) != digest:
            raise IOError("existing content-addressed blob mismatch")
        staging.unlink()
    else:
        os.replace(staging, blob_path)
    state.db.execute("INSERT OR IGNORE INTO blobs(blob_id,sha256,byte_length,local_path,promoted_at) VALUES(?,?,?,?,?)", (blob_id, digest, len(body), blob_rel.as_posix(), utc_now()))
    state.db.commit()
    state.transition(target_id, "BLOB_COMMITTED")
    capture_id = stable_id("capture", target_id, digest, final_url, utc_now())
    contextual = sha256_bytes(compact_json({"target_id": target_id, "blob_id": blob_id, "final_url": final_url, "status": status}).encode())
    state.journal(target_id, "LEDGER_PROMOTION_PREPARE", "BLOB_COMMITTED", "VERIFIED_CAPTURE", {"capture_id": capture_id})
    state.db.execute(
        "INSERT INTO captures(capture_id,target_id,blob_id,captured_at,request_url,final_url,status_code,headers_json,redirects_json,retry_json,byte_length,media_type,contextual_sha256) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (capture_id, target_id, blob_id, utc_now(), row["url"], final_url, status, compact_json(headers), compact_json(redirects), compact_json(retries), len(body), headers.get("content-type"), contextual),
    )
    state.db.commit()
    state.transition(target_id, "VERIFIED_CAPTURE", capture_id=capture_id)
    return capture_id, digest


def command_acquire(args: argparse.Namespace) -> int:
    if args.dry_run:
        targets = load_targets(args.root)
        selected = [t for t in targets if (not args.platform or t.platform in args.platform)]
        print(json.dumps({"would_consider": min(len(selected), args.limit or len(selected)), "network_requests": 0, "writes": 0}, indent=2))
        return 0
    state = State(args.root)
    recovered = state.recover_incomplete()
    if recovered:
        print(json.dumps({"recovered_interrupted_states": recovered}), flush=True)
    if args.refresh:
        query = "SELECT * FROM targets WHERE state NOT IN ('RIGHTS_BLOCKED','AUTH_REQUIRED')"
        params: list[Any] = []
    else:
        hard_terminal = TERMINAL_STATES - {"RETRYABLE_FAILURE"}
        query = "SELECT * FROM targets WHERE (state NOT IN ({}) OR (state='RETRYABLE_FAILURE' AND attempts<6))".format(",".join("?" for _ in hard_terminal))
        params = list(hard_terminal)
    if args.platform:
        query += " AND platform IN ({})".format(",".join("?" for _ in args.platform))
        params.extend(args.platform)
    if args.target_id:
        query += " AND target_id IN ({})".format(",".join("?" for _ in args.target_id))
        params.extend(args.target_id)
    query += " ORDER BY COALESCE((SELECT MIN(priority) FROM target_reasons r WHERE r.target_id=targets.target_id),9999), CASE platform WHEN 'zenodo' THEN 0 WHEN 'academia' THEN 1 WHEN 'substack' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, source_id, target_id"
    if args.limit:
        query += " LIMIT ?"
        params.append(args.limit)
    rows = state.db.execute(query, params).fetchall()
    pacer = HostPacer()
    for index, row in enumerate(rows, 1):
        target_id = row["target_id"]
        state.db.execute("UPDATE targets SET attempts=attempts+1,updated_at=? WHERE target_id=?", (utc_now(), target_id))
        state.db.commit()
        state.transition(target_id, "FETCHING")
        try:
            method = "HEAD" if row["media_kind"] == "resolver" else "GET"
            status, final_url, headers, redirects, retries, body = fetch(row["url"], pacer, method=method)
            headers = {**headers, "x-src-request-method": method}
            if not 200 <= status < 300:
                state.transition(target_id, classify_http_error(status), error=f"HTTP {status}")
                print(f"[{index}/{len(rows)}] {target_id}: HTTP {status}", flush=True)
                continue
            if row["expected_bytes"] is not None and len(body) != row["expected_bytes"]:
                state.transition(target_id, "RETRYABLE_FAILURE", error=f"byte length mismatch expected={row['expected_bytes']} actual={len(body)}")
                continue
            if not checksum_matches(row["expected_checksum"], body):
                state.transition(target_id, "RETRYABLE_FAILURE", error="source checksum mismatch")
                continue
            capture_id, digest = promote_capture(state, row, status, final_url, headers, redirects, retries, body)
            print(f"[{index}/{len(rows)}] {target_id}: {capture_id} sha256:{digest[:12]}", flush=True)
        except KeyboardInterrupt:
            state.transition(target_id, "RETRYABLE_FAILURE", error="operator interruption")
            raise
        except Exception as exc:
            state.transition(target_id, "RETRYABLE_FAILURE", error=f"{type(exc).__name__}: {str(exc)[:800]}")
            print(f"[{index}/{len(rows)}] {target_id}: {type(exc).__name__}", flush=True)
    export_ledgers(state)
    return 0


def strip_html(raw: str) -> tuple[str, list[dict[str, Any]]]:
    raw = re.sub(r"(?is)<(script|style|noscript|svg|iframe).*?>.*?</\1>", " ", raw)
    raw = re.sub(r"(?i)</(p|div|section|article|h[1-6]|li|blockquote|tr)>", "\n", raw)
    text = re.sub(r"(?s)<[^>]+>", " ", raw)
    text = html.unescape(text)
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    paragraphs = [line for line in lines if line]
    locators = [{"paragraph": i + 1, "start_character": sum(len(p) + 2 for p in paragraphs[:i]), "source": "sanitized-dom"} for i, _ in enumerate(paragraphs)]
    return "\n\n".join(paragraphs) + ("\n" if paragraphs else ""), locators


def extract_docx(path: Path) -> tuple[str, list[dict[str, Any]], list[str]]:
    failures: list[str] = []
    paragraphs: list[str] = []
    locators: list[dict[str, Any]] = []
    with zipfile.ZipFile(path) as archive:
        for member in ("word/document.xml", "word/footnotes.xml", "word/endnotes.xml"):
            if member not in archive.namelist():
                continue
            root = ET.fromstring(archive.read(member))
            ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
            for p in root.iter(ns + "p"):
                text = "".join(node.text or "" for node in p.iter(ns + "t")).strip()
                if text:
                    paragraphs.append(text)
                    locators.append({"paragraph": len(paragraphs), "source_member": member})
    if not paragraphs:
        failures.append("NO_TEXT_EXTRACTED")
    return "\n\n".join(paragraphs) + ("\n" if paragraphs else ""), locators, failures


def extract_pdf(path: Path) -> tuple[str, list[dict[str, Any]], list[str]]:
    failures: list[str] = []
    pages: list[str] = []
    try:
        import fitz  # type: ignore
        document = fitz.open(path)
        for page in document:
            pages.append(page.get_text("text"))
    except Exception as exc:
        native_failure = f"PYMUPDF_UNAVAILABLE_OR_FAILED:{type(exc).__name__}"
        try:
            from pypdf import PdfReader  # type: ignore
            reader = PdfReader(path, strict=False)
            pages = [(page.extract_text() or "") for page in reader.pages]
        except Exception as fallback_exc:
            failures.append(native_failure)
            failures.append(f"PYPDF_EXTRACTION_FAILED:{type(fallback_exc).__name__}")
    text_parts: list[str] = []
    locators: list[dict[str, Any]] = []
    for page_no, page in enumerate(pages, 1):
        paragraphs = [re.sub(r"\s+", " ", p).strip() for p in re.split(r"\n\s*\n", page) if p.strip()]
        for paragraph in paragraphs:
            locators.append({"page": page_no, "paragraph_on_page": sum(1 for x in locators if x.get("page") == page_no) + 1})
            text_parts.append(paragraph)
    if not text_parts:
        failures.append("OCR_REQUIRED_NOT_AUTORUN")
    return "\n\n".join(text_parts) + ("\n" if text_parts else ""), locators, failures


def discover_embedded_downloads(platform: str, raw: str, base_url: str) -> list[tuple[str, str]]:
    """Discover only public URLs already embedded in captured markup; never bypass controls."""
    decoded = html.unescape(raw).replace("\\u002F", "/").replace("\\/", "/")
    candidates = set(re.findall(r"https?://[^\"'<>\s]+", decoded))
    result: list[tuple[str, str]] = []
    for value in sorted(candidates):
        value = value.rstrip("),.;]")
        lower = value.lower()
        kind = None
        if platform == "academia" and (lower.endswith(".pdf") or "/download" in lower) and "academia" in urllib.parse.urlparse(value).netloc.lower():
            kind = "pdf"
        elif platform == "substack" and (lower.endswith(".mp3") or "audio" in lower) and any(host in urllib.parse.urlparse(value).netloc.lower() for host in ("substack", "substackcdn")):
            kind = "audio"
        if kind:
            result.append((value, kind))
    return result[:4]


def command_extract(args: argparse.Namespace) -> int:
    if args.dry_run:
        print(json.dumps({"network_requests": 0, "writes": 0, "action": "extract-preview"}, indent=2))
        return 0
    state = State(args.root)
    rows = list(state.db.execute(
        """SELECT c.*,b.local_path,b.sha256,t.media_kind,t.platform,t.title
           FROM captures c JOIN blobs b ON b.blob_id=c.blob_id JOIN targets t ON t.target_id=c.target_id
           WHERE c.capture_id NOT IN (SELECT capture_id FROM derivatives) ORDER BY c.captured_at"""
    ).fetchall())
    if args.repair_invalid:
        repair_capture_ids = []
        for derivative in state.db.execute("SELECT capture_id,local_path,output_sha256 FROM derivatives ORDER BY capture_id"):
            path = args.root / derivative["local_path"]
            if not path.is_file() or sha256_file(path) != derivative["output_sha256"]:
                repair_capture_ids.append(derivative["capture_id"])
        if repair_capture_ids:
            placeholders = ",".join("?" for _ in repair_capture_ids)
            rows.extend(state.db.execute(
                f"""SELECT c.*,b.local_path,b.sha256,t.media_kind,t.platform,t.title
                       FROM captures c JOIN blobs b ON b.blob_id=c.blob_id JOIN targets t ON t.target_id=c.target_id
                      WHERE c.capture_id IN ({placeholders}) ORDER BY c.captured_at""",
                tuple(repair_capture_ids),
            ).fetchall())
    if args.limit:
        rows = rows[:args.limit]
    for index, row in enumerate(rows, 1):
        source = args.root / row["local_path"]
        media = row["media_kind"]
        failures: list[str] = []
        if media == "docx":
            text, locators, failures = extract_docx(source)
            tool = "srcctl-docx-xml/1"
        elif media == "pdf":
            text, locators, failures = extract_pdf(source)
            tool = "PyMuPDF-native/1"
        elif media == "resolver":
            redirects = json.loads(row["redirects_json"])
            headers = json.loads(row["headers_json"])
            lines = [
                f"Request URL: {row['request_url']}",
                f"Final URL: {row['final_url']}",
                f"Status: {row['status_code']}",
                f"Request method: {headers.get('x-src-request-method', 'GET_LEGACY_CAPTURE')}",
                "",
                "Redirect chain:",
                *(f"{item.get('status')} {item.get('from')} -> {item.get('to')}" for item in redirects),
            ]
            text = "\n".join(lines).strip() + "\n"
            locators = [{"source": "capture-redirect-chain", "redirect_index": i} for i, _ in enumerate(redirects)]
            tool = "srcctl-doi-resolver-receipt/1"
        elif media == "html":
            raw = source.read_text(encoding="utf-8", errors="replace")
            text, locators = strip_html(raw)
            tool = "srcctl-sanitized-dom/1"
            if media == "html" and row["platform"] in ("academia", "substack"):
                for url, kind in discover_embedded_downloads(row["platform"], raw, row["final_url"]):
                    target_id = f"{row['platform']}:{safe_name(row['target_id'], 64)}:embedded:{sha256_bytes(url.encode())[:16]}"
                    state.db.execute(
                        """INSERT OR IGNORE INTO targets(target_id,platform,source_id,url,title,publication_date,expected_bytes,expected_checksum,media_kind,rights_state,rights_evidence_json,parent_entity_id,state,updated_at)
                           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                        (target_id, row["platform"], row["target_id"], url, row["title"], None, None, None, kind,
                         "PRIVATE_ONLY", compact_json({"basis": "public URL embedded in captured source page", "parent_capture_id": row["capture_id"]}),
                         row["target_id"], "PLANNED", utc_now()),
                    )
                state.db.commit()
        elif media == "json":
            parsed = json.loads(source.read_text(encoding="utf-8"))
            text = json.dumps(parsed, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
            locators = [{"json_pointer": "", "source": "captured-json"}]
            tool = "srcctl-json-normalizer/1"
        elif media == "audio":
            failures = ["MACHINE_TRANSCRIPTION_NOT_RUN_NO_LOCAL_TOOL"]
            text, locators, tool = "", [], "srcctl-audio-preservation/1"
        else:
            failures = ["UNSUPPORTED_MEDIA_KIND"]
            text, locators, tool = "", [], "srcctl-none/1"
        derivative_id = stable_id("derivative", row["capture_id"], tool, sha256_bytes(text.encode("utf-8")))
        # Capture identity, not target identity, owns a derivative path. This
        # keeps repeated contextual observations append-only and collision-free.
        derivative_stem = safe_name(row["target_id"], 88) + "--" + safe_name(row["capture_id"], 31)
        rel = Path("03-DERIVATIVES") / "text" / row["platform"] / (derivative_stem + ".md")
        locator_rel = Path("03-DERIVATIVES") / "locators" / row["platform"] / (derivative_stem + ".json")
        header = (
            "---\n" +
            f"derivative_id: {derivative_id}\nparent_capture_id: {row['capture_id']}\nparent_blob_sha256: {row['sha256']}\n" +
            f"tool: {tool}\nsource_title: {json.dumps(row['title'], ensure_ascii=False)}\n---\n\n"
        )
        output = header + text
        atomic_write(args.root / rel, output.encode("utf-8"))
        write_json(args.root / locator_rel, {"derivative_id": derivative_id, "locators": locators})
        chunk_paths: list[str] = []
        if text:
            chunk_root = Path("03-DERIVATIVES") / "chunks" / row["platform"] / derivative_stem
            paragraphs = text.split("\n\n")
            chunks: list[list[str]] = []
            current: list[str] = []
            current_size = 0
            for paragraph in paragraphs:
                paragraph_size = len(paragraph) + 2
                if current and current_size + paragraph_size > 12000:
                    chunks.append(current)
                    current, current_size = [], 0
                current.append(paragraph)
                current_size += paragraph_size
            if current:
                chunks.append(current)
            for chunk_index, chunk in enumerate(chunks, 1):
                chunk_rel = chunk_root / f"{chunk_index:04d}.md"
                chunk_header = (
                    "---\n" +
                    f"derivative_id: {derivative_id}\nchunk: {chunk_index}\nchunk_count: {len(chunks)}\n" +
                    f"parent_capture_id: {row['capture_id']}\nparent_blob_sha256: {row['sha256']}\n---\n\n"
                )
                atomic_write(args.root / chunk_rel, (chunk_header + "\n\n".join(chunk) + "\n").encode("utf-8"))
                chunk_paths.append(chunk_rel.as_posix())
        output_hash = sha256_file(args.root / rel)
        confidence = "HIGH" if text and not failures else ("PARTIAL" if text else "FAILED")
        state.db.execute(
            "INSERT OR REPLACE INTO derivatives(derivative_id,capture_id,parent_blob_sha256,tool,parameters_json,output_sha256,local_path,locator_map_path,confidence,failures_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            (derivative_id, row["capture_id"], row["sha256"], tool,
             compact_json({"body_text_sha256": sha256_bytes(text.encode("utf-8")), "chunk_paths": chunk_paths, "chunk_target_characters": 12000}),
             output_hash, rel.as_posix(), locator_rel.as_posix(), confidence, compact_json(failures), utc_now()),
        )
        state.db.commit()
        print(f"[{index}/{len(rows)}] {row['target_id']}: {confidence}", flush=True)
    export_ledgers(state)
    return 0


def export_ledgers(state: State) -> None:
    out = state.root / "01-MANIFESTS" / "phase2"
    out.mkdir(parents=True, exist_ok=True)
    specs = {
        "capture-v2.jsonl": "SELECT * FROM captures ORDER BY capture_id",
        "blob-v1.jsonl": "SELECT * FROM blobs ORDER BY blob_id",
        "derivative-v1.jsonl": "SELECT * FROM derivatives ORDER BY derivative_id",
        "rights-decision-v1.jsonl": "SELECT * FROM rights_decisions ORDER BY decision_id",
        "acquisition-outcomes.jsonl": "SELECT target_id,platform,source_id,url,title,publication_date,media_kind,rights_state,state,attempts,last_error,capture_id,updated_at FROM targets ORDER BY platform,source_id,target_id",
        "journal.jsonl": "SELECT * FROM journal ORDER BY sequence",
        "priority-reasons.jsonl": "SELECT * FROM target_reasons ORDER BY priority,target_id,reason",
        "unresolved-priority-objects.jsonl": "SELECT * FROM unresolved_priority_objects ORDER BY priority,source_target_id",
    }
    for name, query in specs.items():
        rows = []
        for row in state.db.execute(query):
            item = dict(row)
            for key in list(item):
                if key.endswith("_json") and isinstance(item[key], str):
                    item[key[:-5]] = json.loads(item.pop(key))
            rows.append(item)
        write_jsonl(out / name, rows)
    version_observations: list[dict[str, Any]] = []
    for row in state.db.execute(
        """SELECT c.capture_id,c.captured_at,c.final_url,b.local_path,b.sha256,t.source_id,t.parent_entity_id
           FROM captures c JOIN blobs b ON b.blob_id=c.blob_id JOIN targets t ON t.target_id=c.target_id
           WHERE t.platform='zenodo' AND t.media_kind='json' ORDER BY t.source_id,c.captured_at"""
    ):
        source = state.root / row["local_path"]
        try:
            metadata = json.loads(source.read_text(encoding="utf-8"))
            inventory = []
            for item in metadata.get("files") or []:
                inventory.append({
                    "filename": item.get("key"), "bytes": item.get("size"),
                    "checksum": item.get("checksum"), "visibility": item.get("access", {}).get("status") if isinstance(item.get("access"), dict) else item.get("access"),
                    "links": {k: item.get("links", {}).get(k) for k in sorted(item.get("links", {})) if k in {"self", "content"}},
                })
            fingerprint = sha256_bytes(compact_json(inventory).encode("utf-8"))
            version_observations.append({
                "schema_version": "version-observation/v1", "observation_id": stable_id("version-observation", row["capture_id"]),
                "entity_id": row["parent_entity_id"], "platform": "Zenodo", "record_id": row["source_id"],
                "doi": metadata.get("doi"), "concept_doi": metadata.get("conceptdoi"),
                "platform_created_at": metadata.get("created"), "platform_updated_at": metadata.get("updated"),
                "retrieved_at": row["captured_at"], "capture_id": row["capture_id"], "metadata_blob_sha256": row["sha256"],
                "attachment_inventory": inventory, "attachment_inventory_sha256": fingerprint,
                "historical_body_status": "PRE_CAPTURE_STATE_UNKNOWN",
                "anti_inference": "same DOI/version label does not establish identical historical bytes",
            })
        except Exception as exc:
            version_observations.append({
                "schema_version": "version-observation/v1", "observation_id": stable_id("version-observation", row["capture_id"]),
                "entity_id": row["parent_entity_id"], "platform": "Zenodo", "record_id": row["source_id"],
                "retrieved_at": row["captured_at"], "capture_id": row["capture_id"], "metadata_blob_sha256": row["sha256"],
                "attachment_inventory": [], "attachment_inventory_sha256": None,
                "historical_body_status": "PRE_CAPTURE_STATE_UNKNOWN", "parse_failure": f"{type(exc).__name__}: {str(exc)[:300]}",
            })
    write_jsonl(state.root / "05-OPERATIONS" / "phase2" / "version-observations.jsonl", version_observations)
    resolver = []
    for row in state.db.execute("SELECT target_id,capture_id FROM targets ORDER BY target_id"):
        resolver.append({"entity_id": row["target_id"], "entity_type": "acquisition-target", "path": "01-MANIFESTS/phase2/acquisition-outcomes.jsonl", "capture_id": row["capture_id"]})
    for row in state.db.execute("SELECT capture_id,target_id FROM captures ORDER BY capture_id"):
        resolver.append({"entity_id": row["capture_id"], "entity_type": "capture", "path": "01-MANIFESTS/phase2/capture-v2.jsonl", "parent_id": row["target_id"]})
    for row in state.db.execute("SELECT derivative_id,capture_id,local_path FROM derivatives ORDER BY derivative_id"):
        resolver.append({"entity_id": row["derivative_id"], "entity_type": "derivative", "path": row["local_path"], "parent_id": row["capture_id"]})
    write_jsonl(out / "entity-resolver-v2.jsonl", resolver)


def tarjan(vertices: set[str], edges: list[tuple[str, str]]) -> list[list[str]]:
    adjacency: dict[str, list[str]] = defaultdict(list)
    for source, target in edges:
        adjacency[source].append(target)
    index = 0
    stack: list[str] = []
    on_stack: set[str] = set()
    indices: dict[str, int] = {}
    low: dict[str, int] = {}
    result: list[list[str]] = []
    def visit(v: str) -> None:
        nonlocal index
        indices[v] = low[v] = index
        index += 1
        stack.append(v); on_stack.add(v)
        for w in adjacency.get(v, []):
            if w not in indices:
                visit(w); low[v] = min(low[v], low[w])
            elif w in on_stack:
                low[v] = min(low[v], indices[w])
        if low[v] == indices[v]:
            component = []
            while True:
                w = stack.pop(); on_stack.remove(w); component.append(w)
                if w == v: break
            result.append(sorted(component))
    for vertex in sorted(vertices):
        if vertex not in indices:
            visit(vertex)
    return result


def command_assay(args: argparse.Namespace) -> int:
    if args.dry_run:
        print(json.dumps({"network_requests": 0, "writes": 0, "assay_order": list(range(1, 11))}, indent=2))
        return 0
    state = State(args.root)
    assay_root = args.root / "04-RECEIPTS" / "assays" / "2026-08-24-phase2-kiln"
    assay_root.mkdir(parents=True, exist_ok=True)
    typed = jsonl(args.root / "05-OPERATIONS" / "relations" / "typed-edges.jsonl")
    conceptual_predicates = {"CONCEPTUAL_FOUNDATION_FOR", "CONCEPTUALLY_PRECEDES", "FORMALIZES", "BUILDS_ON", "EXTENDS"}
    conceptual: list[tuple[str, str]] = []
    edge_ids: list[str] = []
    for row in typed:
        pred = row.get("predicate") or row.get("relation_type")
        if pred in conceptual_predicates and row.get("evidence_ids"):
            source = row.get("source_entity_id") or row.get("from_entity_id")
            target = row.get("target_entity_id") or row.get("to_entity_id")
            if source and target:
                conceptual.append((source, target)); edge_ids.append(row.get("relation_assertion_id") or row.get("edge_id"))
    vertices = {v for edge in conceptual for v in edge}
    components = tarjan(vertices, conceptual)
    cycles = [c for c in components if len(c) > 1]
    snapshot_row = state.db.execute("SELECT value FROM meta WHERE key='atelier_snapshot_id'").fetchone()
    atelier_snapshot_id = snapshot_row[0] if snapshot_row else "UNSEALED_WORKING_STATE"
    dag = {
        "schema_version": "conceptual-dag-assay/v1", "at": utc_now(),
        "atelier_snapshot_id": atelier_snapshot_id,
        "scope": "source-witnessed conceptual dependency predicates with local evidence",
        "predicates": sorted(conceptual_predicates), "edge_ids": edge_ids,
        "strongly_connected_components": components, "counterexample_components": cycles,
        "result": "BOUNDED_CLAIM_FALSIFIED" if cycles else "SURVIVES_CAPTURED_SCOPE",
        "claim_ceiling": "No cycle means only survives the captured scope; unlike edge predicates are never mixed.",
    }
    write_json(assay_root / "08-conceptual-dag.json", dag)
    order = [
        (1, "temporal-version-rescue"), (2, "promissory-topology"), (3, "evidence-lineage-fingerprinting"),
        (4, "contextual-typing-polycompilation-compiler-conservation"), (5, "authority-jurisdiction-claim-evidence-tomography"),
        (6, "referential-integrity"), (7, "order-discordance"), (8, "conceptual-dag-falsification"),
        (9, "canon-map-function-classification"), (10, "publishing-regime-change-points"),
    ]
    coverage = []
    for number, name in order:
        status = "EXECUTED_BOUNDED" if number == 8 else "INSTRUMENT_READY_BODY_ADJUDICATION_PENDING"
        coverage.append({"schema_version": "coverage-observation/v2", "atelier_snapshot_id": atelier_snapshot_id, "order": number, "trail_id": name, "status": status, "source_status": "ARCHIVE_OBSERVATION", "phase_2_run": True})
    inherited = [
        "author-self-model-versus-reconstructed-graph", "latent-versus-retrospective-architecture", "epistemic-object-lifecycle",
        "seven-part-versus-twelve-phase-noncollapse", "numerical-recurrence-3-5-7-9-12", "three-corpus-overlap",
        "first-structural-appearance", "representation-lifts", "surface-versus-epistemic-translation", "route-conditioned-knowledge",
        "typed-companion-cycles", "governance-coherence", "surface-withdrawal-resilience", "epistemic-object-state-vector",
        "representation-compression-first-appearance", "supported-versus-retained-capacity", "research-denominator-chain",
        "claim-ceiling-self-application", "provenance-audit-five-factor", "authority-state-machine", "canon-map-checkpoints",
        "promissory-topology", "polycompilation", "compiler-conservation", "evidence-multiplicity-noncollapse",
        "multi-order-clocks", "referential-integrity", "claim-evidence-tomography", "publishing-regime-change-points",
        "authority-jurisdiction-tomography", "expected-object-resolution", "structural-self-perception-delay",
    ]
    for trail in inherited:
        coverage.append({"schema_version": "coverage-observation/v2", "atelier_snapshot_id": atelier_snapshot_id, "trail_id": trail, "status": "REGISTERED_REQUIRES_BODY_OR_HUMAN_DISPOSITION", "source_status": "RESEARCHER_PROPOSED", "phase_2_run": True})
    write_jsonl(assay_root / "coverage-ledger.jsonl", sorted(coverage, key=lambda r: (r.get("order", 99), r["trail_id"])))
    subprocess.run(
        [sys.executable, str(args.root / "99-ADMIN" / "build-phase2-assays.py"), "--root", str(args.root)],
        check=True,
    )
    state.journal(None, "ASSAY_KILN", None, None, {"assay_order": [x[1] for x in order], "dag_result": dag["result"]})
    return 0


def phase2_files(root: Path) -> Iterator[Path]:
    excluded = {"state.sqlite3", "state.sqlite3-wal", "state.sqlite3-shm"}
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.name not in excluded and ".staging" not in path.parts:
            yield path


def command_seal(args: argparse.Namespace) -> int:
    if args.dry_run:
        print(json.dumps({"network_requests": 0, "writes": 0, "would_hash": sum(1 for _ in phase2_files(args.root))}, indent=2))
        return 0
    state = State(args.root)
    export_ledgers(state)
    entries = []
    for path in phase2_files(args.root):
        rel = path.relative_to(args.root).as_posix()
        if rel.startswith("04-RECEIPTS/phase2/seals/") or rel == "04-RECEIPTS/phase2/current-seal.json":
            continue
        entries.append({"path": rel, "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    seal_basis = "".join(compact_json(row) + "\n" for row in entries).encode("utf-8")
    seal_id = f"src-seal:{sha256_bytes(seal_basis)}"
    snapshot_row = state.db.execute("SELECT value FROM meta WHERE key='atelier_snapshot_id'").fetchone()
    atelier_snapshot_id = snapshot_row[0] if snapshot_row else "UNSEALED_WORKING_STATE"
    seal = {"schema_version": "src-seal/v1", "seal_id": seal_id, "atelier_snapshot_id": atelier_snapshot_id, "sealed_at": utc_now(), "runner": RUNNER_VERSION, "entries": entries}
    out = args.root / "04-RECEIPTS" / "phase2" / "seals" / seal_id.split(":", 1)[1]
    write_json(out / "seal.json", seal)
    write_json(args.root / "04-RECEIPTS" / "phase2" / "current-seal.json", {"seal_id": seal_id, "atelier_snapshot_id": atelier_snapshot_id, "path": (out / "seal.json").relative_to(args.root).as_posix()})
    print(json.dumps({"seal_id": seal_id, "entries": len(entries)}, indent=2))
    return 0


def copy_allowed(root: Path, destination: Path, profile: str) -> dict[str, int]:
    state = State(root, read_only=True)
    copied = 0; skipped = 0
    destination.mkdir(parents=True, exist_ok=True)
    always = ["README.md", "CONNECTOR_ENTRY.md", "NOTICE.md", "ATTRIBUTION.md", "01-MANIFESTS", "04-RECEIPTS", "05-OPERATIONS", "06-INSTRUMENTS", "07-ARCHIVE-LEDGER", "99-ADMIN", "aia"]
    for rel in always:
        source = root / rel
        if not source.exists(): continue
        target = destination / rel
        if source.is_dir():
            ignored = ["state.sqlite3*", ".staging"]
            if rel == "04-RECEIPTS":
                # A rights-filtered projection receives its own verifiable
                # manifest. The desktop seal can name omitted private paths.
                ignored.extend(["seals", "current-seal.json", "projection-seal.json"])
            shutil.copytree(source, target, dirs_exist_ok=True, ignore=shutil.ignore_patterns(*ignored))
        else:
            target.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(source, target)
    overlay = root / "99-ADMIN/projection-overlays"
    for name in ("README.md", "CONNECTOR_ENTRY.md"):
        source = overlay / name
        if source.is_file():
            shutil.copy2(source, destination / name)
    for row in state.db.execute("SELECT t.rights_state,b.local_path FROM targets t JOIN captures c ON c.target_id=t.target_id JOIN blobs b ON b.blob_id=c.blob_id"):
        if profile == "public" and row["rights_state"] != "PUBLIC_ALLOWED":
            skipped += 1; continue
        source = root / row["local_path"]
        target = destination / row["local_path"]
        target.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(source, target); copied += 1
    for row in state.db.execute("SELECT t.rights_state,d.local_path,d.locator_map_path FROM targets t JOIN captures c ON c.target_id=t.target_id JOIN derivatives d ON d.capture_id=c.capture_id"):
        if profile == "public" and row["rights_state"] != "PUBLIC_ALLOWED":
            skipped += 1; continue
        for key in ("local_path", "locator_map_path"):
            source = root / row[key]
            target = destination / row[key]
            target.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(source, target)
        parameters = json.loads(state.db.execute("SELECT parameters_json FROM derivatives WHERE local_path=?", (row["local_path"],)).fetchone()[0])
        for chunk_path in parameters.get("chunk_paths", []):
            source = root / chunk_path
            target = destination / chunk_path
            target.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(source, target)
        copied += 1
    if profile == "private":
        private_resolver = []
        for row in state.db.execute(
            """SELECT t.target_id,t.rights_state,c.capture_id,b.blob_id,b.local_path,d.derivative_id,d.local_path AS derivative_path,d.locator_map_path
               FROM targets t JOIN captures c ON c.target_id=t.target_id JOIN blobs b ON b.blob_id=c.blob_id
               LEFT JOIN derivatives d ON d.capture_id=c.capture_id WHERE t.rights_state!='PUBLIC_ALLOWED' ORDER BY t.target_id"""
        ):
            locator_id = stable_id("src-private-locator", row["target_id"], row["capture_id"])
            private_resolver.append({"private_body_locator_id": locator_id, **dict(row)})
        write_jsonl(destination / "01-MANIFESTS" / "phase2" / "private-body-resolver.jsonl", private_resolver)
    else:
        public_blob_ids = {row[0] for row in state.db.execute("SELECT DISTINCT c.blob_id FROM targets t JOIN captures c ON c.target_id=t.target_id WHERE t.rights_state='PUBLIC_ALLOWED'")}
        public_capture_ids = {row[0] for row in state.db.execute("SELECT c.capture_id FROM targets t JOIN captures c ON c.target_id=t.target_id WHERE t.rights_state='PUBLIC_ALLOWED'")}
        blob_rows = []
        for row in state.db.execute("SELECT * FROM blobs ORDER BY blob_id"):
            item = dict(row)
            if item["blob_id"] not in public_blob_ids:
                item["local_path"] = None
                item["custody_locator"] = "OPAQUE_PRIVATE_RESOLVER_ONLY"
            blob_rows.append(item)
        write_jsonl(destination / "01-MANIFESTS" / "phase2" / "blob-v1.jsonl", blob_rows)
        derivative_rows = []
        for row in state.db.execute("SELECT * FROM derivatives ORDER BY derivative_id"):
            if row["capture_id"] in public_capture_ids:
                item = dict(row)
                for key in ("parameters_json", "failures_json"):
                    item[key[:-5]] = json.loads(item.pop(key))
                derivative_rows.append(item)
        write_jsonl(destination / "01-MANIFESTS" / "phase2" / "derivative-v1.jsonl", derivative_rows)
        resolver_rows = []
        for row in state.db.execute("SELECT target_id,capture_id,rights_state FROM targets ORDER BY target_id"):
            item = {"entity_id": row["target_id"], "entity_type": "acquisition-target", "path": "01-MANIFESTS/phase2/acquisition-outcomes.jsonl", "capture_id": row["capture_id"]}
            if row["rights_state"] != "PUBLIC_ALLOWED" and row["capture_id"]:
                item["private_body_locator_id"] = stable_id("src-private-locator", row["target_id"], row["capture_id"])
            resolver_rows.append(item)
        for row in state.db.execute("SELECT capture_id,target_id FROM captures ORDER BY capture_id"):
            resolver_rows.append({"entity_id": row["capture_id"], "entity_type": "capture", "path": "01-MANIFESTS/phase2/capture-v2.jsonl", "parent_id": row["target_id"]})
        for row in state.db.execute("SELECT derivative_id,capture_id,local_path FROM derivatives ORDER BY derivative_id"):
            if row["capture_id"] in public_capture_ids:
                resolver_rows.append({"entity_id": row["derivative_id"], "entity_type": "derivative", "path": row["local_path"], "parent_id": row["capture_id"]})
        write_jsonl(destination / "01-MANIFESTS" / "phase2" / "entity-resolver-v2.jsonl", resolver_rows)
        opaque = []
        for row in state.db.execute("SELECT t.target_id,c.capture_id,b.sha256,b.byte_length FROM targets t JOIN captures c ON c.target_id=t.target_id JOIN blobs b ON b.blob_id=c.blob_id WHERE t.rights_state!='PUBLIC_ALLOWED' ORDER BY t.target_id"):
            opaque.append({
                "target_id": row["target_id"], "capture_id": row["capture_id"], "blob_sha256": row["sha256"],
                "byte_length": row["byte_length"], "private_body_locator_id": stable_id("src-private-locator", row["target_id"], row["capture_id"]),
                "custody_status": "VERIFIED_PRIVATE_CUSTODY", "private_path_disclosed": False,
            })
        write_jsonl(destination / "01-MANIFESTS" / "phase2" / "opaque-private-locators.jsonl", opaque)
        for private_path in (
            destination / "01-MANIFESTS" / "phase2" / "private-body-resolver.jsonl",
        ):
            with contextlib.suppress(FileNotFoundError): private_path.unlink()
    (destination / ".gitattributes").write_text(
        "02-ORIGINALS/blobs/** filter=lfs diff=lfs merge=lfs -text\n",
        encoding="utf-8",
    )
    return {"copied": copied, "rights_skipped": skipped}


def command_publish(args: argparse.Namespace) -> int:
    if args.dry_run:
        print(json.dumps({"network_requests": 0, "writes": 0, "profile": args.profile, "destination": str(args.destination)}, indent=2))
        return 0
    receipt_root = args.destination / "04-RECEIPTS" / "phase2"
    # Remove only stale generated seal artifacts from an earlier projection
    # pass. Every item is reproducible from the sealed desktop vault.
    stale_seal_directory = receipt_root / "seals"
    if stale_seal_directory.is_dir():
        shutil.rmtree(stale_seal_directory)
    for stale in (receipt_root / "current-seal.json", receipt_root / "projection-seal.json"):
        with contextlib.suppress(FileNotFoundError):
            stale.unlink()
    result = copy_allowed(args.root, args.destination, args.profile)
    write_json(args.destination / "projection.json", {"schema_version": "src-projection/v1", "profile": args.profile, "generated_at": utc_now(), **result})
    custody_current = json.loads((args.root / "04-RECEIPTS/phase2/current-seal.json").read_text(encoding="utf-8"))
    excluded = {
        "04-RECEIPTS/phase2/current-seal.json",
        "04-RECEIPTS/phase2/projection-seal.json",
    }
    entries = []
    for path in sorted(args.destination.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(args.destination).as_posix()
        if rel in excluded:
            continue
        entries.append({"path": rel, "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    projection_basis = "".join(compact_json(row) + "\n" for row in entries).encode("utf-8")
    projection_seal_id = f"src-projection-seal:{sha256_bytes(projection_basis)}"
    projection_seal = {
        "schema_version": "src-projection-seal/v1",
        "seal_id": custody_current["seal_id"],
        "atelier_snapshot_id": custody_current["atelier_snapshot_id"],
        "projection_profile": args.profile,
        "projection_seal_id": projection_seal_id,
        "generated_at": utc_now(),
        "entries": entries,
    }
    write_json(receipt_root / "projection-seal.json", projection_seal)
    write_json(receipt_root / "current-seal.json", {
        "seal_id": custody_current["seal_id"],
        "atelier_snapshot_id": custody_current["atelier_snapshot_id"],
        "projection_profile": args.profile,
        "projection_seal_id": projection_seal_id,
        "path": "04-RECEIPTS/phase2/projection-seal.json",
    })
    print(json.dumps(result, indent=2))
    return 0


def command_verify(args: argparse.Namespace) -> int:
    errors: list[str] = []
    state = State(args.root, read_only=True)
    for row in state.db.execute("SELECT * FROM blobs"):
        path = args.root / row["local_path"]
        if not path.is_file(): errors.append(f"missing blob {row['blob_id']}"); continue
        if path.stat().st_size != row["byte_length"] or sha256_file(path) != row["sha256"]:
            errors.append(f"invalid blob {row['blob_id']}")
    for row in state.db.execute("SELECT d.*,c.capture_id FROM derivatives d JOIN captures c ON c.capture_id=d.capture_id"):
        path = args.root / row["local_path"]
        if not path.is_file() or sha256_file(path) != row["output_sha256"]:
            errors.append(f"invalid derivative {row['derivative_id']}")
    orphans = state.db.execute("SELECT count(*) FROM captures c LEFT JOIN blobs b ON b.blob_id=c.blob_id WHERE b.blob_id IS NULL").fetchone()[0]
    if orphans: errors.append(f"orphan captures: {orphans}")
    nonterminal = state.db.execute("SELECT count(*) FROM targets WHERE state NOT IN ({})".format(",".join("?" for _ in TERMINAL_STATES)), tuple(TERMINAL_STATES)).fetchone()[0]
    outcomes = dict(state.db.execute("SELECT state,count(*) FROM targets GROUP BY state").fetchall())
    result = {"status": "FAIL" if errors else "PASS", "errors": errors, "nonterminal": nonterminal, "outcomes": outcomes}
    print(json.dumps(result, indent=2))
    return 1 if errors else 0


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="srcctl")
    p.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    p.add_argument("--dry-run", action="store_true", help="zero writes and zero network")
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    snap = sub.add_parser("snapshot"); snap.add_argument("--snapshot-id")
    sub.add_parser("plan")
    acq = sub.add_parser("acquire"); acq.add_argument("--platform", action="append", choices=PLATFORMS); acq.add_argument("--target-id", action="append"); acq.add_argument("--limit", type=int); acq.add_argument("--refresh", action="store_true", help="capture a new observation even when a prior target is terminal")
    ext = sub.add_parser("extract"); ext.add_argument("--limit", type=int); ext.add_argument("--repair-invalid", action="store_true")
    sub.add_parser("assay")
    sub.add_parser("seal")
    pub = sub.add_parser("publish"); pub.add_argument("--profile", required=True, choices=("public", "private")); pub.add_argument("--destination", required=True, type=Path)
    sub.add_parser("verify")
    return p


def main() -> int:
    p = parser(); args = p.parse_args(); args.root = args.root.resolve()
    return globals()[f"command_{args.command.replace('-', '_')}"](args)


if __name__ == "__main__":
    raise SystemExit(main())
