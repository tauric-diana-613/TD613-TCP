import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync('app/dome-world/marrowline-desktop-repair.js', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-desktop-repair.css', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const page = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const mobileShellCss = fs.readFileSync('app/dome-world/marrowline-mobile-shell.css', 'utf8');
const livingChatJs = fs.readFileSync('app/dome-world/marrowline-living-chat.js', 'utf8');
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
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*border-radius:14px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts>button:not\(\.starter-rotate\)\{[^}]*height:42px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts \.starter-rotate\{[^}]*width:42px!important/);
  assert.equal(release.composer.starterCarousel.control, '🗘');
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

test('room boot loads the desktop repair and separates Zalgo aesthetics from structural admission', () => {
  assert.match(boot, /import\('\.\/marrowline-desktop-repair\.js'\)/);
  assert.match(boot, /desktopWorkspace: 'conversation-first-instruments-on-demand'/);
  assert.equal(release.relay.zalgoQualityPolicy.zeroMarkPosture, 'HELD-no-human-visible-return');
  assert.equal(release.relay.zalgoQualityPolicy.thinOrSparsePosture, 'PARTIAL-visible-with-quality-warning');
  assert.match(release.qualityFloor.hardStructuralHold, /tauric-diana-zalgo-absent/);
  assert.doesNotMatch(release.qualityFloor.hardStructuralHold, /zalgo-field-thin|zalgo-mechanical-clone|zalgo-sparse-keyword-targeting/);
  assert.equal(release.qualityFloor.providerCallCeiling, 5);
  assert.equal(release.qualityFloor.providerCallCeilingMeaning, 'maximum distinct frontier model-seat attempts');
  assert.equal(release.qualityFloor.structuralRepairCeiling, 1);
  assert.equal(release.qualityFloor.totalProviderRequestCeiling, 6);
  assert.equal(release.qualityFloor.structuralRepairPolicy.provider, 'same-provider-that-authored-held-draft');
  assert.equal(release.qualityFloor.structuralRepairPolicy.localMutation, false);
  assert.equal(release.qualityFloor.structuralRepairPolicy.localZalgoGeneration, false);
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
