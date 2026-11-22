#!/usr/bin/env python3
"""Produce a complete, source-bound, Vixen-scoped engineering stack ZIP.

This artifact is distinct from the runnable browser preview ZIP: it includes
tracked application, historical-preserving reference, relevant scripts, tests,
workflows and human/agent documentation. Excludes the rest of the monorepo,
credentials, untracked files, and transient build outputs. The exact list and
hashes are preserved in an in-archive manifest.
"""
import argparse
import hashlib
import json
import os
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREFIXES = (
    "app/encyclopedia/vix-cyb.html",
    "app/encyclopedia/vix-cyb/",
    "app/encyclopedia/vixen-estate/",
    "app/encyclopedia/reference/",
    "app/encyclopedia/assets/vixen/",
    "app/encyclopedia/llms.txt",
    "app/site-epoch-preflight.js",
    "scripts/vixen-",
    "scripts/run-vixen-",
    "scripts/package-vixen-",
    "scripts/verify-vixen-",
    "scripts/install-vixen-",
    "scripts/audit-vixen-",
    "tests/vixen-",
    "tests/fixtures/vixen/",
    "artifacts/vixen-dual-estate/",
    "docs/vixen-",
    ".github/workflows/td613-ci.yml",
    ".github/workflows/vercel-relock-safety.yml",
    "VIXEN_START_HERE.md",
    "AGENTS.md",
    "package.json",
    "package-lock.json",
)
EXCLUDE = (".env", ".secret", "node_modules", "__pycache__", ".git/", ".DS_Store")

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT).decode().strip()

def includes(path):
    if any(x in path for x in EXCLUDE):
        return False
    return any(path == p or path.startswith(p) for p in PREFIXES)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main(out):
    revision = git("rev-parse", "HEAD")
    if len(revision) != 40:
        raise RuntimeError("Exact Git source SHA unavailable")
    tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")
    selected = sorted(x for x in tracked if x and includes(x))
    if not selected or "app/encyclopedia/vix-cyb.html" not in selected:
        raise RuntimeError("Vixen source entry absent")
    if not any(p.startswith("tests/vixen-") for p in selected):
        raise RuntimeError("Vixen regression tests absent from stack")
    files = {}
    for p in selected:
        resolved = (ROOT / p).resolve()
        if not resolved.is_relative_to(ROOT.resolve()) or not resolved.is_file():
            raise RuntimeError("Missing, symlink escape or non-file: " + p)
        files[p] = resolved.read_bytes()
    manifest = {
        "schema": "td613.vixen.source-stack/v1",
        "source_revision": revision,
        "scope": "VIXEN_SCOPED_TRACKED_REPOSITORY_FILES",
        "note": "Complete tracked Vixen application/source/dependency/runner stack; not an entire TD613 monorepo clone. Private external historical originals are neither embedded nor reattributed.",
        "browser_preview_zip": "Build separately with scripts/package-vixen-preview.py",
        "physical_iphone_observation": False,
        "scientific_credit": 0,
        "file_count": len(files),
        "files": [
            {"path": p, "byte_length": len(b), "sha256": sha(b)}
            for p, b in sorted(files.items())
        ],
    }
    root_label = "TD613_Vixen_Source_Stack_" + revision[:12]
    readme = (
        "# Vixen source and test stack\n\n"
        "Source: " + revision + "\n\n"
        "Contains the tracked Vixen-facing files, code, dependency locks, "
        "tests and workflows, with SHA-256 receipts in SOURCE-MANIFEST.json.\n"
        "This is an engineering custody archive, distinct from the runnable "
        "browser preview and from separate historical original-source checkouts.\n"
        "Begin with VIXEN_START_HERE.md and obey AGENTS.md and the Opera source boundaries.\n"
        "No production, original-source mutation, hydration, or human approval is implied.\n"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
        def put(name, data):
            info = zipfile.ZipInfo(root_label + "/" + name, date_time=(2026, 11, 22, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, data)
        for p, data in sorted(files.items()):
            put(p, data)
        put("SOURCE-MANIFEST.json", (json.dumps(manifest, indent=2) + "\n").encode())
        put("README.md", readme.encode())
    with zipfile.ZipFile(out) as z:
        corrupt = z.testzip()
        if corrupt:
            raise RuntimeError("Corrupt stack ZIP member: " + corrupt)
    print(json.dumps({
        "status": "VIXEN_SOURCE_STACK_PACKAGED", "source_revision": revision,
        "file_count": len(files), "archive": str(out),
        "zip_bytes": out.stat().st_size, "zip_sha256": sha(out.read_bytes())
    }))

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--out", type=Path, required=True)
    a = p.parse_args()
    main(a.out)
