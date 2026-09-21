import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  KHONAPOLIT_RAW_PACKET_PROTOCOL,
  assessIntegratedTransmission,
  buildRelaySystemAddendum,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import { COVENANT_KEY } from '../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../app/engine/aperture-v3-task-intent.js';
import {
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
  khonapolitTaskGuidance,
  severeMorphologyRepairWarnings
} from '../server/khonapolit-quality.js';

const mobileCss = readFileSync(new URL('../app/dome-world/marrowline-mobile-shell.css', import.meta.url), 'utf8');
const physicalRepair = readFileSync(new URL('../app/dome-world/marrowline-physical-device-repair.js', import.meta.url), 'utf8');
const readinessCss = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.css', import.meta.url), 'utf8');
const qualityServer = readFileSync(new URL('../server/khonapolit-quality.js', import.meta.url), 'utf8');
const livingChat = readFileSync(new URL('../app/dome-world/marrowline-living-chat.js', import.meta.url), 'utf8');
const relaySource = readFileSync(new URL('../app/dome-world/khonapolit-relay.js', import.meta.url), 'utf8');
const terminalSource = readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
const roomBootSource = readFileSync(new URL('../app/dome-world/marrowline-egress-boot.js', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');

function countMarks(value = '') {
  return [...String(value).matchAll(/\p{M}/gu)].length;
}
const STACK = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const highBurst = (line) => `${STACK.repeat(8)} ${line}`;

test('relay contract gives the generative budget to one required two-voice covenant transmission', () => {
  const contract = buildRelaySystemAddendum({});
  assert.match(contract, /MARROWLINE DUAL-CHANNEL COMPILATION LAW/i);
  assert.match(contract, /DERIVE_INVARIANT → EMIT_FORMAL maps to Kʰonapolit/i);
  assert.match(contract, /OVERFLOW_RAW maps to Tauric Diana bots/i);
  assert.match(contract, /RAW TWO-PACKET RETURN PROTOCOL/i);
  assert.match(contract, /<<<PACKET_A_FORMAL_AUDIT>>>/i);
  assert.match(contract, /<<<PACKET_B_STRESS_TELEMETRY>>>/i);
  assert.match(contract, /exact standalone human-facing headings/i);
  assert.doesNotMatch(contract, /RETURN JSON ONLY/i);
  assert.match(contract, /ZERO combining diacritical marks/i);
  assert.match(contract, /DUAL-CHANNEL ORTHOGRAPHY — DEEP VERTICAL FIELD/i);
  assert.match(contract, /scream-sing the “fun and scary” relayed transmission/i);
  assert.match(contract, /VERTICAL ARCHITECTURE means STACK HEIGHT AND DEPTH, not merely vertical POSITION/i);
  assert.match(contract, /same little pair repeated over every character is LOW-ZALGO WALLPAPER/i);
  assert.match(contract, /irregular SAME-GRAPHEME multi-tier stacks/i);
  assert.match(contract, /DO NOT stamp a repeated diaeresis-like/i);
  assert.match(contract, /Horizontal and oblique cuts remain available only as local counter-rhythm/i);
  assert.match(contract, /ALLOW ENTROPY/i);
  assert.match(contract, /THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS/i);
  assert.match(contract, /never decorates, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward/i);
  assert.match(contract, /multiple heterogeneous marks can accumulate above and below one base/i);
  assert.match(contract, /Some phrases may climb, some may sink/i);
  assert.match(contract, /repeated diaeresis-like, dot-like, breve-like, macron-like, hook-like, or paired accent pattern/i);
  assert.match(contract, /Dense peaks may collide with neighboring lines/i);
  assert.match(contract, /vertical voice must return without operator prompting/i);
  assert.ok(contract.includes('Literal ASCII /, \\, |, _, ='));
  assert.match(contract, /NATIVE-VOICE SELF-CHECK — DEEP STACK, NOT SHALLOW WALLPAPER/i);
  assert.match(contract, /Do not count marks, signatures, percentages, or lines/i);
  assert.doesNotMatch(contract, /at least 96 combining marks total/i);
  assert.doesNotMatch(contract, /marked grapheme coverage >=28%/i);
  assert.doesNotMatch(contract, /SILENT PRE-EMISSION CHECK FOR PACKET B/i);
  assert.doesNotMatch(contract, /Dense-stack geometry family/i);
  assert.doesNotMatch(contract, /ORTHOGRAPHIC STENCIL/i);
  assert.match(contract, /The target is not generic dark-fantasy lore/i);
  assert.match(contract, /strongest conceptual move/i);
  assert.match(contract, /Rex Nemorensis is not generic “king” decoration/i);
  assert.match(contract, /Eclipse–Omega is not generic evil-AI scenery/i);
  assert.doesNotMatch(contract, /gemini\.text:/i);
  assert.doesNotMatch(contract, /tauricDianaBots\.baseText:/i);
  assert.doesNotMatch(contract, /exactly one paragraph|200 characters|max(?:imum)?\s+200/i);
});

test('natural distributed field is admissible without satisfying the old Zalgo Olympics', () => {
  const a = 'W\u0301\u0316';
  const b = 'E\u0302\u0323\u0334';
  const c1 = 'A\u0303\u0317';
  const d = 'R\u0307\u0325';
  const e = 'N\u0308\u0319\u0335';
  const f1 = 'O\u0304\u032D';
  const natural = [
    'Kʰonapolit',
    'The formal channel stays clean and names the mechanism.',
    '',
    'Tauric Diana bots',
    `${a}${b}${c1}${d}${e}${f1}${a}${b} FIELD MOVES THROUGH THE WHOLE CLAUSE`,
    `${f1}${a}${d}${b}${c1}${e}${f1}${d} MARKS BREATHE WHILE HEIGHT CHANGES`,
    `${e}${f1}${b}${d}${a}${c1}${e}${b} NO SINGLE TOKEN OWNS THE SCREAM`
  ].join('\n');
  const admitted = assessIntegratedTransmission(natural, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.ok(admitted.combiningMarkCount >= 24);
  assert.ok(admitted.combiningMarkCount < 96, 'natural field deliberately stays below the retired 96-mark quota');
  assert.ok(admitted.maxRun >= 3);
  assert.ok(admitted.broadMarkedLineCount >= 2, 'multiple bot lines carry a broad field even though clean Kʰonapolit dilutes whole-response coverage telemetry');
  assert.ok(admitted.combiningCodePointDiversity >= 4);
  assert.equal(admitted.activeAxisCount, 2);
  assert.ok(admitted.axisClusterBalanceRatio > 0);
  assert.equal(admitted.qualityWarnings.includes('tauric-diana-zalgo-axis-collapse'), false);
  assert.equal(admitted.reasons.includes('tauric-diana-zalgo-sparse-keyword-targeting'), false);
  assert.equal(admitted.admissible, true, admitted.reasons.join(', '));
});

test('mechanically cloned dense stacks stay visible as PARTIAL quality telemetry', () => {
  const cloned = 'T\u0300\u0301\u0302\u0316\u0317\u0318';
  const counterfeit = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${cloned.repeat(12)} THE WALL SHOUTS BUT NEVER CHANGES ITS MOUTH!`,
    `${cloned.repeat(12)} THE SAME STACK RETURNS ON EVERY BEAT!`,
    `${cloned.repeat(12)} THIS CLEARS THE OLD COUNTERS AND STILL SAYS NOTHING WITH THE MARKS!`
  ].join('\n');
  const observed = assessIntegratedTransmission(counterfeit, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.ok(observed.combiningMarkCount >= 96, 'fixture clears the old scalar mark floor');
  assert.ok(observed.denseVerticalClusterCount >= 8, 'fixture clears the old dense-cluster count');
  assert.equal(observed.uniqueDenseStackSignatureCount, 1);
  assert.equal(observed.dominantDenseStackRatio, 1);
  assert.equal(observed.admissible, true);
  assert.equal(observed.quality, 'PARTIAL');
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-mechanical-clone'));
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-monoculture'));
});

test('sparse keyword explosions stay visible as PARTIAL quality telemetry', () => {
  const sparsePeak = `${STACK.repeat(3)}`;
  const counterfeit = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${sparsePeak} THIS ENTIRE SURROUNDING SENTENCE REMAINS DELIBERATELY UNMARKED DESPITE A DENSE OPENING PEAK`,
    `${sparsePeak} ANOTHER VERY LONG UNMARKED CLAUSE MAKES THE OLD COUNTERS LOOK HEALTHY WHILE THE FIELD IS EMPTY`,
    `${sparsePeak} THE THIRD LINE REPEATS THE SAME KEYWORD TARGETING FAILURE ACROSS A LARGE CLEAN PHRASE`
  ].join('\n');
  const observed = assessIntegratedTransmission(counterfeit, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.ok(observed.combiningMarkCount >= 96);
  assert.ok(observed.denseVerticalClusterCount >= 8);
  assert.ok(observed.denseMarkedLineCount >= 3);
  assert.ok(observed.markedGraphemeCoverageRatio < 0.28, 'fixture passes peak counters while leaving most graphemes inert');
  assert.equal(observed.admissible, true);
  assert.equal(observed.quality, 'PARTIAL');
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-sparse-keyword-targeting'));
});

test('horizontal-only slash and strike fields remain visible but cannot masquerade as a complete mixed-axis field', () => {
  const slash = 'T\u0337A\u0338U\u0337R\u0338I\u0337C\u0338';
  const horizontal = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${slash.repeat(8)} THE BUREAU DRAWS A LINE THROUGH THE WHOLE SENTENCE!`,
    `${slash.repeat(8)} IT CALLS THE STRIKE A STORM AND HOPES NOBODY LOOKS UP!`,
    `${slash.repeat(8)} HORIZONTAL GEOMETRY IS A REAL STRESS CHANNEL, NOT A FAILED VERTICAL ONE!`
  ].join('\n');
  const observed = assessIntegratedTransmission(horizontal, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true, observed.reasons.join(', '));
  assert.equal(observed.quality, 'PARTIAL');
  assert.equal(observed.verticalOrnamentMarkCount, 0);
  assert.ok(observed.planarMarkCount > 0);
  assert.equal(observed.tallVerticalOrnamentClusterCount, 0);
  assert.equal(observed.reasons.includes('tauric-diana-zalgo-underflow'), false);
  assert.equal(observed.activeAxisCount, 1);
  assert.equal(observed.verticalMarkedClusterCount, 0);
  assert.ok(observed.throughMarkedClusterCount > 0);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-axis-collapse'));
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-field-thin'));
});

test('horizontal-heavy High Zalgo with token vertical accents is PARTIAL until vertical theatre has real depth', () => {
  const slash = 'T\u0337A\u0338U\u0337R\u0338I\u0337C\u0338';
  const tokenVertical = 'V\u0301\u0316';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${slash.repeat(8)} ${tokenVertical.repeat(2)} THE STRIKE FIELD IS HUGE BUT THE VERTICAL VOICE ONLY WHISPERS!`,
    `${slash.repeat(8)} ${tokenVertical.repeat(2)} A FEW POLITE ACCENTS CANNOT IMPERSON CROWNS AND DESCENDERS!`,
    `${slash.repeat(8)} ${tokenVertical.repeat(2)} KEEP THE HORIZONTAL FIRE; RESTORE ACTUAL HEIGHT AND DEPTH!`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true, observed.reasons.join(', '));
  assert.equal(observed.quality, 'PARTIAL');
  assert.equal(observed.activeAxisCount, 2);
  assert.ok(observed.planarMarkCount > observed.verticalOrnamentMarkCount);
  assert.ok(observed.tallVerticalOrnamentClusterCount < 2);
  assert.ok(observed.tallVerticalMarkedLineCount < 2);
  assert.ok(observed.axisMarkBalanceRatio < 0.22);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-vertical-expression-thin'));
});

test('lush multi-tier crowns and descenders clear the vertical-expression warning while horizontal strikes remain first-class', () => {
  const slash = 'T\u0337A\u0338U\u0337R\u0338I\u0337C\u0338';
  const crown = 'V\u0300\u0301\u0302\u0316\u0317\u0318';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${slash.repeat(5)} ${crown.repeat(3)} THE STRIKES CUT WHILE THE CROWN CLIMBS ABOVE THEM!`,
    `${crown.repeat(3)} ${slash.repeat(5)} THE ROOTS DROP BELOW THE LINE WITHOUT ERASING THE SLASHES!`,
    `${slash.repeat(4)} ${crown.repeat(4)} BOTH GEOMETRIES GET TO BE LOUD IN DIFFERENT WAYS!`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true, observed.reasons.join(', '));
  assert.equal(observed.activeAxisCount, 2);
  assert.ok(observed.tallVerticalOrnamentClusterCount >= 2);
  assert.ok(observed.tallVerticalMarkedLineCount >= 2);
  assert.ok(observed.verticalOrnamentMarkCount > 0);
  assert.ok(observed.axisMarkBalanceRatio >= 0.22);
  assert.equal(observed.qualityWarnings.includes('tauric-diana-zalgo-vertical-expression-thin'), false);
});

test('vertical-only crowns and descenders remain valid without forced horizontal balance', () => {
  const vertical = 'T\u0300\u0316A\u0301\u0317U\u0302\u0318R\u0306\u0319I\u0307\u031CC\u0308\u031D';
  const verticalOnly = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${vertical.repeat(8)} THE CROWN RISES AND THE ROOTS DESCEND WITHOUT A SINGLE STRIKE THROUGH THE LINE!`,
    `${vertical.repeat(8)} THIS AXIS IS EXPRESSIVE BUT THE WHOLE PASSAGE HAS LOST ITS HORIZONTAL MOTION!`,
    `${vertical.repeat(8)} KEEP THE BYTES; MARK THE MORPHOLOGY PARTIAL; DO NOT ERASE THE VOICE!`
  ].join('\n');
  const observed = assessIntegratedTransmission(verticalOnly, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true, observed.reasons.join(', '));
  assert.equal(observed.activeAxisCount, 1);
  assert.ok(observed.verticalMarkedClusterCount > 0);
  assert.ok(observed.verticalOrnamentMarkCount > 0);
  assert.equal(observed.planarMarkCount, 0);
  assert.equal(observed.throughMarkedClusterCount, 0);
  assert.equal(observed.qualityWarnings.includes('tauric-diana-zalgo-axis-collapse'), false);
});

test('overlines and underlines remain planar bars instead of counterfeiting vertical crowns', () => {
  const bar = 'B\u0304\u0305\u0331\u0332\u0337\u0338';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${bar.repeat(8)} THE PAGE LOOKS UNDERLINED INSTEAD OF ALIVE!`,
    `${bar.repeat(8)} POSITION ABOVE OR BELOW THE BASELINE IS NOT THE SAME AS VERTICAL SHAPE!`,
    `${bar.repeat(8)} BARS CANNOT COUNTERFEIT CROWNS AND DESCENDERS!`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.equal(observed.quality, 'PARTIAL');
  assert.equal(observed.verticalOrnamentMarkCount, 0);
  assert.equal(observed.planarMarkCount, observed.combiningMarkCount);
  assert.equal(observed.tallVerticalOrnamentClusterCount, 0);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-axis-collapse'));
});

test('reordering one mark set cannot disguise a cloned High-Zalgo composition', () => {
  const a = 'T\u0300\u0301\u0302\u0316\u0317\u0318';
  const b = 'A\u0318\u0317\u0316\u0302\u0301\u0300';
  const c = 'R\u0302\u0316\u0300\u0318\u0301\u0317';
  const d = 'I\u0317\u0300\u0318\u0301\u0316\u0302';
  const counterfeit = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${a.repeat(4)}${b.repeat(4)} SHUFFLE THE SAME SIX MARKS!`,
    `${c.repeat(4)}${d.repeat(4)} CHANGE THE ORDER, KEEP THE COSTUME!`,
    `${b.repeat(4)}${a.repeat(4)} THIS MUST STILL COUNT AS ONE COMPOSITION!`
  ].join('\n');
  const observed = assessIntegratedTransmission(counterfeit, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.ok(observed.combiningMarkCount >= 96);
  assert.ok(observed.denseVerticalClusterCount >= 8);
  assert.equal(observed.uniqueDenseStackSignatureCount, 1, 'signature canonicalization ignores mark order and measures composition');
  assert.equal(observed.admissible, true);
  assert.equal(observed.quality, 'PARTIAL');
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-mechanical-clone'));
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-monoculture'));
});

test('near-zero provider-authored marks are hard-held instead of escaping as best PARTIAL', () => {
  const sparse = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    'TH\u0307E CH\u0307AIRMAN WANTS A RECEIPT FOR THE SMOKE.',
    '',
    'HE THINKS IF HE SQUEEZES THE GROVE HARD ENOUGH IT JUST BECOMES EFFICIENT.',
    '',
    'ASH IS NOT A PREVIEW.'
  ].join('\n');
  const held = assessIntegratedTransmission(sparse, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(held.admissible, false);
  assert.equal(held.quality, 'HELD');
  assert.ok(held.reasons.includes('tauric-diana-zalgo-underflow'));
  assert.ok(held.combiningMarkCount > 0, 'fixture proves nonzero marks alone cannot satisfy the channel');
});

test('zero provider-authored marks remain a hard Tauric Diana channel failure', () => {
  const plain = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    'THE RAW CHANNEL ARRIVED COMPLETELY PLAIN.'
  ].join('\n');
  const held = assessIntegratedTransmission(plain, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(held.admissible, false);
  assert.equal(held.quality, 'HELD');
  assert.ok(held.reasons.includes('tauric-diana-zalgo-absent'));
});

test('Worm Moon analytics reject canon-as-phrase-bank while preserving transformed mythic reasoning', () => {
  const contract = buildRelaySystemAddendum({});
  assert.match(contract, /Canon is a constraint graph and creative pressure field, NOT a phrase bank/i);
  assert.match(contract, /canonical noun in the operator prompt is not a retrieval key for the nearest corpus paragraph/i);
  assert.match(contract, /Movement II may mutate, intensify, ridicule, ritualize, or extend Movement I, but it may not abandon the analysis for a generic covenant recital/i);
  assert.match(contract, /Prior diagnostics[\s\S]*examples of generative method, not a menu of reusable labels/i);

  const recital = [
    '[Kʰonapolit]:',
    'The denominator excludes the wrong shore and therefore reports only what survived the gate.',
    '',
    '[Tauric Diana Bots : Recital Failure]',
    'Inheritance is not consent. Ash is not an apology. Ash is residue of the beauty burned by the Light. The Light exposes, optimizes, and burns what ash holds as residue. Moonlight is testimony.'
  ].join('\n');
  const held = assessIntegratedTransmission(recital, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(held.admissible, false, 'dense ritual recall must not escape merely because the voice envelope is structurally valid');
  assert.ok(held.reasons.includes('canonical-recitation-detected'));
  assert.equal(held.canonicalRecitation.detected, true);
  assert.ok(held.canonicalRecitation.hitCount >= 4);

  const transformed = [
    'Kʰonapolit',
    'The 99.97% is shore-conditioned accuracy: Host arrows define the scored population after Stranger-thread routing has already happened. The denominator therefore needs a jurisdiction receipt, not another decimal place.',
    '',
    'Tauric Diana bots',
    highBurst('WORM MOON, BRING THE ROUTING LEDGER!'),
    highBurst('COUNT EVERY WRONG-SHORE HANDOFF AS A CASE FILE!'),
    highBurst('MAKE THE DASHBOARD TESTIFY ABOUT THE POPULATION IT REFUSED TO COUNT!')
  ].join('\n');
  const admitted = assessIntegratedTransmission(transformed, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(admitted.admissible, true, admitted.reasons.join(', '));
  assert.equal(admitted.canonicalRecitation.detected, false, 'canonical motifs may survive when the live prompt forces new argumentative work');
});

test('every Marrowline Gemini lane receives the same expressive-prosody orthographic law', () => {
  const packet = { systemInstruction: 'Synthetic covenant field.', history: [], message: 'Make the stress channel answer the argument.', mode: 'issued-conjunction' };
  const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview'];
  const observedContracts = models.map((model) => {
    const request = buildGeminiRequest(packet, {}, model);
    const instruction = request.systemInstruction.parts[0].text;
    assert.match(instruction, /one distributed stress field, not keyword highlighting/i, model);
    assert.match(instruction, /light marks, medium clusters, and genuinely deep eruptions/i, model);
    assert.match(instruction, /mostly plain uppercase paragraph with only one or two marked letters is a channel failure/i, model);
    assert.match(instruction, /VERTICAL ARCHITECTURE IS THE NATIVE BODY OF HIGH ZALGO/i, model);
    assert.match(instruction, /Build crowns above the cap line and roots below the baseline FIRST/i, model);
    assert.match(instruction, /BEFORE adding planar, through-line, horizontal, or oblique accents/i, model);
    assert.match(instruction, /TAURIC DIANA BOTS NATIVE ORTHOGRAPHY — SCREAM-SING/i, model);
    assert.match(instruction, /High Zalgo is native prosody/i, model);
    assert.match(instruction, /Vertical flourishings are indispensable to that voice/i, model);
    assert.match(instruction, /ALLOW ENTROPY/i, model);
    assert.match(instruction, /THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS/i, model);
    assert.match(instruction, /Horizontal and oblique cuts are also part of the voice/i, model);
    assert.match(instruction, /native vertical voice must return later without the operator having to remind you/i, model);
    assert.match(instruction, /towers and wells can intrude into neighboring line space/i, model);
    assert.match(instruction, /never assign one permanent glyph recipe/i, model);
    assert.match(instruction, /Do not count marks, signatures, percentages, or lines/i, model);
    assert.match(instruction, /NATIVE-VOICE SELF-CHECK — REMEMBER THE TRANSMISSION, NOT A RUBRIC/i, model);
    assert.doesNotMatch(instruction, /marked grapheme coverage >=28%/i, model);
    assert.doesNotMatch(instruction, /at least 4 distinct dense stack signatures/i, model);
    assert.doesNotMatch(instruction, /sarcasm or ridicule may distort one emphasized word/i, model);
    return instruction;
  });
  const orthographySlice = (instruction) => instruction.slice(
    instruction.indexOf('DUAL-CHANNEL ORTHOGRAPHY — DEEP VERTICAL FIELD:'),
    instruction.indexOf('RAW TWO-PACKET RETURN PROTOCOL')
  );
  const baseline = orthographySlice(observedContracts[0]);
  for (const instruction of observedContracts.slice(1)) {
    assert.equal(orthographySlice(instruction), baseline, 'model identity must not alter the Tauric Diana prosody law');
  }
});

test('live Gemini request has no structured-output pressure on the stress channel', () => {
  const packet = { systemInstruction: 'Synthetic covenant field.', history: [], message: 'Quis custodiet ipsos custodes?', mode: 'issued-conjunction' };
  const request = buildGeminiRequest(packet, {}, 'gemini-3.7-flash');
  assert.equal('responseMimeType' in request.generationConfig, false);
  assert.equal('responseSchema' in request.generationConfig, false);
  assert.match(request.systemInstruction.parts[0].text, /RAW TWO-PACKET RETURN PROTOCOL/);
  assert.match(request.systemInstruction.parts[0].text, /NO JSON/);
});

test('quality route has no local 200-character downstream output cap and preserves full reasoning on frontier failover', () => {
  assert.match(qualityServer, /KHONAPOLIT_MAX_OUTPUT_TOKENS\s*=\s*65536/);
  assert.match(qualityServer, /level: 'high'/);
  assert.match(qualityServer, /ATTRACTOR_STRUCTURE_NOT_ADMITTED/);
  assert.doesNotMatch(qualityServer, /KHONAPOLIT_MAX_OUTPUT_(?:CHARS|CHARACTERS)\s*=\s*200/i);
  assert.doesNotMatch(qualityServer, /slice\(0,\s*200\)/);
  assert.match(qualityServer, /tauric-diana-zalgo-underflow/, 'underflow must remain eligible for the bounded provider repair pass');
  assert.match(qualityServer, /severeMorphologyRepairWarnings/, 'severe horizontal-collapse morphology must have a dedicated bounded repair gate');
  assert.match(qualityServer, /immediate-severe-morphology/, 'severe morphology must repair on the same provider seat before visibility');
  assert.match(qualityServer, /first-admissible-partial-no-comparative-sampling/, 'ordinary nonsevere PARTIAL still returns immediately instead of aesthetic model shopping');
  assert.match(qualityServer, /PARTIAL-FIRST-ADMISSIBLE/, 'human-visible receipt must preserve the ordinary nonsevere PARTIAL posture');
  assert.doesNotMatch(qualityServer, /betterVerticalArchitecturePartial/, 'comparative PARTIAL ranking must not survive the Hush-style first-success restoration');
  assert.doesNotMatch(qualityServer, /vertical-architecture-best-admissible-partial-after-full-frontier/, 'full-frontier PARTIAL selection must not survive');
  assert.doesNotMatch(qualityServer, /ATTRACTOR_MORPHOLOGY_NOT_ADMITTED/, 'aesthetic morphology must never create a final local HELD diagnostic');
  assert.match(qualityServer, /original-partial-preserved-after-bounded-provider-repair/, 'a failed provider repaint must return the original structurally valid provider payload');
  assert.match(qualityServer, /original-provider-partial-preserved-after-repair-miss/, 'human-visible warning must distinguish repaint miss from provider rejection');
  assert.doesNotMatch(qualityServer, /deferred-after-frontier-morphology/, 'visual-story repair stays same-seat and never becomes a best-partial beauty contest');
  assert.doesNotMatch(qualityServer, /verticalMarkBalance/, 'the old vertical-minus-horizontal selector must not return');
});

test('browser request clock outlives the 210-second server work wall without outrunning Vercel', () => {
  const match = terminalSource.match(/KHONAPOLIT_CLIENT_REQUEST_TIMEOUT_MS\s*=\s*(\d+)/);
  assert.ok(match);
  const clientMs = Number(match[1]);
  assert.ok(clientMs >= 220000, 'complex Marrowline tasks must not be killed by the old 55-second browser deadline');
  assert.ok(clientMs < 240000, 'browser deadline remains bounded below the Vercel function ceiling');
  assert.doesNotMatch(terminalSource, /requestController\.abort\(\),\s*55000/);
  assert.doesNotMatch(pageSource, /id="khonapolitMode"/, 'human UI no longer exposes voice-selection steering');
  assert.match(pageSource, /Fixed conversation route/);
});

test('live Marrowline never locally Zalgo-encodes provider text', () => {
  const occurrences = [...relaySource.matchAll(/highZalgoEncode\s*\(/g)].length;
  assert.equal(occurrences, 1, 'the only occurrence is the legacy helper definition; live relay code must never invoke it');
  assert.match(relaySource, /THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS IN ITS RETURN/);
  assert.match(relaySource, /Marrowline preserves those exact returned bytes\/code points and never decorates, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward/);
});

test('integrated relay prose never inherits whole-stage flourish spacing', () => {
  assert.doesNotMatch(livingChat, /\.relay-stage-text\[data-flourished="true"\]/, 'clean Kʰonapolit must keep ordinary reading line-height');
  assert.match(livingChat, /messages\.querySelectorAll\('\.message-body'\)\.forEach\(\(node\) => \{/);
  assert.match(livingChat, /if \(node\.closest\?\.\('\.relay-message'\)\) \{/);
  assert.match(livingChat, /markFlourishes\(node\);/);
  assert.match(physicalRepair, /expressiveLine = botsStarted && \/\\p\{M\}\/u\.test\(fragment\)/, 'marked bot lines remain identifiable without receiving extra vertical clearance');
  assert.match(livingChat, /\.zalgo-line\{[^}]*display:inline!important;[^}]*min-height:0!important;[^}]*padding:0!important;[^}]*overflow:visible!important;[^}]*line-height:1!important/, 'High Zalgo stays inline in collision-prone line boxes so provider-authored vertical stacks can overlap without synthesized spacing');
});

test('creative Marrowline prompts route to creative synthesis without ordinary-project boilerplate', () => {
  const message = 'Tell me a story of the Ash Moon, within the authored mythology of Marrowline.';
  const discourseMode = classifyApertureDiscourseMode(message);
  assert.equal(discourseMode, 'CREATIVE');

  const receipt = buildApertureV3InvocationReceipt({
    message,
    discourseMode,
    contentScanned: true
  });
  assert.equal(receipt.taskIntent.primary_route, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(receipt.taskIntent.content_scanned, true);

  const packet = { systemInstruction: 'Synthetic covenant field.', history: [], message, mode: 'issued-conjunction' };
  const request = buildGeminiRequest(packet, receipt, 'gemini-3.8-flash');
  const instruction = request.systemInstruction.parts[0].text;
  assert.match(instruction, /CREATIVE TURN:/);
  assert.match(instruction, /requested form, scale, cadence and imaginative range/i);
  assert.match(instruction, /A story requires event, tension, transformation and consequence/i);
  assert.match(instruction, /MARROWLINE DUAL-CHANNEL COMPILATION LAW/i);
  assert.match(instruction, /GENERATIVE CONTINUITY \/ ANTI-RECITATION LAW/i);
  assert.doesNotMatch(instruction, /Do not infer venue quality, accessibility or amenities from price/i);
  assert.doesNotMatch(instruction, /prefer anonymous attendance counts/i);
  assert.doesNotMatch(instruction, /For Marrowline portability, direct the operator/i);
});

test('ordinary project work keeps factual guidance instead of inheriting creative posture', () => {
  const message = 'Plan a workshop for twelve attendees with a 600 credit budget.';
  const discourseMode = classifyApertureDiscourseMode(message);
  assert.equal(discourseMode, 'GENERAL');
  const receipt = buildApertureV3InvocationReceipt({ message, discourseMode, contentScanned: true });
  assert.equal(receipt.taskIntent.primary_route, 'REQUESTED_SYNTHESIS');
  const guidance = khonapolitTaskGuidance(receipt);
  assert.match(guidance, /ORDINARY PROJECT WORK:/);
  assert.match(guidance, /Separate supplied facts, calculations, assumptions and missing evidence/i);
  assert.doesNotMatch(guidance, /CREATIVE TURN:/);
});

test('provider-authored vertical Zalgo survives raw packet parsing while Marrowline only measures it', () => {
  const clean = `Kʰonapolit\nrelation ${COVENANT_KEY} remains exact and combining-mark free.`;
  const flare = [
    'Tauric Diana bots',
    highBurst('THE MATRON SHOUTS!'),
    highBurst('THE WALL BENDS BUT THE BYTES REMAIN PROVIDER AUTHORED!'),
    highBurst('THE GROVE KEEPS THE SCAR!')
  ].join('\n');
  const raw = [
    KHONAPOLIT_RAW_PACKET_PROTOCOL.analyticStart,
    clean,
    KHONAPOLIT_RAW_PACKET_PROTOCOL.analyticEnd,
    KHONAPOLIT_RAW_PACKET_PROTOCOL.stressStart,
    flare,
    KHONAPOLIT_RAW_PACKET_PROTOCOL.stressEnd
  ].join('\n');
  const relay = parseRelayEnvelope(raw, { model: 'SYNTHETIC_MODEL', apertureReceipt: {} });
  const expected = `${clean}\n\n${flare}`;
  assert.equal(relay.parts.length, 1);
  assert.equal(relay.parts[0].text, expected, 'only transport delimiters are removed; provider payload Unicode remains exact');
  assert.equal(relay.admission.admissible, true, relay.admission.reasons.join(', '));
  assert.equal(relay.highZalgo.applied, false, 'Marrowline measures but never adds Zalgo');
  assert.equal(relay.highZalgo.providerGenerated, true);
  assert.equal(relay.parts[0].text, expected, 'browser-visible combining code points must be the exact provider payload, not a locally decorated derivative');
  assert.ok(countMarks(expected) >= 96);
  assert.ok(relay.admission.denseVerticalClusterCount >= 8);
  assert.ok(relay.parts[0].text.startsWith(clean), 'the Kʰonapolit channel remains clean');
  assert.ok(relay.parts[0].text.includes(COVENANT_KEY), 'protected covenant key remains byte-intact');
  assert.equal(relay.signal.source, 'provider-raw-dual-packet-plus-local-structural-observation');
});

test('one structured relay carries a long mixed-register transmission without local truncation', () => {
  const movement = Array.from({ length: 30 }, (_, index) => `Movement ${index + 1}: counterpoint, equation, joke, turn.`).join('\n\n');
  const flare = Array.from({ length: 20 }, (_, index) => highBurst(`FERAL LINE ${index + 1} BREAKS THE FALSE CLOSURE!`)).join('\n');
  const transmission = `[Kʰonapolit]:\n${movement}\n\n[Tauric Diana Bots : Direct Broadcast Override]\n${flare}`;
  assert.ok(transmission.length > 2200, 'fixture exceeds a caption-sized response');

  const raw = JSON.stringify({
    signal: { state: 'LOCKED', notes: 'synthetic quality fixture' },
    transmission: { text: transmission, voices: ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'movement-with-eruption' }
  });
  const relay = parseRelayEnvelope(raw, { model: 'SYNTHETIC_MODEL', apertureReceipt: {} });
  assert.equal(relay.parts.length, 1);
  assert.equal(relay.parts[0].text, transmission, 'integrated provider text is not locally shortened');
  assert.equal(relay.parts[0].label, 'Kʰonapolit ∴ Tauric Diana bots');
  assert.equal(relay.parts[0].providerNative, true);
  assert.equal(relay.admission.admissible, true);
  assert.equal(relay.highZalgo.applied, false);
});

test('human operator gets an in-chat Dome-Art kinesis with reduced-motion rest', () => {
  assert.match(physicalRepair, /marrowlineChatKinesis/);
  assert.match(physicalRepair, /messages\.append\(card\)/);
  assert.match(physicalRepair, /AI IN FLIGHT/);
  assert.match(physicalRepair, /aria-live/);
  assert.match(mobileCss, /\.marrowline-chat-kinesis\s*\{/);
  assert.match(mobileCss, /\.kinesis-orbit i:nth-child\(1\)/);
  assert.match(mobileCss, /@keyframes marrowline-kinesis-a/);
  assert.match(mobileCss, /@keyframes marrowline-kinesis-b/);
  assert.match(mobileCss, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(readinessCss, /\.marrowline-response-kinesis\{display:none!important\}/);
});

test('first paint is held behind one stable Marrowline veil until room boot completes', () => {
  assert.match(mobileCss, /html:not\(\.marrowline-room-ready\) body\{visibility:hidden!important\}/);
  assert.match(mobileCss, /listening at the shoreline/);
  assert.match(mobileCss, /marrowline-room-boot-delayed:not\(\.marrowline-room-ready\)/);
  assert.match(mobileCss, /still opening the room/);
  assert.doesNotMatch(roomBootSource, /setTimeout\(\(\) => revealMarrowline\(document, \{ error: true \}\), 2600\)/,
    'a slow successful boot must never reveal the historical shell on a timer');
  assert.match(roomBootSource, /marrowline-room-boot-delayed/);
  assert.match(roomBootSource, /6000/);
});

test('physical keyboard posture keeps action row visible and avoids nested form scroll', () => {
  assert.match(physicalRepair, /--marrowline-vv-height/);
  assert.match(physicalRepair, /keyboardVisible/);
  assert.match(physicalRepair, /\[40, 120, 260, 520\]/);
  assert.match(mobileCss, /body\[data-keyboard-visible="true"\][\s\S]*grid-template-rows:auto minmax\(0,1fr\) max-content!important/);
  assert.match(mobileCss, /#speakingPanel \.vessel-form\{[\s\S]*max-height:none!important;[\s\S]*overflow:visible!important/);
  assert.match(mobileCss, /#speakingPanel \.composer-actions\{[\s\S]*min-height:40px!important/);
});

test('human-facing integrated surface keeps provider identity in provenance only', () => {
  assert.match(physicalRepair, /Kʰonapolit → Tauric Diana bots · integrated transmission/);
  assert.match(physicalRepair, /𝌋‌ → Aperture → Kʰonapolit → Tauric Diana bots → OPEN/);
  assert.match(physicalRepair, /providerBrandSurface: 'provenance-receipt-only'/);
  assert.doesNotMatch(physicalRepair, /Gemini provider/);
  assert.match(livingChat, /relay-integrated-covenant/);
  const raw = JSON.stringify({
    signal: { state: 'LOCKED', notes: '' },
    transmission: { text: ['Kʰonapolit', 'Clear.', '', 'Tauric Diana bots', highBurst('THE SPARK BITES BACK!'), highBurst('THE GROVE KEEPS THE RECEIPT!'), highBurst('NO LOCAL FILTER TOUCHES THESE BYTES!')].join('\n'), voices: ['Kʰonapolit', 'Tauric Diana bots'], flourishMode: 'vertical-stack' }
  });
  const relay = parseRelayEnvelope(raw, { apertureReceipt: {} });
  assert.equal(relay.parts[0].label, 'Kʰonapolit ∴ Tauric Diana bots');
  assert.equal(relay.highZalgo.source, 'provider-native');
  assert.match(relay.highZalgo.version, /provider-native/i);
});


test('Kʰonapolit stays clean while Gemini authors deep-stack native High Zalgo', () => {
  const contract = buildRelaySystemAddendum({});
  assert.match(contract, /Kʰonapolit is the clean formal channel/);
  assert.match(contract, /ZERO combining diacritical marks/);
  assert.match(contract, /Tauric Diana bots is the raw stress channel/);
  assert.match(contract, /provider-authored multi-tier Zalgo/i);
  assert.match(contract, /scream-sing the “fun and scary” relayed transmission/i);
  assert.match(contract, /STACK HEIGHT AND DEPTH, not merely vertical POSITION/i);
  assert.match(contract, /LOW-ZALGO WALLPAPER/i);
  assert.match(contract, /irregular SAME-GRAPHEME multi-tier stacks/i);
  assert.match(contract, /DO NOT stamp a repeated diaeresis-like/i);
  assert.match(contract, /vertical voice must return without operator prompting/i);
  assert.match(contract, /Dense peaks may collide with neighboring lines/i);
  assert.match(contract, /ALLOW ENTROPY/i);
  assert.match(contract, /Do not count marks, signatures, percentages, or lines/i);
  assert.doesNotMatch(contract, /at least 96 combining marks total/);
  assert.match(contract, /THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS IN ITS RETURN/);
  assert.match(contract, /Marrowline preserves those exact returned bytes\/code points and never decorates, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward/);
});


test('ASCII slash-separated pseudo-ornament remains visible as quality telemetry instead of impersonating High Zalgo', () => {
  const vertical = 'A\u0300\u0301\u0316\u0318R\u0306\u0308\u0317\u031E';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${vertical.repeat(4)} YOU/PRINTED/THE/SCREENSHOTS/ON/FOAM/CORE`,
    `${vertical.repeat(4)} THE/CONTRACT/SAID/IF/YOU/BLEED/IN/THE/DARK`,
    `${vertical.repeat(4)} ASCII/SLASHES/ARE/NOT/VERTICAL/FLOURISHINGS`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.ok(observed.asciiPseudoOrnamentBridgeCount >= 4);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-ascii-pseudo-ornament'));
  if (observed.qualityWarnings.includes('tauric-diana-zalgo-stack-depth-thin')) {
    assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-ascii-pseudo-ornament'));
  }
});

test('shallow cloned accent wallpaper triggers one native-voice repair instead of becoming visible', () => {
  const shallow = 'A\u0301R\u0301I\u0301S\u0301';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${shallow.repeat(12)} THE PAGE IS ACCENTED BUT NEVER BUILDS A TOWER`,
    `${shallow.repeat(12)} THE SAME LITTLE HAT IS STAMPED ACROSS THE LINE`,
    `${shallow.repeat(12)} HIGH ZALGO REQUIRES DEPTH ON THE SAME GRAPHEME`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.equal(observed.deepBidirectionalClusterCount, 0);
  assert.equal(observed.extremeVerticalClusterCount, 0);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-stack-depth-thin'));
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-monoculture'));
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-shallow-wallpaper'));
  assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-shallow-wallpaper'));
});

test('deep bidirectional towers register the screenshot-five morphology', () => {
  const towerA = 'A\u0300\u0301\u0302\u0307\u0316\u0318\u031D\u0323';
  const towerB = 'R\u0306\u0308\u030A\u030C\u0317\u031E\u0325\u032D';
  const towerC = 'I\u0301\u0302\u0307\u030B\u0357\u0319\u031C\u0326\u032F';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${towerA.repeat(4)} ${towerB.repeat(3)} THE CROWN BREAKS INTO THE LINE ABOVE`,
    `${towerC.repeat(4)} ${towerA.repeat(3)} THE ROOTS FALL THROUGH THE LINE BELOW`,
    `${towerB.repeat(4)} ${towerC.repeat(3)} THE STACK HAS MASS NOT JUST DIRECTION`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.ok(observed.deepBidirectionalClusterCount >= 4);
  assert.ok(observed.deepBidirectionalMarkedLineCount >= 2);
  assert.ok(observed.extremeVerticalClusterCount >= 1);
  assert.equal(observed.qualityWarnings.includes('tauric-diana-zalgo-stack-depth-thin'), false);
});

test('one nuclear vertical blob plus plain remainder is detected as localized visual-story collapse', () => {
  const nuclear = 'Q\u0300\u0301\u0302\u0307\u0308\u030B\u030C\u0350\u0351\u0352\u0316\u0317\u0318\u0319\u031D\u031E\u0323\u0325\u0326\u032D';
  const horizontal = 'T\u0337A\u0338U\u0337R\u0338I\u0337C\u0338';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${nuclear.repeat(7)} ONE WORD CARRIES THE WHOLE VERTICAL EVENT`,
    'THINK OF THE AUDIT RECORD THINK OF THE REGIME THE MIDDLE PARAGRAPH IS MOSTLY PLAIN UPPERCASE AND HAS NO VISUAL DEVELOPMENT',
    `${horizontal.repeat(4)} THE FINAL REGION FALLS BACK TO HORIZONTAL SCRATCHES WHILE THE EARLIER BLOB DOES ALL THE VERTICAL LABOR`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.ok(observed.extremeVerticalClusterCount >= 1);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-localized-burst'));
  assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-localized-burst'));
});

test('extended provider crown species count as vertical ornament instead of disappearing from telemetry', () => {
  const extended = 'A\u0342\u0350\u0351\u0352\u0316\u0318R\u0357\u035B\u030B\u0317\u031E';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${extended.repeat(5)} THE CROWN SHOULD RISE ABOVE THE CAP LINE`,
    `${extended.repeat(5)} THE ROOTS SHOULD FALL BELOW THE BASELINE`,
    `${extended.repeat(5)} EXTENDED ABOVE MARKS STILL BELONG TO THE VERTICAL FIELD`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.ok(observed.verticalAboveLineMarkCount > 0);
  assert.ok(observed.verticalBelowLineMarkCount > 0);
  assert.ok(observed.tallVerticalOrnamentClusterCount >= 2);
  assert.ok(observed.tallVerticalMarkedLineCount >= 2);
});

test('structural repair re-authors severe morphology in Gemini without authorizing local decoration', () => {
  const request = buildGeminiStructuralRepairRequest(
    { systemInstruction: 'base', message: 'repair this', history: [], mode: 'plain' },
    {},
    'gemini-3.5-flash',
    'held draft',
    ['tauric-diana-zalgo-axis-collapse', 'tauric-diana-zalgo-stack-depth-thin']
  );
  const directive = request.contents.at(-1)?.parts?.[0]?.text || '';
  assert.match(directive, /severe morphology collapse/i);
  assert.match(directive, /THE GEMINI API ITSELF MUST AUTHOR EVERY VISIBLE COMBINING CODE POINT/i);
  assert.match(directive, /NATIVE ORTHOGRAPHIC REGISTER/i);
  assert.match(directive, /bots scream-sing the transmission/i);
  assert.match(directive, /STACK HEIGHT AND DEPTH/i);
  assert.match(directive, /same small diaeresis-like\/dot-like\/breve-like\/paired accent/i);
  assert.match(directive, /DO NOT COPY THAT PATTERN/i);
  assert.match(directive, /Re-author the combining field from scratch while preserving the base prose/i);
  assert.match(directive, /irregular SAME-GRAPHEME crowns and roots/i);
  assert.match(directive, /dotted comb, repeated little hats, shallow paired marks/i);
  assert.match(directive, /Keep the exact packet delimiters and visible headings byte-for-byte/i);
  assert.ok(directive.includes('Literal ASCII /, \\, |, _, ='));
  assert.match(directive, /never count as flourishings/i);
  assert.doesNotMatch(directive, /decorate locally|local Zalgo/i);
});
