import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge=fs.readFileSync('app/dome-world/ash-workspace-bridge.js','utf8');
const wrapper=fs.readFileSync('app/dome-world/ash-investigation-demo-hydration.js','utf8');
const runtime=fs.readFileSync('app/dome-world/ash-apeq-paia-profile-demos.js','utf8');
const kernel=fs.readFileSync('app/dome-world/ash-apeq-paia-method-kernel.js','utf8');
const guidance=fs.readFileSync('app/dome-world/ash-guided-operator-ui.js','utf8');
const css=fs.readFileSync('app/dome-world/ash-guided-operator-ui.css','utf8');

assert.match(bridge,/ash-investigation-demo-hydration\.js/);
assert.match(bridge,/ash-guided-operator-ui\.js/);
assert.match(wrapper,/ash-apeq-paia-profile-demos\.js/);
assert.match(runtime,/compileCaseMap/);
assert.match(runtime,/compileRoomRules/);
assert.match(runtime,/compileRouteMemory/);
assert.match(runtime,/ASH_INVESTIGATION_APEQ_PAIA_VERSION/);
assert.match(kernel,/PA2_LOCALLY_EXECUTED/);
assert.match(kernel,/joining_keys/);
assert.doesNotMatch(wrapper,/fetch\(|fixtures\/ash-investigation/);
assert.match(guidance,/Protect → Map → Test → Share → Seal/);
assert.match(guidance,/compressReceipts/);
assert.match(guidance,/compressCrossingTimeline/);
assert.match(css,/guided-map-focus/);
assert.match(css,/prefers-reduced-motion:reduce/);

console.log('ash-keep-investigation-guidance-closure.test.mjs passed');
