#!/usr/bin/env python3
"""Read-only exact Git-object census for SRC and Em's ORIGINAL native engines.

An intact frozen source tree is necessary but not sufficient for functional
inheritance. Never advertise full parity from this census alone.
"""
from __future__ import annotations
import argparse
import json
import subprocess

BASE="packages/dome_world_exact/fixtures/a15-r0"
PINNED={
 "SRC":"b3e69acf587d534eeef2e01d0bb5bdbdecdbd320",
 "EMSTD613":"70b5a0f9e94626cba6068f41c6117e7978800bbd",
}
REQUIRED={
 "SRC":[
  "99-ADMIN/srcctl.py","99-ADMIN/srcquery.py",
  "99-ADMIN/build-phase2-assays.py",
  "99-ADMIN/run-projective-routing-grammar-assay.py",
  "06-INSTRUMENTS/THREE_STRATUM_PROJECTIVE_OVERLAY_ASSAY.md",
  "06-INSTRUMENTS/PROJECTIVE_ROUTING_GRAMMAR.md",
  "05-OPERATIONS/relations/typed-edges.jsonl",
  "05-OPERATIONS/relations/recompilation-edges.jsonl",
  "05-OPERATIONS/maps/canon-map-snapshots.jsonl",
  "05-OPERATIONS/phase2/contextual-role-assertions.jsonl",
  "05-OPERATIONS/phase2/claim-evidence-tomography.jsonl",
  "05-OPERATIONS/phase2/compilation-passes.jsonl",
  "05-OPERATIONS/phase2/researcher-proposed-trails.jsonl",
 ],
 "EMSTD613":[
  "01-MANIFESTS/source-files.jsonl",
  "01-MANIFESTS/structural-inventory.jsonl",
  "01-MANIFESTS/batch-b-2026-09-11-source-files-v2.jsonl",
  "01-MANIFESTS/em-tic-archaeological-control.jsonl",
  "03-DERIVATIVES/derivative-index.jsonl",
  "06-INSTRUMENTS/LINEAGE_ASSAY_PROTOCOL.md",
  "06-INSTRUMENTS/ACADEMIA_SUI_GENERIS_SIEVE_V0_1.md",
  "06-INSTRUMENTS/ANISOTROPIC_AUTHORITY_RECOVERABILITY_ASSAY_V0_1.md",
  "06-INSTRUMENTS/MOTIF_TO_MECHANISM_TRANSLATION.md",
  "06-INSTRUMENTS/OBFUSCATION_DECOMPRESSION_PROTOCOL.md",
  "06-INSTRUMENTS/CLAIM_CEILING_PROPAGATION_V0_1.md",
  "07-ARCHIVE-LEDGER/2026-09-01-intake-integrity.json"
 ]
}
def command(*args):
    result=subprocess.run(["git",*args],capture_output=True,text=True,check=True,timeout=25)
    return result.stdout.strip()

def audit(estate):
    if estate not in REQUIRED:raise ValueError("UNREGISTERED_ESTATE")
    head=PINNED[estate]
    # Exact immutable object identity, never an index derived from a moving PR.
    root=command("rev-parse","--verify",f"{head}^{{commit}}")
    if root!=head:raise ValueError("PINNED_COMMIT_IDENTITY_DRIFT")
    rows=[]
    for suffix in REQUIRED[estate]:
        path=f"{BASE}/{estate}/{suffix}"
        line=command("ls-tree",head,"--",path)
        tokens=line.split("\t")
        if len(tokens)!=2 or tokens[1]!=path:raise ValueError(f"NATIVE_ASSET_MISSING:{estate}:{suffix}")
        header=tokens[0].split()
        if len(header)!=3 or header[1]!="blob" or header[0]!="100644":
            raise ValueError(f"NATIVE_BLOB_TYPE_REFUSED:{estate}:{suffix}")
        rows.append({"path":path,"git_blob":header[2],
                     "byte_length":int(command("cat-file","-s",header[2]))})
    return {"estate":estate,"pinned_head":head,"original_asset_count":len(rows),
      "exact_native_git_objects":rows,
      "native_objects_rewritten":0,
      "original_corpus_replay_count":0,
      "functional_port_parity":"NOT_EARNED_BY_INVENTORY",
      "status":"ALL_LISTED_NATIVE_BLOBS_PRESENT"}

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--estate",choices=sorted(REQUIRED),default=None)
    args=parser.parse_args()
    print(json.dumps([audit(args.estate)] if args.estate else [audit(k) for k in REQUIRED],indent=2))
