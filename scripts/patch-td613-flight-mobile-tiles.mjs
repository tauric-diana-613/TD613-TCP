import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';

const marker = '/* PR91_SENTINEL TD613 Flight mobile tile controls restoration */';

const css = `
${marker}
@media (hover: none), (pointer: coarse), (max-width: 820px) {
  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 8px 10px !important;
    align-items: stretch !important;
    align-content: stretch !important;
    justify-content: stretch !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) !important;
    align-items: center !important;
    justify-content: start !important;
    column-gap: 8px !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 34px !important;
    height: auto !important;
    padding: 7px 10px !important;
    border-radius: 999px !important;
    font-size: 12px !important;
    line-height: 1.1 !important;
    letter-spacing: .02em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    grid-column: 1 !important;
    flex: 0 0 auto !important;
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    grid-column: span 2 !important;
    grid-template-columns: auto minmax(0, 1fr) !important;
    border-radius: 18px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 22px !important;
    min-height: 22px !important;
    padding: 3px 8px !important;
    font-size: 11px !important;
    line-height: 1.1 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input:only-child),
  .flight-lane-prompt .card .radio-row > label:has(input:only-child) {
    grid-template-columns: auto minmax(0, 1fr) !important;
  }
}

@media (hover: none), (pointer: coarse) and (max-width: 460px) {
  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    min-height: 32px !important;
    padding: 6px 8px !important;
    font-size: 11px !important;
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
    if (!candidates.length) throw new Error('Could not find end of PR91 CSS block');
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function injectIntoHtml(source) {
  let out = stripPrior(source);
  if (!out.includes('</style>')) throw new Error('Missing </style> in Flight HTML');
  out = out.replace('</style>', `${css}\n</style>`);
  if (!out.includes(marker)) throw new Error('PR91 CSS injection failed in Flight HTML');
  if (!out.includes('grid-template-columns: repeat(2, minmax(0, 1fr)) !important;')) throw new Error('PR91 tile grid missing in Flight HTML');
  return out;
}

function injectIntoPr85(source) {
  let out = stripPrior(source);
  const cssInjectionPoint = 'const css = `\n';
  if (!out.includes(cssInjectionPoint)) throw new Error('PR85 CSS template not found');
  out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  if (!out.includes(marker)) throw new Error('PR91 CSS injection failed in PR85 patch script');
  if (!out.includes('grid-template-columns: repeat(2, minmax(0, 1fr)) !important;')) throw new Error('PR91 tile grid missing in PR85 patch script');
  return out;
}

fs.writeFileSync(htmlPath, injectIntoHtml(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectIntoPr85(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR91 mobile tile controls restoration.');
