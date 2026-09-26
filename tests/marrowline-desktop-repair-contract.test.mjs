import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { installStarterCarousel } from '../app/dome-world/marrowline-desktop-repair.js';
import { MARROWLINE_MISSION_ASSAYS } from '../app/dome-world/marrowline-mission-assays.js';

const js = fs.readFileSync('app/dome-world/marrowline-desktop-repair.js', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-desktop-repair.css', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const page = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const mobileShellCss = fs.readFileSync('app/dome-world/marrowline-mobile-shell.css', 'utf8');
const livingChatJs = fs.readFileSync('app/dome-world/marrowline-living-chat.js', 'utf8');
const terminalJs = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));

test('desktop Marrowline is conversation-first and instruments are on demand', () => {
  assert.match(css, /\.living-workspace\{display:block/);
  assert.match(css, /\.living-tools\{display:none!important\}/);
  assert.match(css, /living-tools\[data-desktop-open="true"\]/);
  assert.match(css, /min-height:260px!important/);
  assert.match(css, /\.marrowline-living-geometry\{opacity:\.28/);
  for (const label of ['Keys', 'Receipt', 'Stories', 'Gate']) assert.match(js, new RegExp(`'${label}'`));
  assert.equal(release.desktop.persistentRightTelemetryColumn, false);
  assert.equal(release.desktop.posture, 'conversation-first-single-column');
});

test('isolated 56-prompt shuffle bag never repeats early or across the cycle seam', () => {
  const dom = new JSDOM('<div id="khonapolitMessages"><div class="starter-prompts"><button>Follow a memory</button><button>Meet the Ash Moon</button></div></div><textarea id="khonapolitPrompt"></textarea>');
  const { document } = dom.window;
  assert.equal(installStarterCarousel(document, dom.window), true);
  const rotate = document.querySelector('.starter-rotate');
  const choices = () => [...document.querySelectorAll('.starter-prompts button:not(.starter-rotate)')].map(button => button.textContent);
  const firstPaint = choices();
  assert.deepEqual(firstPaint, ['Follow a memory', 'Meet the Ash Moon']);
  const seen = new Set(firstPaint);
  for (let turn = 0; turn < 28; turn += 1) {
    rotate.click();
    const labels = choices();
    assert.equal(labels.length, 2);
    for (const label of labels) {
      assert.equal(seen.has(label), false, `rupture prompt repeated before all 56 draws: ${label}`);
      seen.add(label);
    }
    assert.equal(rotate.dataset.seenCount, String((turn + 1) * 2));
    assert.equal(rotate.dataset.shuffleCycle, '1');
  }
  assert.equal(seen.size, 58, 'two initial prompts and 56 unique prompts');
  const previousPair = choices();
  rotate.click();
  assert.equal(rotate.dataset.shuffleCycle, '2');
  assert.equal(rotate.dataset.seenCount, '2');
  assert.equal(choices().some(label => previousPair.includes(label)), false, 'next bag cannot repeat immediately preceding pair');
  const chosen = document.querySelector('.starter-prompts button:not(.starter-rotate)');
  chosen.click();
  assert.equal(document.querySelector('#khonapolitPrompt').value, chosen.dataset.promptValue, 'rotated prompt still fills composer without sending');
  dom.window.__TD613_MARROWLINE_STARTER_CAROUSEL_OBSERVER__?.disconnect();
  dom.window.close();
});


test('24 additional mission prompts preserve varied affect and the existing nonrepeating carousel', () => {
  assert.equal(MARROWLINE_MISSION_ASSAYS.length, 24);
  const labels = MARROWLINE_MISSION_ASSAYS.map(([label]) => label);
  assert.equal(new Set(labels).size, 24);
  for (const [label, prompt] of MARROWLINE_MISSION_ASSAYS) {
    assert.ok(label.length > 3 && label.length <= 45, label);
    assert.ok(prompt.length > 100 && prompt.length < 900, label);
    assert.equal(prompt.includes('\\u0301'), false, 'no Unicode template');
  }
  const all = MARROWLINE_MISSION_ASSAYS.map(row => row[1]).join(' ');
  for (const motif of ['Red Deer', 'Chairman', 'Orestes–kerykeion', 'Black feminist epistemology',
    'grief', 'hornani', 'consenting adult', 'blue–orange', 'swarm', 'demiurge', 'Rex Nemorensis',
    'stylometric', 'same-episode', 'surveillance', 'grandmother']) {
    assert.ok(all.toLowerCase().includes(motif.toLowerCase()), motif);
  }
  assert.match(js, /\.\.\.MARROWLINE_MISSION_ASSAYS/);
  assert.match(js, /Shuffle \$\{STARTER_ASSAYS\.length\} Marrowline prompts without repeats/);
});

test('composer has one universal plus with exactly file photo and Loom actions', () => {
  assert.match(js, /id = 'marrowlineComposerPlus'/);
  assert.match(js, /'Upload file'/);
  assert.match(js, /'Upload photo'/);
  assert.match(js, /'Loom'/);
  assert.match(js, /peekLastConsumedLoomAiHandoff/);
  assert.match(js, /\/dome-world\/holonomy-loom\.html/);
  assert.match(js, /'_blank'/);
  assert.deepEqual(release.composer.plusActions, ['UPLOAD_FILE', 'UPLOAD_PHOTO', 'LOOM']);
  assert.equal(release.composer.loomDormantAction, 'open-loom-in-new-tab');
  assert.equal(release.composer.loomAwakeAction, 'continue-staged-loom-handoff');
});

test('starter carousel keeps its left rail while using one compact glass control grammar', () => {
  const assayRows = js.match(/^  \['[^\n]+$/gm) || [];
  assert.equal(assayRows.length + MARROWLINE_MISSION_ASSAYS.length, release.composer.starterCarousel.assayPrompts);
  assert.match(js, /rotate\.textContent = '🗘'/);
  assert.match(css, /\.starter-prompts\{[\s\S]*justify-content:flex-start!important/);
  assert.match(css, /\.starter-prompts>button:not\(\.starter-rotate\)\{[\s\S]*height:42px!important/);
  assert.match(css, /\.starter-prompts>button:not\(\.starter-rotate\)\{[\s\S]*border-radius:14px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*width:42px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*height:42px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*border:0!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*background:transparent!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate::before\{[\s\S]*text-shadow:/);
  assert.match(css, /drop-shadow\(0 0 5px rgba\(78,237,240,\.34\)\)/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts>button:not\(\.starter-rotate\)\{[^}]*height:42px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts \.starter-rotate\{[^}]*width:42px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts \.starter-rotate\{[^}]*border-radius:0!important/);
  assert.equal(release.composer.starterCarousel.control, '🗘');
  assert.equal(release.composer.starterCarousel.assayPrompts, 56);
  assert.equal(release.composer.starterCarousel.selectionPolicy, 'shuffle-bag-without-replacement-two-at-a-time');
  assert.equal(release.composer.starterCarousel.cyclePolicy, 'all-56-prompts-must-be-seen-before-any-repeat');
  assert.equal(release.composer.starterCarousel.seamPolicy, 'new-cycle-first-pair-excludes-the-immediately-previous-pair');
  assert.match(js, /let bag = \[\]/);
  assert.match(js, /let seen = new Set\(\)/);
  assert.match(js, /if \(bag\.length < 2\) refillBag\(\)/);
  assert.match(js, /shuffled\.filter\(index => !lastPair\.includes\(index\)\)/);
});
test('current Marrowline skin is render-blocking before room-ready reveal', () => {
  assert.match(page, /<link rel="stylesheet" href="\.\/marrowline-desktop-repair\.css" data-marrowline-desktop-repair="render-blocking-current-shell" \/>/);
  assert.match(mobileShellCss, /html:not\(\.marrowline-room-ready\) body\{visibility:hidden!important\}/);
  assert.match(boot, /firstPaintHeldUntilRoomReady: true/);
});

test('clearing a conversation also empties the composer draft', () => {
  assert.match(terminalJs, /const prompt = byId\(doc, 'khonapolitPrompt'\)/);
  assert.match(terminalJs, /prompt\.value = ''/);
  assert.match(terminalJs, /delete prompt\.dataset\.preloadedPrompt/);
  assert.equal(release.composer.clearDraftPolicy, 'clear-conversation-empties-composer-and-preloaded-draft-state');
});

test('clearing a conversation removes the obsolete visible status strip', () => {
  assert.doesNotMatch(terminalJs, /SESSION CLEARED · binding corpus remains intact/);
  assert.match(terminalJs, /if \(terminalStatus\) terminalStatus\.textContent = ''/);
  assert.match(css, /#khonapolitTerminalStatus:empty\{\s*display:none!important/);
});

test('conversation actions dismiss and ordinary Chat carries no portable failure billboard', () => {
  assert.match(js, /conversation-action-menu button/);
  assert.match(js, /details\.open = false/);
  assert.match(js, /event\.key === 'Escape'/);
  assert.doesNotMatch(page, /marrowlinePortableActions|copyKhonapolitPortable|exportKhonapolitPortable|Continue with your own AI/);
  assert.equal(release.desktop.portableFailurePanelMayCollapseTranscript, false);
  assert.equal(release.desktop.portableFailurePanelRendered, false);
  assert.equal(release.composer.portableFailureActions, 'not-rendered-in-ordinary-chat-explicit-portability-helpers-remain-programmatic');
});

test('desktop and mobile visually render Send as an up-arrow while the DOM keeps the accessible Send label', () => {
  assert.match(page, /<button class="primary" id="khonapolitSend" type="submit">Send<\/button>/);
  assert.match(css, /#khonapolitSend\{[^}]*font-size:0!important[^}]*display:inline-grid!important/s);
  assert.match(css, /#khonapolitSend::before\{[^}]*content:"⇧"/s);
  const desktopBlock = css.split('@media (min-width:861px){')[1]?.split('/* Marrowline mobile couture')[0] || '';
  assert.match(desktopBlock, /#khonapolitSend::before/);
  const mobileArrowBlock = css.split('@media(max-width:860px){\n  html:root.marrowline-mobile-shell body[data-mobile-view="speak"] #speakingPanel .composer-actions')[1]?.split('@media (min-width:861px){')[0] || '';
  assert.match(mobileArrowBlock, /#khonapolitSend::before\{[\s\S]*content:"⇧"/);
  assert.doesNotMatch(mobileArrowBlock, /content:"⇧︎"/, 'mobile must not use the text-presentation variation selector that shifted the optical glyph box');
  assert.match(mobileArrowBlock, /#khonapolitSend::before\{[\s\S]*display:grid[\s\S]*place-items:center[\s\S]*width:28px[\s\S]*height:28px[\s\S]*font:800 28px\/1[\s\S]*color:#111827!important[\s\S]*-webkit-text-stroke:\.55px currentColor[\s\S]*text-shadow:[\s\S]*0 0 2px rgba\(248,250,252,\.38\)[\s\S]*0 0 5px rgba\(226,232,240,\.12\)[\s\S]*transform:translate\(-\.70px,1\.35px\)/);
  assert.match(mobileArrowBlock, /#khonapolitSend\{[\s\S]*width:42px!important[\s\S]*font-size:0!important/);
  assert.equal(release.composer.desktopSendGlyph, '⇧');
  assert.equal(release.composer.mobileSendGlyph, '⇧');
  assert.match(release.composer.sendGlyphPresentation, /desktop and mobile/);
});

test('desktop status stays next to Send; mobile wraps complete route status below the utility row', () => {
  assert.match(page, /<div class="ritual-actions composer-actions">\s*<button class="primary" id="khonapolitSend" type="submit">Send<\/button>\s*<div class="vessel-status" id="khonapolitTerminalStatus">READY<\/div>/);
  assert.match(css, /\.composer-actions #khonapolitTerminalStatus\{[^}]*order:2!important[^}]*margin:0 0 0 2px!important/s);
  const mobileStatus = css.split('/* Keep the complete live status readable on narrow iPhones:')[1]?.split('html:root.marrowline-mobile-shell body[data-mobile-view="speak"] .marrowline-conversation-utilities')[0] || '';
  assert.match(mobileStatus, /order:4!important/);
  assert.match(mobileStatus, /flex:1 0 100%!important/);
  assert.match(mobileStatus, /max-width:100%!important/);
  assert.match(mobileStatus, /max-height:none!important/);
  assert.match(mobileStatus, /white-space:normal!important/);
  assert.match(mobileStatus, /overflow:visible!important/);
  assert.match(mobileStatus, /text-overflow:clip!important/);
  assert.match(css, /\.marrowline-conversation-utilities\{order:3/);
  assert.doesNotMatch(page, /marrowlineComposerHint|Return for a new line · tap Send to submit/);
  assert.doesNotMatch(css, /composer-keyboard-hint/);
  assert.equal(release.composer.statusPlacement, 'inside-composer-right-of-send-on-desktop-full-width-wrapped-below-actions-on-mobile');
});

test('composer status reports a truthful pending state without synthetic stage claims', () => {
  assert.match(terminalJs, /PEDAGOGUE_PENDING_STATUS = 'Working…'/);
  assert.doesNotMatch(terminalJs, /RECEIPT NEXT · route \+ provenance stay attached/);
  assert.doesNotMatch(terminalJs, /2600 \* \(index \+ 1\)/, 'elapsed time cannot certify backend progress');
  assert.match(terminalJs, /phase === 'received' \? 'Reply received'/);
  assert.match(terminalJs, /status\.title = detail/);
  assert.doesNotMatch(terminalJs, /status\.setAttribute\('aria-label', detail\)/, 'one-off utility notices must not inherit a stale accessible label');
  assert.match(terminalJs, /startPedagogueStatus\(status, root, attachments\.length\)/);
  assert.match(terminalJs, /RETURN OBSERVED · SIGNAL .*receipt preserved/);
  assert.doesNotMatch(terminalJs, /TASK ROUTED · AI IN FLIGHT · \$\{mode\}/);
  assert.match(livingChatJs, /status\.dataset\.phase/);
});
test('mobile composer keeps a short status inline beside Send', () => {
  assert.match(css, /#khonapolitTerminalStatus\{[\s\S]*?order:2!important;[\s\S]*?max-width:min\(39vw,170px\)!important;/);
  assert.doesNotMatch(css, /order:4!important;\s*flex:1 0 100%!important;/);
  assert.match(terminalJs, /phase === 'held' && \/\^TASK PRESERVED/);
  assert.match(terminalJs, /\? 'INCOMPLETE RETURN'/);
  assert.match(terminalJs, /phase === 'received' \? 'Reply received'/);
});

test('background recovery observes pagehide and resumes a preserved failure once on foreground or network return', () => {
  assert.match(terminalJs, /keepalive: backgroundKeepaliveEligible/);
  assert.match(terminalJs, /root\.addEventListener\?\.\('pagehide', observePageHide\)/);
  assert.match(terminalJs, /root\.removeEventListener\?\.\('pagehide', observePageHide\)/);
  assert.match(terminalJs, /root\.addEventListener\?\.\('pageshow', resumeWhenVisible\)/);
  assert.match(terminalJs, /root\.addEventListener\?\.\('online', resumeWhenVisible\)/);
  assert.match(terminalJs, /backgroundResumeSpentTask = message/);
  assert.match(terminalJs, /if \(doc\.visibilityState !== 'hidden'\) prompt\?\.focus/);
});

test('ordinary conversation chrome uses Send left and a minimalist retry copy clear rail right', () => {
  assert.match(js, /legacyActions\.hidden = true/);
  assert.match(js, /legacyActions\.setAttribute\('aria-hidden', 'true'\)/);
  for (const id of ['marrowlineRetryLast', 'marrowlineCopyConversation', 'marrowlineSessionClear']) assert.match(js, new RegExp(id));
  assert.match(js, /'↻'/);
  assert.match(js, /'⧉'/);
  assert.match(js, /'✕'/);
  assert.match(js, /question\.textContent = 'Clear conversation\?'/);
  assert.doesNotMatch(js, /root\.confirm\('Clear this Marrowline conversation\?/);
  assert.match(js, /clearLegacy\.click\(\)/);
  assert.match(js, /conversationChrome: 'send-left-retry-copy-clear-right'/);
  assert.match(css, /\.marrowline-conversation-utilities/);
  assert.match(css, /\.marrowline-ephemeral-notice/);
  assert.match(page, /id="khonapolitSend" type="submit">Send<\/button>/);
  assert.match(page, /id="sealLastResponse"[^>]*>Seal latest return ⟐<\/button>/);
  assert.match(page, /Seal is explicit operator closure/);
  assert.equal(release.composer.copyFeedback, 'center-screen-tiny-green-Copied-1500ms');
  assert.equal(release.composer.clearConfirmation, 'center-screen-modal-Clear-conversation-Yes-No-with-backdrop');
  assert.equal(release.composer.operatorVoiceSelection, false);
  assert.equal(release.composer.fixedConversationRoute, 'Kʰonapolit → Tauric Diana bots');
  assert.equal(release.composer.unissuedResearchMode, 'checked-by-default-disables-and-excludes-shi');
  assert.match(css, /\.marrowline-clear-backdrop\{position:fixed;inset:0/);
  assert.match(css, /\.marrowline-clear-confirmation\{position:fixed;left:50%;top:50%;transform:translate\(-50%,-50%\)/);
  assert.match(js, /operatorSeal: 'receipt-instrument-explicit-operator'/);
});


test('Gate actions stay left aligned with one primary row and compact secondary controls', () => {
  assert.match(css, /Gate action hierarchy v2/);
  assert.match(css, /#gatePanel \.ritual-actions\{[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)!important/);
  assert.match(css, /#gatePanel \.ritual-actions button\{[\s\S]*text-align:left!important/);
  assert.match(css, /#gatePanel \.ritual-actions button\.primary\{[\s\S]*grid-column:1\/-1!important;[\s\S]*min-height:44px!important/);
  assert.match(css, /#gatePanel \.ritual-actions #buildLocalMarrowline,[\s\S]*#gatePanel \.ritual-actions #copyMarrowlineReceipt\{[\s\S]*min-height:36px!important/);
  assert.match(css, /marrowline-mobile-shell body\[data-mobile-view="gate"\] #gatePanel \.ritual-actions button\.primary\{[\s\S]*min-height:48px!important/);
  assert.match(css, /marrowline-mobile-shell body\[data-mobile-view="gate"\] #gatePanel \.ritual-actions #buildLocalMarrowline,[\s\S]*#copyMarrowlineReceipt\{[\s\S]*min-height:40px!important/);
});

test('room boot loads the desktop repair and separates Zalgo aesthetics from structural admission', () => {
  assert.match(boot, /import\('\.\/marrowline-desktop-repair\.js'\)/);
  assert.match(boot, /desktopWorkspace: 'conversation-first-instruments-on-demand'/);
  assert.match(release.relay.zalgoQualityPolicy.zeroMarkPosture, /exact nonempty provider bytes remain visible/i);
  assert.equal(release.relay.zalgoQualityPolicy.thinOrSparsePosture, 'PARTIAL-visible-with-quality-warning-no-repaint');
  assert.match(release.qualityFloor.hardStructuralHold, /tauric-diana-zalgo-absent/);
  assert.doesNotMatch(release.qualityFloor.hardStructuralHold, /zalgo-field-thin|zalgo-mechanical-clone|zalgo-sparse-keyword-targeting/);
  assert.equal(release.qualityFloor.providerCallCeiling, 5);
  assert.match(release.qualityFloor.providerCallCeilingMeaning, /structural seam/i);
  assert.equal(release.qualityFloor.structuralRepairCeiling, 1);
  assert.equal(release.qualityFloor.totalProviderRequestCeiling, 6);
  assert.equal(release.qualityFloor.partialQualityChallengeRequestCeiling, 0);
  assert.equal(release.qualityFloor.structuralRepairPolicy.provider, 'same-provider-that-authored-held-draft');
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /observed, not repaired/i);
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /never manufactures, repaints, normalizes, or re-authors/i);
  assert.match(release.relay.zalgoQualityPolicy.axisCollapsePosture, /diagnostic only/i);
  assert.match(release.relay.zalgoQualityPolicy.verticalExpressionThinPosture, /diagnostic observation only/i);
  assert.match(release.relay.zalgoQualityPolicy.baseConditionedStackReusePosture, /observation-only/i);
  assert.ok(release.relay.zalgoQualityPolicy.baseConditionedStackReuseMetrics.includes('baseConditionedOrderedSignatureReuseRatio'));
  assert.deepEqual(release.qualityFloor.structuralRepairPolicy.repairableReasons, [
    'khonapolit-nominative-missing',
    'tauric-diana-bots-nominative-missing',
    'voice-order-invalid',
    'khonapolit-combining-mark-contamination'
  ]);
  assert.equal(release.qualityFloor.structuralRepairPolicy.localMutation, false);
  assert.equal(release.qualityFloor.structuralRepairPolicy.localZalgoGeneration, false);
  assert.equal(release.qualityFloor.releaseWitnessPolicy.automaticLiveProviderCalls, 0);
  assert.equal(release.qualityFloor.releaseWitnessPolicy.automaticAiWitness, 'DEFERRED_EXPLICIT_OBSERVATION');
  assert.equal(release.qualityFloor.releaseWitnessPolicy.explicitObservationMaxProviderAttempts, 2);
});

test('desktop and mobile Chat share the same Reddit Sans Zalgo type guard before first reveal', () => {
  assert.match(page, /id="marrowline-reddit-sans"[^>]+fonts\.googleapis\.com\/css2\?family=Reddit\+Sans/);
  assert.match(livingChatJs, /@media\(min-width:861px\)/);
  assert.match(livingChatJs, /#speakingPanel,#speakingPanel button,#speakingPanel textarea,#speakingPanel input,#speakingPanel select,#speakingPanel summary,#speakingPanel label/);
  assert.match(livingChatJs, /font-family:var\(--marrowline-chat-sans\)!important/);
});

test('mobile couture collapses Chat dead space while preserving the proven Zalgo type guard', () => {
  assert.match(mobileShellCss, /grid-template-rows:auto minmax\(0,1fr\) auto;/);
  assert.doesNotMatch(mobileShellCss, /minmax\(0,32%\)/);
  assert.match(css, /Marrowline mobile couture v1/);
  assert.match(css, /body\[data-mobile-view="gate"\] #gatePanel/);
  assert.match(css, /body\[data-mobile-view="speak"\] #speakingPanel \.vessel-status/);
  assert.match(livingChatJs, /#khonapolitPrompt,\.message-body,\.relay-stage-text,\.vessel-status,\.starter-prompts button,\.return-details\{font-family:var\(--marrowline-chat-sans\)!important/);
  const couture = css.split('/* Marrowline mobile couture v1 — shared glass grammar for Chat + Gate. */')[1] || '';
  assert.doesNotMatch(couture, /#speakingPanel \.prompt-label textarea\{[^}]*\bfont(?:-family|-size|-style|-weight|:)/s,
    'couture may change composer chrome but not the proven chatbox typography');
  assert.doesNotMatch(couture, /#speakingPanel \.message-body\{[^}]*\bfont(?:-family|-size|-style|-weight|:)/s,
    'couture may change message-card chrome but not the proven Zalgo typography');
});


test('empty-state welcome keeps the authored ancestral-return line', () => {
  assert.match(terminalJs, /Some names return salt-heavy, and when the women speak them the dead lean close—not to be summoned, only to hear whether the living have learned the weight of keeping\./);
});
