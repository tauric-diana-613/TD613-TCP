import assert from 'node:assert/strict';
import fs from 'node:fs';
import { injectAshKeepLifecycle } from '../api/dome-world-shell.js';

const restoration = fs.readFileSync('app/dome-world/ash-post-ingress-motion-restoration.js', 'utf8');
const profilePrompt = fs.readFileSync('app/dome-world/ash-profile-prompt-canonical.js', 'utf8');
const threshold = fs.readFileSync('app/dome-world/ash-threshold.html', 'utf8');
const keep = fs.readFileSync('app/dome-world/ash-keep.html', 'utf8');
const shell = fs.readFileSync('api/dome-world-shell.js', 'utf8');
const recovery = fs.readFileSync('app/safe-harbor/ash-keep-recovery.html', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const rendered = injectAshKeepLifecycle(keep);

assert.match(restoration, /v0\.3-canonical-field-ingress-polish/);
assert.match(restoration, />\.ash-flowcore-field:not\(\.ash-flowcore-field--proxy\)/);
assert.match(restoration, />\.ash-flowcore-field--proxy\{[\s\S]*?display:none!important/);
assert.match(restoration, /function quarantineProxies/);
assert.match(restoration, /visible_proxy_count/);
assert.match(restoration, /caption_overlaps_svg/);
assert.match(restoration, /data-flowcore-host="ingress"[\s\S]*?ash-flowcore-field__caption/);
assert.match(restoration, /position:relative!important/);
assert.doesNotMatch(restoration, /setInterval\s*\(/);
assert.doesNotMatch(restoration, /new MutationObserver/);

assert.match(profilePrompt, /td613\.ash\.profile-prompt-canonical\/v0\.3-remount-stable-explicit-choice/);
assert.match(profilePrompt, /let explicitChoice = ''/);
assert.match(profilePrompt, /function captureExplicitChoice\(event\)/);
assert.match(profilePrompt, /doc\.addEventListener\('input', captureExplicitChoice, true\)/);
assert.match(profilePrompt, /doc\.addEventListener\('change', captureExplicitChoice, true\)/);
assert.match(profilePrompt, /ashCanonicalProfileChoiceBoundary/);
assert.match(profilePrompt, /prompt\.textContent = 'Select a Profile\.\.\.'/);
assert.match(profilePrompt, /if \(select\.value\) explicitChoice = select\.value/);
assert.match(profilePrompt, /start\.disabled = !select\.value/);
assert.match(profilePrompt, /applyCanonicalProfilePrompt\(\{ resetSelection:true \}\)/);
assert.match(profilePrompt, /for \(const type of \['aia-ready','aia3-ready','composition-stable'\]\)/);
assert.match(profilePrompt, /td613:ash:case-closed/);
assert.doesNotMatch(profilePrompt, /setInterval\s*\(|new MutationObserver/);

assert.match(threshold, /rel="canonical" href="\/dome-world\/ash-threshold\.html"/);
assert.match(rendered, /<title>TD613 Ash<\/title>/);
assert.match(rendered, /rel="canonical" href="\/dome-world\/ash-threshold\.html"/);
assert.match(rendered, /id="td613-ash-preparing-shell"/);
assert.match(rendered, /id="td613-ash-canonical-module-bootstrap"/);
assert.match(rendered, /__td613AshFirstPaintWitness/);
assert.match(rendered, /history\.replaceState\(null,'',canonicalPath\+location\.hash\)/);
assert.match(rendered, /await globalThis\.__td613AshAia3Preflight/);
assert.doesNotMatch(rendered, /searchParams\.set\('ash_epoch'/);
assert.doesNotMatch(rendered, /searchParams\.set\('ash_recovered'/);
assert.doesNotMatch(rendered, /window\.stop\(\)/);
assert.doesNotMatch(rendered, /location\.reload\(\)/);
assert.equal(injectAshKeepLifecycle(rendered), rendered);

assert.match(recovery, /<title>TD613 Ash<\/title>/);
assert.match(recovery, /history\.replaceState\(null,'',canonical\)/);
assert.match(recovery, /fetch\('\/api\/dome-world-shell\?surface=ash-keep-html'/);
assert.match(recovery, /document\.write\(shell\)/);
assert.doesNotMatch(recovery, /searchParams\.set\('ash_epoch'/);
assert.doesNotMatch(recovery, /searchParams\.set\('ash_recovered'/);

assert.match(shell, /visible_url:canonicalPath/);
assert.match(shell, /cross_scope_recovery_required:controllerPresent/);
assert.match(bridge, /ash-post-ingress-motion-restoration\.js\?v=20260722-canonical-field-ingress-polish-v3/);
assert.match(bridge, /ash-profile-prompt-canonical\.js\?v=20260722-profile-prompt-v1/);

console.log('ash-ingress-polish.test.mjs passed');
