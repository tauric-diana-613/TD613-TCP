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

console.log('diagnostics.test.mjs passed');
