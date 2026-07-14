import assert from 'assert';
import fs from 'fs';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { HUSH_SWAP_VERSION, buildHushSwap } from '../app/engine/hush-swap.js';
import { buildHushSwap as buildPhase32HushSwap, HUSH_SWAP_PHASE32_VERSION } from '../app/engine/hush-swap-phase32.js';
import { buildPhase23HushSwap } from '../app/engine/hush-phase23-swap.js';
import { PHASE32_1_DIAGNOSTIC_SAMPLE, runPhase321Diagnostics } from '../scripts/run-hush-phase32-1-mask-diagnostics.mjs';

assert.equal(HUSH_SWAP_VERSION, 'phase-22.1-selection-pressure');
assert.equal(HUSH_SWAP_PHASE32_VERSION, 'phase-32-mask-surface-separation');

const mask = getHushMask('plain-witness');
const sourceText = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.';
const result = buildHushSwap({ sourceText, mask, maskProfile: mask.profile, contextType: 'group-chat', options: { candidateCount: 18 } });

assert.equal(result.version, 'phase-22.1-selection-pressure');
assert(result.writer?.meaningPlan);
assert(result.writer?.payloadMap);
assert(result.writer?.payloadMapSummary);
assert(result.writer?.payloadBindingMap);
assert(result.writer?.payloadBindingSummary);
assert(result.writer?.realizationPlan);
assert(result.writer?.claimRoleMap);
assert(result.writer?.claimRoleSummary);
assert(result.writer?.literalPlacementMap);
assert(result.writer?.literalPlacementSummary);
assert(result.writer?.syntaxPlan);
assert(result.writer?.syntaxPlanSummary);
assert(result.writer?.syntaxBundle);
assert(result.writer?.cleanroom);
assert(result.releasePolicy);
assert(result.releaseSummary);
assert(result.sourceResidue);
assert(result.sourceResidueSummary);
assert(result.sourceResidueScore);
assert(result.syntaxShift);
assert(result.syntaxShiftSummary);
assert(result.syntaxShiftScore);
assert(result.payloadIntegrity);
assert(result.payloadIntegritySummary);
assert(result.payloadRepairSummary);
assert(result.claimIntegrity);
assert(result.claimIntegritySummary);
assert(result.literalPlacementSummary);
assert(result.candidates.length >= 10);
assert(result.candidates.every((candidate) => candidate.text.includes('INV-440') && candidate.text.includes('2:18')));
assert(result.candidates.some((candidate) => candidate.releasePolicy));
assert(result.candidates.some((candidate) => candidate.sourceResidue));
assert(result.candidates.some((candidate) => candidate.syntaxShift));
assert(result.candidates.some((candidate) => candidate.payloadIntegrity));
assert(result.candidates.some((candidate) => candidate.claimIntegrity));
assert(result.candidates.some((candidate) => candidate.source === 'syntax-recomposer'));
assert(result.candidates.some((candidate) => candidate.source === 'literal-safe-fallback'));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'sourceResidueScore')));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'syntaxShiftScore')));
assert(result.candidates.some((candidate) => Object.prototype.hasOwnProperty.call(candidate.scoreBreakdown || {}, 'payloadIntegrity')));
assert(result.candidates.every((candidate) => candidate.claimIntegrity?.passed !== false || candidate.releasePolicy?.hardBlockReasons.includes('claim-integrity-failed')));
assert(result.candidates.every((candidate) => candidate.payloadIntegrity?.passed !== false || candidate.releasePolicy?.hardBlockReasons.includes('claim-payload-loss')));

if (result.releasePolicy.mayPopulateOutput) {
  assert(result.selectedOutput.length > 0);
  assert(result.selectedOutput.includes('INV-440'));
  assert(result.selectedOutput.includes('2:18'));
} else {
  assert.equal(result.selectedOutput, '');
}

const phase32 = buildPhase32HushSwap({
  sourceText: 'Can we remove Homebase / Personas and Deck from the Gateway Threshold page now that Hush owns mask studio routing?',
  mask,
  maskProfile: mask.profile,
  contextType: 'group-chat',
  options: { candidateCount: 24 }
});
assert(phase32.version.includes('phase-32-mask-surface-separation'));
assert(phase32.phase32Diagnostics, 'Phase 32 diagnostics missing');
assert(phase32.phase32Diagnostics.candidateReport.length > 0, 'Phase 32 candidate report missing');
assert(Number.isFinite(phase32.phase32Diagnostics.selectedMaskSurfaceScore), 'Phase 32 selected surface score missing');
assert.notEqual(phase32.selectedOutput, 'TD613 remains the record anchor. “Homebase / Personas” remains attached to this record. “Deck” remains attached to this record. Hush remains attached to this record. Gateway remains attached to this record. Threshold remains attached to this record.');
assert(!/TD613 remains the record anchor/i.test(phase32.selectedOutput), 'Phase 32 should not select record-anchor boilerplate for ordinary routing questions');

const bootstrap = fs.readFileSync('app/chamber-bootstrap.js', 'utf8');
const phase32Css = fs.readFileSync('app/hush-phase32.css', 'utf8');
const phase32Ui = fs.readFileSync('app/hush-phase32.js', 'utf8');
const hushHtml = fs.readFileSync('app/adversarial-bench.html', 'utf8');
assert(hushHtml.includes('hush-phase32.css'));
assert(!hushHtml.includes('hush-phase32.js'), 'legacy Phase 32 UI should not block Hush first load');
assert(bootstrap.includes('gatewayDoorDeck,#gatewayDoorHomebase'));
assert(bootstrap.includes('gatewayDoorFlight'));
assert(bootstrap.includes('./safe-harbor/td613-flight.html'));
assert(bootstrap.includes('Seal cockpit'));
assert(bootstrap.includes('Payload route. Prompt steering.'));
assert(bootstrap.includes('[hush, flight, harbor, clone]'));
assert(bootstrap.includes("data-phase32-visible-order', 'hush flight safe-harbor clone'"));
assert(hushHtml.includes('td613HushLoadingDots" class="td613-hush-loading-dots">...</span>'));
assert(phase32Css.includes('#gatewayDoorDeck,#gatewayDoorHomebase'));
assert(phase32Css.includes('hush-phase32-clear-input'));
assert(phase32Css.includes('hush-phase32-compact-actions'));
assert(phase32Css.includes('TD613 Hush Phase 32.1'));
assert(phase32Css.includes('hush-gate-strip'));
assert(phase32Css.includes('hush-mask-card'));
assert(phase32Css.includes('#protectedOutputHeading'));
assert(phase32Ui.includes('clear input'));
assert(phase32Ui.includes('runPhase32Transform'));
assert(phase32Ui.includes('maskFieldSelect'));
assert(phase32Ui.includes('td613HushLoadingDots'));

const diagnostic = runPhase321Diagnostics();
assert(diagnostic.summary.maskCount > 5, 'Phase 32.1 diagnostics should test the full mask set');
assert.equal(diagnostic.summary.sampleChars, PHASE32_1_DIAGNOSTIC_SAMPLE.length);
assert(diagnostic.rows.every((row) => row.maskId && row.label), 'diagnostic rows need mask identity');
assert(diagnostic.rows.some((row) => row.outputPreview), 'at least one mask should produce diagnostic output');
assert(diagnostic.summary.phase33Findings.length > 0, 'diagnostics must emit Phase 33 findings');
assert(Object.prototype.hasOwnProperty.call(diagnostic.summary, 'fallbackSelectedCount'));
assert(Object.prototype.hasOwnProperty.call(diagnostic.summary, 'highBoilerplateCount'));
assert(Object.prototype.hasOwnProperty.call(diagnostic.summary, 'lowSurfaceCount'));

const phase23Mask = getHushMask('phase22-jagged-record');
const phase23 = buildPhase23HushSwap({ sourceText: 'Keep DOC-77 with 04/21. The file was visible before noon, and the date is the anchor.', mask: phase23Mask, maskProfile: phase23Mask.profile, contextType: 'group-chat', options: { candidateCount: 24 } });
assert.equal(phase23.version, 'phase-23');
assert.equal(phase23.phase22Version, 'phase-22.1-selection-pressure');
assert(phase23.phase23?.usedWrapper, 'Phase 23 wrapper marker missing');
assert(phase23.outputPolishSummary, 'missing output polish summary');
assert(phase23.witnessCoherenceSummary, 'missing witness coherence summary');
assert(phase23.candidates.some((candidate) => candidate.outputPolish));
assert(phase23.candidates.some((candidate) => candidate.witnessCoherence));
assert(Number.isFinite(phase23.witnessCoherence?.score), 'missing coherence score');
if (phase23.selectedOutput) {
  assert(phase23.selectedOutput.includes('DOC-77'));
  assert(phase23.selectedOutput.includes('04/21'));
  assert(!phase23.selectedOutput.startsWith('might Keeping'));
}

console.log('hush-swap tests passed');
