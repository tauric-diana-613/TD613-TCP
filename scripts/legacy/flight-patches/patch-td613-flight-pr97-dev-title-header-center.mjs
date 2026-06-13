import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';
const marker = '/* PR97_SENTINEL TD613 Flight dev title shrink + Header control centering */';

const css = `
${marker}
@media (max-width: 920px) {
  .dev-drawer .card:has(#rotationSeed) > h2,
  .dev-drawer .card:has(#authFragment) > h2 {
    font-size: clamp(9.5px, 2.35vw, 12px) !important;
    line-height: .94 !important;
    letter-spacing: .025em !important;
    word-spacing: 0 !important;
    max-width: 100% !important;
    margin-bottom: 7px !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) .checkbox-row,
  .flight-lane-prompt > .card:nth-of-type(3) .radio-row {
    justify-content: center !important;
    align-content: center !important;
    width: calc(100% - 10px) !important;
    max-width: calc(100% - 10px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) .checkbox-row > label,
  .flight-lane-prompt > .card:nth-of-type(3) .radio-row > label {
    max-width: min(10.2rem, 43vw) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3) .danger-note {
    width: calc(100% - 12px) !important;
    max-width: calc(100% - 12px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

@media (max-width: 420px) {
  .dev-drawer .card:has(#rotationSeed) > h2,
  .dev-drawer .card:has(#authFragment) > h2 {
    font-size: clamp(9px, 2.15vw, 11px) !important;
    letter-spacing: .02em !important;
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
    if (!candidates.length) throw new Error('Could not find end of PR97 CSS block');
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
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point for PR97');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR97 CSS injection failed');
  if (!out.includes('.dev-drawer .card:has(#rotationSeed) > h2')) throw new Error('PR97 dev title selector missing');
  if (!out.includes('.flight-lane-prompt > .card:nth-of-type(3) .checkbox-row')) throw new Error('PR97 Header control centering selector missing');
  return out;
}

fs.writeFileSync(htmlPath, injectCss(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectCss(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR97: shrunk escaping dev titles and centered Header section controls.');
