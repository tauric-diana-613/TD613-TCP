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
`const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="aia3-mass-eviction-v2">';`,
`const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="aia3-mass-eviction-v2">';
const ASH_MODULE_ADMISSION_MARKER = 'td613-ash-module-admission';`,
'admission marker'
],[
`export function injectMarrowlineLabButton(source = '') {`,
`function ashModuleAdmissionLoader() {
  const modules = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);
  return \`<script type="module" id="\${ASH_MODULE_ADMISSION_MARKER}">
  await (window.__td613AshAia3Preflight || Promise.resolve());
  for (const module of \${JSON.stringify(modules)}) await import(module);
  </script>\`;
}

export function injectMarrowlineLabButton(source = '') {`,
'admission loader helper'
],[
`  for (const [sourceModule, versionedModule] of ASH_VERSIONED_MODULES) {
    const versionedTag = \`src="\${versionedModule}"\`;
    if (html.includes(versionedTag)) continue;
    const unversionedTag = \`src="\${sourceModule}"\`;
    if (!html.includes(unversionedTag)) throw new Error(\`ash-canonical-module-source-missing:\${sourceModule}\`);
    html = html.replace(unversionedTag, versionedTag);
  }

  const ordered = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);`,
`  const admissionPresent = html.includes(\`id="\${ASH_MODULE_ADMISSION_MARKER}"\`);
  for (const [sourceModule, versionedModule] of ASH_VERSIONED_MODULES) {
    if (admissionPresent && html.includes(versionedModule)) continue;
    const versionedTag = \`src="\${versionedModule}"\`;
    if (html.includes(versionedTag)) continue;
    const unversionedTag = \`src="\${sourceModule}"\`;
    if (!html.includes(unversionedTag)) throw new Error(\`ash-canonical-module-source-missing:\${sourceModule}\`);
    html = html.replace(unversionedTag, versionedTag);
  }

  const ordered = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);
  if (!admissionPresent) {
    for (const module of ordered) {
      const tag = \`<script type="module" src="\${module}"></script>\`;
      if (!html.includes(tag)) throw new Error(\`ash-static-entry-module-tag-missing:\${module}\`);
      html = html.replace(tag, '');
    }
    const bodyClose = html.lastIndexOf('</body>');
    if (bodyClose < 0) throw new Error('ash-keep-body-marker-missing');
    html = \`\${html.slice(0, bodyClose)}  \${ashModuleAdmissionLoader()}\\n\${html.slice(bodyClose)}\`;
  }`,
'replace static module tags with admission loader'
],[
`  if (!html.includes(ASH_MASS_EVICTION_MARKER)) throw new Error('ash-cache-preflight-missing');
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');`,
`  if (!html.includes(ASH_MASS_EVICTION_MARKER)) throw new Error('ash-cache-preflight-missing');
  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');
  if (!html.includes(\`id="\${ASH_MODULE_ADMISSION_MARKER}"\`)) throw new Error('ash-module-admission-barrier-missing');`,
'require admission loader'
]]);

patch('tests/product-architecture/shell.test.mjs', [[
`  assert.match(renderedKeep, new RegExp(\`src="\${module.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}"\`));`,
`  assert.match(renderedKeep, new RegExp(module.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')));`,
'ordered module assertion'
],[
`assert.match(renderedKeep, /name="ash-cache-preflight" content="aia3-mass-eviction-v2"/);`,
`assert.match(renderedKeep, /id="td613-ash-module-admission"/);
assert.match(renderedKeep, /await \(window\.__td613AshAia3Preflight \|\| Promise\.resolve\(\)\)/);
for (const module of versionedModules) assert.doesNotMatch(renderedKeep, new RegExp(\`<script[^>]+src="\${module.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}"\`));
assert.match(renderedKeep, /name="ash-cache-preflight" content="aia3-mass-eviction-v2"/);`,
'admission barrier assertions'
]]);

patch('tests/ash-custody-workspace-bridge.test.mjs', [[
`assert.match(renderedHtml, new RegExp(\`src="/dome-world/ash-workspace-bridge\\.js\\?v=\${ASH_LIFECYCLE_ASSET_EPOCH}"\`));`,
`assert.match(renderedHtml, new RegExp(\`/dome-world/ash-workspace-bridge\\.js\\?v=\${ASH_LIFECYCLE_ASSET_EPOCH}\`));
assert.doesNotMatch(renderedHtml, new RegExp(\`<script[^>]+src="/dome-world/ash-workspace-bridge\\.js\\?v=\${ASH_LIFECYCLE_ASSET_EPOCH}"\`));`,
'workspace bridge admission assertion'
]]);

patch('tests/ash-live-ingress-demos-cache.test.mjs', [[
`for (const module of ['ash-keep.js', 'ash-convergence.js', 'ash-lifecycle.js', 'ash-workspace-bridge.js', 'ash-case-controls.js']) {
  const escaped = module.replace('.', '\\\\.');
  assert.match(renderedKeep, new RegExp(\`src="\\/dome-world\\/\${escaped}\\?v=20260720-aia3-mass-eviction-v2"\`));
}`,
`assert.match(renderedKeep, /id="td613-ash-module-admission"/);
for (const module of ['ash-keep.js', 'ash-convergence.js', 'ash-lifecycle.js', 'ash-workspace-bridge.js', 'ash-case-controls.js']) {
  const escaped = module.replace('.', '\\\\.');
  assert.match(renderedKeep, new RegExp(\`\\/dome-world\\/\${escaped}\\?v=20260720-aia3-mass-eviction-v2\`));
  assert.doesNotMatch(renderedKeep, new RegExp(\`<script[^>]+src="\\/dome-world\\/\${escaped}\\?v=20260720-aia3-mass-eviction-v2"\`));
}`,
'inherited admission barrier assertions'
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
'legacy clean-arrival maintenance set'
],[
`const navigationMarker = 'ASH_AIA3_MASS_EVICTION_STABLE';`,
`const navigationMarker = 'ASH_AIA3_LEGACY_BYPASS_STABLE';`,
'legacy navigation marker'
],[
`  cache_navigation_required:true,
  active_document_replacement_allowed:'ONE_EXACT_ASH_EPOCH_REPLACEMENT',`,
`  cache_navigation_required:false,
  active_document_replacement_allowed:false,`,
'legacy fixture authority'
]]);

console.log('apply-ash-module-admission-barrier.mjs patched');
