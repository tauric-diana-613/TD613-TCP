import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const marker = 'PR83_SENTINEL TD613 Flight compact chips and mobile field scale repair';
html = html.replace(/\n\/\* PR83_SENTINEL TD613 Flight compact chips and mobile field scale repair \*\/[\s\S]*?(?=\n<\/style>)/m, '');

const css = `
/* PR83_SENTINEL TD613 Flight compact chips and mobile field scale repair */
@media (max-width: 820px) {
  html body .page-wrap header,
  html body .mobile-flight-switcher {
    position: relative !important;
    top: auto !important;
    inset: auto !important;
    z-index: auto !important;
  }

  html body .flight-lane .card,
  html body .flight-lane .seal-card,
  html body .flight-lane .output-card,
  html body .flight-lane .copy-bin-card,
  html body .flight-lane .dev-drawer {
    overflow: hidden !important;
  }

  html body .flight-lane .checkbox-row,
  html body .flight-lane .radio-row,
  html body .flight-lane .copy-grid,
  html body .flight-lane .seal-lozenge-row,
  html body .flight-lane .row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: flex-start !important;
    align-content: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: visible !important;
    grid-template-columns: none !important;
  }

  html body .flight-lane .checkbox-row > label,
  html body .flight-lane .radio-row > label,
  html body .flight-lane .copy-chip,
  html body .flight-lane .row > .btn,
  html body .flight-lane .row > button,
  html body .flight-lane button.btn,
  html body .flight-lane button.primary,
  html body .flight-lane button.secondary,
  html body .flight-lane button.ghost,
  html body .flight-lane .mobile-output-return,
  html body .flight-lane .mobile-prompt-rail button {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: calc(100% - 8px) !important;
    min-height: 15px !important;
    max-height: none !important;
    padding: 2px 6px !important;
    border-radius: 999px !important;
    font-size: 6px !important;
    line-height: 1.05 !important;
    letter-spacing: .015em !important;
    white-space: normal !important;
    overflow: visible !important;
    overflow-wrap: anywhere !important;
    text-overflow: clip !important;
    text-align: left !important;
  }

  html body .flight-lane .checkbox-row > label:has(input[type="text"]),
  html body .flight-lane .radio-row > label:has(input[type="text"]),
  html body .flight-lane .checkbox-row > label:has(input[type="number"]),
  html body .flight-lane .radio-row > label:has(input[type="number"]),
  html body .flight-lane .checkbox-row > label:has(input[type="date"]),
  html body .flight-lane .radio-row > label:has(input[type="date"]) {
    flex: 0 1 auto !important;
    width: auto !important;
    max-width: calc(100% - 8px) !important;
    min-height: 16px !important;
    max-height: none !important;
    padding: 2px 6px !important;
    gap: 4px !important;
  }

  html body .flight-lane .checkbox-row > label input[type="checkbox"],
  html body .flight-lane .radio-row > label input[type="radio"] {
    flex: 0 0 8px !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    margin: 0 4px 0 0 !important;
  }

  html body .flight-lane label input[type="text"],
  html body .flight-lane label input[type="number"],
  html body .flight-lane label input[type="date"] {
    flex: 0 1 auto !important;
    width: clamp(4.4rem, 18vw, 7rem) !important;
    min-width: 0 !important;
    max-width: clamp(4.4rem, 18vw, 7rem) !important;
    min-height: 14px !important;
    height: 14px !important;
    padding: 1px 5px !important;
    font-size: 7px !important;
    line-height: 1 !important;
    zoom: 1 !important;
    transform: none !important;
  }

  html body .flight-lane .seal-card label input[type="text"] {
    width: clamp(4rem, 16vw, 6.2rem) !important;
    max-width: clamp(4rem, 16vw, 6.2rem) !important;
  }

  html body .flight-lane textarea,
  html body .flight-lane .output,
  html body .flight-lane #taskText,
  html body .flight-lane .code-output,
  html body .flight-lane .json-output {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 74px !important;
    height: 86px !important;
    max-height: 150px !important;
    margin: 0 !important;
    padding: 8px 9px !important;
    font-size: 9px !important;
    line-height: 1.18 !important;
    letter-spacing: .004em !important;
    zoom: 1 !important;
    transform: none !important;
    -webkit-overflow-scrolling: touch !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    overscroll-behavior: contain !important;
    touch-action: pan-y !important;
    resize: vertical !important;
  }

  html body .flight-lane .dev-drawer textarea,
  html body .flight-lane .dev-drawer .code-output,
  html body .flight-lane .dev-drawer .json-output {
    min-height: 54px !important;
    height: 62px !important;
    max-height: 112px !important;
    font-size: 8px !important;
    line-height: 1.12 !important;
  }

  html body .flight-lane input[type="text"],
  html body .flight-lane input[type="number"],
  html body .flight-lane input[type="date"],
  html body .flight-lane select {
    box-sizing: border-box !important;
    width: clamp(8rem, 42vw, 18rem) !important;
    min-width: 0 !important;
    max-width: clamp(8rem, 42vw, 18rem) !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 3px 6px !important;
    font-size: 9px !important;
    line-height: 1.05 !important;
    zoom: 1 !important;
    transform: none !important;
  }

  html body .flight-lane select {
    height: 22px !important;
    min-height: 22px !important;
  }

  html body .flight-lane .dev-drawer input[type="text"],
  html body .flight-lane .dev-drawer input[type="number"],
  html body .flight-lane .dev-drawer input[type="date"],
  html body .flight-lane .dev-drawer select {
    width: min(100%, 18rem) !important;
    max-width: min(100%, 18rem) !important;
    font-size: 8px !important;
  }

  html body .flight-lane .danger-note {
    font-size: 5px !important;
    line-height: 1.15 !important;
    letter-spacing: .03em !important;
    padding: 5px 7px !important;
    min-height: 0 !important;
    border-radius: 8px !important;
  }
}
`;

html = html.replace('</style>', `${css}\n</style>`);

if (!html.includes(marker)) throw new Error('PR83 CSS missing');
if (!html.includes('white-space: normal !important')) throw new Error('PR83 readable chip wrap missing');
if (!html.includes('text-overflow: clip !important')) throw new Error('PR83 no chip ellipsis missing');
if (!html.includes('width: clamp(8rem, 42vw, 18rem)')) throw new Error('PR83 bare field width clamp missing');
if (!html.includes('font-size: 9px !important')) throw new Error('PR83 compact field font missing');
if (!html.includes('height: 86px !important')) throw new Error('PR83 compact textarea height missing');
if (!html.includes('font-size: 5px !important')) throw new Error('PR83 danger note shrink missing');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR83 readable natural chips and compact fields');
