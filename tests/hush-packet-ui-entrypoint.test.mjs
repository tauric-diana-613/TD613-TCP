import assert from 'node:assert/strict';
import fs from 'fs';

const appHtml = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const hushHubHtml = fs.readFileSync('app/hush.html', 'utf8');
const drawerHtml = fs.readFileSync('app/hush-packet-dashboard.html', 'utf8');
const drawerCss = fs.readFileSync('app/hush-packet-dashboard.css', 'utf8');
const drawerJs = fs.readFileSync('app/hush-packet-dashboard.js', 'utf8');
const dashboardState = fs.readFileSync('app/engine/hush-phase11-dashboard-state.js', 'utf8');

assert.match(appHtml, /id="packetDrawerLink"/);
assert.match(appHtml, /href="\.\/hush-packet-dashboard\.html"/);
assert.match(appHtml, />Packets \/\/ drawer<\/a>/);
assert.match(appHtml, /aria-label="Open Hush packet drawer"/);
assert.match(appHtml, /class="statepill active hush-packet-drawer-link"/);
assert.match(appHtml, /id="packetDrawerDock"/);
assert.match(appHtml, /id="packetDrawerPanelLink"/);
assert.equal(/packetDrawerFloatingLink/.test(appHtml), false);

assert.match(drawerHtml, /<title>Hush Packet Drawer<\/title>/);
assert.match(drawerHtml, /hush-visual-system\.css/);
assert.match(drawerHtml, /hush-compact\.css/);
assert.match(drawerHtml, /hush-field-instrument\.css/);
assert.match(drawerHtml, /id="copyPacketDrawerBtn"/);
assert.match(drawerHtml, /id="exportPacketDrawerBtn"/);
assert.match(drawerHtml, /<h1 id="drawerTitle">Packet Drawer<\/h1>/);
assert.match(drawerHtml, /Fixture preview loaded/);
assert.match(drawerHtml, /No live packet, provider return, public release, or seal action is being claimed/);
assert.equal(/Phase\s+\d+/i.test(drawerHtml), false);
assert.equal(/Phase\s+\d+/i.test(hushHubHtml), false);

assert.match(drawerCss, /drawer-action-bar/);
assert.match(drawerCss, /radial-gradient\(ellipse at 50% -8%/);
assert.match(drawerCss, /text-shadow: 0 0 24px/);
assert.match(drawerCss, /drawer-cta\.primary/);

assert.match(drawerJs, /buildDrawerReceipt/);
assert.match(drawerJs, /copyReceipt/);
assert.match(drawerJs, /exportReceipt/);
assert.match(drawerJs, /Custody receipt copied/);
assert.match(drawerJs, /Custody receipt exported/);
assert.match(drawerJs, /Run Collision Audit/);
assert.match(drawerJs, /Run Release Audit/);
assert.equal(/appendTextElement\(button, 'span', gate\.action\)/.test(drawerJs), false);

assert.match(dashboardState, /Cross-mask collision audit/);
assert.match(dashboardState, /Release discipline/);
assert.equal(/'Phase 9 collision audit'|'Phase 10 release discipline'/.test(dashboardState), false);

console.log('hush-packet-ui-entrypoint: ok');
