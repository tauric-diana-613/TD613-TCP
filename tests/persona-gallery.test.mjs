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
  resolvedPersonas.every((persona) => persona.recipeResolution && (persona.recipeResolution.entries || []).length > 0),
  'each built-in mask preserves diagnostics recipe provenance'
);
assert.ok(
  resolvedPersonas.every((persona) => persona.diagnosticSpecimen && persona.diagnosticSpecimen.swatch && persona.diagnosticSpecimen.fieldSpanLine),
  'each built-in mask resolves a diagnostics-backed specimen swatch and field span'
);
assert.equal(
  new Set(resolvedPersonas.map((persona) => persona.diagnosticSpecimen?.swatch)).size,
  resolvedPersonas.length,
  'each built-in mask exposes a distinct diagnostics specimen swatch'
);
assert.equal(
  resolvedPersonas.flatMap((persona) => persona.recipeResolution?.missingSampleIds || []).length,
  0,
  'built-in recipe blends resolve against the full diagnostics corpus without missing sample ids'
);
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
assert.equal(
  new Set(resolvedPersonas.map((persona) => JSON.stringify(persona.profile))).size,
  resolvedPersonas.length,
  'each built-in mask resolves to a distinct stylometric fingerprint'
);

const personaFieldDistances = [];
for (let leftIndex = 0; leftIndex < resolvedPersonas.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < resolvedPersonas.length; rightIndex += 1) {
    const left = resolvedPersonas[leftIndex];
    const right = resolvedPersonas[rightIndex];
    const fit = engine.compareTexts('', '', {
      profileA: left.profile,
      profileB: right.profile
    });
    const axisDistance = engine.cadenceAxisVector(left.profile).reduce((sum, axis, index) =>
      sum + Math.abs(Number(axis.normalized || 0) - Number(engine.cadenceAxisVector(right.profile)[index]?.normalized || 0)),
    0);
    const heatmapLeft = engine.cadenceHeatmap(left.diagnosticSpecimen?.text || '');
    const heatmapRight = engine.cadenceHeatmap(right.diagnosticSpecimen?.text || '');
    let heatmapDistance = 0;
    for (let rowIndex = 0; rowIndex < Math.max(heatmapLeft.matrix.length, heatmapRight.matrix.length); rowIndex += 1) {
      const rowA = Array.isArray(heatmapLeft.matrix[rowIndex]) ? heatmapLeft.matrix[rowIndex] : [];
      const rowB = Array.isArray(heatmapRight.matrix[rowIndex]) ? heatmapRight.matrix[rowIndex] : [];
      for (let colIndex = 0; colIndex < Math.max(rowA.length, rowB.length); colIndex += 1) {
        heatmapDistance += Math.abs(Number(rowA[colIndex] || 0) - Number(rowB[colIndex] || 0));
      }
    }
    personaFieldDistances.push(
      Number((
        (fit.sentenceDistance || 0) +
        (fit.spreadDistance || 0) +
        (fit.punctDistance || 0) +
        (fit.contractionDistance || 0) +
        (fit.recurrenceDistance || 0) +
        (fit.directnessDistance || 0) +
        (fit.abstractionDistance || 0) +
        (fit.registerDistance || 0) +
        axisDistance +
        heatmapDistance
      ).toFixed(4))
    );
  }
}
assert.ok(
  Math.min(...personaFieldDistances) >= 1.4,
  'built-in masks keep a materially separated field distance across the 7-axis plus heatmap audit'
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

const sparkPersona = resolvedPersonas.find((persona) => persona.id === 'spark');
const sparkBuildingAccess = buildMaskTransformationResult(engine, {
  comparisonText: buildingAccess.text,
  lock,
  persona: sparkPersona
});
assert.ok(sparkBuildingAccess, 'Spark resolves a building-access mask result');
assert.notEqual(
  sparkBuildingAccess.maskedText,
  buildingAccess.text,
  'Spark no longer collapses the building-access fixture back to source text'
);
assert.equal(
  sparkBuildingAccess.transfer.transferClass,
  'structural',
  'Spark lands a structural mask shift on the building-access fixture'
);
assert.equal(
  sparkBuildingAccess.transfer.protectedAnchorAudit?.protectedAnchorIntegrity,
  1,
  'Spark preserves protected anchors on the building-access fixture'
);
assert.ok(
  sparkBuildingAccess.maskedText.includes('08:19') &&
    sparkBuildingAccess.maskedText.includes('118') &&
    /\b(?:door 3|d3)\b/i.test(sparkBuildingAccess.maskedText),
  'Spark preserves the protected building-access literals while shifting cadence'
);

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
  Math.abs((results.get('spark').deltaToLock?.traceability || 0) - (results.get('operator').deltaToLock?.traceability || 0)) >= 0.005,
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
