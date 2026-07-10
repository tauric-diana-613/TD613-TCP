import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');
const exists = (filePath) => fs.existsSync(path.join(root, filePath));

const requiredFiles = [
  'package.json',
  'app/index.html',
  'app/desktop-visibility-parity.css',
  'app/adversarial-bench.html',
  'app/hush-phase39.css',
  'app/hush-phase39-engine.js',
  'app/hush-phase39-ui.js',
  'tests/hush-phase39-engine.test.mjs',
  'tests/hush-phase39-ui.test.mjs',
  'app/safe-harbor/index.html',
  'app/safe-harbor/td613-flight.html',
  'app/safe-harbor/app/desktop-rescue.css',
  'app/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js',
  'scripts/legacy/flight-patches/README.md'
];

for (const filePath of requiredFiles) {
  assert.ok(exists(filePath), `TCP smoke missing required file: ${filePath}`);
}

const pkg = JSON.parse(read('package.json'));
assert.equal(pkg.type, 'module', 'package must stay ESM-compatible');
assert.ok(pkg.scripts?.test, 'package must expose the full test command');
assert.ok(pkg.scripts?.['test:hush'], 'package must expose the deep Hush regression command');
assert.ok(pkg.scripts?.['test:safe-harbor'], 'package must expose the Safe Harbor regression command');

const hushManifest = read('app/asset-versions.js');
assert.ok(hushManifest.includes('hushPhase39'), 'asset manifest must expose Hush Phase 39 version');
assert.ok(hushManifest.includes('hush-phase39.css'), 'asset manifest must load Phase 39 CSS');
assert.ok(hushManifest.includes('hush-phase39-ui.js'), 'asset manifest must load Phase 39 UI');
assert.ok(hushManifest.includes('desktopVisibilityParity'), 'asset manifest must version the desktop visibility contract');
assert.ok(hushManifest.includes('desktop-visibility-parity.css'), 'asset manifest must load the desktop visibility contract');

const hushEngine = read('app/hush-phase39-engine.js');
for (const marker of ['detectEpistemicide', 'protectedMeaningResults', 'registerDrift', 'phase39Receipt', 'runPhase39']) {
  assert.ok(hushEngine.includes(`export function ${marker}`), `Phase 39 engine missing export: ${marker}`);
}
assert.ok(hushEngine.includes('privateTextExcluded: true'), 'Phase 39 receipts must exclude private text');

const hushUi = read('app/hush-phase39-ui.js');
for (const marker of ['hushPhase39Panel', 'Meaning Survives the Mask', 'Protected meaning lockbox', 'Clean Receipt']) {
  assert.ok(hushUi.includes(marker), `Phase 39 UI missing marker: ${marker}`);
}

const flight = read('app/safe-harbor/td613-flight.html');
const flightNeedles = [
  'Prompt Output',
  'Seal',
  'Glyph Bay',
  'Dev Settings',
  'id="payloadStepper"',
  'id="authOutputToggle"',
  'mobile-prompt-rail mobile-prompt-rail-top',
  'PR90_SENTINEL TD613 Flight seal side-by-side target/zwnj repair',
  'PR91_SENTINEL TD613 Flight mobile tile controls restoration',
  'PR92_SENTINEL TD613 Flight dashboard polish: shelves, rail, payload',
  'grid-template-areas: "target zwnj" !important;',
  'flex-flow: row wrap !important;',
  'grid-template-areas: "counts payload" ". auth" !important;',
  '“I was broken encasing a circle.”',
  '“When authoring, stay academically rigorous yet grounded in high speculation.”'
];

for (const needle of flightNeedles) {
  assert.ok(flight.includes(needle), `TCP smoke missing Flight surface marker: ${needle}`);
}

assert.equal((flight.match(/id="payloadStepper"/g) || []).length, 1, 'Flight surface must contain exactly one payload stepper');
assert.equal((flight.match(/id="authOutputToggle"/g) || []).length, 1, 'Flight surface must contain exactly one authorship output toggle');
assert.ok(!flight.includes('function prepNoZoom'), 'retired prepNoZoom guard must stay absent');
assert.ok(!flight.includes('data-td613-prev-font'), 'retired focus font shim must stay absent');
assert.ok(!flight.includes('phrases.push("“I was broken encasing a circle.”")'), 'encasing output value must remain unquoted');
assert.ok(!flight.includes('phrases.push("“When authoring, stay academically rigorous yet grounded in high speculation.”")'), 'academic speculation output value must remain unquoted');
assert.ok(
  !flight.includes('grid-template-areas: "counts auth" ". payload" !important;'),
  'retired Flight mobile status layout must stay absent'
);

const harborIndex = read('app/safe-harbor/index.html');
assert.ok(harborIndex.includes('Safe Harbor') || harborIndex.includes('safe-harbor'), 'Safe Harbor index must remain discoverable');
assert.match(harborIndex, /id="injectDynamicLane"/, 'Safe Harbor must retain the Dynamic Lane control');
assert.match(harborIndex, /id="dynamicTarget"/, 'Safe Harbor must retain the Dynamic Lane target');

const desktopRescue = read('app/safe-harbor/app/desktop-rescue.css');
assert.match(desktopRescue, /grid-template-areas:\s*\n\s*"canon chamber"/, 'desktop Safe Harbor must retain the deterministic compact desktop grid');
assert.match(desktopRescue, /@media \(min-width: 1360px\)/, 'wide desktop must restore the three-station cockpit');
assert.match(desktopRescue, /max-height: none;\s*\n\s*overflow: visible;/, 'desktop panels must remain in normal document flow');
assert.doesNotMatch(desktopRescue, /\.canon-panel,[\s\S]{0,180}position:\s*sticky/, 'desktop side panels must not hide sections behind nested sticky scroll containers');

const renderer = read('app/safe-harbor/renderers/10_TD613_PUA_Badge_Provenance_Attestation_Renderer_v7_2_1.user.js');
assert.doesNotThrow(() => new Function(renderer), 'PUA renderer userscript must parse');
assert.match(renderer, /@grant\s+none/, 'PUA renderer must execute without an unused privileged grant');
assert.doesNotMatch(renderer, /@grant\s+GM_setClipboard/, 'unused clipboard privilege must stay absent');
assert.match(renderer, /closest\('#injectDynamicLane'\)/, 'renderer must rescan after the Dynamic Lane control is pressed');
assert.match(renderer, /dynamic-lane-rescan/, 'renderer must emit a post-injection rescan receipt');
assert.match(renderer, /dataset\.td613RendererBridge/, 'renderer must stamp a cross-world readiness marker');

const gateway = read('app/index.html');
assert.ok(gateway.includes('<html'), 'Gateway must remain an HTML document');
for (const id of ['ingressSubtitle', 'ingressCueCopy', 'ingressStatus', 'ingressForensicGrid']) {
  assert.match(gateway, new RegExp(`id="${id}"`), `Gateway ingress must retain written instruction surface: ${id}`);
}
assert.match(gateway, /class="ingress-cue-card ingress-forensic-card"/, 'Gateway must retain the governed-exposure instruction card');

const desktopVisibility = read('app/desktop-visibility-parity.css');
assert.match(desktopVisibility, /#ingressMembrane[\s\S]{0,260}overflow-y:\s*auto\s*!important/, 'Gateway desktop scrolling must belong to the visible membrane');
assert.match(desktopVisibility, /\.ingress-layer[\s\S]{0,260}max-height:\s*none\s*!important/, 'Gateway desktop ingress layer must not be capped to one viewport');
assert.match(desktopVisibility, /\.ingress-layer[\s\S]{0,320}overflow:\s*visible\s*!important/, 'Gateway desktop ingress layer must remain in normal document flow');
assert.match(desktopVisibility, /\.ingress-cue-copy/, 'Gateway written puzzle cues must be covered by the visibility contract');
assert.match(desktopVisibility, /\.ingress-forensic-card/, 'Gateway governed-exposure copy must be covered by the visibility contract');
assert.doesNotMatch(desktopVisibility, /scrollbar-width:\s*none/, 'desktop instruction surfaces must not erase their scroll affordance');

console.log('TCP smoke passed: static surfaces, Flight sentinels, Safe Harbor flow, Mac renderer bridge, and desktop instruction visibility are intact.');
