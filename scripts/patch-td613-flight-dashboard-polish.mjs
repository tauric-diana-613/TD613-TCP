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
@media (hover: none) and (max-width: 820px), (pointer: coarse) and (max-width: 820px) {
  .flight-lane-prompt .card .checkbox-row,
  .flight-lane-prompt .card .radio-row {
    display: flex !important;
    flex-flow: row wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 6px !important;
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
    gap: 5px !important;
    width: auto !important;
    min-width: min(9.2rem, calc(50% - 4px)) !important;
    max-width: min(18.4rem, 100%) !important;
    min-height: 19px !important;
    height: auto !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    letter-spacing: .004em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  .flight-lane-prompt .card .checkbox-row > label > input[type="checkbox"],
  .flight-lane-prompt .card .radio-row > label > input[type="radio"] {
    flex: 0 0 auto !important;
    width: 9px !important;
    min-width: 9px !important;
    height: 9px !important;
    min-height: 9px !important;
    margin: 0 !important;
  }

  .flight-lane-prompt .card .checkbox-row > label:has(input[type="text"]),
  .flight-lane-prompt .card .radio-row > label:has(input[type="text"]) {
    flex: 0 1 auto !important;
    width: auto !important;
    min-width: min(11rem, calc(50% - 4px)) !important;
    max-width: min(16.4rem, 100%) !important;
    border-radius: 14px !important;
  }

  .flight-lane-prompt .card .checkbox-row > label input[type="text"],
  .flight-lane-prompt .card .radio-row > label input[type="text"] {
    width: clamp(4.6rem, 22vw, 7.2rem) !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 14px !important;
    min-height: 14px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
  }

  .flight-lane-output .seal-card .section-note,
  .flight-lane-output .copy-bin-card .section-note {
    font-size: 9px !important;
    line-height: 1.18 !important;
    margin: 5px 0 8px !important;
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
    width: auto !important;
    max-width: min(92vw, 26rem) !important;
    min-height: 28px !important;
    margin: 10px auto 12px !important;
    padding: 6px 10px !important;
    gap: 8px !important;
    justify-content: center !important;
    align-items: center !important;
    border-color: rgba(255, 210, 98, .58) !important;
    background:
      linear-gradient(180deg, rgba(101, 61, 16, .96), rgba(30, 15, 5, .96)) !important;
    box-shadow: 0 0 22px rgba(255, 177, 59, .18), inset 0 1px 0 rgba(255, 239, 196, .15) !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top span:first-child {
    font-size: 7px !important;
    line-height: 1 !important;
    color: rgba(255, 239, 196, .92) !important;
    white-space: nowrap !important;
  }

  .mobile-prompt-rail.mobile-prompt-rail-top .mobile-prompt-rail-pill {
    padding: 3px 8px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    color: rgba(255, 229, 133, .96) !important;
    border-color: rgba(255, 210, 98, .45) !important;
    background: rgba(62, 33, 9, .78) !important;
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
    '<label><input id="bodyPhraseEncasing" type="checkbox"/>I was broken encasing a circle.</label>',
    '<label><input id="bodyPhraseEncasing" type="checkbox"/>“I was broken encasing a circle.”</label>'
  );
  out = out.replace(
    '<label><input id="bodyPhraseAcademicSpeculation" type="checkbox"/>When authoring, stay academically rigorous yet grounded in high speculation.</label>',
    '<label><input id="bodyPhraseAcademicSpeculation" type="checkbox"/>“When authoring, stay academically rigorous yet grounded in high speculation.”</label>'
  );

  out = out.replace(/\n?<div class="payload-stepper" id="payloadStepper" aria-label="Payload number controls">[\s\S]*?<\/div>/g, '');
  const authTogglePattern = /(<label class="output-auth-toggle" id="statusAuth">authorship wrap: <input[^>]*id="authOutputToggle"[^>]*><\/label>)\s*\n<\/div>\s*\n<div class="output-toolbar">/;
  if (!authTogglePattern.test(out)) throw new Error('Output status bar insertion point not found');
  out = out.replace(authTogglePattern, `$1\n${payloadStepperBlock}\n</div>\n<div class="output-toolbar">`);

  if (!out.includes('“I was broken encasing a circle.”')) throw new Error('Quoted encasing label missing');
  if (!out.includes('“When authoring, stay academically rigorous yet grounded in high speculation.”')) throw new Error('Quoted academic-speculation label missing');
  if (out.includes('phrases.push("“I was broken encasing a circle.”")')) throw new Error('Output value accidentally gained quotes');
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
  if (!out.includes('flex-flow: row wrap !important;')) throw new Error('PR92 shelf layout missing');
  if (!out.includes('grid-template-areas: "counts auth" ". payload" !important;')) throw new Error('PR92 payload stepper grid missing');
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

console.log('Applied TD613 Flight PR92 dashboard polish: left shelves, quote labels, rail, and payload stepper.');
