import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/living-room.css', import.meta.url), 'utf8');

test('completed room remains visually legible after the one-shot settling motion', () => {
  assert.match(css, /\.loom-living-room\[data-phase=["']completed["']\]/);
  assert.match(css, /\.lr-reply/);
  assert.match(css, /filter:\s*drop-shadow/);
});

test('desktop room illustration receives a deliberate larger presentation footprint', () => {
  assert.match(css, /@media\(min-width:761px\)[\s\S]*\.lr-world[\s\S]*width:\s*calc\(100% \+ 56px\)/);
});
