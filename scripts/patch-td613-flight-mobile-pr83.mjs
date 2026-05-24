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
  html body .flight-lane button.ghost {
    display: inline-flex !important;
    flex: 0 1 auto !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 18px !important;
    max-height: none !important;
    padding: 3px 7px !important;
    border-radius: 999px !important;
    font-size: 7px !important;
    line-height: 1.06 !important;
    letter-spacing: .025em !important;
    white-space: normal !important;
    overflow: hidden !important;
    overflow-wrap: anywhere !important;
    text-align: left !important;
  }

  html body .flight-lane-prompt .checkbox-row > label,
  html body .flight-lane-prompt .radio-row > label {
    max-width: calc(50% - 5px) !important;
  }

  html body .flight-lane-prompt .checkbox-row > label:has(input[type="text"]),
  html body .flight-lane-prompt .radio-row > label:has(input[type="text"]),
  html body .flight-lane-output .checkbox-row > label:has(input[type="text"]),
  html body .flight-lane-output .radio-row > label:has(input[type="text"]) {
    max-width: 100% !important;
    flex: 0 1 auto !important;
  }

  html body .flight-lane textarea,
  html body .flight-lane .output,
  html body .flight-lane #taskText,
  html body .flight-lane .code-output,
  html body .flight-lane .json-output {
    font-size: 16px !important;
    line-height: 1.2 !important;
    width: 177.7778% !important;
    min-width: 177.7778% !important;
    max-width: 177.7778% !important;
    zoom: .5625 !important;
    transform: none !important;
    transform-origin: top left !important;
    -webkit-overflow-scrolling: touch !important;
    overflow-y: auto !important;
    overscroll-behavior: contain !important;
    touch-action: pan-y !important;
    resize: vertical !important;
  }

  html body .flight-lane #taskText,
  html body .flight-lane .output,
  html body .flight-lane textarea {
    min-height: 132px !important;
    height: 132px !important;
    max-height: 180px !important;
    margin-right: 0 !important;
    margin-bottom: 0 !important;
    padding: 14px 16px !important;
  }

  html body .flight-lane input[type="text"],
  html body .flight-lane input[type="number"],
  html body .flight-lane input[type="date"],
  html body .flight-lane select {
    font-size: 16px !important;
    line-height: 1.12 !important;
    zoom: .5625 !important;
    transform: none !important;
    transform-origin: top left !important;
    min-height: 28px !important;
    padding: 4px 8px !important;
  }

  html body .flight-lane select,
  html body .flight-lane .dev-drawer input[type="text"],
  html body .flight-lane .dev-drawer input[type="number"],
  html body .flight-lane .dev-drawer input[type="date"] {
    width: 177.7778% !important;
    min-width: 177.7778% !important;
    max-width: 177.7778% !important;
  }

  html body .flight-lane label input[type="text"],
  html body .flight-lane label input[type="number"],
  html body .flight-lane label input[type="date"] {
    font-size: 9px !important;
    zoom: 1 !important;
    width: min(18rem, 62vw) !important;
    min-width: 0 !important;
    max-width: min(18rem, 62vw) !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 3px 6px !important;
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
if (!html.includes('zoom: .5625 !important')) throw new Error('PR83 mobile visual scale missing');
if (!html.includes('font-size: 16px !important')) throw new Error('PR83 anti-zoom base font missing');
if (!html.includes('font-size: 9px !important')) throw new Error('PR83 compact label input override missing');
if (!html.includes('max-width: calc(50% - 5px) !important')) throw new Error('PR83 prompt chip wrap clamp missing');
if (!html.includes('font-size: 5px !important')) throw new Error('PR83 danger note shrink missing');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR83 compact chips and mobile field scale repair');
