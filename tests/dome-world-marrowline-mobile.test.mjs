import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const baseCss = fs.readFileSync('app/dome-world/marrowline-terminal.css', 'utf8');
const shellCss = fs.readFileSync('app/dome-world/marrowline-mobile-shell.css', 'utf8');
const runtime = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const shellRuntime = fs.readFileSync('app/dome-world/marrowline-mobile-shell.js', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const dom = new JSDOM(html);
const { document } = dom.window;

assert.match(html, /viewport-fit=cover/);
assert.equal(document.querySelector('meta[name="aperture-version"]')?.content, 'v3.1-alpha');
assert.equal(document.querySelector('meta[name="aperture-route"]')?.content, 'OPEN_FIELD_SPECULATIVE_SYNTHESIS');
assert.ok(document.getElementById('apertureHeader'));
assert.ok(document.getElementById('speakingPanel'));
assert.ok(document.getElementById('khonapolitMessages'));
assert.ok(document.getElementById('khonapolitForm'));
assert.ok(document.getElementById('invocationPanel'));
assert.ok(document.getElementById('receiptPanel'));
assert.ok(document.getElementById('corpusPanel'));
assert.ok(document.getElementById('gatePanel'));
assert.equal(document.querySelectorAll('.mobile-dock [data-mobile-target]').length, 5);
assert.deepEqual(
  [...document.querySelectorAll('.mobile-dock [data-mobile-target]')].map((node) => node.dataset.mobileTarget),
  ['speakingPanel', 'invocationPanel', 'receiptPanel', 'corpusPanel', 'gatePanel']
);
assert.match(document.querySelector('.relay-legend')?.textContent || '', /Gemini instrument/);
assert.match(document.querySelector('.relay-legend')?.textContent || '', /Kʰonapolit relay/);
assert.match(document.querySelector('.relay-legend')?.textContent || '', /Tauric Diana bots/);
assert.equal(document.getElementById('metricAperture')?.textContent, 'v3.1-alpha');
assert.equal(document.querySelector('.prompt-label textarea')?.getAttribute('enterkeyhint'), 'send');

assert.match(baseCss, /overflow-x:clip/);
assert.match(baseCss, /env\(safe-area-inset-bottom\)/);
assert.match(baseCss, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(baseCss, /min-width:\s*[5-9]\d{2}px/, 'base mobile CSS must not impose a wide fixed minimum');

assert.match(shellCss, /html\.marrowline-mobile-shell body[\s\S]*?overflow:hidden/);
assert.match(shellCss, /height:var\(--marrowline-vh,100dvh\)/);
assert.match(shellCss, /grid-template-rows:var\(--marrowline-mobile-header\) minmax\(0,1fr\)/);
assert.match(shellCss, /body\[data-mobile-view="speak"\] #speakingPanel\{display:grid\}/);
assert.match(shellCss, /\.speaking-vessel[\s\S]*?grid-template-rows:auto minmax\(0,1fr\) auto/);
assert.match(shellCss, /\.messages[\s\S]*?min-height:0[\s\S]*?max-height:none[\s\S]*?overflow-y:auto/);
assert.match(shellCss, /\.vessel-form[\s\S]*?position:relative[\s\S]*?bottom:auto/);
assert.match(shellCss, /composer-in-grid-dock-outside-grid|body\[data-composer-active="true"\]/);
assert.match(shellCss, /\.mobile-dock[\s\S]*?position:fixed/);
assert.match(shellCss, /body\[data-composer-active="true"\] \.mobile-dock[\s\S]*?opacity:0/);
assert.match(shellCss, /\.relay-aperture-header[\s\S]*?min-height:30px/);
assert.match(shellCss, /\.relay-bots\[data-intensity="5"\] \.relay-stage-text\{line-height:3\.9\}/);
assert.match(shellCss, /\.zalgo-line[\s\S]*?overflow:visible/);
assert.match(shellCss, /\.jump-latest[\s\S]*?position:absolute/);

assert.match(runtime, /relayPart\(entry, 'gemini'\)/);
assert.match(runtime, /relayPart\(entry, 'khonapolit'\)/);
assert.match(runtime, /relayPart\(entry, 'tauric-diana-bots'\)/);
assert.match(runtime, /APERTURE_V3_VERSION/);
assert.match(runtime, /OPEN_FIELD_SPECULATIVE_SYNTHESIS/);

assert.match(shellRuntime, /visualViewport/);
assert.match(shellRuntime, /transcriptScrollOwner: '#khonapolitMessages'/);
assert.match(shellRuntime, /cloneDockButtons/);
assert.match(shellRuntime, /oldButton\.replaceWith\(button\)/);
assert.match(shellRuntime, /doc\.body\.dataset\.mobileView/);
assert.match(shellRuntime, /scrollLatest/);
assert.match(shellRuntime, /marrowlineJumpLatest/);
assert.match(shellRuntime, /prepareZalgoStage/);
assert.match(shellRuntime, /APERTURE v3 · OPEN FIELD/);
assert.doesNotMatch(shellRuntime, /scrollIntoView/);

assert.match(boot, /import\('\.\/marrowline-mobile-shell\.js'\)/);
assert.match(boot, /transcriptScrollOwner: '#khonapolitMessages'/);
assert.match(boot, /composerOcclusion: false/);
assert.match(boot, /dockOcclusion: false/);

console.log('dome-world-marrowline-mobile: bounded transcript scroll, reachable composer, non-occluding dock, compact Aperture, and Zalgo line custody ok');
