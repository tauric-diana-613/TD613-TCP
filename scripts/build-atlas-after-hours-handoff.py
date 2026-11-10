#!/usr/bin/env python3
"""Atlas After Hours — exact-Git-HEAD, portable, source-free succession estate.

Build packages ONLY from retained Git blobs. Do not depend on dirty worktrees.
Verify ZIP without extracting or running imported code.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
from pathlib import PurePosixPath, Path
import posixpath
import re
import stat
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
MANIFEST_NAME = "ATLAS_AFTER_HOURS_HANDOFF_MANIFEST.json"
README_NAME = "ATLAS_AFTER_HOURS_HANDOFF_README.md"
SCHEMA = "td613.atlas-after-hours.portable-succession/v1"
MAX_ENTRIES = 1500
MAX_TOTAL = 100 * 1024 * 1024
GIT_HEAD = "HEAD"
REPO = "tauric-diana-613/TD613-TCP"
BASE = "7b4b9a4c955c94a0058261c2f5ec2eef00c07056"
ORIGINAL_ARCHIVE_SHA256 = "98f4767fa1d6c4d792aeeca43c1c2105ce037b8468965b7a9961ca9be63e9db6"

def git(*args: str) -> bytes:
    return subprocess.check_output(["git", *args], cwd=ROOT)

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def blob_sha(data: bytes) -> str:
    return hashlib.sha1(("blob %d\0" % len(data)).encode() + data).hexdigest()

def safe(name: str) -> str:
    if not isinstance(name,str) or not name or "\\" in name or "\0" in name or name.startswith("/") or ":" in name:
        raise ValueError("UNSAFE_ARCHIVE_PATH")
    if any(x in ("", ".", "..") for x in name.split("/")):
        raise ValueError("UNSAFE_ARCHIVE_TRAVERSAL")
    return name

def git_tree() -> dict[str,tuple[str,str]]:
    data = git("ls-tree","-r","-z",GIT_HEAD)
    entries = {}
    for line in data.split(bytes([0])):
        if not line: continue
        meta, path = line.split(b"\t",1)
        mode, kind, oid = meta.decode().split()
        entries[path.decode()] = (mode,oid)
    return entries

def source_bytes(path: str) -> bytes:
    safe(path)
    return git("show", f"{GIT_HEAD}:{path}")

def includes(path: str) -> bool:
    return (
        path.startswith("packages/atlas-after-hours/")
        or path.startswith("packages/rulefield/")
        or path.startswith("dossier/")
        or path.startswith("artifacts/atlas-after-hours/")
        or path in ("ARCHIVE_INDEX.md","ATLAS_EIGHTH_ORDER_SUCCESSOR_MANIFEST.json",
                    "ATLAS_EIGHTH_ORDER_RUNBOOK.md","ATLAS_EIGHTH_ORDER_ADJUDICATION.md",
                    "ATLAS_NINTH_ORDER_RUNBOOK.md", "scripts/build-atlas-after-hours-handoff.py",
                    "scripts/run-atlas-after-hours-trial.mjs",
                    "scripts/run-dollhouse-skill-audit.mjs",
                    "scripts/run-seventh-order-metrology-trial.mjs",
                    "scripts/run-eighth-order-reparative-trial.mjs",
                    "scripts/run-ninth-order-confluence-trial.mjs",
                    "scripts/check-atlas-pr1735-dollhouse-verdict.mjs",
                    "tests/test_rulefield_intake.py")
        or (path.startswith("scripts/rulefield") and path.endswith((".mjs",".py")))
        or (path.startswith("tests/rulefield-") and path.endswith(".test.mjs"))
        or (path.startswith("tests/atlas-after-hours-") and path.endswith(".test.mjs"))
    )

def resolve_relative(source: str, reference: str, tree: dict) -> str | None:
    if not reference.startswith("."):
        return None
    candidate=posixpath.normpath(posixpath.join(posixpath.dirname(source),reference))
    for attempt in (candidate,candidate+".js",candidate+".mjs",candidate+"/index.js"):
        if attempt in tree: return attempt
    raise ValueError(f"UNRESOLVED_RELATIVE_IMPORT:{source}:{reference}")

IMPORTS = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]""")
def dependency_closure(paths: set[str], tree:dict) -> set[str]:
    # Restrict generated portable scientific engine to tracked source-free code dependencies.
    queue=list(sorted(paths))
    seen=set()
    while queue:
        path=queue.pop()
        if path in seen:continue
        seen.add(path)
        if not path.endswith((".mjs",".js",".cjs")):continue
        data=source_bytes(path).decode("utf-8")
        for match in IMPORTS.finditer(data):
            dep=resolve_relative(path,match.group(1),tree)
            if dep is None: continue
            # No implicit access to protected archives or alternate private subtrees.
            if not (
                dep.startswith(("app/engine/","packages/rulefield/","packages/atlas-after-hours/"))
                or dep.startswith(("scripts/","tests/"))
                or dep == "app/dome-world/ash/canonical-json.js"  # exact read-only transitive geometry/custody codec
            ):
                raise ValueError("IMPORT_OUTSIDE_SOURCE_FREE_SCOPE:"+path+":"+dep)
            if dep not in paths:
                paths.add(dep);queue.append(dep)
    return paths

def build(destination:Path, expected_head:str)->dict:
    head=git("rev-parse",GIT_HEAD).decode().strip()
    if expected_head and expected_head != head:raise ValueError("EXACT_GIT_HEAD_MISMATCH")
    tree=git_tree()
    historic=json.loads(source_bytes("ATLAS_EIGHTH_ORDER_SUCCESSOR_MANIFEST.json"))
    original=historic["files"]
    expected_historic={x["path"] for x in original}
    if len(original)!=197 or len(expected_historic)!=197:raise ValueError("HISTORICAL_197_PATH_MANIFEST_CHANGED")
    if not expected_historic.issubset(tree):raise ValueError("HISTORICAL_197_PATH_ABSENT")
    # The original packet has 187 paths; ten appended in the eighth successor.
    eighth_added={
        "ATLAS_EIGHTH_ORDER_ADJUDICATION.md","ATLAS_EIGHTH_ORDER_RUNBOOK.md",
        "THE_HOME_THAT_SURVIVED_ITS_INHABITANTS.md",
        "artifacts/atlas-after-hours/counterworld-loom/berlantian_reparative_counterworlds.json",
        "artifacts/atlas-after-hours/reparative_consequence_docket.json",
        "dossier/THE_HOME_THAT_SURVIVED_ITS_INHABITANTS.md",
        "packages/rulefield/lab/eighth_order_reparative_consequence.mjs",
        "scripts/rulefield.mjs","scripts/run-eighth-order-reparative-trial.mjs",
        "tests/rulefield-eighth-order-reparative-consequence.test.mjs"
    }
    if len(expected_historic-eighth_added)!=187 or not eighth_added.issubset(expected_historic):
        raise ValueError("ORIGINAL_187_PATH_INHERITANCE_CHANGED")
    for path in expected_historic:
        mode,_=tree[path]
        if mode not in ("100644","100755"):raise ValueError("SYMLINK_OR_GITLINK_HISTORICAL_ENTRY:"+path)
    receipt=json.loads(source_bytes("artifacts/atlas-after-hours/predecessor_source_custody_receipt.json"))
    if len(receipt["restored"])!=18:raise ValueError("PREDECESSOR_NOT_18")
    for item in receipt["restored"]:
        for p in (item["path"],item["mirror"]):
            if p not in tree or tree[p][1]!=item["blobSha"]:
                raise ValueError("PREDECESSOR_BYTE_CUSTODY_FAILURE:"+p)
    mandatory={"packages/atlas-after-hours/README.md","packages/atlas-after-hours/AGENTS.md",
                "packages/atlas-after-hours/AUDIT_REPAIR_LEDGER.md",
                "scripts/build-atlas-after-hours-handoff.py",
                "tests/atlas-after-hours-original-zip-inventory.test.mjs",
                "tests/atlas-after-hours-predecessor-byte-custody.test.mjs",
                "packages/rulefield/lab/ninth_order_confluence.mjs",
                "packages/rulefield/lab/ninth_order_generalization.mjs",
                "tests/rulefield-ninth-order-confluence.test.mjs",
                "tests/rulefield-ninth-order-generalization.test.mjs"}
    selected={p for p in tree if includes(p)} | expected_historic | mandatory
    if not selected.issubset(tree):raise ValueError("MISSING_PORTABLE_REQUIRED_SOURCE:"+repr(sorted(selected-set(tree))))
    # Code required to actually execute the master Atlas seven-chamber trial and native audit
    selected |= {
        "app/engine/atlas-mathematical-engine.js",
        "app/engine/dollhouse-atlas-relational-custody.js",
        "app/engine/dollhouse-skill-dispatcher.js",
    }
    selected=dependency_closure(selected,tree)
    if len(selected)>MAX_ENTRIES:raise ValueError("TOO_MANY_PORTABLE_SOURCES")
    entries=[]
    payload={}
    total=0
    for path in sorted(selected):
        safe(path)
        mode,oid=tree[path]
        if mode not in ("100644","100755"):raise ValueError("UNSAFE_GIT_MODE:"+path)
        b=source_bytes(path)
        if blob_sha(b)!=oid:raise ValueError("NONMATCHING_GIT_BLOB:"+path)
        total+=len(b)
        if total>MAX_TOTAL:raise ValueError("PORTABLE_ARCHIVE_TOO_LARGE")
        payload[path]=b
        entries.append({"path":path,"git_blob_sha1":oid,"size_bytes":len(b),"sha256":sha256(b)})
    manifest={
        "schema":SCHEMA,"repository":REPO,"source_exact_git_head":head,
        "research_pr":1735,"base_pr":1731,"base_head_at_first_reconciliation":BASE,
        "original_antigravity_zip_sha256_external_only":ORIGINAL_ARCHIVE_SHA256,
        "original_antigravity_entry_count":187,"eighth_successor_entry_count":197,
        "restored_original_predecessor_count":18,"restored_predecessor_mirror_count":18,
        "scientific_claim_ceiling":"SOURCE_FREE_FINITE_SYNTHETIC_ONLY",
        "native_dollhouse_adversarial_disposition":"HELD_NOT_A_REAL_WORLD_VIOLATION_FINDING",
        "human_scientific_closure":"RESERVED","protected_experiment_b":"HELD",
        "release_or_deployment_authority":False,
        "all_files_source":"EXACT_GIT_HEAD_BLOBS_NOT_WORKING_TREE",
        "source_files":entries
    }
    intro=(
        "# 𝌋 Atlas After Hours — ONE-PIECE PORTABLE SCIENTIFIC ESTATE\n\n"
        f"Origin Git commit: {head}\n"
        "Original 187 Antigravity source paths retained; original 18 predecessor docs and their 18 mirrors preserved by Git blob identity.\n"
        "Start: packages/atlas-after-hours/README.md, AGENTS.md and AUDIT_REPAIR_LEDGER.md.\n"
        "Run source-free research: node --test tests/atlas-after-hours-*.test.mjs tests/rulefield-ninth-order-*.test.mjs\n"
        "Run seven-chamber trial (source-free; separate from native audit): node scripts/run-atlas-after-hours-trial.mjs\n"
        "For native Dollhouse execution, an actual Git checkout and declared source revision are additionally required.\n"
        "All files retain original repository-relative paths; root dossier/ is historical, not a new main-branch directory.\n"
        "This ZIP carries source, not automatic authority, real-world evidence, user consent or release status.\n"
        "No canonical rule promotion; Experiment B HELD; human scientific closure RESERVED.\n"
    )
    destination.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(destination,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for path in sorted(payload):z.writestr(path,payload[path])
        z.writestr(README_NAME,intro)
        z.writestr(MANIFEST_NAME,json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    verdict=verify(destination)
    return {"status":"EXACT_HEAD_ATLAS_ZIP_CREATED","path":str(destination),"git_head":head,
            "files":len(entries),"original_paths":187,"predecessor_custody":18,
            "size_bytes":destination.stat().st_size,"sha256":sha256(destination.read_bytes()),
            "reverified":verdict["status"],"scientific_closure":"RESERVED"}

def verify(path:Path)->dict:
    if not path.is_file():raise ValueError("ARCHIVE_NOT_FOUND")
    with zipfile.ZipFile(path) as z:
        contents=z.infolist()
        if not (2<len(contents)<=MAX_ENTRIES+2):raise ValueError("ZIP_ENTRY_COUNT_INVALID")
        seen=set()
        total=0
        for item in contents:
            name=safe(item.filename)
            if name in seen:raise ValueError("DUPLICATE_PATH")
            seen.add(name)
            if item.is_dir() or stat.S_ISLNK(item.external_attr>>16):
                raise ValueError("SYMLINK_OR_DIRECTORY_REFUSED")
            total+=item.file_size
            if total>MAX_TOTAL+2_000_000:raise ValueError("UNCOMPRESSED_LIMIT_EXCEEDED")
            if item.file_size>20_000_000:raise ValueError("OVERSIZED_SINGLE_ENTRY")
            if item.compress_size and item.file_size/item.compress_size>1000:
                raise ValueError("SUSPICIOUS_COMPRESSION_RATIO")
        if z.testzip() is not None:raise ValueError("ZIP_CRC_FAILURE")
        if MANIFEST_NAME not in seen or README_NAME not in seen:raise ValueError("MISSING_ATLAS_MANIFEST")
        manifest=json.loads(z.read(MANIFEST_NAME))
        if manifest.get("schema")!=SCHEMA:raise ValueError("INVALID_ATLAS_SCHEMA")
        if manifest.get("research_pr")!=1735 or manifest.get("protected_experiment_b")!="HELD" or manifest.get("human_scientific_closure")!="RESERVED" or manifest.get("release_or_deployment_authority") is not False:
            raise ValueError("AUTHORITY_CONTRACT_BREACHED")
        if not re.fullmatch(r"[0-9a-f]{40}",manifest.get("source_exact_git_head","")):
            raise ValueError("INVALID_SOURCE_REVISION")
        expected=manifest.get("source_files")
        if not isinstance(expected,list) or not expected:raise ValueError("EMPTY_SOURCE_MANIFEST")
        if {x["path"] for x in expected}|{MANIFEST_NAME,README_NAME}!=seen:
            raise ValueError("SOURCE_ENTRY_SET_DIFFERENCE")
        for item in expected:
            b=z.read(item["path"])
            if sha256(b)!=item["sha256"] or len(b)!=item["size_bytes"] or blob_sha(b)!=item["git_blob_sha1"]:
                raise ValueError("SOURCE_HASH_FAILURE:"+item["path"])
        return {"status":"VERIFIED_SOURCE_PRESERVING_ATLAS_ARCHIVE","source_git_sha":manifest["source_exact_git_head"],
                "source_files":len(expected),"original_antigravity_paths":manifest["original_antigravity_entry_count"],
                "original_predecessors":manifest["restored_original_predecessor_count"],
                "scientific_closure":"RESERVED"}

def main():
    ap=argparse.ArgumentParser()
    mode=ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--exact-head",type=str)
    mode.add_argument("--verify",type=Path)
    ap.add_argument("--output-dir",default="dist")
    args=ap.parse_args()
    if args.verify:
        print(json.dumps(verify(args.verify),indent=2))
    else:
        head=git("rev-parse",GIT_HEAD).decode().strip()
        name=f"TD613_Atlas_After_Hours_Succession_{head[:12]}.zip"
        print(json.dumps(build(ROOT/args.output_dir/name,args.exact_head),indent=2))

if __name__=="__main__":
    try:main()
    except Exception as exc:
        print(json.dumps({"status":"HELD_ATLAS_PORTABLE_HANDOFF","error":str(exc),"canonical_mutation":False}),file=sys.stderr)
        sys.exit(1)
