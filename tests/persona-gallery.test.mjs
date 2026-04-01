import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import personas from '../app/data/personas.js';
import * as engine from '../app/engine/stylometry.js';
import { DIAGNOSTIC_SAMPLE_LIBRARY } from '../app/data/diagnostics.js';
import {
  buildCadenceLockRecord,
  buildLockDossier,
  buildMaskTransformationResult,
  resolvePersonaCatalog
} from '../app/toys/persona-gallery/model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const sampleLibrary = DIAGNOSTIC_SAMPLE_LIBRARY;
const sampleById = (id) => sampleLibrary.find((sample) => sample.id === id);

const buildingAccess = sampleById('building-access-formal-record');
const overworkDebrief = sampleById('overwork-debrief-professional-message');
const packageHandoff = sampleById('package-handoff-formal-record');
const customerSupport = sampleById('customer-support-formal-record');

assert.ok(buildingAccess, 'building-access-formal-record sample is present');
assert.ok(overworkDebrief, 'overwork-debrief-professional-message sample is present');
assert.ok(packageHandoff, 'package-handoff-formal-record sample is present');
assert.ok(customerSupport, 'customer-support-formal-record sample is present');

const resolvedPersonas = resolvePersonaCatalog(engine, personas, sampleLibrary);
assert.equal(resolvedPersonas.length, 7, 'seven built-in masks resolve for the gallery');
assert.ok(resolvedPersonas.every((persona) => persona.profile && persona.mod), 'each built-in mask resolves to a concrete profile-backed shell');
assert.ok(
  resolvedPersonas.every((persona) => persona.family && persona.tagline && persona.voicePromise && persona.fieldUse && persona.riskTell && persona.frameTone),
  'each built-in mask carries the upgraded psychomystery metadata'
);
assert.ok(
  resolvedPersonas.every((persona) => persona.portrait && typeof persona.portrait.alt === 'string'),
  'each built-in mask resolves with portrait metadata'
);
assert.ok(
  resolvedPersonas.every((persona) => persona.portrait?.src && fs.existsSync(path.join(repoRoot, 'app', persona.portrait.src))),
  'each built-in mask points at a real local portrait asset'
);

const lock = buildCadenceLockRecord(engine, {
  name: 'Archive Home',
  corpusText: `${overworkDebrief.text}\n\n${packageHandoff.text}`
});

assert.equal(lock.source, 'gallery-lock', 'cadence locks are tagged as gallery locks');
assert.equal(lock.samples.length, 2, 'blank-line corpus locking preserves separate samples');
assert.ok(lock.selfSimilarity.meanTraceability > 0.4, 'self traceability is populated for the cadence lock');
assert.ok(lock.fingerprintSummary.stickinessScore > 0, 'fingerprint summary carries a non-zero stickiness score');

const dossier = buildLockDossier(engine, lock);
assert.equal(dossier.stats.sampleCount, 2, 'lock dossier reports the correct sample count');
assert.ok(dossier.functionWordSnapshot.length > 0, 'lock dossier exposes function-word snapshots');
assert.ok(dossier.riskInterpretation.length >= 4, 'lock dossier includes a deep risk interpretation');

const comparisonText = customerSupport.text;
const results = new Map();
for (const persona of resolvedPersonas) {
  const result = buildMaskTransformationResult(engine, {
    comparisonText,
    lock,
    persona
  });
  results.set(persona.id, result);
  assert.ok(result.maskedText.trim().length > 0, `${persona.id}: masked output is populated`);
  assert.ok(result.rawToLock && result.maskedToLock, `${persona.id}: raw and masked lock comparisons are available`);
  assert.ok(result.whatMovedSummary && result.whatMovedSummary.length > 0, `${persona.id}: movement summary is populated`);
  assert.ok(Array.isArray(result.shiftPreview) && result.shiftPreview.length > 0, `${persona.id}: sentence-level shift preview is populated`);
  assert.ok((result.transfer.semanticAudit?.propositionCoverage ?? 0) >= 0.9, `${persona.id}: proposition coverage remains retrieval-safe`);
  assert.equal(result.transfer.protectedAnchorAudit?.protectedAnchorIntegrity, 1, `${persona.id}: protected anchors remain intact`);
}

const uniqueOutputs = new Set([...results.values()].map((result) => result.maskedText));
assert.equal(uniqueOutputs.size, resolvedPersonas.length, 'each built-in mask produces a distinct transformed output on the same comparison text');

const outputProfiles = Object.fromEntries(
  [...results.entries()].map(([id, result]) => [id, engine.extractCadenceProfile(result.maskedText)])
);

assert.ok(
  outputProfiles.archivist.avgSentenceLength >= outputProfiles.spark.avgSentenceLength + 6,
  'Archivist holds a much longer sentence span than Spark on the same source text'
);
assert.ok(
  outputProfiles['methods-editor'].avgSentenceLength >= outputProfiles.operator.avgSentenceLength + 4,
  'Methods Editor diverges clearly from Operator on sentence span'
);
assert.ok(
  outputProfiles.spark.contractionDensity >= outputProfiles.archivist.contractionDensity,
  'Spark keeps at least as much contraction pressure as Archivist'
);
assert.ok(
  Math.abs((results.get('spark').deltaToLock?.traceability || 0) - (results.get('operator').deltaToLock?.traceability || 0)) >= 0.01,
  'different masks produce meaningfully different traceability deltas against the same lock'
);
assert.ok(
  outputProfiles['cross-examiner'].avgSentenceLength <= outputProfiles.archivist.avgSentenceLength - 6,
  'Cross-Examiner stays much more clipped than Archivist on the same source text'
);
assert.ok(
  outputProfiles.matron.avgSentenceLength >= outputProfiles.spark.avgSentenceLength + 8,
  'Matron lands a more sheltering longer-line span than Spark on the same source text'
);
assert.ok(
  Math.abs((results.get('cross-examiner').deltaToLock?.traceability || 0) - (results.get('matron').deltaToLock?.traceability || 0)) >= 0.05,
  'Cross-Examiner and Matron create meaningfully different home-trace pressure against the same lock'
);
assert.ok(
  [...results.values()].filter((result) =>
    (result.transfer.changedDimensions || []).some((dimension) => dimension !== 'punctuation-shape') ||
    (result.transfer.lexemeSwaps || []).length > 0
  ).length >= 5,
  'most built-in masks land visible non-punctuation movement on the maintained comparison fixture'
);

console.log('persona-gallery.test.mjs passed');
