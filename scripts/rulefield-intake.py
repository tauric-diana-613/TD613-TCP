#!/usr/bin/env python3
"""𝌋 Rulefield portable handoff intake (offline, verification-first).

Verifies an exact-file manifest and stages a copy in quarantine only.
Never executes imported code or changes packages/rulefield/, Git or Flight.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import stat
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
MAX_UNCOMPRESSED = 256 * 1024 * 1024
MAX_FILES = 10000
MAX_RATIO = 500
EXTRA = {"RULEFIELD_HANDOFF_MANIFEST.json", "RULEFIELD_HANDOFF_README.md"}

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def checked_name(name: str) -> str:
    if not isinstance(name, str) or not name or "\\" in name or "\x00" in name or name.startswith("/") or ":" in name:
        raise ValueError("UNSAFE_ARCHIVE_PATH")
    p = PurePosixPath(name)
    if any(s in ("..", ".", "") for s in name.split("/")) or p.is_absolute():
        raise ValueError("ARCHIVE_TRAVERSAL")
    return name

def open_validated(payload: bytes):
    z = zipfile.ZipFile(io.BytesIO(payload))
    infos = [i for i in z.infolist() if not i.is_dir()]
    if len(infos) > MAX_FILES:
        raise ValueError("TOO_MANY_ARCHIVE_ENTRIES")
    if len(infos) == 1 and infos[0].filename.endswith(".zip"):
        item = infos[0]
        checked_name(item.filename)
        if item.file_size > MAX_UNCOMPRESSED:
            raise ValueError("OVERSIZED_NESTED_ARCHIVE")
        return open_validated(z.read(item))
    seen = set()
    total = 0
    for i in z.infolist():
        checked_name(i.filename.removesuffix("/") if i.is_dir() else i.filename)
        if i.filename in seen:
            raise ValueError("DUPLICATE_ARCHIVE_ENTRY")
        seen.add(i.filename)
        mode = (i.external_attr >> 16)
        if stat.S_ISLNK(mode):
            raise ValueError("ARCHIVE_SYMLINK_REFUSED")
        if not i.is_dir() and (i.file_size < 0 or i.file_size > MAX_UNCOMPRESSED):
            raise ValueError("OVERSIZED_ARCHIVE_ENTRY")
        if i.compress_size == 0 and i.file_size > 0:
            raise ValueError("INVALID_COMPRESSION_RATIO")
        if i.compress_size and i.file_size / i.compress_size > MAX_RATIO:
            raise ValueError("ZIP_BOMB_RATIO")
        total += i.file_size
        if total > MAX_UNCOMPRESSED:
            raise ValueError("ARCHIVE_EXCEEDS_LIMIT")
    if "RULEFIELD_HANDOFF_MANIFEST.json" not in seen:
        raise ValueError("MISSING_HANDOFF_MANIFEST")
    manifest = json.loads(z.read("RULEFIELD_HANDOFF_MANIFEST.json"))
    if manifest.get("schema") != "td613.rulefield.portable-handoff/v1":
        raise ValueError("UNRECOGNIZED_HANDOFF_SCHEMA")
    expected = manifest.get("files")
    if not isinstance(expected, list) or not expected:
        raise ValueError("EMPTY_OR_INVALID_SOURCE_MANIFEST")
    expected_paths = set()
    for item in expected:
        if not isinstance(item, dict) or not isinstance(item.get("path"), str):
            raise ValueError("INVALID_MANIFEST_ENTRY")
        path = checked_name(item["path"])
        in_package = path.startswith("packages/rulefield/")
        allowed_script = (
            path in {"scripts/build-rulefield-handoff.py", "scripts/rulefield-intake.py", "scripts/rulefield.mjs"}
            or (path.startswith("scripts/rulefield-") and path.endswith(".mjs"))
        )
        allowed_test = (
            path == "tests/test_rulefield_intake.py"
            or (path.startswith("tests/rulefield-") and path.endswith(".test.mjs"))
        )
        if not (in_package or allowed_script or allowed_test):
            raise ValueError("SOURCE_OUTSIDE_RULEFIELD")
        if path in expected_paths:
            raise ValueError("DUPLICATE_MANIFEST_PATH")
        expected_paths.add(path)
        if path not in seen:
            raise ValueError("MANIFEST_SOURCE_MISSING")
        data = z.read(path)
        if len(data) != item.get("size_bytes") or sha(data) != item.get("sha256"):
            raise ValueError("MANIFEST_SOURCE_HASH_MISMATCH")
    if set(i.filename for i in infos) != expected_paths | EXTRA:
        raise ValueError("UNDECLARED_SOURCE_ENTRY")
    if z.testzip() is not None:
        raise ValueError("ZIP_CRC_FAILURE")
    if not isinstance(manifest.get("source_exact_git_head"),str):
        raise ValueError("MISSING_EXACT_REVISION")
    return z,manifest,infos

def compare(z, manifest):
    states = []
    incoming = set()
    for item in manifest["files"]:
        path = item["path"]
        incoming.add(path)
        target = ROOT / path
        old = sha(target.read_bytes()) if target.exists() and target.is_file() and not target.is_symlink() else None
        status = "ADDED" if old is None else ("BYTE_IDENTICAL" if old == item["sha256"] else "MODIFIED")
        states.append({"path":path,"status":status,"incoming_sha256":item["sha256"],"local_sha256":old})
    current = set(p.relative_to(ROOT).as_posix() for p in (ROOT/"packages/rulefield").rglob("*")
                  if p.is_file() and not p.is_symlink() and ".git" not in p.parts)
    absent = sorted(current-incoming)
    return states,absent

def stage(z, manifest, input_path, outroot: Path, digest):
    base = outroot / digest[:20]
    base.mkdir(parents=True, exist_ok=True)
    entries,absent = compare(z,manifest)
    for item in manifest["files"]:
        path = item["path"]
        p = base / path
        p.parent.mkdir(parents=True,exist_ok=True)
        data = z.read(path)
        if p.exists():
            if not p.is_file() or sha(p.read_bytes()) != sha(data):
                raise ValueError("INTAKE_COLLISION")
        else:
            p.write_bytes(data)
    result = {
        "schema":"td613.rulefield.quarantined-intake/v1",
        "source_archive":input_path.name,
        "input_sha256":digest,
        "source_commit_claim":manifest["source_exact_git_head"],
        "verified_manifest":True,"source_file_count":len(entries),
        "comparison":entries,
        "current_files_absent_from_archive":absent,
        "quarantine_root":str(base),
        "operator_authorization":"NOT_OBTAINED",
        "canonical_source_mutated":False,"protected_flight":"HELD",
        "rule_adoption":"NOT_REQUESTED",
        "next":"Review differences; split candidates <=64/packet; run trusted receiver and full disclosure; ask human."
    }
    (base/"RULEFIELD_INTAKE_REPORT.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")
    lines=["# 𝌋 Rulefield Imported Archive · Quarantined Verification","",
           "**Verified source files:** "+str(len(entries))+" · **Canonical files mutated:** NONE",
           "**ZIP SHA-256:** "+digest,"**Manifest commit claim:** "+manifest["source_exact_git_head"],"",
           "| Path | State |", "|---|---|"]
    lines.extend("| "+x["path"]+" | "+x["status"]+" |" for x in entries)
    lines.extend(["","## Current Rulefield paths absent from imported ZIP",""])
    lines.extend("- "+p for p in absent)
    lines.extend(["","Import proves stated file bytes match the supplied manifest, not source independence or human authorization.",
                  "Return to amendments and operator disclosure before any staged synthesis."])
    (base/"RULEFIELD_INTAKE_REPORT.md").write_text("\n".join(lines)+"\n",encoding="utf8")
    return result

def main():
    p = argparse.ArgumentParser()
    p.add_argument("action",choices=("verify","stage"))
    p.add_argument("archive",type=Path)
    p.add_argument("--output-dir",type=Path,default=ROOT/".rulefield-intake")
    args = p.parse_args()
    data=args.archive.read_bytes()
    z,manifest,infos=open_validated(data)
    changes,absent=compare(z,manifest)
    report={"status":"ARCHIVE_VERIFIED_SOURCE_FREE","schema":manifest["schema"],
      "input_sha256":sha(data),"declared_source_sha":manifest["source_exact_git_head"],
      "source_files":len(manifest["files"]),"entries":len(infos),
      "added":sum(x["status"]=="ADDED" for x in changes),
      "modified":sum(x["status"]=="MODIFIED" for x in changes),
      "unchanged":sum(x["status"]=="BYTE_IDENTICAL" for x in changes),
      "absent_from_import":len(absent),"no_canonical_mutation":True}
    if args.action=="stage":
        report=stage(z,manifest,args.archive,args.output_dir,sha(data))
    print(json.dumps(report,indent=2))
if __name__=="__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"status":"HELD_UNVERIFIED_ARCHIVE","error":str(e),"canonical_mutation":False}),file=sys.stderr)
        sys.exit(1)
