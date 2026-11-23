#!/usr/bin/env python3
"""Vixen exact-HEAD archive staging. Read-only repository; no release action.

Usage:
 python stage_vixen_archives.py --repo /path/to/TD613-TCP --out /path/to/release
 python stage_vixen_archives.py --repo /path/to/TD613-TCP --out /path/to/release \
  --https-witness /path/to/unpacked/verified-witness \
  --served-receipt /path/to/independently-verified-served-revision.json

The HTTPS receipt MUST be independently obtained; a self-declared SHA does not
prove live source identity. Audit screenshot bytes with audit_final_surface.py.
"""
from argparse import ArgumentParser
from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile
import subprocess,sys,json,re,shutil

def run(*cmd,cwd=None):return subprocess.check_output(cmd,cwd=cwd,text=True).strip()
def digest(path):
    with path.open('rb') as f:return sha256(f.read()).hexdigest()
def safe_file(root,path):
    x=(root/path).resolve()
    if not x.is_relative_to(root.resolve()) or not x.is_file() or x.is_symlink():raise ValueError('UNSAFE_OR_MISSING '+str(path))
    return x
def main():
    ap=ArgumentParser()
    ap.add_argument('--repo',type=Path,required=True)
    ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--https-witness',type=Path)
    ap.add_argument('--served-receipt',type=Path)
    args=ap.parse_args()
    if bool(args.https_witness)!=bool(args.served_receipt):raise SystemExit('HTTPS_WITNESS_AND_INDEPENDENT_RECEIPT_REQUIRED_TOGETHER')
    repo=args.repo.resolve();out=args.out.resolve()
    head=run('git','rev-parse','HEAD',cwd=repo)
    if not re.fullmatch('[a-f0-9]{40}',head):raise SystemExit('INVALID_HEAD')
    if run('git','status','--porcelain',cwd=repo):
        raise SystemExit('REPOSITORY_NOT_CLEAN_EXACT_HEAD_REQUIRED')
    out.mkdir(parents=True,exist_ok=True)
    stack=out/('Vixen_Cybernetics_Full_Stack_'+head+'.zip')
    http=out/('Vixen_HTTP_Preview_Payload_'+head+'.zip')
    for script,dest in [('package-vixen-review-stack.py',stack),('package-vixen-preview.py',http)]:
        subprocess.check_call([sys.executable,str(safe_file(repo,Path('scripts')/script)),'--out',str(dest)],cwd=repo)
    witness=None
    if args.https_witness:
        source=args.https_witness.resolve()
        if not source.is_dir():raise SystemExit('WITNESS_DIRECTORY_MISSING')
        report=json.loads(safe_file(source,Path('COVERAGE.json')).read_text())
        attestation=json.loads(args.served_receipt.read_text())
        if report.get('source_revision')!=head or not report.get('complete') or report.get('errors'):
            raise SystemExit('WITNESS_UNQUALIFIED')
        if not report.get('mode','').startswith('CHROMIUM_HTTPS_'):
            raise SystemExit('WITNESS_NOT_HTTPS')
        if attestation.get('product_head')!=head or attestation.get('origin')!=report.get('witness_url_origin'):
            raise SystemExit('SERVED_SOURCE_MISMATCH')
        if attestation.get('independent_served_revision_verified') is not True:
            raise SystemExit('INDEPENDENT_SERVED_REVISION_NOT_VERIFIED')
        if not str(attestation.get('served_html_sha256','')).isalnum() or len(attestation['served_html_sha256'])!=64:
            raise SystemExit('SERVED_HTML_SHA256_RECEIPT_REQUIRED')
        records=report.get('images') or []
        if not records:raise SystemExit('ZERO_WITNESS_IMAGES')
        entries={'COVERAGE.json','INDEX.html'}
        for entry in records:
            rel=entry.get('file')
            if not isinstance(rel,str) or not rel.lower().endswith('.jpg'):raise SystemExit('INVALID_SCREENSHOT_PATH')
            p=safe_file(source,Path(rel))
            if p.stat().st_size!=entry.get('byte_length') or digest(p)!=entry.get('sha256'):
                raise SystemExit('FAILED_SCREENSHOT_INTEGRITY '+rel)
            entries.add(rel)
        actual={p.relative_to(source).as_posix() for p in source.rglob('*.jpg')}
        if actual!={x for x in entries if x.endswith('.jpg')}:
            raise SystemExit('UNINDEXED_OR_MISSING_JPEG')
        witness=out/('Vixen_Chromium_Full_Surface_'+head+'.zip')
        with ZipFile(witness,'w') as z:
            for rel in sorted(entries):z.write(safe_file(source,Path(rel)),arcname=rel,compress_type=8,compresslevel=6)
            z.writestr('VERIFIED_SERVED_REVISION_RECEIPT.json',json.dumps(attestation,sort_keys=True,indent=2)+'\n')
    artifacts=[{'name':x.name,'bytes':x.stat().st_size,'sha256':digest(x)} for x in [stack,http]+([witness] if witness else [])]
    record={'schema':'td613.vixen.release-archive-stage/v1','product_head':head,
      'https_witness_present':bool(witness),'archive_files':artifacts,
      'release_action_executed':False,'independent_artistic_acceptance':False,
      'note':'SHA-256 is integrity evidence. Independently inspect decoded pixels and actual served revision before final admission.'}
    (out/'STAGED_ARCHIVE_RECEIPT.json').write_text(json.dumps(record,indent=2)+'\n')
    print(json.dumps(record,indent=2))
if __name__=='__main__':main()
