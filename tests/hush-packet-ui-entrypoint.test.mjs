import assert from 'node:assert/strict';
import fs from 'fs';

const appHtml = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const drawerHtml = fs.readFileSync('app/hush-packet-dashboard.html', 'utf8');

assert.match(appHtml, /id="packetDrawerLink"/);
assert.match(appHtml, /href="\.\/hush-packet-dashboard\.html"/);
assert.match(appHtml, />Packets \/\/ drawer<\/a>/);
assert.match(appHtml, /aria-label="Open Hush packet drawer"/);
assert.match(appHtml, /class="statepill active hush-packet-drawer-link"/);
assert.match(appHtml, /id="packetDrawerDock"/);
assert.match(appHtml, /id="packetDrawerPanelLink"/);
assert.equal(/packetDrawerFloatingLink/.test(appHtml), false);

assert.match(drawerHtml, /<h1 id="drawerTitle">Packet Drawer<\/h1>/);
assert.match(drawerHtml, /Fixture preview loaded/);
assert.match(drawerHtml, /No live packet, provider return, public export, or seal action is being claimed/);

console.log('hush-packet-ui-entrypoint: ok');
