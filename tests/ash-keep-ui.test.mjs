import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const read = file => fs.readFileSync(file, 'utf8');
const html = read('app/dome-world/ash-keep.html');
const deliverySource = read('app/dome-world/ash-keep-source.html');
const runtime = read('app/dome-world/ash-keep.js');
const caseControls = read('app/dome-world/ash-case-controls.js');
const mapLabels = read('app/dome-world/ash-map-labels.js');
const worker = read('app/dome-world/ash-keep-worker.js');
const dome = read('app/dome-world/index.html');
const lab = read('app/dome-world/admissibility-tomography.html');
const aperture = read('app/aperture/tool.html');
const release = read('app/aperture/release.json');
const downloadPath = path.join(os.homedir(), 'Downloads', 'Aperture_v3_1-alpha.html');

for (const label of ['Map', 'Rooms', 'Routes', 'Test', 'Draft', 'Save']) {
  assert.match(html, new RegExp(`data-workspace="${label.toLowerCase()}"`));
}
for (const label of ['Everything', 'What left', 'Before', 'After', 'What changed', 'What remains', 'Test coverage']) {
  assert.ok(html.includes(`>${label}</button>`), `Missing map mode: ${label}`);
}
for (const command of ['New case', 'Save Case', 'Close Case', 'Add a room', 'Record what left', 'Test this draft', 'Compare drafts', 'Keep this version', 'Save point', 'Export encrypted copy']) {
  assert.ok(html.includes(command), `Missing primary command: ${command}`);
}
assert.match(html, /id="saveCase"[^>]*>Save Case<\/button>/);
assert.match(html, /id="closeCase"[^>]*>Close Case<\/button>/);
assert.match(html, /<label for="selectCase">Select Case<\/label>/);
assert.match(html, /<select id="selectCase" disabled>/);
assert.match(html, /localStorage\.getItem\('td613\.ash-keep\.current-case'\)[\s\S]*ash-has-current-case/);
assert.match(html, /\.launch\.hidden,\.ash-has-current-case \.launch\{display:none\}/);
assert.match(html, /src="\/dome-world\/ash-case-controls\.js"/);
assert.equal(deliverySource, html, 'Static Ash Keep delivery source must remain byte-identical to the canonical document.');

assert.match(html, /<h3>Hush API<\/h3>/);
assert.match(html, /Research Notes · off by default/);
assert.match(html, /Case Map, Rooms, Route Memory, local aliases, and final recipient route stay in the browser/);
assert.match(runtime, /indexedDB\.open/);
assert.match(runtime, /fetch\('\/api\/hush-generate'/);
assert.match(runtime, /fetch\('\/dome-world\/fixtures\/ash-keep-demo\.json'/);
assert.equal((runtime.match(/requestAnimationFrame\(/g) || []).length, 1, 'Ash Keep must use one visible-canvas scheduler.');
assert.match(runtime, /document\.hidden/);
assert.match(runtime, /prefers-reduced-motion/);
assert.match(runtime, /localStorage\.setItem\(POINTER_KEY/);
assert.match(runtime, /localStorage\.setItem\(PREFS_KEY/);
const localWrites = [...runtime.matchAll(/localStorage\.setItem\(([^,\n]+),/g)].map(match => match[1].trim());
assert.deepEqual(localWrites.sort(), ['POINTER_KEY', 'PREFS_KEY'], 'Only the compact current-case pointer and UI preferences may enter localStorage from the core runtime.');

assert.match(caseControls, /import '\.\/ash-map-labels\.js'/);
assert.match(caseControls, /ASH_CASE_CONTROLS_VERSION = 'td613\.ash-keep\.case-controls\/v1\.1'/);
assert.match(caseControls, /SAVED_CASES_KEY = 'td613\.ash-keep\.saved-cases:v1'/);
assert.match(caseControls, /async function saveCurrentCase\(\)/);
assert.match(caseControls, /async function closeCurrentCase\(\)/);
assert.match(caseControls, /async function populateCaseSelect\(/);
assert.match(caseControls, /current unsaved/);
assert.match(caseControls, /fingerprint === savedRecord\.fingerprint/);
assert.match(caseControls, /crypto\.subtle\.digest\('SHA-256'/);
assert.match(caseControls, /document\.documentElement\.classList\.remove\(PREPAINT_CLASS\)/);
assert.match(caseControls, /location\.reload\(\)/);
assert.match(caseControls, /select\.disabled = options\.length === 0/);
assert.match(caseControls, /open\.textContent = 'Open'/);
assert.match(caseControls, /remove\.textContent = 'Delete'/);
assert.match(caseControls, /open\.disabled = true/);
assert.match(caseControls, /remove\.disabled = true/);
assert.match(caseControls, /setChoiceAvailability\(Boolean\(event\.target\.value\)\)/);
assert.doesNotMatch(caseControls, /selectCase'\)\?\.addEventListener\('change',[^\n]*openSelectedCase/, 'Choosing a case may arm controls but must not open it automatically.');
assert.match(caseControls, /async function deleteSelectedCase\(\)/);
assert.match(caseControls, /window\.confirm\(`Delete/);
assert.match(caseControls, /async function deleteCaseRecords\(db, caseId\)/);
assert.match(caseControls, /localStorage\.removeItem\(POINTER_KEY\)/);
assert.doesNotMatch(caseControls, /innerHTML\s*=\s*.*title/, 'Saved case titles must not be interpolated through innerHTML.');

assert.match(mapLabels, /ASH_MAP_LABELS_VERSION = 'td613\.ash-keep\.map-labels\/v1\.0'/);
assert.match(mapLabels, /isNodeLabel\(context\)/);
assert.match(mapLabels, /original\.fillText\.call\(this, String\(node\.index\)/);
assert.match(mapLabels, /event\.stopImmediatePropagation\(\)/);
assert.match(mapLabels, /pointermove/);
assert.match(mapLabels, /pointerleave/);
assert.match(mapLabels, /hover or tap for label/);
assert.match(mapLabels, /data-ash-node-number/);
assert.match(mapLabels, /tooltip\.textContent = `\$\{record\.index\} · \$\{record\.label\}`/);
assert.doesNotMatch(mapLabels, /requestAnimationFrame\(/, 'The label layer must not introduce a second animation scheduler.');

assert.match(worker, /self\.postMessage\(\{ id, trials \}\)/);
assert.match(runtime, /compileRebuildTest/);

assert.equal((dome.match(/class="tab(?: active)?"/g) || []).length, 8, 'Ash Keep must not become a ninth global tab.');
assert.equal((dome.match(/class="lab-node"/g) || []).length, 10, 'Ash Keep must not alter the Lab constellation.');
assert.match(dome, /href="\/dome-world\/ash-keep\.html"/);
assert.match(lab, /href="\/dome-world\/ash-keep\.html"/);

const retired = [
  ['cannot', '_', 'establish'].join(''),
  ['claim', 'Ceiling'].join(''),
  ['claim', '_', 'ceiling'].join(''),
  ['Claim', ' Ceiling'].join('')
];
for (const [label, body] of [
  ['canonical Aperture', aperture],
  ['release manifest', release],
  ['Downloads Aperture', read(downloadPath)]
]) {
  for (const token of retired) assert.equal(body.includes(token), false, `${label} contains retired active vocabulary: ${token}`);
}

for (const schemaPath of [
  'ash-case-map-v01.schema.json', 'ash-room-rules-v01.schema.json', 'ash-route-memory-v01.schema.json',
  'aperture-reader-profile-v01.schema.json', 'aperture-rebuild-test-v01.schema.json', 'aperture-rebuild-replay-v01.schema.json',
  'hush-link-check-v01.schema.json', 'ash-unexpected-detail-v01.schema.json', 'ash-save-point-v01.schema.json',
  'ash-capsule-v01.schema.json', 'ash-draft-v01.schema.json', 'ash-draft-review-v01.schema.json',
  'ash-release-receipt-v01.schema.json', 'ash-provider-packet-v01.schema.json'
]) {
  const schema = JSON.parse(read(path.join('app/dome-world/schemas', schemaPath)));
  assert.ok(schema.$id, `${schemaPath} must declare an ID.`);
  assert.equal(schema.additionalProperties, false, `${schemaPath} must reject undeclared fields.`);
}

console.log('ash-keep-ui.test.mjs passed');
