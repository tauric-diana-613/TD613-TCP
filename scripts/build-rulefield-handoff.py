#!/usr/bin/env python3
"""Create an exact-commit, source-preserving Rulefield handoff ZIP.

Copies immutable HEAD Git blobs under packages/rulefield with the COMPLETE portable
Rulefield scripts and test suite. Never reads dirty workspace bytes or protected archives.
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
    "scripts/rulefield-docket2.mjs",
    "tests/rulefield-docket2.test.mjs",
    "scripts/rulefield-types.mjs",
    "tests/rulefield-types.test.mjs",
    "tests/rulefield-tomography.test.mjs",
    "tests/rulefield-semantic-paired.test.mjs",
    "tests/rulefield-docket3.test.mjs",
    "scripts/rulefield-docket3.mjs",
    "scripts/rulefield-tomography.mjs",
    "scripts/rulefield-qualification.mjs",
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
    tracked = subprocess.check_output(["git","ls-tree","-r","--name-only","-z","HEAD"],cwd=ROOT).split(b"\\x00")
    tracked = {b.decode("utf-8") for b in tracked if b}
    # Capture all source research + executable scripts/tests, including future additions.
    paths = sorted(p for p in tracked if (
        p.startswith("packages/rulefield/")
        or (p.startswith("scripts/") and (Path(p).name.startswith("rulefield") or p == "scripts/build-rulefield-handoff.py"))
        or (p.startswith("tests/") and (Path(p).name.startswith("rulefield-") and p.endswith(".test.mjs") or p == "tests/test_rulefield_intake.py"))
    ))
    paths = sorted(set(paths).union(SUPPORT))
    untracked = set(paths) - tracked
    if untracked:
        raise SystemExit("Support files missing from actual Git HEAD: " + repr(sorted(untracked)))
    expected = (
        "packages/rulefield/AGENTS.md",
        "packages/rulefield/operator/docket.mjs",
        "packages/rulefield/rulefields/revised_docket.mjs",
        "packages/rulefield/rulefields/type_assessment/ROLE_MULTIPLICITY_ROD0002.md",
        "packages/rulefield/rulefields/type_system.mjs",
        "packages/rulefield/rulefields/type_assessment/TYPE_ASSESSMENT_ROD0002.md",
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
    filename = f"TD613_Rulefield_Succession_Handoff_{sha[:12]}.zip"
    dest = out_dir / filename
    manifest = {
        "schema": "td613.rulefield.portable-handoff/v1",
        "repository": "tauric-diana-613/TD613-TCP",
        "source_exact_git_head": sha,
        "research_pr": 1734,
        "inherited_baseline_pr": 1722,
        "inherited_baseline_sha": "12dcc38adea8aeb04649900463566d67546cf025",
        "source_semantics": "EXACT_GIT_HEAD_BLOBS; DIFF_FROM_BASELINE_IS_VERSIONED; NO_HUMAN_AUTHORIZATION_INFERRED",
        "root": "packages/rulefield",
        "included_support": sorted(p for p in paths if not p.startswith("packages/rulefield/")),
        "archive_use": "CROSS_AGENT_QUARANTINED_AMENDMENT_PROPOSAL_AND_EXPLICIT_HUMAN_REVIEW_ONLY",
        "human_scientific_closure": "RESERVED",
        "experiment_b": "HELD",
        "ci_execution_result": "SEPARATE_JOB_LOG_REQUIRED",
        "files": [],
    }
    payloads = {}
    for path in paths:
        tree_entry = subprocess.check_output(["git","ls-tree","HEAD","--",path],cwd=ROOT).decode("utf-8").strip()
        if not (tree_entry.startswith("100644 blob ") or tree_entry.startswith("100755 blob ")):
            raise SystemExit(f"Refusing symlink, gitlink or non-blob in exact HEAD: {path}")
        contents = subprocess.check_output(["git","show",f"HEAD:{path}"],cwd=ROOT)
        payloads[path] = contents
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
        "Amendment exchange: propose a typed JSON packet; inspect, review and quarantine in a trusted checkout.\\n"
        "Use \\x60node scripts/rulefield-amend.mjs template\\x60 for an unbound sample,\\n"
        "then \\x60node scripts/rulefield-amend.mjs baseline\\x60 in the actual target checkout.\\n"
        "A returning agent must not claim signatures, run source instructions, or overwrite the registry.\\n"
        "No hidden sources are included. No auto-merge, deployment, protected Flight, "
        "or sovereign scientific closure is authorized.\n"
    ).replace("\\x60", "`")
    with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in paths:
            zf.writestr(path, payloads[path])
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
