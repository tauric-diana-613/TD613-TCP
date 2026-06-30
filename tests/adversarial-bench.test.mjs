import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';

function loadHtml(path) { return fs.readFileSync(path, 'utf8'); }
function installDom(html, url = 'http://localhost/adversarial-bench.html') {
  const dom = new JSDOM(html, { url, pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  return dom;
}

const html = loadHtml('app/adversarial-bench.html');
installDom(html);
assert(document.title.includes('TD613 Hush'));
assert(document.body.textContent.includes('TD613 / Hush'));
for (const id of ['protectedBaselineInput','maskReferenceInput','messageDraftInput','protectedOutputInput','hushBuiltInTabBtn','hushCustomizeTabBtn','hushCustomMaskName','hushCustomMaskSampleInput','hushAddSampleBtn','hushSaveCustomMaskBtn','hushMaskProfilePanel','hushProfileMatchPanel','hushSwapWarningsPanel','exportHushMaskProfileBtn','exportHushSwapJsonBtn','escapeVectorPanel','controllerPanel','personaMemoryPanel','recognitionFieldPanel','recognitionContextType','recognitionIntentMode','recognitionExposureDuration','recognitionFieldGrid','recognitionFieldWarnings','iterationPreviewPanel','exportLedgerJsonBtn','includeLedgerTextsToggle','ledgerExportOutput','reportExportPanel','claimCeilingPanel','exportReportJsonBtn','exportReportMarkdownBtn','reportExportOutput']) assert(document.getElementById(id), `missing ${id}`);

const bench = await import(`../app/adversarial-bench.mjs?test=${Date.now()}`);
for (const fn of ['initAdversarialBench','initHushMaskStudio','selectHushMask','switchHushMaskTab','addHushCustomMaskSample','saveHushCustomMask','renderHushMaskProfile','renderHushProfileMatch','runHushSwap','exportCurrentHushMaskProfile','exportCurrentHushSwapJson','analyzeProtectedOutput','generateMaskedOutput','acceptOutputIntoPersonaMemory','renderEscapeVector','renderRecognitionField','renderControllerDecision','renderClaimCeiling','buildCurrentReportPayload','exportCurrentReportJson','exportCurrentReportMarkdown','exportLedgerJson']) assert.equal(typeof bench[fn], 'function', `missing export ${fn}`);

bench.initAdversarialBench(document);
assert(bench.benchState.iterationLedger);
assert.equal(bench.benchState.iterationLedger.rows.length, 0);
assert(document.getElementById('recognitionContextType').options.length >= 4);
assert(bench.benchState.hushMasks.length >= 13);
assert.equal(
  document.getElementById('maskFieldSelect').options.length,
  bench.benchState.hushMasks.length + bench.benchState.customMasks.length
);
assert.equal(bench.benchState.recognitionContextType, 'group-chat');
assert(bench.benchState.selectedHushMask);
assert(document.getElementById('hushMaskProfilePanel').textContent.includes('Profile status'));

bench.switchHushMaskTab('customize');
assert.equal(document.getElementById('hushCustomizePanel').hidden, false);
document.getElementById('hushCustomMaskName').value = 'Test River Mask';
document.getElementById('hushCustomMaskSampleInput').value = 'This is a custom sample with a practical rhythm. It keeps the file label visible and stays ordinary enough for local testing.';
bench.addHushCustomMaskSample();
assert(bench.benchState.activeCustomMask.sampleCount >= 1);
assert(document.getElementById('hushCustomMaskSummary').textContent.includes('Samples'));
bench.saveHushCustomMask();
assert(document.getElementById('maskFieldSelect').textContent.includes('Test River Mask'));
assert.equal(bench.benchState.selectedHushMask.label, 'Test River Mask');
bench.switchHushMaskTab('built-in');

const baseline = document.getElementById('protectedBaselineInput');
const mask = document.getElementById('maskReferenceInput');
const draft = document.getElementById('messageDraftInput');
const output = document.getElementById('protectedOutputInput');

baseline.value = 'I keep circling the issue with a reflective rhythm, layered clauses, and repeated return pressure that marks the protected baseline.';
mask.value = 'Need the packet. Keep it short. Knock twice. Move fast.';
draft.value = 'Please keep EXHIBIT-42 in the message while moving the cadence into a shorter field voice.';
output.value = 'Need the packet. EXHIBIT-42 stays visible. Keep it short and move fast.';
document.getElementById('recognitionContextType').value = 'group-chat';
document.getElementById('recognitionIntentMode').value = 'neutralize';
document.getElementById('recognitionExposureDuration').value = 'single-use';

const beforeBaseline = baseline.value;
const beforeMask = mask.value;
const beforeDraft = draft.value;
bench.analyzeProtectedOutput();
assert.equal(baseline.value, beforeBaseline);
assert.equal(mask.value, beforeMask);
assert.equal(draft.value, beforeDraft);
assert.notEqual(output.value, baseline.value);
assert.equal(bench.benchState.iterationLedger.rows.length, 1);
assert.equal(bench.benchState.iterationLedger.rows[0].texts.protectedBaseline, null);
assert.equal(bench.benchState.iterationLedger.rows[0].texts.messageDraft, null);
assert.equal(bench.benchState.iterationLedger.rows[0].texts.protectedOutput, null);
assert(bench.benchState.claimCeiling);
assert(bench.benchState.contextProfile);
assert(bench.benchState.recognitionField);
assert(bench.benchState.hushProfileMatch);
assert.equal(bench.benchState.recognitionField.contextType, 'group-chat');
assert(document.getElementById('claimCeilingPanel').textContent.includes('Claim ceiling'));
assert(document.getElementById('hushProfileMatchPanel').textContent.includes('Mask Match'));

const swapResult = bench.runHushSwap();
assert(bench.benchState.hushSwapResult);
assert(Object.prototype.hasOwnProperty.call(swapResult, 'allCandidatesFailed'));
if (!swapResult.allCandidatesFailed) assert(document.getElementById('protectedOutputInput').value.length > 0);
else assert(swapResult.failureReason.includes('failed candidate'));
assert(document.getElementById('hushProfileMatchPanel').textContent.includes('Match score') || swapResult.allCandidatesFailed);

const hushMaskExport = bench.exportCurrentHushMaskProfile();
const hushMaskPayload = JSON.parse(hushMaskExport);
assert.equal(hushMaskPayload.maskId || hushMaskPayload.id, bench.benchState.selectedHushMask.id);
assert.equal(typeof hushMaskPayload.version, 'string');
assert(!hushMaskExport.includes('This is a custom sample with a practical rhythm'));
const hushSwapExport = bench.exportCurrentHushSwapJson();
assert.equal(JSON.parse(hushSwapExport).version, 'phase-22');
const currentOutput = document.getElementById('protectedOutputInput').value;
if (currentOutput) assert(!hushSwapExport.includes(currentOutput));

const vectorText = document.getElementById('escapeVectorPanel').textContent;
assert(vectorText.includes('Source Residual'));
assert(vectorText.includes('Mask Fit'));
assert(vectorText.includes('Δsafe'));
assert(vectorText.includes('Semantic Fidelity'));
assert(vectorText.includes('Ingestion Friction'));

const recognitionText = document.getElementById('recognitionFieldPanel').textContent;
assert(recognitionText.includes('Recognition Pressure'));
assert(recognitionText.includes('Context Legibility'));
assert(recognitionText.includes('Indexability'));
assert(recognitionText.includes('Topic Leakage'));
assert(recognitionText.includes('Entity Leakage'));
assert(recognitionText.includes('hidden platform classifiers') || recognitionText.includes('route:'));

const controllerText = document.getElementById('controllerPanel').textContent;
assert(/Continue steering|Hold for review|Rotate mask|Restore semantics|Locally sealable/.test(controllerText));
assert(controllerText.includes('Next instruction'));

const exportedDefault = bench.exportLedgerJson();
assert(!exportedDefault.includes(beforeBaseline));
assert(!exportedDefault.includes(beforeDraft));
if (currentOutput) assert(!exportedDefault.includes(currentOutput));
assert(exportedDefault.includes('outputHash'));
assert(document.getElementById('ledgerExportOutput').value.includes('outputHash'));

document.getElementById('includeLedgerTextsToggle').checked = true;
const exportedWithText = bench.exportLedgerJson();
assert(exportedWithText.includes(beforeBaseline));
assert(exportedWithText.includes(beforeDraft));
if (currentOutput) assert(exportedWithText.includes(currentOutput));
document.getElementById('includeLedgerTextsToggle').checked = false;

const reportPayload = bench.buildCurrentReportPayload();
assert.equal(reportPayload.version, 'phase-7');
assert(reportPayload.claimCeiling);
assert(reportPayload.recognitionField);
assert.equal(reportPayload.recognitionField.contextType, 'group-chat');
assert(reportPayload.limitations.length);
assert.equal(reportPayload.reproducibility.sourceTextIncluded, false);
assert.equal(reportPayload.reproducibility.outputTextIncluded, false);

const reportJson = bench.exportCurrentReportJson();
assert(reportJson.includes('claimCeiling'));
assert(reportJson.includes('recognitionField'));
assert(reportJson.includes('limitations'));
assert(reportJson.includes('sourceResidualRisk'));
assert(!reportJson.includes(beforeBaseline));
assert(!reportJson.includes(beforeDraft));
if (currentOutput) assert(!reportJson.includes(currentOutput));
assert.equal(detectForbiddenClaims(reportJson).hasForbiddenClaim, false);
assert(document.getElementById('reportExportOutput').value.includes('claimCeiling'));

const reportMarkdown = bench.exportCurrentReportMarkdown();
assert(reportMarkdown.includes('# TD613-TCP Local Stylometry Report'));
assert(reportMarkdown.includes('## Claim Ceiling'));
assert(reportMarkdown.includes('## Recognition Field'));
assert(reportMarkdown.includes('## Limitations'));
assert(!reportMarkdown.includes(beforeBaseline));
assert(!reportMarkdown.includes(beforeDraft));
if (currentOutput) assert(!reportMarkdown.includes(currentOutput));
assert.equal(detectForbiddenClaims(reportMarkdown).hasForbiddenClaim, false);
assert(document.getElementById('reportExportOutput').value.includes('TD613-TCP Local Stylometry Report'));

document.getElementById('recognitionContextType').value = 'public-comment';
document.getElementById('recognitionExposureDuration').value = 'long-running';
document.getElementById('recognitionContextType').dispatchEvent(new Event('change'));
assert.equal(bench.benchState.recognitionContextType, 'public-comment');
assert.equal(bench.benchState.recognitionExposureDuration, 'long-running');
assert.equal(bench.benchState.recognitionField.contextType, 'public-comment');
assert(document.getElementById('recognitionFieldPanel').textContent.includes('Recognition Pressure'));

const initialAccepted = bench.benchState.personaMemory.memory.acceptedCount;
const latestBeforeAccept = bench.benchState.iterationLedger.rows.at(-1);
if (!document.getElementById('acceptOutputBtn').disabled) {
  bench.acceptOutputIntoPersonaMemory();
  assert.equal(bench.benchState.personaMemory.memory.acceptedCount, initialAccepted + 1);
  const linked = bench.benchState.iterationLedger.rows.find((row) => row.id === latestBeforeAccept.id);
  assert.equal(linked.status.accepted, true);
  assert(linked.references.personaMemoryEntryId);
  assert(document.getElementById('iterationPreviewPanel').textContent.includes('Source'));
} else assert.equal(bench.benchState.personaMemory.memory.acceptedCount, initialAccepted);

output.value = 'Need the packet. The protected marker is missing now.';
bench.analyzeProtectedOutput();
const state = bench.benchState.controllerDecision.state;
if (state === 'restore' || state === 'hold' || bench.benchState.recognitionField?.classifications?.route === 'hold') {
  const accept = document.getElementById('acceptOutputBtn');
  const warning = document.getElementById('acceptWarning');
  assert(accept.disabled || !warning.hidden);
}

const deckDom = new JSDOM(loadHtml('app/deck.html'));
for (const id of ['voiceA','voiceB','compareBtn','swapCadencesBtn','savePersonaBtn','shellDuel']) assert(deckDom.window.document.getElementById(id), `deck missing ${id}`);

const rendered = document.body.textContent;
assert.equal(detectForbiddenClaims(rendered).hasForbiddenClaim, false);

console.log('adversarial-bench tests passed');
