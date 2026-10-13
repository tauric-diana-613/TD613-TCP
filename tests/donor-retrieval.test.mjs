// Donor retrieval test. Step 3 of toy→tool: the "retrieval engine" actually
// retrieves now. For each held-out source, we (1) ask the corpus for the
// top-k donors by profile-shift magnitude, (2) run the transform against
// each retrieved donor, (3) score each output at the artifact-aware bar
// and report whether ANY top-k donor produced a passing transfer.
//
// "Retrieval coverage" = fraction of held-out sources for which at least
// one top-k donor in the corpus produces a passing transfer. If retrieval
// coverage is high, the engine can route arbitrary held-out content
// against a fixed donor pool. If it's low, the corpus is too narrow or
// the engine generalizes poorly — both are toy-vs-tool signals worth
// publishing.
//
// Reporting-only — no assert.fail, no gate on `npm test`.

import {
  buildCadenceTransfer,
  retrieveTopKDonors
} from '../app/engine/stylometry.js';
import { HELDOUT_CASES } from './heldout-cases.mjs';
import { DIAGNOSTIC_CORPUS_BY_ID } from '../app/data/diagnostics.js';

const DONOR_POOL = Object.values(DIAGNOSTIC_CORPUS_BY_ID);
const COVERAGE_FLOOR = 0.85;
const ANCHOR_FLOOR = 0.95;
const ENGAGED_CLASSES = new Set(['structural', 'surface']);
const K = 3;

function passesBar(result, sourceText) {
  return (
    ENGAGED_CLASSES.has(result.transferClass) &&
    Number(result?.semanticAudit?.propositionCoverage ?? 1) >= COVERAGE_FLOOR &&
    Number(
      result?.protectedAnchorAudit?.protectedAnchorIntegrity
        ?? result?.semanticAudit?.protectedAnchorIntegrity
        ?? 1
    ) >= ANCHOR_FLOOR &&
    Number(result?.semanticAudit?.conjunctionStackCount ?? 0) === 0 &&
    Number(result?.semanticAudit?.repeatedWordBoundaryCount ?? 0) === 0 &&
    (result.text || '') !== sourceText
  );
}

let totalSources = 0;
let sourcesWithPassingDonor = 0;
let totalDonorAttempts = 0;
let totalDonorPasses = 0;

console.log(`donor retrieval eval: ${HELDOUT_CASES.length} held-out sources × top-${K} donors retrieved from ${DONOR_POOL.length}-donor corpus`);
console.log('  bar: transferClass∈{structural,surface}, propositionCoverage>=0.85, protectedAnchorIntegrity>=0.95,');
console.log('       conjunctionStackCount=0, repeatedWordBoundaryCount=0, text!=source');
console.log();

for (const testCase of HELDOUT_CASES) {
  totalSources += 1;
  // Exclude donors in the source's same lane — we want a register shift,
  // not a same-lane echo. This mirrors how canonical retrieval cases
  // pair donors across lanes.
  const topK = retrieveTopKDonors(testCase.sourceText, DONOR_POOL, {
    k: K,
    excludeSameLane: testCase.sourceVariant
  });

  let anyPassed = false;
  const reports = [];
  for (const donor of topK) {
    totalDonorAttempts += 1;
    const shell = {
      mode: 'borrowed',
      profile: donor.profile,
      registerLane: donor.variant,
      sourceText: donor.text,
      strength: 0.88
    };
    const result = buildCadenceTransfer(testCase.sourceText, shell, {
      retrieval: true,
      sourceRegisterLane: testCase.sourceVariant
    });
    const passed = passesBar(result, testCase.sourceText);
    if (passed) {
      anyPassed = true;
      totalDonorPasses += 1;
    }
    reports.push({
      donorId: donor.id,
      donorVariant: donor.variant,
      deltaScore: donor.deltaScore,
      transferClass: result.transferClass || 'native',
      coverage: Number(result?.semanticAudit?.propositionCoverage ?? 1),
      conjunctionStacks: Number(result?.semanticAudit?.conjunctionStackCount ?? 0),
      repeatedBoundaries: Number(result?.semanticAudit?.repeatedWordBoundaryCount ?? 0),
      passed
    });
  }

  if (anyPassed) sourcesWithPassingDonor += 1;
  const tag = anyPassed ? 'OK' : 'NO-PASSING-DONOR';
  console.log(`${tag}  ${testCase.id}  (source variant: ${testCase.sourceVariant})`);
  for (const r of reports) {
    const verdict = r.passed ? 'PASS' : 'FAIL';
    console.log(`  ${verdict}  ${r.donorId} (${r.donorVariant}, ΔΣ=${r.deltaScore.toFixed(3)})  → class=${r.transferClass}, cov=${r.coverage.toFixed(3)}, conj=${r.conjunctionStacks}, echo=${r.repeatedBoundaries}`);
  }
}

const sourceCoverage = totalSources === 0 ? 0 : sourcesWithPassingDonor / totalSources;
const donorPassRate = totalDonorAttempts === 0 ? 0 : totalDonorPasses / totalDonorAttempts;

console.log();
console.log(`source coverage: ${sourcesWithPassingDonor}/${totalSources} held-out sources have at least one passing donor (${(sourceCoverage * 100).toFixed(1)}%)`);
console.log(`donor pass rate: ${totalDonorPasses}/${totalDonorAttempts} retrieved donors produce a passing transfer (${(donorPassRate * 100).toFixed(1)}%)`);
console.log('reporting-only; this does not gate npm test.');
