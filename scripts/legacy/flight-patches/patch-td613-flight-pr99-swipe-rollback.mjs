import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const pr98Marker = '/* PR98_SENTINEL TD613 Flight symmetric lane swipe lock */';
const marker = '/* PR99_SENTINEL TD613 Flight rollback PR98 swipe lock to native lanes */';

const css = `
${marker}
@media (max-width: 820px) {
  .grid {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    overscroll-behavior-x: auto !important;
    overscroll-behavior-y: contain !important;
    scroll-snap-type: x proximity !important;
    scroll-behavior: auto !important;
    touch-action: pan-x pan-y pinch-zoom !important;
    -webkit-overflow-scrolling: touch !important;
    contain: none !important;
  }

  .grid > div:first-child,
  .grid > div:last-child {
    scroll-snap-align: start !important;
    scroll-snap-stop: normal !important;
  }

  body.td613-lane-snapping .grid {
    scroll-snap-type: x proximity !important;
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

function stripPr98Runtime(source) {
  return source.replace(/\n?<script id="td613-pr98-swipe-lock">[\s\S]*?<\/script>/g, '');
}

function injectCss(source) {
  let out = stripPr98Runtime(stripBlock(stripBlock(source, pr98Marker), marker));
  const cssInjectionPoint = 'const css = `\n';
  if (out.includes(cssInjectionPoint)) {
    out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  } else {
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point for PR99');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR99 CSS injection failed');
  if (out.includes('td613-pr98-swipe-lock')) throw new Error('PR98 runtime still present after rollback');
  if (out.includes(pr98Marker)) throw new Error('PR98 CSS marker still present after rollback');
  if (!out.includes('scroll-snap-type: x proximity !important;')) throw new Error('PR99 native proximity snap rule missing');
  return out;
}

fs.writeFileSync(htmlPath, injectCss(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectCss(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR99: removed PR98 runtime snap guard and restored native proximity lane scrolling.');
