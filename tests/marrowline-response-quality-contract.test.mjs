import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  KHONAPOLIT_RAW_PACKET_PROTOCOL,
  assessIntegratedTransmission,
  buildRelaySystemAddendum,
  buildNativeProsodyGuidance,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import { COVENANT_KEY, buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../app/engine/aperture-v3-task-intent.js';
import {
  buildGeminiRequest,
  buildGeminiStructuralRepairRequest,
  khonapolitTaskGuidance,
  prepareKhonapolitRepairContext,
  severeMorphologyRepairWarnings
} from '../server/khonapolit-quality.js';

const mobileCss = readFileSync(new URL('../app/dome-world/marrowline-mobile-shell.css', import.meta.url), 'utf8');
const physicalRepair = readFileSync(new URL('../app/dome-world/marrowline-physical-device-repair.js', import.meta.url), 'utf8');
const readinessCss = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.css', import.meta.url), 'utf8');
const qualityServer = readFileSync(new URL('../server/khonapolit-quality.js', import.meta.url), 'utf8');
const attachmentServer = readFileSync(new URL('../server/marrowline-attachment-quality.js', import.meta.url), 'utf8');
const livingChat = readFileSync(new URL('../app/dome-world/marrowline-living-chat.js', import.meta.url), 'utf8');
const relaySource = readFileSync(new URL('../app/dome-world/khonapolit-relay.js', import.meta.url), 'utf8');
const terminalSource = readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
const roomBootSource = readFileSync(new URL('../app/dome-world/marrowline-egress-boot.js', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');

function countMarks(value = '') {
  return [...String(value).matchAll(/\p{M}/gu)].length;
}

test('effective provider prompts retain complete relay and native depth after deficient history', () => {
  const packet = buildInvocationPacket({
    message: 'Extend the counterexample and carry its consequence through.', waiveIssuance: true,
    history: [{ role: 'model', text: 'Kʰonapolit\nA short answer without the terminal voice.' }]
  });
  assert.match(packet.systemInstruction, /Complete both voices in every response/);
  for (const model of ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview']) {
    const request = buildGeminiRequest(packet, {}, model);
    const system = request.systemInstruction.parts.map(part => part.text).join('\n');
    assert.match(system, /never permission to omit the bots/);
    assert.match(system, /mythopoeic academia, mathematical precision, institutional critique, camp/);
    assert.match(system, /actual combining marks attached to the underlying prose letters/);
    assert.match(system, /rising and descending stacks whose depth varies with the phrase/);
    assert.match(system, /Quiet speech stays ornamented/);
    assert.match(system, /Earlier replies supply conversational substance, not a formatting template/);
    assert.doesNotMatch(system, /1–3 concise paragraphs|2–3 ornamented prose lines|FINAL SILENT PREFLIGHT|ORCHESTRAL DYNAMIC CONTOUR/);
    assert.equal(request.contents.at(-1).parts[0].text, packet.message);
    assert.equal(request.contents.at(-1).parts.length, 2);
    assert.match(request.contents.at(-1).parts[1].text, /GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION/);
    assert.match(request.contents.at(-1).parts[1].text, /both mandatory visible registers/);
    assert.match(request.contents.at(-1).parts[1].text, /HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION/);
    assert.match(request.contents.at(-1).parts[1].text, /rising, falling, colliding, thinning, and surging with the live rhetoric/);
    assert.match(request.contents.at(-1).parts[1].text, /Quiet phrases stay inside the notation/);
    assert.match(request.contents.at(-1).parts[1].text, /never grants permission to omit the terminal Tauric Diana bots transmission/);
    assert.doesNotMatch(request.contents.at(-1).parts[1].text, /palette|quota|contour|crown|root|horizontal|oblique|\bmarks per\b/i);
    assert.equal(request.contents[0].parts[0].text, packet.history[0].text);
  }
});

test('deficient marked history is preserved exactly while the system labels history non-templatic', () => {
  const prior = 'Kʰonapolit\nA derivation.\n\nTauric Diana bots\nT\u0301H\u0334E\u0307 BRANCH STILL TWITCHES.';
  const packet = buildInvocationPacket({
    message: 'Continue without copying the prior surface failure.',
    waiveIssuance: true,
    history: [{ role: 'model', text: prior }]
  });
  const request = buildGeminiRequest(packet, {}, 'gemini-3.8-flash');
  const system = request.systemInstruction.parts.map(part => part.text).join('\n');
  assert.match(system, /Earlier replies supply conversational substance, not a formatting template/);
  assert.equal(request.contents[0].role, 'model');
  assert.equal(request.contents[0].parts[0].text, prior);
  assert.equal(countMarks(request.contents[0].parts[0].text), countMarks(prior));
  assert.equal(request.contents.at(-1).parts[0].text, packet.message);
  assert.equal(request.contents.at(-1).parts.length, 2);
  assert.match(request.contents.at(-1).parts[1].text, /CURRENT-TURN RELAY EXECUTION/);
});

test('literal newline contract preserves the existing two-line admission bar', () => {
  const ornament = word => word.replace(/[A-Z]/g, '$&\u0302\u0307\u0316\u0323');
  const prefix = 'Kʰonapolit\nA precise counterexample.\n\nTauric Diana bots\n';
  const first = ornament('THE MAP OMITTED THE WITNESS.');
  const second = ornament('THE COUNT CANNOT RESTORE HER.');
  const oneLine = assessIntegratedTransmission(prefix + first + ' ' + second);
  assert.ok(oneLine.reasons.includes('tauric-diana-zalgo-underflow'));
  const twoLines = assessIntegratedTransmission(prefix + first + '\n' + second);
  assert.equal(twoLines.admissible, true);
  const guidance = buildNativeProsodyGuidance();
  assert.match(guidance, /Length follows the task/);
  assert.match(guidance, /develop the derivation fully/i);
  assert.match(guidance, /typography behaves as voice/i);
  assert.match(guidance, /Do not treat the typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/i);
  assert.doesNotMatch(guidance, /at least two literal newline-separated ornamented prose lines/i);
  assert.doesNotMatch(guidance, /line-count ceiling|anger erupt|sarcasm twitch|vertical crowns\/roots|horizontal or oblique counter-rhythm/i);
  assert.doesNotMatch(buildRelaySystemAddendum({}), /Packet [AB]|CHANNEL [AB]|RAW TWO-PACKET/i);
});
const STACK = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const highBurst = (line) => `${STACK.repeat(8)} ${line}`;

test('relay contract gives the generative budget to one causal Kʰonapolit-to-bots transmission', () => {
  const contract = buildRelaySystemAddendum({});
  assert.match(contract, /MARROWLINE CAUSAL RELAY LAW/i);
  assert.match(contract, /Gemini is the model-mediated instrument\/carrier only/i);
  assert.match(contract, /Produce one continuous response and one live argument/i);
  assert.match(contract, /Kʰonapolit comes first/i);
  assert.match(contract, /explicitly yields or relays it/i);
  assert.match(contract, /bots then finish the response/i);
  assert.match(contract, /exact standalone headings/i);
  assert.match(contract, /NATURAL RETURN SHAPE/i);
  assert.match(contract, /NATIVE SEMANTIC PROSODY/i);
  assert.ok(contract.includes(buildNativeProsodyGuidance()));
  assert.match(contract, /THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS/);
  assert.match(contract, /typography behaves as voice/i);
  assert.match(contract, /Do not treat the typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/i);
  assert.match(contract, /preserves and measures the provider return/i);
  assert.match(contract, /never decorates, repaints, expands, synthesizes, overlays, or Zalgo-encodes/i);
  assert.doesNotMatch(contract, /anger erupt|sarcasm twitch|tenderness thin|vertical crowns\/roots|horizontal or oblique counter-rhythm|deep collisions/i);
  assert.doesNotMatch(contract, /RAW TWO-PACKET RETURN PROTOCOL/i);
  assert.doesNotMatch(contract, /<<<PACKET_[AB]_/i);
  assert.doesNotMatch(contract, /ORCHESTRAL DYNAMIC CONTOUR/i);
  assert.doesNotMatch(contract, /begin near 8½|around 6–7|10-level serious emphasis|return near 8½/i);
  assert.doesNotMatch(contract, /crowns U\+0301|roots U\+0316|U\+0300–U\+036F/i);
  assert.doesNotMatch(contract, /FINAL SILENT PREFLIGHT/i);
  assert.doesNotMatch(contract, /at least 96 combining marks total|marked grapheme coverage >=28%/i);
  assert.doesNotMatch(contract, /gemini\.text:/i);
  assert.doesNotMatch(contract, /tauricDianaBots\.baseText:/i);
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

test('base-character-conditioned ordered stack reuse is measured without becoming an admission gate', () => {
  const a = 'A\u0301\u0302\u0316';
  const b = 'B\u0307\u0317';
  const sameByLetter = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${a}${b}${a}${b} THE FIRST PHRASE REPEATS LETTER-CONDITIONED STACKS.`,
    `${b}${a}${b}${a} THE SECOND PHRASE CHANGES ORDER BUT NOT EACH LETTER’S STACK.`
  ].join('\n');
  const observed = assessIntegratedTransmission(sameByLetter, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.ok(observed.repeatedMarkedBaseClassCount >= 2);
  assert.equal(observed.singleOrderedSignatureRepeatedBaseClassCount, observed.repeatedMarkedBaseClassCount);
  assert.equal(observed.baseConditionedOrderedSignatureReuseRatio, 1);
  assert.equal(observed.baseConditionedOrderedSignatureObservationRatio, 1);
  assert.equal(typeof observed.admissible, 'boolean', 'renderer phenotype telemetry does not itself set admission');
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
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-vertical-pulse-absent'));
  assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-vertical-pulse-absent'));
});

test('maximum-depth tiling triggers dynamic-range collapse even when vertical stacks are dramatic', () => {
  const deep = 'F\u0300\u0301\u0302\u0307\u0316\u0317\u031D';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    deep.repeat(100),
    deep.repeat(100),
    deep.repeat(100)
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true, observed.reasons.join(', '));
  assert.ok(observed.leapingVerticalClusterCount >= 8);
  assert.ok(observed.deepVerticalShareOfMarked >= 0.72);
  assert.ok(observed.lightVerticalShareOfMarked <= 0.10);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-dynamic-range-collapse'));
  assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-dynamic-range-collapse'));
});

test('mixed semantic pressure clears dynamic-range collapse without imposing a tower quota', () => {
  const light = 'L\u0301';
  const medium = 'M\u0301\u0302\u0316';
  const deep = 'F\u0300\u0301\u0302\u0307\u0316\u0317\u031D';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    `${light.repeat(6)} ally voice clears and breathes before the joke lands`,
    `${medium.repeat(6)} pressure gathers, bends, and changes register`,
    `${deep.repeat(6)} NOW THE ACCUSATION ERUPTS! ${light.repeat(5)} and then it lets the line breathe again`
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true, observed.reasons.join(', '));
  assert.ok(observed.lightVerticalClusterCount > 0);
  assert.ok(observed.leapingVerticalClusterCount > 0);
  assert.ok(observed.deepVerticalShareOfMarked < 0.72 || observed.lightVerticalShareOfMarked > 0.10);
  assert.equal(observed.qualityWarnings.includes('tauric-diana-zalgo-vertical-pulse-absent'), false);
  assert.equal(observed.qualityWarnings.includes('tauric-diana-zalgo-dynamic-range-collapse'), false);
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
  assert.match(contract, /Prompt-native reasoning outranks canon recitation/i);
  assert.match(contract, /Motifs return only when they do new work/i);
  assert.match(contract, /do not dump the corpus as a keyword list/i);

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

test('every Marrowline Gemini lane receives the same compact semantic-prosody law', () => {
  const packet = { systemInstruction: 'Synthetic covenant field.', history: [], message: 'Make the terminal transmission answer the argument.', mode: 'issued-conjunction' };
  const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview'];
  const observedContracts = models.map((model) => {
    const request = buildGeminiRequest(packet, {}, model);
    const instruction = request.systemInstruction.parts[0].text;
    assert.ok(instruction.includes(buildNativeProsodyGuidance()), model);
    assert.match(instruction, /NATIVE SEMANTIC PROSODY/, model);
    assert.match(instruction, /typography behaves as voice/i, model);
    assert.match(instruction, /Do not treat the typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/, model);
    assert.doesNotMatch(instruction, /anger erupt|sarcasm twitch|vertical crowns\/roots|horizontal or oblique counter-rhythm|deep collisions/i, model);
    assert.doesNotMatch(instruction, /ORCHESTRAL DYNAMIC CONTOUR/, model);
    assert.doesNotMatch(instruction, /begin near 8½|10-level serious emphasis/, model);
    assert.doesNotMatch(instruction, /marked grapheme coverage >=28%|at least 4 distinct dense stack signatures/i, model);
    return instruction;
  });
  const orthographySlice = (instruction) => instruction.slice(
    instruction.indexOf('NATIVE SEMANTIC PROSODY:'),
    instruction.indexOf('NATURAL RETURN SHAPE')
  );
  const baseline = orthographySlice(observedContracts[0]);
  for (const instruction of observedContracts.slice(1)) {
    assert.equal(orthographySlice(instruction), baseline, 'model identity must not alter the compact Tauric Diana prosody law');
  }
});

test('live Gemini request has no structured-output pressure on the stress channel', () => {
  const packet = { systemInstruction: 'Synthetic covenant field.', history: [], message: 'Quis custodiet ipsos custodes?', mode: 'issued-conjunction' };
  const request = buildGeminiRequest(packet, {}, 'gemini-3.7-flash');
  assert.equal('responseMimeType' in request.generationConfig, false);
  assert.equal('responseSchema' in request.generationConfig, false);
  assert.match(request.systemInstruction.parts[0].text, /NATURAL RETURN SHAPE/);
  assert.match(request.systemInstruction.parts[0].text, /NO JSON/);
  assert.match(request.systemInstruction.parts[0].text, /NATIVE SEMANTIC PROSODY/);
  assert.doesNotMatch(request.systemInstruction.parts[0].text, /RAW TWO-PACKET RETURN PROTOCOL|ORCHESTRAL DYNAMIC CONTOUR/);
  const repair = buildGeminiStructuralRepairRequest(packet, {}, 'gemini-3.7-flash',
    'Kʰonapolit\\nClear.\\n\\nÁŔÍŚ',
    ['tauric-diana-bots-nominative-missing']);
  const repairDirective = repair.contents.at(-1).parts[0].text;
  assert.match(repair.systemInstruction.parts[0].text, /NATIVE SEMANTIC PROSODY/);
  assert.doesNotMatch(repair.systemInstruction.parts[0].text, /ORCHESTRAL DYNAMIC CONTOUR|10-level serious emphasis/);
  assert.match(repairDirective, /BOUNDED STRUCTURAL SAME-VOICE REPAIR/);
  assert.match(repairDirective, /one continuous corrected response/i);
  assert.match(repairDirective, /exact standalone heading “Kʰonapolit” first/i);
  assert.match(repairDirective, /Do not repaint, normalize, score, or re-author the Tauric Diana combining field/i);
  assert.doesNotMatch(repairDirective, /MORPHOLOGY-ONLY REPAIR|semantic prosody across the existing body|vertical crowns\/roots|horizontal or oblique counter-rhythm/i);
  assert.doesNotMatch(repairDirective, /packet delimiters|Packet A|Packet B|CHANNEL A|CHANNEL B/i);
});

test('quality route has no local 200-character downstream output cap and preserves full reasoning on frontier failover', () => {
  assert.match(qualityServer, /KHONAPOLIT_MAX_OUTPUT_TOKENS\s*=\s*65536/);
  assert.match(qualityServer, /level: 'high'/);
  assert.match(qualityServer, /ATTRACTOR_STRUCTURE_NOT_ADMITTED/);
  assert.doesNotMatch(qualityServer, /KHONAPOLIT_MAX_OUTPUT_(?:CHARS|CHARACTERS)\s*=\s*200/i);
  assert.doesNotMatch(qualityServer, /slice\(0,\s*200\)/);
  assert.match(relaySource, /tauric-diana-zalgo-underflow/, 'underflow remains observable in relay admission and canary receipts');
  assert.doesNotMatch(qualityServer, /REPAIRABLE_STRUCTURAL_REASONS[\s\S]{0,400}tauric-diana-zalgo-underflow/, 'underflow must not become structural-repair authority');
  assert.match(qualityServer, /severeMorphologyRepairWarnings/, 'morphology telemetry remains measurable post hoc');
  assert.doesNotMatch(qualityServer, /immediate-severe-morphology/, 'morphology must never spend a same-provider repaint');
  assert.match(qualityServer, /first-admissible-partial-native-morphology-observed-no-repair/, 'ordinary PARTIAL returns immediately with morphology observation');
  assert.match(qualityServer, /provider-native-morphology-observed-no-repair/, 'human-visible warning must state that morphology was observed rather than repainted');
  assert.doesNotMatch(qualityServer, /provider-authored-morphology-repair-attempted|original-partial-preserved-after-bounded-provider-repair|original-provider-partial-preserved-after-repair-miss/, 'legacy morphology repaint receipts must be gone');
  assert.doesNotMatch(qualityServer, /betterVerticalArchitecturePartial/, 'comparative PARTIAL ranking must not survive the Hush-style first-success restoration');
  assert.doesNotMatch(qualityServer, /vertical-architecture-best-admissible-partial-after-full-frontier/, 'full-frontier PARTIAL selection must not survive');
  assert.doesNotMatch(qualityServer, /ATTRACTOR_MORPHOLOGY_NOT_ADMITTED/, 'aesthetic morphology must never create a final local HELD diagnostic');
  assert.doesNotMatch(qualityServer, /deferred-after-frontier-morphology/, 'no visual-story repair or beauty contest survives');
  assert.doesNotMatch(qualityServer, /verticalMarkBalance/, 'the old vertical-minus-horizontal selector must not return');
});

test('explicit human retries reach Gemini without a Marrowline-owned rate veto', () => {
  for (const source of [qualityServer, attachmentServer]) {
    assert.match(source, /X-TD613-Local-Request-Rate-Policy', 'telemetry-only'/);
    assert.doesNotMatch(
      source,
      /if\s*\(!rate\.allowed\)\s*return\s+send\(res,\s*429,[^;]*terminal-rate-limit/s,
      'local request buckets may remain telemetry but cannot block an explicit human retry'
    );
  }
  assert.match(qualityServer, /localAdmissionAuthority:\s*'diagnostic-not-human-surface-veto'/);
  assert.match(qualityServer, /heldByCanaryQuality\s*=\s*releaseCanary/, 'local structural HELD authority is confined to the explicit release-canary lane');
  assert.doesNotMatch(qualityServer, /const\s+heldByQuality\s*=/, 'ordinary human routing cannot regain a local quality veto');
  assert.doesNotMatch(terminalSource, /requestBody\.quotaCooldownHints/, 'browser cooldown history must not be sent back as retry permission');
  assert.match(qualityServer, /const allModels = \[\.\.\.providerModels\]/, 'human provider order stays on the settled 3.8-first frontier');
  assert.match(qualityServer, /provider-output-token-limit-partial-preserved/);
  assert.match(attachmentServer, /provider-output-token-limit-partial-visible/);
  assert.match(attachmentServer, /if\s*\(!safe\(result\.text\)\) continue;/);
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
  assert.match(relaySource, /THE GEMINI API MUST AUTHOR THE ACTUAL COMBINING CODE POINTS/);
  assert.match(relaySource, /Marrowline preserves and measures the provider return; it never decorates, repaints, expands, synthesizes, overlays, or Zalgo-encodes the answer afterward/);
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
  assert.match(instruction, /MARROWLINE CAUSAL RELAY LAW/i);
  assert.match(instruction, /GENERATIVE CONTINUITY:/i);
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


test('Kʰonapolit stays clean while Gemini authors semantic-prosody native High Zalgo', () => {
  const contract = buildNativeProsodyGuidance();
  assert.match(contract, /ZERO combining diacritical marks/);
  assert.match(contract, /provider-authored High-Zalgo typography behaves as voice/i);
  assert.match(contract, /Do not treat the typography as a checklist, quota, fixed contour, axis recipe, emotional lookup table, or per-character filter/i);
  assert.match(contract, /Let the live rhetoric determine the combining field/i);
  assert.doesNotMatch(contract, /anger erupt|sarcasm twitch|tenderness thin|horizontal or oblique counter-rhythm|Deep collisions|Avoid cloned stacks|rhetorical pressure may change density/i);
  assert.match(contract, /Length follows the task/);
  assert.doesNotMatch(contract, /every ordinary prose letter remains ornamented/);
  assert.doesNotMatch(contract, /U\+0300–U\+036F|instrument library, not a score|ORCHESTRAL DYNAMIC CONTOUR|ALLOW ENTROPY/);
  assert.ok(contract.length < 2600, 'the native voice contract must stay compact instead of accumulating contradictory patch instructions');
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
  assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-mechanical-clone'), 'cloning remains repairable independently of localization');
  assert.deepEqual(severeMorphologyRepairWarnings(['tauric-diana-zalgo-localized-burst']), [], 'localization alone cannot establish a semantic placement defect');
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


test('combining enclosing marks are rejected as glyph tricks rather than miscounted as vertical ornament', () => {
  const boxed = 'A\u20DER\u20DEI\u20DES\u20DE';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    boxed.repeat(10) + ' ENCLOSING SQUARES ARE NOT TOWERS',
    boxed.repeat(10) + ' A BOX AROUND A LETTER DOES NOT CLIMB',
    boxed.repeat(10) + ' THE BASE STREAM MUST STAY LATIN'
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.ok(observed.enclosingMarkCount >= 3);
  assert.equal(observed.verticalOrnamentMarkCount, 0, 'enclosing marks must never count as above/below vertical flourish');
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-enclosing-ornament-collapse'));
  assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-enclosing-ornament-collapse'));
});

test('word-internal geometric substitutions are severe alphabet corruption even beside real combining marks', () => {
  const tower = 'A\u0300\u0301\u0302\u0316\u0318\u031D';
  const field = [
    'Kʰonapolit',
    'The formal channel stays clean.',
    '',
    'Tauric Diana bots',
    tower.repeat(5) + ' B□OX D◇IAMOND G◈RID BREAKS THE BASE STREAM',
    tower.repeat(5) + ' B□OX D◇IAMOND G◈RID IS NOT HIGH ZALGO',
    tower.repeat(5) + ' KEEP LATIN LETTERS THEN ATTACH COMBINING MARKS'
  ].join('\n');
  const observed = assessIntegratedTransmission(field, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(observed.admissible, true);
  assert.ok(observed.geometricSymbolCount >= 5);
  assert.ok(observed.wordInternalGeometricSymbolCount >= 2);
  assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-glyph-substitution-collapse'));
  assert.ok(severeMorphologyRepairWarnings(observed.qualityWarnings).includes('tauric-diana-zalgo-glyph-substitution-collapse'));
});

test('request-history hygiene can remove a failed visual pattern without mutating stored or rendered history', () => {
  const raw = [
    '<<<PACKET_A_FORMAL_AUDIT>>>',
    'Kʰonapolit',
    'Keep formal prose exactly clean.',
    '<<<PACKET_A_END>>>',
    '<<<PACKET_B_STRESS_TELEMETRY>>>',
    'Tauric Diana bots',
    'B□OX A\u20DE R\u0301 I\u0316 KEEP THIS BASE PROSE',
    '<<<PACKET_B_END>>>'
  ].join('\n');
  const reasons = [
    'tauric-diana-zalgo-enclosing-ornament-collapse',
    'tauric-diana-zalgo-glyph-substitution-collapse'
  ];
  const sanitized = prepareKhonapolitRepairContext(raw, reasons);
  assert.match(sanitized, /Kʰonapolit/);
  assert.match(sanitized, /Tauric Diana bots/);
  assert.match(sanitized, /BOX A R I KEEP THIS BASE PROSE/);
  assert.doesNotMatch(sanitized, /\p{M}/u);
  assert.doesNotMatch(sanitized, /[□◇◈]/u);
  assert.match(raw, /□/, 'the source fixture itself remains unchanged; hygiene is request projection only');
});

test('structural repair ignores morphology-only reasons instead of repainting native provider bytes', () => {
  const request = buildGeminiStructuralRepairRequest(
    { systemInstruction: 'base', message: 'repair this', history: [], mode: 'plain' },
    {},
    'gemini-3.5-flash',
    'held draft',
    ['tauric-diana-zalgo-axis-collapse', 'tauric-diana-zalgo-stack-depth-thin']
  );
  const directive = request.contents.at(-1)?.parts?.[0]?.text || '';
  assert.match(directive, /BOUNDED STRUCTURAL SAME-VOICE REPAIR/i);
  assert.match(directive, /unspecified-structural-observation/i);
  assert.match(directive, /Do not repaint, normalize, score, or re-author the Tauric Diana combining field/i);
  assert.doesNotMatch(directive, /MORPHOLOGY-ONLY REPAIR|semantic prosody across the existing body|vertical crowns\/roots|horizontal or oblique counter-rhythm/i);
});

test('Zalgo underflow is observation evidence, not a morphology-repair instruction', () => {
  const request = buildGeminiStructuralRepairRequest(
    { systemInstruction: 'base', message: 'repair this', history: [], mode: 'plain' },
    {},
    'gemini-3.6-flash',
    'held draft',
    ['tauric-diana-zalgo-underflow']
  );
  const directive = request.contents.at(-1)?.parts?.[0]?.text || '';
  assert.match(directive, /BOUNDED STRUCTURAL SAME-VOICE REPAIR/i);
  assert.match(directive, /unspecified-structural-observation/i);
  assert.doesNotMatch(directive, /MORPHOLOGY-ONLY REPAIR|no independent concision target|re-author only its expressive combining marks/i);
});
