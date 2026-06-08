import fs from 'node:fs';

const targets = [
  'app/safe-harbor/td613-flight.html',
  'scripts/patch-td613-flight-mobile-pr85-final.mjs'
];

const marker = '/* PR166_SENTINEL TD613 Flight mobile vertical scroll unlock */';

const css = `
${marker}
@media (max-width: 820px) {
  html,
  body,
  html[data-flight-shi-cached="true"] body.flight-locked,
  body.flight-locked {
    height: auto !important;
    min-height: 100dvh !important;
    max-height: none !important;
    overflow-x