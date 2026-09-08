import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE,
  remainingWaitMs,
  sampleTiming,
} from '../scripts/lib/aperture-v32-identity-witness-clock.mjs';

const probe = fs.readFileSync('scripts/aperture-v32-identity-singularity-browser-witness.mjs', 'utf8');

for (const token of [
  "page.on('close'",
  "page.on('crash'",
  "context.on('close'",
  "browser.on('disconnected'",
  "page.on('framenavigated'",
  'page.isClosed()',
  'browser.isConnected()',
  'lifecycle-events.jsonl',
  'BEFORE_${label}',
  'AFTER_${label}',
  'PAGE_CLOSED',
  'PAGE_CRASHED',
  'CONTEXT_CLOSED',
  'BROWSER_DISCONNECTED',
  'TERMINAL_ERROR',
  'BOUNDED_IDENTITY_OBSERVATION_COMPLETE',
  'ABSOLUTE_POST_DOMCONTENTLOADED_DEADLINES',
  'remainingWaitMs',
  'target_elapsed_ms',
  'actual_elapsed_ms',
  'drift_ms',
]) assert.ok(probe.includes(token), `Lifecycle diagnostic witness omitted ${token}`);

assert.deepEqual(
  APERTURE_V32_IDENTITY_SAMPLE_SCHEDULE.map(({ label, targetElapsedMs }) => [label, targetElapsedMs]),
  [
    ['T0_DOM_READY', 0],
    ['T1_350MS', 350],
    ['T2_1000MS', 1000],
    ['T3_2200MS', 2200],
  ],
  'Absolute identity clock must preserve the preregistered four-sample schedule.',
);

assert.equal(remainingWaitMs(350, 510), 0,
  'A slow T0 read that already crossed 350 ms must not add another 350 ms delay.');
assert.equal(remainingWaitMs(1000, 512), 488,
  'T2 must wait only the remaining time to the absolute 1000 ms deadline.');
assert.equal(remainingWaitMs(2200, 1517), 683,
  'T3 must wait only the remaining time to the absolute 2200 ms deadline.');
assert.deepEqual(sampleTiming(2200, 2213.5), {
  target_elapsed_ms: 2200,
  actual_elapsed_ms: 2213.5,
  drift_ms: 13.5,
}, 'Witness receipts must preserve target, actual elapsed time, and drift.');

assert.equal(
  (probe.match(/context\.newPage\(\)/g) || []).length,
  1,
  'Identity witness must create exactly one page; a closed page may not be replaced to manufacture continuity.',
);
assert.equal(
  (probe.match(/engine\.launch\(/g) || []).length,
  1,
  'Identity witness must launch exactly one browser; a disconnected browser may not be relaunched inside one observation.',
);
assert.doesNotMatch(probe, /await page\.waitForTimeout\((?:350|650|1200)\)/,
  'Identity witness must not compound its own measurement overhead through legacy cumulative fixed waits.');
assert.match(probe, /waitUntilAbsoluteDeadline\(page, targetElapsedMs\)/,
  'Every delayed identity sample must be scheduled against its absolute post-DOMContentLoaded deadline.');
assert.match(probe, /assert\(!page\.isClosed\(\), `Aperture page closed before \$\{label\}\.\)`/,
  'Every mandatory sample must fail closed when the original page disappears.');
assert.match(probe, /All four preregistered identity samples are mandatory\./,
  'T3 must remain mandatory after absolute-clock repair.');
assert.doesNotMatch(probe, /newPage\(\)[\s\S]{0,240}(?:catch|closed|crash)[\s\S]{0,240}newPage\(/i,
  'Lifecycle diagnostics must not reopen a replacement page after a close/crash path.');
assert.doesNotMatch(probe, /T3_2200MS[\s\S]{0,300}(?:optional|skip|waive|retry)/i,
  'Lifecycle diagnostics must not weaken, skip, waive, or retry the T3 identity sample.');

console.log('aperture-v32-identity-lifecycle-diagnostics.test.mjs passed');
