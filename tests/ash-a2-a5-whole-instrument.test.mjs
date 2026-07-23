import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const moduleSource = read('app/dome-world/ash-whole-instrument-pedagogy.js');
const a6Source = read('app/dome-world/ash-a6-affordance-drawer-repair.js');
const css = read('app/dome-world/ash-whole-instrument-pedagogy.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const eviction = read('app/dome-world/ash-cache-eviction-aia3.js');
const cacheFlush = read('app/dome-world/ash-cache-flush.js');
const recovery = read('app/safe-harbor/ash-keep-recovery.html');
const shell = read('api/dome-world-shell.js');
const journeyAdapter = read('scripts/ash-keep-aia3-task-journey-v3.mjs');
const journeySource = read('scripts/ash-keep-aia3-task-journey-v3.source.mjs');
const closureWorkflow = read('.github/workflows/ash-keep-production-closure.yml');
const receipt = read('app/dome-world/docs/ASH_KEEP_A2_A5_IMPLEMENTATION_RECEIPT_V0_1.md');
const programIndex = read('app/dome-world/docs/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md');

assert.match(moduleSource, /td613\.ash\.whole-instrument-pedagogy\/v0\.1-a2-a5/);
assert.match(moduleSource, /▶ Play Consequence Field/);
assert.match(moduleSource, /How this scene is speaking/);
for (const channel of ['glyph','motion','shape','language','inspection']) assert.match(moduleSource, new RegExp(`data-flowcore-channel="${channel}"`));
assert.match(moduleSource, /openInspection/);
assert.match(moduleSource, /prefers-reduced-motion: reduce/);
assert.match(moduleSource, /static_parity: true/);
for (const scene of ['ingress','home','map','work','choir','capsule']) assert.match(moduleSource, new RegExp(`\\b${scene}: Object\\.freeze`));
assert.doesNotMatch(moduleSource, /new MutationObserver|setInterval\(/);
for (const [route, label] of [
  ['EXPERIENTIAL','Learn by doing'], ['CUSTODIAL','Protect the source'],
  ['AUDIT','Check the evidence'], ['IMPLEMENTATION','Inspect the machinery']
]) assert.match(moduleSource, new RegExp(`${route}:[\\s\\S]*?label: '${label}'`));
assert.match(moduleSource, /Your case path/);
assert.match(moduleSource, /See what stays local, what may change, and where a human decision is still required\./);
assert.match(moduleSource, /route_inference: false/);
assert.match(moduleSource, /td613\.ash\.transition-delta\/v0\.1/);
for (const preserved of ['case state','authority','source bytes','custody','claim ceiling','release posture','human closure']) assert.match(moduleSource, new RegExp(`'${preserved}'`));
for (const invariant of [
  'authority_changed: false','source_bytes_moved: false','custody_changed: false',
  'claim_ceiling_changed: false','release_posture_changed: false','closure_changed: false'
]) assert.match(moduleSource, new RegExp(invariant));

assert.match(moduleSource, /td613\.ash\.navigation-receipt\/v0\.1/);
for (const fieldName of [
  'source_control','source_workspace','destination_workspace','destination_heading',
  'destination_anchor','prior_viewport_owner','new_viewport_owner','return_path','result'
]) assert.match(moduleSource, new RegExp(`${fieldName}:`));
assert.match(moduleSource, /EXPLICIT_NAVIGATION_GESTURE/);
assert.match(moduleSource, /scrollIntoView/);
assert.match(moduleSource, /preventScroll:true/);
assert.match(moduleSource, /event\.stopImmediatePropagation\(\)/);
assert.match(moduleSource, /ingress-\$\{type\}/);

assert.match(css, /ash-whole-instrument-play/);
assert.match(css, /bottom:14px/);
assert.match(css, /ash-channel-legend/);
assert.match(css, /ash-route-surface/);
assert.match(css, /ash-command-attention/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /\.ash-flowcore-field\{grid-template-columns:minmax\(0,1fr\)!important/);
assert.match(css, /\.ash-flowcore-field>\*\{min-width:0;max-width:100%\}/);
assert.match(css, /\.ash-flowcore-field__canvas\{box-sizing:border-box;width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:auto!important\}/);
assert.match(css, /button\[data-flowcore-channel="inspection"\]\{grid-column:1\/-1\}/);

const assetEpoch = '20260723-a2-a5-release-v1';
const cacheEpoch = 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1';
for (const [name, source] of [
  ['shell',shell], ['lifecycle',lifecycle], ['workspace bridge',bridge],
  ['cache eviction',eviction], ['recovery bridge',recovery], ['journey adapter',journeyAdapter]
]) assert.match(source, new RegExp(assetEpoch.replaceAll('-', '\\-')), `${name} omitted the A2-A5 asset epoch`);
for (const [name, source] of [
  ['shell',shell], ['cache eviction',eviction], ['cache flush',cacheFlush],
  ['recovery bridge',recovery], ['journey adapter',journeyAdapter]
]) assert.match(source, new RegExp(cacheEpoch.replaceAll('/', '\\/').replaceAll('.', '\\.').replaceAll('-', '\\-')), `${name} omitted the A2-A5 cache epoch`);
for (const [name, source] of [
  ['shell',shell], ['lifecycle',lifecycle], ['workspace bridge',bridge],
  ['cache eviction',eviction], ['cache flush',cacheFlush], ['recovery bridge',recovery]
]) assert.doesNotMatch(source, /20260721-legal-demo-ux-v1/, `${name} retained the superseded delivery epoch`);
assert.match(journeySource, /const EPOCH = '20260721-legal-demo-ux-v1'/);
assert.match(journeyAdapter, /const RELEASE_EPOCH = '20260723-a2-a5-release-v1'/);
assert.match(journeyAdapter, /location\.pathname === '\/dome-world\/ash-threshold\.html'/);
assert.match(journeyAdapter, /location\.search === ''/);
assert.match(bridge, /ash-whole-instrument-pedagogy\.js\?v=20260723-a2-a5-release-v1/);
assert.match(receipt, /prior asset epoch: 20260721-legal-demo-ux-v1/);
assert.match(receipt, /replacement asset epoch: 20260723-a2-a5-release-v1/);
assert.match(receipt, /replacement cache epoch: td613\.ash\.cache-flush\/2026-07-23-a2-a5-release-v1/);
assert.match(programIndex, /Ash A2–A5/);
assert.match(programIndex, /20260723-a2-a5-release-v1/);

assert.doesNotMatch(closureWorkflow, /\n  workflow_run:/);
assert.doesNotMatch(closureWorkflow, /github\.event\.workflow_run/);
assert.match(closureWorkflow, /RUN_DEPLOYED_OBSERVATION/);
assert.match(closureWorkflow, /inputs\.base_url/);
assert.match(receipt, /new serverless function = false/);
assert.match(receipt, /active serverless functions = 11/);
assert.match(receipt, /reserved function capacity = 1/);
assert.doesNotMatch(moduleSource, /\/api\//);

// A6 — affordance and drawer repair.
assert.match(a6Source, /td613\.ash\.a6-affordance-drawer-repair\/v0\.1/);
assert.match(bridge, /ash-a6-affordance-drawer-repair\.js\?v=20260723-a2-a5-release-v1/);
for (const marker of [
  'Open Local Document', 'Open Draft Workspace', 'Previous Lesson', 'Next Lesson', '𝄐 Rest',
  'Cases & profiles', 'Open Workspace Setup', 'What changed—and what did not'
]) assert.match(a6Source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
for (const marker of ['ashA6LocalDocumentSurface','ashA6DraftSurface','ashA6ChooseLocalDocument','ashA6DraftBody']) assert.match(a6Source, new RegExp(marker));
assert.match(a6Source, /destination:\{ workspace:'work', anchor:'ashA6LocalDocumentSurface' \}/);
assert.match(a6Source, /destination:\{ workspace:'work', anchor:'ashA6DraftSurface' \}/);
assert.match(a6Source, /fileInput\.click\(\)/);
assert.match(a6Source, /exact\.dispatchEvent\(new InputEvent\('input'/);
assert.match(a6Source, /Structural Rest is active/);
assert.match(a6Source, /current consequence remains inspectable/);
assert.match(a6Source, /REST_DEMAND_SELECTOR/);
assert.match(a6Source, /data-ash-a6-rest-held/);
assert.match(a6Source, /HELD_WITH_EXPLANATION/);
for (const field of ['missing','why','satisfy','change','unchanged']) assert.match(a6Source, new RegExp(`${field}:`));
assert.match(a6Source, /No additional state is available in this disclosure/);
assert.match(a6Source, /No state delta has been observed yet/);
assert.match(a6Source, /You changed how Ash explains this case/);
assert.match(a6Source, /The underlying case state did not change/);
assert.match(a6Source, /LEGEND_ONLY/);
assert.match(a6Source, /td613\.ash\.affordance-contract\/v0\.1/);
assert.match(a6Source, /td613\.ash\.a6-world-answer\/v0\.1/);
assert.match(a6Source, /human_closure_required:true/);
assert.doesNotMatch(a6Source, /new MutationObserver|setInterval\(|navigator\.sendBeacon|\/api\//);
assert.doesNotMatch(a6Source, /ASH_AIA3_CACHE_EPOCH|ASH_AIA3_ASSET_EPOCH|cache-flush\/2026-07-24|20260724/);
for (const invariant of [
  'authority_changed:false','source_bytes_moved:false','custody_changed:false',
  'release_posture_changed:false','closure_changed:false'
]) assert.match(a6Source, new RegExp(invariant));

console.log('Ash A2-A6 whole-instrument contracts: PASS');
