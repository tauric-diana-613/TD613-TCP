import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_KEEP_JS_SHELL_VERSION,
  ASH_KEEP_SHELL_VERSION,
  ASH_LIFECYCLE_ASSET_EPOCH,
  ASH_LIFECYCLE_MODULE,
  ASH_LIFECYCLE_SHELL_CONTRACT,
  ASH_THRESHOLD_ROUTE,
  bindAshDraftsToCaseMap,
  injectAshKeepLifecycle,
  injectAshLifecycleEntry,
  renderDomeWorldShell
} from '../../api/dome-world-shell.js';

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const domeSource = read('app/dome-world/index.html');
const renderedDome = renderDomeWorldShell(domeSource);
const threshold = read('app/dome-world/ash-threshold.html');
const thresholdMembrane = read('app/dome-world/ash-threshold-membrane.js');
const thresholdMembraneCss = read('app/dome-world/ash-threshold-membrane.css');
const keepEntry = read('app/dome-world/ash-keep-entry.js');
const keepSource = read('app/dome-world/ash-keep.html');
const renderedKeep = injectAshKeepLifecycle(keepSource);
const keepJsSource = read('app/dome-world/ash-keep.js');
const renderedKeepJs = bindAshDraftsToCaseMap(keepJsSource);
const draftEngine = read('app/engine/ash-keep-drafts.js');
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
assert.match(thresholdMembraneCss, /@media \(min-width:\s*681px\) and \(max-height:\s*820px\)[\s\S]*height:\s*clamp\(480px,\s*66svh,\s*570px\)/);
assert.match(thresholdMembraneCss, /@media \(min-width:\s*681px\) and \(max-height:\s*820px\)[\s\S]*min-height:\s*104px/);
assert.match(thresholdMembraneCss, /@media \(max-width:\s*680px\)[\s\S]*height:\s*auto[\s\S]*overflow:\s*visible/);
const membraneBlock = thresholdMembraneCss.match(/\.ash-threshold-membrane\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.doesNotMatch(membraneBlock, /overflow:\s*hidden/);

assert.match(threshold, /data-ash-public-route="\/dome-world\/ash-threshold\.html"/);
assert.match(threshold, /src="\/dome-world\/ash-keep-entry\.js"/);
assert.doesNotMatch(threshold, /data-ash-law-step|compileReadinessReceipt|location\.replace|http-equiv="refresh"/);
assert.match(keepEntry, /window\.location\.replace\(canonicalKeepRoute\(\)\)/);

const preflightIndex = renderedKeep.indexOf('id="td613-ash-cache-preflight-script"');
const historyIndex = renderedKeep.indexOf("sessionStorage.getItem('td613:ash-threshold:readiness:v0.1')");
const coreIndex = renderedKeep.indexOf('/dome-world/ash-keep.js?v=20260720-aia3-mass-eviction-v2');
const convergenceIndex = renderedKeep.indexOf('/dome-world/ash-convergence.js?v=20260720-aia3-mass-eviction-v2');
const lifecycleIndex = renderedKeep.indexOf(ASH_LIFECYCLE_MODULE);
assert.ok(preflightIndex >= 0 && historyIndex > preflightIndex && coreIndex > historyIndex && convergenceIndex > coreIndex && lifecycleIndex > convergenceIndex);
assert.equal(ASH_KEEP_SHELL_VERSION, 'td613.ash-keep.shell/v0.4-aia3-mass-eviction');
assert.equal(ASH_LIFECYCLE_ASSET_EPOCH, '20260720-aia3-mass-eviction-v2');
assert.equal(ASH_LIFECYCLE_MODULE, '/dome-world/ash-lifecycle.js?v=20260720-aia3-mass-eviction-v2');
for (const module of ['ash-keep.js', 'ash-convergence.js', 'ash-lifecycle.js', 'ash-workspace-bridge.js', 'ash-case-controls.js']) {
  assert.match(renderedKeep, new RegExp(`src="\\/dome-world\\/${module.replace('.', '\\.') }\\?v=20260720-aia3-mass-eviction-v2"`));
  assert.doesNotMatch(renderedKeep, new RegExp(`src="\\/dome-world\\/${module.replace('.', '\\.')}"`));
}
assert.match(renderedKeep, /name="ash-lifecycle" content="v0\.1"/);
assert.match(renderedKeep, /name="ash-constitutional-composition" content="v0\.1"/);
assert.match(renderedKeep, /Updating Ash Keep · preserving local cases/);
assert.match(renderedKeep, /indexeddb_preserved:true/);
assert.match(renderedKeep, /local_case_pointer_preserved/);
assert.equal(injectAshKeepLifecycle(renderedKeep), renderedKeep);

assert.equal(ASH_KEEP_JS_SHELL_VERSION, 'td613.ash-keep.js-shell/v0.5-event-driven-map');
assert.match(renderedKeepJs, /caseMapDigest: state\.caseMap\.case_map_digest/);
assert.match(renderedKeepJs, /releaseReceiptReference: state\.latestRelease\?\.receipt_id \|\| null/);
assert.match(renderedKeepJs, /releaseReceiptDigest: state\.latestRelease\?\.receipt_digest \|\| null/);
assert.match(renderedKeepJs, /latestSavePoint\.release_receipt_reference !== currentRelease\.receipt_id/);
assert.match(renderedKeepJs, /EVENT_DRIVEN_COALESCED/);
assert.match(renderedKeepJs, /function requestMapDraw\(\)/);
assert.doesNotMatch(renderedKeepJs, /state\.frame = scheduleFrame\(frame\)/);
assert.doesNotMatch(renderedKeepJs, /location\.reload\(\)/);
assert.equal(bindAshDraftsToCaseMap(renderedKeepJs), renderedKeepJs);
assert.match(draftEngine, /Review is bound to a different Case Map/);

assert.deepEqual(vercel.functions['api/dome-world-shell.js'], { maxDuration: 10, includeFiles: 'app/dome-world/{index.html,ash-keep.html,ash-keep.js}' });
assert.equal(vercel.functions['api/ash-keep-shell.js'], undefined);
assert.equal(vercel.functions['api/ash-keep-js-shell.js'], undefined);
assert.equal(vercel.git?.deploymentEnabled, false, 'Git-triggered Vercel deployments require an explicit operator release gesture');
for (const source of ['/dome-world/ash-(.*)', '/app/dome-world/ash-(.*)']) {
  const header = vercel.headers.find(entry => entry.source === source);
  assert(header, `${source} no-store boundary missing`);
  assert.match(header.headers?.find(item => item.key === 'Cache-Control')?.value || '', /no-store/);
}
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

console.log('product-architecture/shell.test.mjs passed');
