import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../app/dome-world/domeblox');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const html = read('index.html');
const css = read('domeblox-responsive.css');
const chrome = read('domeblox-chrome-v12.css');
const render = read('game/render-responsive.js');
const centered = read('game/render-centered.js');
const sim = read('game/sim-responsive.js');
const main = read('game/main.js');
const scalar = String.fromCodePoint(0x10D613);

if (!html.includes(scalar)) throw new Error('exact U+10D613 scalar missing');
if (html.includes('user-scalable=no')) throw new Error('mobile zoom suppression restored');
if (!html.includes("font-src 'self' data:")) throw new Error('embedded custom-font CSP lane missing');
if (!html.includes('./domeblox-responsive.css')) throw new Error('responsive stylesheet link missing');
if (!html.includes('./domeblox-chrome-v12.css')) throw new Error('compact chrome stylesheet link missing');
for (const token of [
  '@font-face', 'font-family:"TD613 FlowCore"', 'data:font/woff2;base64,',
  'unicode-range:U+10D613', '--safe-bottom:env(safe-area-inset-bottom',
  '@media (min-width:1000px) and (pointer:fine)', '@media (pointer:coarse),(max-width:820px)',
  'max-height:min(48svh,430px)', '.flowcore-glyph', '.message-log'
]) {
  if (!css.includes(token)) throw new Error(`responsive/font contract missing: ${token}`);
}
for (const token of [
  '--chrome-glass', 'width:252px', 'grid-template-columns:repeat(4,minmax(0,1fr))',
  'width:max-content', 'max-width:min(360px,calc(100vw - 32px))'
]) {
  if (!chrome.includes(token)) throw new Error(`compact chrome contract missing: ${token}`);
}
if (!render.includes('TD613 FlowCore')) throw new Error('Canvas custom font family missing');
if (!render.includes('ctx.font = `16px ${GLYPH_FONT}`')) throw new Error('map custom glyph font missing');
if (!centered.includes('centerX: innerWidth / 2')) throw new Error('true viewport centering missing');
if (!centered.includes('drawPersistentStations')) throw new Error('zoom-invariant station layer missing');
if (!centered.includes("schema: 'td613.domeblox.render-diagnostics/v1.2'")) throw new Error('render diagnostics missing');
if (!centered.includes("item.kind !== 'home'")) throw new Error('station visibility inventory missing');
if (!sim.includes("from './render-responsive.js'")) throw new Error('responsive map renderer not routed');
if (!main.includes("document.fonts?.load('48px \"TD613 FlowCore\"', CANONICAL)")) throw new Error('custom font preload missing');
if (!main.includes('if (!G.hudCollapsed) toggleHud()')) throw new Error('compact HUD default missing');
if (!main.includes("version:'1.2.0'")) throw new Error('centered runtime version missing');
if (!main.includes("from './render-centered.js'")) throw new Error('centered renderer not active');
if (!main.includes('visualViewport?.addEventListener')) throw new Error('browser zoom resize listener missing');
if (!main.includes("from './sim-responsive.js'")) throw new Error('responsive simulation adapter not active');

console.log('DomeBlox centered chrome and zoom-invariant glyph contract PASS');
