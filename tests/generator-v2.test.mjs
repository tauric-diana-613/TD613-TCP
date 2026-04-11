import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import personas from '../app/data/personas.js';
import { buildCadenceTransfer, extractCadenceProfile } from '../app/engine/stylometry.js';
import * as engine from '../app/engine/stylometry.js';
import { DIAGNOSTIC_SAMPLE_LIBRARY } from '../app/data/diagnostics.js';
import { resolvePersonaCatalog } from '../app/toys/persona-gallery/model.js';

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
const reflectiveLive = `I am pretty content in life. Don't worry about where you came from. Keep doing what you're doing.

Don't stop doing martial arts. I needed that. I got into a lot of trouble without martial arts. And I blame mom for taking that away from me.

I want to say hi to him. Call him. Meet him I guess is what I'm trying to say. "Tell me more about yourself" lol is what I would say, you know? That's someone you should get more familiar with. It's an everchasing experience. We have amnesia as people.`;
const narrativeLive = `I must keep reminding myself that this will work. Nobody I've ever shared the same room with has ever seen Cheers! Things are moving too fast to dissuade myself of this. On the ready, I pull out the next pack of Crushes, turn them over and spank its bottom like a bad boy. Twirl of the plastic, and bite of the tip, with an excited thumb that sparks but keeps missing the gas pedal. Two gulps: from the nerves, and, to placate them, from the coffee. The wall breaks with a shuddering, misanthropic swing. It's the middle of the night, and suddenly, I'm not alone.`;

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
const normalizeMovementComparable = (text = '') => String(text || '')
  .replace(/\r\n/g, '\n')
  .toLowerCase()
  .replace(/\bi'm\b/g, 'i am')
  .replace(/\bi've\b/g, 'i have')
  .replace(/\bit's\b/g, 'it is')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const hasArtifactLeak = (text = '') =>
  /(?:^|[.!?]\s+)[a-z]/.test(String(text || '')) ||
  /\b(?:and and|while while|while and|and while|but but|because because|since since|then then|yet yet)\b/i.test(String(text || '')) ||
  /;\s+[A-Z]/.test(String(text || '')) ||
  /\b(?:I|It|That|You|We|They|Don|Can|Won)\s*;\s*[A-Za-z]+\b/.test(String(text || ''));

const resolvedPersonas = resolvePersonaCatalog(engine, personas, DIAGNOSTIC_SAMPLE_LIBRARY);
const majorPersonas = ['spark', 'matron', 'undertow', 'archivist', 'cross-examiner']
  .map((id) => resolvedPersonas.find((persona) => persona.id === id))
  .filter(Boolean);

assert.equal(majorPersonas.length, 5, 'major built-in masks resolve for direct generator probes');

const familyUnion = new Set();

for (const testCase of cases) {
  const result = buildCadenceTransfer(testCase.text, testCase.shell, { retrieval: true });
  const substantiveMovement = (result.changedDimensions || []).filter((dimension) =>
    !['punctuation-shape', 'contraction-posture'].includes(dimension)
  ).length;

  assert.equal(result.generatorVersion, 'v2', `${testCase.id}: Generator V2 is the active writer`);
  assert.ok(result.generationDocket && typeof result.generationDocket.status === 'string', `${testCase.id}: generation docket is attached`);
  assert.ok(Array.isArray(result.candidateLedger) && result.candidateLedger.length >= 1, `${testCase.id}: candidate ledger is attached`);
  assert.ok(result.holdStatus === 'held' || result.holdStatus === 'landed', `${testCase.id}: hold status is explicit`);
  assert.ok(
    Array.isArray(result.retrievalTrace?.planSummary?.testedFamilyIds),
    `${testCase.id}: retrieval trace reports tested family ids`
  );

  for (const family of result.retrievalTrace?.planSummary?.testedFamilyIds || []) {
    familyUnion.add(family);
  }

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

assert.deepEqual(
  [...familyUnion].sort((left, right) => left.localeCompare(right)),
  ['cadence-connector', 'clause-pivot', 'hybrid', 'order-beat', 'persona-lexicon', 'pressure-current', 'register-lexicon', 'syntax-shape'],
  'Generator V2 reports the expanded native family set in retrieval traces'
);

const buildMajorMaskResult = (text, persona) => buildCadenceTransfer(
  text,
  {
    mode: 'borrowed',
    personaId: persona.id,
    profile: persona.profile,
    mod: persona.mod,
    strength: 0.88
  },
  { retrieval: true }
);

const reflectiveResults = majorPersonas.map((persona) => buildMajorMaskResult(reflectiveLive, persona));
assert.ok(
  reflectiveResults.every((result) => result.holdStatus === 'landed' && result.transferClass === 'structural'),
  'all five major masks land direct reflective rewrites in Generator V2'
);
assert.ok(
  new Set(reflectiveResults.map((result) => normalizeComparable(result.text))).size >= 4,
  'reflective live probe lands at least four materially distinct direct outputs'
);
assert.ok(
  reflectiveResults.every((result) => !hasArtifactLeak(result.text)),
  'reflective live probe avoids lowercase-lead, doubled-connector, semicolon-fracture, and malformed-contraction artifacts'
);
assert.ok(
  reflectiveResults.every((result) => normalizeMovementComparable(result.text) !== normalizeMovementComparable(reflectiveLive)),
  'reflective live probe does not collapse back to source-close movement'
);

const narrativeResults = majorPersonas.map((persona) => buildMajorMaskResult(narrativeLive, persona));
assert.ok(
  narrativeResults.filter((result) => result.holdStatus === 'landed' && result.transferClass === 'structural').length >= 4,
  'at least four of five major masks land direct narrative rewrites in Generator V2'
);
assert.ok(
  narrativeResults.find((result) => result.retrievalTrace?.candidateSummary)?.retrievalTrace !== undefined,
  'narrative live probe preserves retrieval traces on landed results'
);
assert.ok(
  narrativeResults[0].holdStatus === 'landed' && narrativeResults[0].transferClass === 'structural',
  'spark no longer collapses the narrative live probe into a shallow hold or surface drift'
);
assert.ok(
  new Set(narrativeResults.map((result) => normalizeComparable(result.text))).size >= 4,
  'narrative live probe lands at least four materially distinct direct outputs'
);
assert.ok(
  narrativeResults.every((result) => result.holdStatus === 'held' || !hasArtifactLeak(result.text)),
  'narrative live probe avoids the maintained artifact patterns on landed outputs'
);

console.log('generator-v2.test.mjs passed');
