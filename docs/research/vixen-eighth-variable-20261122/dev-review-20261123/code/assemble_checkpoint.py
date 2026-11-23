"""Package this private continuation and replay it from an independent extraction."""
from pathlib import Path
import hashlib,json,zipfile,subprocess,tempfile,shutil

root=Path(__file__).resolve().parent.parent
dev=root/'vixen-seven-source-dev'
base=root/'eighth-variable/baseline'
out=dev/'output'
out.mkdir(exist_ok=True)
H=lambda b:hashlib.sha256(b).hexdigest()
files={}
for p in sorted(dev.rglob('*')):
    if p.is_file() and not p.is_relative_to(out) and '__pycache__' not in p.parts:
        files[p.relative_to(root).as_posix()]=p.read_bytes()
runtime=json.loads((dev/'evidence/runtime-files.json').read_text())
runtime+=['scripts/build-vixen-experiment-a-corpus.mjs',
          'app/encyclopedia/vixen-estate/semantic-semiotic-index.v1.json']
for name in runtime:
    files['eighth-variable/baseline/'+name]=(base/name).read_bytes()
for name in ['baseline-corpus.json','historical-source-ledger.json']:
    files['eighth-variable/'+name]=(root/'eighth-variable'/name).read_bytes()
for p in sorted((root/'eighth-variable/derived').glob('*/pages.json')):
    files[p.relative_to(root).as_posix()]=p.read_bytes()
    text=p.with_name('extracted.txt')
    files[text.relative_to(root).as_posix()]=text.read_bytes()
prior=root/'upload/TD613_Eighth_Variable_Private_Checkpoint_2026-11-23(2).zip'
if not prior.exists():
    prior=root/'prior/TD613_Eighth_Variable_Private_Checkpoint_2026-11-23.zip'
files['prior/TD613_Eighth_Variable_Private_Checkpoint_2026-11-23.zip']=prior.read_bytes()
assert H(prior.read_bytes())=='edba93aca651b656d438122a6642df387b43a975b933ddb5c789ec1a6cae34f4'

def pack():
    manifest={'commission':'TD613-VIXEN-7P1-DEV-SUCCESSOR-20261123',
      'a0':'b90ae99559b21e1561229cdc8e1d873cfaf6f43a',
      'scientific_v1_outcome':'HELD_MISSING_WITNESS','primary_answer_model_trials':0,
      'runtime_capsule':'Selected original source files, not a full Git checkout',
      'eighth_received':False,'manifest_excludes_itself':True,
      'entries':[{'path':k,'bytes':len(v),'sha256':H(v)} for k,v in sorted(files.items())]}
    target=out/'TD613_Vixen_Seven_Source_Development_2026-11-23.zip'
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
        for k,v in sorted(files.items()):z.writestr(k,v)
        z.writestr('MANIFEST.json',json.dumps(manifest,indent=2))
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        for e in manifest['entries']:
            b=z.read(e['path']);assert len(b)==e['bytes'] and H(b)==e['sha256']
    return target,manifest

target,manifest=pack()
# All source capsules and PDFs are treated as inert copies; only the trusted
# development harnesses below run, without network or source acquisition.
with tempfile.TemporaryDirectory(prefix='vixen-seven-source-replay-') as temp:
    with zipfile.ZipFile(target) as z:z.extractall(temp)
    replay=[]
    for cmd in [['node','vixen-seven-source-dev/overlay.test.mjs'],
                ['node','vixen-seven-source-dev/aix-retrieval.mjs'],
                ['python3','vixen-seven-source-dev/constructed-counterexamples.py']]:
        r=subprocess.run(cmd,cwd=temp,capture_output=True,text=True,timeout=45)
        replay.append({'command':cmd,'exit_code':r.returncode,'stdout':r.stdout,'stderr':r.stderr})
        if r.returncode:raise RuntimeError(json.dumps(replay,indent=2))
    # Rebuild from retained page extracts with the selected original builder.
    r=subprocess.run(['node','vixen-seven-source-dev/seven-source-overlay.mjs','build','vixen-seven-source-dev/rebuilt-index.json'],cwd=temp,capture_output=True,text=True,timeout=45)
    replay.append({'command':['node','seven-source-overlay.mjs','build','rebuilt-index.json'],'exit_code':r.returncode,'stdout':r.stdout,'stderr':r.stderr})
    assert r.returncode==0,replay
    old=json.loads(files['vixen-seven-source-dev/seven-source-index.json'])
    new=json.loads((Path(temp)/'vixen-seven-source-dev/rebuilt-index.json').read_text())
    assert old==new,'Independently rebuilt index differs'
    receipt={'status':'PASS','independent_extraction':True,'rebuild_exact_object_equal':True,'executions':replay}
    (dev/'evidence/independent-extracted-replay.json').write_text(json.dumps(receipt,indent=2))
    files['vixen-seven-source-dev/evidence/independent-extracted-replay.json']=(dev/'evidence/independent-extracted-replay.json').read_bytes()
target,manifest=pack()
report=out/'TD613_Vixen_Seven_Source_Development_2026-11-23.md'
shutil.copyfile(dev/'CONTINUATION.md',report)
receipt={'archive':target.name,'bytes':target.stat().st_size,'sha256':H(target.read_bytes()),
 'payload_hashes_verified':len(manifest['entries']),'crc':'PASS','independent_replay':'PASS',
 'overlay_smoke_tests':19,'scientific_v1_outcome':'HELD_MISSING_WITNESS',
 'primary_answer_model_trials':0,'report_sha256':H(report.read_bytes())}
(out/'archive-receipt.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps(receipt,indent=2))
