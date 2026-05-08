// Held-out retrieval-lane evaluation. Runs the engine against brand-new
// cases the engine has never been tuned on (see tests/heldout-cases.mjs)
// and reports the pass-rate against the same bar canonical fixtures hold:
//
//   - transferClass in { structural, surface }     (engine actually shifted)
//   - propositionCoverage >= 0.85                  (meaning preserved at the audit's bar)
//   - protectedAnchorIntegrity >= 0.95             (literals/anchors survived)
//   - conjunctionStackCount == 0                   (no "and but" / "but and" / "or and" artifacts)
//   - repeatedWordBoundaryCount == 0               (no "X. X" sentence-split echoes)
//   - output text differs from source text         (something happened)
//
// This file does NOT call assert.fail / process.exit(1) on misses. The gap
// between the canonical pass-rate (100%, by construction) and the held-out
// pass-rate is the published toy-vs-tool number for the retrieval engine.
// If you want a regression gate, gate the gap — not the held-out cases
// themselves.

import {
  buildCadenceTransfer,
  extractCadenceProfile
} from '../app/engine/stylometry.js';
import { HELDOUT_CASES, buildHeldoutShell } from './heldout-cases.mjs';

const COVERAGE_FLOOR = 0.85;
const ANCHOR_FLOOR = 0.95;
const ENGAGED_CLASSES = new Set(['structural', 'surface']);

function evaluateCase(testCase) {
  const shell = buildHeldoutShell(extractCadenceProfile, testCase);
  const result = buildCadenceTransfer(testCase.sourceText, shell, {
    retrieval: true,
    sourceRegisterLane: testCase.sourceVariant || undefined
  });

  const transferClass = result.transferClass || 'native';
  const propositionCoverage = Number(result?.semanticAudit?.propositionCoverage ?? 1);
  const anchorIntegrity = Number(
    result?.protectedAnchorAudit?.protectedAnchorIntegrity
      ?? result?.semanticAudit?.protectedAnchorIntegrity
      ?? 1
  );
  const conjunctionStacks = Number(result?.semanticAudit?.conjunctionStackCount ?? 0);
  const repeatedBoundaries = Number(result?.semanticAudit?.repeatedWordBoundaryCount ?? 0);
  const textDiffers = (result.text || '') !== testCase.sourceText;

  const checks = {
    engaged: ENGAGED_CLASSES.has(transferClass),
    coveragePassed: propositionCoverage >= COVERAGE_FLOOR,
    anchorsPassed: anchorIntegrity >= ANCHOR_FLOOR,
    noConjunctionStacks: conjunctionStacks === 0,
    noRepeatedBoundaries: repeatedBoundaries === 0,
    textDiffers
  };
  const passed = Object.values(checks).every(Boolean);

  return {
    id: testCase.id,
    transferClass,
    propositionCoverage,
    anchorIntegrity,
    conjunctionStacks,
    repeatedBoundaries,
    textDiffers,
    checks,
    passed
  };
}

function failureReason(report) {
  const reasons = [];
  if (!report.checks.engaged) reasons.push(`transferClass=${report.transferClass}`);
  if (!report.checks.coveragePassed) reasons.push(`coverage=${report.propositionCoverage.toFixed(3)}`);
  if (!report.checks.anchorsPassed) reasons.push(`anchors=${report.anchorIntegrity.toFixed(3)}`);
  if (!report.checks.noConjunctionStacks) reasons.push(`conj-stacks=${report.conjunctionStacks}`);
  if (!report.checks.noRepeatedBoundaries) reasons.push(`repeated-bounds=${report.repeatedBoundaries}`);
  if (!report.checks.textDiffers) reasons.push('no-shift');
  return reasons.join(' / ');
}

const reports = HELDOUT_CASES.map(evaluateCase);
const passed = reports.filter((r) => r.passed).length;
const total = reports.length;
const rate = total === 0 ? 0 : passed / total;

console.log(`held-out retrieval eval: ${passed}/${total} passed (${(rate * 100).toFixed(1)}%)`);
console.log('  bar: transferClass∈{structural,surface}, propositionCoverage>=0.85, protectedAnchorIntegrity>=0.95,');
console.log('       conjunctionStackCount=0, repeatedWordBoundaryCount=0, text!=source');
for (const report of reports) {
  const tag = report.passed ? 'PASS' : 'FAIL';
  const detail = report.passed
    ? `${report.transferClass}, cov=${report.propositionCoverage.toFixed(3)}, anchor=${report.anchorIntegrity.toFixed(3)}`
    : failureReason(report);
  console.log(`  ${tag}  ${report.id}  ${detail}`);
}
console.log('held-out is reporting-only and does not gate npm test; the gap from 100% is the toy-vs-tool number.');
