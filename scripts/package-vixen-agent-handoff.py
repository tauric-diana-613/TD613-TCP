#!/usr/bin/env python3
"""Reproducible, source-editable Vixen PR #1730 handoff; never a release warrant."""
import argparse, hashlib, json, os, subprocess, stat
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT=Path(__file__).resolve().parents[1]
PREFIX='TD613_VIXEN_PR1730_AGENT_HANDOFF/'
DATE=(2026,11,14,0,0,0)
CORE={'AGENTS.md','VIXEN_START_HERE.md','package.json','package-lock.json',
      'vercel.json','.github/workflows/td613-ci.yml',
      '.github/workflows/vercel-operator-release.yml',
      '.github/workflows/vercel-relock-safety.yml',
      'app/site-epoch-preflight.js','scripts/run-dollhouse-design.mjs'}
TREES=('app/encyclopedia/','artifacts/vixen-dual-estate/',
       '.agents/skills/dollhouse-design/','.agents/skills/dollhouse-audit/',
       'packages/dollhouse/','packages/aperture/')
SCRIPTS=('vixen-','run-vixen-','verify-vixen-','package-vixen-','install-vixen-')

def digest(blob): return hashlib.sha256(blob).hexdigest()
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT)

def include(path):
    if path in CORE or path.startswith(TREES): return True
    if path.startswith('scripts/'): return Path(path).name.startswith(SCRIPTS)
    if path.startswith('tests/'): return Path(path).name.startswith(('vixen-','vix-cyb-'))
    if path.startswith('docs/'): return Path(path).name.startswith(('vixen-','VIXEN-'))
    return False

def main(out):
    head=git('rev-parse','HEAD').decode().strip()
    branch=git('branch','--show-current').decode().strip() or os.environ.get('GITHUB_HEAD_REF','')
    assert branch=='research/vixen-dual-estate-encyclopedia-20261108',('WRONG_BRANCH',branch)
    paths=sorted(p.decode() for p in git('ls-files','-z').split(b'\0') if p and include(p.decode()))
    required={'AGENTS.md','VIXEN_START_HERE.md','app/encyclopedia/vix-cyb.html',
       'app/encyclopedia/assets/vixen/frontispiece-desktop.png',
       'app/encyclopedia/assets/vixen/frontispiece-mobile.png',
       'app/encyclopedia/assets/vixen/fox-arcflash.svg',
       'app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs',
       'app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs',
       'app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs',
       'app/encyclopedia/reference/manifest.json','tests/vixen-folded-cuirass.test.mjs',
       'tests/vixen-browser-visual-witness.mjs',
       'scripts/package-vixen-agent-handoff.py',
       'artifacts/vixen-dual-estate/VIXEN_OPTICAL_TRIBUNAL_FINAL_20261112.md'}
    assert required.issubset(paths),('MISSING',sorted(required-set(paths)))
    records=[p for p in paths if p.startswith('app/encyclopedia/reference/records/') and p.endswith('.json')]
    assert len(records)==1141,('RECORD_COUNT',len(records))
    files={};inventory=[]
    for p in paths:
        assert not PurePosixPath(p).is_absolute() and '..' not in PurePosixPath(p).parts
        f=ROOT/p
        assert f.is_file() and not f.is_symlink() and stat.S_ISREG(f.stat().st_mode),('UNSAFE',p)
        data=f.read_bytes();files[p]=data
        inventory.append({'path':p,'sha256':digest(data),'bytes':len(data)})
    guide="""# Vixen Cybernetics — source-editable coding-agent handoff, PR #1730

Source paths are repository-relative. Start with VIXEN_START_HERE.md,
AGENTS.md and app/encyclopedia/vixen-estate/AGENTS.md. File hashes are in
HANDOFF-MANIFEST.json. This guide adds no new custody or release authority.

Run the Vixen browser preview from the extracted archive root:
    python3 -m http.server 6130 --directory app
    # open http://127.0.0.1:6130/encyclopedia/vix-cyb.html

For targeted engineering after dependency setup:
    npm ci
    node --test tests/vixen-folded-cuirass.test.mjs tests/vixen-motion-graph.test.mjs
    node --test tests/vixen-room-optics.test.mjs tests/vixen-room-radiance.test.mjs

The bundled GitHub CI source specifies Chromium qualification. This is a
SCOPED EDITABLE VIXEN export, not the entire 13,000+ tracked-file repository.
Broader tests or native transitive dependencies may require a full checkout
of the exact SHA recorded in the manifest. No redundant browser preview or
Chromium screenshots are included; those are separate exact-head artifacts.

GREEN engineering is not artistic acceptance, GPU parity, an independent
empirical witness, permission to merge, or authority to deploy production.
Accepted assets, source identities, and original holds remain preserved.
Human closure RESERVED.
"""
    manifest={'schema':'td613.vixen.agent-handoff/v1',
      'repository':'tauric-diana-613/TD613-TCP','pr':1730,
      'source_commit':head,'branch':branch,'record_count':len(records),
      'scope':'SCOPED_EDITABLE_VIXEN_SUBSYSTEM','full_repository':False,
      'merge_authority':False,'production_deployment':False,
      'human_closure':'RESERVED','files':inventory}
    files['HANDOFF.md']=guide.encode()
    files['HANDOFF-MANIFEST.json']=(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n').encode()
    out.parent.mkdir(parents=True,exist_ok=True)
    with ZipFile(out,'w',compression=ZIP_DEFLATED,compresslevel=6) as z:
        for p,data in sorted(files.items()):
            info=ZipInfo(PREFIX+p,DATE);info.compress_type=ZIP_DEFLATED
            info.external_attr=0o100644<<16
            z.writestr(info,data)
    with ZipFile(out) as z:
        assert len(z.namelist())==len(files)
        for p,data in files.items(): assert z.read(PREFIX+p)==data,('ZIP_ROUNDTRIP',p)
    print(json.dumps({'archive':str(out),'head':head,'files':len(files),
      'records':len(records),'archive_sha256':digest(out.read_bytes()),
      'bytes':out.stat().st_size},sort_keys=True))

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--out',default='artifacts/vixen-preview/VIXEN_PR1730_COMPLETE_AGENT_HANDOFF.zip')
    args=parser.parse_args()
    main((ROOT/args.out).resolve())
