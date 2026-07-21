import fs from 'node:fs';
import assert from 'node:assert/strict';

function replaceOne(source, from, to, label) {
  const count = source.split(from).length - 1;
  assert.equal(count, 1, `${label}: expected one match, observed ${count}`);
  return source.replace(from, to);
}

const shellPath = 'api/dome-world-shell.js';
let shell = fs.readFileSync(shellPath, 'utf8');
shell = replaceOne(shell,
  "    if(marker===epoch){document.documentElement.dataset.ashCachePreflight='complete';window.__td613AshAia3Preflight=Promise.resolve({epoch,performed:false});return}",
  "    if(marker===epoch){let receipt={epoch,performed:false,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false};try{receipt=JSON.parse(sessionStorage.getItem(receiptKey)||'null')||receipt}catch{}try{const current=new URL(location.href);if(current.searchParams.has('ash_epoch')){current.searchParams.delete('ash_epoch');history.replaceState(null,'',current.pathname+current.search+current.hash)}}catch{}document.documentElement.dataset.ashCachePreflight='complete';window.__td613AshAia3PreflightReceipt=receipt;window.__td613AshAia3Preflight=Promise.resolve(receipt);return}",
  'preflight converged branch');
shell = replaceOne(shell,
  "      try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt))}catch{}\n      const current=new URL(location.href);",
  "      try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt))}catch{}\n      window.__td613AshAia3PreflightReceipt=receipt;\n      const current=new URL(location.href);",
  'preflight receipt publication');
fs.writeFileSync(shellPath, shell);

const ingressPath = 'tests/ash-live-ingress-demos-cache.test.mjs';
let ingress = fs.readFileSync(ingressPath, 'utf8');
const oldLifecycleBlock = `assert.match(lifecycle, /ash-ingress-layout-hydration\\.js\\?v=20260718-canonical-membrane-v6/);
assert.match(lifecycle, /ash-cache-flush\\.js\\?v=20260718-canonical-membrane-v7-readiness-boundary/);
assert.equal(ASH_LIFECYCLE_MODULE, '/dome-world/ash-lifecycle.js?v=20260718-canonical-membrane-v7-readiness-boundary');
const renderedKeep = injectAshKeepLifecycle(keepHtml);
assert.match(renderedKeep, /src="\\/dome-world\\/ash-lifecycle\\.js\\?v=20260718-canonical-membrane-v7-readiness-boundary"/);
assert.doesNotMatch(renderedKeep, /src="\\/dome-world\\/ash-lifecycle\\.js"/);
assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'Lifecycle cache-boundary injection is not idempotent.');`;
const newLifecycleBlock = `assert.match(lifecycle, /ash-cache-eviction-aia3\\.js\\?v=\\$\\{assetEpoch\\}/);
assert.match(lifecycle, /ash-ingress-layout-hydration\\.js\\?v=\\$\\{assetEpoch\\}/);
assert.doesNotMatch(lifecycle, /ash-cache-flush\\.js/);
assert.equal(ASH_LIFECYCLE_MODULE, '/dome-world/ash-lifecycle.js?v=20260720-aia3-mass-eviction-v2');
const renderedKeep = injectAshKeepLifecycle(keepHtml);
for (const module of ['ash-keep.js', 'ash-convergence.js', 'ash-lifecycle.js', 'ash-workspace-bridge.js', 'ash-case-controls.js']) {
  assert.match(renderedKeep, new RegExp(\`src="\\\\/dome-world\\\\/\${module.replace('.', '\\\\.')}\\\\?v=20260720-aia3-mass-eviction-v2"\`));
}
assert.match(renderedKeep, /ash-cache-preflight/);
assert.match(renderedKeep, /Updating Ash Keep · preserving local cases/);
assert.match(renderedKeep, /local_case_pointer_preserved/);
assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'Lifecycle cache-boundary injection is not idempotent.');`;
ingress = replaceOne(ingress, oldLifecycleBlock, newLifecycleBlock, 'inherited ingress lifecycle block');
fs.writeFileSync(ingressPath, ingress);

const workflowPath = '.github/workflows/ash-keep-live-aia-browser.yml';
let workflow = fs.readFileSync(workflowPath, 'utf8');
for (const anchor of ["      - 'app/dome-world/ash-cache-eviction-aia3.js'", "      - 'app/dome-world/ash-cache-eviction-aia3.js'"]) {
  // handled below with bounded first/second replacement
}
workflow = workflow.replace(
  "      - 'app/dome-world/ash-cache-eviction-aia3.js'\n      - 'app/dome-world/ash-keep-aia-workspace-bridge.js'",
  "      - 'app/dome-world/ash-cache-eviction-aia3.js'\n      - 'app/dome-world/ash-stale-client-fixture-sw.js'\n      - 'api/dome-world-shell.js'\n      - 'vercel.json'\n      - 'tests/ash-aia3-mass-eviction-v2.test.mjs'\n      - 'app/dome-world/ash-keep-aia-workspace-bridge.js'");
workflow = workflow.replace(
  "      - 'app/dome-world/ash-cache-eviction-aia3.js'\n      - 'app/dome-world/ash-keep-aia-workspace-bridge.js'",
  "      - 'app/dome-world/ash-cache-eviction-aia3.js'\n      - 'app/dome-world/ash-stale-client-fixture-sw.js'\n      - 'api/dome-world-shell.js'\n      - 'vercel.json'\n      - 'tests/ash-aia3-mass-eviction-v2.test.mjs'\n      - 'app/dome-world/ash-keep-aia-workspace-bridge.js'");
workflow = replaceOne(workflow,
  "      - name: Validate AIA3 task witness syntax\n        run: node --check scripts/ash-keep-aia3-task-journey-v2.mjs",
  "      - name: Validate AIA3 mass-eviction law and task witness\n        run: |\n          node tests/ash-aia3-mass-eviction-v2.test.mjs\n          node --check scripts/ash-keep-aia3-task-journey-v2.mjs\n          node --check app/dome-world/ash-stale-client-fixture-sw.js",
  'browser workflow validation step');
fs.writeFileSync(workflowPath, workflow);

console.log(JSON.stringify({ status:'FINALIZED', files:[shellPath, ingressPath, workflowPath] }, null, 2));
