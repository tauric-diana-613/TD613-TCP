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
}

patch('api/dome-world-shell.js', [[
`    document.documentElement.dataset.ashCachePreflight='pending';
    window.__td613AshAia3Preflight=(async()=>{`,
`    document.documentElement.dataset.ashCachePreflight='pending';
    const veil=document.createElement('div');
    veil.id='td613-ash-cache-preflight-veil';
    veil.textContent='Updating Ash Keep · preserving local cases';
    veil.setAttribute('role','status');
    veil.setAttribute('aria-live','polite');
    veil.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:#010806;color:#fff8da;font:600 13px/1.5 ui-monospace,monospace;letter-spacing:.04em;text-align:center';
    document.documentElement.append(veil);
    window.stop();
    window.__td613AshAia3Preflight=(async()=>{`,
'stop parser before Ash module requests'
]]);

patch('tests/ash-aia3-mass-eviction.test.mjs', [[
`  assert.match(shellSource, /Updating Ash Keep · preserving local cases/);`,
`  assert.match(shellSource, /Updating Ash Keep · preserving local cases/);
  assert.match(shellSource, /td613-ash-cache-preflight-veil/);
  assert.match(shellSource, /window\.stop\(\)/);`,
'parser stop assertions'
]]);

patch('tests/product-architecture/shell.test.mjs', [[
`assert.match(renderedKeep, /Updating Ash Keep · preserving local cases/);`,
`assert.match(renderedKeep, /Updating Ash Keep · preserving local cases/);
assert.match(renderedKeep, /td613-ash-cache-preflight-veil/);
assert.match(renderedKeep, /window\.stop\(\)/);`,
'parser stop shell law'
]]);

patch('scripts/prepare-ash-premium-closure-fixture.mjs', [[
`const navigationReplacement = \`  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  // ASH_AIA3_MASS_EVICTION_STABLE: one pre-module replacement admits the current asset graph.
  await page.waitForURL(url => url.searchParams.get('ash_epoch') === \${JSON.stringify(assetEpoch)}, { timeout: 60_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(({ legacyEpoch, massEpoch, assetEpoch }) => {
    const url = new URL(location.href);
    const transition = window.__td613AshCacheTransition;
    return url.searchParams.get('ash_epoch') === assetEpoch
      && localStorage.getItem('td613.ash.cache-flush.epoch') === legacyEpoch
      && localStorage.getItem('td613.ash.cache-flush.aia3.epoch') === massEpoch
      && localStorage.getItem('td613.ash.cache-preflight.epoch') === massEpoch
      && transition?.superseded_by_mass_eviction === true
      && transition?.active_session_reset === false;
  }, { legacyEpoch:\${JSON.stringify(legacyEpoch)}, massEpoch:\${JSON.stringify(massEpoch)}, assetEpoch:\${JSON.stringify(assetEpoch)} }, { timeout: 60_000 });\`;`,
`const navigationReplacement = \`  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  // ASH_AIA3_LEGACY_BYPASS_STABLE: rollback loads exact legacy work without an AIA eviction reload.
  await page.waitForFunction(() => window.__td613AshAia3PreflightReceipt?.legacy_bypass === true
    && document.documentElement.dataset.ashCachePreflight === 'complete', null, { timeout: 60_000 });\`;`,
'legacy closure navigation'
],[
`const maintenanceEntries = {
  'td613.ash.cache-flush.epoch':legacyEpoch,
  'td613.ash.cache-flush.aia3.epoch':massEpoch,
  'td613.ash.cache-preflight.epoch':massEpoch
};`,
`const maintenanceEntries = {};`,
'legacy maintenance set'
],[
`const navigationMarker = 'ASH_AIA3_MASS_EVICTION_STABLE';`,
`const navigationMarker = 'ASH_AIA3_LEGACY_BYPASS_STABLE';`,
'legacy marker'
],[
`  cache_navigation_required:true,
  active_document_replacement_allowed:'ONE_EXACT_ASH_EPOCH_REPLACEMENT',`,
`  cache_navigation_required:false,
  active_document_replacement_allowed:false,`,
'legacy fixture bounds'
]]);

console.log('apply-ash-parser-stop-gate.mjs patched');
