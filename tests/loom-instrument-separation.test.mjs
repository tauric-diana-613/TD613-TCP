import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const main=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const lab=fs.readFileSync(new URL('../app/dome-world/loom-instrument-lab.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-lab-page.js',import.meta.url),'utf8');

test('Instrument Lab is a separate utility route',()=>{
  assert.doesNotMatch(main,/id="loomInstrumentLab"|id="loomLegacy"/);
  assert.match(main,/href="\/dome-world\/loom-instrument-lab\.html"/);
  assert.match(lab,/id="loomInstrumentLab"/);
  assert.match(js,/mountLoomInstrumentLab/);
  assert.doesNotMatch(js,/fetch\s*\(|requestAnimationFrame|setInterval\s*\(/);
});
