#!/usr/bin/env python3
"""Create a code + fictional-fixture carrier with no repository history or source admission."""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
BASE='50cc9d161f8f72c2d4b6ea33ece17ace88f35eff'
PUBLISHED_GOLD='640b472cb1c03609d1fb9c181dd0200725277ccc'
ALLOWLIST=['__init__.py','core.py','native_runner.py','fixture_factory.py','worker.py','synthetic_receiver.py',
           'native/phase2.py','native/projective.py','native/query.py','ORIGINAL_CODE_PINS.json','METHOD_DEPENDENCIES.json','fixtures/synthetic-tomography.json']
FORBIDDEN=['.git','AGENTS.md','DOLLHOUSE.md','DOLLHOUSE_MACHINE_RECEIPT.json','eighteen-witnesses','rankings','gold','supervision','conversation_history']

def sha(raw):return hashlib.sha256(raw).hexdigest()
def check_imports(path,raw):
    if path.suffix!='.py':return []
    tree=ast.parse(raw);imports=set()
    for n in ast.walk(tree):
        if isinstance(n,ast.Import):imports.update(a.name.split('.')[0] for a in n.names)
        elif isinstance(n,ast.ImportFrom):
            if n.level:
                if n.module is not None:raise ValueError('UNDECLARED_LOCAL_MODULE')
                if any(a.name not in ('core','native_runner') for a in n.names):raise ValueError('UNDECLARED_LOCAL_IMPORT')
                imports.update('.'+a.name for a in n.names)
            elif n.module:imports.add(n.module.split('.')[0])
    if not all(x.startswith('.') or x in sys.stdlib_module_names for x in imports):raise ValueError('NON_STDLIB_DEPENDENCY')
    return sorted(imports)

def export(destination):
    out=Path(destination).absolute()
    if out.exists():raise ValueError('EXPORT_MUST_BE_NEW')
    if any(p.is_symlink() for p in (out.parent,*out.parent.parents)):raise ValueError('SYMLINKED_EXPORT_PARENT')
    # The chosen source base must be an ancestor, while the gold head must not.
    subprocess.run(['git','-C',str(ROOT),'merge-base','--is-ancestor',BASE,'HEAD'],check=True)
    gold=subprocess.run(['git','-C',str(ROOT),'merge-base','--is-ancestor',PUBLISHED_GOLD,'HEAD'])
    if gold.returncode!=1:raise ValueError('CARRIER_ANCESTRY_NOT_CLEAN_OR_UNVERIFIABLE')
    entries=[];source=ROOT/'packages/research_carrier_v1'
    for name in ALLOWLIST:
        p=source/name
        if any(q.is_symlink() for q in (p,*p.parents)):raise ValueError('SYMLINKED_ALLOWLIST_MEMBER')
        raw=p.read_bytes();imports=check_imports(p,raw)
        entries.append({'path':'research_carrier_v1/'+name,'bytes':len(raw),'sha256':sha(raw),'imports':imports})
    pins=json.loads((source/'ORIGINAL_CODE_PINS.json').read_bytes())
    methods=json.loads((source/'METHOD_DEPENDENCIES.json').read_bytes())
    if set(methods)!={'SRC_PHASE2_TOMOGRAPHY','SRC_PHASE2_CONTEXT_ROLES','SRC_PROJECTIVE_ROUTING','SRC_NATIVE_QUERY'}:raise ValueError('METHOD_CLOSURE_DECLARATION_MISSING')
    for pin in pins:
        if pin['path'] not in ALLOWLIST or sha((source/pin['path']).read_bytes())!=pin['sha256']:raise ValueError('ORIGINAL_CODE_PIN_DRIFT')
    # Data are manifestly fictional. No public/protected corpus body is exported.
    fixture=json.loads((source/'fixtures/synthetic-tomography.json').read_bytes())
    if fixture['source_class']!='SYNTHETIC' or any(a['git'] is not None for a in fixture['assets']):raise ValueError('NON_SYNTHETIC_FIXTURE_IN_CLEAN_EXPORT')
    out.mkdir(parents=True)
    try:
        for e in entries:
            dest=out/e['path'];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source/str(Path(e['path']).relative_to('research_carrier_v1')),dest)
        launcher=b"import sys\nfrom pathlib import Path\nsys.path.insert(0,str(Path(__file__).resolve().parent))\nfrom research_carrier_v1.worker import main\nmain()\n"
        (out/'run.py').write_bytes(launcher)
        entries.append({'path':'run.py','bytes':len(launcher),'sha256':sha(launcher),'imports':['sys','pathlib','research_carrier_v1.worker']})
        manifest={'schema':'td613.clean-method-carrier-export/v1','selected_source_base':BASE,'files':entries,
          'native_code_pins':pins,'method_dependencies':methods,'forbidden_context':FORBIDDEN,'corpus_payload':'SYNTHETIC_FIXTURE_ONLY',
          'dependency_closure':'EXPLICIT_LOCAL_IMPORTS_AND_FIXED_NATIVE_REGISTRY_PLUS_PYTHON_STDLIB',
          'dynamic_native_loads':['research_carrier_v1/'+x['path'] for x in pins if x['path'].startswith('native/')],
          'isolation':{'package_git_metadata':'ABSENT','repository_history_access':'NOT_ENFORCED_BY_EXPORT','network_access':'NOT_ENFORCED_BY_EXPORT','worker_admission':'HELD'},
          'authority':{'source_admission':False,'flight':False,'deployment':False,'release':False,'human_closure_required':True}}
        (out/'MANIFEST.json').write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n')
        return manifest
    except BaseException:
        shutil.rmtree(out);raise

def verify(destination,expected_manifest_sha256):
    out=Path(destination).absolute();raw=(out/'MANIFEST.json').read_bytes()
    if any(p.is_symlink() for p in (out,*out.parents)):raise ValueError('SYMLINKED_EXPORT_ROOT')
    if sha(raw)!=expected_manifest_sha256:raise ValueError('INDEPENDENT_MANIFEST_PIN_MISMATCH')
    m=json.loads(raw);expected={e['path'] for e in m['files']}|{'MANIFEST.json'};found=set()
    for p in out.rglob('*'):
        if p.is_symlink():raise ValueError('SYMLINK_IN_EXPORTED_PACKAGE')
        if p.is_file():found.add(p.relative_to(out).as_posix())
    if found!=expected:raise ValueError('EXPORTED_CLOSURE_CHANGED')
    for e in m['files']:
        data=(out/e['path']).read_bytes()
        if len(data)!=e['bytes'] or sha(data)!=e['sha256']:raise ValueError('EXPORTED_FILE_DIGEST_CHANGED')
    return {'schema':m['schema'],'files':len(m['files']),'closure_verified':True,'history_and_network_isolation':'UNESTABLISHED','worker_admission':'HELD'}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('output');p.add_argument('--verify-manifest-sha256');a=p.parse_args()
    result=verify(a.output,a.verify_manifest_sha256) if a.verify_manifest_sha256 else export(a.output)
    print(json.dumps(result,indent=2,sort_keys=True))
if __name__=='__main__':main()
