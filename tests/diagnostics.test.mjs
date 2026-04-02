import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as engine from '../app/engine/stylometry.js';
import {
  DIAGNOSTIC_BATTERY,
  DIAGNOSTIC_CORPUS,
  DIAGNOSTIC_CORPUS_BY_ID
} from '../app/data/diagnostics.js';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const latestJsonPath = path.join(repoRoot, 'reports', 'diagnostics', 'latest.json');
const latestMdPath = path.join(repoRoot, 'reports', 'diagnostics', 'latest.md');

assert.equal(DIAGNOSTIC_CORPUS.families.length, 12, 'diagnostic corpus exposes 12 families');
assert.equal(DIAGNOSTIC_CORPUS.samples.length, 48, 'diagnostic corpus exposes 48 samples');
assert.equal(DIAGNOSTIC_CORPUS.promotedSampleIds.length, 16, 'diagnostic corpus exposes 16 promoted deck samples');
assert.equal(DIAGNOSTIC_CORPUS.deckRandomizerSampleIds.length, 16, 'diagnostic corpus exposes 16 deck randomizer samples');
assert.equal(DIAGNOSTIC_BATTERY.swapPairs.length, 72, 'diagnostic battery exposes 72 ordered swap pairs');
assert.equal(DIAGNOSTIC_BATTERY.maskCases.length, 24, 'diagnostic battery exposes 24 mask cases');
assert.equal(DIAGNOSTIC_BATTERY.trainerCases.length, 24, 'diagnostic battery exposes 24 trainer cases');
assert.equal(DIAGNOSTIC_BATTERY.retrievalCases.length, 16, 'diagnostic battery exposes 16 retrieval cases');
assert.equal(DIAGNOSTIC_BATTERY.falseNeighborCases.length, 24, 'diagnostic battery exposes 24 false-neighbor cases');

for (const family of DIAGNOSTIC_CORPUS.families) {
  const samples = DIAGNOSTIC_CORPUS.samples.filter((sample) => sample.familyId === family.id);
  assert.equal(samples.length, 4, `${family.id}: every family contains exactly four variants`);
  const variants = samples.map((sample) => sample.variant).sort();
  assert.deepEqual(
    variants,
    ['formal-record', 'professional-message', 'rushed-mobile', 'tangled-followup'],
    `${family.id}: variants match required lanes`
  );
}

for (const id of DIAGNOSTIC_CORPUS.promotedSampleIds) {
  assert.ok(DIAGNOSTIC_CORPUS_BY_ID[id], `${id}: promoted deck sample belongs to diagnostics corpus`);
}

for (const id of DIAGNOSTIC_CORPUS.deckRandomizerSampleIds) {
  assert.ok(DIAGNOSTIC_CORPUS_BY_ID[id], `${id}: deck randomizer sample belongs to diagnostics corpus`);
}

for (const caseSpec of DIAGNOSTIC_BATTERY.swapPairs) {
  assert.ok(DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId], `${caseSpec.id}: source sample resolves`);
  assert.ok(DIAGNOSTIC_CORPUS_BY_ID[caseSpec.donorId], `${caseSpec.id}: donor sample resolves`);
}

for (const caseSpec of DIAGNOSTIC_BATTERY.maskCases) {
  assert.ok(DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId], `${caseSpec.id}: mask source resolves`);
  assert.ok(caseSpec.lockIds.every((id) => DIAGNOSTIC_CORPUS_BY_ID[id]), `${caseSpec.id}: mask lock ids resolve`);
}

for (const caseSpec of DIAGNOSTIC_BATTERY.trainerCases) {
  assert.ok(DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId], `${caseSpec.id}: trainer source resolves`);
  assert.ok(caseSpec.extractionIds.every((id) => DIAGNOSTIC_CORPUS_BY_ID[id]), `${caseSpec.id}: trainer extraction ids resolve`);
}

for (const caseSpec of DIAGNOSTIC_BATTERY.retrievalCases) {
  const sourceSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.sourceId];
  const donorSample = DIAGNOSTIC_CORPUS_BY_ID[caseSpec.donorId];
  const result = engine.buildCadenceTransfer(sourceSample.text, {
    mode: 'borrowed',
    profile: engine.extractCadenceProfile(donorSample.text),
    strength: Number(caseSpec.strength || 0.88)
  }, { retrieval: true });

  assert.equal(result.protectedAnchorAudit?.protectedAnchorIntegrity ?? 0, 1, `${caseSpec.id}: literal anchors remain intact`);
  assert.ok((result.semanticAudit?.propositionCoverage ?? 0) >= 0.85, `${caseSpec.id}: proposition coverage stays above safety floor`);
  assert.ok((result.semanticAudit?.actionCoverage ?? 0) >= 0.75, `${caseSpec.id}: action coverage stays above safety floor`);
  assert.ok((result.semanticAudit?.polarityMismatches ?? 0) <= 1, `${caseSpec.id}: polarity mismatches stay bounded`);
}

const literalRiskMatrix = engine.buildSwapCadenceMatrix(DIAGNOSTIC_CORPUS.samples, {
  orderedPairs: DIAGNOSTIC_BATTERY.swapPairs.filter((caseSpec) => caseSpec.mode === 'swap-literal-risk'),
  flagshipPairs: [],
  strength: 0.82
});

assert.equal(literalRiskMatrix.fullMatrix.length, 24, 'literal-risk swap diagnostics include 24 ordered cases');
assert(
  literalRiskMatrix.fullMatrix.every((report) => report.semanticAuditSummary.protectedAnchorIntegrityMin === 1),
  'literal-risk swap diagnostics preserve protected anchors'
);

assert.ok(fs.existsSync(latestJsonPath), 'diagnostics JSON report exists');
assert.ok(fs.existsSync(latestMdPath), 'diagnostics Markdown report exists');

const latestReport = JSON.parse(fs.readFileSync(latestJsonPath, 'utf8'));
assert.equal(latestReport.sections.swapPairs.length, 72, 'diagnostics JSON report includes swap section');
assert.equal(latestReport.sections.maskCases.length, 24, 'diagnostics JSON report includes mask section');
assert.equal(latestReport.sections.trainerCases.length, 24, 'diagnostics JSON report includes trainer section');
assert.equal(latestReport.sections.retrievalCases.length, 16, 'diagnostics JSON report includes retrieval section');
assert.equal(latestReport.sections.falseNeighborCases.length, 24, 'diagnostics JSON report includes false-neighbor section');
assert.ok(latestReport.sampleAudit, 'diagnostics JSON report includes sample audit');
assert.ok(latestReport.personaAudit, 'diagnostics JSON report includes persona audit');
assert.equal(latestReport.sampleAudit.randomizerCorpusSize, DIAGNOSTIC_CORPUS.samples.length, 'sample audit uses the full diagnostics corpus');
assert.equal(latestReport.sampleAudit.uniqueResolvedProfileCount, DIAGNOSTIC_CORPUS.samples.length, 'sample audit resolves distinct profiles across the corpus');
assert.ok(Array.isArray(latestReport.sampleAudit.closestPairs), 'sample audit closest pairs serialize');
assert.ok(Array.isArray(latestReport.sampleAudit.exactProfileCollisions), 'sample audit exact collisions serialize');
assert.equal(latestReport.sampleAudit.exactProfileCollisions.length, 0, 'sample audit reports no exact profile collisions for the current corpus');
assert.equal(latestReport.sampleAudit.deckRandomizerSize, DIAGNOSTIC_CORPUS.deckRandomizerSampleIds.length, 'sample audit reports the live deck randomizer size');
assert.ok(latestReport.sampleAudit.deckRandomizerFamilyCount >= 8, 'sample audit reports at least 8 families in the live deck randomizer');
assert.ok(latestReport.sampleAudit.deckRandomizerPairedFamilyCount >= 6, 'sample audit reports at least 6 same-family contrast pairs in the live deck randomizer');
assert.ok(latestReport.sampleAudit.averageNearestFieldDistance >= 2.5, 'sample audit reports a widened deck nearest-field distance');
assert.ok(latestReport.sampleAudit.minNearestFieldDistance >= 2, 'sample audit reports a bounded minimum deck field distance');
assert.equal(latestReport.personaAudit.resolvedPersonaCount, 7, 'persona audit resolves all built-in personas');
assert.equal(latestReport.personaAudit.uniqueResolvedProfileCount, 7, 'persona audit resolves distinct built-in persona profiles');
assert.ok(Array.isArray(latestReport.personaAudit.closestPairs), 'persona audit closest pairs serialize');
assert.ok(Array.isArray(latestReport.personaAudit.missingRecipeSampleIds), 'persona audit missing recipe ids serialize');
assert.equal(latestReport.personaAudit.missingRecipeSampleIds.length, 0, 'persona audit reports no missing recipe sample ids for current built-ins');
assert.ok(latestReport.personaAudit.averageNearestFieldDistance >= 1.75, 'persona audit reports a widened average nearest field distance');
assert.ok(latestReport.personaAudit.minNearestFieldDistance >= 1.4, 'persona audit reports a materially separated minimum field distance');
assert.ok(latestReport.personaAudit.distinctOutputCheck?.allDistinct, 'persona audit distinct-output check stays true');
assert.ok(latestReport.workingDoctrine, 'diagnostics JSON report includes private EO-RFD working doctrine');
assert.ok(
  ['playable', 'warning', 'buffered', 'harbor-eligible'].includes(latestReport.workingDoctrine.state),
  'private EO-RFD state stays within the declared doctrine grammar'
);
assert.equal(typeof latestReport.workingDoctrine.blockedGenerativePassage, 'boolean', 'private EO-RFD blockedGenerativePassage is boolean');
assert.equal(typeof latestReport.workingDoctrine.actionBias, 'string', 'private EO-RFD actionBias is present');
assert.ok(latestReport.workingDoctrine.representativePairs, 'private EO-RFD representative pair summary exists');
assert.ok(Array.isArray(latestReport.workingDoctrine.representativePairs.selections), 'private EO-RFD representative selections are serialized');
assert.ok(latestReport.workingDoctrine.representativePairs.selections.length > 0, 'private EO-RFD representative selections stay populated');
assert.equal(typeof latestReport.workingDoctrine.representativePairs.bilateralVisibleRate, 'number', 'private EO-RFD representative visible rate is numeric');
assert.equal(typeof latestReport.workingDoctrine.representativePairs.bilateralNonTrivialRate, 'number', 'private EO-RFD representative non-trivial rate is numeric');

const latestMarkdown = fs.readFileSync(latestMdPath, 'utf8');
assert.ok(latestMarkdown.includes('## Sample Audit'), 'diagnostics Markdown report includes sample audit section');
assert.ok(latestMarkdown.includes('### Closest Sample Pairs'), 'diagnostics Markdown report includes closest sample pairs section');
assert.ok(latestMarkdown.includes('deck_randomizer_average_nearest_field_distance') || latestMarkdown.includes('average_nearest_field_distance'), 'diagnostics Markdown report includes field-distance spread details');
assert.ok(latestMarkdown.includes('## Persona Audit'), 'diagnostics Markdown report includes persona audit section');
assert.ok(latestMarkdown.includes('### Closest Persona Pairs'), 'diagnostics Markdown report includes closest persona pairs section');
assert.ok(latestMarkdown.includes('## Private EO-RFD Working State'), 'diagnostics Markdown report includes private EO-RFD working-state section');
assert.ok(latestMarkdown.includes('## Private EO-RFD Representative Pairs'), 'diagnostics Markdown report includes representative pair section');

console.log('diagnostics.test.mjs passed');
