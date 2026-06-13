import assert from 'assert';
import fs from 'fs';

const css = fs.readFileSync('app/hush-alien-console.css', 'utf8');
const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const versions = fs.readFileSync('app/asset-versions.js', 'utf8');

for (const selector of [
  '.hush-alien-console',
  '.hush-signal-masthead',
  '.hush-orbital-shell',
  '.hush-operator-path',
  '.hush-path-step',
  '.hush-message-chamber',
  '.hush-mask-chamber',
  '.hush-output-chamber',
  '.hush-transform-gate',
  '.hush-heat-grid',
  '.hush-heat-tile',
  '.hush-route-card',
  '.hush-drawer-console',
  '.hush-local-flight-banner',
  '.hush-found-tech-border',
  '.hush-glyph-rail'
]) {
  assert(css.includes(selector), `alien console css missing ${selector}`);
}

assert(css.includes('prefers-reduced-motion'), 'alien console css must respect reduced motion');
assert(css.includes('@media(max-width:720px)'), 'alien console css must include mobile media query');
assert(css.includes(':focus-visible'), 'alien console css must preserve visible focus states');
assert(!/@import\s+url|https?:\/\//i.test(css), 'alien console css must not import remote assets');
assert(html.indexOf('hush-invisible.css') < html.indexOf('hush-alien-console.css'), 'alien console css should load after invisible css');
assert(versions.includes('hushAlienConsole'), 'asset versions should include hushAlienConsole cache key');

console.log('hush-alien-console-css tests passed');
