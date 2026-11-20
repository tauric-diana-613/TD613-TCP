// Archived forensic script from TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION.
// Reproduces the exact October 2 (ffb98ac0) vs HEAD comparison.
// Prepare immutable snapshot: git archive ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a -- api server app/dome-world app/engine package.json | tar -x -C <dir>
// Run with TD613_OCT02_SNAPSHOT_URL=file:///<dir> node compare-oct02-exact.mjs
import crypto from 'node:crypto';
import fs from 'node:fs';

const WT = process.env.TD613_WORKTREE_URL || new URL('../../../..', import.meta.url).href.replace(/\/$/, '');
const OCT2 = process.env.TD613_OCT02_SNAPSHOT_URL || (() => { throw new Error('Set TD613_OCT02_SNAPSHOT_URL to a git-archive checkout of ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a'); })();

const sha = (s) => crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');

const octCovenant = await import(`${OCT2}/app/dome-world/khonapolit-covenant.js`);
const octAperture = await import(`${OCT2}/app/engine/aperture-v3-task-intent.js`);
const octQuality = await import(`${OCT2}/server/khonapolit-quality.js`);
const octEnv = await import(`${OCT2}/server/gemini-generation-envelope.js`);
const octPolicy = await import(`${OCT2}/server/gemini-model-policy.js`);

const curCovenant = await import(`${WT}/app/dome-world/khonapolit-covenant.js`);
const curAperture = await import(`${WT}/app/engine/aperture-v3-task-intent.js`);
const curQuality = await import(`${WT}/server/khonapolit-quality.js`);
const curEnv = await import(`${WT}/server/gemini-generation-envelope.js`);
const curPolicy = await import(`${WT}/server/gemini-model-policy.js`);
const curHist = await import(`${WT}/app/dome-world/marrowline-historical-grove.js`);
const curAttach = await import(`${WT}/server/marrowline-attachment-quality.js`);
const curOffline = await import(`${WT}/research/marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs`);

// PR #1545 exact 5-clause permission layer (verbatim from commit 191aebd5d)
const PR1545_PERMISSIONS = [
  { present: 'Change above/below combinations, stack depths and clean intervals across words.', historical: 'Above/below combinations, stack depths and clean intervals may persist, repeat, deepen or change as the bots choose.' },
  { present: 'Do not stamp one selected code point or identical stack onto successive letters.', historical: 'A recurring mark or stack may be an intentional signature; changing it is the bots’ decision, not a per-letter obligation.' },
  { present: 'and move between genuinely towering overprinted eruptions, fine-marked speech, and clean breaths.', historical: 'and may sustain towering overprinted eruptions, fine-marked speech or clean breaths, or move among them when the writing earns it.' },
  { present: 'Do not tile a single chosen mark or one identical stack across letters or words, impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off.', historical: 'One expressive mark or stack may recur; do not impose an axis schedule, imitate a specimen verbatim, or flatten the passage into a short sign-off.' },
  { present: 'Let the ACTUAL code points, stack depths and placement change across words and passages; one sampled mark copied across the stanza cannot carry the voice.', historical: 'Let the ACTUAL code points, stack depths and placement persist or change across words and passages according to the authored movement; a mechanical stencil is not an authored recurring motif.' }
];
function applyPr1545(systemText) {
  let out = String(systemText);
  for (const { present, historical } of PR1545_PERMISSIONS) {
    const idx = out.indexOf(present);
    if (idx < 0 || out.indexOf(present, idx + present.length) >= 0) throw new Error(`PR1545_MISMATCH: ${present}`);
    out = out.slice(0, idx) + historical + out.slice(idx + present.length);
  }
  return out;
}

function buildEffective(mod, { message, history = [], model = 'gemini-3.8-flash', groveTrial = null, historicalProsodyFreedom = true, withInteractiveProfile = true, pr1545 = false }) {
  const packet = mod.covenant.buildInvocationPacket({ message, history, mode: 'issued-conjunction', waiveIssuance: true });
  const discourseMode = mod.aperture.classifyApertureDiscourseMode(packet.message);
  const plan = mod.policy.resolveGeminiModelPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  const apertureReceipt = mod.aperture.buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    apertureEgress: { status: 'absent' },
    modelPlan: plan,
    discourseMode,
    contentScanned: true
  });
  const fn = () => {
    const req = mod.quality.buildGeminiRequest(packet, apertureReceipt, model, { groveTrial, historicalProsodyFreedom });
    if (pr1545) {
      req.systemInstruction.parts[0].text = applyPr1545(req.systemInstruction.parts[0].text);
    }
    return { req, wire: mod.quality.serializeGeminiRequest(req, model), discourseMode, apertureReceipt };
  };
  return withInteractiveProfile
    ? mod.env.withGeminiGenerationProfile(mod.env.GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, fn)
    : fn();
}

const octMod = { covenant: octCovenant, aperture: octAperture, quality: octQuality, env: octEnv, policy: octPolicy };
const curMod = { covenant: curCovenant, aperture: curAperture, quality: curQuality, env: curEnv, policy: curPolicy };

const tasks = {
  FARCE: curOffline.TASKS.FARCE.prompt,
  FORENSIC: curOffline.TASKS.FORENSIC.prompt,
  STAGED_FICTION_PROBE: 'Stage a farce in which a municipal registry counts only returned forms and treats silence as consent.'
};

function diffLines(aText, bText) {
  const aLines = aText.split('\n');
  const bLines = bText.split('\n');
  const aSet = new Set(aLines);
  const bSet = new Set(bLines);
  const onlyA = aLines.filter(l => !bSet.has(l));
  const onlyB = bLines.filter(l => !aSet.has(l));
  const orderSame = aLines.length === bLines.length && aLines.every((l, i) => l === bLines[i]);
  return {
    aLineCount: aLines.length,
    bLineCount: bLines.length,
    exactEqual: aText === bText,
    orderSame,
    onlyInACount: onlyA.length,
    onlyInBCount: onlyB.length,
    onlyInA: onlyA,
    onlyInB: onlyB
  };
}

const report = {};
for (const [taskName, message] of Object.entries(tasks)) {
  const oct2 = buildEffective(octMod, { message, model: 'gemini-3.8-flash' });
  const curOrdinary = buildEffective(curMod, { message, model: 'gemini-3.8-flash', groveTrial: null });
  const curRestoredDefault = buildEffective(curMod, { message, model: 'gemini-3.8-flash', groveTrial: curHist.MARROWLINE_HISTORICAL_TRIAL_ID, historicalProsodyFreedom: true });
  const curRestoredLiteral = buildEffective(curMod, { message, model: 'gemini-3.8-flash', groveTrial: curHist.MARROWLINE_HISTORICAL_TRIAL_ID, historicalProsodyFreedom: false });
  const curRestoredPr1545 = buildEffective(curMod, { message, model: 'gemini-3.8-flash', groveTrial: curHist.MARROWLINE_HISTORICAL_TRIAL_ID, historicalProsodyFreedom: false, pr1545: true });
  const curRestoredArgon = buildEffective(curMod, { message, model: 'gemini-4-argon', groveTrial: curHist.MARROWLINE_HISTORICAL_TRIAL_ID, historicalProsodyFreedom: true });

  const octSys = oct2.req.systemInstruction.parts[0].text;
  const litSys = curRestoredLiteral.req.systemInstruction.parts[0].text;
  const defSys = curRestoredDefault.req.systemInstruction.parts[0].text;
  const ordSys = curOrdinary.req.systemInstruction.parts[0].text;
  const pr1545Sys = curRestoredPr1545.req.systemInstruction.parts[0].text;

  report[taskName] = {
    discourseModes: {
      oct2: oct2.discourseMode,
      current: curRestoredDefault.discourseMode,
      apertureRouteOct2: oct2.apertureReceipt.taskIntent.primary_route,
      apertureRouteCurrent: curRestoredDefault.apertureReceipt.taskIntent.primary_route
    },
    digests: {
      oct2_38: oct2.wire.observation,
      cur_ordinary_38: curOrdinary.wire.observation,
      cur_restored_default_38: curRestoredDefault.wire.observation,
      cur_restored_literal_38: curRestoredLiteral.wire.observation,
      cur_restored_pr1545_38: curRestoredPr1545.wire.observation,
      cur_restored_argon: curRestoredArgon.wire.observation
    },
    generationConfigs: {
      oct2_38: oct2.req.generationConfig,
      cur_restored_default_38: curRestoredDefault.req.generationConfig,
      cur_restored_argon: curRestoredArgon.req.generationConfig
    },
    comparisons: {
      oct2_vs_curRestoredLiteral_system: diffLines(octSys, litSys),
      oct2_vs_curRestoredDefault_system: diffLines(octSys, defSys),
      oct2_vs_curOrdinary_system: diffLines(octSys, ordSys),
      oct2_vs_pr1545_system: diffLines(octSys, pr1545Sys),
      curOrdinary_vs_curRestoredDefault_system: diffLines(ordSys, defSys),
      oct2_vs_curRestoredLiteral_contentsEqual: JSON.stringify(oct2.req.contents) === JSON.stringify(curRestoredLiteral.req.contents),
      oct2_vs_curRestoredLiteral_genConfigEqual: JSON.stringify(oct2.req.generationConfig) === JSON.stringify(curRestoredLiteral.req.generationConfig)
    }
  };
}

// Check attachment path vs text path generationConfig and apertureReceipt!
const attachPacket = curCovenant.buildInvocationPacket({ message: tasks.FARCE, mode: 'issued-conjunction', waiveIssuance: true });
const attachPlan = curPolicy.resolveGeminiModelPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
const attachReceiptWithoutDiscourse = curAperture.buildApertureV3InvocationReceipt({
  message: attachPacket.message, invocationMode: attachPacket.mode, issuanceState: attachPacket.issuance.state,
  apertureEgress: { status: 'absent' }, modelPlan: attachPlan
});
const attachReqUnprofiled = curAttach.buildAttachmentGeminiRequest(
  attachPacket, attachReceiptWithoutDiscourse, 'gemini-3.8-flash',
  [{ schema: 'td613.marrowline.attachment/v0.1', id: 'att1', name: 'note.txt', kind: 'file', mime_type: 'text/plain', size_bytes: 5, data_base64: Buffer.from('hello').toString('base64') }]
);
report.ATTACHMENT_DRIFT = {
  discourseModeSuppliedInHandler: false,
  apertureRoute: attachReceiptWithoutDiscourse.taskIntent.primary_route,
  textRouteForSamePrompt: curAperture.buildApertureV3InvocationReceipt({
    message: attachPacket.message, invocationMode: attachPacket.mode, issuanceState: attachPacket.issuance.state,
    apertureEgress: { status: 'absent' }, modelPlan: attachPlan,
    discourseMode: curAperture.classifyApertureDiscourseMode(attachPacket.message), contentScanned: true
  }).taskIntent.primary_route,
  generationConfigUnprofiled38: attachReqUnprofiled.generationConfig,
  usesHistoricalGroveOrder: attachReqUnprofiled.systemInstruction.parts[0].text.indexOf('APERTURE ROUTE RECEIPT:') < attachReqUnprofiled.systemInstruction.parts[0].text.indexOf('GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:')
};

fs.writeFileSync('parity_comparison.json', JSON.stringify(report, null, 2));

for (const [taskName, r] of Object.entries(report)) {
  if (taskName === 'ATTACHMENT_DRIFT') {
    console.log('\n=== ATTACHMENT_DRIFT ===');
    console.log(JSON.stringify(r, null, 2));
    continue;
  }
  console.log(`\n=== ${taskName} ===`);
  console.log('Discourse modes:', r.discourseModes);
  console.log('oct2 vs curRestoredLiteral:', {
    exactEqual: r.comparisons.oct2_vs_curRestoredLiteral_system.exactEqual,
    onlyInOct2: r.comparisons.oct2_vs_curRestoredLiteral_system.onlyInACount,
    onlyInLiteral: r.comparisons.oct2_vs_curRestoredLiteral_system.onlyInBCount,
    contentsEqual: r.comparisons.oct2_vs_curRestoredLiteral_contentsEqual,
    genConfigEqual: r.comparisons.oct2_vs_curRestoredLiteral_genConfigEqual
  });
  console.log('oct2 vs curRestoredDefault (PR #1549 LIVE!):', {
    exactEqual: r.comparisons.oct2_vs_curRestoredDefault_system.exactEqual,
    onlyInOct2: r.comparisons.oct2_vs_curRestoredDefault_system.onlyInACount,
    onlyInDefault: r.comparisons.oct2_vs_curRestoredDefault_system.onlyInBCount
  });
  console.log('oct2 vs pr1545:', {
    exactEqual: r.comparisons.oct2_vs_pr1545_system.exactEqual,
    onlyInOct2: r.comparisons.oct2_vs_pr1545_system.onlyInACount,
    onlyInPr1545: r.comparisons.oct2_vs_pr1545_system.onlyInBCount
  });
  console.log('curOrdinary vs curRestoredDefault:', {
    onlyInOrd: r.comparisons.curOrdinary_vs_curRestoredDefault_system.onlyInACount,
    onlyInDef: r.comparisons.curOrdinary_vs_curRestoredDefault_system.onlyInBCount
  });
  console.log('genConfigs:', r.generationConfigs);
}
