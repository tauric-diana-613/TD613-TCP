import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const pr87Marker = '/* PR87_SENTINEL TD613 Flight iOS visual-scale input shim */';
const pr88Marker = '/* PR88_SENTINEL TD613 Flight focus stability micro patch */';
const pr89Marker = '/* PR89_SENTINEL TD613 Flight seal layout + payload micro patch */';
const pr90Marker = '/* PR90_SENTINEL TD613 Flight eager lane render */';
const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />';
const viewportMeta = /\n?<meta\b(?=[^>]*\bname=["']viewport["'])[^>]*>/gi;

const pr88Css = `
${pr88Marker}
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane textarea,
  .flight-lane #taskText,
  .flight-lane #outputText {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 74px !important;
    height: 86px !important;
    max-height: 150px !important;
    margin: 0 !important;
    font-size: 9px !important;
    line-height: 1.18 !important;
    transform: none !important;
    -webkit-transform: none !important;
    transform-origin: initial !important;
    -webkit-transform-origin: initial !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }

  .flight-lane textarea:focus,
  .flight-lane #taskText:focus,
  .flight-lane #outputText:focus {
    font-size: 9px !important;
    line-height: 1.18 !important;
    transform: none !important;
    -webkit-transform: none !important;
  }
}
`;

const pr89Css = `
${pr89Marker}
@media (hover: none), (pointer: coarse) {
  .flight-lane .output-toolbar {
    align-items: center !important;
    gap: 6px !important;
  }

  .flight-lane .payload-stepper {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 88px !important;
    max-width: 118px !important;
    min-height: 20px !important;
    height: 20px !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    margin-left: auto !important;
    transform: none !important;
    -webkit-transform: none !important;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px)) !important;
  }

  .flight-lane .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    letter-spacing: .08em !important;
    max-width: 42px !important;
    white-space: normal !important;
  }

  .flight-lane .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
    min-width: .65rem !important;
  }

  .flight-lane .payload-stepper-btn,
  .flight-lane .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px)) !important;
  }

  .flight-lane .seal-card .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(210px, .88fr) !important;
    grid-template-areas: "zwnj target" !important;
    gap: 7px !important;
    align-items: end !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child {
    grid-area: zwnj !important;
    align-self: end !important;
    margin-top: 12px !important;
    transform: translateX(-2px) translateY(6px) !important;
    -webkit-transform: translateX(-2px) translateY(6px) !important;
  }

  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    grid-area: target !important;
    align-self: stretch !important;
    min-height: 100% !important;
    transform: translateX(8px) !important;
    -webkit-transform: translateX(8px) !important;
  }

  .flight-lane .seal-card .section-split-row > div {
    padding: 7px 8px !important;
    min-width: 0 !important;
  }

  .flight-lane .seal-card .section-split-row .radio-row {
    gap: 4px 5px !important;
  }

  .flight-lane .seal-card #sealTargetWord {
    width: min(100%, 14rem) !important;
    max-width: 100% !important;
  }
}

@media (hover: none) and (pointer: coarse) and (max-width: 520px) {
  .flight-lane .seal-card .section-split-row {
    grid-template-columns: 1fr !important;
    grid-template-areas: "target" "zwnj" !important;
  }

  .flight-lane .seal-card .section-split-row > div:first-child,
  .flight-lane .seal-card .section-split-row > div:nth-child(2) {
    transform: none !important;
    -webkit-transform: none !important;
  }
}
`;

const pr90Css = `
${pr90Marker}
.flight-lane .card,
.flight-lane-prompt .card,
.flight-lane-output .card,
.flight-lane .output-card,
.flight-lane .seal-card,
.flight-lane .copy-bin-card,
.grid > div:first-child > *,
.grid > div:last-child > * {
  content-visibility: visible !important;
  contain-intrinsic-size: unset !important;
}

.flight-lane .grid > div:first-child,
.flight-lane .grid > div:last-child,
.grid > div:first-child,
.grid > div:last-child {
  contain: none !important;
}

@media (hover: none), (pointer: coarse), (max-width: 920px) {
  .flight-lane .card,
  .flight-lane-prompt .card,
  .flight-lane-output .card,
  .grid > div:first-child > *,
  .grid > div:last-child > * {
    content-visibility: visible !important;
    contain-intrinsic-size: unset !important;
  }
}
`;

function removeCssBlock(source, marker) {
  let out = source;
  while (out.includes(marker)) {
    const start = out.indexOf(marker);
    const nextPr85 = out.indexOf('/* PR85_FINAL_SENTINEL TD613 Flight mobile repair */', start + marker.length);
    const nextStyle = out.indexOf('\n</style>', start + marker.length);
    const nextCss = out.indexOf('\n/* ', start + marker.length);
    const candidates = [nextPr85, nextStyle, nextCss].filter((value) => value > start);
    if (!candidates.length) throw new Error('Could not find end of marked CSS block');
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function restoreNoZoomViewport(source) {
  let out = source.replace(viewportMeta, '');
  if (!out.includes('<head>')) throw new Error('Missing <head> in Flight HTML');
  return out.replace(/<head>/i, `<head>\n${viewport}`);
}

function removePrepNoZoom(source) {
  let out = source;
  const fn = `
  function prepNoZoom(el) {
    if (!el || !mobile()) return;
    var prev = el.getAttribute('data-td613-prev-font') || '';
    if (!el.hasAttribute('data-td613-prev-font')) el.setAttribute('data-td613-prev-font', el.style.fontSize || '');
    el.style.setProperty('font-size', '16px', 'important');
    window.setTimeout(function () {
      var old = el.getAttribute('data-td613-prev-font');
      if (old) el.style.fontSize = old;
      else el.style.removeProperty('font-size');
      el.removeAttribute('data-td613-prev-font');
    }, 450);
  }
`;
  const touch = `
  document.addEventListener('touchstart', function (event) {
    var field = event.target && event.target.closest && event.target.closest('textarea, input[type="text"], input[type="number"], input[type="date"], select');
    if (field) prepNoZoom(field);
  }, { capture: true, passive: true });
`;
  const focus = `
  document.addEventListener('focusin', function (event) {
    var field = event.target && event.target.closest && event.target.closest('textarea, input[type="text"], input[type="number"], input[type="date"], select');
    if (field) prepNoZoom(field);
  }, true);
`;
  out = out.split(fn).join('\n');
  out = out.split(touch).join('\n');
  out = out.split(focus).join('\n');
  return out;
}

function injectFlightCss(source) {
  let out = restoreNoZoomViewport(source);
  out = removeCssBlock(out, pr87Marker);
  out = removeCssBlock(out, pr88Marker);
  out = removeCssBlock(out, pr89Marker);
  out = removeCssBlock(out, pr90Marker);
  if (!out.includes('</style>')) throw new Error('Missing </style> in Flight HTML');
  return out.replace('</style>', `${pr88Css}\n${pr89Css}\n${pr90Css}\n</style>`);
}

function injectIntoPatchScript(source) {
  let out = removeCssBlock(source, pr87Marker);
  out = removeCssBlock(out, pr88Marker);
  out = removeCssBlock(out, pr89Marker);
  out = removeCssBlock(out, pr90Marker);
  const cssInjectionPoint = 'const css = `\n';
  if (!out.includes(cssInjectionPoint)) throw new Error('PR85 css template not found');
  return out.replace(cssInjectionPoint, `${cssInjectionPoint}${pr88Css}\n${pr89Css}\n${pr90Css}\n`);
}

let html = fs.readFileSync(htmlPath, 'utf8');
html = injectFlightCss(html);
html = removePrepNoZoom(html);
fs.writeFileSync(htmlPath, html);

let pr85 = fs.readFileSync(pr85Path, 'utf8');
pr85 = injectIntoPatchScript(pr85);
pr85 = removePrepNoZoom(pr85);
fs.writeFileSync(pr85Path, pr85);

console.log('Applied TD613 Flight PR88/PR89/PR90 micro patch: no-zoom viewport, stable tiny textareas, eager lane rendering, compact payload stepper, Seal split-row layout.');
