import assert from 'assert';
import fs from 'fs';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { PHASE32_1_DIAGNOSTIC_SAMPLE } from '../scripts/run-hush-phase32-1-mask-diagnostics.mjs';
import { generateExpressiveCandidates, buildExpressivePayloadMap, HUSH_EXPRESSIVE_GENERATOR_VERSION } from '../app/engine/hush-expressive-generator.js';
import { buildHushSwap, HUSH_SWAP_PHASE34_VERSION } from '../app/engine/hush-swap-phase34.js';
import { buildHushSwap as buildPatch38HushSwap, HUSH_SWAP_PATCH38_VERSION } from '../app/engine/hush-swap-patch38.js';
import { TECH_JOB_SIGNAL_SAMPLE, GENERATOR_MODES, buildHushLlmPromptContract, collapseSurfaceScore, generateOfflineQuestionCandidates } from '../app/engine/hush-generator-provider.js';
import { buildPropositionMap, questionFormScore, newClaimRisk } from '../app/engine/hush-proposition-map.js';
import { buildOntologyRoute, compileRemoteRoutePayload } from '../app/engine/hush-ontology-route.js';
import { buildHushLlmPromptContractV2, buildPhase37ProviderTelemetry } from '../app/engine/hush-generator-provider-phase35.js';
import { auditPropositionIntegrity } from '../app/engine/hush-proposition-integrity.js';

assert.equal(HUSH_EXPRESSIVE_GENERATOR_VERSION, 'phase-34-expressive-generation');
assert(HUSH_SWAP_PHASE34_VERSION.includes('phase-34-expressive-generation'));
assert.equal(HUSH_SWAP_PATCH38_VERSION, 'patch-38-hybrid-candidate-generator');

const mask = getHushMask('plain-witness');
const payload = buildExpressivePayloadMap(PHASE32_1_DIAGNOSTIC_SAMPLE);
assert.equal(payload.expressive.active, true);
assert(payload.anchors.includes('rose-bush-pruning'));
assert(payload.anchors.includes('rot-latency'));
assert(payload.anchors.includes('dromological-anchors'));
assert(payload.fragments.rose.includes('rose bush'));
assert(payload.fragments.rot.includes('rot latency'));
assert(payload.fragments.dromology.includes('dromological anchors'));

const generated = generateExpressiveCandidates({ sourceText: PHASE32_1_DIAGNOSTIC_SAMPLE, mask, maskProfile: mask.profile, options: { expressiveMode: true } });
assert.equal(generated.version, HUSH_EXPRESSIVE_GENERATOR_VERSION);
assert.equal(generated.expressive.active, true);
assert(generated.candidates.length >= 4);
assert(generated.candidates.every((candidate) => candidate.source === 'phase34-expressive-generator'));
assert(generated.candidates.some((candidate) => /rose bush|rose-bush/i.test(candidate.text)));
assert(generated.candidates.some((candidate) => /rot latency/i.test(candidate.text)));
assert(generated.candidates.some((candidate) => /dromological anchors/i.test(candidate.text)));
assert(generated.candidates.every((candidate) => candidate.operations.includes('phase34-expressive-generation')));

const result = buildHushSwap({ sourceText: PHASE32_1_DIAGNOSTIC_SAMPLE, mask, maskProfile: mask.profile, contextType: 'group-chat', operatorMode: 'expressive-theory', exposureDuration: 'single-use', options: { candidateCount: 30, includePrivateText: false, expressiveMode: true } });
assert(result.version.includes('phase-34-expressive-generation'));
assert(result.phase34Diagnostics, 'Phase 34 diagnostics missing');
assert.equal(result.phase34Diagnostics.active, true);
assert(result.phase34Diagnostics.generatedCount >= 4);
assert(result.phase34Diagnostics.mergedCount >= result.phase34Diagnostics.generatedCount);
assert(result.phase34Diagnostics.selectorRows.some((row) => row.generated === true));
assert(Number.isFinite(result.phase34Diagnostics.selectedRetentionScore));
assert(Number.isFinite(result.phase34Diagnostics.selectedWrapperFatigue));
assert(Number.isFinite(result.phase34Diagnostics.selectedExpressiveScore));
assert(result.selectedOutput.length > 0);
assert(/rose bush|rose-bush|rot latency|dromological anchors/i.test(result.selectedOutput), 'Phase 34 output should preserve expressive anchors in selected output');

const questionCandidates = generateOfflineQuestionCandidates({ sourceText: TECH_JOB_SIGNAL_SAMPLE, mask, maskProfile: mask.profile });
assert(questionCandidates.length >= 3, 'Patch 38 should generate local question candidates');
assert(questionCandidates.every((candidate) => collapseSurfaceScore(candidate.text) === 0), 'Patch 38 question candidates must avoid custody-collapse wrappers');
assert(questionCandidates.some((candidate) => /tech/i.test(candidate.text) && /signal[- ]reading|signal/i.test(candidate.text)));

const patch38 = buildPatch38HushSwap({ sourceText: TECH_JOB_SIGNAL_SAMPLE, mask, maskProfile: mask.profile, generatorMode: GENERATOR_MODES.OFFLINE_EXPRESSIVE, contextType: 'group-chat', operatorMode: 'neutralize', exposureDuration: 'single-use', options: { candidateCount: 30, includePrivateText: false } });
assert(patch38.version.includes('patch-38-hybrid-candidate-generator'));
assert(patch38.patch38Diagnostics, 'Patch 38 diagnostics missing');
assert(patch38.patch38Diagnostics.generatedCount >= 3);
assert.equal(patch38.patch38Diagnostics.selectedProviderCandidate, true);
assert(patch38.patch38Diagnostics.selectedCollapseSurfaceScore < 0.34);
assert(!/Just keeping this organized|should stay with the note|That keeps the context together/i.test(patch38.selectedOutput), 'Patch 38 must block the known custody-collapse surface');
assert(/tech/i.test(patch38.selectedOutput));
assert(/signal[- ]reading|signal/i.test(patch38.selectedOutput));
assert((patch38.selectedOutput.match(/\?/g) || []).length >= 1, 'Patch 38 should preserve question-form for the tech-job sample');

const contract = buildHushLlmPromptContract({ sourceText: TECH_JOB_SIGNAL_SAMPLE, mask, candidateCount: 6 });
assert.equal(contract.promptVersion, 'hush-llm-candidate-v1');
assert.equal(contract.sourceText, TECH_JOB_SIGNAL_SAMPLE);
assert(contract.rules.some((rule) => /Do not answer questions/i.test(rule)));
assert(contract.mask.maskId === mask.id);
assert(!Object.prototype.hasOwnProperty.call(contract, 'apiKey'));

const lineBreakContract = buildHushLlmPromptContract({
  sourceText: 'First paragraph.\n\nSecond paragraph.',
  mask: { ...mask, sampleSeed: 'line one\nline two\nline three' },
  candidateCount: 4
});
assert(lineBreakContract.sourceText.includes('\n\n'), 'provider contract should preserve paragraph breaks in sourceText');
assert(lineBreakContract.maskReferenceExcerpt.includes('\n'), 'provider contract should preserve line breaks in mask reference excerpt');
assert(lineBreakContract.rules.some((rule) => /paragraph breaks and line breaks/i.test(rule)), 'provider contract should carry the layout-cadence rule');
assert.equal(typeof lineBreakContract.mask.lineBreakDensity, 'number');
assert.equal(typeof lineBreakContract.mask.punctuationDensity, 'number');

const propMap = buildPropositionMap(TECH_JOB_SIGNAL_SAMPLE);
assert.equal(propMap.questionCount, 2);
assert.equal(propMap.routeHint, 'question-preservation');
assert(propMap.propositions.every((p) => p.mustRemainQuestion));
assert(propMap.forbiddenChanges.includes('do not answer the questions'));

const route = buildOntologyRoute({ sourceText: TECH_JOB_SIGNAL_SAMPLE, mask, propositionMap: propMap });
assert(route.routeType === 'question-legibility' || route.routeType === 'everyday-question');
assert.equal(route.sourceType, 'short-question');
assert(route.ontologyHints.allowedMoves.includes('preserve questions as questions'));
assert(route.ontologyHints.forbiddenMoves.includes('Just keeping this organized'));
const compactRoute = compileRemoteRoutePayload(route);
assert.equal(compactRoute.propositionSummary.questionCount, 2);
assert(!Object.prototype.hasOwnProperty.call(compactRoute, 'fullOntology'));

const contractV2 = buildHushLlmPromptContractV2({ sourceText: TECH_JOB_SIGNAL_SAMPLE, mask, candidateCount: 6 });
assert.equal(contractV2.promptVersion, 'hush-llm-candidate-v3');
assert.equal(contractV2.ontologyRoute.propositionMap.questionCount, 2);
assert(contractV2.ontologyRoute.routeType === 'question-legibility' || contractV2.ontologyRoute.routeType === 'everyday-question');
assert(contractV2.rules.includes('Preserve meaning, questions, caveats, negations, uncertainty, and intent.'));
assert(!Object.prototype.hasOwnProperty.call(contractV2, 'apiKey'));
assert(!Object.prototype.hasOwnProperty.call(contractV2, 'ledger'));

const telemetry = buildPhase37ProviderTelemetry({ sourceText: TECH_JOB_SIGNAL_SAMPLE, mask });
assert.equal(telemetry.version, 'phase-37-ontology-carrying-generator-flight-pr151-sample-residue');
assert(!Object.prototype.hasOwnProperty.call(telemetry.flightPacket, 'ledger'));
assert.equal(telemetry.flightPacket.custody_boundaries.no_mask_memory_payload, true);
assert(!Object.prototype.hasOwnProperty.call(telemetry.flightPacket, 'fullOntology'));

const layoutTelemetry = buildPhase37ProviderTelemetry({
  sourceText: 'First paragraph.\n\nSecond paragraph.',
  mask: { ...mask, sampleSeed: 'line one\nline two\nline three' }
});
assert(layoutTelemetry.flightPacket.source_manifest.source_layout_cadence, 'flight packet should include source layout cadence');
assert(layoutTelemetry.flightPacket.mask_style_vector.layout_cadence, 'flight packet should include mask layout cadence');
assert(layoutTelemetry.flightPacket.stylometry_engine.source_surface_markers, 'flight packet should expose source surface markers');
assert(layoutTelemetry.flightPacket.stylometry_engine.mask_surface_markers, 'flight packet should expose mask surface markers');
assert.equal(layoutTelemetry.flightPacket.stylometry_engine.generator_constraints.preserve_layout_cadence, true);
assert.equal(layoutTelemetry.flightPacket.stylometry_engine.generator_constraints.do_not_flatten_paragraph_sensitive_source, true);
assert(Array.isArray(layoutTelemetry.flightPacket.stylometry_engine.audit.warnings));

const integrity = auditPropositionIntegrity(TECH_JOB_SIGNAL_SAMPLE, patch38.selectedOutput);
assert(integrity.questionFormScore >= 0.5);
assert.equal(integrity.answeredQuestion, false);
assert.equal(integrity.inventedAdvice, false);
assert(integrity.collapseSurfaceScore < 0.34);
assert(questionFormScore(TECH_JOB_SIGNAL_SAMPLE, patch38.selectedOutput) >= 0.5);
assert(newClaimRisk(TECH_JOB_SIGNAL_SAMPLE, patch38.selectedOutput).score < 0.35);

const ui = fs.readFileSync('app/hush-phase32.js', 'utf8');
const patch38Ui = fs.readFileSync('app/hush-patch38.js', 'utf8');
const bootstrap = fs.readFileSync('app/chamber-bootstrap.js', 'utf8');
const proxy = fs.readFileSync('api/hush-generate.js', 'utf8');
const budgetedProxy = fs.readFileSync('api/hush-generate-budgeted.js', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const setupDoc = fs.readFileSync('docs/hush-remote-provider-setup.md', 'utf8');
assert(ui.includes('hush-swap-phase34.js'));
assert(ui.includes('Phase 34 expressive generator'));
assert(bootstrap.includes('hush-patch38.js'));
assert(patch38Ui.includes('hush-swap-patch38.js'));
assert(patch38Ui.includes('/api/hush-generate'));
assert(patch38Ui.includes('Generator Mode'));
assert(patch38Ui.includes('buildHushLlmPromptContractV2'));
assert(patch38Ui.includes('Phase 35 ontology-routed generator'));
assert(proxy.includes('process.env.GEMINI_API_KEY'));
assert(budgetedProxy.includes('LAYOUT CADENCE CUSTODY'));
assert(budgetedProxy.includes('Line breaks and paragraph breaks are cadence evidence'));
assert(budgetedProxy.includes('punctuation scarcity'));
assert(budgetedProxy.includes('source_layout_cadence'));
assert(!patch38Ui.includes('GEMINI_API_KEY'));
assert(envExample.includes('GEMINI_API_KEY='));
assert(setupDoc.includes('Do not paste API keys into the browser'));
console.log('hush-phase34, patch38, and phase35 ontology generation tests passed');
