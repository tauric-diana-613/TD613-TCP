import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = '/* PR96_SENTINEL TD613 Flight mobile H1 + dev field density fix */';

const css = `
${marker}
@media (max-width: 920px) {
  header h1,
  .app-shell h1,
  .flight-lane h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2,
  .flightplan-card > h2 {
    font-size: clamp(10px, 2.65vw, 13px) !important;
    line-height: .94 !important;
    letter-spacing: .035em !important;
    word-spacing: 0 !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .flight-lane .card > h2::first-letter,
  .flight-lane-prompt .card > h2::first-letter,
  .flight-lane-output .card > h2::first-letter,
  .dev-drawer .card > h2::first-letter {
    font-size: inherit !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) {
    width: calc(100% - 22px) !important;
    max-width: calc(100% - 22px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    transform: translateX(0) translateY(6px) !important;
    -webkit-transform: translateX(0) translateY(6px) !important;
  }

  .dev-drawer .flightplan-card input[type="text"],
  .dev-drawer .flightplan-card textarea,
  .dev-drawer .flightplan-card select {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    font-size: 8px !important;
    line-height: 1.12 !important;
  }

  .dev-drawer .flightplan-card input[type="text"],
  .dev-drawer .flightplan-card select {
    height: 25px !important;
    min-height: 25px !important;
    padding: 4px 8px !important;
  }

  .dev-drawer .flightplan-card #routeJurisdiction,
  .dev-drawer .flightplan-card #routeCitationStandard,
  .dev-drawer .flightplan-card #routeUnit {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
  }

  .dev-drawer .flightplan-card #routeMetrics {
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    min-height: 72px !important;
    height: 72px !important;
    padding: 6px 8px !important;
    overflow: auto !important;
    resize: vertical !important;
  }

  .dev-drawer .flightplan-card .small-label {
    display: block !important;
    margin-top: 7px !important;
    margin-bottom: 3px !important;
    font-size: 7px !important;
    line-height: 1.05 !important;
  }

  .dev-drawer .flightplan-card .diagnostic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 7px !important;
  }

  .dev-drawer .flightplan-card .diagnostic-grid .metric-chip {
    min-width: 0 !important;
    width: 100% !important;
  }

  .dev-drawer .card:has(#rotationSeed) .radio-row,
  .dev-drawer .card:has(#rotationSeed) .checkbox-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 5px 7px !important;
    align-items: stretch !important;
  }

  .dev-drawer .card:has(#rotationSeed) .radio-row > label,
  .dev-drawer .card:has(#rotationSeed) .checkbox-row > label {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    justify-content: flex-start !important;
    padding: 3px 7px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    min-height: 20px !important;
  }
}

@media (max-width: 420px) {
  header h1,
  .app-shell h1,
  .flight-lane h1,
  .flight-lane .card > h2,
  .flight-lane-prompt .card > h2,
  .flight-lane-output .card > h2,
  .dev-drawer .card > h2,
  .card > h2,
  .flightplan-card > h2 {
    font-size: clamp(9.5px, 2.45vw, 12px) !important;
    letter-spacing: .03em !important;
  }
}
`;

function stripPrior(source) {
  let out = source;
  while (out.includes(marker)) {
    const start = out.indexOf(marker);
    const nextPr = out.indexOf('\n/* PR', start + marker.length);
    const styleEnd = out.indexOf('\n</style>', start + marker.length);
    const templateEnd = out.indexOf('\n`;', start + marker.length);
    const candidates = [nextPr, styleEnd, templateEnd].filter((value) => value > start);
    if (!candidates.length) throw new Error('Could not find end of PR96 CSS block');
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function injectCss(source) {
  let out = stripPrior(source);
  const cssInjectionPoint = 'const css = `\n';
  if (out.includes(cssInjectionPoint)) {
    out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  } else {
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point for PR96');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR96 CSS injection failed');
  if (!out.includes('font-size: clamp(10px, 2.65vw, 13px) !important;')) throw new Error('PR96 harsh H1/H2 shrink missing');
  if (!out.includes('min-height: 72px !important;')) throw new Error('PR96 Flightplan textarea extension missing');
  if (!out.includes('grid-template-columns: repeat(2, minmax(0, 1fr)) !important;')) throw new Error('PR96 two-row variation grid missing');
  return out;
}

fs.writeFileSync(htmlPath, injectCss(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectCss(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR96: harsh section-title shrink, Flightplan field extension, two-row variation layout.');
