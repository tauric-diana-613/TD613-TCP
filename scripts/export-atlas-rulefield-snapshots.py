#!/usr/bin/env python3
from pathlib import Path
import subprocess, zipfile, json, hashlib
specs=[("atlas","7b4b9a4c955c94a0058261c2f5ec2eef00c07056","TD613_Atlas_After_Hours_GitHub_7b4b9a4c.zip"),("rulefield","12dcc38adea8aeb04649900463566d67546cf025","TD613_Rulefield_GitHub_12dcc38a.zip")]
Path("dist").mkdir(exist_ok=True)
def pick(p,scope):
    s=p.as_posix(); n=p.name.lower()
    if s.startswith("packages/rulefield/"): return True
    if p.parts[0]=="scripts" and any(x in n for x in ("rulefield","atlas","counterworld","dollhouse-skill-audit")): return True
    if p.parts[0]=="tests" and "rulefield" in n: return True
    if scope=="atlas":
        return s.startswith(("dossier/","artifacts/atlas-after-hours/")) or s=="encyclopedia/vix-cyb.html" or (len(p.parts)==1 and (n.startswith(("the_","witness_","atlas_")) or n in ("archive_index.md","rulefield_handoff_manifest.json","rulefield_handoff_readme.md")))
    return len(p.parts)==1 and n.startswith("rulefield_")
for scope,sha,name in specs:
    root=Path("source")/scope
    head=subprocess.check_output(["git","rev-parse","HEAD"],cwd=root,text=True).strip()
    assert head==sha,(scope,head,sha)
    tracked=subprocess.check_output(["git","ls-files","-z"],cwd=root)
    paths=sorted((Path(b.decode("utf-8")) for b in tracked.split(b"\\0") if b),key=lambda p:p.as_posix())
    selection=[p for p in paths if pick(p,scope)]
    assert len(selection)>110,(scope,len(selection))
    m={"schema":"td613.github.exact-head-subsystem-snapshot/v1","repository":"tauric-diana-613/TD613-TCP","source_commit":sha,"source_pr":1731 if scope=="atlas" else 1722,"scope":scope,"kind":"UNMODIFIED_TRACKED_SOURCE_WITH_SCOPE_SELECTION","scientific_closure":"RESERVED","protected_experiment_b":"HELD","files":{}}
    out=Path("dist")/name
    with zipfile.ZipFile(out,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
        for p in selection:
            data=(root/p).read_bytes()
            m["files"][p.as_posix()]={"sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data)}
            z.writestr(p.as_posix(),data)
        z.writestr("SNAPSHOT_PROVENANCE.json",json.dumps(m,indent=2,ensure_ascii=False)+"\\n")
        z.writestr("SNAPSHOT_SHA256SUMS.txt","".join(f"{v['sha256']}  {p}\\n" for p,v in m["files"].items()))
    with zipfile.ZipFile(out) as z:
        assert z.testzip() is None
        assert len(z.namelist())==len(selection)+2
        for p,v in m["files"].items():assert hashlib.sha256(z.read(p)).hexdigest()==v["sha256"]
    print(json.dumps({"scope":scope,"commit":sha,"source_files":len(selection),"bytes":out.stat().st_size,"verified":True}))
