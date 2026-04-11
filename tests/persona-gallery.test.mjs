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
const normalizeComparable = (text = '') => String(text || '')
  .replace(/\r\n/g, '\n')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();
const normalizeMovementComparable = (text = '') => String(text || '')
  .replace(/\r\n/g, '\n')
  .toLowerCase()
  .replace(/(?:\bi'm\b)/g, 'i am')
  .replace(/(?:\bi've\b)/g, 'i have')
  .replace(/(?:\bit's\b)/g, 'it is')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const hasDuplicatedSourceReplay = (source = '', output = '') => {
  const normalizedSource = normalizeComparable(source);
  const normalizedOutput = normalizeComparable(output);
  if (!normalizedSource || !normalizedOutput || normalizedSource === normalizedOutput) {
    return false;
  }
  return normalizedOutput.indexOf(normalizedSource) !== -1 &&
    normalizedOutput.indexOf(normalizedSource, normalizedSource.length) !== -1;
};

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
const reconstructRegisteredText = (result) =>
  (result.registeredSegments || []).map((paragraph) => paragraph.text).join('\n\n');
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
  assert.ok(Array.isArray(result.shiftPreview), `${persona.id}: shift preview remains an array surface`);
  assert.ok((result.transfer.semanticAudit?.propositionCoverage ?? 0) >= 0.9, `${persona.id}: proposition coverage remains retrieval-safe`);
  assert.ok((result.transfer.protectedAnchorAudit?.protectedAnchorIntegrity ?? 0) >= 0.98, `${persona.id}: protected anchors remain materially intact`);
  assert.ok(typeof result.apertureOutcome === 'string', `${persona.id}: Aperture outcome is attached`);
  assert.ok(result.apertureAudit && result.apertureAudit.observedRegime === 'PRCS-A', `${persona.id}: anti-PRCS-A audit is attached`);
  assert.equal(result.apertureAudit.instrumentRole, 'counter-tool', `${persona.id}: audit preserves counter-tool role`);
  assert.ok(typeof result.movementConfidence === 'number', `${persona.id}: movement confidence is attached`);
  assert.ok(result.previewAlignment && typeof result.previewAlignment.ratio === 'number', `${persona.id}: preview alignment is attached`);
  assert.ok(result.contactHonesty && typeof result.contactHonesty.line === 'string', `${persona.id}: contact honesty surface is attached`);
  assert.ok(typeof result.toolabilityHeadline === 'string' && result.toolabilityHeadline.length > 0, `${persona.id}: toolability headline is attached`);
  assert.ok(result.toolabilityAudit && typeof result.toolabilityAudit.toolabilityScore === 'number', `${persona.id}: toolability audit is attached`);
  assert.ok(result.personaSeparationAudit && typeof result.personaSeparationAudit.score === 'number', `${persona.id}: persona separation audit is attached`);
  assert.ok(Array.isArray(result.toolabilityWarnings), `${persona.id}: toolability warnings are attached`);
  assert.ok(Array.isArray(result.registeredSegments) && result.registeredSegments.length > 0, `${persona.id}: registered paragraphs are attached`);
  assert.ok(Array.isArray(result.segmentLedger) && result.segmentLedger.length > 0, `${persona.id}: segment ledger is attached`);
  assert.equal(result.maskedText, result.registeredMaskedText, `${persona.id}: maskedText is the registered counter-record`);
  assert.equal(result.maskedText, reconstructRegisteredText(result), `${persona.id}: maskedText is built from registered segments`);
  assert.ok(
    result.previewAlignment.withheld ? result.shiftPreview.length === 0 : true,
    `${persona.id}: preview rows are withheld instead of faked when alignment is not registerable`
  );
  assert.equal(
    result.contactHonesty.line,
    result.toolabilityHeadline,
    `${persona.id}: the main Homebase honesty line now uses the operator-facing toolability headline`
  );
}

assert.ok(
  [...results.values()].every((result) =>
    /\bsupport\b/i.test(result.maskedText) &&
    /\baccount\b/i.test(result.maskedText) &&
    /\breview\b/i.test(result.maskedText)
  ),
  'formal customer-support records preserve witness anchors instead of aliasing them away'
);
assert.ok(
  [...results.values()].every((result) => !/\bstory\b|\bhelp\b|\bcheck\b/i.test(result.maskedText)),
  'formal customer-support records do not drift into ontology-near alias substitutions'
);

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
  'Spark keeps the building-access fixture visible instead of collapsing it back to source'
);
assert.equal(
  sparkBuildingAccess.transfer.protectedAnchorAudit?.protectedAnchorIntegrity >= 0.95,
  true,
  'Spark keeps the building-access witness anchors materially intact on the counter-recognition fixture'
);
assert.ok(
  /Door 3/i.test(sparkBuildingAccess.maskedText) &&
    /West Annex/i.test(sparkBuildingAccess.maskedText),
  'Spark keeps the building-access witness anchors visible on the counter-recognition fixture'
);
assert.notEqual(
  sparkBuildingAccess.apertureOutcome,
  'source-rerouted',
  'Spark exposes warning-first registration instead of doctrinal source reroute on the building-access fixture'
);
assert.ok(
  sparkBuildingAccess.apertureAudit.warningSignals.includes('counter-recognition-pressure'),
  'Spark surfaces counter-recognition pressure as an audit warning on the building-access fixture'
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
assert.ok(
  sparkPackageHandoff.apertureOutcome === 'projected' || sparkPackageHandoff.apertureOutcome === 'repaired',
  'Spark exposes a projected Aperture outcome on the safer handoff fixture'
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
  !/tell hi|trying to tell|i would explain|i would tell|we've amnesia/i.test(sparkRegression.maskedText),
  'Spark mask rescue avoids the earlier lexical glitch on the regression sample'
);
assert.ok(
  !hasDuplicatedSourceReplay(sparkRegression.rawText, sparkRegression.maskedText),
  'Spark regression output does not duplicate or concatenate the source passage'
);

const regressionMaskResults = ['spark', 'matron', 'undertow', 'archivist', 'cross-examiner']
  .map((id) => {
    const persona = resolvedPersonas.find((entry) => entry.id === id);
    return buildMaskTransformationResult(engine, {
      comparisonText: sparkRegressionText,
      lock,
      persona
    });
  });

assert.ok(
  regressionMaskResults.every((result) => !hasDuplicatedSourceReplay(result.rawText, result.maskedText)),
  'major built-in masks never duplicate or append the source passage on the conversational regression sample'
);
assert.ok(
  regressionMaskResults.every((result) => result.maskedText === reconstructRegisteredText(result)),
  'major built-in masks publish only the registered counter-record on the conversational regression sample'
);
assert.ok(
  regressionMaskResults.every((result) => result.contactHonesty.renderSafe !== false),
  'major built-in masks keep the conversational regression sample render-safe for Homebase'
);
assert.ok(
  regressionMaskResults.every((result) =>
    result.previewAlignment.withheld ? result.shiftPreview.length === 0 : result.previewAlignment.trustworthy
  ),
  'major built-in masks either publish an aligned preview or explicitly withhold it'
);
assert.ok(
  regressionMaskResults.every((result) => result.apertureOutcome !== 'source-rerouted'),
  'the conversational regression sample now stays visible across the major masks unless a catastrophic generator fault occurs'
);
assert.ok(
  regressionMaskResults.every((result) =>
    ['strong-rewrite', 'cadence-rewrite'].includes(result.registeredTransformClass)
  ),
  'the conversational regression sample lands a real rewrite across all five major masks'
);
assert.ok(
  new Set(regressionMaskResults.map((result) => result.maskedText)).size >= 4,
  'major regression outputs keep multiple distinct registered surfaces instead of collapsing into a single lane'
);
assert.ok(
  regressionMaskResults.every((result) => (result.transfer.protectedAnchorAudit?.protectedAnchorIntegrity ?? 0) >= 0.95),
  'major built-in masks keep protected anchors materially intact across the conversational regression sample'
);
assert.ok(
  regressionMaskResults.every((result) => result.apertureAudit.warningSignals.includes('counter-recognition-pressure')),
  'major built-in masks surface counter-recognition as an audit warning instead of a suppression trigger'
);
assert.ok(
  regressionMaskResults.every((result) =>
    !/\btell hi\b|\btrying to tell\b|\bstory\b|\bhelp\b|\bcheck\b/i.test(result.maskedText)
  ),
  'major built-in masks avoid the known alias and lexical-drift failures on the conversational regression sample'
);

const proseSceneRegressionText = `I must keep reminding myself that this will work. Nobody I’ve ever shared the same room with has ever seen Cheers! Things are moving too fast to dissuade myself of this. On the ready, I pull out the next pack of Crushes, turn them over and spank its bottom like a bad boy. Twirl of the plastic, and bite of the tip, with an excited thumb that sparks but keeps missing the gas pedal. Two gulps: from the nerves, and, to placate them, from the coffee. The wall breaks with a shuddering, misanthropic swing. It’s the middle of the night, and suddenly, I’m not alone.`;
const proseSceneResults = ['spark', 'matron', 'undertow', 'archivist', 'cross-examiner']
  .map((id) => {
    const persona = resolvedPersonas.find((entry) => entry.id === id);
    return buildMaskTransformationResult(engine, {
      comparisonText: proseSceneRegressionText,
      lock,
      persona
    });
  });

assert.ok(
  proseSceneResults.every((result) => result.sourceClass === 'narrative-scene'),
  'the new prose regression sample resolves as a narrative-scene source class'
);
assert.ok(
  proseSceneResults.every((result) => !hasDuplicatedSourceReplay(result.rawText, result.maskedText)),
  'major built-in masks never replay or concatenate the prose regression sample'
);
assert.ok(
  proseSceneResults.filter((result) => result.registeredTransformClass === 'strong-rewrite' || result.registeredTransformClass === 'cadence-rewrite').length >= 4,
  'at least four of the five major built-in masks land a strong or cadence rewrite on the prose regression sample'
);
assert.ok(
  ['strong-rewrite', 'cadence-rewrite'].includes(proseSceneResults[0].registeredTransformClass),
  'spark no longer collapses the prose regression sample into a shallow hold or surface-only lane'
);
assert.ok(
  proseSceneResults.every((result) => result.registeredTransformClass !== 'surface-only' || normalizeMovementComparable(result.rawText) === normalizeMovementComparable(result.maskedText)),
  'surface-only classification is reserved for truly source-close prose outputs'
);
assert.ok(
  new Set(proseSceneResults.map((result) => result.maskedText)).size >= 4,
  'the prose regression sample lands materially distinct registered outputs across the major masks'
);
assert.ok(
  proseSceneResults.every((result) => (result.apertureSummary?.bullets || []).length <= 4),
  'What Clung summary bullets stay capped in the main Homebase surface'
);
assert.ok(
  proseSceneResults.every((result) => (result.apertureSummary?.headline || '') === result.toolabilityHeadline),
  'the main Homebase headline now mirrors the operator-facing toolability headline'
);
assert.ok(
  proseSceneResults.every((result) => {
    const drawerItems = result.apertureSummary?.drawerItems || [];
    return drawerItems.length === new Set(drawerItems).size;
  }),
  'Aperture drawer items stay deduplicated instead of flooding the main surface with repeated notes'
);
assert.ok(
  proseSceneResults.every((result) => Number(result.toolabilityAudit?.toolabilityScore || 0) >= 0.5),
  'the prose regression sample clears the minimum toolability floor on landed outputs'
);
assert.ok(
  proseSceneResults.every((result) => Number(result.personaSeparationAudit?.score || 0) >= 0.38),
  'the prose regression sample keeps bounded persona separation across the major masks'
);
assert.ok(
  proseSceneResults.every((result) => typeof result.previewAlignment?.reason === 'string'),
  'preview alignment now includes an explicit reason code'
);
assert.ok(
  proseSceneResults.every((result) =>
    result.previewAlignment.reason === 'shown' ||
    result.shiftPreview.length === 0
  ),
  'preview rows are only published when the aligned sentence preview is actually shown'
);
assert.ok(
  proseSceneResults.every((result) =>
    !/\bNobody one\b|\bsame a room\b|\btell hi\b|\btrying to tell\b/i.test(result.maskedText)
  ),
  'the prose regression sample avoids the known malformed rewrite artifacts'
);

console.log('persona-gallery.test.mjs passed');
