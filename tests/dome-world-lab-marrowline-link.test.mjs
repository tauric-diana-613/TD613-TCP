import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  DOME_WORLD_SHELL_VERSION,
  RELATION_ENVELOPE_LAB_ROUTE,
  MARROWLINE_LAB_ROUTE,
  injectMarrowlineLabButton
} from '../api/dome-world-shell.js';

const source = fs.readFileSync('app/dome-world/index.html', 'utf8');
const rendered = injectMarrowlineLabButton(source);
const renderedAgain = injectMarrowlineLabButton(rendered);
const dom = new JSDOM(rendered);
const { document } = dom.window;

assert.equal(DOME_WORLD_SHELL_VERSION, 'td613.dome-world.shell/v1.2-phase5-relation-lab');
assert.equal(RELATION_ENVELOPE_LAB_ROUTE, '/dome-world/relation-envelope.html');
assert.equal(MARROWLINE_LAB_ROUTE, '/dome-world/marrowline.html');
assert.equal(renderedAgain, rendered, 'Lab injection must be idempotent');
assert.equal(document.querySelectorAll('.lab-node').length, 12);
assert.match(document.querySelector('.lab-telemetry')?.textContent || '', /12\s*stations/i);

const relation = document.querySelector(`[data-open-route="${RELATION_ENVELOPE_LAB_ROUTE}"]`);
assert.ok(relation, 'Phase V Relation Envelope Lab button must exist');
assert.equal(relation.tagName, 'BUTTON');
assert.equal(relation.getAttribute('data-glyph'), '≈');
assert.equal(relation.getAttribute('data-tone'), 'violet');
assert.equal(relation.getAttribute('style'), 'grid-column:span 4');
assert.equal(relation.querySelector('.lab-index')?.textContent, '11');
assert.equal(relation.querySelector('strong')?.textContent, 'Relation Envelope');
assert.match(relation.getAttribute('onclick') || '', /\/dome-world\/relation-envelope\.html/);

const marrowline = document.querySelector(`[data-open-route="${MARROWLINE_LAB_ROUTE}"]`);
assert.ok(marrowline, 'Marrowline Lab button must exist');
assert.equal(marrowline.tagName, 'BUTTON');
assert.equal(marrowline.getAttribute('data-glyph'), '∴');
assert.equal(marrowline.getAttribute('data-tone'), 'gold');
assert.equal(marrowline.getAttribute('style'), 'grid-column:span 8');
assert.equal(marrowline.querySelector('.lab-index')?.textContent, '12');
assert.equal(marrowline.querySelector('strong')?.textContent, 'Marrowline');
assert.match(marrowline.querySelector('small')?.textContent || '', /Kʰonapolit terminal \/ live ingress/);
assert.match(marrowline.getAttribute('onclick') || '', /\/dome-world\/marrowline\.html/);

assert.match(rendered, /data-open-view="api"/);
assert.match(rendered, /Claim ceiling: dev-hidden-compatibility-workflow-not-production-custody/);
console.log('dome-world-lab-marrowline-link: Phase V + Marrowline served Lab buttons ok');
