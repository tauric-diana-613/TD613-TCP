import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  assert.equal(assayRows.length, release.composer.starterCarousel.assayPrompts);
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
  assert.equal(release.composer.starterCarousel.assayPrompts, 32);
  assert.equal(release.composer.starterCarousel.selectionPolicy, 'shuffle-bag-without-replacement-two-at-a-time');
  assert.equal(release.composer.starterCarousel.cyclePolicy, 'all-32-prompts-must-be-seen-before-any-repeat');
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
  assert.match(mobileArrowBlock, /#khonapolitSend::before\{[\s\S]*content:"⇧︎"/);
  assert.match(mobileArrowBlock, /#khonapolitSend::before\{[\s\S]*display:grid[\s\S]*place-items:center[\s\S]*width:28px[\s\S]*height:28px[\s\S]*font:800 28px\/1[\s\S]*-webkit-text-stroke:\.55px currentColor[\s\S]*transform:translateY\(1px\)/);
  assert.match(mobileArrowBlock, /#khonapolitSend\{[\s\S]*width:42px!important[\s\S]*font-size:0!important/);
  assert.equal(release.composer.desktopSendGlyph, '⇧');
  assert.equal(release.composer.mobileSendGlyph, '⇧');
  assert.match(release.composer.sendGlyphPresentation, /desktop and mobile/);
});

test('status sits immediately to the right of Send inside the composer on desktop and mobile', () => {
  assert.match(page, /<div class="ritual-actions composer-actions">\s*<button class="primary" id="khonapolitSend" type="submit">Send<\/button>\s*<div class="vessel-status" id="khonapolitTerminalStatus">READY<\/div>/);
  assert.match(css, /\.composer-actions #khonapolitTerminalStatus\{[^}]*order:2!important[^}]*margin:0 0 0 2px!important/s);
  assert.match(css, /body\[data-mobile-view="speak"\] \.composer-actions #khonapolitTerminalStatus\{[^}]*order:2!important[^}]*margin:0!important/s);
  assert.match(css, /\.marrowline-conversation-utilities\{order:3/);
  assert.equal(release.composer.statusPlacement, 'inside-composer-immediately-right-of-send-on-desktop-and-mobile');
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
  assert.equal(release.relay.zalgoQualityPolicy.zeroMarkPosture, 'HELD-no-human-visible-return');
  assert.equal(release.relay.zalgoQualityPolicy.thinOrSparsePosture, 'PARTIAL-visible-with-quality-warning');
  assert.match(release.qualityFloor.hardStructuralHold, /tauric-diana-zalgo-absent/);
  assert.doesNotMatch(release.qualityFloor.hardStructuralHold, /zalgo-field-thin|zalgo-mechanical-clone|zalgo-sparse-keyword-targeting/);
  assert.equal(release.qualityFloor.providerCallCeiling, 5);
  assert.match(release.qualityFloor.providerCallCeilingMeaning, /five distinct model seats/);
  assert.equal(release.qualityFloor.structuralRepairCeiling, 1);
  assert.equal(release.qualityFloor.totalProviderRequestCeiling, 6);
  assert.equal(release.qualityFloor.partialQualityChallengeRequestCeiling, 1);
  assert.equal(release.qualityFloor.structuralRepairPolicy.provider, 'same-provider-that-authored-held-draft');
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /native-voice collapse/i);
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /exactly one immediate same-provider Gemini repair/i);
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /stack height\/depth/i);
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /Shallow-wallpaper/i);
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /Marrowline never manufactures morphology/i);
  assert.match(release.qualityFloor.failurePosture, /imperfect repaint preserves the original provider PARTIAL/i);
  assert.match(release.relay.zalgoQualityPolicy.axisCollapsePosture, /combined with stack-depth-thin/i);
  assert.match(release.relay.zalgoQualityPolicy.verticalExpressionThinPosture, /combined with stack-depth-thin/i);
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
