#!/usr/bin/env python3
"""Operator-gated live Zenodo delta sync for the SignalRupture Atelier.

Writes only SRC live/post-seal paths. It never mutates sealed Phase-2 receipts or
promotes captures into A15-R0 scientific authority.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from xml.etree import ElementTree as ET

USER_AGENT = "SRC-Zenodo-Operator-Sync/1.2 (+public preservation; operator gated)"
SCHEMA = "src-zenodo-operator-sync/v1"
ALLOWED_LICENSES = {"cc-by-4.0"}
# Zenodo caps anonymous /api/records search responses at 25 results/page.
ZENODO_PAGE_SIZE = 25
# Search endpoint rate limit is 30 requests/minute; 2.45s keeps us below it.
ZENODO_METADATA_PACE_SECONDS = 2.45


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def compact_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def append_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    rows = list(rows)
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        for row in rows:
            fh.write(compact_json(row) + "\n")


def iter_jsonl(path: Path) -> Iterable[dict[str, Any]]:
    if not path.exists():
        return
    with path.open("r", encoding="utf-8-sig") as fh:
        for line_no, line in enumerate(fh, 1):
            if not line.strip():
                continue
            try:
                value = json.loads(line)
            except Exception as exc:
                raise RuntimeError(f"invalid JSONL {path}:{line_no}: {exc}") from exc
            if isinstance(value, dict):
                yield value


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch(url: str, *, accept: str = "application/json", timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": accept,
        "Cache-Control": "no-cache",
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read()
    except urllib.error.HTTPError as exc:
        detail = ""
        try:
            detail = exc.read().decode("utf-8", errors="replace")[:1200]
        except Exception:
            pass
        raise RuntimeError(f"HTTP {exc.code} for {url}: {detail}") from exc


def fetch_json(url: str) -> dict[str, Any]:
    value = json.loads(fetch(url).decode("utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"expected JSON object from {url}")
    return value


def exact_creator(record: dict[str, Any], orcid: str) -> bool:
    creators = (record.get("metadata") or {}).get("creators") or []
    return any(str(c.get("orcid") or "").strip() == orcid for c in creators if isinstance(c, dict))


def query_creator_records(orcid: str, max_pages: int) -> list[dict[str, Any]]:
    query = urllib.parse.quote(f'creators.orcid:"{orcid}"')
    found: dict[str, dict[str, Any]] = {}
    for page in range(1, max_pages + 1):
        url = (
            "https://zenodo.org/api/records"
            f"?q={query}&sort=newest&size={ZENODO_PAGE_SIZE}&page={page}"
        )
        payload = fetch_json(url)
        hits_obj = payload.get("hits") or {}
        hits = hits_obj.get("hits") or []
        if not isinstance(hits, list):
            raise RuntimeError("Zenodo response has no hits list")
        for record in hits:
            if not isinstance(record, dict) or not exact_creator(record, orcid):
                continue
            rid = str(record.get("id") or record.get("recid") or "").strip()
            if rid:
                found[rid] = record
        total = hits_obj.get("total")
        if isinstance(total, dict):
            total = total.get("value")
        if not hits:
            break
        if isinstance(total, int) and page * ZENODO_PAGE_SIZE >= total:
            break
        if len(hits) < ZENODO_PAGE_SIZE:
            break
        time.sleep(ZENODO_METADATA_PACE_SECONDS)
    else:
        raise RuntimeError(
            f"Zenodo creator query exceeded max_pages={max_pages}; refusing incomplete delta claim"
        )
    return list(found.values())


def collect_captured_record_ids(src_root: Path) -> set[str]:
    captured: set[str] = set()
    candidate = src_root / "01-MANIFESTS" / "candidate-corpus.jsonl"
    for row in iter_jsonl(candidate):
        rid = str(row.get("source_record_id") or "").strip()
        if rid:
            captured.add(rid)
    live_manifest = src_root / "01-MANIFESTS" / "live" / "zenodo-post-seal-corpus.jsonl"
    for row in iter_jsonl(live_manifest):
        rid = str(row.get("record_id") or "").strip()
        if rid and row.get("metadata_capture_status") == "CAPTURED":
            captured.add(rid)
    rx = re.compile(r"^zenodo-(\d+)-metadata\.md$")
    for directory in (
        src_root / "03-DERIVATIVES" / "text" / "zenodo",
        src_root / "03-DERIVATIVES" / "text" / "live" / "zenodo",
    ):
        if directory.exists():
            for path in directory.glob("zenodo-*-metadata.md"):
                match = rx.match(path.name)
                if match:
                    captured.add(match.group(1))
    return captured


def safe_extension(name: str) -> str:
    ext = Path(name).suffix.lower()
    return ext if re.fullmatch(r"\.[a-z0-9]{1,10}", ext) else ".bin"


def store_live_blob(src_root: Path, data: bytes, extension: str) -> tuple[str, str]:
    digest = sha256(data)
    rel = Path("02-ORIGINALS") / "live" / "blobs" / digest[:2] / f"{digest}{extension}"
    path = src_root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and sha256(path.read_bytes()) != digest:
        raise RuntimeError(f"content-address collision at {path}")
    if not path.exists():
        path.write_bytes(data)
    return digest, rel.as_posix()


def verify_source_checksum(data: bytes, source_checksum: str | None, name: str) -> None:
    if not source_checksum:
        return
    algorithm, sep, expected = source_checksum.partition(":")
    algorithm, expected = algorithm.lower().strip(), expected.lower().strip()
    if not sep or algorithm not in {"md5", "sha256"}:
        return
    actual = hashlib.new(algorithm, data).hexdigest()
    if actual != expected:
        raise RuntimeError(f"checksum mismatch for {name}: expected {source_checksum}, got {algorithm}:{actual}")


def docx_text(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        xml = archive.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    out: list[str] = []
    for paragraph in root.iter(ns + "p"):
        text = "".join(node.text or "" for node in paragraph.iter(ns + "t")).strip()
        if text:
            out.append(text)
    return "\n\n".join(out)


def pdf_text(data: bytes) -> str:
    from pypdf import PdfReader  # type: ignore
    reader = PdfReader(io.BytesIO(data))
    return "\n\n".join(
        f"<!-- page {idx} -->\n{(page.extract_text() or '').strip()}"
        for idx, page in enumerate(reader.pages, 1)
    ).strip()


def html_text(value: str) -> str:
    value = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value)
    value = re.sub(r"(?i)<br\s*/?>", "\n", value)
    value = re.sub(r"(?i)</p\s*>", "\n\n", value)
    value = re.sub(r"(?s)<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"[ \t]+", " ", value)
    return re.sub(r"\n\s*\n\s*\n+", "\n\n", value).strip()


def extract_text(name: str, data: bytes) -> tuple[str, str]:
    ext = Path(name).suffix.lower()
    try:
        if ext == ".pdf":
            return pdf_text(data), "PYPDF_TEXT_EXTRACTED"
        if ext == ".docx":
            return docx_text(data), "DOCX_XML_TEXT_EXTRACTED"
        if ext in {".txt", ".md", ".csv", ".json"}:
            return data.decode("utf-8", errors="replace"), "TEXT_DECODED"
        if ext in {".html", ".htm"}:
            return html_text(data.decode("utf-8", errors="replace")), "HTML_TEXT_EXTRACTED"
    except Exception as exc:
        return "", f"EXTRACTION_ERROR:{type(exc).__name__}:{exc}"
    return "", "UNSUPPORTED_FILE_TYPE"


def metadata_markdown(record: dict[str, Any], metadata_sha: str, metadata_blob_path: str) -> str:
    title = str((record.get("metadata") or {}).get("title") or record.get("title") or "")
    rid = str(record.get("id") or record.get("recid") or "")
    payload = json.dumps(record, ensure_ascii=False, sort_keys=True, indent=2)
    return (
        "---\n"
        "schema: src-live-zenodo-metadata-derivative/v1\n"
        f'record_id: "{rid}"\n'
        f"source_title: {json.dumps(title, ensure_ascii=False)}\n"
        f"metadata_blob_sha256: {metadata_sha}\n"
        f"metadata_blob_path: {metadata_blob_path}\n"
        "authority: LIVE_POST_SEAL_METADATA_ONLY\n"
        "---\n\n```json\n" + payload + "\n```\n"
    )


def body_markdown(record: dict[str, Any], parts: list[dict[str, Any]]) -> str:
    metadata = record.get("metadata") or {}
    rid = str(record.get("id") or record.get("recid") or "")
    title = str(metadata.get("title") or record.get("title") or "")
    lines = [
        "---", "schema: src-live-zenodo-body-derivative/v1", f'record_id: "{rid}"',
        f"source_title: {json.dumps(title, ensure_ascii=False)}",
        "authority: LIVE_POST_SEAL_TEXT_DERIVATIVE", "---", "", f"# {title}", "",
    ]
    description = metadata.get("description")
    if isinstance(description, str) and description.strip():
        lines += ["## Zenodo description", "", html_text(description), ""]
    for part in parts:
        lines += [
            f"## Source file: {part['source_name']}", "",
            f"Extraction status: `{part['body_extraction_status']}`  ",
            f"SHA-256: `{part['sha256']}`", "",
            str(part.get("text") or "").strip() or "[No body text extracted from this source file.]", "",
        ]
    return "\n".join(lines).rstrip() + "\n"


def record_sort_key(record: dict[str, Any]) -> tuple[str, int]:
    return str(record.get("created") or ""), int(record.get("id") or record.get("recid") or 0)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--creator-orcid", default="0009-0009-9348-3534")
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--gate-issue", required=True)
    parser.add_argument("--relay-identity", required=True)
    parser.add_argument("--atelier-branch", required=True)
    parser.add_argument("--summary-path", type=Path, required=True)
    parser.add_argument("--max-pages", type=int, default=40)
    args = parser.parse_args()

    src_root = args.root.resolve()
    if not (src_root / "CONNECTOR_ENTRY.md").exists():
        raise RuntimeError(f"SRC root does not look valid: {src_root}")

    before_ids = collect_captured_record_ids(src_root)
    exact_records = query_creator_records(args.creator_orcid, args.max_pages)
    new_records = [r for r in exact_records if str(r.get("id") or r.get("recid")) not in before_ids]
    new_records.sort(key=record_sort_key)

    manifest_rows: list[dict[str, Any]] = []
    captured_ids: list[str] = []
    metadata_only_ids: list[str] = []
    extraction_partial_ids: list[str] = []

    for record in new_records:
        rid = str(record.get("id") or record.get("recid") or "")
        metadata = record.get("metadata") or {}
        title = str(metadata.get("title") or record.get("title") or "")
        access_right = str(metadata.get("access_right") or "").lower()
        license_id = str((metadata.get("license") or {}).get("id") or "").lower()
        public_files_allowed = access_right == "open" and license_id in ALLOWED_LICENSES

        metadata_bytes = (json.dumps(record, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode()
        metadata_sha, metadata_blob_path = store_live_blob(src_root, metadata_bytes, ".json")
        md_rel = Path("03-DERIVATIVES") / "text" / "live" / "zenodo" / f"zenodo-{rid}-metadata.md"
        (src_root / md_rel).parent.mkdir(parents=True, exist_ok=True)
        (src_root / md_rel).write_text(metadata_markdown(record, metadata_sha, metadata_blob_path), encoding="utf-8")

        file_rows: list[dict[str, Any]] = []
        body_parts: list[dict[str, Any]] = []
        if public_files_allowed:
            for source_file in record.get("files") or []:
                if not isinstance(source_file, dict):
                    continue
                name = str(source_file.get("key") or source_file.get("id") or "source.bin")
                encoded_name = urllib.parse.quote(name, safe="")
                url = f"https://zenodo.org/records/{rid}/files/{encoded_name}?download=1"
                data = fetch(url, accept="application/octet-stream", timeout=120)
                verify_source_checksum(data, source_file.get("checksum"), name)
                digest, blob_path = store_live_blob(src_root, data, safe_extension(name))
                text, extraction_status = extract_text(name, data)
                row = {
                    "source_name": name, "source_url": url,
                    "source_checksum": source_file.get("checksum"), "source_size": source_file.get("size"),
                    "captured_bytes": len(data), "sha256": digest, "blob_path": blob_path,
                    "capture_status": "CAPTURED", "body_extraction_status": extraction_status,
                }
                file_rows.append(row)
                body_parts.append({**row, "text": text})
        else:
            metadata_only_ids.append(rid)

        body_rel = Path("03-DERIVATIVES") / "text" / "live" / "zenodo" / f"zenodo-{rid}-body.md"
        (src_root / body_rel).write_text(body_markdown(record, body_parts), encoding="utf-8")
        good = {"PYPDF_TEXT_EXTRACTED", "DOCX_XML_TEXT_EXTRACTED", "TEXT_DECODED", "HTML_TEXT_EXTRACTED"}
        if any(p.get("body_extraction_status") not in good for p in file_rows if p.get("capture_status") == "CAPTURED"):
            extraction_partial_ids.append(rid)

        manifest_rows.append({
            "schema_version": "src-post-seal-zenodo-manifest/v1",
            "record_id": rid, "concept_record_id": str(record.get("conceptrecid") or ""),
            "title": title, "created_utc": record.get("created"), "modified_utc": record.get("modified"),
            "publication_date": metadata.get("publication_date"), "doi": record.get("doi"),
            "concept_doi": record.get("conceptdoi"),
            "source_url": (record.get("links") or {}).get("self_html") or f"https://zenodo.org/records/{rid}",
            "api_url": (record.get("links") or {}).get("self") or f"https://zenodo.org/api/records/{rid}",
            "creator_orcid": args.creator_orcid, "resource_type": metadata.get("resource_type"),
            "access_right": access_right, "license": license_id,
            "metadata_capture_status": "CAPTURED", "metadata_blob_sha256": metadata_sha,
            "metadata_blob_path": metadata_blob_path, "metadata_derivative_path": md_rel.as_posix(),
            "body_derivative_path": body_rel.as_posix(), "file_capture_authorized": public_files_allowed,
            "files": file_rows, "operator_gate_issue": str(args.gate_issue),
            "operator_relay": args.relay_identity, "sync_run_id": args.run_id,
            "archive_authority": "LIVE_POST_SEAL_INTAKE",
            "non_claims": [
                "capture implies canon admission", "capture implies empirical validation",
                "publication timing proves causation", "publication timing proves private workspace access",
            ],
        })
        captured_ids.append(rid)

    append_jsonl(src_root / "01-MANIFESTS" / "live" / "zenodo-post-seal-corpus.jsonl", manifest_rows)
    newest = max(exact_records, key=record_sort_key) if exact_records else None
    watermark = {
        "schema": "src-zenodo-delta-watermark/v1", "atelier_branch": args.atelier_branch,
        "creator_orcid": args.creator_orcid, "last_operator_sync": utc_now(), "last_run_id": args.run_id,
        "last_observed_created_utc": newest.get("created") if newest else None,
        "last_observed_record_id": str(newest.get("id") or newest.get("recid")) if newest else None,
        "captured_record_count_before": len(before_ids), "creator_records_observed": len(exact_records),
        "new_records_captured": len(captured_ids), "delta_method": "SET_DIFFERENCE_AGAINST_METADATA_CUSTODY",
        "note": "Timestamp and record number are observations, not sole exclusion criteria.",
    }
    write_json(src_root / "04-RECEIPTS" / "live" / "zenodo-delta-watermark.json", watermark)
    run_receipt = {
        "schema": SCHEMA, "run_id": args.run_id, "captured_at_utc": utc_now(),
        "gate_issue": str(args.gate_issue), "relay_identity": args.relay_identity,
        "atelier_branch": args.atelier_branch, "creator_orcid": args.creator_orcid,
        "query_scope": "PUBLIC_ZENODO_EXACT_CREATOR_ORCID",
        "creator_records_observed": len(exact_records), "preexisting_metadata_custody_count": len(before_ids),
        "new_record_count": len(captured_ids), "new_record_ids": captured_ids,
        "metadata_only_record_ids": metadata_only_ids,
        "partial_body_extraction_record_ids": extraction_partial_ids,
        "sealed_phase2_mutation": False, "a15_r0_scientific_mutation": False,
        "canon_promotion": False, "merge_authority": False,
        "publication_authority": False, "production_authority": False,
    }
    receipt_path = src_root / "04-RECEIPTS" / "live" / "zenodo-sync-runs" / f"{args.run_id}.json"
    write_json(receipt_path, run_receipt)
    summary = {
        "new_record_count": len(captured_ids), "new_record_ids": captured_ids,
        "metadata_only_record_ids": metadata_only_ids,
        "partial_body_extraction_record_ids": extraction_partial_ids,
        "creator_records_observed": len(exact_records),
        "run_receipt": receipt_path.relative_to(src_root).as_posix(),
    }
    args.summary_path.parent.mkdir(parents=True, exist_ok=True)
    write_json(args.summary_path, summary)
    print(compact_json(summary))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"SRC_ZENODO_SYNC_HELD: {type(exc).__name__}: {exc}", file=sys.stderr)
        raise
