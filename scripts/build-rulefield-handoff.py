#!/usr/bin/env python3
"""Create an exact-commit, source-preserving Rulefield handoff ZIP.

Copies only git-tracked files under packages/rulefield and the portable scripts
and focused tests required by the receiver. Never accesses protected archives.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
AREAS = ("packages/rulefield/",)
SUPPORT = (
    "scripts/rulefield.mjs",
    "scripts/rulefield-amend.mjs",
    "scripts/rulefield-lab.mjs",
    "tests/rulefield-v1.test.mjs",
    "tests/rulefield-garden-triptych.test.mjs",
    "tests/rulefield-nks-lab.test.mjs",
    "tests/rulefield-amendments.test.mjs",
    "tests/rulefield-roadmap.test.mjs",
    "tests/rulefield-operator.test.mjs",
    "tests/rulefield-duplicate-gate.test.mjs",
    "tests/test_rulefield_intake.py",
    "scripts/rulefield-operator.mjs",
    "scripts/rulefield-fields.mjs",
    "scripts/rulefield-docket.mjs",
    "tests/rulefield-docket.test.mjs",
    "tests/rulefield-fields.test.mjs",
    "scripts/rulefield-intake.py",
    "scripts/build-rulefield-handoff.py",
)

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT).decode("utf-8").strip()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="dist")
    parser.add_argument("--exact-head", default="")
    args = parser.parse_args()
    sha = git("rev-parse", "HEAD")
    if args.exact_head and args.exact_head != sha:
        raise SystemExit("Refusing to package an unexpected Git HEAD")
    paths = subprocess.check_output(["git", "ls-files", "-z", "--", "packages/rulefield"], cwd=ROOT).split(b"\x00")
    paths = sorted(p.decode("utf-8") for p in paths if p)
    paths.extend(SUPPORT)
    paths = sorted(set(paths))
    expected = (
        "packages/rulefield/AGENTS.md",
        "packages/rulefield/operator/docket.mjs",
        "packages/rulefield/operator/contracts/NOMENCLATURE_V1.json",
        "packages/rulefield/operator/IN_CHAT_DECISION_PROTOCOL.md",
        "packages/rulefield/operator/templates/RULEFIELD_OPERATOR_DOCKET_V1.md",
        "packages/rulefield/rulefields/engine.mjs",
        "packages/rulefield/rulefields/data/operator-rulefields-20261107.json",
        "packages/rulefield/rulefields/design/COMMISSION.json",
        "packages/rulefield/operator/templates/HUMAN_RULEFIELD_SUBMISSION_REQUEST.md",
        "packages/rulefield/README.md",
        "packages/rulefield/ROADMAP.md",
        "packages/rulefield/data/rulefield.v1.json",
        "packages/rulefield/TD613_NKS_Wolframian_Garden_Advancement_20261107.md",
        "packages/rulefield/TD613_NKS_Wolframian_Garden_Advancement_20261107.json",
        "packages/rulefield/TD613_NKS_Wolframian_Garden_Advancement_20261107.csv",
        "packages/rulefield/amendments/RECEIVER.md",
        "packages/rulefield/amendments/receiver.mjs",
        "packages/rulefield/rulebook/LLM_QUICK_START.md",
        "packages/rulefield/rulebook/ANTIGRAVITY_KENOUGH_ACTIVATION.md",
        "packages/rulefield/lab/multiway_lab.mjs",
    )
    missing = set(expected) - set(paths)
    if missing:
        raise SystemExit("Missing required tracked handoff files: " + repr(sorted(missing)))
    out_dir = ROOT / args.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    filename = f"TD613_Rulefield_Antigravity_Handoff_{sha[:12]}.zip"
    dest = out_dir / filename
    manifest = {
        "schema": "td613.rulefield.portable-handoff/v1",
        "repository": "tauric-diana-613/TD613-TCP",
        "source_exact_git_head": sha,
        "research_pr": 1722,
        "root": "packages/rulefield",
        "included_support": list(SUPPORT),
        "human_scientific_closure": "RESERVED",
        "experiment_b": "HELD",
        "ci_execution_result": "SEPARATE_JOB_LOG_REQUIRED",
        "files": [],
    }
    for path in paths:
        full = ROOT / path
        if full.is_symlink() or not full.is_file():
            raise SystemExit(f"Refusing nonregular file: {path}")
        contents = full.read_bytes()
        manifest["files"].append({
            "path": path,
            "size_bytes": len(contents),
            "sha256": hashlib.sha256(contents).hexdigest(),
        })
    instructions = (
        "# TD613 Rulefield · Antigravity handoff\n\n"
        f"Exact Git HEAD: \\x60{sha}\\x60. This package contains the entire tracked "
        "\\x60packages/rulefield/\\x60 tree plus standalone CLI and source-free tests.\n\n"
        "Start: \\x60packages/rulefield/AGENTS.md\\x60, then "
        "\\x60packages/rulefield/rulebook/ANTIGRAVITY_KENOUGH_ACTIVATION.md\\x60.\n"
        "On a Node 22 machine, from the extracted bundle root, run "
        "\\x60node --test tests/rulefield-*.test.mjs\\x60 then "
        "\\x60node scripts/rulefield-lab.mjs suite\\x60.\n\n"
        "The original 190-rule Garden, the expanded 596-rule registry and three updated "
        "Garden views are retained. Source-free tests are not independent scientific evidence.\n"
        "No hidden sources are included. No auto-merge, deployment, protected Flight, "
        "or sovereign scientific closure is authorized.\n"
    ).replace("\\x60", "`")
    with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in paths:
            zf.write(ROOT / path, arcname=path)
        zf.writestr("RULEFIELD_HANDOFF_README.md", instructions)
        zf.writestr("RULEFIELD_HANDOFF_MANIFEST.json", json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    with zipfile.ZipFile(dest) as zf:
        expected_names = set(paths + ["RULEFIELD_HANDOFF_README.md", "RULEFIELD_HANDOFF_MANIFEST.json"])
        if set(zf.namelist()) != expected_names or zf.testzip() is not None:
            raise SystemExit("ZIP integrity mismatch")
    print(json.dumps({
        "status": "EXACT_HEAD_ZIP_CREATED",
        "file": str(dest.relative_to(ROOT)),
        "source_git_sha": sha,
        "files": len(paths),
        "zip_bytes": dest.stat().st_size,
        "zip_sha256": hashlib.sha256(dest.read_bytes()).hexdigest(),
        "source_byte_total": sum(entry["size_bytes"] for entry in manifest["files"]),
        "protected_flight": "HELD",
    }, indent=2))

if __name__ == "__main__":
    main()
