#!/usr/bin/env python3
"""Build and load the exact Neon budget deployment ZIP before upload. No remote mutations."""
import hashlib, json, pathlib, subprocess, sys, tempfile, zipfile

def run(args, **kwargs):
    return subprocess.run(args, check=True, text=True, **kwargs)

def smoke_zip(archive):
    smoke = '''
    globalThis.fetch = async () => { throw Error('SMOKE_NETWORK_FORBIDDEN'); };
    const {default: fn} = await import(process.argv[1]);
    delete process.env.DATABASE_URL;
    let r = await fn.fetch(new Request('https://example.invalid/', {method:'POST', body:'{}'}));
    if (r.status !== 503 || (await r.json()).error !== 'ASSAY_DATABASE_UNCONFIGURED') throw Error('missing-env gate');
    process.env.DATABASE_URL = 'postgresql://unreachable:unreachable@127.0.0.1:1/unreachable';
    r = await fn.fetch(new Request('https://example.invalid/', {method:'POST', body:'{}'}));
    if (r.status !== 401 || (await r.json()).error !== 'ASSAY_WORKLOAD_UNAUTHORIZED') throw Error('startup/auth gate');
    r = await fn.fetch(new Request('https://example.invalid/', {method:'GET'}));
    if (r.status !== 405 || (await r.json()).error !== 'ASSAY_METHOD') throw Error('method gate');
    console.log('ZIP_RUNTIME_SMOKE_PASS');
    '''
    with tempfile.TemporaryDirectory(prefix='td613-budget-zip-') as d:
        with zipfile.ZipFile(archive) as z: z.extractall(d)
        run(['node', '--input-type=module', '-e', smoke, str(pathlib.Path(d)/'index.mjs')], cwd=d, timeout=15)

if len(sys.argv) == 3 and sys.argv[1] == '--smoke-zip':
    smoke_zip(pathlib.Path(sys.argv[2]).resolve())
    raise SystemExit(0)

if len(sys.argv) != 4:
    raise SystemExit('usage: build-and-verify.py CLEAN_REPO EXPECTED_40_HEX_COMMIT NEW_OUTPUT_DIRECTORY')
repo = pathlib.Path(sys.argv[1]).resolve()
expected = sys.argv[2]
out = pathlib.Path(sys.argv[3]).resolve()
head = run(['git', 'rev-parse', 'HEAD'], cwd=repo, capture_output=True).stdout.strip()
dirty = run(['git', 'status', '--porcelain'], cwd=repo, capture_output=True).stdout
if head != expected or dirty:
    raise SystemExit('HOLD: source checkout must be clean and match the exact expected commit')
out.mkdir(parents=True, exist_ok=False)
source = repo / 'neon/functions/loom-assay-budget'
run(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=20000'], cwd=source)
entry, meta = out/'index.mjs', out/'meta.json'
compiler = source/'node_modules/esbuild/bin/esbuild'
if json.loads((source/'node_modules/esbuild/package.json').read_text())['version'] != '0.27.0':
    raise SystemExit('HOLD: compiler version is not the locked esbuild@0.27.0')
run(['node', str(compiler),
     'neon/functions/loom-assay-budget/index.mjs', '--bundle', '--platform=node',
     '--target=node24', '--format=esm',
     '--banner:js=import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
     '--outfile='+str(entry), '--metafile='+str(meta)], cwd=repo)
metadata = json.loads(meta.read_text())
inputs = list(metadata['inputs'])
for package in ('pg', '@neon/functions'):
    if not any('/node_modules/'+package+'/' in p for p in inputs):
        raise SystemExit('HOLD: required dependency was not bundled: '+package)
builtins = set(json.loads(run(['node', '--input-type=module', '-e',
    'import {builtinModules} from "node:module"; console.log(JSON.stringify(builtinModules));'],
    capture_output=True).stdout))
for details in metadata['outputs'].values():
    for imp in details.get('imports', []):
        if imp.get('external') and imp['path'].removeprefix('node:') not in builtins:
            # pg-native is an optional, guarded driver probe; pg's JS driver is bundled.
            if imp['path'] != 'pg-native':
                raise SystemExit('HOLD: unresolved external dependency: '+imp['path'])
archive = out/'loomassaybudget.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    info = zipfile.ZipInfo('index.mjs', (2026, 10, 11, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    z.writestr(info, entry.read_bytes())
smoke_zip(archive)
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
paths = ['neon/functions/loom-assay-budget/index.mjs', 'neon/functions/loom-assay-budget/ledger.mjs',
         'neon/functions/loom-assay-budget/vercel-identity.mjs', 'server/loom-assay-contract.js',
         'neon/functions/loom-assay-budget/package.json', 'neon/functions/loom-assay-budget/package-lock.json']
receipt = {'source_commit':head, 'compiler':'esbuild@0.27.0', 'runtime':'nodejs24',
           'source_sha256':{p:digest(repo/p) for p in paths}, 'entry_sha256':digest(entry),
           'zip_sha256':digest(archive), 'zip_runtime_smoke':'PASS',
           'provider_requests':0, 'reservations':0, 'enrollments':0, 'deployments':0}
(out/'build-receipt.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps(receipt))
