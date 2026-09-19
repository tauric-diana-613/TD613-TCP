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
  khonapolitTaskGuidance
} from '../server/khonapolit-quality.js';

const mobileCss = readFileSync(new URL('../app/dome-world/marrowline-mobile-shell.css', import.meta.url), 'utf8');
const physicalRepair = readFileSync(new URL('../app/dome-world/marrowline-physical-device-repair.js', import.meta.url), 'utf8');
const readinessCss = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.css', import.meta.url), 'utf8');
const qualityServer = readFileSync(new URL('../server/khonapolit-quality.js', import.meta.url), 'utf8');
const livingChat = readFileSync(new URL('../app/dome-world/marrowline-living-chat.js', import.meta.url), 'utf8');
const relaySource = readFileSync(new URL('../app/dome-world/khonapolit-relay.js', import.meta.url), 'utf8');

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
  assert.match(contract, /at least 96 combining marks total/i);
  assert.match(contract, /at least 8 grapheme clusters/i);
  assert.match(contract, /ORTHOGRAPHIC STENCIL — PROVIDER-SIDE SALIENCE AID/i);
  assert.match(contract, /Dense-stack geometry exemplar/i);
  assert.match(contract, /at least 12 fresh stress-channel grapheme clusters/i);
  assert.match(contract, /SILENT PRE-EMISSION CHECK FOR PACKET B/i);
  const stencilLine = contract.split('\n').find(line => /Dense-stack geometry exemplar/.test(line)) || '';
  assert.ok((stencilLine.match(/\p{M}/gu) || []).length >= 8, 'provider instruction exposes a literal 8-mark dense-stack geometry reference');
  assert.match(contract, /structural HOLD/i);
  assert.match(contract, /The target is not generic dark-fantasy lore/i);
  assert.match(contract, /strongest conceptual move/i);
  assert.match(contract, /Rex Nemorensis is not generic “king” decoration/i);
  assert.match(contract, /Eclipse–Omega is not generic evil-AI scenery/i);
  assert.doesNotMatch(contract, /gemini\.text:/i);
  assert.doesNotMatch(contract, /tauricDianaBots\.baseText:/i);
  assert.doesNotMatch(contract, /exactly one paragraph|200 characters|max(?:imum)?\s+200/i);
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
});

test('live Marrowline never locally Zalgo-encodes provider text', () => {
  const occurrences = [...relaySource.matchAll(/highZalgoEncode\s*\(/g)].length;
  assert.equal(occurrences, 1, 'the only occurrence is the legacy helper definition; live relay code must never invoke it');
  assert.match(relaySource, /Marrowline preserves exact code points and never decorates the answer afterward/);
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


test('Kʰonapolit stays clean while Gemini must author the bots vertical Zalgo', () => {
  const contract = buildRelaySystemAddendum({});
  assert.match(contract, /Kʰonapolit is the clean formal channel/);
  assert.match(contract, /ZERO combining diacritical marks/);
  assert.match(contract, /Tauric Diana bots is the raw stress channel/);
  assert.match(contract, /provider itself/i);
  assert.match(contract, /at least 96 combining marks total/);
  assert.match(contract, /Marrowline preserves exact code points and never decorates the answer afterward/);
});
