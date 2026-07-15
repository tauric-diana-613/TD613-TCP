import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  DOME_WORLD_SHELL_VERSION,
  MARROWLINE_LAB_ROUTE,
  injectMarrowlineLabButton
} from '../api/dome-world-shell.js';

const source = fs.readFileSync('app/dome-world/index.html', 'utf8');
const rendered = injectMarrowlineLabButton(source);
const renderedAgain = injectMarrowlineLabButton(rendered);
const dom = new JSDOM(rendered);
const { document } = dom.window;

assert.equal(DOME_WORLD_SHELL_VERSION, 'td613.dome-world.shell/v1.2-embedded-ash-membrane');
assert.equal(MARROWLINE_LAB_ROUTE, '/dome-world/marrowline.html');
assert.equal(renderedAgain, rendered, 'Lab injection must be idempotent');
assert.equal(document.querySelectorAll('.lab-node').length, 11);
assert.match(document.querySelector('.lab-telemetry')?.textContent || '', /11\s*stations/i);

const button = document.querySelector(`[data-open-route="${MARROWLINE_LAB_ROUTE}"]`);
assert.ok(button, 'Marrowline Lab button must exist');
assert.equal(button.tagName, 'BUTTON');
assert.ok(button.classList.contains('lab-node-marrowline'), 'Marrowline must retain its station-specific desktop hook');
assert.equal(button.style.gridColumn, 'span 8', 'Marrowline must fill the eight desktop columns beside Interface Bus');
assert.equal(button.getAttribute('data-glyph'), '∴');
assert.equal(button.getAttribute('data-tone'), 'gold');
assert.equal(button.querySelector('.lab-index')?.textContent, '11');
assert.equal(button.querySelector('strong')?.textContent, 'Marrowline');
assert.match(button.querySelector('small')?.textContent || '', /Kʰonapolit terminal \/ live ingress/);
assert.match(button.getAttribute('onclick') || '', /\/dome-world\/marrowline\.html/);

assert.match(source, /@media\(max-width:980px\)[\s\S]*?\.lab-node\{grid-column:span 6!important\}/, 'tablet layout must override the desktop span');
assert.match(source, /@media\(max-width:760px\)[\s\S]*?\.lab-node\{grid-column:span 1!important/, 'mobile layout must remain governed by its existing two-column constellation');
assert.match(rendered, /data-open-view="api"/);
assert.match(rendered, /data-glyph="∴"/);
assert.match(rendered, /Claim ceiling: dev-hidden-compatibility-workflow-not-production-custody/);
assert.match(rendered, /data-ash-threshold-membrane/);

console.log('dome-world-lab-marrowline-link: desktop span, embedded Ash membrane, and mobile overrides ok');
