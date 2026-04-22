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
const packageFormal = sampleById('package-handoff-formal-record');
const packageRushed = sampleById('package-handoff-rushed-mobile');

assert.ok(procedural, 'procedural regression sample exists');
assert.ok(formal, 'formal regression sample exists');
assert.ok(rushedDonor, 'rushed donor sample exists');
assert.ok(formalDonor, 'formal donor sample exists');
assert.ok(packageFormal, 'package-handoff formal sample exists');
assert.ok(packageRushed, 'package-handoff rushed sample exists');

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
    sourceRegisterLane: procedural.variant,
    shell: { mode: 'borrowed', personaId: 'archivist', profile: extractCadenceProfile(formalDonor.text), registerLane: formalDonor.variant, strength: 0.84 }
  },
  {
    id: 'formal-correspondence',
    text: formal.text,
    sourceRegisterLane: formal.variant,
    shell: { mode: 'borrowed', personaId: 'spark', profile: extractCadenceProfile(rushedDonor.text), registerLane: rushedDonor.variant, strength: 0.82 }
  },
  {
    id: 'reflective-prose',
    text: reflective,
    sourceRegisterLane: 'professional-message',
    shell: { mode: 'borrowed', personaId: 'matron', profile: extractCadenceProfile(formalDonor.text), registerLane: formalDonor.variant, strength: 0.84 }
  },
  {
    id: 'narrative-scene',
    text: narrative,
    sourceRegisterLane: 'tangled-followup',
    shell: { mode: 'borrowed', personaId: 'cross-examiner', profile: extractCadenceProfile(rushedDonor.text), registerLane: rushedDonor.variant, strength: 0.84 }
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
let semanticLockArtifactZeroedCount = 0;

function driftRank(candidate = null) {
  const driftClass = String(candidate?.ontologyAudit?.selectiveAdmissibilityDrift?.driftClass || 'none').toLowerCase();
  if (driftClass === 'severe') return 3;
  if (driftClass === 'active') return 2;
  if (driftClass === 'watch') return 1;
  return 0;
}

function routePressure(candidate = null) {
  return Number(candidate?.ontologyAudit?.selectiveAdmissibilityDrift?.routePressure || 0);
}

function protectedAnchorIntegrity(candidate = null) {
  return Number(candidate?.ontologyAudit?.anchorIntegrity?.protectedAnchorIntegrity ?? 1);
}

function minimumSemanticCoverage(candidate = null) {
  const semanticCoverage = candidate?.ontologyAudit?.semanticCoverage || {};
  return Math.min(
    Number(semanticCoverage.propositionCoverage ?? 1),
    Number(semanticCoverage.actorCoverage ?? 1),
    Number(semanticCoverage.actionCoverage ?? 1),
    Number(semanticCoverage.objectCoverage ?? 1)
  );
}

function deformationLoad(candidate = null) {
  const aperture = candidate?.ontologyAudit?.aperture || {};
  return Number(aperture.historicalCrease || 0) + Number(aperture.unfoldingEnergy || 0);
}

for (const testCase of cases) {
  const result = buildCadenceTransfer(testCase.text, testCase.shell, {
    retrieval: true,
    sourceRegisterLane: testCase.sourceRegisterLane || undefined
  });
  const substantiveMovement = (result.changedDimensions || []).filter((dimension) =>
    !['punctuation-shape', 'contraction-posture'].includes(dimension)
  ).length;

  assert.equal(result.generatorVersion, 'v2', `${testCase.id}: Generator V2 is the active writer`);
  assert.ok(result.generationDocket && typeof result.generationDocket.status === 'string', `${testCase.id}: generation docket is attached`);
  assert.ok(Array.isArray(result.candidateLedger) && result.candidateLedger.length >= 1, `${testCase.id}: candidate ledger is attached`);
  assert.ok(result.holdStatus === 'held' || result.holdStatus === 'landed', `${testCase.id}: hold status is explicit`);
  assert.ok(result.toolabilityAudit && typeof result.toolabilityAudit.toolabilityScore === 'number', `${testCase.id}: toolability audit is attached`);
  assert.ok(result.personaSeparationAudit && typeof result.personaSeparationAudit.score === 'number', `${testCase.id}: persona separation audit is attached`);
  assert.ok(Array.isArray(result.toolabilityWarnings), `${testCase.id}: toolability warnings are attached`);
  assert.equal(
    result.toolabilityAudit.semanticLockIntact,
    Boolean(result.semanticLockIntact),
    `${testCase.id}: semantic lock state stays aligned between result and toolability audit`
  );
  assert.ok(
    Array.isArray(result.retrievalTrace?.planSummary?.testedFamilyIds),
    `${testCase.id}: retrieval trace reports tested family ids`
  );
  assert.ok(result.retrievalTrace?.ontologyAudit, `${testCase.id}: retrieval trace carries ontology audit`);
  assert.ok(result.generationDocket?.ontologyRoutePressure, `${testCase.id}: generation docket carries ontology route pressure`);
  assert.equal(result.sourceRegisterLane, testCase.sourceRegisterLane || result.sourceRegisterLane, `${testCase.id}: source register lane is threaded through the landed result`);
  assert.ok(
    (result.candidateLedger || []).every((entry) => Boolean(entry.sourceRegisterLane)),
    `${testCase.id}: candidate ledger entries carry source register lanes`
  );
  assert.ok(
    (result.candidateLedger || []).every((entry) => Array.isArray(entry.profileShiftDimensions)),
    `${testCase.id}: candidate ledger entries carry profile-shift dimensions`
  );
  assert.ok(
    (result.candidateLedger || []).every((entry) => entry.ontologyAudit && entry.ontologyAudit.selectiveAdmissibilityDrift),
    `${testCase.id}: every candidate ledger entry carries ontology audit and route pressure`
  );
  assert.ok(
    ['none', 'watch', 'active', 'severe'].includes(result.retrievalTrace?.ontologyAudit?.selectiveAdmissibilityDrift?.driftClass),
    `${testCase.id}: retrieval trace drift class stays within the ontology route grammar`
  );
  assert.ok(
    ['play', 'warning', 'buffer', 'harbor'].includes(result.generationDocket?.ontologyRoutePressure?.selectiveAdmissibilityDrift?.routeFloor),
    `${testCase.id}: generation docket route floor stays within the Aperture route grammar`
  );

  const selectedEntry = (result.candidateLedger || []).find((entry) => entry.status === 'selected');
  const expectedSelection = [...(result.candidateLedger || [])].sort((left, right) =>
    driftRank(left) - driftRank(right) ||
    routePressure(left) - routePressure(right) ||
    protectedAnchorIntegrity(right) - protectedAnchorIntegrity(left) ||
    minimumSemanticCoverage(right) - minimumSemanticCoverage(left) ||
    deformationLoad(left) - deformationLoad(right) ||
    Number(right.toolabilityScore || 0) - Number(left.toolabilityScore || 0) ||
    Number(right.score || 0) - Number(left.score || 0) ||
    String(left.id || '').localeCompare(String(right.id || ''))
  )[0] || null;
  if (selectedEntry && expectedSelection) {
    assert.equal(
      selectedEntry.id,
      expectedSelection.id,
      `${testCase.id}: selected candidate follows ontology-hard ordering before toolability tie-breaks`
    );
  }

  for (const family of result.retrievalTrace?.planSummary?.testedFamilyIds || []) {
    familyUnion.add(family);
  }

  if (result.holdStatus === 'held') {
    assert.equal(result.text, '', `${testCase.id}: held results do not publish weak output`);
    assert.equal(result.generationDocket.status, 'held', `${testCase.id}: held results mark the docket as held`);
  } else {
    if (result.semanticLockIntact) {
      semanticLockArtifactZeroedCount += 1;
      assert.equal(result.toolabilityAudit.artifactPenalty, 0, `${testCase.id}: semantic lock zeroes artifact penalty`);
    }
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

const packageToRushed = buildCadenceTransfer(packageFormal.text, {
  mode: 'borrowed',
  personaId: 'spark',
  profile: extractCadenceProfile(packageRushed.text),
  registerLane: packageRushed.variant,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: packageFormal.variant
});

assert.equal(packageToRushed.sourceRegisterLane, 'formal-record', 'package formal -> rushed preserves formal source lane');
assert.equal(packageToRushed.targetRegisterLane, 'rushed-mobile', 'package formal -> rushed targets rushed-mobile lane');
assert.ok((packageToRushed.lexemeSwaps || []).length > 0, 'package formal -> rushed lands real lexical realization');
assert.ok(
  (packageToRushed.changedDimensions || []).some((dimension) => ['sentence-mean', 'sentence-count', 'sentence-spread'].includes(dimension)),
  'package formal -> rushed lands structural compression in the surfaced dimensions'
);
assert.ok(
  /cams \+ residents|said yes its hers|had bags already/i.test(String(packageToRushed.text || '')),
  'package formal -> rushed lands safe rushed-lane compression without losing its witness anchors'
);

const packageToFormal = buildCadenceTransfer(packageRushed.text, {
  mode: 'borrowed',
  personaId: 'archivist',
  profile: extractCadenceProfile(packageFormal.text),
  registerLane: packageFormal.variant,
  strength: 0.84
}, {
  retrieval: true,
  sourceRegisterLane: packageRushed.variant
});
const packageToFormalPreview = String(packageToFormal.text || packageToFormal.internalText || '');

assert.equal(packageToFormal.sourceRegisterLane, 'rushed-mobile', 'package rushed -> formal preserves rushed-mobile source lane');
assert.equal(packageToFormal.targetRegisterLane, 'formal-record', 'package rushed -> formal targets formal-record lane');
assert.ok(
  (packageToFormal.lexemeSwaps || []).length > 0 || packageToFormalPreview.length > 0,
  'package rushed -> formal surfaces a real shorthand expansion path'
);
assert.ok(
  /package|management|second-floor|was not/i.test(packageToFormalPreview),
  'package rushed -> formal expands clipped logistics vocabulary into formal-record witness language'
);
assert.ok(
  !((packageToFormal.changedDimensions || []).includes('lexical-register') && !(packageToFormal.lexemeSwaps || []).length),
  'package rushed -> formal does not over-report lexical register without surfaced lexeme swaps'
);
assert.ok(
  Array.isArray(packageToFormal.profileShiftDimensions) && packageToFormal.profileShiftDimensions.length >= (packageToFormal.changedDimensions || []).length,
  'package rushed -> formal keeps profile movement distinct from surfaced movement'
);
assert.ok(
  !((packageToFormal.generationDocket?.reasons || []).includes('artifact:clause-join')),
  'package rushed -> formal repair round clears the mild clause-join artifact from the best held candidate'
);

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
  reflectiveResults.every((result) => Number(result.toolabilityAudit?.toolabilityScore || 0) >= 0.52),
  'reflective live probe lands above the minimum toolability floor'
);
assert.ok(
  reflectiveResults.every((result) => Number(result.personaSeparationAudit?.score || 0) >= 0.4),
  'reflective live probe keeps at least a bounded persona-separation floor'
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
  narrativeResults.filter((result) => result.holdStatus === 'landed').every((result) => Number(result.toolabilityAudit?.toolabilityScore || 0) >= 0.52),
  'narrative live probe lands above the minimum toolability floor'
);
assert.ok(
  narrativeResults.filter((result) => result.holdStatus === 'landed').every((result) => Number(result.personaSeparationAudit?.score || 0) >= 0.4),
  'narrative live probe keeps at least a bounded persona-separation floor'
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
for (const result of [...reflectiveResults, ...narrativeResults]) {
  if (result.holdStatus === 'landed' && result.semanticLockIntact) {
    semanticLockArtifactZeroedCount += 1;
    assert.equal(result.toolabilityAudit.artifactPenalty, 0, 'semantic lock zeroes artifact penalties on landed V2 outputs');
  }
}
assert.ok(semanticLockArtifactZeroedCount >= 1, 'at least one maintained V2 landing exercises the semantic lock artifact waiver');

console.log('generator-v2.test.mjs passed');
