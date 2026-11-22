#!/usr/bin/env python3
"""Package the full public Vixen distributable stack plus Vixen engineering files.
This does NOT purport to be every file in the larger TD613-TCP monorepo.
Never include private provider credentials, other estates' original sources, or
unsupported scientific/authorial claims. Digest all included contents.
"""
import argparse, hashlib, json, subprocess, sys, tempfile
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED,ZipInfo

ROOT=Path(__file__).resolve().parents[1]
def digest(b):return hashlib.sha256(b).hexdigest()
def zipadd(z,name,content,inventory):
    if name.startswith('/') or '..' in Path(name).parts:raise ValueError('UNSAFE_PATH '+name)
    info=ZipInfo(name,date_time=(2020,1,1,0,0,0))
    info.compress_type=ZIP_DEFLATED
    info.external_attr=(0o644<<16)
    z.writestr(info,content)
    inventory.append({'path':name,'sha256':digest(content),'byte_length':len(content)})

def files_for_stack():
    items=[]
    def add(p):
        if not p.is_file() or p.is_symlink():return
        rp=p.relative_to(ROOT).as_posix()
        if rp not in {f.relative_to(ROOT).as_posix() for f in items}:items.append(p)
    for n in ['AGENTS.md','VIXEN_START_HERE.md','package.json','package-lock.json',
              '.github/workflows/td613-ci.yml','.github/workflows/vercel-relock-safety.yml',
              # Unrelated shared encyclopedia and Hush operator documentation excluded.]:
        p=ROOT/n
        if p.exists():add(p)
    for pattern in ['scripts/*vixen*','tests/*vixen*','docs/*vixen*','docs/*VIXEN*',
                    'tests/fixtures/vixen/**/*','artifacts/vixen-dual-estate/*.md']:
        for p in sorted(ROOT.glob(pattern)):
            if p.is_file():add(p)
    # All app/encyclopedia content is already included by the public preview,
    # including its full reference index and 1141 individually verified records.
    return sorted(items,key=lambda p:p.relative_to(ROOT).as_posix())

def main(out):
    head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    if len(head)!=40:raise ValueError('UNVERIFIED_HEAD')
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='vixen-full-stack-') as temp:
        preview=Path(temp)/'Preview.zip'
        subprocess.check_call([sys.executable,str(ROOT/'scripts/package-vixen-preview.py'),'--out',str(preview)],cwd=ROOT)
        manifest=[]
        with ZipFile(out,'w',compression=ZIP_DEFLATED,compresslevel=7) as target:
            with ZipFile(preview) as packaged:
                entries=packaged.namelist()
                if not any(n.endswith('/encyclopedia/vix-cyb.html') for n in entries):
                    raise ValueError('MISSING_VIXEN_APP')
                for name in entries:
                    if name.endswith('/'):continue
                    # Preserve the existing exact-head preview hierarchy.
                    tail=name.split('/',1)[-1]
                    zipadd(target,'VIXEN_STACK/distributable/'+tail,packaged.read(name),manifest)
            for p in files_for_stack():
                zipadd(target,'VIXEN_STACK/repository/'+p.relative_to(ROOT).as_posix(),p.read_bytes(),manifest)
            readme=f"""# VIXEN CYBERNETICS — complete scoped stack snapshot

Git revision: {head}
Preview entrypoint: distributable/encyclopedia/vix-cyb.html
Public AI research guide: distributable/encyclopedia/vix-cyb/llms.txt
Machine contract: distributable/encyclopedia/reference/podium/manifest.json
Operator/agent reentry: repository/VIXEN_START_HERE.md

This archive includes every byte in the generated Vixen HTTP distributable,
its full source index and public runtime, plus available Vixen-scoped scripts,
tests, fixture files, relevant operator docs and qualification workflows.
It is a source-scoped package, not a clone of every TD613-TCP monorepo
estate, not a promise that private external native engines are included,
and not an original external provenance witness.

Original historical source bytes, immutable titles and type boundaries are
preserved inside their existing authorized public preview representation.
No provider credentials, private source acquisitions, hydration or release.

Archive SHA-256 for each member is in STACK_CONTENT_MANIFEST.json.
Human aesthetic, identity and scientific closure remain RESERVED.
OPERAHOUSE != OPERA != PERFORMER.
"""
            zipadd(target,'VIXEN_STACK/README_SCOPE.md',readme.encode(),manifest)
            source={'schema':'td613.vixen.stack-review-archive/v1','source_revision':head,
                    'files':sorted(manifest,key=lambda x:x['path']),
                    'scope':'FULL_VIXEN_DISTRIBUTABLE_PLUS_REPOSITORY_VIXEN_SCOPED_FILES',
                    'other_repo_estates_included':False,'scientific_credit':0}
            target.writestr('VIXEN_STACK/STACK_CONTENT_MANIFEST.json',
                            json.dumps(source,indent=2,ensure_ascii=False).encode()+b'\n')
    with ZipFile(out) as check:
        bad=check.testzip()
        if bad:raise ValueError('ARCHIVE_BAD_CRC '+bad)
        names=check.namelist()
    print(json.dumps({'status':'PACKAGED_SCOPED_VIXEN_STACK','source_revision':head,
                     'path':str(out),'size':out.stat().st_size,'members':len(names),
                     'sha256':digest(out.read_bytes())},sort_keys=True))

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--out',type=Path,required=True)
    main(a.parse_args().out)
