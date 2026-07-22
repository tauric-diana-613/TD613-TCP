import assert from 'node:assert/strict';
import fs from 'node:fs';

const repair = fs.readFileSync('app/dome-world/ash-reviewability-repair.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');

assert.match(repair, /td613\.ash\.reviewability\/v0\.1-native-scroll-live-setup-descenders/);

// Entrant-owned scroll must hold against background home/lifecycle resets.
assert.match(repair, /const guardedScrollTo = \(\.\.\.args\) =>/);
assert.match(repair, /BACKGROUND_SCROLL_HELD/);
assert.match(repair, /viewportOwnedByUser && now\(\) > gestureDeadline/);
assert.match(repair, /addEventListener\('wheel',[\s\S]*?USER_/);
assert.match(repair, /addEventListener\('touchmove'/);
assert.match(repair, /DELIBERATE_GESTURE/);
assert.match(repair, /claimViewport:/);

// The AIA side card must be compact and actionable before and after case entry.
assert.match(repair, /align-items:start!important/);
assert.match(repair, /align-self:start!important/);
assert.match(repair, /SETUP_READY/);
assert.match(repair, /CASE_ACTIVE/);
assert.match(repair, /Open workspace setup/);
assert.match(repair, /Open a local document/);
assert.match(repair, /data-ash-reviewability-fallback/);
assert.match(repair, /panel_button_actionable/);
assert.match(repair, /panel_unused_space/);

// Georgia/serif descenders and the motion rail receive explicit clearance.
assert.match(repair, /#ashAiaTitle,[\s\S]*?line-height:1\.18!important/);
assert.match(repair, /padding-bottom:\.16em!important/);
assert.match(repair, /ash-flowcore-mounted>\.ash-ux-motion-track[\s\S]*?min-height:60px!important/);
assert.match(repair, /clipped:node\.scrollHeight > node\.clientHeight \+ 1/);

// This remains event-bound rather than an ambient correction loop.
assert.doesNotMatch(repair, /setInterval\s*\(/);
assert.doesNotMatch(repair, /new\s+(?:host\.)?MutationObserver/);
assert.match(bridge, /ash-reviewability-repair\.js\?v=20260722-reviewability-v1/);
assert.ok(bridge.lastIndexOf('ash-reviewability-repair.js') > bridge.lastIndexOf('ash-emergency-stability-contract.js'), 'Reviewability repair must load after earlier presentation authorities.');

console.log('ash-reviewability.test.mjs passed');
