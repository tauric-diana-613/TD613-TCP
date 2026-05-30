import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const pr101Marker = '/* PR101_SENTINEL TD613 Flight mobile state lanes no horizontal trap */';
const marker = '/* PR102_SENTINEL TD613 Flight restore visible Output lane after PR101 rollback */';

const css = `
${marker}
@media (max-width: 820px) {
  .grid {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x proximity !important;
    scroll-behavior: auto !important;
    touch-action: pan-x pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    display: block !important;
    scroll-snap-align: start !important;
    scroll-snap-stop: normal !important;
    touch-action: pan-x pan-y pinch-zoom !important;
  }

  html[data-td613-lane="prompt"] .grid > div:first-child,
  html[data-td613-lane="prompt"] .grid > div:last-child,
  html[data-td613-lane="output"] .grid > div:first-child,
  html[data-td613-lane="output"] .grid > div:last-child {
    display: block !important;
  }
}
`;

function stripBlock(source, blockMarker) {
  let out = source;
  while (out.includes(blockMarker)) {
    const start = out.indexOf(blockMarker);
    const nextPr = out.indexOf('\n/* PR', start + blockMarker.length);
    const styleEnd = out.indexOf('\n</style>', start + blockMarker.length);
    const templateEnd = out.indexOf('\n`;', start + blockMarker.length);
    const candidates = [nextPr, styleEnd, templateEnd].filter((value) => value > start);
    if (!candidates.length) throw new Error(`Could not find end of CSS block for ${blockMarker}`);
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function stripPr101Runtime(source) {
  return source.replace(/\n?<script id="td613-pr101-state-lanes">[\s\S]*?<\/script>/g, '');
}

function injectCss(source) {
  let out = stripPr101Runtime(stripBlock(stripBlock(source, pr101Marker), marker));
  const cssInjectionPoint = 'const css = `\n';
  if (out.includes(cssInjectionPoint)) {
    out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  } else {
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point for PR102');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR102 CSS injection failed');
  if (out.includes('td613-pr101-state-lanes')) throw new Error('PR101 runtime still present after rollback');
  if (out.includes(pr101Marker)) throw new Error('PR101 CSS marker still present after rollback');
  if (!out.includes('display: block !important;')) throw new Error('PR102 output visibility repair missing');
  return out;
}

fs.writeFileSync(htmlPath, injectCss(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectCss(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR102: removed PR101 state-lane blanking and restored visible Output lane.');
