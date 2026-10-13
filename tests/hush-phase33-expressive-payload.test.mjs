import assert from 'assert';
import fs from 'fs';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap, HUSH_SWAP_PHASE33_VERSION } from '../app/engine/hush-swap-phase33.js';
import { detectExpressivePayload, expressiveRetention, wrapperFatigueScore, HUSH_EXPRESSIVE_PAYLOAD_VERSION } from '../app/engine/hush-expressive-payload.js';
import { PHASE32_1_DIAGNOSTIC_SAMPLE } from '../scripts/run-hush-phase32-1-mask-diagnostics.mjs';
import { runPhase33RosebushDiagnostics } from '../scripts/run-hush-phase33-rosebush-diagnostics.mjs';

assert.equal(HUSH_SWAP_PHASE33_VERSION, 'phase-33-expressive-payload-preservation');
assert.equal(HUSH_EXPRESSIVE_PAYLOAD_VERSION, 'phase-33-expressive-payload-preservation');

const expressive = detectExpressivePayload(PHASE32_1_DIAGNOSTIC_SAMPLE);
assert.equal(expressive.active, true);
assert(expressive.anchorCount >= 5, 'rosebush sample should activate multiple expressive payload anchors');
assert(expressive.anchors.some((anchor) => anchor.id === 'rose-bush-pruning'));
assert(expressive.anchors.some((anchor) => anchor.id === 'dromological-anchors'));
assert(expressive.anchors.some((anchor) => anchor.id === 'rot-latency'));
assert(expressive.anchors.some((anchor) => anchor.id === 'care-ethic'));

const badWrapper = 'What I can confirm is this: The point is preservation. Keeping the claim narrow.';
assert(wrapperFatigueScore(badWrapper) > 0.3, 'wrapper fatigue should catch custody-openers');

const mask = getHushMask('plain-witness');
const result = buildHushSwap({
  sourceText: PHASE32_1_DIAGNOSTIC_SAMPLE,
  mask,
  maskProfile: mask.profile,
  contextType: 'group-chat',
  operatorMode: 'expressive-theory',
  exposureDuration: 'single-use',
  options: { candidateCount: 28, includePrivateText: false, expressiveMode: true }
});

assert(result.version.includes('phase-33-expressive-payload-preservation'));
assert(result.phase33Diagnostics, 'Phase 33 diagnostics missing');
assert.equal(result.phase33Diagnostics.expressiveActive, true);
const phase33Rows = Array.isArray(result.phase33Diagnostics.selectorRows) && result.phase33Diagnostics.selectorRows.length
  ? result.phase33Diagnostics.selectorRows
  : result.phase33Diagnostics.candidateReport;
assert(Array.isArray(phase33Rows));
assert(phase33Rows.length > 0);
assert(Number.isFinite(result.phase33Diagnostics.phase33Score));
assert(Object.prototype.hasOwnProperty.call(result.phase33Diagnostics, 'selectedWrapperFatigue'));
assert(Object.prototype.hasOwnProperty.call(result.phase33Diagnostics, 'selectedRetentionScore'));

const retained = expressiveRetention(PHASE32_1_DIAGNOSTIC_SAMPLE, result.selectedOutput || '');
assert(Object.prototype.hasOwnProperty.call(retained, 'retentionScore'));
assert(Array.isArray(retained.missing));

const report = runPhase33RosebushDiagnostics();
assert.equal(report.summary.version, 'phase-33-rosebush-diagnostics');
assert(report.summary.maskCount > 5);
assert.equal(report.summary.sampleChars, PHASE32_1_DIAGNOSTIC_SAMPLE.length);
assert(report.rows.every((row) => row.maskId && row.label));
assert(report.rows.every((row) => Object.prototype.hasOwnProperty.call(row, 'expressiveRetention')));
assert(report.rows.every((row) => Object.prototype.hasOwnProperty.call(row, 'wrapperFatigue')));
assert(report.summary.findings.length > 0);

const ui = fs.readFileSync('app/hush-phase32.js', 'utf8');
const pkg = fs.readFileSync('package.json', 'utf8');
const hushSuite = fs.readFileSync('scripts/hush-test-suite.txt', 'utf8');
assert(ui.includes('hush-swap-phase33.js') || ui.includes('hush-swap-phase34.js'));
assert(ui.includes('Expressive / Theory'));
assert(ui.includes('phase-34-expressive-generation-ui') || ui.includes('HUSH_SWAP_PHASE34_VERSION'));
assert(pkg.includes('diag:hush:phase33'));
assert(hushSuite.includes('hush-phase33-expressive-payload.test.mjs'));

console.log('hush-phase33-expressive-payload tests passed');
