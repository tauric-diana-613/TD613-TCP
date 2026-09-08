import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  'BEFORE_T3_2200MS',
  'AFTER_T3_2200MS',
  'PAGE_CLOSED',
  'PAGE_CRASHED',
  'CONTEXT_CLOSED',
  'BROWSER_DISCONNECTED',
  'TERMINAL_ERROR',
]) assert.ok(probe.includes(token), `Lifecycle diagnostic witness omitted ${token}`);

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
assert.match(probe, /waitForTimeout\(1200\)/,
  'Lifecycle diagnostics must preserve the preregistered T3 2200 ms observation window.');
assert.match(probe, /assert\(!page\.isClosed\(\), 'Aperture page closed before T3_2200MS\.'\)/,
  'T3 must fail closed when the original page disappears.');
assert.doesNotMatch(probe, /newPage\(\)[\s\S]{0,240}(?:catch|closed|crash)[\s\S]{0,240}newPage\(/i,
  'Lifecycle diagnostics must not reopen a replacement page after a close/crash path.');
assert.doesNotMatch(probe, /T3_2200MS[\s\S]{0,300}(?:optional|skip|waive|retry)/i,
  'Lifecycle diagnostics must not weaken, skip, waive, or retry the T3 identity sample.');

console.log('aperture-v32-identity-lifecycle-diagnostics.test.mjs passed');
