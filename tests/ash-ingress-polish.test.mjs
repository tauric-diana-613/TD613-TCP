import assert from 'node:assert/strict';
import fs from 'node:fs';

const restoration = fs.readFileSync('app/dome-world/ash-post-ingress-motion-restoration.js', 'utf8');
const threshold = fs.readFileSync('app/dome-world/ash-threshold.html', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');

assert.match(restoration, /v0\.3-canonical-field-ingress-polish/);
assert.match(restoration, />\.ash-flowcore-field:not\(\.ash-flowcore-field--proxy\)/);
assert.match(restoration, />\.ash-flowcore-field--proxy\{[\s\S]*?display:none!important/);
assert.match(restoration, /function quarantineProxies/);
assert.match(restoration, /visible_proxy_count/);
assert.match(restoration, /caption_overlaps_svg/);
assert.match(restoration, /data-flowcore-host="ingress"[\s\S]*?ash-flowcore-field__caption/);
assert.match(restoration, /position:relative!important/);
assert.match(restoration, /Select a Profile\.\.\./);
assert.match(restoration, /start\.disabled = !select\.value/);
assert.match(restoration, /for \(const key of \['ash_epoch', 'ash_recovered'\]\)/);
assert.doesNotMatch(restoration, /setInterval\s*\(/);
assert.doesNotMatch(restoration, /new MutationObserver/);

assert.match(threshold, /rel="canonical" href="\/dome-world\/ash-threshold\.html"/);
for (const key of ['ash_epoch','ash_recovered','asset_epoch','cache_nonce']) assert.ok(threshold.includes(`'${key}'`), `threshold cleanup omitted ${key}`);
assert.match(threshold, /history\.replaceState\(null,'',url\.pathname\+url\.search\+url\.hash\)/);
assert.match(bridge, /ash-post-ingress-motion-restoration\.js\?v=20260722-canonical-field-ingress-polish-v3/);

console.log('ash-ingress-polish.test.mjs passed');
