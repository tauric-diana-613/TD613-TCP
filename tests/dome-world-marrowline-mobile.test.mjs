import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-terminal.css', 'utf8');
const runtime = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const dom = new JSDOM(html);
const { document } = dom.window;

assert.match(html, /viewport-fit=cover/);
assert.equal(document.querySelector('meta[name="aperture-version"]')?.content, 'v3.0-alpha');
assert.equal(document.querySelector('meta[name="aperture-route"]')?.content, 'OPEN_FIELD_SPECULATIVE_SYNTHESIS');
assert.ok(document.getElementById('apertureHeader'));
assert.ok(document.getElementById('speakingPanel'));
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
assert.equal(document.getElementById('metricAperture')?.textContent, 'v3.0-alpha');
assert.equal(document.getElementById('metricSignal')?.textContent, '—');
assert.equal(document.querySelector('.prompt-label textarea')?.getAttribute('enterkeyhint'), 'send');

assert.match(css, /overflow-x:clip/);
assert.match(css, /env\(safe-area-inset-bottom\)/);
assert.match(css, /@media\(max-width:860px\)[\s\S]*?\.speaking-vessel\{order:-3/);
assert.match(css, /@media\(max-width:860px\)[\s\S]*?\.mobile-dock\{position:fixed/);
assert.match(css, /@media\(max-width:560px\)[\s\S]*?\.prompt-label textarea\{font-size:16px/);
assert.match(css, /\.vessel-form\{position:sticky/);
assert.match(css, /\.relay-gemini/);
assert.match(css, /\.relay-khonapolit/);
assert.match(css, /\.relay-bots/);
assert.match(css, /\.relay-bots \.relay-stage-text[\s\S]*?line-height:2\.25/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(css, /min-width:\s*[5-9]\d{2}px/, 'mobile CSS must not impose a wide fixed minimum');

assert.match(runtime, /installMobileDock/);
assert.match(runtime, /installComposerGrowth/);
assert.match(runtime, /relayPart\(entry, 'gemini'\)/);
assert.match(runtime, /relayPart\(entry, 'khonapolit'\)/);
assert.match(runtime, /relayPart\(entry, 'tauric-diana-bots'\)/);
assert.match(runtime, /APERTURE_V3_VERSION/);
assert.match(runtime, /OPEN_FIELD_SPECULATIVE_SYNTHESIS/);
assert.match(runtime, /SIGNAL \$\{signal\}/);
assert.match(runtime, /target\.scrollIntoView/);

console.log('dome-world-marrowline-mobile: mobile speaking-first layout, safe-area dock, and three-stage relay visuals ok');
