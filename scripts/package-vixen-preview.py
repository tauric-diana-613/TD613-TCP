#!/usr/bin/env python3
"""Create the exact-head Vixen HTTP preview from public app assets only."""
import argparse, hashlib, json, os, re, subprocess
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/"app"
REF=APP/"encyclopedia"/"reference"
PREFIX="TD613_Vixen_Cybernetics_Preview"
def sha(data): return hashlib.sha256(data).hexdigest()
def head():
    value=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    if not re.fullmatch("[0-9a-f]{40}",value): raise ValueError("Unverified Git HEAD")
    return value

def main(out):
    candidate=(APP/"encyclopedia"/"vix-cyb.html").read_text(encoding="utf8")
    assert 'id="vixen-estate-manifest"' in candidate and 'id="view-reference"' in candidate, "Wrong Vixen candidate"
    assert candidate.count('id="vixen-corpus-bundle"')==1
    index=json.loads((REF/"directory.json").read_text(encoding="utf8"))
    graph=json.loads((REF/"graph.json").read_text(encoding="utf8"))
    manifest=json.loads((REF/"manifest.json").read_text(encoding="utf8"))
    assert manifest["edition_version"]=="1.4" and manifest["record_count"]==1141
    assert len(index)==1141 and len(graph["edges"])==2131 and len({e["id"] for e in index})==1141
    for e in index:
        p=APP/"encyclopedia"/e["record_path"]
        assert e["record_path"]=="reference/records/"+e["id"]+".json" and p.is_file(),e["id"]
        data=p.read_bytes()
        canonical=data[:-1] if data.endswith(b"\n") else data
        assert sha(canonical)==e["record_sha256"],"Reference digest: "+e["id"]
    base=[
        APP/"site-epoch-preflight.js",
        APP/"encyclopedia"/"index.html",
        APP/"encyclopedia"/"vix-cyb.html"
    ]
    for folder in (APP/"encyclopedia"/"reference",APP/"encyclopedia"/"vixen-estate"):
        base += [f for f in folder.rglob("*") if f.is_file() and not f.name.startswith(".")]
    files={p.relative_to(APP).as_posix():p.read_bytes() for p in base}
    readme="""# Vixen Cybernetics Encyclopedia / PR #1730 browser preview

This exact-Git-HEAD preview contains the Vixen operator-facing page,
its historical 32 Works / eight identity gates / 21 protocols, and the
SEPARATE 1,141-record Universal reference estate.

## Start in a web browser

1. Unzip the archive. Open a terminal in this extracted directory
   (the one containing the encyclopedia subfolder).
2. Run either:
       Windows:        py -m http.server 6130
       macOS / Linux:  python3 -m http.server 6130
3. Open http://127.0.0.1:6130/encyclopedia/vix-cyb.html

Do not open the HTML by double-clicking (file scheme blocks the modules
and reference requests). A local HTTP server is sufficient: GitHub main
and public TD613.com deployment are not required.

## Test the encounter

Open the Reference chamber; select a Vixen Work; Begin Inquiry; enter
Eclipse; query the Universal index; open G-001; inspect the canonical
JSON SHA-256 verification and its claim ceiling; Name; Rest; resume.
Also inspect the original Observatory and the eight unclosed identity gates.

## Scope and limits

Source edition 1.4 is read-only. The separately developed native
Universal Atelier SQLite backend is NOT wired into production here.
No private Em source bodies; no backend source mutation or automatic
scientific promotion; no protected Experiment B launch; no release.
Unmatched terms and unavailable references must produce honest HELD
or bounded-negative outcomes.
See PREVIEW-MANIFEST.json for exact commit and file hashes.
"""
    source=head()
    file_manifest=[{"path":n,"sha256":sha(blob),"bytes":len(blob)} for n,blob in sorted(files.items())]
    files["README.md"]=readme.encode("utf8")
    files["PREVIEW-MANIFEST.json"]=(json.dumps({
        "schema":"td613.vixen.preview/v1","repository":"tauric-diana-613/TD613-TCP",
        "pr":1730,"source_commit":source,"route":"/encyclopedia/vix-cyb.html",
        "reference_count":len(index),"reference_edges":len(graph["edges"]),
        "status":"DRAFT_NOT_RELEASED","experiment_b_flight":"HELD",
        "human_closure":"RESERVED","files":file_manifest
    },ensure_ascii=False,indent=2)+"\n").encode("utf8")
    out.parent.mkdir(parents=True,exist_ok=True)
    with ZipFile(out,"w",ZIP_DEFLATED,compresslevel=8) as z:
        for name,blob in sorted(files.items()):
            info=ZipInfo(PREFIX+"/"+name,(2026,11,8,12,0,0))
            info.compress_type=ZIP_DEFLATED;info.external_attr=0o644<<16
            z.writestr(info,blob,compress_type=ZIP_DEFLATED,compresslevel=8)
    print(json.dumps({"archive":str(out),"source_commit":source,"files":len(files),
       "size_bytes":out.stat().st_size,"sha256":sha(out.read_bytes()),
       "reference_records":len(index),"reference_edges":len(graph["edges"])}))
if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",default="artifacts/vixen-preview/Vixen_Encyclopedia_PR1730.zip")
    main(Path(ap.parse_args().out))
