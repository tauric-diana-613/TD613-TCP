import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const hydration = fs.readFileSync('app/dome-world/ash-investigation-demo-hydration.js', 'utf8');
const guidance = fs.readFileSync('app/dome-world/ash-guided-operator-ui.js', 'utf8');
const css = fs.readFileSync('app/dome-world/ash-guided-operator-ui.css', 'utf8');

assert.match(bridge, /ash-investigation-demo-hydration\.js/);
assert.match(bridge, /ash-guided-operator-ui\.js/);
assert.match(hydration, /compileCaseMap/);
assert.match(hydration, /compileRoomRules/);
assert.match(hydration, /compileRouteMemory/);
assert.match(guidance, /Protect → Map → Test → Share → Seal/);
assert.match(guidance, /compressReceipts/);
assert.match(guidance, /compressCrossingTimeline/);
assert.match(css, /guided-map-focus/);
assert.match(css, /prefers-reduced-motion:reduce/);

console.log('ash-keep-investigation-guidance-closure.test.mjs passed');
