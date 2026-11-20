// Archived generator script for MARROWLINE_EFFECTIVE_REQUEST_PARITY.json.
// Run with TD613_OCT02_SNAPSHOT=<oct02_dir> node generate-effective-request-parity.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WORKTREE = process.env.TD613_WORKTREE || path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../../..');
const OCT02 = process.env.TD613_OCT02_SNAPSHOT || (() => { throw new Error('Set TD613_OCT02_SNAPSHOT to a git-archive checkout of ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a'); })();
const OUT = path.join(WORKTREE, 'research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_EFFECTIVE_REQUEST_PARITY.json');

const imp = (root, rel) => import(pathToFileURL(path.join(root, rel)).href);

const octCov = await imp(OCT02, 'app/dome-world/khonapolit-covenant.js');
const octApt = await imp(OCT02, 'app/engine/aperture-v3-task-intent.js');
const octQual = await imp(OCT02, 'server/khonapolit-quality.js');
const octEnv = await imp(OCT02, 'server/gemini-generation-envelope.js');

const curDisc = await imp(WORKTREE, 'research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs');
const curCov = await imp(WORKTREE, 'app/dome-world/khonapolit-covenant.js');
const curApt = await imp(WORKTREE, 'app/engine/aperture-v3-task-intent.js');
const curQual = await imp(WORKTREE, 'server/khonapolit-quality.js');
const curEnv = await imp(WORKTREE, 'server/gemini-generation-envelope.js');
const curGrove = await imp(WORKTREE, 'app/dome-world/marrowline-historical-grove.js');

const offlineReport = curDisc.buildOfflineDiscriminatorPacket();

// Compare immutable Oct 2 snapshot execution directly against current worktree
// under BOTH matched Aperture route (isolating instruction/envelope parity)
// and live auto-classified Aperture route (exposing F3 routing drift & repair).
const oct02ExactComparison = {};
for (const [taskKey, task] of Object.entries(curDisc.DISCRIMINATOR_TASKS)) {
  const octPacket = octCov.buildInvocationPacket({ message: task.prompt, mode: 'exploratory', waiveIssuance: true });
  const curPacket = curCov.buildInvocationPacket({ message: task.prompt, mode: 'exploratory', waiveIssuance: true });

  const octDiscourse = octApt.classifyApertureDiscourseMode(octPacket.message);
  const curDiscourse = curApt.classifyApertureDiscourseMode(curPacket.message);

  const octReceiptAuto = octApt.buildApertureV3InvocationReceipt({
    message: octPacket.message, invocationMode: octPacket.mode, issuanceState: octPacket.issuance.state,
    discourseMode: octDiscourse, contentScanned: true
  });
  const curReceiptAuto = curApt.buildApertureV3InvocationReceipt({
    message: curPacket.message, invocationMode: curPacket.mode, issuanceState: curPacket.issuance.state,
    discourseMode: curDiscourse, contentScanned: true
  });
  // Matched-receipt control (uses Oct 2's own discourseMode on both builds to test exact instruction byte parity)
  const curReceiptMatchedToOct2 = curApt.buildApertureV3InvocationReceipt({
    message: curPacket.message, invocationMode: curPacket.mode, issuanceState: curPacket.issuance.state,
    discourseMode: octDiscourse, contentScanned: true
  });

  const octReq = octEnv.withGeminiGenerationProfile(
    octEnv.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => octQual.buildGeminiRequest(octPacket, octReceiptAuto, 'gemini-3.8-flash')
  );
  const curLiteralMatched = curEnv.withGeminiGenerationProfile(
    curEnv.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => curQual.buildGeminiRequest(curPacket, curReceiptMatchedToOct2, 'gemini-3.8-flash', {
      groveTrial: curGrove.MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false
    })
  );
  const curLiteralAuto = curEnv.withGeminiGenerationProfile(
    curEnv.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => curQual.buildGeminiRequest(curPacket, curReceiptAuto, 'gemini-3.8-flash', {
      groveTrial: curGrove.MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: false
    })
  );

  const octWire = curQual.serializeGeminiRequest(octReq, 'gemini-3.8-flash').observation;
  const curLiteralMatchedWire = curQual.serializeGeminiRequest(curLiteralMatched, 'gemini-3.8-flash').observation;
  const curLiteralAutoWire = curQual.serializeGeminiRequest(curLiteralAuto, 'gemini-3.8-flash').observation;

  const octLines = octReq.systemInstruction.parts[0].text.split('\n');
  const curDefaultReq = curEnv.withGeminiGenerationProfile(
    curEnv.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => curQual.buildGeminiRequest(curPacket, curReceiptMatchedToOct2, 'gemini-3.8-flash', {
      groveTrial: curGrove.MARROWLINE_HISTORICAL_TRIAL_ID,
      historicalProsodyFreedom: true
    })
  );
  const curDefaultLines = curDefaultReq.systemInstruction.parts[0].text.split('\n');
  const curCandText = curGrove.buildHistoricalGroveDramaturgyCandidate(curLiteralMatched.systemInstruction.parts[0].text);
  const curCandLines = curCandText.split('\n');

  const countDiffs = (a, b) => {
    const setA = new Set(a);
    const setB = new Set(b);
    return {
      onlyInA: a.filter((l) => !setB.has(l)).length,
      onlyInB: b.filter((l) => !setA.has(l)).length,
      exactEqual: a.join('\n') === b.join('\n')
    };
  };

  oct02ExactComparison[taskKey] = {
    oct2AutoAperture: {
      discourseMode: octDiscourse,
      primaryRoute: octReceiptAuto.taskIntent.primary_route
    },
    repairedWorktreeAutoAperture: {
      discourseMode: curDiscourse,
      primaryRoute: curReceiptAuto.taskIntent.primary_route
    },
    apertureRoutingChangedByRepair: octDiscourse !== curDiscourse,
    oct02RealSnapshotWire: octWire,
    worktreeLiteralMatchedApertureWire: curLiteralMatchedWire,
    worktreeLiteralRepairedApertureWire: curLiteralAutoWire,
    exactByteParityWithOct02WhenApertureMatched: {
      bodyExactEqual: octWire.bodySha256 === curLiteralMatchedWire.bodySha256,
      systemInstructionExactEqual: octWire.systemInstructionSha256 === curLiteralMatchedWire.systemInstructionSha256,
      contentsExactEqual: octWire.contentsSha256 === curLiteralMatchedWire.contentsSha256,
      generationConfigExactEqual: octWire.generationConfigSha256 === curLiteralMatchedWire.generationConfigSha256
    },
    paragraphSetDiffsUnderMatchedAperture: {
      oct02_vs_currentRestoredDefaultPR1549: countDiffs(octLines, curDefaultLines),
      oct02_vs_stagedDramaturgyCandidatePR1545Reconciled: countDiffs(octLines, curCandLines)
    }
  };
}

const finalJson = {
  schema: 'td613.marrowline.effective-request-parity/v1',
  commission: 'TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION',
  generatedAt: new Date().toISOString(),
  executionPosture: 'OFFLINE_ZERO_SPEND_EXACT_SOURCE_EXECUTION',
  paidProviderCalls: 0,
  historicalReferenceCommit: 'ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a',
  isolatedWorktreeBaseCommit: '363b5b4aeaec33ad380c5f1124f0fe96e3d7975e',
  effectiveHttpEntrypointNote: 'api/khonapolit.js wraps text ingress in withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...), yielding thinkingLevel="medium" on gemini-3.8-flash and gemini-4-argon (PR #1555 / #1556 correction). Attachment ingress intentionally remains unprofiled thinkingLevel="high".',
  historicalModelFrontier: {
    oct02Actual: [...curGrove.MARROWLINE_HISTORICAL_MODEL_ORDER],
    currentRestoredGroveHybrid: [...curGrove.MARROWLINE_RESTORED_MODEL_ORDER],
    note: 'gemini-4-argon did not exist on October 2, 2026; restored-grove production default combines Oct-2-derived text with the current Argon-first frontier.'
  },
  oct02SnapshotVsCurrentWorktree: oct02ExactComparison,
  currentWorktreeOfflineDiscriminator: offlineReport
};

fs.writeFileSync(OUT, `${JSON.stringify(finalJson, null, 2)}\n`, 'utf8');
console.log('Wrote MARROWLINE_EFFECTIVE_REQUEST_PARITY.json:', Buffer.byteLength(JSON.stringify(finalJson), 'utf8'), 'bytes');
for (const [k, v] of Object.entries(oct02ExactComparison)) {
  console.log(k, 'oct2Auto=', v.oct2AutoAperture.discourseMode, 'repairedAuto=', v.repairedWorktreeAutoAperture.discourseMode,
    'exactParityMatched=', v.exactByteParityWithOct02WhenApertureMatched.bodyExactEqual,
    'pr1549Diffs=', v.paragraphSetDiffsUnderMatchedAperture.oct02_vs_currentRestoredDefaultPR1549.onlyInA,
    'pr1545CandDiffs=', v.paragraphSetDiffsUnderMatchedAperture.oct02_vs_stagedDramaturgyCandidatePR1545Reconciled.onlyInA);
}
