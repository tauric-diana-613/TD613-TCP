import assert from 'node:assert/strict';
import fs from 'fs';

const html = fs.readFileSync('app/hush-packet-dashboard.html', 'utf8');
const script = fs.readFileSync('app/hush-packet-dashboard.js', 'utf8');

assert.match(html, /data-drawer-mode="fixture-preview"/);
assert.match(html, /Fixture preview loaded/);
assert.match(html, /No live packet, provider return, public export, or seal action is being claimed/);

assert.equal(script.includes('.innerHTML'), false, 'Hush packet drawer must not render packet-derived values through innerHTML');
assert.equal(script.includes('insertAdjacentHTML'), false, 'Hush packet drawer must not render packet-derived values through insertAdjacentHTML');
assert.match(script, /textContent/);
assert.match(script, /fixture preview \/ no live packet loaded/);
assert.match(script, /no clipboard or public export action is performed here/);

console.log('hush-phase11-drawer-dom-safety: ok');
