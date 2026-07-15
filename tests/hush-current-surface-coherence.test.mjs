import assert from 'node:assert/strict';
import fs from 'fs';

const hushHub = fs.readFileSync('app/hush.html', 'utf8');
const hushRuntime = fs.readFileSync('app/hush.js', 'utf8');
const vercel = fs.readFileSync('vercel.json', 'utf8');

assert.match(hushHub, /<title>TD613 Hush<\/title>/);
assert.match(hushHub, /<h1>Hush Console<\/h1>/);
assert.match(hushHub, /Open Current Hush Console/);
assert.match(hushHub, /href="\.\/adversarial-bench\.html"/);
assert.match(hushHub, /Open Packet Drawer/);
assert.match(hushHub, /href="\.\/hush-packet-dashboard\.html"/);
assert.match(hushHub, /title="Current Hush Console"/);
assert.equal(/legacy Hush chamber|Open legacy Hush chamber|Legacy Hush Chamber/i.test(hushHub), false);

assert.match(hushRuntime, /HUSH_SURFACE_MODE = 'current-hush-surface'/);
assert.match(hushRuntime, /Current Hush/);
assert.equal(/currentMode: 'phase-31-visual-system'|mode: 'phase-31-visual-system'/.test(hushRuntime), false);

assert.match(vercel, /"source": "\/hush\.html"/);
assert.match(vercel, /"source": "\/app\/hush\.html"/);
assert.match(vercel, /"source": "\/hush\.js"/);
assert.match(vercel, /"source": "\/app\/hush\.js"/);

console.log('hush-current-surface-coherence: ok');
