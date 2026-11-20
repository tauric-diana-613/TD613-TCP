import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { installMarrowlineMobileReader } from '../app/dome-world/marrowline-mobile-reader.js';

const desktopJs = fs.readFileSync('app/dome-world/marrowline-desktop-repair.js', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-desktop-repair.css', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));

function setup(mobile = true) {
  const original = 'Kʰonapolit\nKhona‌lit-po 𝌋 ⟐ \u{10D613}\nT̴h̵e̶ g̷r̶o̸v̴e̶ ̵r̶e̴t̸u̷r̴n̸s̶.';
  const dom = new JSDOM('<!doctype html><html><body data-mobile-view="speak">' +
    '<section id="speakingPanel"><div class="vessel-head">Masthead</div>' +
    '<div id="khonapolitMessages"><article class="relay-message"><div class="relay-stage-text"></div></article></div>' +
    '<form id="khonapolitForm"><button id="marrowlineReaderToggle" type="button">⛶</button><textarea id="khonapolitPrompt"></textarea></form>' +
    '</section></body></html>', {url: 'https://td613.com/dome-world/marrowline.html'});
  const { document } = dom.window;
  document.documentElement.classList.add('marrowline-mobile-shell');
  document.querySelector('.relay-stage-text').textContent = original;
  let providerCalls = 0;
  dom.window.fetch = () => { providerCalls++; throw new Error('reader must never make provider requests'); };
  dom.window.matchMedia = () => ({matches:mobile,addEventListener() {}});
  dom.window.requestAnimationFrame = callback => callback();
  const messages = document.getElementById('khonapolitMessages');
  messages.scrollTop = 73;
  return {dom,document,messages,original,get providerCalls() {return providerCalls;}};
}

test('mobile rail adds ⛶ second, preserving existing four desktop actions', () => {
  assert.match(desktopJs, /utility\('marrowlineReaderToggle', '⛶', 'Open mobile reading mode'\)/);
  assert.match(desktopJs, /rail\.append\(retry, reader, copy, clear, home\)/);
  assert.match(desktopJs, /installMarrowlineMobileReader\(doc, root\)/);
  assert.deepEqual(release.composer.utilityGlyphs, ['↻','⧉','✕','𖠿']);
  assert.deepEqual(release.composer.mobileUtilityGlyphs, ['↻','⛶','⧉','✕','𖠿']);
  assert.match(css, /@media\(min-width:861px\)[\s\S]*?#marrowlineReaderToggle\{display:none!important\}/);
});

test('reader toggles focus, capture, focus and exit without modifying original DOM text', () => {
  const h = setup(), {document,messages,original} = h;
  const originalChild = messages.firstChild;
  const before = messages.textContent;
  const ctrl = installMarrowlineMobileReader(document,h.dom.window);
  assert.ok(ctrl);
  assert.equal(ctrl.mode,'off');
  document.getElementById('marrowlineReaderToggle').click();
  assert.equal(ctrl.mode,'focus');
  assert.equal(document.body.dataset.marrowlineReader,'focus');
  assert.equal(document.getElementById('marrowlineReaderToolbar').hidden,false);
  assert.equal(document.getElementById('marrowlineReaderToggle').getAttribute('aria-pressed'),'true');
  document.getElementById('marrowlineReaderCapture').click();
  assert.equal(ctrl.mode,'capture');
  assert.equal(document.getElementById('marrowlineReaderCapture').getAttribute('aria-pressed'),'true');
  document.getElementById('marrowlineReaderCapture').click();
  assert.equal(ctrl.mode,'focus');
  document.getElementById('marrowlineReaderExit').click();
  assert.equal(ctrl.mode,'off');
  assert.equal(document.body.hasAttribute('data-marrowline-reader'),false);
  assert.equal(messages.firstChild,originalChild);
  assert.equal(messages.textContent,before);
  assert.equal(messages.textContent,original);
  assert.equal(messages.scrollTop,73);
  assert.equal(h.providerCalls,0);
  h.dom.window.close();
});

test('Escape and chamber changes restore normal reading shell', () => {
  const h=setup(), {document}=h;
  const ctrl=installMarrowlineMobileReader(document,h.dom.window);
  ctrl.setMode('capture');
  document.dispatchEvent(new h.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal(ctrl.mode,'off');
  ctrl.setMode('focus');
  document.body.dataset.mobileView='gate';
  h.dom.window.dispatchEvent(new h.dom.window.CustomEvent('td613:marrowline:mobile-view'));
  assert.equal(ctrl.mode,'off');
  assert.equal(ctrl.setMode('capture'),false);
  h.dom.window.close();
});

test('desktop geometry cannot activate mobile reader', () => {
  const h=setup(false), {document}=h;
  const ctrl=installMarrowlineMobileReader(document,h.dom.window);
  document.getElementById('marrowlineReaderToggle').click();
  assert.equal(ctrl.mode,'off');
  assert.equal(document.body.dataset.marrowlineReader,undefined);
  h.dom.window.close();
});

test('reader CSS retains transcript scroll owner and hides composer only for capture', () => {
  assert.match(css, /data-marrowline-reader="focus"[\s\S]*?#khonapolitForm \.prompt-label textarea/);
  assert.match(css, /data-marrowline-reader="capture"[\s\S]*?#khonapolitForm\{\s*display:none!important/);
  assert.match(css, /data-marrowline-reader[\s\S]*?#khonapolitMessages\{/);
  assert.doesNotMatch(fs.readFileSync('app/dome-world/marrowline-mobile-reader.js','utf8'), /innerHTML\s*=|fetch\(|normalize\(|replaceAll\(|textContent\s*=\s*original/);
});
