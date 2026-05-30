import fs from 'node:fs';

const htmlPath = 'app/safe-harbor/td613-flight.html';
const pr85Path = 'scripts/patch-td613-flight-mobile-pr85-final.mjs';

const marker = '/* PR92_SENTINEL TD613 Flight dashboard polish: shelves, rail, payload */';

const payloadStepperBlock = `<div class="payload-stepper" id="payloadStepper" aria-label="Payload number controls">
<span class="payload-stepper-label">payload #</span>
<button class="icon-btn payload-stepper-btn" id="payloadDown" type="button" aria-label="Decrease payload number">−</button>
<span class="payload-stepper-value" id="payloadStepperValue">1</span>
<button class="icon-btn payload-stepper-btn" id="payloadUp" type="button" aria-label="Increase payload number">+</button>
</div>`;

const css = `
${marker}
/* PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction */
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  .flight-lane .card h2,
  .flight-lane-prompt .card h2,
  .flight-lane-output .card h2,
  .dev-drawer .card h2 {
    font-size: clamp(18px, 6vw, 24px) !important;
    line-height: .92 !important;
    letter-spacing: .075em !important;
    overflow-wrap: anywhere !important;
  }

  .flight-lane-output .output-card h2,
  .flight-lane-output .seal-card h2,
  .flight-lane-output .copy-bin-card h2 {
    font-size: clamp(18px, 5.8vw, 23px) !important;
  }

  .dev-drawer .card h2 {
    font-size: clamp(17px, 5.4vw, 22px) !important;
  }

  .flight-lane-prompt > .card:nth-of-type(3),
  .flight-lane-prompt > .card:nth-of-type(4) {
    transform: translate(5px, 6px) !important;
    -webkit-transform: translate(5px, 6px) !important;
    max-width: calc(100% - 7px) !important;
    margin-bottom: 9px !important;
  }

  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  .flight-lane-prompt .card .checkbox-row > label,
  .flight-lane-prompt .card .radio-row > label {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 4px !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.4rem, 44vw) !important;
    min-height: 18px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6.5px !important;
    line-height: 1.06 !important;
    letter-spacing: .002em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+1),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+1) {
    max-width: min(8.8rem, 39vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:nth-child(3n+2),
  .flight-lane-prompt .card .radio-row > label:nth-child(3n+2) {
    max-width: min(11.2rem, 47vw) !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    min-height: 8px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(10.8rem, 45vw) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(3.8rem, 18vw, 5.8rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 13px !important;
    min-height: 13px !important;
    padding: 1px 4px !important;
    font-size: 6.5px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 8px !important;
    line-height: 1.15 !important;
    margin: 4px 0 7px !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top {
    position: static !important;
    display: inline-flex !important;
    float: none !important;
    inset: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    z-index: auto !important;
    width: fit-content !important;
    min-width: 0 !important;
    max-width: min(66vw, 15.5rem) !important;
    min-height: 20px !important;
    margin: 7px 0 10px auto !important;
    padding: 3px 7px !important;
    gap: 5px !important;
    justify-content: flex-end !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .66) !important;
    background:
      linear-gradient(180deg, rgba(118, 69, 18, .96), rgba(34, 16, 5, .96)) !important;
    box-shadow: 0 0 16px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .14) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 5px !important;
    line-height: 1 !important;
    letter-spacing: .12em !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    min-width: 13px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .5) !important;
    background: rgba(72, 38, 10, .78) !important;
  }

  .dev-drawer .section-split-row {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 10px !important;
  }

  .dev-drawer .section-split-row > div {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
  }

  .dev-drawer .section-split-row input,
  .dev-drawer .section-split-row .date-field {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  .output-card .status-bar {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "counts auth" ". payload" !important;
    gap: 4px 8px !important;
    align-items: center !important;
  }

  .output-card #statusCounts {
    grid-area: counts !important;
  }

  .output-card .output-auth-toggle {
    grid-area: auth !important;
    justify-self: end !important;
    margin-left: 0 !important;
  }

  .output-card .status-bar .payload-stepper {
    grid-area: payload !important;
    justify-self: end !important;
    align-self: start !important;
    width: auto !important;
    min-width: 76px !important;
    max-width: 96px !important;
    height: 18px !important;
    min-height: 18px !important;
    margin: -1px 0 0 !important;
    padding: 1px 4px !important;
    gap: 3px !important;
    transform: none !important;
    -webkit-transform: none !important;
  }

  .output-card .status-bar .payload-stepper-label {
    font-size: 5px !important;
    line-height: 1 !important;
    max-width: 34px !important;
  }

  .output-card .status-bar .payload-stepper-value {
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .output-card .status-bar .payload-stepper-btn,
  .output-card .status-bar .payload-stepper .icon-btn {
    width: 14px !important;
    min-width: 14px !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 0 !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .output-card .output-toolbar {
    margin-top: 6px !important;
    gap: 6px !important;
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
    if (!candidates.length) throw new Error('Could not find end of PR92 CSS block');
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function applyMarkupRepairs(source) {
  let out = source;
  out = out.replace(
    '<h2>Control &amp; refactor macros</h2>',
    '<h2>Macros</h2>'
  );
  out = out.replace(
    '<label><input id="bodyPhraseEncasing" type="checkbox"/>I was broken encasing a circle.</label>',
    '<label><input id="bodyPhraseEncasing" type="checkbox"/>“I was broken encasing a circle.”</label>'
  );
  out = out.replace(
    '<label><input id="bodyPhraseAcademicSpeculation" type="checkbox"/>When authoring, stay academically rigorous yet grounded in high speculation.</label>',
    '<label><input id="bodyPhraseAcademicSpeculation" type="checkbox"/>“When authoring, stay academically rigorous yet grounded in high speculation.”</label>'
  );
  out = out.replace(
    /<span class="mobile-prompt-rail-pill">[^<]*<\/span>/,
    '<span class="mobile-prompt-rail-pill" aria-hidden="true">→</span>'
  );

  out = out.replace(/\n?<div class="payload-stepper" id="payloadStepper" aria-label="Payload number controls">[\s\S]*?<\/div>/g, '');
  const authTogglePattern = /(<label class="output-auth-toggle" id="statusAuth">authorship wrap: <input[^>]*id="authOutputToggle"[^>]*><\/label>)\s*\n<\/div>\s*\n<div class="output-toolbar">/;
  if (!authTogglePattern.test(out)) throw new Error('Output status bar insertion point not found');
  out = out.replace(authTogglePattern, `$1\n${payloadStepperBlock}\n</div>\n<div class="output-toolbar">`);

  if (!out.includes('<h2>Macros</h2>')) throw new Error('Macros rename missing');
  if (!out.includes('“I was broken encasing a circle.”')) throw new Error('Quoted encasing label missing');
  if (!out.includes('“When authoring, stay academically rigorous yet grounded in high speculation.”')) throw new Error('Quoted academic-speculation label missing');
  if (out.includes('phrases.push("“I was broken encasing a circle.”")')) throw new Error('Output value accidentally gained quotes');
  if (!out.includes('mobile-prompt-rail-pill" aria-hidden="true">→</span>')) throw new Error('Rail arrow-only pill missing');
  if (!out.includes('id="payloadStepper"')) throw new Error('Payload stepper was not reinserted');
  return out;
}

function injectCss(source) {
  let out = stripPrior(source);
  const cssInjectionPoint = 'const css = `\n';
  if (out.includes(cssInjectionPoint)) {
    out = out.replace(cssInjectionPoint, `${cssInjectionPoint}${css}\n`);
  } else {
    if (!out.includes('</style>')) throw new Error('Missing CSS injection point');
    out = out.replace('</style>', `${css}\n</style>`);
  }
  if (!out.includes(marker)) throw new Error('PR92 CSS injection failed');
  if (!out.includes('PR93_SENTINEL TD613 Flight mobile heading/rail/footer correction')) throw new Error('PR93 correction missing');
  if (!out.includes('flex-flow: row wrap !important;')) throw new Error('PR92 shelf layout missing');
  if (!out.includes('grid-template-areas: "counts auth" ". payload" !important;')) throw new Error('PR92 payload stepper grid missing');
  if (!out.includes('width: fit-content !important;')) throw new Error('PR92 mosaic tile width cap missing');
  if (!out.includes('grid-template-columns: minmax(0, 1fr) !important;')) throw new Error('PR93 dev footer anti-cutoff stack missing');
  return out;
}

function injectIntoHtml(source) {
  return injectCss(applyMarkupRepairs(source));
}

function injectIntoPr85(source) {
  return injectCss(source);
}

fs.writeFileSync(htmlPath, injectIntoHtml(fs.readFileSync(htmlPath, 'utf8')));
fs.writeFileSync(pr85Path, injectIntoPr85(fs.readFileSync(pr85Path, 'utf8')));

console.log('Applied TD613 Flight PR93: smaller headings, arrow rail, macro rename, and uncut authorship footer.');
