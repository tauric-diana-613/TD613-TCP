import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync('app/dome-world/marrowline-desktop-repair.js', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-desktop-repair.css', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
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

test('starter carousel exposes sixteen assays behind the requested rotate control', () => {
  const assayRows = js.match(/^  \['[^\n]+$/gm) || [];
  assert.equal(assayRows.length, 16);
  assert.match(js, /rotate\.textContent = '🗘'/);
  assert.equal(release.composer.starterCarousel.assayPrompts, 16);
  assert.equal(release.composer.starterCarousel.control, '🗘');
});

test('conversation actions dismiss and portable failure controls cannot consume the transcript', () => {
  assert.match(js, /conversation-action-menu button/);
  assert.match(js, /details\.open = false/);
  assert.match(js, /event\.key === 'Escape'/);
  assert.match(css, /#marrowlinePortableActions:not\(\[hidden\]\)\{display:flex!important/);
  assert.match(css, /#marrowlinePortableActions:not\(\[hidden\]\) h3,#marrowlinePortableActions:not\(\[hidden\]\) p\{display:none!important/);
  assert.equal(release.desktop.portableFailurePanelMayCollapseTranscript, false);
});

test('ordinary conversation chrome retires the dropdown and uses one confirmed corner clear', () => {
  assert.match(js, /legacyActions\.hidden = true/);
  assert.match(js, /legacyActions\.setAttribute\('aria-hidden', 'true'\)/);
  assert.match(js, /clear\.id = 'marrowlineSessionClear'/);
  assert.match(js, /root\.confirm\('Clear this Marrowline conversation\?/);
  assert.match(js, /clearLegacy\.click\(\)/);
  assert.match(js, /conversationChrome: 'corner-clear-only'/);
  assert.match(js, /operatorSeal: 'advanced-programmatic-only'/);
  assert.match(js, /OPEN UNTIL OPERATOR SEAL/);
});

test('room boot loads the desktop repair and relay low-flourish is soft quality only', () => {
  assert.match(boot, /import\('\.\/marrowline-desktop-repair\.js'\)/);
  assert.match(boot, /desktopWorkspace: 'conversation-first-instruments-on-demand'/);
  assert.equal(release.relay.flourishFloor.belowFloorPosture, 'PARTIAL-return-visible-with-receipt-warning');
  assert.equal(release.qualityFloor.hardStructuralHold, 'missing-voice-order-or-duplicate-remains-inadmissible');
});