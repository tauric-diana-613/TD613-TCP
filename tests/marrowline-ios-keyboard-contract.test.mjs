import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './marrowline-response-quality-contract.test.mjs';

const css = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.css', import.meta.url), 'utf8');
const readiness = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.js', import.meta.url), 'utf8');

function block(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, 'm'));
  assert.ok(match, `missing CSS block: ${selector}`);
  return match[1];
}

test('real iOS keyboard posture binds Marrowline speaking vessel to the VisualViewport rectangle', () => {
  assert.match(readiness, /viewport\.height < layoutHeight - 72/,
    'keyboard posture must be derived from VisualViewport contraction rather than a synthetic viewport resize alone');
  assert.match(readiness, /--marrowline-vv-top/);
  assert.match(readiness, /--marrowline-vv-left/);
  assert.match(readiness, /--marrowline-vv-width/);
  assert.match(readiness, /--marrowline-vh/);

  const panel = block('html.marrowline-mobile-shell body[data-keyboard-visible="true"][data-mobile-view="speak"] #speakingPanel');
  assert.match(panel, /position:fixed!important/);
  assert.match(panel, /top:var\(--marrowline-vv-top,0px\)!important/);
  assert.match(panel, /left:var\(--marrowline-vv-left,0px\)!important/);
  assert.match(panel, /width:var\(--marrowline-vv-width,100vw\)!important/);
  assert.match(panel, /height:var\(--marrowline-vh,100dvh\)!important/);
  assert.match(panel, /grid-template-rows:auto minmax\(72px,1fr\) auto!important/);
});

test('keyboard dock keeps action row in normal flow instead of overlaying the textarea', () => {
  const form = block('html.marrowline-mobile-shell body[data-keyboard-visible="true"] #speakingPanel .vessel-form');
  const actions = block('html.marrowline-mobile-shell body[data-keyboard-visible="true"] #speakingPanel .composer-actions');
  const prompt = block('html.marrowline-mobile-shell body[data-keyboard-visible="true"] #speakingPanel .prompt-label textarea');

  assert.match(form, /position:relative!important/);
  assert.match(form, /align-self:end!important/);
  assert.match(actions, /position:static!important/);
  assert.match(actions, /inset:auto!important/);
  assert.match(prompt, /min-height:58px!important/);
  assert.match(prompt, /max-height:96px!important/);
});
