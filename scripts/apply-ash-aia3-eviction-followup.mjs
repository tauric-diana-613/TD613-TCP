import fs from 'node:fs';
import assert from 'node:assert/strict';

function replaceOne(source, from, to, label) {
  if (source.includes(to)) return source;
  const count = source.split(from).length - 1;
  assert.equal(count, 1, `${label}: expected one match, observed ${count}`);
  return source.replace(from, to);
}

function patch(path, transforms) {
  let source = fs.readFileSync(path, 'utf8');
  for (const [from, to, label] of transforms) source = replaceOne(source, from, to, `${path}:${label}`);
  fs.writeFileSync(path, source);
  console.log(`patched ${path}`);
}

patch('api/dome-world-shell.js', [[
`    const pointerKey='td613.ash-keep.current-case';
    const sessionKey='td613.ash.session.epoch';
    let moduleMarker=null,preflightMarker=null;`,
`    const pointerKey='td613.ash-keep.current-case';
    const sessionKey='td613.ash.session.epoch';
    const publish=receipt=>{try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt))}catch{}window.__td613AshAia3PreflightReceipt=receipt;window.__td613AshAia3Preflight=Promise.resolve(receipt);return receipt};
    const legacyPresentation=new URLSearchParams(location.search).get('presentation')==='legacy';
    if(legacyPresentation){
      const receipt=publish({schema:'td613.ash.cache-preflight-receipt/v0.2',epoch,asset_epoch:assetEpoch,performed:false,legacy_bypass:true,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,local_case_pointer_preserved:true,session_epoch_preserved_or_migrated:true});
      document.documentElement.dataset.ashCachePreflight='complete';
      return;
    }
    let moduleMarker=null,preflightMarker=null;`,
'insert legacy bypass and receipt publisher'
],[
`    if(moduleMarker===epoch||preflightMarker===epoch){
      try{localStorage.setItem(moduleMarkerKey,epoch);localStorage.setItem(preflightMarkerKey,epoch)}catch{}
      document.documentElement.dataset.ashCachePreflight='complete';
      window.__td613AshAia3Preflight=Promise.resolve({epoch,asset_epoch:assetEpoch,performed:false,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false});
      return;
    }`,
`    if(moduleMarker===epoch||preflightMarker===epoch){
      try{localStorage.setItem(moduleMarkerKey,epoch);localStorage.setItem(preflightMarkerKey,epoch)}catch{}
      let receipt={schema:'td613.ash.cache-preflight-receipt/v0.2',epoch,asset_epoch:assetEpoch,performed:false,indexeddb_preserved:true,case_data_preserved:true,active_session_reset:false,local_case_pointer_preserved:true,session_epoch_preserved_or_migrated:true};
      try{receipt=JSON.parse(sessionStorage.getItem(receiptKey)||'null')||receipt}catch{}
      publish(receipt);
      document.documentElement.dataset.ashCachePreflight='complete';
      return;
    }`,
'republish converged receipt'
],[
`      try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt))}catch{}
      const current=new URL(location.href);`,
`      publish(receipt);
      const current=new URL(location.href);`,
'publish eviction receipt before reload'
],[
`      document.documentElement.dataset.ashCachePreflight='complete';
      return receipt;`,
`      publish(receipt);
      document.documentElement.dataset.ashCachePreflight='complete';
      return receipt;`,
'publish terminal receipt'
]]);

patch('scripts/ash-keep-aia3-task-journey-v3.mjs', [[
`    try { preflight = JSON.parse(sessionStorage.getItem('td613.ash.cache-preflight.receipt') || 'null'); } catch {}`,
`    try { preflight = window.__td613AshAia3PreflightReceipt || JSON.parse(sessionStorage.getItem('td613.ash.cache-preflight.receipt') || 'null'); } catch {}`,
'read stable preflight receipt'
]]);

patch('tests/ash-aia3-mass-eviction.test.mjs', [[
`import test from 'node:test';
import assert from 'node:assert/strict';`,
`import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';`,
'import shell source support'
],[
`class MemoryStorage {`,
`const shellSource = fs.readFileSync('api/dome-world-shell.js', 'utf8');

test('server preflight bypasses exact legacy rollback and republishes the governed receipt', () => {
  assert.match(shellSource, /legacyPresentation/);
  assert.match(shellSource, /legacy_bypass:true/);
  assert.match(shellSource, /__td613AshAia3PreflightReceipt/);
  assert.match(shellSource, /publish\\(receipt\\)/);
  assert.match(shellSource, /Updating Ash Keep · preserving local cases/);
});

class MemoryStorage {`,
'add shell preflight contract'
]]);

patch('tests/ash-custody-workspace-bridge.test.mjs', [[
`  ASH_LIFECYCLE_MODULE,
  ASH_WORKSPACE_BRIDGE_MODULE,`,
`  ASH_LIFECYCLE_ASSET_EPOCH,
  ASH_LIFECYCLE_MODULE,
  ASH_WORKSPACE_BRIDGE_MODULE,`,
'import asset epoch'
],[
`assert.match(renderedHtml, /src="\/dome-world\/ash-workspace-bridge\.js"/);`,
"assert.match(renderedHtml, new RegExp(`src=\"\\/dome-world\\/ash-workspace-bridge\\.js\\?v=${ASH_LIFECYCLE_ASSET_EPOCH}\"`));",
'accept exact versioned workspace bridge'
]]);

patch('tests/dome-world-lab-marrowline-link.test.mjs', [[
`assert.equal(DOME_WORLD_SHELL_VERSION, 'td613.dome-world.shell/v1.4-lifecycle-cache-boundary');`,
`assert.equal(DOME_WORLD_SHELL_VERSION, 'td613.dome-world.shell/v1.5-aia3-mass-eviction');`,
'migrate shell version'
]]);

const inheritedNewBlock = [
  "assert.match(lifecycle, /ash-cache-eviction-aia3\\.js\\?v=\\$\\{assetEpoch\\}/);",
  "assert.match(lifecycle, /ash-ingress-layout-hydration\\.js\\?v=\\$\\{assetEpoch\\}/);",
  "assert.doesNotMatch(lifecycle, /ash-cache-flush\\.js/);",
  "assert.equal(ASH_LIFECYCLE_MODULE, '/dome-world/ash-lifecycle.js?v=20260720-aia3-mass-eviction-v2');",
  "const renderedKeep = injectAshKeepLifecycle(keepHtml);",
  "for (const module of ['ash-keep.js', 'ash-convergence.js', 'ash-lifecycle.js', 'ash-workspace-bridge.js', 'ash-case-controls.js']) {",
  "  const escaped = module.replace('.', '\\\\.');",
  "  assert.match(renderedKeep, new RegExp(`src=\"\\/dome-world\\/${escaped}\\?v=20260720-aia3-mass-eviction-v2\"`));",
  "}",
  "assert.match(renderedKeep, /ash-cache-preflight/);",
  "assert.match(renderedKeep, /Updating Ash Keep · preserving local cases/);",
  "assert.match(renderedKeep, /local_case_pointer_preserved/);",
  "assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'Lifecycle cache-boundary injection is not idempotent.');"
].join('\n');

patch('tests/ash-live-ingress-demos-cache.test.mjs', [[
`assert.match(lifecycle, /ash-ingress-layout-hydration\\.js\\?v=20260718-canonical-membrane-v6/);
assert.match(lifecycle, /ash-cache-flush\\.js\\?v=20260718-canonical-membrane-v7-readiness-boundary/);
assert.equal(ASH_LIFECYCLE_MODULE, '/dome-world/ash-lifecycle.js?v=20260718-canonical-membrane-v7-readiness-boundary');
const renderedKeep = injectAshKeepLifecycle(keepHtml);
assert.match(renderedKeep, /src="\\/dome-world\\/ash-lifecycle\\.js\\?v=20260718-canonical-membrane-v7-readiness-boundary"/);
assert.doesNotMatch(renderedKeep, /src="\\/dome-world\\/ash-lifecycle\\.js"/);
assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep, 'Lifecycle cache-boundary injection is not idempotent.');`,
inheritedNewBlock,
'migrate inherited lifecycle delivery law'
],[
`  'HTTP_CACHE_ONLY',`,
`  'HTTP_CACHE_AND_SERVICE_WORKER_CLIENT_EVICTION',`,
'migrate cache scope'
]]);

console.log(JSON.stringify({ status:'PATCHED' }, null, 2));
