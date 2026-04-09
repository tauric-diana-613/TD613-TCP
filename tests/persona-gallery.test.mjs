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
assert.equal(
  sparkBuildingAccess.transfer.transferClass,
  'rejected',
  'Spark refuses the building-access fixture when Aperture protocols detect a counter-recognition surface'
);
assert.equal(
  sparkBuildingAccess.transfer.protectedAnchorAudit?.protectedAnchorIntegrity,
  1,
  'Spark preserves protected anchors on the building-access fixture'
);
assert.ok(
  sparkBuildingAccess.maskedText === buildingAccess.text &&
    (sparkBuildingAccess.transfer.notes || []).some((note) => /fell back to the source text/i.test(note)),
  'Spark keeps the building-access fixture unchanged when Aperture routes the record back to source'
);

const sparkPackageHandoff = buildMaskTransformationResult(engine, {
  comparisonText: packageHandoff.text,
  lock,
  persona: sparkPersona
});
assert.ok(sparkPackageHandoff, 'Spark resolves a package-handoff mask result');
assert.notEqual(
  sparkPackageHandoff.maskedText,
  packageHandoff.text,
  'Spark still lands a visible shift on a safer handoff fixture'
);
assert.equal(
  sparkPackageHandoff.transfer.transferClass,
  'structural',
  'Spark keeps a structural mask lane on the package-handoff fixture'
);
assert.ok(
  sparkPackageHandoff.maskedText.includes('6:41 PM') &&
    sparkPackageHandoff.maskedText.includes('Unit 2B'),
  'Spark preserves the protected handoff literals while shifting cadence'
);

const outputProfiles = Object.fromEntries(
  [...results.entries()].map(([id, result]) => [id, engine.extractCadenceProfile(result.maskedText)])
);

assert.ok(
  outputProfiles.archivist.avgSentenceLength >= outputProfiles.spark.avgSentenceLength + 1,
  'Archivist still holds a longer sentence span than Spark on the same source text'
);
assert.ok(
  outputProfiles['methods-editor'].avgSentenceLength >= outputProfiles.operator.avgSentenceLength,
  'Methods Editor does not collapse below Operator on sentence span'
);
assert.ok(
  results.get('spark').maskedText !== comparisonText &&
    !/apparently/i.test(results.get('spark').maskedText),
  'Spark still lands a visible mask surface without intrusive discourse junk'
);
assert.ok(
  Math.abs((results.get('spark').deltaToLock?.traceability || 0) - (results.get('operator').deltaToLock?.traceability || 0)) >= 0.005,
  'different masks produce meaningfully different traceability deltas against the same lock'
);
assert.ok(
  outputProfiles['cross-examiner'].avgSentenceLength <= outputProfiles.archivist.avgSentenceLength - 3,
  'Cross-Examiner stays materially more clipped than Archivist on the same source text'
);
assert.ok(
  outputProfiles.matron.avgSentenceLength >= outputProfiles.spark.avgSentenceLength + 1,
  'Matron still lands a more sheltering longer-line span than Spark on the same source text'
);
assert.ok(
  Math.abs((results.get('cross-examiner').deltaToLock?.traceability || 0) - (results.get('matron').deltaToLock?.traceability || 0)) >= 0.03,
  'Cross-Examiner and Matron create meaningfully different home-trace pressure against the same lock'
);
assert.ok(
  [...results.values()].filter((result) =>
    (result.transfer.changedDimensions || []).some((dimension) => dimension !== 'punctuation-shape') ||
    (result.transfer.lexemeSwaps || []).length > 0
  ).length >= 5,
  'most built-in masks land visible non-punctuation movement on the maintained comparison fixture'
);

const sparkRegressionText = `I am pretty content in life. Don't worry about where you came from. Keep doing what you're doing.

Don't stop doing martial arts. I needed that. I got into a lot of trouble without martial arts. And I blame mom for taking that away from me.

I want to say hi to him. Call him. Meet him I guess is what I'm trying to say. "Tell me more about yourself" lol is what I would say, you know? That's someone you should get more familiar with. It's an everchasing experience. We have amnesia as people.`;
const sparkRegression = buildMaskTransformationResult(engine, {
  comparisonText: sparkRegressionText,
  lock,
  persona: sparkPersona
});
assert.ok(sparkRegression, 'Spark resolves the regression sample');
assert.ok(
  !/apparently/i.test(sparkRegression.maskedText),
  'Spark mask rescue strips intrusive discourse markers from the Homebase regression sample'
);
assert.ok(
  sparkRegression.shiftPreview.every((row) => {
    const source = String(row.source || '').toLowerCase();
    const output = String(row.output || '').toLowerCase();
    return !source || !output || source.includes('worry about where you came from') === output.includes('worry about where you came from');
  }),
  'Spark shift preview keeps sentence-level alignment legible on the regression sample'
);
assert.ok(
  !/tell hi|trying to tell/i.test(sparkRegression.maskedText),
  'Spark mask rescue avoids the earlier lexical glitch on the regression sample'
);

console.log('persona-gallery.test.mjs passed');
