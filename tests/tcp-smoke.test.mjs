import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');
const exists = (filePath) => fs.existsSync(path.join(root, filePath));

const requiredFiles = [
  'package.json',
  'app/index.html',
  'app/safe-harbor/index.html',
  'app/safe-harbor/td613-flight.html',
  'scripts/patch-td613-flight-seal-side-by-side.mjs',
  'scripts/patch-td613-flight-mobile-tiles.mjs',
  'scripts/patch-td613-flight-dashboard-polish.mjs'
];

for (const filePath of requiredFiles) {
  assert.ok(exists(filePath), `TCP smoke missing required file: ${filePath}`);
}

const pkg = JSON.parse(read('package.json'));
assert.equal(pkg.type, 'module', 'package must stay ESM-compatible');
assert.ok(pkg.scripts?.test, 'package must expose the full test command');
assert.ok(pkg.scripts?.['test:hush'], 'package must expose the deep Hush regression command');
assert.ok(pkg.scripts?.['test:safe-harbor'], 'package must expose the Safe Harbor regression command');

const flight = read('app/safe-harbor/td613-flight.html');
const flightNeedles = [
  'Prompt Output',
  'Seal',
  'Glyph Bay',
  'Dev Settings',
  'id="payloadStepper"',
  'id="authOutputToggle"',
  'mobile-prompt-rail mobile-prompt-rail-top',
  'PR90_SENTINEL TD613 Flight seal side-by-side target/zwnj repair',
  'PR91_SENTINEL TD613 Flight mobile tile controls restoration',
  'PR92_SENTINEL TD613 Flight dashboard polish: shelves, rail, payload',
  'grid-template-areas: "target zwnj" !important;',
  'flex-flow: row wrap !important;',
  'grid-template-areas: "counts auth" ". payload" !important;',
  '“I was broken encasing a circle.”',
  '“When authoring, stay academically rigorous yet grounded in high speculation.”'
];

for (const needle of flightNeedles) {
  assert.ok(flight.includes(needle), `TCP smoke missing Flight surface marker: ${needle}`);
}

assert.equal((flight.match(/id="payloadStepper"/g) || []).length, 1, 'Flight surface must contain exactly one payload stepper');
assert.equal((flight.match(/id="authOutputToggle"/g) || []).length, 1, 'Flight surface must contain exactly one authorship output toggle');
assert.ok(!flight.includes('function prepNoZoom'), 'retired prepNoZoom guard must stay absent');
assert.ok(!flight.includes('data-td613-prev-font'), 'retired focus font shim must stay absent');
assert.ok(!flight.includes('phrases.push("“I was broken encasing a circle.”")'), 'encasing output value must remain unquoted');
assert.ok(!flight.includes('phrases.push("“When authoring, stay academically rigorous yet grounded in high speculation.”")'), 'academic speculation output value must remain unquoted');

const harborIndex = read('app/safe-harbor/index.html');
assert.ok(harborIndex.includes('Safe Harbor') || harborIndex.includes('safe-harbor'), 'Safe Harbor index must remain discoverable');

const gateway = read('app/index.html');
assert.ok(gateway.includes('<html'), 'Gateway must remain an HTML document');

console.log('TCP smoke passed: static surfaces, Flight sentinels, and lightweight package contracts are intact.');
