import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = '/* PR95_SENTINEL TD613 Flight final mobile centering/heading/path fix */';
const routePathValue = 'shoreline∴zero-trust.boundary ⇒ flatten_titles→stranger';

const css = `
${marker}
@media (max-width: 920px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2 {
    font-size: clamp(12px, 3.6vw, 15.5px) !important;
    line-height: .95 !important;
    letter-spacing: .045em !important;
    word-spacing: .015em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card > h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2,
  .dev-drawer .card > h2,
  .dev-drawer .card > h2:has(+ .section-note) {
    font-size: clamp(12px, 3.5vw, 15px) !important;
    line-height: .95 !important;
    letter-spacing: .04em !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) {
    width: calc(100% - 18px) !important;
    max-width: calc(100% - 18px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    transform: translate(0, 6px) !important;
    -webkit-transform: translate(0, 6px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(4) {
    width: calc(100% - 18px) !important;
    max-width: calc(100% - 18px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    transform: translate(0, 7px) !important;
    -webkit-transform: translate(0, 7px) !important;
  }

  #authRoutePath {
    color: rgba(244, 255, 248, .98) !important;
    -webkit-text-fill-color: rgba(244, 255, 248, .98) !important;
    opacity: 1 !important;
    font-weight: 650 !important;
    text-shadow: 0 0 7px rgba(139, 255, 213, .12) !important;
  }

  #authRoutePath::placeholder {
    color: rgba(157, 178, 172, .38) !important;
    -webkit-text-fill-color: rgba(157, 178, 172, .38) !important;
    opacity: .38 !important;
  }
}

@media (max-width: 420px) {
  header h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2 {
    font-size: clamp(11px, 3.3vw, 14px) !important;
    line-height: .94 !important;
    letter-spacing: .04em !important;
  }
}
`;

const runtime = `<script id="td613-pr95-route-path-default">
(function () {
  const routePathValue = ${JSON.stringify(routePathValue)};
  function ensureRoutePath() {
    const input = document.getElementById('authRoutePath');
    if (!input) return;
    if (!input.value || input.value.trim() === '' || input.value.startsWith('e.g.,')) {
      input.value = routePathValue;
    }
    input.style.color = 'rgba(244, 255, 248, .98)';
    input.style.webkitTextFillColor = 'rgba(244, 255, 248, .98)';
    input.style.opacity = '1';
    input.dataset.td613Pr95RoutePath = 'visible-default';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureRoutePath);
  } else {
    ensureRoutePath();
  }
  window.setTimeout(ensureRoutePath, 80);
  window.setTimeout(ensureRoutePath, 400);
})();
</script>`;

function stripPriorCss(source) {
  let out = source;
  while (out.includes(marker)) {
    const start = out.indexOf(marker);
    const nextPr = out.indexOf('\n/* PR', start + marker.length);
    const styleEnd = out.indexOf('\n</style>', start + marker.length);
    const templateEnd = out.indexOf('\n`;', start + marker.length);
    const candidates = [nextPr, styleEnd, templateEnd].filter((value) => value > start);
    if (!candidates.length) throw new Error('Could not find end of PR95 CSS block');
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function injectCss(source) {
  let out = stripPriorCss(source);
  const cssInjectionPoint = 'const css = `\n';
  if (out.includes(cssInjectionPoint)) {
    out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  } else {
    if (!out.includes('</style>')) throw new Error('Missing </style> CSS injection point');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR95 CSS injection failed');
  return out;
}

function applyMarkup(source) {
  let out = source;
  out = out.replace(
    /<input\b([^>]*\bid="authRoutePath"[^>]*)>/,
    `<input id="authRoutePath" placeholder="e.g., ${routePathValue}" type="text" value="${routePathValue}"/>`
  );
  out = out.replace(/\n?<script id="td613-pr95-route-path-default">[\s\S]*?<\/script>/g, '');
  if (!out.includes('</body>')) throw new Error('Missing </body> for PR95 runtime injection');
  out = out.replace('</body>', `${runtime}\n</body>`);
  if (!out.includes(`value="${routePathValue}"`)) throw new Error('PR95 route path value missing');
  if (!out.includes('td613-pr95-route-path-default')) throw new Error('PR95 route path runtime missing');
  return out;
}

function injectIntoHtml(source) {
  return applyMarkup(injectCss(source));
}

function injectIntoPr85(source) {
  return injectCss(source);
}

fs.writeFileSync(htmlPath, injectIntoHtml(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectIntoPr85(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR95: harsh heading shrink, Header card centering, visible route path default.');
