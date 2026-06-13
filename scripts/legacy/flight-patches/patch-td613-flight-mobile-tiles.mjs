import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';

const marker = '/* PR91_SENTINEL TD613 Flight mobile tile controls restoration */';

const css = `
${marker}
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  .flight-lane-prompt .card .section-note {
    font-size: 8px !important;
    line-height: 1.16 !important;
    margin: 4px 0 7px !important;
    max-width: 100% !important;
  }

  .flight-lane-prompt .card h3 {
    margin-top: 10px !important;
    margin-bottom: 5px !important;
    font-size: 9px !important;
    line-height: 1.05 !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 4px 6px !important;
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
    column-gap: 5px !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 21px !important;
    height: auto !important;
    padding: 3px 6px !important;
    border-radius: 999px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    letter-spacing: .005em !important;
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
    width: 9px !important;
    min-width: 9px !important;
    height: 9px !important;
    min-height: 9px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    grid-column: auto !important;
    grid-template-columns: auto minmax(0, 1fr) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 15px !important;
    min-height: 15px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input:only-child),
  .flight-lane-prompt .card .radio-row > label:has(input:only-child) {
    grid-template-columns: auto minmax(0, 1fr) !important;
  }

  .flight-lane-prompt .card .mobile-prompt-rail,
  .mobile-prompt-rail.mobile-prompt-rail-top {
    margin: 6px auto 12px !important;
    padding: 5px 9px !important;
    min-height: 26px !important;
    gap: 8px !important;
    border-radius: 999px !important;
    width: auto !important;
    max-width: min(92vw, 25rem) !important;
  }

  .mobile-prompt-rail span:first-child {
    font-size: 7px !important;
    line-height: 1 !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail-pill {
    padding: 3px 7px !important;
    font-size: 6px !important;
    line-height: 1 !important;
  }
}

@media (hover: none) and (max-width: 460px), (pointer: coarse) and (max-width: 460px) {
  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 3px 5px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    min-height: 19px !important;
    padding: 2px 5px !important;
    font-size: 6px !important;
  }

  .flight-lane-prompt .card .section-note {
    font-size: 7px !important;
    line-height: 1.14 !important;
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
  if (!out.includes('font-size: 7px !important;')) throw new Error('PR91 density-pass tile font missing in Flight HTML');
  if (!out.includes('grid-column: auto !important;')) throw new Error('PR91 custom input width repair missing in Flight HTML');
  return out;
}

function injectIntoPr85(source) {
  let out = stripPrior(source);
  const cssInjectionPoint = 'const css = `\n';
  if (!out.includes(cssInjectionPoint)) throw new Error('PR85 CSS template not found');
  out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  if (!out.includes(marker)) throw new Error('PR91 CSS injection failed in PR85 patch script');
  if (!out.includes('font-size: 7px !important;')) throw new Error('PR91 density-pass tile font missing in PR85 patch script');
  if (!out.includes('grid-column: auto !important;')) throw new Error('PR91 custom input width repair missing in PR85 patch script');
  return out;
}

fs.writeFileSync(htmlPath, injectIntoHtml(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectIntoPr85(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR91 density pass: compact notes, tiles, custom inputs, and mobile rail.');
