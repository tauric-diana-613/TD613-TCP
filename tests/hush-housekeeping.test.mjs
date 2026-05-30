import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const css = fs.readFileSync('app/hush-housekeeping.css', 'utf8');
const js = fs.readFileSync('app/hush-housekeeping.js', 'utf8');

assert.ok(html.includes('hush-housekeeping.css'), 'Hush page should load housekeeping CSS');
assert.ok(html.includes('hush-housekeeping.js'), 'Hush page should load housekeeping module');

for (const marker of [
  'hushHousekeepingPanel',
  'hushComparePanel',
  'hushQualityPanel',
  'hushIdentPanel',
  'hushActiveMaskBadge'
]) {
  assert.ok(js.includes(marker), `housekeeping module should define ${marker}`);
}

for (const phrase of [
  'Private Text Custody',
  'Clear Samples',
  'Clear Custom Mask',
  'Export Clean Receipt',
  'Before / after / losses',
  'Too-identifiable meter',
  'Reference Fitness',
  'privateTextExcluded',
  'includesPrivateText: false'
]) {
  assert.ok(js.includes(phrase), `housekeeping module should include ${phrase}`);
}

for (const selector of [
  '.hush-housekeeping-panel',
  '.hush-compare-panel',
  '.hush-quality-panel',
  '.hush-ident-panel',
  '.hush-active-mask-badge'
]) {
  assert.ok(css.includes(selector), `housekeeping CSS should include ${selector}`);
}

assert.ok(!js.includes('includePrivateText: true'), 'housekeeping clean receipt module must not request private text export');
assert.ok(js.includes('td613-hush-selected-mask'), 'housekeeping should persist selected mask id only');

console.log('Hush housekeeping custody pass is wired: custody controls, comparison panel, quality meter, residual meter, active mask badge, and clean receipts.');
