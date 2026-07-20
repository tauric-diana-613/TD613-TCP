import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../app/dome-world/domeblox');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const html = read('index.html');
const css = read('domeblox-game.css');
const render = read('game/render.js');
const sim = read('game/sim.js');
const main = read('game/main.js');
const scalar = String.fromCodePoint(0x10D613);

if (!html.includes(scalar)) throw new Error('exact U+10D613 scalar missing');
if (html.includes('user-scalable=no')) throw new Error('mobile zoom suppression restored');
if (!html.includes("font-src 'self' data:")) throw new Error('embedded custom-font CSP lane missing');
for (const token of [
  '@font-face', 'font-family:"TD613 FlowCore"', 'data:font/woff2;base64,',
  'unicode-range:U+10D613', '--safe-bottom:env(safe-area-inset-bottom',
  '@media (min-width:1000px) and (pointer:fine)', '@media (pointer:coarse),(max-width:820px)',
  'max-height:min(48svh,430px)', '.flowcore-glyph'
]) {
  if (!css.includes(token)) throw new Error(`responsive/font contract missing: ${token}`);
}
if (!render.includes("import { CANONICAL, G")) throw new Error('Canvas renderer lacks canonical scalar import');
if (!render.includes('function viewportFrame()')) throw new Error('responsive camera frame missing');
if (!render.includes('G.camera.centerX')) throw new Error('reserved desktop play frame missing');
if (!render.includes('item.glyph === CANONICAL')) throw new Error('Canvas PUA font selection missing');
if (!render.includes('TD613 FlowCore')) throw new Error('Canvas custom font family missing');
if (!sim.includes("classList.toggle('flowcore-glyph', interactionGlyph === CANONICAL)")) throw new Error('DOM glyph font routing missing');
if (!main.includes("document.fonts?.load('48px \\\"TD613 FlowCore\\\"', CANONICAL)")) throw new Error('custom font preload missing');
if (!main.includes('compactViewport && !G.hudCollapsed')) throw new Error('mobile compact HUD default missing');
if (!main.includes("version: '1.1.0'")) throw new Error('responsive runtime version missing');

console.log('DomeBlox responsive and U+10D613 font contract PASS');
