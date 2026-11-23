#!/usr/bin/env python3
"""Independent scoped Vixen source-stack ZIP audit.
Usage: python audit_scoped_stack.py Full_Stack.zip EXPECTED_SHA40
"""
import sys,zipfile,json,hashlib,re,posixpath
from pathlib import Path
# Positive signature matches demand review; absence cannot prove that arbitrary
# credential formats are impossible. Do not print matched secret bytes.
CREDENTIAL_SIGNATURES=[
 re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
 re.compile(rb'gh[pousr]_[A-Za-z0-9_]{34,}'),
 re.compile(rb'github_pat_[A-Za-z0-9_]{25,}'),
 re.compile(rb'AKIA[0-9A-Z]{16}'),
 re.compile(rb'sk-(?:proj-)?[A-Za-z0-9_-]{32,}'),
 re.compile(rb'eyJ[A-Za-z0-9_-]{40,}\.eyJ[A-Za-z0-9_-]{40,}'),
]
p=Path(sys.argv[1]); expected=sys.argv[2]
fail=[];info={}
if not re.fullmatch('[0-9a-f]{40}',expected):raise SystemExit('EXPECTED_SHA40_REQUIRED')
with zipfile.ZipFile(p) as z:
    names=z.namelist();members=set(names)
    if len(names)!=len(members):fail.append('DUPLICATE_MEMBER')
    manifest_path='VIXEN_STACK/STACK_CONTENT_MANIFEST.json'
    manifest=json.loads(z.read(manifest_path)); expected_paths=set()
    if manifest.get('source_revision')!=expected:fail.append('MISMATCHED_SOURCE_REVISION')
    if manifest.get('scientific_credit')!=0:fail.append('SCIENTIFIC_CREDIT_ESCALATION')
    for entry in manifest['files']:
        f=entry['path'];expected_paths.add(f)
        if f.startswith('/') or '\\' in f or '..' in f.split('/') or posixpath.normpath(f)!=f:
            fail.append('UNSAFE_PATH:'+f);continue
        if f not in members:fail.append('MISSING_MEMBER:'+f);continue
        b=z.read(f)
        if len(b)!=entry['byte_length']:fail.append('LENGTH:'+f)
        if hashlib.sha256(b).hexdigest()!=entry['sha256']:fail.append('DIGEST:'+f)
        if any(pat.search(b) for pat in CREDENTIAL_SIGNATURES):
            fail.append('POTENTIAL_EMBEDDED_CREDENTIAL:'+f)
        if f.lower().endswith(('.pdf','.p12','.pfx','.pem','.key','.env','.sqlite','.db','.sse','.mp4','.mov','.jpg','.jpeg')):
            fail.append('UNAUTHORIZED_SOURCE_TYPE:'+f)
        if re.search(r'/(?:private|credentials|secrets|protected|browser-sessions|experiment-b-sources|hydration-sources)/',f,re.I):
            fail.append('PROTECTED_SUBTREE:'+f)
        zi=z.getinfo(f)
        if (zi.external_attr>>16)&0o170000==0o120000:
            fail.append('SYMLINK:'+f)
    if expected_paths|{manifest_path}!=members:
        fail.append('UNINDEXED_OR_MISSING_MEMBERS')
    pm='VIXEN_STACK/distributable/PREVIEW-MANIFEST.json'
    if pm not in members:fail.append('MISSING_PREVIEW_MANIFEST')
    else:
        preview=json.loads(z.read(pm))
        if preview.get('source_commit')!=expected:fail.append('PREVIEW_SOURCE_MISMATCH')
        if preview.get('reference_count')!=1141:fail.append('REFERENCE_CENSUS_MISMATCH')
        if preview.get('experiment_b_flight')!='HELD':fail.append('EXPERIMENT_B_NOT_HELD')
        for r in preview['files']:
            name='VIXEN_STACK/distributable/'+r['path']
            if name not in members:fail.append('PREVIEW_FILE_MISSING:'+name);continue
            content=z.read(name)
            if len(content)!=r['bytes'] or hashlib.sha256(content).hexdigest()!=r['sha256']:
                fail.append('PREVIEW_FILE_CORRUPT:'+name)
        info={'preview_files':len(preview['files']),'reference_count':preview['reference_count']}
with p.open('rb') as handle: zh=hashlib.file_digest(handle,'sha256').hexdigest()
res={'archive':str(p),'source_revision':expected,'bytes':p.stat().st_size,'sha256':zh,'members':len(names),'manifest_files':len(expected_paths),'failures':fail[:40],'failure_count':len(fail),'independent_pass':not fail,**info}
print(json.dumps(res,indent=2))
raise SystemExit(0 if not fail else 1)
