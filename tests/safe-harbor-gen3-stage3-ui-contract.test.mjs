import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../app/safe-harbor/index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../app/safe-harbor/app/main.js', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-temporal-bloom.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-temporal-bloom.css', import.meta.url), 'utf8');

for (const marker of [
  'id="temporalBloom"',
  'id="temporalBloomLine"',
  'id="temporalBloomRecognition"',
  'Write naturally. Repetition, fragments, pauses, and unfinished thoughts are welcome.',
  'id="stage3ProvenancePanel"',
  'id="stage3CountersignButton"',
  'id="stage3BindingAuthority"',
  'id="stage3HistoricalAuthority"',
  'id="stage3EntrantIntake"',
  'id="stage3CountersignatureAuthority"',
  'id="stage3PresentationAuthority"',
  'safe-harbor-temporal-bloom.css',
  'safe-harbor-temporal-bloom.js'
]) assert.ok(html.includes(marker), `Stage 3 HTML marker missing: ${marker}`);

assert.ok(html.indexOf('id="stage3ProvenancePanel"') < html.indexOf('id="packetVaultFold"'), 'SHI and provenance presentation must appear near the top of the packet surface');
assert.doesNotMatch(html, /role="progressbar"/u);
assert.match(html, /aria-live="polite"/u);

for (const marker of [
  "const PUBLIC_MATURE_LANE_WORDS = 360",
  "td613:safe-harbor:stage3-state",
  "td613:safe-harbor:stage3-request-state",
  "td613:safe-harbor:countersign-request",
  "countersignEntrantAuthorshipBinding",
  'lane_counts:',
  'raw_text_included: false',
  'telemetry_collected: false'
]) assert.ok(main.includes(marker), `Stage 3 main bridge marker missing: ${marker}`);

assert.doesNotMatch(main, /keystroke_timing\s*:/u);
assert.doesNotMatch(main, /pause_timing\s*:/u);
assert.doesNotMatch(main, /cursor_trajectory\s*:/u);

for (const marker of [
  'threshold_authority: \'safe-harbor-main-counted-state\'',
  'independent_tokenization_performed: false',
  'telemetry_collected: false',
  'document.addEventListener(\'click\', guardClick, true)',
  'document.addEventListener(\'keydown\', guardKeyboard, true)',
  "continueButton.hidden = hide",
  "AI IMITATION COLLISION: PRESENT",
  "AUTHORITY CLAIM REDUCED"
]) assert.ok(ui.includes(marker), `Temporal Bloom UI marker missing: ${marker}`);

assert.doesNotMatch(ui, /\.split\(\s*\/\\s\+\//u, 'presentation consumer must not tokenize entrant text');
assert.doesNotMatch(ui, /keyup|keypress|beforeinput|compositionupdate/iu, 'no hidden typing telemetry listeners');
assert.doesNotMatch(ui, /performance\.now|Date\.now\(\).*key/iu, 'no timing-derived behavioral collection');

for (const marker of [
  "body:not([data-temporal-public='false']) #ingressProgressPill",
  "body:not([data-temporal-public='false']) .ingress-console-block",
  '#ingressContinue[hidden]',
  '@media (prefers-reduced-motion: reduce)',
  'animation: none !important',
  '@supports (-webkit-touch-callout: none)',
  'font-size: 16px',
  'scroll-margin-block-end'
]) assert.ok(css.includes(marker), `Stage 3 CSS marker missing: ${marker}`);

assert.doesNotMatch(css, /animation-duration:\s*0\.[0-2]s/iu, 'Temporal Bloom may not introduce rapid flicker');

console.log('safe-harbor-gen3-stage3-ui-contract: ok');
