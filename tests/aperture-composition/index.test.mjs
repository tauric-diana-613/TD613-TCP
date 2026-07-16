import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../../app/aperture/index.html', import.meta.url), 'utf8');
const bootstrap = fs.readFileSync(new URL('../../app/aperture/bootstrap.js', import.meta.url), 'utf8');
const tool = fs.readFileSync(new URL('../../app/aperture/tool.html', import.meta.url), 'utf8');

assert.match(index, /name="aperture-composition" content="td613\.aperture\.composition-manifest\/v0\.1"/);
assert.match(index, /<iframe id="td613ApertureTool" src="\.\/tool\.html\?v=[^"]+"/);
assert.match(index, /<script type="module" src="\.\/bootstrap\.js\?v=[^"]+"><\/script>/);
assert.doesNotMatch(index, /aperture-v3-reciprocal-bridge\.js/);
assert.doesNotMatch(index, /frame\.contentWindow\.TD613_PHASE4_RECIPROCAL_BRIDGE/);
assert.doesNotMatch(index, /td613:phase4-reciprocal-bridge-ready/);
assert.equal((index.match(/<script type="module"/g) || []).length, 1);

assert.match(bootstrap, /installApertureComposition/);
assert.match(bootstrap, /TD613_APERTURE_TASK_INTENT/);
assert.match(bootstrap, /TD613_APERTURE_V31_COMPATIBILITY/);
assert.match(bootstrap, /TD613_PHASE4_RECIPROCAL_BRIDGE/);
assert.match(bootstrap, /td613:aperture-composition-held/);
assert.doesNotMatch(bootstrap, /fetch\s*\(/);
assert.doesNotMatch(bootstrap, /localStorage|sessionStorage/);
assert.doesNotMatch(bootstrap, /ASH_RELEASE|Cinder|recipientTransport/);

assert.match(tool, /TD613 APERTURE v3\.1-alpha SOURCE DECLARATION/);
assert.match(tool, /name="aperture-version" content="v3\.1-alpha"|content="v3\.1-alpha" name="aperture-version"/);
assert.doesNotMatch(index, /srcdoc=/);

console.log('aperture-composition/index.test.mjs passed');
