import assert from 'assert';

import defaults from '../app/data/defaults.js';
import personas from '../app/data/personas.js';
import * as engine from '../app/engine/stylometry.js';
import {
  buildCadenceLockRecord,
  buildLockDossier,
  buildMaskTransformationResult,
  resolvePersonaCatalog
} from '../app/toys/persona-gallery/model.js';

const sampleLibrary = defaults.sample_library || [];
const sampleById = (id) => sampleLibrary.find((sample) => sample.id === id);

const institutionalMemo = sampleById('institutional-memo');
const recursiveDebrief = sampleById('recursive-debrief');
const witnessStatement = sampleById('witness-statement');

assert.ok(institutionalMemo, 'institutional-memo sample is present');
assert.ok(recursiveDebrief, 'recursive-debrief sample is present');
assert.ok(witnessStatement, 'witness-statement sample is present');

const resolvedPersonas = resolvePersonaCatalog(engine, personas, sampleLibrary);
assert.equal(resolvedPersonas.length, 7, 'seven built-in masks resolve for the gallery');
assert.ok(resolvedPersonas.every((persona) => persona.profile && persona.mod), 'each built-in mask resolves to a concrete profile-backed shell');

const lock = buildCadenceLockRecord(engine, {
  name: 'Archive Home',
  corpusText: `${recursiveDebrief.text}\n\n${witnessStatement.text}`
});

assert.equal(lock.source, 'gallery-lock', 'cadence locks are tagged as gallery locks');
assert.equal(lock.samples.length, 2, 'blank-line corpus locking preserves separate samples');
assert.ok(lock.selfSimilarity.meanTraceability > 0.4, 'self traceability is populated for the cadence lock');
assert.ok(lock.fingerprintSummary.stickinessScore > 0, 'fingerprint summary carries a non-zero stickiness score');

const dossier = buildLockDossier(engine, lock);
assert.equal(dossier.stats.sampleCount, 2, 'lock dossier reports the correct sample count');
assert.ok(dossier.functionWordSnapshot.length > 0, 'lock dossier exposes function-word snapshots');
assert.ok(dossier.riskInterpretation.length >= 4, 'lock dossier includes a deep risk interpretation');

const comparisonText = institutionalMemo.text;
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
  assert.equal(result.transfer.semanticAudit?.propositionCoverage, 1, `${persona.id}: proposition coverage remains intact`);
  assert.equal(result.transfer.protectedAnchorAudit?.protectedAnchorIntegrity, 1, `${persona.id}: protected anchors remain intact`);
}

const uniqueOutputs = new Set([...results.values()].map((result) => result.maskedText));
assert.equal(uniqueOutputs.size, resolvedPersonas.length, 'each built-in mask produces a distinct transformed output on the same comparison text');

const outputProfiles = Object.fromEntries(
  [...results.entries()].map(([id, result]) => [id, engine.extractCadenceProfile(result.maskedText)])
);

assert.ok(
  outputProfiles.archivist.avgSentenceLength >= outputProfiles.spark.avgSentenceLength + 8,
  'Archivist holds a much longer sentence span than Spark on the same source text'
);
assert.ok(
  outputProfiles['methods-editor'].avgSentenceLength >= outputProfiles.operator.avgSentenceLength + 15,
  'Methods Editor diverges sharply from Operator on sentence span'
);
assert.ok(
  outputProfiles.spark.contractionDensity >= outputProfiles.archivist.contractionDensity,
  'Spark keeps at least as much contraction pressure as Archivist'
);
assert.ok(
  Math.abs((results.get('spark').deltaToLock?.traceability || 0) - (results.get('operator').deltaToLock?.traceability || 0)) >= 0.02,
  'different masks produce meaningfully different traceability deltas against the same lock'
);
assert.ok(
  outputProfiles['cross-examiner'].avgSentenceLength <= outputProfiles.archivist.avgSentenceLength - 8,
  'Cross-Examiner stays much more clipped than Archivist on the same source text'
);
assert.ok(
  outputProfiles.matron.avgSentenceLength >= outputProfiles.spark.avgSentenceLength + 8,
  'Matron lands a more sheltering longer-line span than Spark on the same source text'
);
assert.ok(
  (results.get('cross-examiner').deltaToLock?.traceability || 0) < (results.get('matron').deltaToLock?.traceability || 0),
  'Cross-Examiner and Matron create meaningfully different home-trace pressure against the same lock'
);

console.log('persona-gallery.test.mjs passed');
