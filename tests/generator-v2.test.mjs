import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { buildCadenceTransfer, extractCadenceProfile } from '../app/engine/stylometry.js';
import { DIAGNOSTIC_SAMPLE_LIBRARY } from '../app/data/diagnostics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const generatorV2Path = path.join(repoRoot, 'app', 'engine', 'generator-v2.js');
const generatorV2Source = fs.readFileSync(generatorV2Path, 'utf8');

assert.equal(/buildCadenceTransferLegacy\s*\(/.test(generatorV2Source), false, 'Generator V2 does not call the legacy writer');
assert.equal(/applyCadenceToTextLegacy\s*\(/.test(generatorV2Source), false, 'Generator V2 does not call the legacy apply helper');
assert.equal(/repairTD613ApertureProjection\s*\(/.test(generatorV2Source), false, 'Generator V2 keeps Aperture out of text authorship');

const sampleById = (id) => DIAGNOSTIC_SAMPLE_LIBRARY.find((sample) => sample.id === id);
const procedural = sampleById('building-access-formal-record');
const formal = sampleById('customer-support-formal-record');
const rushedDonor = sampleById('package-handoff-rushed-mobile');
const formalDonor = sampleById('committee-budget-formal-record');

assert.ok(procedural, 'procedural regression sample exists');
assert.ok(formal, 'formal regression sample exists');
assert.ok(rushedDonor, 'rushed donor sample exists');
assert.ok(formalDonor, 'formal donor sample exists');

const reflective = `I am pretty content in life. Don't worry about where you came from. Keep doing what you're doing.

Don't stop doing martial arts. I needed that. I got into a lot of trouble without martial arts. And I blame mom for taking that away from me.`;

const narrative = `I must keep reminding myself that this will work. Nobody I've ever shared the same room with has ever seen Cheers! Things are moving too fast to dissuade myself of this. On the ready, I pull out the next pack of Crushes, turn them over and spank its bottom like a bad boy. It is the middle of the night, and suddenly, I am not alone.`;

const cases = [
  {
    id: 'procedural-record',
    text: procedural.text,
    shell: { mode: 'borrowed', personaId: 'archivist', profile: extractCadenceProfile(formalDonor.text), strength: 0.84 }
  },
  {
    id: 'formal-correspondence',
    text: formal.text,
    shell: { mode: 'borrowed', personaId: 'spark', profile: extractCadenceProfile(rushedDonor.text), strength: 0.82 }
  },
  {
    id: 'reflective-prose',
    text: reflective,
    shell: { mode: 'borrowed', personaId: 'matron', profile: extractCadenceProfile(formalDonor.text), strength: 0.84 }
  },
  {
    id: 'narrative-scene',
    text: narrative,
    shell: { mode: 'borrowed', personaId: 'cross-examiner', profile: extractCadenceProfile(rushedDonor.text), strength: 0.84 }
  }
];

const normalizeComparable = (text = '') => String(text || '')
  .replace(/\r\n/g, '\n')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

for (const testCase of cases) {
  const result = buildCadenceTransfer(testCase.text, testCase.shell, { retrieval: true });
  const substantiveMovement = (result.changedDimensions || []).filter((dimension) =>
    !['punctuation-shape', 'contraction-posture'].includes(dimension)
  ).length;

  assert.equal(result.generatorVersion, 'v2', `${testCase.id}: Generator V2 is the active writer`);
  assert.ok(result.generationDocket && typeof result.generationDocket.status === 'string', `${testCase.id}: generation docket is attached`);
  assert.ok(Array.isArray(result.candidateLedger) && result.candidateLedger.length >= 1, `${testCase.id}: candidate ledger is attached`);
  assert.ok(result.holdStatus === 'held' || result.holdStatus === 'landed', `${testCase.id}: hold status is explicit`);

  if (result.holdStatus === 'held') {
    assert.equal(result.text, '', `${testCase.id}: held results do not publish weak output`);
    assert.equal(result.generationDocket.status, 'held', `${testCase.id}: held results mark the docket as held`);
  } else {
    assert.notEqual(
      normalizeComparable(result.text),
      normalizeComparable(testCase.text),
      `${testCase.id}: landed results never silently fall back to source text`
    );
    assert.ok(
      substantiveMovement > 0 || (result.lexemeSwaps || []).length > 0,
      `${testCase.id}: landed results do not publish punctuation-only churn`
    );
  }
}

console.log('generator-v2.test.mjs passed');
