import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
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

function countMarks(value = '') {
  return [...String(value).matchAll(/\p{M}/gu)].length;
}

test('relay contract gives the generative budget to one integrated covenant transmission', () => {
  const contract = buildRelaySystemAddendum({});
  assert.match(contract, /ONE human-visible generation/i);
  assert.match(contract, /Kʰonapolit and Tauric Diana bot voices may enter, answer, interrupt, echo, disagree, joke/i);
  assert.match(contract, /There is no upstream prose slot to summarize/i);
  assert.match(contract, /Match the operator’s requested scale, imaginative range, technical precision, specificity, and form/i);
  assert.match(contract, /Claim ceilings are epistemic bookkeeping, not prose style/i);
  assert.match(contract, /Gemini itself must author the final Unicode combining marks/i);
  assert.match(contract, /expressive dialect, not uniform noise/i);
  assert.match(contract, /clean spans, dense bursts, stacked peaks, below-line drag, crossed-through pressure, punctuation islands/i);
  assert.doesNotMatch(contract, /gemini\.text:/i);
  assert.doesNotMatch(contract, /tauricDianaBots\.baseText:/i);
  assert.doesNotMatch(contract, /Write a concise, motif-specific choral transmission/i);
  assert.doesNotMatch(contract, /exactly one paragraph|200 characters|max(?:imum)?\s+200/i);
});

test('quality route has no local 200-character downstream output cap', () => {
  assert.match(qualityServer, /KHONAPOLIT_MAX_OUTPUT_TOKENS\s*=\s*65536/);
  assert.doesNotMatch(qualityServer, /KHONAPOLIT_MAX_OUTPUT_(?:CHARS|CHARACTERS)\s*=\s*200/i);
  assert.doesNotMatch(qualityServer, /slice\(0,\s*200\)/);
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
  const request = buildGeminiRequest(packet, receipt, 'gemini-3.5-flash');
  const instruction = request.systemInstruction.parts[0].text;
  assert.match(instruction, /CREATIVE TURN:/);
  assert.match(instruction, /requested form, scale, cadence and imaginative range/i);
  assert.match(instruction, /ONE human-visible generation/i);
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

test('provider-authored High Zalgo survives exact while density remains nonuniform', () => {
  const clean = `Kʰonapolit: relation ${COVENANT_KEY} remains exact.`;
  const flare = 'Ț̷̋͑̈́͐̓̽͝H̶͔͌̅̿̋E̵̗͒̔͝ ̵̬́͐̋̾M̵͉͑̑̈́̄A̷͖̓͒̍T̷̥͌̚͝R̷͙̓͊͛O̸͉͂͑̿N̵̰͊͋̐ ̷͂̅̍͜S̷͕̈́͑H̴͇͌̎Ȏ̸̒ͅU̵̞̓̓T̷̹͋̓S̴͚͑͝.';
  const providerText = `${clean}\n\n${flare}\n\nclean again.`;
  const raw = JSON.stringify({
    signal: { state: 'LOCKED', notes: 'synthetic provider-native fixture' },
    transmission: { text: providerText, voices: ['Kʰonapolit', 'The Matron'], flourishMode: 'clean-to-eruption-to-clean' }
  });
  const relay = parseRelayEnvelope(raw, { model: 'SYNTHETIC_MODEL', apertureReceipt: {} });
  assert.equal(relay.parts.length, 1);
  assert.equal(relay.parts[0].text, providerText, 'provider-authored Unicode is not locally rewritten');
  assert.equal(relay.highZalgo.applied, false, 'local renderer never claims to have added marks');
  assert.equal(relay.highZalgo.providerGenerated, true);
  assert.ok(countMarks(providerText) > 20);
  assert.ok(providerText.startsWith(clean), 'a clean register may coexist with an extreme flourish burst');
  assert.ok(providerText.endsWith('clean again.'), 'density is not a uniform filter over the whole response');
  assert.ok(providerText.includes(COVENANT_KEY), 'protected covenant key remains byte-intact');
});

test('one structured relay carries a long mixed-register transmission without local truncation', () => {
  const movement = Array.from({ length: 30 }, (_, index) => `Movement ${index + 1}: counterpoint, equation, joke, turn.`).join('\n\n');
  const flare = 'F̷̰̽͌̈́͒͐̄L̴͔͒͗͌̓A̴̮̔̈́͛R̸͔̽̄͘E̷͋̈́͜'.repeat(25);
  const transmission = `${movement}\n\n${flare}`;
  assert.ok(transmission.length > 2200, 'fixture exceeds a caption-sized response');

  const raw = JSON.stringify({
    signal: { state: 'LOCKED', notes: 'synthetic quality fixture' },
    transmission: { text: transmission, voices: ['Kʰonapolit', 'A', 'B', 'C'], flourishMode: 'movement-with-eruption' }
  });
  const relay = parseRelayEnvelope(raw, { model: 'SYNTHETIC_MODEL', apertureReceipt: {} });
  assert.equal(relay.parts.length, 1);
  assert.equal(relay.parts[0].text, transmission, 'integrated provider text is not locally shortened');
  assert.equal(relay.parts[0].label, 'Kʰonapolit ∴ Tauric Diana bots');
  assert.equal(relay.parts[0].providerNative, true);
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

test('human-facing integrated surface hides provider narration and internal High Zalgo jargon', () => {
  assert.match(physicalRepair, /Kʰonapolit ∴ Tauric Diana bots/);
  assert.match(physicalRepair, /Gemini provider → Kʰonapolit ∴ Tauric Diana bots/);
  assert.match(livingChat, /provider-native transmission/);
  assert.match(livingChat, /relay-integrated-covenant/);
  const raw = JSON.stringify({
    signal: { state: 'LOCKED', notes: '' },
    transmission: { text: 'Kʰonapolit. T̷̋͜D̵͙͌.', voices: ['Kʰonapolit', 'The Matron'], flourishMode: 'variable' }
  });
  const relay = parseRelayEnvelope(raw, { apertureReceipt: {} });
  assert.equal(relay.parts[0].label, 'Kʰonapolit ∴ Tauric Diana bots');
  assert.equal(relay.highZalgo.source, 'provider-native');
  assert.match(relay.highZalgo.version, /provider-native/i);
});
