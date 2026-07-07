import assert from 'assert';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DIAGNOSTIC_BATTERY,
  DIAGNOSTIC_CORPUS,
  DIAGNOSTIC_CORPUS_BY_ID
} from '../app/data/diagnostics.js';
import { buildAnnexDiagnostics } from '../scripts/lib/annex-diagnostics.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const diagnosticsScriptSource = readFileSync(new URL('../scripts/run-diagnostics-battery.mjs', import.meta.url), 'utf8');

assert.equal(DIAGNOSTIC_CORPUS.families.length, 19, 'diagnostic corpus exposes 19 families');
assert.equal(DIAGNOSTIC_CORPUS.samples.length, 76, 'diagnostic corpus exposes 76 samples');
assert.equal(DIAGNOSTIC_CORPUS.promotedSampleIds.length, 24, 'diagnostic corpus exposes 24 promoted deck samples');
assert.ok(DIAGNOSTIC_CORPUS.deckRandomizerSampleIds.length >= 24, 'diagnostic corpus exposes an expanded deck randomizer sample set');
assert.equal(DIAGNOSTIC_BATTERY.swapPairs.length, 102, 'diagnostic battery exposes 102 ordered swap pairs');
assert.equal(DIAGNOSTIC_BATTERY.maskCases.length, 35, 'diagnostic battery exposes 35 mask cases');
assert.equal(DIAGNOSTIC_BATTERY.trainerCases.length, 35, 'diagnostic battery exposes 35 trainer cases');
assert.equal(DIAGNOSTIC_BATTERY.retrievalCases.length, 18, 'diagnostic battery exposes 18 retrieval cases');
assert.equal(DIAGNOSTIC_BATTERY.falseNeighborCases.length, 32, 'diagnostic battery exposes 32 false-neighbor cases');
assert.ok(diagnosticsScriptSource.includes("'hushCases'"), 'diagnostics runner declares a Hush section');
assert.ok(diagnosticsScriptSource.includes('--section='), 'diagnostics runner supports section staging');
assert.ok(diagnosticsScriptSource.includes('--assemble-only'), 'diagnostics runner supports release assembly from staged sections');

for (const family of DIAGNOSTIC_CORPUS.families) {
  const samples = DIAGNOSTIC_CORPUS.samples.filter((sample) => sample.familyId === family.id);
  assert.equal(samples.length, 4, `${family.id}: every family contains exactly four variants`);
  assert.deepEqual(
    samples.map((sample) => sample.variant).sort(),
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

const annexes = buildAnnexDiagnostics(repoRoot);
assert.ok(annexes.aperture, 'diagnostics smoke builds Aperture annex diagnostics');
assert.ok(annexes.aperture.passed, 'Aperture annex diagnostics pass in smoke tier');
assert.equal(annexes.aperture.file, 'app/aperture/tool.html', 'Aperture annex diagnostics inspect the canonical tool body');

console.log('diagnostics.test.mjs passed');
