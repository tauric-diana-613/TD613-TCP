import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync('app/dome-world/index.html', 'utf8');
const lab = fs.readFileSync('app/dome-world/admissibility-tomography.html', 'utf8');
assert.match(index, /href="\/dome-world\/admissibility-tomography\.html"[^>]+data-open-view="tomography"/);
assert.equal((index.match(/class="tab(?: active)?"/g) || []).length, 8, 'Tomography must not become a ninth primary tab.');
assert.equal((index.match(/class="lab-node"/g) || []).length, 10, 'Lab constellation must retain ten stations.');
assert.match(lab, /TD613 Aperture v3\.1-alpha/);
assert.match(lab, /IndexedDB/);
assert.match(lab, /td613\.aperture\.v31\.latest-run/);
assert.match(lab, /compileTomographyReceipt/);
assert.match(lab, /compileAshDerivativeEligibility/);
assert.match(lab, /compileFlowcoreContextSeries/);
assert.match(lab, /new IntersectionObserver/);
assert.equal((lab.match(/requestAnimationFrame\(/g) || []).length, 1, 'Lab must use one scheduler request site.');
assert.match(lab, /prefers-reduced-motion/);
assert.doesNotMatch(lab, /\bclaim_ceiling\b/);
assert.match(lab, /Scope boundaries govern receipt promotion; they do not censor interpretation\./);
assert.match(lab, /automatic_ash_action:false/);
assert.match(lab, /prediction_authorized:false/);

for (const path of [
  'app/dome-world/schemas/aperture-admissibility-tomography-receipt-v01.schema.json',
  'app/dome-world/schemas/aperture-tomography-replay-v01.schema.json'
]) {
  const schema = JSON.parse(fs.readFileSync(path, 'utf8'));
  assert.equal(schema.additionalProperties, false);
  assert.ok(schema.$id);
}
console.log('aperture-v31-lab.test.mjs passed');
