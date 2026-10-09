import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { STANDARD_LOOM_CAPABILITIES } from '../app/engine/portable-loom-standard-runtime.js';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const entries = ['app/engine/portable-loom-standard-runtime.js', 'app/dome-world/holonomy-loom/standard-portable-client.js'];
const safe = value => /^(?:app\/(?:engine|dome-world)\/[a-zA-Z0-9/._-]+\.js)$/.test(value) && !value.split('/').includes('..');
const scriptSafe = value => JSON.stringify(value).replace(/</g, '\\u003c');
const css = `:root{color-scheme:light;--ink:#241d2b;--paper:#f7f1e8;--lav:#725582;--line:#d8c8d0}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:32px 24px 80px;position:relative}header{position:relative;z-index:1;max-width:850px;padding:40px 0}.eyebrow{font-size:12px;letter-spacing:.16em;font-weight:700}h1,h2{font-family:Georgia,serif;font-weight:400}h1{font-size:clamp(42px,7vw,86px);line-height:1.04;margin:18px 0}h2{font-size:27px;margin:12px 0}.lead{font-size:20px;max-width:620px}.scope,.hint{font-size:14px;color:#625666}.field{position:absolute;top:0;right:0;width:100%;height:350px;opacity:.23;pointer-events:none;overflow:hidden}.field svg{width:100%;height:100%}.panel{position:relative;background:rgba(255,253,248,.91);border:1px solid var(--line);padding:24px;margin:16px 0;border-radius:3px;box-shadow:0 6px 30px #482e5110}.workspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px}.workspace[hidden]{display:none}button{font:inherit;cursor:pointer;border:1px solid #967f9d;border-radius:3px;background:#eee4ed;color:var(--ink);padding:10px 16px;margin:7px 6px 7px 0;min-height:44px}button.primary{background:var(--ink);color:var(--paper);width:100%}button:disabled{opacity:.45;cursor:default}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #966daf;outline-offset:3px}label{display:block;margin:14px 0}input,textarea,select{font:inherit;width:100%;display:block;border:1px solid #b9a8bc;border-radius:2px;padding:10px;background:#fffcf8;color:var(--ink);max-width:100%}textarea{resize:vertical}.choice{display:flex;gap:10px;align-items:flex-start;font-size:14px}.choice input{width:18px;min-width:18px;height:18px;margin-top:3px}.source{border-left:3px solid var(--lav);padding:6px 14px;margin:15px 0;background:#ede3eb80}.source-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}pre{font:12px/1.55 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;max-height:550px;overflow:auto;padding:14px;background:#eee7ec;border:1px solid var(--line)}summary{cursor:pointer;min-height:44px;padding:10px 0}footer{font-size:12px;color:#5c4b61;overflow-wrap:anywhere;border-top:1px solid var(--line);padding:18px 0}dialog{border:1px solid var(--lav);background:var(--paper);color:var(--ink);width:min(850px,94vw);max-height:86vh;padding:24px}dialog::backdrop{background:#241d2b80}dialog button{float:right}.gate-attention{animation:gate-attention 2.5s ease-in-out infinite}@keyframes gate-attention{50%{box-shadow:0 0 0 5px #967bac22}}[data-phase=HELD] .panel{border-color:#ad7858}[data-phase=REST] .field{opacity:.13}@media(max-width:760px){main{padding:16px 14px 55px}.workspace{grid-template-columns:1fr;gap:0}.panel{padding:18px}header{padding-top:22px}.lead{font-size:18px}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}`;

export async function collectPortableRuntimeSources(root) {
  const pending = [...entries], sources = new Map(); let total = 0;
  const parser = `import{readFileSync}from'node:fs';import{SourceTextModule}from'node:vm';const x=JSON.parse(readFileSync(0,'utf8'));const m=new SourceTextModule(x.source);process.stdout.write(JSON.stringify(m.dependencySpecifiers));`;
  while (pending.length) {
    const relative = pending.shift(); if (sources.has(relative)) continue;
    if (!safe(relative) || relative.includes('/lineage/')) throw new Error(`Runtime dependency outside code estate: ${relative}`);
    const absolute = path.resolve(root, relative);
    for (let cursor = absolute; cursor !== path.resolve(root); cursor = path.dirname(cursor)) if ((await lstat(cursor)).isSymbolicLink()) throw new Error('Runtime symlink refused.');
    const bytes = await readFile(absolute); total += bytes.length;
    if (bytes.length > 700000 || total > 5000000 || sources.size >= 128) throw new Error('Runtime closure exceeds bounded export.');
    const source = bytes.toString('utf8');
    const dynamic = [...source.matchAll(/\bimport\s*\(/g)];
    if (dynamic.length && !(relative === 'app/engine/governed-event-chain.js' && dynamic.length === 1 && source.includes("await import('node:crypto')"))) throw new Error(`Unresolved dynamic dependency: ${relative}`);
    if (/\b(?:require|eval|createRequire)\s*\(/.test(source)) throw new Error(`Unresolved dynamic execution: ${relative}`);
    const deps = JSON.parse(execFileSync(process.execPath, ['--experimental-vm-modules', '--input-type=module', '-e', parser], {
      input: JSON.stringify({ source, path: relative }), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 1000000 }));
    const imports = {};
    for (const specifier of deps) {
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) throw new Error(`External runtime dependency: ${specifier}`);
      const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(relative), specifier));
      if (!safe(dependency)) throw new Error('Escaping runtime import refused.');
      imports[specifier] = dependency; pending.push(dependency);
    }
    sources.set(relative, { bytes, imports, dynamic_node_crypto_fallback: dynamic.length === 1 });
  }
  return sources;
}

export async function exportPortableRuntimeKit({ root, destination, artifact, source_revision, allowWorkingTree = false }) {
  const sources = await collectPortableRuntimeSources(root);
  const changes = [];
  for (const [relative, { bytes }] of sources) {
    const blob = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
    let committed = ''; try { committed = execFileSync('git', ['-C', root, 'rev-parse', `${source_revision}:${relative}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); } catch {}
    if (blob !== committed) changes.push(relative);
  }
  if (changes.length && !allowWorkingTree) throw new Error('Executable export requires exact committed source bytes.');
  const imports = {}, records = [];
  for (const [relative, { bytes, imports: deps, dynamic_node_crypto_fallback }] of sources) {
    const target = path.join(destination, 'runtime', relative); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, bytes, { flag: 'wx' });
    let source = bytes.toString('utf8');
    for (const [specifier, dependency] of Object.entries(deps)) {
      source = source.split(JSON.stringify(specifier)).join(JSON.stringify(`td613:${dependency}`));
      source = source.split("'" + specifier + "'").join("'td613:" + dependency + "'");
    }
    imports[`td613:${relative}`] = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
    records.push({ path: `runtime/${relative}`, bytes: bytes.length, sha256: sha256(bytes), imports: Object.values(deps), dynamic_node_crypto_fallback });
  }
  const packageFile = '{"type":"module"}\n';
  await writeFile(path.join(destination, 'runtime/package.json'), packageFile, { flag: 'wx' });
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' data:; style-src 'unsafe-inline'; connect-src 'none'; img-src data:; form-action 'none'; base-uri 'none'"><title>Standard Portable Loom</title><style>${css}</style><script type="importmap">${scriptSafe({ imports })}</script></head><body><main id="loom"></main><script id="loom-artifact" type="application/json">${scriptSafe(artifact)}</script><script type="module">import{mountStandardPortableLoom}from'td613:app/dome-world/holonomy-loom/standard-portable-client.js';const artifact=JSON.parse(document.getElementById('loom-artifact').textContent);window.loom=mountStandardPortableLoom(document.getElementById('loom'),artifact);</script></body></html>\n`;
  await writeFile(path.join(destination, 'portable-loom-standard.html'), html, { flag: 'wx' });
  const cli = `import{readFile}from'node:fs/promises';import{webcrypto}from'node:crypto';import{createInterface}from'node:readline';import{createStandardPortableLoomRuntime}from'./app/engine/portable-loom-standard-runtime.js';const artifact=JSON.parse(await readFile(new URL('../portable-loom-standard.json',import.meta.url),'utf8'));let runtime=null,ticket=null,candidate=null;const lines=createInterface({input:process.stdin,crlfDelay:Infinity});for await(const line of lines){try{const c=JSON.parse(line);let r;if(c.operation==='start'){if(runtime)throw Error('Session already active.');runtime=await createStandardPortableLoomRuntime(artifact,{gesture:c.gesture,environment:{crypto:webcrypto}});r=runtime.inspect();}else{if(!runtime)throw Error('Start local session first.');switch(c.operation){case'authorize':ticket=await runtime.authorize(c.input);r=ticket;break;case'carry':r=await runtime.carry(ticket);ticket=null;break;case'check':candidate=await runtime.check(c.input);r=candidate;break;case'admit':r=await runtime.admit(c.input);candidate=null;break;case'stage':case'capture':case'challenge':case'recordChallenge':r=await runtime[c.operation](c.input);break;case'retry':case'rest':case'close':r=await runtime[c.operation]();break;case'inspect':case'preview':case'gate':case'explain':case'exportPrivate':r=runtime[c.operation]();break;default:throw Error('Unknown bounded operation.');}}process.stdout.write(JSON.stringify({ok:true,result:r})+'\\n');}catch(e){process.stdout.write(JSON.stringify({ok:false,error:e.message})+'\\n');}}`;
  await writeFile(path.join(destination, 'runtime/run.mjs'), cli + '\n', { flag: 'wx' });
  const verifier = `import{readFile,lstat,realpath}from'node:fs/promises';import{resolve,dirname,sep}from'node:path';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';const root=await realpath(fileURLToPath(new URL('../',import.meta.url)));const m=JSON.parse(await readFile(resolve(root,'portable-loom-runtime-manifest.json'),'utf8'));if(m.schema!=='td613.loom.standard-executable-kit/v0.1'||!Array.isArray(m.source_files))throw Error('Unrecognized executable manifest.');const records=[...m.source_files,m.browser_file,m.cli_file,m.package_file,m.input_file,m.verifier_file];const paths=new Set();for(const f of records){if(!f||typeof f.path!=='string'||!/^[-a-zA-Z0-9_./]+$/.test(f.path)||f.path.split('/').some(v=>v==='..'||!v)||paths.has(f.path)||!Number.isSafeInteger(f.bytes)||f.bytes<0||!/^([a-f0-9]{64})$/.test(f.sha256))throw Error('Unsafe manifest entry.');paths.add(f.path);const p=resolve(root,f.path);if(!p.startsWith(root+sep))throw Error('Manifest path escaped kit.');for(let c=p;c!==root;c=dirname(c))if((await lstat(c)).isSymbolicLink())throw Error('Symlink refused.');const b=await readFile(p);if(b.length!==f.bytes||createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error('File digest mismatch: '+f.path);}process.stdout.write(JSON.stringify({status:'LOCAL_DIGESTS_VERIFIED',files:records.length,source_revision:m.source_revision,source_status:m.source_status,origin_authentication:'NOT_ESTABLISHED_BY_SELF_CONTAINED_DIGESTS'})+'\\n');`;
  await writeFile(path.join(destination, 'runtime/verify.mjs'), verifier + '\n', { flag: 'wx' });
  const manifest = { schema: 'td613.loom.standard-executable-kit/v0.1', source_revision,
    source_status: changes.length ? 'UNCOMMITTED_ENGINEERING_CANDIDATE' : 'COMMITTED_EXACT_SOURCE', modified_runtime_paths: changes,
    runtime_entrypoint: 'runtime/app/engine/portable-loom-standard-runtime.js', cli_entrypoint: 'runtime/run.mjs',
    browser_entrypoint: 'portable-loom-standard.html', default_network: 'DISABLED; MANUAL_OPERATOR_CARRIAGE',
    custody: 'FRESH_LIVE_LOCAL_SESSION; PRIVATE_EXPORTS_REVIEW_ONLY', capabilities: STANDARD_LOOM_CAPABILITIES,
    source_files: records,
    verifier_entrypoint: 'runtime/verify.mjs',
    verifier_file: { path: 'runtime/verify.mjs', bytes: Buffer.byteLength(verifier + '\n'), sha256: sha256(verifier + '\n') },
    package_file: { path: 'runtime/package.json', bytes: Buffer.byteLength(packageFile), sha256: sha256(packageFile) },
    input_file: { path: 'portable-loom-standard.json', bytes: (await readFile(path.join(destination, 'portable-loom-standard.json'))).length, sha256: sha256(await readFile(path.join(destination, 'portable-loom-standard.json'))) },
    browser_file: { path: 'portable-loom-standard.html', bytes: Buffer.byteLength(html), sha256: sha256(html) },
    cli_file: { path: 'runtime/run.mjs', bytes: Buffer.byteLength(cli + '\n'), sha256: sha256(cli + '\n') },
    observation_boundaries: ['Local release and supplied capture are recorded separately from provider transmission.', 'A receiver without an execution environment can follow the carried instructions; the local runtime performs subsequent checks.', 'No provider telemetry, global fork exclusion, external signer or automatic live-custody restoration is installed.'] };
  await writeFile(path.join(destination, 'portable-loom-runtime-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  return manifest;
}
