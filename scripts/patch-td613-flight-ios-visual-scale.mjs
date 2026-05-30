import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const pr87Marker = '/* PR87_SENTINEL TD613 Flight iOS visual-scale input shim */';
const pr88Marker = '/* PR88_SENTINEL TD613 Flight focus stability micro patch */';

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
    transform: none !important;
    -webkit-transform: none !important;
  }

  .payload-stepper {
    flex: 0 0 auto !important;
    min-height: 24px !important;
    height: 24px !important;
    padding: 2px 5px !important;
    gap: 5px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .payload-stepper-label {
    font-size: 6px !important;
    line-height: 1 !important;
    letter-spacing: .08em !important;
  }

  .payload-stepper-value {
    font-size: 8px !important;
    line-height: 1 !important;
    min-width: .85rem !important;
  }

  .payload-stepper-btn {
    width: 18px !important;
    min-width: 18px !important;
    height: 18px !important;
    min-height: 18px !important;
    padding: 0 !important;
    font-size: 10px !important;
    line-height: 1 !important;
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

function injectPr88Css(source) {
  let out = removeCssBlock(source, pr87Marker);
  out = removeCssBlock(out, pr88Marker);
  if (!out.includes('</style>')) throw new Error('Missing </style> in Flight HTML');
  return out.replace('</style>', `${pr88Css}\n</style>`);
}

function injectPr88IntoPatchScript(source) {
  let out = removeCssBlock(source, pr87Marker);
  out = removeCssBlock(out, pr88Marker);
  const cssInjectionPoint = 'const css = `\n';
  if (!out.includes(cssInjectionPoint)) throw new Error('PR85 css template not found');
  return out.replace(cssInjectionPoint, `${cssInjectionPoint}${pr88Css}\n`);
}

let html = fs.readFileSync(htmlPath, 'utf8');
html = injectPr88Css(html);
html = removePrepNoZoom(html);
fs.writeFileSync(htmlPath, html);

let pr85 = fs.readFileSync(pr85Path, 'utf8');
pr85 = injectPr88IntoPatchScript(pr85);
pr85 = removePrepNoZoom(pr85);
fs.writeFileSync(pr85Path, pr85);

console.log('Applied TD613 Flight PR88 focus-stability micro patch: removed prepNoZoom, restored textarea dimensions, compacted payload stepper.');
