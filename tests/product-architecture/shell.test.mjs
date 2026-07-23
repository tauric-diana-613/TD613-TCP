import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_KEEP_JS_SHELL_VERSION,
  ASH_KEEP_SHELL_VERSION,
  ASH_LIFECYCLE_ASSET_EPOCH,
  ASH_LIFECYCLE_MODULE,
  ASH_LIFECYCLE_SHELL_CONTRACT,
  ASH_MASS_EVICTION_EPOCH,
  ASH_THRESHOLD_ROUTE,
  injectAshKeepLifecycle,
  injectAshLifecycleEntry,
  stabilizeAshKeepSourceShell,
  stabilizeDomeWorldSource
} from '../../api/dome-world-shell.js';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const domeSource = read('app/dome-world/index.html');
const renderedDome = stabilizeDomeWorldSource(domeSource);
const threshold = read('app/dome-world/ash-threshold.html');
const thresholdMembrane = read('app/dome-world/ash-threshold-membrane.js');
const thresholdMembraneCss = read('app/dome-world/ash-threshold-membrane.css');
const keepEntry = read('app/dome-world/ash-keep-entry.js');
const keepSource = read('app/dome-world/ash-keep.html');
const renderedKeep = stabilizeAshKeepSourceShell(keepSource);
const keepJsSource = read('app/dome-world/ash-keep.js');
const renderedKeepJs = keepJsSource;
const draftEngine = read('app/engine/ash-keep-drafts.js');
const recovery = read('app/safe-harbor/ash-keep-recovery.html');
const vercel = JSON.parse(read('vercel.json'));

assert.equal(ASH_THRESHOLD_ROUTE, '/dome-world/ash-threshold.html');
assert.equal(ASH_LIFECYCLE_SHELL_CONTRACT, 'td613.ash.lifecycle-shell/v0.1');
assert.match(renderedDome, /<button class="tab" data-view="ash"[^>]*><small>04<\/small><span>Ash<\/span><\/button>/);
assert.doesNotMatch(renderedDome, /class="tab"[^>]+href="\/dome-world\/ash-threshold\.html"[^>]*data-view="ash"/);
assert.match(renderedDome, /data-ash-threshold-membrane/);
assert.match(renderedDome, /data-ash-threshold-enter href="\/dome-world\/ash-threshold\.html"/);
assert.match(renderedDome, /id="ashThresholdTitle">A<em>s<\/em>h<\/h1>/);
assert.match(renderedDome, /data-open-route="\/dome-world\/marrowline\.html"/);
assert.match(renderedDome, /<span><b>11<\/b>stations<\/span>/);
assert.equal(injectAshLifecycleEntry(renderedDome), renderedDome);
assert.equal(stabilizeDomeWorldSource(renderedDome), renderedDome);

for (const law of ['Arrival', 'Boundary', 'Custody']) assert.match(renderedDome, new RegExp(law));
assert.match(thresholdMembrane, /compileReadinessReceipt/);
assert.match(thresholdMembrane, /sessionStorage\.setItem\(READINESS_KEY/);
assert.match(thresholdMembrane, /location\.assign\(enter\.href \|\| KEEP_ROUTE\)/);
assert.doesNotMatch(thresholdMembrane, /location\.replace|setTimeout\(\(\) => location/);
assert.doesNotMatch(thresholdMembrane, /localStorage\.setItem|type="file"/);
assert.match(thresholdMembraneCss, /prefers-reduced-motion/);
assert.match(thresholdMembraneCss, /height:\s*clamp\(520px,\s*68svh,\s*720px\)/);
assert.match(thresholdMembraneCss, /overflow-x:\s*hidden/);
assert.match(thresholdMembraneCss, /overflow-y:\s*auto/);
assert.match(thresholdMembraneCss, /scrollbar-gutter:\s*stable both-edges/);
assert.match(thresholdMembraneCss, /\.ash-threshold-rite[\s\S]*min-height:\s*100%/);
assert.match(thresholdMembraneCss, /clamp\(3\.6rem,\s*min\(14cqi,\s*13svh\),\s*8rem\)/);
assert.match(thresholdMembraneCss, /@media \(min-width:\s*681px\) and \(max-height:\s*820px\)/);
assert.match(thresholdMembraneCss, /@media \(max-width:\s*680px\)[\s\S]*height:\s*auto[\s\S]*overflow:\s*visible/);
const membraneBlock = thresholdMembraneCss.match(/\.ash-threshold-membrane\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.doesNotMatch(membraneBlock, /overflow:\s*hidden/);

assert.match(threshold, /data-ash-public-route="\/dome-world\/ash-threshold\.html"/);
assert.match(threshold, /src="\/dome-world\/ash-keep-entry\.js"/);
assert.doesNotMatch(threshold, /data-ash-law-step|compileReadinessReceipt|location\.replace|http-equiv="refresh"/);
assert.match(keepEntry, /window\.location\.replace\(canonicalKeepRoute\(\)\)/);

const versionedModules = [
  `/dome-world/ash-keep.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`,
  `/dome-world/ash-convergence.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`,
  ASH_LIFECYCLE_MODULE,
  `/dome-world/ash-workspace-bridge.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`,
  `/dome-world/ash-case-controls.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}`
];
assert.equal(ASH_KEEP_SHELL_VERSION, 'td613.ash-keep.shell/v0.6-first-paint');
assert.equal(ASH_LIFECYCLE_ASSET_EPOCH, '20260723-a2-a5-release-v1');
assert.equal(ASH_LIFECYCLE_MODULE, '/dome-world/ash-lifecycle.js?v=20260723-a2-a5-release-v1');
assert.equal(ASH_MASS_EVICTION_EPOCH, 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1');
assert.match(renderedKeep, /<title>TD613 Ash<\/title>/);
assert.match(renderedKeep, /rel="canonical" href="\/dome-world\/ash-threshold\.html"/);
assert.match(renderedKeep, /id="td613-ash-preparing-shell"/);
assert.match(renderedKeep, /id="td613-ash-canonical-module-bootstrap"/);
assert.match(renderedKeep, /await globalThis\.__td613AshAia3Preflight/);
let cursor = -1;
for (const module of versionedModules) {
  const index = renderedKeep.indexOf(module);
  assert.ok(index > cursor, `${module} must follow the preceding governed surface.`);
  cursor = index;
}
for (const source of ['/dome-world/ash-keep.js', '/dome-world/ash-convergence.js', '/dome-world/ash-lifecycle.js', '/dome-world/ash-workspace-bridge.js', '/dome-world/ash-case-controls.js']) {
  assert.doesNotMatch(renderedKeep, new RegExp(`src="${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
}
assert.match(renderedKeep, /name="ash-cache-preflight" content="a2-a5-release-v1"/);
assert.match(renderedKeep, /Preparing Ash/);
assert.match(renderedKeep, /session_epoch_preserved_or_migrated/);
assert.match(renderedKeep, /name="ash-lifecycle" content="v0\.1"/);
assert.match(renderedKeep, /name="ash-constitutional-composition" content="v0\.1"/);
assert.doesNotMatch(renderedKeep, /window\.stop\(\)/);
assert.doesNotMatch(renderedKeep, /searchParams\.set\('ash_epoch'/);
assert.doesNotMatch(renderedKeep, /searchParams\.set\('ash_recovered'/);
assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep);
assert.equal(stabilizeAshKeepSourceShell(renderedKeep), renderedKeep);

assert.match(recovery, /history\.replaceState\(null,'',canonical\)/);
assert.match(recovery, /document\.write\(shell\)/);
assert.doesNotMatch(recovery, /ash_epoch|ash_recovered/);

assert.equal(ASH_KEEP_JS_SHELL_VERSION, 'td613.ash-keep.js-shell/v0.5-event-driven-map');
assert.match(renderedKeepJs, /caseMapDigest: state\.caseMap\.case_map_digest/);
assert.match(renderedKeepJs, /releaseReceiptReference: state\.latestRelease\?\.receipt_id \|\| null/);
assert.match(renderedKeepJs, /releaseReceiptDigest: state\.latestRelease\?\.receipt_digest \|\| null/);
assert.match(renderedKeepJs, /latestSavePoint\.release_receipt_reference !== currentRelease\.receipt_id/);
assert.match(renderedKeepJs, /EVENT_DRIVEN_COALESCED/);
assert.match(renderedKeepJs, /function requestMapDraw\(\)/);
assert.doesNotMatch(renderedKeepJs, /state\.frame = scheduleFrame\(frame\)/);
assert.doesNotMatch(renderedKeepJs, /location\.reload\(\)/);
assert.match(draftEngine, /Review is bound to a different Case Map/);

assert.deepEqual(vercel.functions['api/dome-world-shell.js'], { maxDuration: 10, includeFiles: 'app/dome-world/{index.html,ash-keep.html,ash-keep.js}' });
assert.equal(vercel.functions['api/ash-keep-shell.js'], undefined);
assert.equal(vercel.functions['api/ash-keep-js-shell.js'], undefined);
assert.equal(vercel.git?.deploymentEnabled, false, 'Git-triggered Vercel deployments require an explicit operator release gesture');
const rewrites = vercel.rewrites;
const genericIndex = rewrites.findIndex(rule => rule.source === '/dome-world/(.*)');
for (const [source, destination] of [
  ['/dome-world/ash-threshold.html', '/api/dome-world-shell?surface=ash-keep-html'],
  ['/dome-world/ash-keep.html', '/api/dome-world-shell?surface=ash-keep-html'],
  ['/dome-world/ash-keep.js', '/api/dome-world-shell?surface=ash-keep-js']
]) {
  const index = rewrites.findIndex(rule => rule.source === source && rule.destination === destination);
  assert.ok(index >= 0 && index < genericIndex, `${source} must precede the generic Dome route`);
}
