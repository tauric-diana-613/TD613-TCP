import assert from 'assert';

import * as engine from '../app/engine/stylometry.js';
import defaults from '../app/data/defaults.js';
import { buildCorpusExtraction, splitCorpusSamples } from '../app/toys/persona-trainer/extractor.js';
import { buildPersonaPrompt } from '../app/toys/persona-trainer/translator.js';
import { validateCandidateAgainstFingerprint } from '../app/toys/persona-trainer/validator.js';
import { buildPersonaSpec } from '../app/toys/persona-trainer/persona.js';

const sampleLibrary = defaults.sample_library || [];
const buildingAccess = sampleLibrary.find((sample) => sample.id === 'building-access-formal-record');
assert.ok(buildingAccess, 'building-access-formal-record sample is present');

const splitSamples = splitCorpusSamples(`${buildingAccess.text}\n\n${buildingAccess.text}`);
assert.equal(splitSamples.length, 2, 'blank-line corpus splitting returns two samples');

const extraction = buildCorpusExtraction(engine, buildingAccess.text);
assert.equal(extraction.stats.sampleCount, 1, 'single pasted sample still extracts a corpus fingerprint');
assert.ok(extraction.targetProfile.avgSentenceLength > 0, 'target profile carries scalar means');
assert.ok(extraction.selfSimilarity.meanSimilarity === 1, 'single-sample self-similarity defaults to identity');

const promptBuild = buildPersonaPrompt(extraction.fingerprint, {
  name: 'Lab Persona',
  referenceSamples: extraction.samples
});
assert.ok(promptBuild.systemPrompt.includes('Lab Persona'), 'prompt build carries the persona name');
assert.ok(promptBuild.promptConstraints.length >= 4, 'prompt build exposes structured constraints');

const validation = validateCandidateAgainstFingerprint(engine, buildingAccess.text, extraction, {
  personaName: 'Lab Persona',
  sampleLibrary
});
assert.equal(validation.pass, true, 'identical sample validates successfully');
assert.equal(validation.retrievalContract.retrievalPass, true, 'retrieval contract passes for the identical sample');
assert.ok(validation.scalarSummary.aggregate >= 0.68, 'scalar fidelity remains above export threshold');
assert.ok(validation.semanticAuditSummary.propositionCoverageMin >= 0.85, 'semantic audit floor is preserved');
assert.equal(validation.protectedAnchorSummary.integrityMin, 1, 'protected anchors remain intact');

const personaSpec = buildPersonaSpec({
  name: 'Lab Persona',
  extraction,
  promptBuild,
  validation,
  buildMod: engine.cadenceModFromProfile
});

assert.equal(personaSpec.browserPersona.source, 'trainer', 'browser persona is tagged as a trainer persona');
assert.equal(personaSpec.browserPersona.name, 'Lab Persona', 'browser persona preserves the requested name');
assert.ok(personaSpec.browserPersona.profile.avgSentenceLength > 0, 'browser persona carries a usable TCP profile');
assert.ok(personaSpec.retrievalContract.calibrationCount >= 4, 'persona spec carries retrieval calibration evidence');

console.log('trainer-lab.test.mjs passed');
