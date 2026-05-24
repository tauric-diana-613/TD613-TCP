import fs from 'fs';

const path = 'app/safe-harbor/td613-flight.html';
let html = fs.readFileSync(path, 'utf8');

const sentinel = 'PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration';
html = html.replace(/\n\/\* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration \*\/[\s\S]*?(?=\n<\/style>)/m, '');
html = html.replace(/\n\/\* === TD613 Flight PR80 mobile chrome restoration === \*\/[\s\S]*?(?=\n<\/style>)/m, '');

const css = `
/* PR80_SENTINEL TD613 Flight PR80 mobile chrome restoration */
@media (max-width: 820px) {
  html body .page-wrap header {
    position: relative !important;
    grid-template-areas: "title" "text" "tags" "howto" !important;
    padding: .58rem !important;
    gap: .30rem !important;
    overflow: hidden !important;
  }

  html body .page-wrap header h1 {
    font-size: clamp(1.04rem, 6.9vw, 1.72rem) !important;
    line-height: .98 !important;
    max-width: 100% !important;
  }

  html body .page-wrap header .flight-quick-nav {
    position: absolute !important;
    top: .74rem !important;
    right: .58rem !important;
    left: auto !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: .12rem !important;
    width: auto !important;
    max-width: 52% !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    transform: none !important;
  }

  html body .page-wrap header .flight-quick-nav > a,
  html body .page-wrap header .flight-quick-nav > button {
    flex: 0 0 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    min-height: .68rem !important;
    padding: .075rem .18rem !important;
    border: 1px solid rgba(137,255,240,.32) !important;
    border-radius: 5px !important;
    clip-path: polygon(0 5px, 5px 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px)) !important;
    background: linear-gradient(180deg, rgba(13,55,49,.82), rgba(3,17,16,.95)) !important;
    box-shadow: inset 0 1px 0 rgba(245,255,246,.10), 0 0 10px rgba(49,255,138,.08) !important;
    color: rgba(232,255,242,.90) !important;
    font-size: .22rem !important;
    line-height: 1 !important;
    letter-spacing: .08em !important;
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    text-align: center !important;
  }

  html body .page-wrap header .flight-quick-nav > .flight-nav-signout,
  html body .page-wrap header .flight-quick-nav > button.flight-nav-signout {
    min-height: auto !important;
    padding: .04rem .02rem !important;
    border: 0 !important;
    border-radius: 0 !important;
    clip-path: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: rgba(49,255,138,.82) !important;
    font-size: .21rem !important;
    letter-spacing: .12em !important;
  }

  html body .page-wrap header .subtitle {
    padding-top: 0 !important;
    font-size: .45rem !important;
    line-height: 1.22 !important;
  }

  html body .page-wrap header .pill-row {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: .08rem .30rem !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow: visible !important;
    padding: .02rem 0 .08rem !important;
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
    padding: 0 .30rem 0 0 !important;
    border: 0 !important;
    border-right: 1px solid rgba(137,255,240,.25) !important;
    border-radius: 0 !important;
    clip-path: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: rgba(190,255,223,.78) !important;
    font-size: .27rem !important;
    line-height: 1.05 !important;
    letter-spacing: .12em !important;
    white-space: nowrap !important;
    text-transform: uppercase !important;
  }

  html body .flight-lane .card,
  html body .flight-lane .dev-drawer,
  html body .flight-lane .output-card,
  html body .flight-lane .seal-card,
  html body .flight-lane .copy-bin-card {
    padding: .42rem .42rem .48rem .66rem !important;
    margin-bottom: .34rem !important;
    overflow: hidden !important;
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
    gap: .12rem .14rem !important;
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
    min-height: .72rem !important;
    padding: .08rem .17rem !important;
    border-radius: 999px !important;
    font-size: .27rem !important;
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
    min-height: .72rem !important;
    padding: .07rem .18rem !important;
    font-size: .27rem !important;
    text-align: center !important;
    white-space: nowrap !important;
  }

  html body .flight-lane input[type="checkbox"],
  html body .flight-lane input[type="radio"] {
    flex: 0 0 .32rem !important;
    width: .32rem !important;
    min-width: .32rem !important;
    height: .32rem !important;
    margin: 0 .10rem 0 0 !important;
  }

  html body .flight-lane textarea,
  html body .flight-lane .output,
  html body .flight-lane #taskText {
    font-size: 11px !important;
    line-height: 1.22 !important;
    letter-spacing: .005em !important;
    padding: .30rem .36rem !important;
  }

  html body .flight-lane #taskText,
  html body .flight-lane .output {
    min-height: 3.05rem !important;
    height: clamp(3.1rem, 10dvh, 4.1rem) !important;
    max-height: 13dvh !important;
  }

  html body .flight-lane input[type="text"],
  html body .flight-lane input[type="number"],
  html body .flight-lane select {
    font-size: 11px !important;
    line-height: 1.12 !important;
    padding: .12rem .18rem !important;
  }

  html body .mobile-flight-switcher .mobile-lane-tab {
    min-height: 1.02rem !important;
    padding: .09rem .18rem !important;
    font-size: .32rem !important;
  }

  html body .mobile-flight-switcher .mobile-lane-tab span { font-size: .33rem !important; }
  html body .mobile-flight-switcher .mobile-lane-tab small { font-size: .22rem !important; }

  html body .mobile-prompt-rail,
  html body .mobile-prompt-rail.mobile-prompt-rail-top,
  html body .mobile-prompt-rail.is-docked {
    min-height: .82rem !important;
    padding: .13rem .22rem .13rem .32rem !important;
    gap: .18rem !important;
    justify-content: flex-end !important;
  }

  html body .mobile-prompt-rail span:first-child { font-size: .29rem !important; }
  html body .mobile-prompt-rail-pill { font-size: .22rem !important; padding: .05rem .12rem !important; }
}
`;

html = html.replace('</style>', `${css}\n</style>`);

if (!html.includes(sentinel)) throw new Error('PR80 sentinel missing');
if (!html.includes('font-size: 11px !important')) throw new Error('PR80 compact textarea missing');
if (!html.includes('flex: 0 1 auto !important')) throw new Error('PR80 compact controls missing');
if (!html.includes('white-space: normal !important')) throw new Error('PR80 wrapped pill row missing');
if (html.includes('Loading TD613 Flight') || html.includes('td613-flight-legacy.html') || html.includes('<iframe')) throw new Error('wrapper regression detected');

fs.writeFileSync(path, html);
console.log('patched TD613 Flight PR80 mobile chrome without stretched controls');
