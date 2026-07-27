import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const moduleSource = read('app/dome-world/ash-whole-instrument-pedagogy.js');
const a6Source = read('app/dome-world/ash-a6-affordance-drawer-repair.js');
const css = read('app/dome-world/ash-whole-instrument-pedagogy.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const registry = read('app/dome-world/ash-demo-registry.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const eviction = read('app/dome-world/ash-cache-eviction-aia3.js');
const cacheFlush = read('app/dome-world/ash-cache-flush.js');
const recovery = read('app/safe-harbor/ash-keep-recovery.html');
const shell = read('api/dome-world-shell.js');
const journeyAdapter = read('scripts/ash-keep-aia3-task-journey-v3.mjs');
const journeySource = read('scripts/ash-keep-aia3-task-journey-v3.source.mjs');
const a2a6BrowserAdapter = read('scripts/ash-a2-a5-browser-probe.mjs');
const historicalA2A6Browser = read('scripts/ash-a2-a5-browser-probe-a13.mjs');
const consolidatedWorkflow = read('.github/workflows/td613-ci.yml');
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
for (const [route, label] of [['EXPERIENTIAL','Learn by doing'],['CUSTODIAL','Protect the source'],['AUDIT','Check the evidence'],['IMPLEMENTATION','Inspect the machinery']]) assert.match(moduleSource, new RegExp(`${route}:[\\s\\S]*?label: '${label}'`));
assert.match(moduleSource, /Your case path/);
assert.match(moduleSource, /route_inference: false/);
assert.match(moduleSource, /td613\.ash\.transition-delta\/v0\.1/);
for (const preserved of ['case state','authority','source bytes','custody','claim ceiling','release posture','human closure']) assert.match(moduleSource, new RegExp(`'${preserved}'`));
for (const invariant of ['authority_changed: false','source_bytes_moved: false','custody_changed: false','claim_ceiling_changed: false','release_posture_changed: false','closure_changed: false']) assert.match(moduleSource, new RegExp(invariant));

assert.match(moduleSource, /td613\.ash\.navigation-receipt\/v0\.1/);
for (const fieldName of ['source_control','source_workspace','destination_workspace','destination_heading','destination_anchor','prior_viewport_owner','new_viewport_owner','return_path','result']) assert.match(moduleSource, new RegExp(`${fieldName}:`));
assert.match(moduleSource, /EXPLICIT_NAVIGATION_GESTURE/);
assert.match(moduleSource, /scrollIntoView/);
assert.match(moduleSource, /preventScroll:true/);
assert.match(moduleSource, /event\.stopImmediatePropagation\(\)/);

for (const token of ['ash-whole-instrument-play','ash-channel-legend','ash-route-surface','ash-command-attention','prefers-reduced-motion:reduce']) assert.match(css, new RegExp(token));
assert.match(css, /button\[data-flowcore-channel="inspection"\]\{grid-column:1\/-1\}/);

const historicalAssetEpoch = '20260723-a2-a5-release-v1';
const historicalCacheEpoch = 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1';
const inheritedAssetEpoch = '20260724-a12-release-v1';
const currentRegistryEpoch = '20260726-a15-empirical-v1';
const retainedMassEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
for (const [name, source] of [['shell',shell],['lifecycle',lifecycle],['workspace bridge',bridge],['cache eviction',eviction],['recovery bridge',recovery]]) assert.match(source, new RegExp(inheritedAssetEpoch.replaceAll('-', '\\-')), `${name} omitted inherited live asset epoch`);
assert.match(bridge, new RegExp(currentRegistryEpoch.replaceAll('-', '\\-')), 'A15 registry asset epoch did not enter the bridge');
assert.match(registry, new RegExp(currentRegistryEpoch.replaceAll('-', '\\-')), 'A15 registry omitted its ordinary asset epoch');
for (const [name, source] of [['shell',shell],['cache eviction',eviction],['cache flush',cacheFlush],['recovery bridge',recovery]]) assert.match(source, new RegExp(retainedMassEpoch.replaceAll('/', '\\/').replaceAll('.', '\\.').replaceAll('-', '\\-')), `${name} omitted retained A11 mass epoch`);
assert.doesNotMatch(registry, /ash_epoch|caches\.|serviceWorker|deleteDatabase|localStorage\.clear|sessionStorage\.clear/);
assert.match(journeyAdapter, new RegExp(historicalAssetEpoch.replaceAll('-', '\\-')));
assert.match(journeyAdapter, new RegExp(historicalCacheEpoch.replaceAll('/', '\\/').replaceAll('.', '\\.').replaceAll('-', '\\-')));
assert.match(journeySource, /const EPOCH = '20260721-legal-demo-ux-v1'/);
assert.match(journeyAdapter, /const RELEASE_EPOCH = '20260723-a2-a5-release-v1'/);
assert.match(journeyAdapter, /location\.pathname === '\/dome-world\/ash-threshold\.html'/);
assert.match(journeyAdapter, /location\.search === ''/);
assert.match(receipt, /replacement asset epoch: 20260723-a2-a5-release-v1/);
assert.match(programIndex, /Ash A2–A5/);

assert.match(consolidatedWorkflow, /TD613 Consolidated Validation/);
assert.match(consolidatedWorkflow, /node tests\/ash-a2-a5-whole-instrument\.test\.mjs/);
assert.match(consolidatedWorkflow, /scripts\/ash-a2-a5-browser-probe\.mjs/);
assert.match(consolidatedWorkflow, /Run bounded closure and constitutional convergence once/);
assert.doesNotMatch(consolidatedWorkflow, /workflow_run:/);
assert.match(a2a6BrowserAdapter, /post-hydration exact-case convergence rebind/);
assert.match(a2a6BrowserAdapter, /entry_exact_case_rebind/);
assert.match(a2a6BrowserAdapter, /dataset\.ashPremiumReady === 'true'/);
assert.match(a2a6BrowserAdapter, /convergence\.begin\(\{ detail:\{ case_id:caseId, profile:'political_campaign' \} \}\)/);
assert.match(a2a6BrowserAdapter, /A15 A2-A6 exact-case convergence owner unavailable/);
assert.match(a2a6BrowserAdapter, /td613\.ash\.a15-empirical-profile-journeys\/v0\.1/);
const historicalA2A6Blob = crypto.createHash('sha1')
  .update(`blob ${Buffer.byteLength(historicalA2A6Browser)}\0${historicalA2A6Browser}`)
  .digest('hex');
assert.equal(historicalA2A6Blob, '7b7fa74c20b7db26c86598c7ed3284715942b937', 'Historical A13 A2-A6 browser observer changed bytes');
assert.doesNotMatch(historicalA2A6Browser, /entry_exact_case_rebind|A14 A2-A6 exact-case|A15 A2-A6 exact-case/);
assert.match(receipt, /new serverless function = false/);
assert.match(receipt, /active serverless functions = 11/);
assert.match(receipt, /reserved function capacity = 1/);
assert.doesNotMatch(moduleSource, /\/api\//);

assert.match(a6Source, /td613\.ash\.a6-affordance-drawer-repair\/v0\.1/);
assert.match(bridge, /ash-a6-affordance-drawer-repair\.js\?v=20260724-a12-release-v1/);
const wholeInstrumentA6Source = `${moduleSource}\n${a6Source}`;
for (const marker of ['Open Local Document','Open Draft Workspace','Previous Lesson','Next Lesson','𝄐 Rest','Cases & profiles','Open Workspace Setup','What changed—and what did not']) assert.match(wholeInstrumentA6Source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
for (const marker of ['ashA6LocalDocumentSurface','ashA6DraftSurface','ashA6ChooseLocalDocument','ashA6DraftBody','Structural Rest is active','current consequence remains inspectable','HELD_WITH_EXPLANATION','No additional state is available in this disclosure','No state delta has been observed yet','You changed how Ash explains this case','The underlying case state did not change','LEGEND_ONLY','human_closure_required:true']) assert.match(a6Source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(a6Source, /fileInput\.click\(\)/);
assert.match(a6Source, /td613\.ash\.affordance-contract\/v0\.1/);
assert.match(a6Source, /td613\.ash\.a6-world-answer\/v0\.1/);
assert.doesNotMatch(a6Source, /new MutationObserver|setInterval\(|navigator\.sendBeacon|\/api\//);
assert.doesNotMatch(a6Source, /ASH_AIA3_CACHE_EPOCH|ASH_AIA3_ASSET_EPOCH|cache-flush\/2026-07-24|20260724/);
for (const invariant of ['authority_changed:false','source_bytes_moved:false','custody_changed:false','release_posture_changed:false','closure_changed:false']) assert.match(a6Source, new RegExp(invariant));

console.log('Ash A2-A6 whole-instrument contracts: PASS under consolidated A15 validation');
