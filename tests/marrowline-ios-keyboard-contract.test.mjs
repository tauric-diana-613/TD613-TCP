import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { isMarrowlineComposerSendShortcut } from '../app/dome-world/marrowline-operator-readiness.js';
import './marrowline-response-quality-contract.test.mjs';
import './marrowline-attractor-quality-contract.test.mjs';

const css = readFileSync(new URL('../app/dome-world/marrowline-mobile-shell.css', import.meta.url), 'utf8');
const repair = readFileSync(new URL('../app/dome-world/marrowline-physical-device-repair.js', import.meta.url), 'utf8');
const readiness = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.js', import.meta.url), 'utf8');

function block(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, 'm'));
  assert.ok(match, `missing CSS block: ${selector}`);
  return match[1];
}

test('real iOS keyboard posture binds Marrowline speaking vessel to the VisualViewport rectangle', () => {
  assert.match(repair, /height < layoutHeight - 96/,
    'keyboard posture must be derived from VisualViewport contraction rather than a synthetic viewport resize alone');
  assert.match(repair, /--marrowline-vv-top/);
  assert.match(repair, /--marrowline-vv-left/);
  assert.match(repair, /--marrowline-vv-width/);
  assert.match(repair, /--marrowline-vv-height/);
  for (const delay of [40, 120, 260, 520]) assert.match(repair, new RegExp(String(delay)), `iOS settle sampling must include ${delay}ms`);
  assert.match(repair, /__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR_DISPOSE__/,
    'physical-device repair must own explicit lifecycle disposal so CI/browser teardown cannot hang');

  const panel = block('html:root.marrowline-mobile-shell body[data-keyboard-visible="true"][data-mobile-view="speak"] #speakingPanel');
  assert.match(panel, /position:fixed!important/);
  assert.match(panel, /top:var\(--marrowline-vv-top,0px\)!important/);
  assert.match(panel, /left:var\(--marrowline-vv-left,0px\)!important/);
  assert.match(panel, /width:var\(--marrowline-vv-width,100vw\)!important/);
  assert.match(panel, /height:var\(--marrowline-vv-height,var\(--marrowline-vh,100dvh\)\)!important/);
  assert.match(panel, /grid-template-rows:auto minmax\(0,1fr\) max-content!important/);
  assert.match(panel, /overflow:hidden!important/);
});

test('keyboard visibility and viewport rectangle cannot split across readiness and physical-device observers', () => {
  const readinessSync = readiness.match(/function syncVisualViewport[\s\S]*?return Object\.freeze\(\{ width, height, top, left, keyboardVisible \}\);\n\}/)?.[0] || '';
  assert.match(readinessSync, /style\.setProperty\('--marrowline-vv-height', `\$\{height\}px`\)/,
    'any observer allowed to publish keyboardVisible must publish the same VisualViewport height atomically');
  assert.match(readinessSync, /doc\.body\.dataset\.keyboardVisible = String\(keyboardVisible\)/);
});

test('keyboard dock keeps action row in normal flow instead of overlaying the textarea', () => {
  const form = block('html:root.marrowline-mobile-shell body[data-keyboard-visible="true"] #speakingPanel .vessel-form');
  const actions = block('html:root.marrowline-mobile-shell body[data-keyboard-visible="true"] #speakingPanel .composer-actions');
  const prompt = block('html:root.marrowline-mobile-shell body[data-keyboard-visible="true"] #speakingPanel .prompt-label textarea');

  assert.match(form, /position:relative!important/);
  assert.match(form, /align-self:end!important/);
  assert.match(form, /overflow:visible!important/);
  assert.match(actions, /position:static!important/);
  assert.match(actions, /inset:auto!important/);
  assert.match(prompt, /height:68px!important/);
  assert.match(prompt, /min-height:68px!important/);
  assert.match(prompt, /max-height:68px!important/);
});
const marrowlineHtml = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const livingChat = readFileSync(new URL('../app/dome-world/marrowline-living-chat.js', import.meta.url), 'utf8');
const terminal = readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
const desktopCss = readFileSync(new URL('../app/dome-world/marrowline-desktop-repair.css', import.meta.url), 'utf8');

test('native Return composes paragraphs; only explicit Send or Ctrl/Command+Enter submits', () => {
  const dom = new JSDOM(marrowlineHtml, { url: 'https://td613.com/dome-world/marrowline.html' });
  try {
    const prompt = dom.window.document.getElementById('khonapolitPrompt');
    assert.equal(prompt.tagName, 'TEXTAREA');
    assert.equal(prompt.getAttribute('enterkeyhint'), 'enter', 'iOS must offer the native Return key');
    assert.equal(prompt.getAttribute('aria-describedby'), 'marrowlineComposerHint');
    assert.match(dom.window.document.getElementById('marrowlineComposerHint').textContent, /Return for a new line/);
    const key = (extra = {}) => ({ key: 'Enter', shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, isComposing: false, ...extra });
    assert.equal(isMarrowlineComposerSendShortcut(key()), false, 'plain Return stays in the textarea');
    assert.equal(isMarrowlineComposerSendShortcut(key({ shiftKey: true })), false);
    assert.equal(isMarrowlineComposerSendShortcut(key({ ctrlKey: true })), true);
    assert.equal(isMarrowlineComposerSendShortcut(key({ metaKey: true })), true);
    assert.equal(isMarrowlineComposerSendShortcut(key({ ctrlKey: true, isComposing: true })), false);
    assert.equal(isMarrowlineComposerSendShortcut(key({ metaKey: true, altKey: true })), false);
    assert.match(readiness, /if \(!isMarrowlineComposerSendShortcut\(event\)\) return;/);
  } finally { dom.window.close(); }
});

test('masthead TD613 opens its own tab without hijacking the current chat state', () => {
  const dom = new JSDOM(marrowlineHtml, { url: 'https://td613.com/dome-world/marrowline.html' });
  try {
    const link = dom.window.document.getElementById('marrowlineRest');
    assert.equal(link.tagName, 'A');
    assert.equal(link.href, 'https://td613.com/');
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');
    assert.equal(link.hasAttribute('aria-pressed'), false);
    assert.doesNotMatch(livingChat, /rest\.addEventListener\('click'/);
    assert.match(desktopCss, /#marrowlineRest:focus-visible/);
  } finally { dom.window.close(); }
});

test('conversation export uses text/plain and provider prose starts at regular display weight', () => {
  assert.match(terminal, /clipboard\.writeText\(transcriptText\(state\.messages\)\)/);
  assert.match(terminal, /TRANSCRIPT COPIED AS PLAIN TEXT/);
  assert.match(desktopCss, /#khonapolitMessages \.provider-native-line,/);
  assert.match(desktopCss, /#khonapolitMessages \.zalgo-line\{font-weight:400!important/);
  assert.match(desktopCss, /\.relay-stage-text strong,/);
  assert.doesNotMatch(livingChat, /textContent = resting \?/);
});
