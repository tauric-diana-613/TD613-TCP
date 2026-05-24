import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const sentinel = 'PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration';
html = html.replace(/\n\/\* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration \*\/[\s\S]*?(?=\n<\/style>)/m, '');
html = html.replace(/\n\/\* === TD613 Flight PR80 mobile chrome restoration === \*\/[\s\S]*?(?=\n<\/style>)/m, '');

const css = `
/* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration */
@media (max-width: 820px) {
  html,
  body {
    -webkit-text-size-adjust: none !important;
    text-size-adjust: none !important;
  }

  html body .page-wrap header {
    position: relative !important;
    display: grid !important;
    grid-template-areas: "title" "nav" "text" "tags" "howto" !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 8px !important;
    padding: 14px 14px 12px !important;
    overflow: hidden !important;
  }

  html body .page-wrap header h1 {
    grid-area: title !important;
    font-size: clamp(26px, 7.2vw, 38px) !important;
    line-height: .98 !important;
    max-width: 100% !important;
    margin: 0 !important;
  }

  html body .page-wrap header h1::after {
    font-size: 8px !important;
    line-height: 1.25 !important;
    letter-spacing: .18em !important;
    margin-top: 6px !important;
  }

  html body .page-wrap header .flight-quick-nav {
    grid-area: nav !important;
    position: static !important;
    inset: auto !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 5px !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: -2px 0 0 auto !important;
    overflow: visible !important;
    transform: none !important;
    z-index: 3 !important;
  }

  html body .page-wrap header .flight-quick-nav > a,
  html body .page-wrap header .flight-quick-nav > button {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    min-height: 18px !important;
    height: 18px !important;
    padding: 3px 8px !important;
    border: 1px solid rgba(137,255,240,.32) !important;
    border-radius: 4px !important;
    clip-path: polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px)) !important;
    background: linear-gradient(180deg, rgba(13,55,49,.82), rgba(3,17,16,.95)) !important;
    box-shadow: inset 0 1px 0 rgba(245,255,246,.10), 0 0 10px rgba(49,255,138,.08) !important;
    color: rgba(232,255,242,.90) !important;
    font-size: 7px !important;
    line-height: 1 !important;
    letter-spacing: .10em !important;
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    text-align: center !important;
  }

  html body .page-wrap header .flight-quick-nav > .flight-nav-signout,
  html body .page-wrap header .flight-quick-nav > button.flight-nav-signout {
    min-height: 0 !important;
    height: auto !important;
    padding: 2px !important;
    border: 0 !important;
    border-radius: 0 !important;
    clip-path: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: rgba(49,255,138,.82) !important;
    font-size: 6px !important;
    letter-spacing: .13em !important;
  }

  html body .page-wrap header .subtitle {
    grid-area: text !important;
    padding-top: 0 !important;
    padding-left: 12px !important;
    font-size: 10px !important;
    line-height: 1.25 !important;
    max-width: 100% !important;
  }

  html body .page-wrap header .pill-row {
    grid-area: tags !important;
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 3px 8px !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow: visible !important;
    padding: 0 0 3px !important;
    white-space: normal !important;
  }

  html body .page-wrap header .pill-row > *,
  html body .page-wrap header .pill-row .pill {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 8px 0 0 !important;
    border: 0 !important;
    border-right: 1px solid rgba(137,255,240,.25) !important;
    border-radius: 0 !important;
    clip-path: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: rgba(190,255,223,.78) !important;
    font-size: 6px !important;
    line-height: 1.1 !important;
    letter-spacing: .12em !important;
    white-space: nowrap !important;
    text-transform: uppercase !important;
  }

  html body .page-wrap header details.howto { grid-area: howto !important; }

  html body .mobile-flight-switcher .mobile-lane-tab {
    min-height: 24px !important;
    padding: 3px 8px !important;
    font-size: 8px !important;
  }

  html body .mobile-flight-switcher .mobile-lane-tab span { font-size: 8px !important; }
  html body .mobile-flight-switcher .mobile-lane-tab small { font-size: 5px !important; }

  html body .flight-lane .card,
  html body .flight-lane .dev-drawer,
  html body .flight-lane .output-card,
  html body .flight-lane .seal-card,
  html body .flight-lane .copy-bin-card {
    padding: 10px 10px 11px 16px !important;
    margin-bottom: 9px !important;
    overflow: hidden !important;
  }

  html body .flight-lane .card h2,
  html body .flight-lane .output-card h2,
  html body .flight-lane .seal-card h2 {
    font-size: 17px !important;
    line-height: 1.05 !important;
    letter-spacing: .12em !important;
  }

  html body .flight-lane p,
  html body .flight-lane .muted,
  html body .flight-lane .help,
  html body .flight-lane .note,
  html body .flight-lane .warning {
    font-size: 11px !important;
    line-height: 1.24 !important;
  }

  html body .flight-lane .checkbox-row,
  html body .flight-lane .radio-row,
  html body .flight-lane .copy-grid,
  html body .flight-lane .row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: 4px 5px !important;
    overflow: hidden !important;
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
    flex: 0 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 19px !important;
    padding: 3px 7px !important;
    border-radius: 999px !important;
    font-size: 7px !important;
    line-height: 1.05 !important;
    letter-spacing: .035em !important;
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    text-align: left !important;
    justify-content: flex-start !important;
  }

  html body .flight-lane #btnGenerate,
  html body .flight-lane #btnRandomizer,
  html body .flight-lane #btnResetControls,
  html body .flight-lane #btnClearInput,
  html body .flight-lane #btnClear,
  html body .flight-lane .output-toolbar button,
  html body .flight-lane .payload-stepper button {
    flex: 0 0 auto !important;
    width: auto !important;
    max-width: none !important;
    min-height: 20px !important;
    padding: 3px 7px !important;
    font-size: 7px !important;
    text-align: center !important;
    white-space: nowrap !important;
  }

  html body .flight-lane input[type="checkbox"],
  html body .flight-lane input[type="radio"] {
    flex: 0 0 8px !important;
    width: 8px !important;
    min-width: 8px !important;
    height: 8px !important;
    margin: 0 4px 0 0 !important;
  }

  html body .flight-lane textarea,
  html body .flight-lane .output,
  html body .flight-lane #taskText {
    font-size: 9px !important;
    line-height: 1.18 !important;
    letter-spacing: .005em !important;
    padding: 8px 9px !important;
  }

  html body .flight-lane #taskText,
  html body .flight-lane .output {
    min-height: 74px !important;
    height: clamp(74px, 9dvh, 102px) !important;
    max-height: 120px !important;
  }

  html body .flight-lane input[type="text"],
  html body .flight-lane input[type="number"],
  html body .flight-lane select {
    font-size: 9px !important;
    line-height: 1.12 !important;
    padding: 3px 6px !important;
  }

  html body .mobile-prompt-rail,
  html body .mobile-prompt-rail.mobile-prompt-rail-top,
  html body .mobile-prompt-rail.is-docked {
    min-height: 22px !important;
    padding: 4px 8px 4px 10px !important;
    gap: 6px !important;
    justify-content: flex-end !important;
  }

  html body .mobile-prompt-rail span:first-child { font-size: 7px !important; }
  html body .mobile-prompt-rail-pill { font-size: 6px !important; padding: 2px 5px !important; }
}
`;

html = html.replace('</style>', `${css}\n</style>`);

if (!html.includes(sentinel)) throw new Error('PR80 sentinel missing');
if (!html.includes('grid-template-areas: "title" "nav" "text" "tags" "howto"')) throw new Error('PR80 static nav grid missing');
if (!html.includes('font-size: 9px !important')) throw new Error('PR80 compact textarea missing');
if (!html.includes('font-size: 7px !important')) throw new Error('PR80 compact controls missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR80 static mobile chrome');
