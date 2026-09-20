import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync('app/dome-world/marrowline-desktop-repair.js', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-desktop-repair.css', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const page = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
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

test('starter carousel exposes sixteen assays behind a geometrically locked round control', () => {
  const assayRows = js.match(/^  \['[^\n]+$/gm) || [];
  assert.equal(assayRows.length, 16);
  assert.match(js, /rotate\.textContent = '🗘'/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[^}]*flex:0 0 36px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[^}]*width:36px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[^}]*height:36px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[^}]*aspect-ratio:1\/1/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[^}]*border-radius:999px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts \.starter-rotate\{[^}]*width:38px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts \.starter-rotate\{[^}]*height:38px!important/);
  assert.equal(release.composer.starterCarousel.assayPrompts, 16);
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
  assert.equal(release.relay.zalgoQualityPolicy.zeroMarkPosture, 'PARTIAL-visible-with-quality-warning');
  assert.equal(release.relay.zalgoQualityPolicy.thinOrSparsePosture, 'PARTIAL-visible-with-quality-warning');
  assert.doesNotMatch(release.qualityFloor.hardStructuralHold, /tauric-diana-zalgo-absent/);
  assert.doesNotMatch(release.qualityFloor.hardStructuralHold, /tauric-diana-zalgo-absent|zalgo-field-thin|zalgo-mechanical-clone|zalgo-sparse-keyword-targeting/);
  assert.match(release.qualityFloor.qualityWarningOnly, /tauric-diana-zalgo-absent/);
});