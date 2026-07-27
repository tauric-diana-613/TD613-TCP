import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const field = read('app/dome-world/ash-flowcore-pedagogy-field.js');
const css = read('app/dome-world/ash-flowcore-pedagogy-field.css');
const portal = read('app/dome-world/ash-flowcore-ingress-portal.js');
const portalLoader = read('app/dome-world/ash-flowcore-ingress-portal-loader.js');
const workspaceRemount = read('app/dome-world/ash-flowcore-workspace-remount.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const restoration = read('app/dome-world/ash-post-ingress-motion-restoration.js');
const boundary = read('app/dome-world/ash-session-boundary.js');
const spacing = read('app/dome-world/ash-ingress-copy-spacing.js');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const closeRepair = read('app/dome-world/ash-case-close-repair.js');
const runner = read('scripts/run-ash-flowcore-live-field-browser-probe.mjs');

for (const marker of [
  'td613.ash.flowcore-pedagogy-field/v0.2-consequence-topology-syntax-closed',
  'renderPedagogueScene, renderPedagogueStaticFrame','artifact_required:false','EXPLICIT_PLAY_GESTURE',
  'td613:ash:explanation-frame','STATIC_COMPLETE','RAW BYTES DO NOT CROSS','REFERENCE','≠ ARTIFACT',
  'CASE MAP RELATION FIELD','missingness stays visible','à','上','出','米','𝄐'
]) assert.ok(field.includes(marker), `Flow-Core field omitted ${marker}`);
for (const phase of ['NOTICE','ACT','WORLD_ANSWERS','NAME','REST']) assert.ok(field.includes(`id:'${phase}'`));
for (const channel of ['glyph','motion','shape','language','inspection']) assert.ok(field.includes(`<span>${channel}</span>`));
assert.match(field, /const playing = options\.playing \?\? bounded > 0/);
assert.doesNotMatch(field, /playing:nextPhase\s*>|setInterval\s*\(|requestAnimationFrame\s*\(/);

assert.match(css, /\.ash-flowcore-mounted>\.ash-ux-motion-track\{[^}]*display:grid!important/);
assert.match(css, /\.ash-flowcore-mounted\{[^}]*height:auto!important[^}]*overflow:visible!important/);
assert.match(css, /\.ash-flowcore-field__canvas\{[^}]*display:block!important[^}]*max-height:none!important/);
assert.match(css, /data-flowcore-phase="0"/);
assert.match(css, /data-flowcore-phase="4"/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.doesNotMatch(css, /\.ash-ux-motion-track\{display:none!important\}|animation:[^;}]*infinite/);

for (const marker of [
  'v0.3-canonical-field-ingress-polish','function stabilizeGeometry()','ashPostIngressMotion = receipt.canvas_visible && receipt.rail_visible',
  'field_clipped','rail_clipped','.ash-flowcore-mounted>.ash-ux-motion-track'
]) assert.ok(restoration.includes(marker));
assert.doesNotMatch(restoration, /setInterval\s*\(/);

for (const marker of [
  'v0.9-phase-atomic-canonical-play',"INGRESS_HOST_ID = 'guidedLaunchPromise'","LEGACY_PROMISE_ID = 'guidedLaunchPromiseLegacy'",
  "button.addEventListener('click', playFlowcoreField)",'[data-aia-play]','td613:ash:flowcore-field-phase',
  'function applyProxyPosture(node)','function normalizeStageFields()','ash-flowcore-field--proxy','ingress.replaceChildren(visibleField)',
  "setDataset(visibleField, 'flowcoreHost', 'aia')",'proxy_count','duplicate_visible_fields','#guidedLaunchPromise.ash-flowcore-ingress-host',
  'function queueSync(reason)','function mutationTouchesPortal(record)'
]) assert.ok(portal.includes(marker), `Flow-Core portal omitted ${marker}`);
assert.doesNotMatch(portal, /setInterval\s*\(|requestAnimationFrame\s*\(/);

for (const marker of [
  'td613.ash.flowcore-workspace-remount/v0.1-whole-instrument-owner',
  "['whole-instrument-refreshed','flowcore-portal-loader-ready']",
  'portal.refresh() === true',
  'canonical_visible_field_count:visibleCanonicalFields().length',
  'authority_changed:false',
  'source_bytes_moved:false',
  'human_closure_required:true'
]) assert.ok(workspaceRemount.includes(marker), `Flow-Core workspace remount omitted ${marker}`);
assert.doesNotMatch(workspaceRemount, /setInterval\s*\(|requestAnimationFrame\s*\(|new MutationObserver/);
assert.match(lifecycle, /ash-flowcore-workspace-remount\.js\?v=\$\{ASH_RELEASE_ASSET_EPOCH\}/);

for (const marker of ['v0.3-observer-hotfix','EXPLICIT_LEGACY_PRESENTATION','20260722-flowcore-observer-hotfix-v3']) assert.ok(portalLoader.includes(marker));
assert.doesNotMatch(portalLoader, /setInterval\s*\(|requestAnimationFrame\s*\(/);

for (const marker of [
  'v0.4-pointer-governs-case-recovery-replay-stays-open','function capsuleRecoveryOpen()','RECOVERY_FILE_CHANGED',
  'CUSTODIAN_RETURN_SETTLED','CAPSULE_OPENED_SETTLED','td613:ash:case-closed'
]) assert.ok(boundary.includes(marker));
assert.doesNotMatch(boundary, /indexedDB\.deleteDatabase/);
assert.match(closeRepair, /localStorage\.removeItem\(POINTER_KEY\)/);

for (const marker of [
  'v0.2-two-dimensional-overlap',"title.insertAdjacentElement('afterend', recovery)",
  "recovery.insertAdjacentElement('afterend', primary)",'overlap_area:collision.area','ordered:title.nextElementSibling === recovery'
]) assert.ok(spacing.includes(marker));
assert.doesNotMatch(spacing, /setInterval\s*\(|requestAnimationFrame\s*\(/);

for (const marker of [
  'td613.ash.demo-registry/v0.3-a15','empirical_matrix_cells === 120',
  'td613.ash.a15-empirical-profile-journeys/v0.1','v0.16-a15-registry-owned-dom-readiness',
  'Flow-Core A15 registry version gate was not materialized'
]) assert.ok(runner.includes(marker), `A15 Flow-Core runner omitted ${marker}`);
assert.match(runner, /for \(const retired of \['td613\.ash\.demo-registry\/v0\.1-a13','td613\.ash\.demo-registry\/v0\.2-a14'\]\)/);

const releaseEpoch = '20260724-a12-release-v1';
for (const module of ['ash-session-boundary','ash-ingress-copy-spacing','ash-flowcore-pedagogy-field','ash-flowcore-ingress-portal-loader','ash-post-ingress-motion-restoration','ash-reviewability-repair']) {
  assert.match(bridge, new RegExp(`${module}\\.js\\?v=${releaseEpoch}`));
}
assert.doesNotMatch(bridge, /import '\.\/ash-flowcore-ingress-portal\.js/);

console.log('ash-flowcore-live-field.test.mjs passed with A15 registry-owned readiness and whole-instrument canonical-field remount ownership');
